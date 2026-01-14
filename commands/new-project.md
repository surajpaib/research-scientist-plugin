---
description: Initialize a new research project with vault, paper, and reproducibility infrastructure
allowed-tools: Bash, Write, Read, Glob
argument-hint: [project-name] [optional: project-title]
---

# New Research Project

Initialize a complete research project structure optimized for AI-assisted scientific discovery.

## Usage

```
/research-scientist:new-project [project-name] [optional: "Project Title"]
```

Examples:
- `/research-scientist:new-project body-composition-study`
- `/research-scientist:new-project neural-scaling "Neural Scaling Laws in Vision Transformers"`

## What This Creates

```
{project-name}/
├── CLAUDE.md                    # Project instructions for Claude
├── README.md                    # Project overview
├── .gitignore                   # Git ignores (data, outputs)
│
├── vault/                       # Obsidian knowledge base
│   ├── CLAUDE.md                # Vault conventions
│   ├── Home.md                  # Project dashboard
│   ├── Experiments/             # Experiment notes
│   │   └── _template.md         # Experiment template
│   ├── Literature/              # Paper summaries
│   │   └── Literature Index.md  # Bibliography index
│   ├── Reference/               # Static documentation
│   │   ├── Data Dictionary.md   # Variable definitions
│   │   ├── Statistical Decisions.md
│   │   └── Figure Manifest.md   # Figure tracking
│   ├── Archive/                 # Versioned history
│   └── Logs/
│       └── Session Log.md       # Work log
│
├── paper/                       # Academic manuscript
│   ├── CLAUDE.md                # Paper writing guidelines
│   ├── paper.md                 # Main manuscript
│   ├── supplement.md            # Supplementary material
│   ├── overview.md              # Technical overview for PI
│   ├── references.bib           # Zotero-compatible BibTeX
│   ├── Makefile                 # Build automation
│   ├── figures/                 # Publication figures
│   ├── styles/
│   │   ├── vancouver.csl        # Citation style
│   │   └── reference.docx       # Word template
│   └── scripts/
│       └── format_docx.py       # Table formatting
│
├── experiments/                 # Experiment configs & scripts
│   └── configs/                 # YAML configurations
│
├── results/                     # Analysis outputs
│   └── figures/                 # Generated figures
│
└── .claude/                     # Claude Code config
    ├── settings.local.json      # Permissions
    └── commands/                # Project-specific commands
```

## Steps

1. **Gather project information**
   - Project name (kebab-case)
   - Project title (descriptive)
   - Brief description
   - Target journal (optional)
   - Primary outcome variable (optional)

2. **Create directory structure**
   ```bash
   mkdir -p {name}/{vault/{Experiments,Literature,Reference,Archive,Logs},paper/{figures,styles,scripts},experiments/configs,results/figures,.claude/commands}
   ```

3. **Generate files from templates**
   - Copy and customize templates from plugin's templates/ directory
   - Replace placeholders: {{PROJECT_NAME}}, {{PROJECT_TITLE}}, {{DATE}}, etc.

4. **Initialize git repository**
   ```bash
   cd {name} && git init
   ```

5. **Provide next steps**
   - Open vault/ in Obsidian
   - Configure data paths in CLAUDE.md
   - Run first literature search

## Template Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{PROJECT_NAME}}` | Project name (kebab-case) |
| `{{PROJECT_TITLE}}` | Full descriptive title |
| `{{DESCRIPTION}}` | Brief project description |
| `{{DATE}}` | Current date (YYYY-MM-DD) |
| `{{TARGET_JOURNAL}}` | Target journal name |
| `{{OUTCOME_VAR}}` | Primary outcome variable |
| `{{PROJECT_TAG}}` | Project name with underscores |

## Output

After initialization:
```
Created research project: {project-name}

Structure:
  - vault/Home.md         : Project dashboard
  - paper/paper.md        : Main manuscript
  - experiments/configs/  : Experiment configurations
  - results/figures/      : Publication figures

Next steps:
  1. Open vault/ in Obsidian
  2. Update CLAUDE.md with data paths
  3. Run: /research-scientist:search-literature [topic]
  4. Start your first experiment note
```
