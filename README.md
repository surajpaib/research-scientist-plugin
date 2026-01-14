# AI Research Scientist Plugin for Claude Code

An autonomous research assistant that helps you generate hypotheses, run experiments, analyze results, and write publication-ready papers.

## Installation

### Quick Install (One Command)

```bash
git clone git@github.com:ibro45/research-scientist.git ~/.claude/plugins/research-scientist && \
  ~/.claude/plugins/research-scientist/setup.sh && \
  ~/.claude/plugins/research-scientist/scripts/install.sh
```

Then restart Claude Code and verify:
```
/research-scientist:test
```

### What the Install Does

1. **setup.sh** - Registers the plugin in `~/.claude/settings.json`
2. **install.sh** - Installs dependencies (npm packages, Python packages)

### Manual Installation

If you prefer step-by-step:

```bash
# 1. Clone
git clone git@github.com:ibro45/research-scientist.git ~/.claude/plugins/research-scientist

# 2. Register plugin
~/.claude/plugins/research-scientist/setup.sh

# 3. Install dependencies
~/.claude/plugins/research-scientist/scripts/install.sh

# 4. Restart Claude Code
```

### Optional: Configure API Keys

For higher rate limits on literature searches:

```bash
cp ~/.claude/plugins/research-scientist/.env.template ~/.claude/plugins/research-scientist/.env
nano ~/.claude/plugins/research-scientist/.env
```

See [docs/api-keys.md](docs/api-keys.md) for details.

### Updating

```bash
cd ~/.claude/plugins/research-scientist && git pull && ./scripts/install.sh
```

### Uninstalling

```bash
rm -rf ~/.claude/plugins/research-scientist
```

Then remove the `pluginDirectories` and `enabledPlugins` entries from `~/.claude/settings.json`.

## Requirements

- **Node.js** v18+ (for MCP servers)
- **Python** 3.9+ (for analysis scripts)
- **Pandoc** 3.0+ (for document building)

Install on macOS:
```bash
brew install node python pandoc
```

## Quick Start

After installation:

1. **Create a new research project:**
   ```
   /research-scientist:new-project my-research-project
   ```

2. **Search for literature:**
   ```
   > Find papers on adipose tissue and cardiovascular outcomes
   ```

3. **Run your analysis:**
   ```
   /research-scientist:run-analysis
   ```

4. **Build your paper:**
   ```
   /research-scientist:build-paper
   ```

---

## Features

- **Multi-Agent Architecture**: Specialized agents for literature search, experiments, analysis, writing, and review
- **14 Auto-Invoked Skills**: Each with USE WHEN/DON'T USE WHEN guidance for reliable triggering
- **MCP Integration**: PubMed and Zotero servers for reliable API access
- **PHI Protection**: Programmatic hooks block access to protected health information
- **Journal Profiles**: Pre-configured requirements for JACC, Circulation, Radiology, npj Digital Medicine
- **Experiment Versioning**: Git-based branches with lineage tracking
- **Figure Management**: Versioning, numbering, alt-text generation
- **Publication-Ready Output**: Word documents with proper table formatting
- **Reproducibility Enforcement**: Config hashes, random seeds, validation hooks
- **Literature Watching**: Automated alerts for new papers
- **Team Collaboration**: Role-based approvals and feedback tracking
- **GitHub Actions CI**: Automated validation workflows

## Commands (8)

| Command | Purpose |
|---------|---------|
| `/research-scientist:new-project` | Initialize a new research project |
| `/research-scientist:new-experiment` | Create experiment with config |
| `/research-scientist:run-analysis` | Execute analysis + figures + validation |
| `/research-scientist:build-paper` | Build Word documents |
| `/research-scientist:peer-review` | AI peer review simulation |
| `/research-scientist:test` | Validate plugin setup |
| `/research-scientist:install` | Install plugin dependencies |
| `/research-scientist:watch-literature` | Check literature alerts for new papers |

## Skills (14 Auto-Invoked)

Skills are automatically loaded when Claude detects relevant context.

