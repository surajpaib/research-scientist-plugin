---
name: run-analysis
description: |
  Execute analysis pipeline: feature extraction, statistical analysis, figures, validation.

  **USE WHEN:**
  - User says "run the analysis", "execute the pipeline", "generate results"
  - User says "regenerate figures", "update the figures", "make new plots"
  - User says "validate the code", "check reproducibility", "verify stats"
  - User says "extract features", "run clinical analysis", "publication stats"
  - User wants to run Python scripts in approaches/*/scripts/
  - After making changes to analysis code and needing to re-run

  **DON'T USE WHEN:**
  - User is asking about statistical methods (use statistical-methods)
  - User is creating figures manually (use figure-design)
  - User is only building the paper document (use build-paper)
  - User is writing paper content (use academic-writing)

  Trigger phrases: run analysis, execute pipeline, generate results, run scripts,
  extract features, clinical analysis, publication stats, regenerate figures,
  validate code, verify stats, "run the pipeline", "update results", --all,
  --figures, --validate, publication_figures, publication_stats
tags: [analysis, pipeline, execution, figures, validation]
---

# Run Analysis Skill

Execute the analysis pipeline: feature extraction, analysis, figures, and validation.

## Pipeline Overview

```
Feature Extraction → Clinical Analysis → Publication Stats → Publication Figures → Copy to Paper
```

## Standard Commands

### 1. Feature Extraction (one-time or after data changes)
```bash
python -m approaches.{approach}.scripts.extract_features \
    --data_path {DATA_PATH} \
    --output_path features/{approach}_features.npz
```

### 2. Main Clinical Analysis
```bash
python -m approaches.{approach}.scripts.clinical_analysis \
    --features features/{approach}_features.npz \
    --output results/analysis_results.csv
```

### 3. Publication Statistics
```bash
python -m approaches.{approach}.scripts.publication_stats \
    --scores results/analysis_results.csv \
    --output results/publication_stats.json
```

### 4. Publication Figures
```bash
python -m approaches.{approach}.scripts.publication_figures \
    --results results/analysis_results.csv \
    --output_dir results/figures/
```

### 5. Copy Figures to Paper
```bash
cp results/figures/*.pdf paper/figures/
```

## Execution Modes

| Mode | What it runs |
|------|--------------|
| Default | Steps 2-5 (assumes features exist) |
| `--all` | Steps 1-5 (full pipeline) |
| `--figures` | Steps 4-5 only |
| `--validate` | Code audit + stats verification |

## Output Tracking

After running, update:
1. `vault/Home.md` - Key metrics
2. `vault/Reference/Figure Manifest.md` - New figures
3. `vault/Logs/Session Log.md` - What was run

## Error Handling

### Script fails
1. Check error message
2. Verify data paths exist
3. Check dependencies installed
4. Review recent code changes

### Out of memory
1. Reduce batch size in config
2. Process data in chunks
3. Use memory-efficient operations

### Missing data
1. Verify paths in CLAUDE.md
2. Check external drive mounted
3. Ensure features extracted

## Validation (--validate)

### Code Audit Checks
- Seeds set for all random sources
- Dependencies documented (requirements.txt)
- No hardcoded paths
- Config separate from code

### Stats Verification
Cross-checks paper against results:
| Type | Tolerance |
|------|-----------|
| Integers (N) | Exact |
| Percentages | ±0.1% |
| P-values | ±0.001 |
| Effect sizes | ±0.01 |

## Integration

This skill works with:
- **reproducibility skill**: For setting up seeds/configs
- **quality-control skill**: For pre-submission validation
- **session-logging skill**: For recording what was run
- **figure-design skill**: For customizing figure output

## Output Format

After running, report:
```markdown
## Analysis Pipeline Complete

**Executed:** {timestamp}
**Duration:** {time}

### Scripts Run
1. `extract_features.py` - 2m 30s
2. `clinical_analysis.py` - 5m 12s
3. `publication_figures.py` - 1m 45s

### Key Metrics
| Metric | Value |
|--------|-------|
| Sample size | 928 |
| Events | 75 (8.1%) |
| C-statistic | 0.697 |

### Next Steps
- Update vault/Home.md
- Run build-paper skill
```
