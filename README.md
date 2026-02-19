# Research Scientist Plugin for Claude

Turn your results file into a publication-ready paper. You bring a CSV or JSON — the plugin handles analysis, figures, and writing.

## Installation

```bash
# 1. Clone the repo anywhere you like
git clone git@github.com:ibro45/research-scientist.git ~/research-scientist

# 2. Run the install script — installs dependencies and registers the plugin
~/research-scientist/scripts/install.sh

# 3. Restart Claude Code
# Commands are now available in every session — no flags needed
```

To verify it worked:
```bash
claude plugin list
# should show: rs
```

---

## Quick start

```
cd my-project/
/rs:start
```

That's it. The plugin will ask you for your data file and walk you through the rest.

---

## Commands

All commands use the `/rs:` prefix.

### `/rs:start`
Initialize a paper project. Provide your results file (CSV or JSON) and a working title. The plugin reads your data, shows a summary, and sets up the `paper/` folder.

```
/rs:start
> What's your data file? → results/model_comparison.csv
> Working title? → "Scaling laws in protein structure prediction"
> Intended journal? → Nature Methods
```

**Creates:** `paper/paper.md`, `paper/context.json`, `paper/references.bib`

---

### `/rs:analyze`
Run hypothesis-driven statistical analysis. You tell Claude what you want to test — it proposes the right statistical tests, asks for your approval, runs them, and writes up the findings.

```
/rs:analyze
> What do you want to test?
→ "Does model A outperform B on AUROC across all datasets?"
→ "Is performance correlated with dataset size?"
```

Claude will:
1. Show you the proposed tests and rationale
2. Ask for confirmation before running
3. Run the analysis (Python / scipy / statsmodels)
4. Write `results/findings_summary.md` with all statistics

**Output files:**
- `results/findings_summary.md` — human-readable results
- `results/analysis_output.json` — raw stats (machine-readable)
- `results/analysis_script.py` — the script that ran (reproducibility)

---

### `/rs:figures`
Generate publication-quality figures. You choose a visual style and describe what to plot.

```
/rs:figures
> Style? → nature   (or: openai, clinical)
> What figures? → "Bar chart of AUROC by model, ROC curves for all models"
```

**Built-in styles:**

| Style | Look | Use for |
|---|---|---|
| `nature` | Minimal, Arial, 7pt, no top/right spines | Nature, Science, Cell, PNAS |
| `openai` | Rounded bars, soft colors, gridlines | Tech reports, NeurIPS, ICML |
| `clinical` | Times New Roman, full box, high contrast | NEJM, JAMA, JACC, Circulation |

Figures are saved as both PDF (vector, for editing in Illustrator) and PNG (300 DPI, for submission).

**Output:** `results/figures/figure1.pdf`, `figure1.png`, `figure2.pdf`, ...

---

### `/rs:results`
Write the Results section. Claude reads your findings and figures, shows you what it plans to write, and waits for your go-ahead.

```
/rs:results
> Ready to write Results covering 2 hypotheses and 3 figures. Proceed? → yes
```

The Results section is inserted directly into `paper/paper.md`.

---

### `/rs:intro`
Search the web for related work and write the Introduction. Claude searches Semantic Scholar, PubMed, OpenAlex, and arXiv, compiles 6–10 references, shows them to you, then writes the Introduction with inline citations.

```
/rs:intro
> I'll search for work on [your topic]. Correct focus? → yes
> Found 8 papers. Ready to write? → yes
```

References are appended to `paper/references.bib` automatically.

---

### `/rs:discussion`
Write the Discussion connecting Introduction and Results. Requires both sections to be complete first.

```
/rs:discussion
> Ready to write Discussion connecting intro + results. Proceed? → yes
```

Claude will also ask if you have specific limitations to include.

---

### `/rs:methods`
Populate the Methods section through a guided Q&A. Claude asks about study design, data, statistical choices, software, and ethics — then writes the section.

```
/rs:methods
> What type of study is this? → ML benchmark
> What datasets were used? → MIMIC-IV, PhysioNet 2021
> What software? → Python 3.11, scipy 1.11, scikit-learn 1.3
> ...
```

---

### `/rs:build`
Assemble all completed sections into a formatted Word document.

```
/rs:build
> ✓ Introduction, Methods, Results, Discussion — all present
> Saved: paper/manuscript.docx
```

---

## Typical workflow

```
/rs:start      →  Load data, set up project
/rs:analyze    →  Test your hypotheses
/rs:figures    →  Generate figures (choose style)
/rs:results    →  Write Results section
/rs:intro      →  Web research + write Introduction
/rs:discussion →  Write Discussion
/rs:methods    →  Guided Q&A → write Methods
/rs:build      →  Assemble Word document
```

Every step checks with you before writing. You can run steps in any order, or jump straight to a section if you've already done the earlier work.

---

## Project structure

After `/rs:start`:

```
your-project/
├── paper/
│   ├── paper.md               # The manuscript (sections filled in-place)
│   ├── context.json           # Project state (read by each command)
│   └── references.bib         # BibTeX (populated by /rs:intro)
└── results/
    ├── findings_summary.md    # Human-readable analysis output
    ├── analysis_output.json   # Raw statistics
    ├── analysis_script.py     # Reproducible analysis script
    └── figures/
        ├── figure1.pdf
        ├── figure1.png
        └── ...
```

---

## Figure styles

The style presets live in `styles/figure_styles.py` and can be used in any Python script independently of the plugin:

```python
from styles.figure_styles import apply_style, COLORS, FIG_SIZE

apply_style("nature")   # call before any plt plotting

fig, ax = plt.subplots(figsize=FIG_SIZE["nature"]["single"])
ax.bar(x, y, color=COLORS["nature"][0])
```

Preview all three styles as a side-by-side demo:
```bash
python styles/figure_styles.py nature
python styles/figure_styles.py openai
python styles/figure_styles.py clinical
```

The `openai` style includes a `rounded_bar()` helper for the characteristic rounded-top bar charts:
```python
from styles.figure_styles import rounded_bar
rounded_bar(ax, x=0, height=0.85, color=COLORS["openai"][0])
```

---

## Agents

| Agent | Handles |
|---|---|
| `paper-orchestrator` | `/rs:start`, `/rs:build` |
| `analysis-agent` | `/rs:analyze` |
| `figure-agent` | `/rs:figures` |
| `writing-agent` | `/rs:results`, `/rs:intro`, `/rs:discussion`, `/rs:methods` |
| `literature-agent` | Called internally during `/rs:intro` |

---

## PHI protection

The PHI Guard hook silently blocks reads to files matching protected patterns. Configure in `.claude/phi_config.yaml`:

```yaml
phi_patterns:
  - "*.nrrd"
  - "*clinical*.csv"
  - "*patient*.csv"
  - "/Volumes/*/Segmentations*"

allowed_patterns:
  - "results/*"
  - "paper/*"
```

---

## Updating

```bash
cd ~/.claude/plugins/research-scientist
git pull
./scripts/install.sh
```

---

## License

MIT
