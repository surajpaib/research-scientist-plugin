#!/usr/bin/env python3
"""
Literature Watch Script

Monitors PubMed and arXiv for new papers matching configured queries.
Generates vault notes with findings.

Usage:
    python literature_watch.py --check-all
    python literature_watch.py --watch "Body Composition TAVR"
    python literature_watch.py --list
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
import xml.etree.ElementTree as ET


def load_env():
    """Load environment variables from .env file."""
    env_file = Path(__file__).parent.parent / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    if value and key not in os.environ:
                        os.environ[key] = value


def find_project_root() -> Optional[Path]:
    """Find the project root by looking for vault directory."""
    cwd = Path.cwd()

    # Check current directory and parents
    for path in [cwd] + list(cwd.parents):
        if (path / "vault").is_dir():
            return path
        if path == Path.home():
            break

    return None


def parse_watches(watches_file: Path) -> list[dict]:
    """Parse watch configurations from markdown file."""
    if not watches_file.exists():
        return []

    content = watches_file.read_text()
    watches = []

    # Parse watch blocks
    watch_pattern = r"### Watch: (.+?)\n((?:- \*\*.+?\n)+)"
    for match in re.finditer(watch_pattern, content):
        name = match.group(1).strip()
        block = match.group(2)

        watch = {"name": name}

        # Parse fields
        for line in block.strip().split("\n"):
            if "**Query**" in line:
                watch["query"] = re.search(r"`(.+?)`", line)
                if watch["query"]:
                    watch["query"] = watch["query"].group(1)
            elif "**Sources**" in line:
                watch["sources"] = line.split(":")[-1].strip()
            elif "**Frequency**" in line:
                watch["frequency"] = line.split(":")[-1].strip()
            elif "**Last checked**" in line:
                date_str = line.split(":")[-1].strip()
                try:
                    watch["last_checked"] = datetime.strptime(date_str, "%Y-%m-%d")
                except ValueError:
                    watch["last_checked"] = None

        if watch.get("query"):
            watches.append(watch)

    return watches


def search_pubmed(query: str, since_date: Optional[datetime] = None, max_results: int = 20) -> list[dict]:
    """Search PubMed for papers matching query."""
    load_env()

    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    api_key = os.environ.get("NCBI_API_KEY", "")

    # Add date filter if provided
    if since_date:
        date_str = since_date.strftime("%Y/%m/%d")
        query = f"{query} AND {date_str}:3000[PDAT]"

    # Search for IDs
    search_params = {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "retmode": "json",
        "sort": "date",
    }
    if api_key:
        search_params["api_key"] = api_key

    search_url = f"{base_url}esearch.fcgi?{urllib.parse.urlencode(search_params)}"

    try:
        with urllib.request.urlopen(search_url, timeout=30) as response:
            data = json.loads(response.read().decode())
            id_list = data.get("esearchresult", {}).get("idlist", [])
    except Exception as e:
        print(f"PubMed search error: {e}", file=sys.stderr)
        return []

    if not id_list:
        return []

    # Fetch paper details
    fetch_params = {
        "db": "pubmed",
        "id": ",".join(id_list),
        "retmode": "xml",
    }
    if api_key:
        fetch_params["api_key"] = api_key

    fetch_url = f"{base_url}efetch.fcgi?{urllib.parse.urlencode(fetch_params)}"

    papers = []
    try:
        with urllib.request.urlopen(fetch_url, timeout=30) as response:
            root = ET.fromstring(response.read().decode())

            for article in root.findall(".//PubmedArticle"):
                paper = {}

                # Title
                title_elem = article.find(".//ArticleTitle")
                paper["title"] = title_elem.text if title_elem is not None else "Unknown"

                # Authors
                authors = []
                for author in article.findall(".//Author"):
                    last = author.find("LastName")
                    first = author.find("ForeName")
                    if last is not None:
                        name = last.text
                        if first is not None:
                            name += f", {first.text}"
                        authors.append(name)
                paper["authors"] = authors[:3]  # First 3 authors

                # Journal
                journal = article.find(".//Journal/Title")
                paper["journal"] = journal.text if journal is not None else "Unknown"

                # Year
                year = article.find(".//PubDate/Year")
                paper["year"] = year.text if year is not None else ""

                # DOI
                doi = article.find(".//ArticleId[@IdType='doi']")
                paper["doi"] = doi.text if doi is not None else None

                # PMID
                pmid = article.find(".//PMID")
                paper["pmid"] = pmid.text if pmid is not None else None

                paper["source"] = "PubMed"
                papers.append(paper)

    except Exception as e:
        print(f"PubMed fetch error: {e}", file=sys.stderr)

    return papers


def search_arxiv(query: str, since_date: Optional[datetime] = None, max_results: int = 10) -> list[dict]:
    """Search arXiv for papers matching query."""
    # arXiv API doesn't support date filtering directly, we filter after
    search_params = {
        "search_query": f"all:{query}",
        "start": 0,
        "max_results": max_results * 2,  # Get extra to filter
        "sortBy": "submittedDate",
        "sortOrder": "descending",
    }

    url = f"http://export.arxiv.org/api/query?{urllib.parse.urlencode(search_params)}"

    papers = []
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            root = ET.fromstring(response.read().decode())
            ns = {"atom": "http://www.w3.org/2005/Atom"}

            for entry in root.findall("atom:entry", ns):
                paper = {}

                # Title
                title = entry.find("atom:title", ns)
                paper["title"] = title.text.strip().replace("\n", " ") if title is not None else "Unknown"

                # Authors
                authors = []
                for author in entry.findall("atom:author/atom:name", ns):
                    if author.text:
                        authors.append(author.text)
                paper["authors"] = authors[:3]

                # Published date
                published = entry.find("atom:published", ns)
                if published is not None:
                    pub_date = datetime.fromisoformat(published.text.replace("Z", "+00:00"))
                    paper["year"] = str(pub_date.year)

                    # Filter by date
                    if since_date and pub_date.replace(tzinfo=None) < since_date:
                        continue
                else:
                    paper["year"] = ""

                # arXiv ID
                arxiv_id = entry.find("atom:id", ns)
                if arxiv_id is not None:
                    paper["arxiv_id"] = arxiv_id.text.split("/")[-1]
                    paper["url"] = arxiv_id.text

                paper["journal"] = "arXiv preprint"
                paper["source"] = "arXiv"
                papers.append(paper)

                if len(papers) >= max_results:
                    break

    except Exception as e:
        print(f"arXiv search error: {e}", file=sys.stderr)

    return papers


def generate_vault_note(watches: list[dict], results: dict, output_dir: Path) -> Path:
    """Generate vault note with literature watch results."""
    today = datetime.now().strftime("%Y-%m-%d")
    output_file = output_dir / f"{today} Literature Watch.md"

    total_papers = sum(len(papers) for papers in results.values())

    lines = [
        "---",
        f"created: {today}",
        "type: literature-watch",
        "tags: [literature, alerts, automated]",
        "---",
        "",
        f"# Literature Watch - {today}",
        "",
        "## Summary",
        f"- **Watches checked**: {len(watches)}",
        f"- **New papers found**: {total_papers}",
        "",
    ]

    for watch in watches:
        name = watch["name"]
        papers = results.get(name, [])

        lines.append(f"## {name} ({len(papers)} new)")
        lines.append("")

        if not papers:
            lines.append("No new papers found.")
            lines.append("")
            continue

        for i, paper in enumerate(papers, 1):
            authors_str = ", ".join(paper.get("authors", []))
            if len(paper.get("authors", [])) > 3:
                authors_str += " et al."

            title = paper.get("title", "Unknown")
            journal = paper.get("journal", "")
            year = paper.get("year", "")

            # Build URL
            if paper.get("doi"):
                url = f"https://doi.org/{paper['doi']}"
            elif paper.get("arxiv_id"):
                url = f"https://arxiv.org/abs/{paper['arxiv_id']}"
            elif paper.get("pmid"):
                url = f"https://pubmed.ncbi.nlm.nih.gov/{paper['pmid']}/"
            else:
                url = None

            if url:
                lines.append(f"### {i}. [{title}]({url})")
            else:
                lines.append(f"### {i}. {title}")

            lines.append(f"- **Authors**: {authors_str}")
            lines.append(f"- **Source**: {journal}, {year}")
            lines.append(f"- **Relevance**: [To assess]")
            lines.append("")

        lines.append("---")
        lines.append("")

    lines.extend([
        "## Actions",
        "- [ ] Review papers for relevance",
        "- [ ] Add citations for high-relevance papers",
        "- [ ] Update Literature Watches.md with last checked date",
    ])

    output_file.write_text("\n".join(lines))
    return output_file


def update_watches_file(watches_file: Path, watches: list[dict]) -> None:
    """Update the watches file with new last checked dates."""
    if not watches_file.exists():
        return

    content = watches_file.read_text()
    today = datetime.now().strftime("%Y-%m-%d")

    for watch in watches:
        name = watch["name"]
        # Update last checked date
        pattern = rf"(### Watch: {re.escape(name)}.*?Last checked\*\*: )\d{{4}}-\d{{2}}-\d{{2}}"
        content = re.sub(pattern, rf"\g<1>{today}", content, flags=re.DOTALL)

    watches_file.write_text(content)


def main():
    parser = argparse.ArgumentParser(description="Literature Watch - Monitor for new papers")
    parser.add_argument("--check-all", action="store_true", help="Check all configured watches")
    parser.add_argument("--watch", type=str, help="Check specific watch by name")
    parser.add_argument("--list", action="store_true", help="List configured watches")
    parser.add_argument("--project", type=str, help="Project directory path")
    args = parser.parse_args()

    # Find project root
    if args.project:
        project_root = Path(args.project)
    else:
        project_root = find_project_root()

    if not project_root:
        print("Error: Could not find project root (no vault/ directory found)")
        print("Run from project directory or specify --project path")
        sys.exit(1)

    watches_file = project_root / "vault" / "Reference" / "Literature Watches.md"
    literature_dir = project_root / "vault" / "Literature"

    # Create literature watches file if it doesn't exist
    if not watches_file.exists():
        watches_file.parent.mkdir(parents=True, exist_ok=True)
        watches_file.write_text("""# Literature Watches

