---
description: Execute analysis pipeline - generates results, figures, statistics, and runs validation
allowed-tools: Bash, Read, Write, Glob, Grep
argument-hint: [optional: --all | --figures | --validate | script.py]
---

# Run Analysis

Execute the full analysis pipeline: feature extraction, analysis, figures, and validation.

## Usage

```
/research-scientist:run-analysis [target]
```

Targets:
- Default: Run main analysis + figures
- `--all`: Full pipeline (extract → analyze → figures → validate)
- `--figures`: Regenerate figures only
- `--validate`: Run code audit and verify stats
- `script_name.py`: Run specific script

Examples:
- `/research-scientist:run-analysis` - Run main pipeline
- `/research-scientist:run-analysis --all` - Everything
- `/research-scientist:run-analysis --figures` - Just figures
- `/research-scientist:run-analysis --validate` - Just validation

## Standard Pipeline

### 1. Feature Extraction (if needed)
```bash
python -m approaches.{approach}.scripts.extract_features \
    --data_path {DATA_PATH} \
    --output_path features/{approach}_features.npz
```

### 2. Main Analysis
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

### 5. Copy to Paper
```bash
cp results/figures/*.pdf paper/figures/
```

## Execution Options

### With Logging
```bash
python script.py 2>&1 | tee logs/analysis_$(date +%Y%m%d_%H%M%S).log
```

### With Timeout
```bash
timeout 3600 python script.py
```

### With Environment
```bash
source venv/bin/activate && python script.py
```

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
4. Review recent changes

### Out of memory
1. Reduce batch size
2. Process in chunks
3. Use less memory-intensive operations

### Missing data
1. Verify data paths in CLAUDE.md
2. Check file permissions
3. Ensure preprocessing completed

## Results Verification (--validate)

Auto-runs two quality checks:

### 1. Code Audit
Validates reproducibility:
- Seeds set for all random sources
- Dependencies documented
- No hardcoded paths
- Config separate from code

### 2. Stats Verification
Cross-checks paper against results:
- Sample sizes match
- Effect sizes match (within tolerance)
- P-values match
- All statistics traceable

### Tolerance Rules
| Statistic Type | Tolerance |
|----------------|-----------|
| Integers (N) | Exact |
| Percentages | ±0.1% |
| P-values | ±0.001 |
| Effect sizes | ±0.01 |

## Output Format

```markdown
## Analysis Pipeline Complete

**Executed:** {timestamp}
**Duration:** {time}

### Scripts Run
1. `extract_features.py` - 2m 30s
2. `clinical_analysis.py` - 5m 12s
3. `publication_figures.py` - 1m 45s

### Outputs Generated
- `results/analysis_results.csv` (928 rows)
- `results/publication_stats.json`
- `results/figures/` (6 figures)

### Key Metrics
| Metric | Value |
|--------|-------|
| Sample size | 928 |
| Events | 75 (8.1%) |
| C-statistic | 0.697 |
| Primary HR | 2.27 |

### Figures Copied to Paper
- figure1_kaplan_meier.pdf
- figure2_forest_plot.pdf
- ...

### Validation Results
- Code audit: PASS (3 warnings)
- Stats verification: PASS (24/24 matched)

### Next Steps
- Update `vault/Home.md`
- Run `/research-scientist:build-paper`
```
