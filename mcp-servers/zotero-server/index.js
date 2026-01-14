#!/usr/bin/env node

/**
 * Zotero MCP Server
 *
 * Provides tools for managing bibliographies via Zotero's local API.
 * Connects to Zotero's local Better BibTeX server for real-time sync.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

// Zotero Better BibTeX local server (default port)
const BBT_URL = 'http://localhost:23119/better-bibtex';

// CrossRef API for DOI lookup (fallback)
const CROSSREF_URL = 'https://api.crossref.org/works';

async function checkZoteroConnection() {
  try {
    const response = await fetch(`${BBT_URL}/cayw?probe=true`, {
      signal: AbortSignal.timeout(2000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function searchZotero(query) {
  const zoteroConnected = await checkZoteroConnection();
  if (!zoteroConnected) {
    return { error: 'Zotero not running. Start Zotero with Better BibTeX installed.' };
  }

  try {
    // Use Better BibTeX JSON-RPC
    const response = await fetch(`${BBT_URL}/json-rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'item.search',
        params: [query],
        id: 1,
      }),
    });

    const data = await response.json();
    return data.result || [];
  } catch (error) {
    return { error: `Zotero search failed: ${error.message}` };
  }
}

async function exportCollection(collectionKey, format = 'bibtex') {
  const zoteroConnected = await checkZoteroConnection();
  if (!zoteroConnected) {
    return { error: 'Zotero not running' };
  }

  try {
    const response = await fetch(`${BBT_URL}/collection?/${collectionKey}.${format}`);
    const text = await response.text();
    return { bibtex: text };
  } catch (error) {
    return { error: `Export failed: ${error.message}` };
  }
}

async function fetchFromCrossRef(doi) {
  try {
    const response = await fetch(`${CROSSREF_URL}/${encodeURIComponent(doi)}`, {
      headers: {
        'User-Agent': 'research-scientist-plugin/1.0 (mailto:user@example.com)',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const work = data.message;

    return {
      doi: work.DOI,
      title: work.title?.[0] || 'Unknown Title',
      authors: (work.author || []).map(a => ({
        given: a.given,
        family: a.family,
      })),
      journal: work['container-title']?.[0] || '',
      year: work.published?.['date-parts']?.[0]?.[0] || null,
      volume: work.volume,
      issue: work.issue,
      pages: work.page,
      type: work.type,
    };
  } catch {
    return null;
  }
}

function generateBibtexFromCrossRef(paper) {
  if (!paper) return null;

  const firstAuthor = paper.authors[0]?.family?.toLowerCase().replace(/\s+/g, '') || 'unknown';
  const year = paper.year || 'XXXX';
  const keyword = paper.title.split(' ').find(w => w.length > 4)?.toLowerCase().replace(/[^a-z]/g, '') || 'paper';
  const key = `${firstAuthor}${year}${keyword}`;

  const authorStr = paper.authors
    .map(a => `${a.family}, ${a.given}`)
    .join(' and ');

  let bibtex = `@article{${key},\n`;
  bibtex += `  author    = {${authorStr}},\n`;
  bibtex += `  title     = {${paper.title}},\n`;
  if (paper.journal) bibtex += `  journal   = {${paper.journal}},\n`;
  bibtex += `  year      = {${year}},\n`;
  if (paper.volume) bibtex += `  volume    = {${paper.volume}},\n`;
  if (paper.issue) bibtex += `  number    = {${paper.issue}},\n`;
  if (paper.pages) bibtex += `  pages     = {${paper.pages}},\n`;
  bibtex += `  doi       = {${paper.doi}},\n`;
  bibtex += `}\n`;

  return { key, bibtex, metadata: paper };
}

async function addToBibFile(bibPath, bibtexEntry, citationKey) {
  try {
    let content = '';
    if (existsSync(bibPath)) {
      content = await readFile(bibPath, 'utf-8');

      // Check for duplicate
      if (content.includes(`@article{${citationKey},`) ||
          content.includes(`@book{${citationKey},`) ||
          content.includes(`@inproceedings{${citationKey},`)) {
        return { success: false, message: `Citation key '${citationKey}' already exists` };
      }
    }

    // Add entry with blank line separator
    const newContent = content.trim() + '\n\n' + bibtexEntry;
    await writeFile(bibPath, newContent.trim() + '\n');

    return { success: true, message: `Added ${citationKey} to ${bibPath}` };
  } catch (error) {
    return { success: false, message: `Failed to write: ${error.message}` };
  }
}

async function listBibEntries(bibPath) {
  try {
    if (!existsSync(bibPath)) {
      return { entries: [], error: 'File not found' };
    }

    const content = await readFile(bibPath, 'utf-8');

    // Extract citation keys
    const keyPattern = /@\w+\{([^,]+),/g;
    const entries = [];
    let match;

    while ((match = keyPattern.exec(content)) !== null) {
      const key = match[1];

      // Extract title for this entry
      const entryStart = match.index;
      const entryEnd = content.indexOf('\n}\n', entryStart) + 3;
      const entryText = content.substring(entryStart, entryEnd);

      const titleMatch = entryText.match(/title\s*=\s*\{([^}]+)\}/i);
      const yearMatch = entryText.match(/year\s*=\s*\{?(\d{4})\}?/i);

      entries.push({
        key,
        title: titleMatch ? titleMatch[1] : 'Unknown',
        year: yearMatch ? yearMatch[1] : 'Unknown',
      });
    }

    return { entries, count: entries.length };
  } catch (error) {
    return { entries: [], error: error.message };
  }
}

// Create server
const server = new Server(
  {
    name: 'zotero-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'zotero_search',
        description: 'Search Zotero library (requires Zotero running with Better BibTeX)',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'zotero_export',
        description: 'Export a Zotero collection to BibTeX',
        inputSchema: {
          type: 'object',
          properties: {
            collection_key: {
              type: 'string',
              description: 'Zotero collection key',
            },
          },
          required: ['collection_key'],
        },
      },
      {
        name: 'doi_to_bibtex',
        description: 'Convert a DOI to BibTeX entry using CrossRef (no Zotero required)',
        inputSchema: {
          type: 'object',
          properties: {
            doi: {
              type: 'string',
              description: 'Digital Object Identifier (e.g., 10.1016/j.jacc.2023.01.001)',
            },
          },
          required: ['doi'],
        },
      },
      {
        name: 'add_citation',
        description: 'Add a BibTeX entry to a .bib file (checks for duplicates)',
        inputSchema: {
          type: 'object',
          properties: {
            bib_path: {
              type: 'string',
              description: 'Path to .bib file (e.g., paper/references.bib)',
            },
            doi: {
              type: 'string',
              description: 'DOI to add (will fetch metadata and generate BibTeX)',
            },
          },
          required: ['bib_path', 'doi'],
        },
      },
      {
        name: 'list_citations',
        description: 'List all citation keys in a .bib file',
        inputSchema: {
          type: 'object',
          properties: {
            bib_path: {
              type: 'string',
              description: 'Path to .bib file',
            },
          },
          required: ['bib_path'],
        },
      },
      {
        name: 'zotero_status',
        description: 'Check if Zotero is running with Better BibTeX',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'zotero_status') {
      const connected = await checkZoteroConnection();
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            connected,
            message: connected
              ? 'Zotero is running with Better BibTeX'
              : 'Zotero not detected. Start Zotero with Better BibTeX plugin installed.',
          }, null, 2),
        }],
      };
    }

    if (name === 'zotero_search') {
      const results = await searchZotero(args.query);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2),
        }],
      };
    }

    if (name === 'zotero_export') {
      const results = await exportCollection(args.collection_key);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2),
        }],
      };
    }

    if (name === 'doi_to_bibtex') {
      const paper = await fetchFromCrossRef(args.doi);
      if (!paper) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'DOI not found in CrossRef' }, null, 2),
          }],
        };
      }

      const result = generateBibtexFromCrossRef(paper);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result, null, 2),
        }],
      };
    }

    if (name === 'add_citation') {
      const { bib_path, doi } = args;

      // Fetch metadata
      const paper = await fetchFromCrossRef(doi);
      if (!paper) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ error: 'DOI not found in CrossRef' }, null, 2),
          }],
        };
      }

      // Generate BibTeX
      const { key, bibtex } = generateBibtexFromCrossRef(paper);

      // Add to file
      const result = await addToBibFile(bib_path, bibtex, key);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ ...result, citation_key: key, bibtex }, null, 2),
        }],
      };
    }

    if (name === 'list_citations') {
      const results = await listBibEntries(args.bib_path);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(results, null, 2),
        }],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`,
      }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Zotero MCP Server running');
}

main().catch(console.error);
