#!/usr/bin/env node

/**
 * PubMed MCP Server
 *
 * Provides tools for searching PubMed and fetching paper metadata.
 * Uses NCBI E-utilities API with proper rate limiting.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const RATE_LIMIT_MS = 334; // ~3 requests per second without API key

let lastRequestTime = 0;

async function rateLimitedFetch(url) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url);
}

async function searchPubMed(query, maxResults = 10, yearStart = null, yearEnd = null) {
  let searchQuery = query;

  // Add date filter if specified
  if (yearStart && yearEnd) {
    searchQuery += ` AND ${yearStart}:${yearEnd}[dp]`;
  } else if (yearStart) {
    searchQuery += ` AND ${yearStart}:3000[dp]`;
  } else if (yearEnd) {
    searchQuery += ` AND 1900:${yearEnd}[dp]`;
  }

  const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmax=${maxResults}&retmode=json&sort=relevance`;

  const searchResponse = await rateLimitedFetch(searchUrl);
  const searchData = await searchResponse.json();

  if (!searchData.esearchresult?.idlist?.length) {
    return { papers: [], total: 0 };
  }

  const ids = searchData.esearchresult.idlist;
  const total = parseInt(searchData.esearchresult.count) || 0;

  // Fetch details for each ID
  const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
  const fetchResponse = await rateLimitedFetch(fetchUrl);
  const xmlText = await fetchResponse.text();

  // Parse XML (basic parsing)
  const papers = parseXmlToPapers(xmlText, ids);

  return { papers, total };
}

function parseXmlToPapers(xmlText, ids) {
  const papers = [];

  // Split by article
  const articles = xmlText.split(/<PubmedArticle>/g).slice(1);

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    // Extract PMID
    const pmidMatch = article.match(/<PMID[^>]*>(\d+)<\/PMID>/);
    const pmid = pmidMatch ? pmidMatch[1] : ids[i];

    // Extract title
    const titleMatch = article.match(/<ArticleTitle>([^<]+)<\/ArticleTitle>/);
    const title = titleMatch ? decodeHtmlEntities(titleMatch[1]) : 'Unknown Title';

    // Extract authors
    const authorMatches = [...article.matchAll(/<LastName>([^<]+)<\/LastName>\s*<ForeName>([^<]+)<\/ForeName>/g)];
    const authors = authorMatches.map(m => `${m[1]}, ${m[2]}`);

    // Extract journal
    const journalMatch = article.match(/<Title>([^<]+)<\/Title>/);
    const journal = journalMatch ? decodeHtmlEntities(journalMatch[1]) : '';

    // Extract year
    const yearMatch = article.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/);
    const year = yearMatch ? parseInt(yearMatch[1]) : null;

    // Extract DOI
    const doiMatch = article.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/);
    const doi = doiMatch ? doiMatch[1] : null;

    // Extract abstract
    const abstractMatch = article.match(/<AbstractText[^>]*>([^<]+)<\/AbstractText>/);
    const abstract = abstractMatch ? decodeHtmlEntities(abstractMatch[1]) : '';

    papers.push({
      pmid,
      title,
      authors,
      journal,
      year,
      doi,
      abstract: abstract.substring(0, 500) + (abstract.length > 500 ? '...' : ''),
    });
  }

  return papers;
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchPaperByPmid(pmid) {
  const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;
  const response = await rateLimitedFetch(fetchUrl);
  const xmlText = await response.text();

  const papers = parseXmlToPapers(xmlText, [pmid]);
  return papers[0] || null;
}

async function fetchPaperByDoi(doi) {
  // Search PubMed by DOI
  const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(doi)}[doi]&retmode=json`;
  const searchResponse = await rateLimitedFetch(searchUrl);
  const searchData = await searchResponse.json();

  if (!searchData.esearchresult?.idlist?.length) {
    return null;
  }

  return fetchPaperByPmid(searchData.esearchresult.idlist[0]);
}

function generateBibtex(paper) {
  if (!paper) return null;

  const firstAuthor = paper.authors[0]?.split(',')[0]?.toLowerCase().replace(/\s+/g, '') || 'unknown';
  const year = paper.year || 'XXXX';
  const keyword = paper.title.split(' ').find(w => w.length > 4)?.toLowerCase().replace(/[^a-z]/g, '') || 'paper';
  const key = `${firstAuthor}${year}${keyword}`;

  const authorStr = paper.authors.join(' and ');

  let bibtex = `@article{${key},\n`;
  bibtex += `  author    = {${authorStr}},\n`;
  bibtex += `  title     = {${paper.title}},\n`;
  bibtex += `  journal   = {${paper.journal}},\n`;
  bibtex += `  year      = {${year}},\n`;
  if (paper.doi) bibtex += `  doi       = {${paper.doi}},\n`;
  bibtex += `  pmid      = {${paper.pmid}},\n`;
  bibtex += `}\n`;

  return { key, bibtex };
}

// Create server
const server = new Server(
  {
    name: 'pubmed-server',
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
        name: 'pubmed_search',
        description: 'Search PubMed for academic papers. Returns title, authors, journal, year, DOI, PMID, and abstract snippet.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (supports PubMed syntax)',
            },
            max_results: {
              type: 'number',
              description: 'Maximum results to return (default: 10, max: 50)',
              default: 10,
            },
            year_start: {
              type: 'number',
              description: 'Filter by publication year (start)',
            },
            year_end: {
              type: 'number',
              description: 'Filter by publication year (end)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'pubmed_fetch',
        description: 'Fetch detailed paper information by PMID or DOI',
        inputSchema: {
          type: 'object',
          properties: {
            pmid: {
              type: 'string',
              description: 'PubMed ID',
            },
            doi: {
              type: 'string',
              description: 'Digital Object Identifier',
            },
          },
        },
      },
      {
        name: 'pubmed_bibtex',
        description: 'Generate BibTeX citation for a paper by PMID or DOI',
        inputSchema: {
          type: 'object',
          properties: {
            pmid: {
              type: 'string',
              description: 'PubMed ID',
            },
            doi: {
              type: 'string',
              description: 'Digital Object Identifier',
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'pubmed_search') {
      const { query, max_results = 10, year_start, year_end } = args;
      const results = await searchPubMed(query, Math.min(max_results, 50), year_start, year_end);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    if (name === 'pubmed_fetch') {
      const { pmid, doi } = args;
      let paper = null;

      if (pmid) {
        paper = await fetchPaperByPmid(pmid);
      } else if (doi) {
        paper = await fetchPaperByDoi(doi);
      } else {
        throw new Error('Either pmid or doi must be provided');
      }

      if (!paper) {
        return {
          content: [{ type: 'text', text: 'Paper not found' }],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(paper, null, 2),
          },
        ],
      };
    }

    if (name === 'pubmed_bibtex') {
      const { pmid, doi } = args;
      let paper = null;

      if (pmid) {
        paper = await fetchPaperByPmid(pmid);
      } else if (doi) {
        paper = await fetchPaperByDoi(doi);
      } else {
        throw new Error('Either pmid or doi must be provided');
      }

      if (!paper) {
        return {
          content: [{ type: 'text', text: 'Paper not found' }],
        };
      }

      const result = generateBibtex(paper);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('PubMed MCP Server running');
}

main().catch(console.error);
