# MCP Servers for Research Scientist

Model Context Protocol (MCP) servers for reliable academic API access.

## Servers

### arXiv Server

Preprint search and metadata retrieval via the arXiv Atom API. Zero npm dependencies, pure Node.js.

**Tools:**
- `arxiv_search` — Search arXiv by keyword, category filter (e.g. `cs.LG`, `stat.ML`), and year range
- `arxiv_fetch` — Fetch full metadata for a single paper by arXiv ID (e.g. `2301.00001`)
- `arxiv_bibtex` — Generate a ready-to-use BibTeX entry from an arXiv ID

**Setup:**
Registered automatically by `scripts/install.sh`. No configuration required — the arXiv API is free and unauthenticated.

**Rate limit:** ~3 requests/second (340 ms inter-request delay, polite pool).

**Example:**
```
Use arxiv_search with query="contrastive learning ECG" category="cs.LG" year_start=2021
Use arxiv_bibtex with arxiv_id="2301.00001"
```

---

### PubMed Server

Tools for searching PubMed and generating citations.

**Tools:**
- `pubmed_search` - Search PubMed with filters
- `pubmed_fetch` - Fetch paper by PMID or DOI
- `pubmed_bibtex` - Generate BibTeX from PMID/DOI

**Setup:**
```bash
cd mcp-servers/pubmed-server
npm install
```

### Zotero Server

Bibliography management via Zotero and CrossRef.

**Tools:**
- `zotero_search` - Search Zotero library (requires Zotero running)
- `zotero_export` - Export collection to BibTeX
- `doi_to_bibtex` - Convert DOI to BibTeX (via CrossRef, no Zotero needed)
- `add_citation` - Add citation to .bib file with duplicate checking
- `list_citations` - List all citations in a .bib file
- `zotero_status` - Check Zotero connection

**Setup:**
```bash
cd mcp-servers/zotero-server
npm install
```

**Requirements:**
- Zotero desktop app (for zotero_* tools)
- Better BibTeX plugin for Zotero
- CrossRef API (free, no key required)

## Installation

### Option 1: Global Installation

Add to your `~/.claude.json`:

```json
{
  "mcpServers": {
    "pubmed": {
      "command": "node",
      "args": ["/Users/YOU/.claude/plugins/research-scientist/mcp-servers/pubmed-server/index.js"]
    },
    "zotero": {
      "command": "node",
      "args": ["/Users/YOU/.claude/plugins/research-scientist/mcp-servers/zotero-server/index.js"]
    },
    "arxiv": {
      "command": "node",
      "args": ["/Users/YOU/.claude/plugins/research-scientist/mcp-servers/arxiv-server/index.js"]
    }
  }
}
```

### Option 2: Project-Level

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "pubmed": {
      "command": "node",
      "args": ["~/.claude/plugins/research-scientist/mcp-servers/pubmed-server/index.js"]
    },
    "zotero": {
      "command": "node",
      "args": ["~/.claude/plugins/research-scientist/mcp-servers/zotero-server/index.js"]
    },
    "arxiv": {
      "command": "node",
      "args": ["~/.claude/plugins/research-scientist/mcp-servers/arxiv-server/index.js"]
    }
  }
}
```

## Usage Examples

### Search PubMed
```
Use pubmed_search to find papers on "adipose tissue TAVR mortality" from 2020-2024
```

### Add Citation from DOI
```
Use add_citation to add DOI 10.1016/j.jacc.2023.01.001 to paper/references.bib
```

### Check Existing Citations
```
Use list_citations to see what's already in paper/references.bib
```

## PubMed API Key (optional but recommended)

Without a key: 3 requests/second. With a key: 10 requests/second.

1. Register free at https://www.ncbi.nlm.nih.gov/account/
2. Go to **Settings → API Key Management → Create API Key**
3. Add it to your MCP server config via the `env` field:

```json
{
  "mcpServers": {
    "pubmed": {
      "command": "node",
      "args": ["/path/to/mcp-servers/pubmed-server/index.js"],
      "env": {
        "NCBI_API_KEY": "your_key_here"
      }
    }
  }
}
```

Or export it in your shell before starting Claude:
```bash
export NCBI_API_KEY=your_key_here
claude
```

## Rate Limits

- **arXiv**: ~3 req/s (340 ms throttle, no key required)
- **PubMed**: 3 req/s without key, 10 req/s with key (automatic throttling)
- **CrossRef**: Polite pool (no hard limit with User-Agent)
- **Zotero**: Local, no limits

## Troubleshooting

### "Zotero not running"

1. Start Zotero desktop app
2. Install Better BibTeX plugin: https://retorque.re/zotero-better-bibtex/
3. Verify: Visit http://localhost:23119/better-bibtex/cayw?probe=true

### "DOI not found"

- CrossRef may not have all DOIs (preprints, some conferences)
- Try PubMed search with title/authors instead
