#!/usr/bin/env node
/**
 * arXiv MCP Server — zero npm dependencies
 * Uses Node.js built-ins + native fetch (Node 18+)
 * MCP protocol via JSON-RPC over stdio
 */

const ARXIV = 'https://export.arxiv.org/api/query';
const DELAY = 340;  // arXiv polite rate limit: ~3 req/s

process.stderr.write('[arxiv] MCP server starting\n');

// ── Rate-limited fetch ────────────────────────────────────────────────────────

let lastCall = 0;
async function apiFetch(url) {
  const wait = DELAY - (Date.now() - lastCall);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();
  const res = await fetch(url, {
    headers: { 'User-Agent': 'research-scientist-mcp/1.0 (mailto:research@example.com)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res;
}

// ── XML helpers ───────────────────────────────────────────────────────────────

function unescape(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTag(str, tag) {
  const m = str.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? unescape(m[1].trim()) : null;
}

function parseEntries(xml) {
  return xml.split(/<entry>/).slice(1).map(entry => {
    // arXiv ID: strip version suffix e.g. http://arxiv.org/abs/2301.00001v2 → 2301.00001
    const rawId = getTag(entry, 'id') ?? '';
    const arxivId = rawId.replace(/.*\/abs\//, '').replace(/v\d+$/, '');

    const title = (getTag(entry, 'title') ?? 'Unknown').replace(/\s+/g, ' ');
    const summary = getTag(entry, 'summary') ?? '';
    const published = (getTag(entry, 'published') ?? '').slice(0, 10);
    const year = published ? parseInt(published.slice(0, 4)) : null;

    // Authors: <author><name>...</name></author>
    const authors = [...entry.matchAll(/<author>\s*<name>([^<]+)<\/name>/g)]
      .map(m => unescape(m[1].trim()));

    // DOI (may be absent for preprints)
    const doiMatch = entry.match(/<arxiv:doi[^>]*>([^<]+)<\/arxiv:doi>/);
    const doi = doiMatch ? unescape(doiMatch[1].trim()) : null;

    // Primary category
    const catMatch = entry.match(/<arxiv:primary_category[^>]*term="([^"]+)"/);
    const category = catMatch ? catMatch[1] : null;

    const abs = summary.replace(/\s+/g, ' ');
    return {
      arxiv_id: arxivId,
      title,
      authors,
      summary: abs.length > 500 ? abs.slice(0, 500) + '…' : abs,
      published,
      year,
      doi,
      category,
      url: `https://arxiv.org/abs/${arxivId}`,
      pdf_url: `https://arxiv.org/pdf/${arxivId}`,
    };
  });
}

// ── arXiv API helpers ─────────────────────────────────────────────────────────

async function search(query, max = 10, category, yearStart, yearEnd) {
  let searchQuery = `all:${query}`;
  if (category) searchQuery += `+AND+cat:${category}`;

  const params = new URLSearchParams({
    search_query: searchQuery,
    start: '0',
    max_results: String(Math.min(max, 50)),
    sortBy: 'relevance',
    sortOrder: 'descending',
  });

  const xml = await (await apiFetch(`${ARXIV}?${params}`)).text();
  let entries = parseEntries(xml);

  // Filter by year client-side (arXiv Atom API doesn't support date range natively)
  if (yearStart) entries = entries.filter(e => e.year && e.year >= yearStart);
  if (yearEnd)   entries = entries.filter(e => e.year && e.year <= yearEnd);

  // Total count from opensearch:totalResults
  const totalMatch = xml.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/);
  const total = totalMatch ? parseInt(totalMatch[1]) : entries.length;

  return { papers: entries, total };
}

async function fetchById(arxivId) {
  // Normalize: strip version suffix if present
  const id = arxivId.replace(/v\d+$/, '');
  const params = new URLSearchParams({ id_list: id, max_results: '1' });
  const xml = await (await apiFetch(`${ARXIV}?${params}`)).text();
  const entries = parseEntries(xml);
  return entries[0] ?? null;
}

function toBibtex(entry) {
  if (!entry) return null;
  const first = (entry.authors[0] ?? 'unknown')
    .split(' ').pop()
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  const kw = entry.title.split(' ')
    .find(w => w.length > 4)
    ?.toLowerCase()
    .replace(/[^a-z]/g, '') ?? 'paper';
  const key = `${first}${entry.year ?? 'xxxx'}${kw}`;

  let bib = `@article{${key},\n`;
  bib += `  author  = {${entry.authors.join(' and ')}},\n`;
  bib += `  title   = {{${entry.title}}},\n`;
  bib += `  journal = {arXiv preprint arXiv:${entry.arxiv_id}},\n`;
  bib += `  year    = {${entry.year ?? ''}},\n`;
  if (entry.doi) bib += `  doi     = {${entry.doi}},\n`;
  bib += `  url     = {${entry.url}},\n`;
  bib += `  note    = {arXiv:${entry.arxiv_id}},\n`;
  bib += `}\n`;
  return { key, bibtex: bib };
}

// ── MCP JSON-RPC server (stdio, no SDK needed) ────────────────────────────────

const TOOLS = [
  {
    name: 'arxiv_search',
    description: 'Search arXiv preprints. Returns title, authors, summary, published date, arXiv ID, category, and URLs.',
    inputSchema: {
      type: 'object',
      properties: {
        query:       { type: 'string', description: 'Search query (keywords, title words, author names)' },
        max_results: { type: 'number', description: 'Max results (default 10, max 50)', default: 10 },
        category:    { type: 'string', description: 'arXiv category filter, e.g. cs.LG, stat.ML, cs.AI, q-bio.QM' },
        year_start:  { type: 'number', description: 'Filter papers from this year (inclusive)' },
        year_end:    { type: 'number', description: 'Filter papers up to this year (inclusive)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'arxiv_fetch',
    description: 'Fetch full metadata for a single arXiv paper by its ID (e.g. "2301.00001" or "cs/0612068").',
    inputSchema: {
      type: 'object',
      properties: {
        arxiv_id: { type: 'string', description: 'arXiv paper ID, e.g. 2301.00001' },
      },
      required: ['arxiv_id'],
    },
  },
  {
    name: 'arxiv_bibtex',
    description: 'Generate a BibTeX entry for an arXiv paper by its ID.',
    inputSchema: {
      type: 'object',
      properties: {
        arxiv_id: { type: 'string', description: 'arXiv paper ID, e.g. 2301.00001' },
      },
      required: ['arxiv_id'],
    },
  },
];

function ok(id, result) {
  return JSON.stringify({ jsonrpc: '2.0', id, result });
}

function err(id, code, message) {
  return JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
}

async function handle(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return ok(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'arxiv-server', version: '1.0.0' },
    });
  }

  if (method === 'notifications/initialized') return null;

  if (method === 'tools/list') {
    return ok(id, { tools: TOOLS });
  }

  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params;
    try {
      let data;
      if (name === 'arxiv_search') {
        data = await search(args.query, args.max_results, args.category, args.year_start, args.year_end);
      } else if (name === 'arxiv_fetch') {
        if (!args.arxiv_id) throw new Error('Provide arxiv_id');
        data = await fetchById(args.arxiv_id);
      } else if (name === 'arxiv_bibtex') {
        if (!args.arxiv_id) throw new Error('Provide arxiv_id');
        const paper = await fetchById(args.arxiv_id);
        data = toBibtex(paper);
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
      return ok(id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
    } catch (e) {
      return ok(id, { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true });
    }
  }

  return err(id, -32601, `Method not found: ${method}`);
}

// ── Stdio loop ────────────────────────────────────────────────────────────────

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', async chunk => {
  buf += chunk;
  const lines = buf.split('\n');
  buf = lines.pop();  // keep incomplete line
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const msg = JSON.parse(trimmed);
      const response = await handle(msg);
      if (response) process.stdout.write(response + '\n');
    } catch (e) {
      process.stderr.write(`[arxiv] parse error: ${e.message}\n`);
    }
  }
});

process.stdin.on('end', () => process.exit(0));
process.stderr.write('[arxiv] MCP server ready\n');
