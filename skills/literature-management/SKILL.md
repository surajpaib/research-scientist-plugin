---
name: literature-management
description: |
  Academic literature search, citation management, and paper reading for research projects.

  **USE WHEN:**
  - User says "find papers on X", "search for literature", "what's been published"
  - User wants to add a citation from DOI, PMID, or paper title
  - User asks about related work, prior research, or background literature
  - User provides a PDF and wants it summarized or added to vault
  - User asks "how do I cite this" or wants BibTeX generated
  - Working on Introduction or Discussion sections that need references

  **DON'T USE WHEN:**
  - User is writing content (use academic-writing instead)
  - User is doing statistical analysis (use statistical-methods instead)
  - User asks about journal formatting (use journal-profiles instead)

  Trigger phrases: search literature, find papers, add citation, cite paper,
  DOI lookup, BibTeX, reference, bibliography, related work, prior research,
  literature review, read paper, summarize paper, PubMed, Semantic Scholar,
  "what papers", "any studies on", "has anyone published", "cite this"
tags: [literature, citations, search, papers, bibliography, pubmed, doi]
---

# Literature Management Skill

Handles all literature-related tasks: searching, citing, and reading papers.

## Capabilities

### 1. Literature Search

Search multiple academic databases for relevant papers.

**Sources Available:**
| Source | Best For | API |
|--------|----------|-----|
| PubMed | Biomedical | MCP: pubmed_search |
| OpenAlex | Broad coverage | api.openalex.org |
| Semantic Scholar | AI/ML, citations | api.semanticscholar.org |
| arXiv | Preprints | export.arxiv.org |
| CrossRef | DOI metadata | api.crossref.org |

**Search Strategy:**
1. Use specific domain terms
2. Include outcome keywords: "mortality", "survival", "outcomes"
3. Quote exact phrases: `"body composition"`
4. Filter by year range

**Using MCP (preferred):**
```
Use pubmed_search to find papers on "adipose tissue TAVR mortality" from 2020-2024
```

**Using WebFetch (fallback):**
```
GET https://api.openalex.org/works?search={query}&per_page=10
```

### 2. Citation Management

Generate and manage BibTeX citations.

**Using MCP (preferred):**
```
Use add_citation to add DOI 10.1016/j.jacc.2023.01.001 to paper/references.bib
```

**Citation Key Format:** `firstauthorYEARkeyword`
- `smith2023mortality`
- `chen2024adipose`
- `vanderberg2024frailty`

**BibTeX Format (Zotero-compatible):**
```bibtex
@article{citationkey,
  author    = {LastName, FirstName and LastName2, FirstName2},
  title     = {Full Article Title},
  journal   = {Full Journal Name},
  year      = {2024},
  volume    = {123},
  number    = {4},
  pages     = {567--589},
  doi       = {10.1234/xxxxx},
  pmid      = {12345678},
}
```

**Required fields:** author, title, journal, year
**Recommended:** doi, pmid (for medical)

**Before Adding:**
1. Check `paper/references.bib` for duplicates
2. Verify DOI resolves correctly
3. Generate appropriate citation key

### 3. Paper Reading

Extract and summarize information from papers.

**For PDFs:**
1. Read PDF content
2. Extract key sections (Abstract, Methods, Results)
3. Create vault note with structured summary

**Literature Note Template:**
Create in `vault/Literature/`:

```markdown
---
aliases: []
tags: [literature]
created: YYYY-MM-DD
status: active
citation_key: citationkey
doi: 10.xxxx/xxxxx
---

# {Paper Title}

**Citation:** {Authors} ({Year}). {Title}. *{Journal}*.

## Key Findings
- {Finding 1}
- {Finding 2}

## Methods Summary
- **Design:** {study type}
- **Population:** {N, criteria}
- **Outcome:** {primary endpoint}

## Relevance to Our Work
{How this relates to current research}

## Related Notes
- [[Literature Index]]
```

### 4. Duplicate Detection

Before adding any citation:
1. Read existing `paper/references.bib`
2. Check for matching DOI
3. Check for similar citation keys
4. Report if duplicate found

**Using MCP:**
```
Use list_citations to check paper/references.bib for existing entries
```

## Workflow Examples

### Finding and Citing a Paper
1. Search: "Find papers on adipose tissue and TAVR outcomes"
2. Review results, select relevant paper
3. Add citation: Use MCP `add_citation` with DOI
4. Cite in paper: `[@citationkey]`

### Literature Review
1. Search multiple databases for topic
2. Deduplicate results
3. Create literature notes for key papers
4. Update `vault/Literature/Literature Index.md`

### Adding from Downloaded PDF
1. Read PDF file
2. Extract metadata (title, authors, DOI)
3. Generate BibTeX entry
4. Create vault note with summary
5. Add to references.bib

## Integration with MCP Servers

This skill works best with the MCP servers:

- **pubmed-server**: `pubmed_search`, `pubmed_fetch`, `pubmed_bibtex`
- **zotero-server**: `doi_to_bibtex`, `add_citation`, `list_citations`

Check MCP availability:
```
Use zotero_status to check if Zotero is running
```

## Quality Checks

Before finalizing literature tasks:
- [ ] Citation key follows format
- [ ] DOI is valid and resolves
- [ ] No duplicates in references.bib
- [ ] Vault note created for key papers
- [ ] Literature Index updated