Configure automated literature monitoring. Add watches in the format below.

## Active Watches

### Watch: Example Topic
- **Query**: `your search terms here`
- **Sources**: PubMed, arXiv
- **Frequency**: Weekly
- **Last checked**: 2026-01-01
- **Papers found**: 0
""")
        print(f"Created template: {watches_file}")
        print("Edit this file to add your watch queries, then run again.")
        sys.exit(0)

    watches = parse_watches(watches_file)

    if args.list:
        print(f"Configured watches in {watches_file}:")
        print()
        for watch in watches:
            last = watch.get("last_checked")
            last_str = last.strftime("%Y-%m-%d") if last else "Never"
            print(f"  - {watch['name']}")
            print(f"    Query: {watch.get('query', 'N/A')}")
            print(f"    Last checked: {last_str}")
            print()
        sys.exit(0)

    if not args.check_all and not args.watch:
        parser.print_help()
        sys.exit(1)

    # Filter to specific watch if requested
    if args.watch:
        watches = [w for w in watches if w["name"].lower() == args.watch.lower()]
        if not watches:
            print(f"Watch not found: {args.watch}")
            sys.exit(1)

    if not watches:
        print("No watches configured. Edit the Literature Watches.md file.")
        sys.exit(1)

    print(f"Checking {len(watches)} watch(es)...")
    print()

    results = {}

    for watch in watches:
        name = watch["name"]
        query = watch.get("query", "")
        sources = watch.get("sources", "PubMed").lower()
        since = watch.get("last_checked")

        print(f"Checking: {name}")
        print(f"  Query: {query}")
        print(f"  Since: {since.strftime('%Y-%m-%d') if since else 'All time'}")

        papers = []

        if "pubmed" in sources:
            pubmed_papers = search_pubmed(query, since)
            papers.extend(pubmed_papers)
            print(f"  PubMed: {len(pubmed_papers)} papers")

        if "arxiv" in sources:
            arxiv_papers = search_arxiv(query, since)
            papers.extend(arxiv_papers)
            print(f"  arXiv: {len(arxiv_papers)} papers")

        results[name] = papers
        print()

    # Generate vault note
    literature_dir.mkdir(parents=True, exist_ok=True)
    output_file = generate_vault_note(watches, results, literature_dir)
    print(f"Generated: {output_file}")

    # Update watches file with new dates
    update_watches_file(watches_file, watches)
    print(f"Updated: {watches_file}")

    total = sum(len(p) for p in results.values())
    print(f"\nTotal new papers: {total}")


if __name__ == "__main__":
    main()