| Skill | Triggers On |
|-------|-------------|
| **literature-management** | "find papers on X", adding citations, DOI lookup |
| **literature-watching** | "watch for new papers", literature alerts |
| **academic-writing** | "write the methods section", editing manuscript |
| **statistical-methods** | "which test should I use", Cox vs logistic |
| **figure-design** | "create a Kaplan-Meier plot", matplotlib style |
| **figure-management** | "renumber figures", figure manifest, alt-text |
| **reproducibility** | "how do I set seeds", making code reproducible |
| **quality-control** | "verify the statistics", pre-submission audit |
| **session-logging** | "log this", "update Home.md" |
| **journal-profiles** | JACC requirements, word limits, Vancouver style |
| **experiment-versioning** | "compare EXP-001 vs EXP-002", experiment lineage |
| **collaboration** | team roles, PI approval, feedback tracking |
| **run-analysis** | "run the analysis", "regenerate figures" |
| **build-paper** | "build the paper", "make docx" |

## Agents (8)

### Orchestration Layer
1. **Research Manager** - High-level orchestration
2. **Workflow Coordinator** - Stage-by-stage research progression
3. **Vault Manager** - Persistent memory (Home.md, session logs)

### Specialized Agents
4. **Literature Agent** - Multi-source academic search
5. **Experiment Agent** - Design and execution
6. **Analysis Agent** - Statistics and visualization
7. **Writing Agent** - Paper generation
8. **Review Agent** - Peer review simulation

## MCP Servers

### PubMed Server
- `pubmed_search` - Search with filters
- `pubmed_fetch` - Get paper by PMID/DOI
- `pubmed_bibtex` - Generate BibTeX

### Zotero Server
- `doi_to_bibtex` - Convert DOI to BibTeX
- `add_citation` - Add to .bib file with duplicate check
- `list_citations` - List existing citations
- `zotero_search` - Search Zotero library

## Journal Profiles

Pre-configured profiles in `profiles/`:
- `jacc-cardiovascular-imaging.yaml`
- `circulation.yaml`
- `radiology.yaml`
- `npj-digital-medicine.yaml`

Each includes word limits, abstract format, figure requirements, reference style, and required statements.

## Project Structure Created

When you run `/research-scientist:new-project`:

```
your-project/
├── CLAUDE.md                    # Project instructions
├── .mcp.json                    # MCP server config
├── .github/workflows/           # CI/CD (optional)
├── vault/                       # Obsidian knowledge base
│   ├── Home.md                  # Dashboard
│   ├── Experiments/             # Experiment notes
│   ├── Literature/              # Paper summaries
│   ├── Reference/               # Data dictionary, decisions
│   └── Logs/                    # Session logs
├── paper/                       # Academic manuscript
│   ├── paper.md                 # Main paper
│   ├── supplement.md            # Supplementary
│   ├── references.bib           # Citations
│   └── Makefile                 # Build automation
├── experiments/                 # Experiment configs
├── results/                     # Analysis outputs
└── .experiment/                 # Git versioning metadata
```

## Documentation

- [API Keys Guide](docs/api-keys.md) - Configure rate limit increases
- [Collaboration Guide](docs/collaboration.md) - Multi-user workflows
- [CI/CD Guide](docs/ci.md) - GitHub Actions setup

## Validation Hooks

### PHI Protection
The `phi_guard.sh` hook blocks access to:
- Medical images (.nrrd, .dcm)
- Patient-level clinical data
- Segmentation directories
- Credentials and secrets

### Quality Hooks
Pre-commit and post-write hooks validate:
- YAML config reproducibility requirements
- Hardcoded paths in Python files
- Secrets in staged files
- Statistics consistency

## Updating

```bash
cd ~/.claude/plugins/research-scientist
git pull
./scripts/install.sh
```

## Uninstalling

```bash
rm -rf ~/.claude/plugins/research-scientist
```

Remove MCP server entries from `~/.claude/settings.json` if added.

## Inspiration

- [AI Scientist v2](https://arxiv.org/abs/2504.08066) - Stage-based workflow
- [Kosmos](https://arxiv.org/abs/2511.02824) - Structured world model (vault)
- [Google Co-Scientist](https://arxiv.org/abs/2502.18864) - Human approval checkpoints
- [CodeScientist](https://arxiv.org/abs/2503.22708) - Meta-analysis patterns

## License

MIT
