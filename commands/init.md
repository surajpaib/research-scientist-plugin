---
description: Initialize research-scientist infrastructure in current directory (new or existing project)
allowed-tools: Bash, Write, Read, Glob, AskUserQuestion
argument-hint: "[--force] [--minimal]"
---

# Initialize Research Project

Initialize research-scientist plugin infrastructure in the current directory. Works for both new and existing projects.

## Usage

```
/research-scientist:init [--force] [--minimal]
```

Options:
- `--force` - Overwrite existing files (default: skip existing)
- `--minimal` - Only add .claude/ config (hooks, PHI guard), skip vault/paper structure

## Behavior

**Existing project?** Adds missing infrastructure, preserves existing files.
**Empty directory?** Creates full project structure.

## What Gets Added

### Always Added (Core Infrastructure)
```
.claude/
├── hooks.json          # PHI Guard hooks (blocks access to patient data)
├── phi_config.yaml     # Customizable PHI patterns
└── settings.json       # Permissions (merged if exists)

.mcp.json               # MCP servers (PubMed, Zotero) - merged if exists
```

### Added If Missing (Full Structure)
```
vault/                  # Obsidian knowledge base
├── CLAUDE.md
├── Home.md
├── Experiments/_template.md
├── Literature/Literature Index.md
├── Reference/
│   ├── Data Dictionary.md
│   ├── Statistical Decisions.md
│   └── Figure Manifest.md
├── Archive/
└── Logs/Session Log.md

paper/                  # Academic manuscript
├── CLAUDE.md
├── paper.md
├── supplement.md
├── references.bib
├── Makefile
├── figures/
└── styles/

experiments/configs/    # Experiment configurations
results/figures/        # Analysis outputs

CLAUDE.md               # Project instructions
.gitignore              # Git ignores
```

## Steps

1. **Detect current state**
   - Check if .claude/ exists
   - Check if vault/ exists
   - Check if paper/ exists
   - Determine what needs to be created

2. **Gather project info** (if creating new structure)
   - Project name (from directory name or ask)
   - Project title
   - Brief description

3. **Add core infrastructure** (always)
   - Create/update .claude/hooks.json
   - Create .claude/phi_config.yaml (if not exists)
   - Merge .mcp.json with MCP servers

4. **Add missing structure** (unless --minimal)
   - Create vault/ if missing
   - Create paper/ if missing
   - Create experiments/ if missing
   - Skip existing files unless --force

5. **Configure PHI patterns** (interactive)
   - Ask about data locations
   - Update phi_config.yaml with project-specific patterns

6. **Report what was done**
   - List created files
   - List skipped files (already existed)
   - Show next steps

## Examples

### Initialize existing project
```
cd my-existing-project
/research-scientist:init
```
Output:
```
Initializing research-scientist in: my-existing-project

Detected existing structure:
  ✓ vault/ exists (skipping)
  ✓ paper/ exists (skipping)
  ✗ .claude/hooks.json missing

Created:
  + .claude/hooks.json (PHI Guard enabled)
  + .claude/phi_config.yaml (customize your PHI patterns)
  ~ .mcp.json (merged PubMed, Zotero servers)

PHI Guard is now active. Customize patterns in .claude/phi_config.yaml
```

### Initialize new project
```
mkdir new-study && cd new-study
/research-scientist:init
```
Output:
```
Initializing research-scientist in: new-study (empty directory)

Created full project structure:
  + .claude/hooks.json
  + .claude/phi_config.yaml
  + .mcp.json
  + vault/Home.md (and 8 other files)
  + paper/paper.md (and 6 other files)
  + experiments/configs/
  + results/figures/
  + CLAUDE.md
  + .gitignore

Next steps:
  1. Open vault/ in Obsidian
  2. Edit .claude/phi_config.yaml with your data paths
  3. Update CLAUDE.md with project details
```

### Minimal init (just hooks)
```
/research-scientist:init --minimal
```
Only adds .claude/ infrastructure, nothing else.

## PHI Configuration

After init, edit `.claude/phi_config.yaml` to add your project's PHI paths:

```yaml
# Add your project-specific PHI patterns
project_phi_patterns:
  - "/path/to/your/segmentations"
  - "*your_study_clinical*.csv"

project_allowed_patterns:
  - "your_safe_results/*"
```

## Template Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{PROJECT_NAME}}` | Directory name (kebab-case) |
| `{{PROJECT_TITLE}}` | Full title (asked or derived) |
| `{{DATE}}` | Current date (YYYY-MM-DD) |
