#!/usr/bin/env node
/**
 * Zotero MCP Server — zero npm dependencies
 * Uses Node.js built-ins + native fetch (Node 18+)
 * MCP protocol via JSON-RPC over stdio
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

const BBT     = 'http://localhost:23119/better-bibtex';
const CROSSREF = 'https://api.crossref.org/works';

process.stderr.write('[zotero] MCP server ready\n');

// ── Zotero / CrossRef helpers ─────────────────────────────────────────────────

async function zoteroAlive() {
  try {
    const r = await fetch(`${BBT}/cayw?probe=true`, { signal: AbortSignal.timeout(2000) });
    return r.ok;
  } catch { return false; }
}

async function zoteroSearch(query) {
  if (!await zoteroAlive()) return { error: 'Zotero not running. Start Zotero with Better BibTeX installed.' };
  try {
    const r = await fetch(`${BBT}/json-rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'item.search', params: [query], id: 1 }),
    });
    const d = await r.json();
    return d.result ?? [];
  } catch (e) { return { error: e.message }; }
}

async function zoteroExport(collectionKey) {
  if (!await zoteroAlive()) return { error: 'Zotero not running' };
  try {
    const r = await fetch(`${BBT}/collection?/${collectionKey}.bibtex`);
    return { bibtex: await r.text() };
  } catch (e) { return { error: e.message }; }
}

async function crossRefFetch(doi) {
  try {
    const r = await fetch(`${CROSSREF}/${encodeURIComponent(doi)}`, {
      headers: { 'User-Agent': 'research-scientist-plugin/2.0 (mailto:user@example.com)' },
    });
    if (!r.ok) return null;
    const w = (await r.json()).message;
    return {
      doi:     w.DOI,
      title:   w.title?.[0] ?? 'Unknown',
      authors: (w.author ?? []).map(a => ({ given: a.given ?? '', family: a.family ?? '' })),
      journal: w['container-title']?.[0] ?? '',
      year:    w.published?.['date-parts']?.[0]?.[0] ?? null,
      volume:  w.volume,
      issue:   w.issue,
      pages:   w.page,
    };
  } catch { return null; }
}

function makeBibtex(paper) {
  if (!paper) return null;
  const first = paper.authors[0]?.family?.toLowerCase().replace(/\s+/g,'') ?? 'unknown';
  const kw    = paper.title.split(' ').find(w => w.length > 4)?.toLowerCase().replace(/[^a-z]/g,'') ?? 'paper';
  const key   = `${first}${paper.year ?? 'xxxx'}${kw}`;
  const auths = paper.authors.map(a => `${a.family}, ${a.given}`).join(' and ');
  let bib = `@article{${key},\n`;
  bib += `  author  = {${auths}},\n`;
  bib += `  title   = {${paper.title}},\n`;
  if (paper.journal) bib += `  journal = {${paper.journal}},\n`;
  bib += `  year    = {${paper.year ?? ''}},\n`;
  if (paper.volume)  bib += `  volume  = {${paper.volume}},\n`;
  if (paper.issue)   bib += `  number  = {${paper.issue}},\n`;
  if (paper.pages)   bib += `  pages   = {${paper.pages}},\n`;
  bib += `  doi     = {${paper.doi}},\n`;
  bib += `}\n`;
  return { key, bibtex: bib, metadata: paper };
}

async function addToBib(bibPath, bibtexStr, key) {
  try {
    let content = '';
    if (existsSync(bibPath)) {
      content = await readFile(bibPath, 'utf-8');
      if (content.match(new RegExp(`@\\w+\\{${key},`))) {
        return { success: false, message: `Key '${key}' already exists` };
      }
    }
    await writeFile(bibPath, (content.trim() + '\n\n' + bibtexStr).trim() + '\n');
    return { success: true, message: `Added ${key} to ${bibPath}` };
  } catch (e) { return { success: false, message: e.message }; }
}

async function listBib(bibPath) {
  try {
    if (!existsSync(bibPath)) return { entries: [], error: 'File not found' };
    const content = await readFile(bibPath, 'utf-8');
    const entries = [];
    for (const m of content.matchAll(/@\w+\{([^,]+),/g)) {
      const key = m[1];
      const start = m.index;
      const slice = content.slice(start, content.indexOf('\n}\n', start) + 3);
      const title = slice.match(/title\s*=\s*\{([^}]+)\}/i)?.[1] ?? 'Unknown';
      const year  = slice.match(/year\s*=\s*\{?(\d{4})\}?/i)?.[1] ?? 'Unknown';
      entries.push({ key, title, year });
    }
    return { entries, count: entries.length };
  } catch (e) { return { entries: [], error: e.message }; }
}

// ── MCP JSON-RPC (no SDK) ─────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'zotero_status',
    description: 'Check if Zotero is running with Better BibTeX.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'zotero_search',
    description: 'Search your Zotero library (requires Zotero + Better BibTeX running).',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search query' } },
      required: ['query'],
    },
  },
  {
    name: 'zotero_export',
    description: 'Export a Zotero collection to BibTeX.',
    inputSchema: {
      type: 'object',
      properties: { collection_key: { type: 'string', description: 'Zotero collection key' } },
      required: ['collection_key'],
    },
  },
  {
    name: 'doi_to_bibtex',
    description: 'Convert a DOI to a BibTeX entry using CrossRef (no Zotero required).',
    inputSchema: {
      type: 'object',
      properties: { doi: { type: 'string', description: 'DOI e.g. 10.1016/j.jacc.2023.01.001' } },
      required: ['doi'],
    },
  },
  {
    name: 'add_citation',
    description: 'Fetch a DOI from CrossRef and append it to a .bib file (duplicate-safe).',
    inputSchema: {
      type: 'object',
      properties: {
        bib_path: { type: 'string', description: 'Path to .bib file e.g. paper/references.bib' },
        doi:      { type: 'string', description: 'DOI to add' },
      },
      required: ['bib_path', 'doi'],
    },
  },
  {
    name: 'list_citations',
    description: 'List all citation keys in a .bib file.',
    inputSchema: {
      type: 'object',
      properties: { bib_path: { type: 'string', description: 'Path to .bib file' } },
      required: ['bib_path'],
    },
  },
];

function ok(id, result)          { return JSON.stringify({ jsonrpc: '2.0', id, result }); }
function errMsg(id, code, msg)   { return JSON.stringify({ jsonrpc: '2.0', id, error: { code, message: msg } }); }
function text(id, data)          { return ok(id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }); }
function textErr(id, msg)        { return ok(id, { content: [{ type: 'text', text: `Error: ${msg}` }], isError: true }); }

async function handle(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return ok(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'zotero-server', version: '2.0.0' },
    });
  }

  if (method === 'notifications/initialized') return null;
  if (method === 'tools/list') return ok(id, { tools: TOOLS });

  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params;
    try {
      if (name === 'zotero_status') {
        const connected = await zoteroAlive();
        return text(id, { connected, message: connected ? 'Zotero running with Better BibTeX' : 'Zotero not detected' });
      }
      if (name === 'zotero_search')  return text(id, await zoteroSearch(args.query));
      if (name === 'zotero_export')  return text(id, await zoteroExport(args.collection_key));
      if (name === 'doi_to_bibtex') {
        const paper = await crossRefFetch(args.doi);
        return text(id, paper ? makeBibtex(paper) : { error: 'DOI not found in CrossRef' });
      }
      if (name === 'add_citation') {
        const paper = await crossRefFetch(args.doi);
        if (!paper) return text(id, { error: 'DOI not found in CrossRef' });
        const { key, bibtex } = makeBibtex(paper);
        return text(id, { ...(await addToBib(args.bib_path, bibtex, key)), citation_key: key, bibtex });
      }
      if (name === 'list_citations') return text(id, await listBib(args.bib_path));
      throw new Error(`Unknown tool: ${name}`);
    } catch (e) { return textErr(id, e.message); }
  }

  return errMsg(id, -32601, `Method not found: ${method}`);
}

// ── Stdio loop ────────────────────────────────────────────────────────────────

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', async chunk => {
  buf += chunk;
  const lines = buf.split('\n');
  buf = lines.pop();
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    try {
      const msg = JSON.parse(t);
      const res = await handle(msg);
      if (res) process.stdout.write(res + '\n');
    } catch (e) {
      process.stderr.write(`[zotero] parse error: ${e.message}\n`);
    }
  }
});

process.stdin.on('end', () => process.exit(0));
