# MCP Servers for Research Scientist

Model Context Protocol (MCP) servers for reliable academic API access.

## Servers

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

## Rate Limits

- **PubMed**: 3 requests/second without API key (automatic throttling)
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
