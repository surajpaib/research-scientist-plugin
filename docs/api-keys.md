# API Keys Configuration

This guide explains how to obtain and configure API keys for the Research Scientist plugin. All keys are **optional** - the plugin works without them, but API keys provide higher rate limits.

## Quick Setup

```bash
# Copy template
cp ~/.claude/plugins/research-scientist/.env.template ~/.claude/plugins/research-scientist/.env

# Edit with your keys
nano ~/.claude/plugins/research-scientist/.env
```

## Available APIs

### 1. PubMed / NCBI

**Purpose**: Search biomedical literature, fetch paper metadata

**Rate Limits**:
| Status | Rate Limit |
|--------|------------|
| Without key | 3 requests/second |
| With key | 10 requests/second |

**How to Get**:
1. Go to [NCBI Account Settings](https://www.ncbi.nlm.nih.gov/account/settings/)
2. Create an account or sign in
3. Scroll to "API Key Management"
4. Click "Create API Key"
5. Copy the key to your `.env` file

```
NCBI_API_KEY=your_key_here
```

---

### 2. CrossRef

**Purpose**: DOI metadata lookup, citation generation

**Rate Limits**:
| Status | Rate Limit |
|--------|------------|
| No email | ~50 req/sec (shared, may throttle) |
| With email | Higher priority (polite pool) |

**How to Get**:
No registration needed! Just provide your email address. This puts you in the "polite pool" for better service.

```
CROSSREF_EMAIL=your.email@example.com
```

More info: [CrossRef API Documentation](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)

---

### 3. Semantic Scholar

**Purpose**: Enhanced paper metadata, citation analysis, related papers

**Rate Limits**:
| Status | Rate Limit |
|--------|------------|
| Without key | 100 requests/5 minutes |
| With key | 1000 requests/5 minutes |

**How to Get**:
1. Go to [Semantic Scholar API](https://www.semanticscholar.org/product/api)
2. Click "Get API Key"
3. Create account and request key
4. Copy the key to your `.env` file

```
SEMANTIC_SCHOLAR_API_KEY=your_key_here
```

---

### 4. Zotero

**Purpose**: Bibliography management, citation sync

**Requirements**:
- Zotero desktop application
- Better BibTeX plugin
- Zotero API key

**How to Get**:
1. Install [Zotero Desktop](https://www.zotero.org/download/)
2. Install [Better BibTeX plugin](https://retorque.re/zotero-better-bibtex/)
3. Go to [Zotero API Settings](https://www.zotero.org/settings/keys)
4. Your User ID is at the top of the page
5. Click "Create new private key"
6. Give it a name and enable "Allow library access"
7. Copy both values to your `.env` file

```
ZOTERO_API_KEY=your_key_here
ZOTERO_USER_ID=12345678
```

---

## Feature Requirements

| Feature | Required Keys |
|---------|---------------|
| `/search-literature` | None (NCBI_API_KEY optional) |
| `/add-citation` | None (CROSSREF_EMAIL optional) |
| Zotero sync | ZOTERO_API_KEY + ZOTERO_USER_ID |
| Related papers | None (SEMANTIC_SCHOLAR_API_KEY optional) |

---

## Troubleshooting

### "Rate limit exceeded" errors
- Add API keys to increase your limits
- Wait a few seconds between requests
- Consider caching results locally

### Zotero connection fails
1. Ensure Zotero desktop is running
2. Check Better BibTeX is installed
3. Verify API key has library access permission
4. Check User ID is correct (numeric only)

### CrossRef returns incomplete data
- Ensure your email is set in `.env`
- Some older DOIs have limited metadata
- Try Semantic Scholar as fallback

---

## Security Notes

- **Never commit `.env` to git** - it should be in `.gitignore`
- API keys are stored locally on your machine
- Keys are only used for API authentication, not stored elsewhere
- You can revoke keys anytime from each service's settings page
