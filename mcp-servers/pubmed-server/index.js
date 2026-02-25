#!/usr/bin/env node
/**
 * PubMed MCP Server — zero npm dependencies
 * Uses Node.js built-ins + native fetch (Node 18+)
 * MCP protocol via JSON-RPC over stdio
 */

const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const API_KEY = process.env.NCBI_API_KEY || '';
const DELAY   = API_KEY ? 100 : 340;   // 10 req/s with key, 3 req/s without

process.stderr.write(
  API_KEY
    ? '[pubmed] API key set — 10 req/s\n'
    : '[pubmed] No NCBI_API_KEY — 3 req/s (set env var to increase)\n'
);

// ── Rate-limited fetch ────────────────────────────────────────────────────────

let lastCall = 0;
async function apiFetch(url) {
  const sep = url.includes('?') ? '&' : '?';
  const full = API_KEY ? `${url}${sep}api_key=${API_KEY}` : url;
  const wait = DELAY - (Date.now() - lastCall);
  if (wait > 0) await new Promise(r => setTimeout(r, wait));
  lastCall = Date.now();
  const res = await fetch(full);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res;
}

// ── PubMed helpers ────────────────────────────────────────────────────────────

async function search(query, max = 10, yearStart, yearEnd) {
  let q = query;
  if (yearStart && yearEnd) q += ` AND ${yearStart}:${yearEnd}[dp]`;
  else if (yearStart) q += ` AND ${yearStart}:3000[dp]`;
  else if (yearEnd)   q += ` AND 1900:${yearEnd}[dp]`;

  const url = `${EUTILS}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(q)}&retmax=${Math.min(max,50)}&retmode=json&sort=relevance`;
  const data = await (await apiFetch(url)).json();
  const ids = data.esearchresult?.idlist ?? [];
  if (!ids.length) return { papers: [], total: 0 };

  const xml = await (await apiFetch(`${EUTILS}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`)).text();
  return { papers: parseXml(xml, ids), total: parseInt(data.esearchresult.count) || 0 };
}

async function fetchByPmid(pmid) {
  const xml = await (await apiFetch(`${EUTILS}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`)).text();
  return parseXml(xml, [pmid])[0] ?? null;
}

async function fetchByDoi(doi) {
  const data = await (await apiFetch(`${EUTILS}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(doi)}[doi]&retmode=json`)).json();
  const ids = data.esearchresult?.idlist ?? [];
  return ids.length ? fetchByPmid(ids[0]) : null;
}

function parseXml(xml, ids) {
  const unescape = s => s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  const get = (str, tag) => { const m = str.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)); return m ? unescape(m[1].trim()) : null; };

  return xml.split(/<PubmedArticle>/).slice(1).map((article, i) => {
    const authors = [...article.matchAll(/<LastName>([^<]+)<\/LastName>\s*<ForeName>([^<]+)<\/ForeName>/g)]
      .map(m => `${m[1]}, ${m[2]}`);
    const abs = get(article, 'AbstractText') ?? '';
    return {
      pmid:     get(article, 'PMID') ?? ids[i],
      title:    get(article, 'ArticleTitle') ?? 'Unknown',
      authors,
      journal:  get(article, 'Title') ?? '',
      year:     (() => { const m = article.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/); return m ? parseInt(m[1]) : null; })(),
      doi:      (() => { const m = article.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/); return m ? m[1] : null; })(),
      abstract: abs.length > 500 ? abs.slice(0, 500) + '…' : abs,
    };
  });
}

function bibtex(paper) {
  if (!paper) return null;
  const first = paper.authors[0]?.split(',')[0]?.toLowerCase().replace(/\s+/g,'') ?? 'unknown';
  const kw    = paper.title.split(' ').find(w => w.length > 4)?.toLowerCase().replace(/[^a-z]/g,'') ?? 'paper';
  const key   = `${first}${paper.year ?? 'xxxx'}${kw}`;
  let bib = `@article{${key},\n`;
  bib += `  author  = {${paper.authors.join(' and ')}},\n`;
  bib += `  title   = {${paper.title}},\n`;
  bib += `  journal = {${paper.journal}},\n`;
  bib += `  year    = {${paper.year ?? ''}},\n`;
  if (paper.doi)  bib += `  doi     = {${paper.doi}},\n`;
  bib += `  pmid    = {${paper.pmid}},\n`;
  bib += `}\n`;
  return { key, bibtex: bib };
}

// ── MCP JSON-RPC server (stdio, no SDK needed) ────────────────────────────────

const TOOLS = [
  {
    name: 'pubmed_search',
    description: 'Search PubMed. Returns title, authors, journal, year, DOI, PMID, abstract.',
    inputSchema: {
      type: 'object',
      properties: {
        query:      { type: 'string',  description: 'Search query (PubMed syntax supported)' },
        max_results:{ type: 'number',  description: 'Max results (default 10, max 50)', default: 10 },
        year_start: { type: 'number',  description: 'Filter from year' },
        year_end:   { type: 'number',  description: 'Filter to year' },
      },
      required: ['query'],
    },
  },
  {
    name: 'pubmed_fetch',
    description: 'Fetch a single paper by PMID or DOI.',
    inputSchema: {
      type: 'object',
      properties: {
        pmid: { type: 'string', description: 'PubMed ID' },
        doi:  { type: 'string', description: 'DOI' },
      },
    },
  },
  {
    name: 'pubmed_bibtex',
    description: 'Generate a BibTeX entry for a paper by PMID or DOI.',
    inputSchema: {
      type: 'object',
      properties: {
        pmid: { type: 'string', description: 'PubMed ID' },
        doi:  { type: 'string', description: 'DOI' },
      },
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
      serverInfo: { name: 'pubmed-server', version: '2.0.0' },
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
      if (name === 'pubmed_search') {
        data = await search(args.query, args.max_results, args.year_start, args.year_end);
      } else if (name === 'pubmed_fetch') {
        if (!args.pmid && !args.doi) throw new Error('Provide pmid or doi');
        data = args.pmid ? await fetchByPmid(args.pmid) : await fetchByDoi(args.doi);
      } else if (name === 'pubmed_bibtex') {
        if (!args.pmid && !args.doi) throw new Error('Provide pmid or doi');
        const paper = args.pmid ? await fetchByPmid(args.pmid) : await fetchByDoi(args.doi);
        data = bibtex(paper);
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
  buf = lines.pop();                     // keep incomplete line
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const msg = JSON.parse(trimmed);
      const response = await handle(msg);
      if (response) process.stdout.write(response + '\n');
    } catch (e) {
      process.stderr.write(`[pubmed] parse error: ${e.message}\n`);
    }
  }
});

process.stdin.on('end', () => process.exit(0));
process.stderr.write('[pubmed] MCP server ready\n');
