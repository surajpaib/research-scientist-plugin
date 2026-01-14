---
name: quality-control
description: |
  Code audit and statistics verification for reproducible research before submission.

  **USE WHEN:**
  - User says "verify the statistics", "check the numbers in the paper"
  - User says "audit the code", "check for reproducibility issues"
  - User is preparing for submission and needs pre-submission checklist
  - User asks "do the paper stats match the results?", "are my numbers correct?"
  - User wants to validate that seeds are set, paths aren't hardcoded
  - Before building final paper for submission

  **DON'T USE WHEN:**
  - User is actively writing statistics (use statistical-methods)
  - User is running new analysis (use run-analysis skill)
  - User is setting up reproducibility for new experiment (use reproducibility)
  - Just building paper without verification (use build-paper skill)

  Trigger phrases: verify stats, check statistics, code audit, validate code,
  reproducibility check, check paper numbers, verify results, audit analysis,
  pre-submission check, quality check, "do the numbers match", "check my code",
  "ready to submit", STROBE checklist, TRIPOD checklist
tags: [quality, validation, reproducibility, audit, verification, submission]
---

# Quality Control Skill

Ensures code reproducibility and paper accuracy.

## Code Audit Checklist

### 1. Reproducibility

**Random Seeds:**
```python
# All random sources must be seeded
random.seed(42)
np.random.seed(42)
torch.manual_seed(42)
```

Check for:
- [ ] Seeds set in all scripts
- [ ] Seeds documented in config
- [ ] Seeds reported in paper methods

**Environment:**
- [ ] `requirements.txt` or `environment.yml` exists
- [ ] Versions pinned (not `>=`, use `==`)
- [ ] Python version specified

**Configuration:**
- [ ] Config files separate from code
- [ ] No hardcoded paths (`/Users/...`)
- [ ] Config hash generated for experiments

### 2. Code Quality

**Structure:**
- [ ] Clear directory organization
- [ ] Modular functions (<50 lines each)
- [ ] Docstrings present

**Error Handling:**
- [ ] Input validation
- [ ] Graceful failures
- [ ] Informative error messages

### 3. Data Handling

**Paths:**
- [ ] Configurable data paths
- [ ] Path existence checks
- [ ] No hardcoded absolute paths

**Integrity:**
- [ ] Missing data documented
- [ ] Outliers addressed
- [ ] Data types validated

## Statistics Verification

### What to Check

Cross-check all statistics in `paper/paper.md` against `results/`:

| Statistic Type | Where to Find | Tolerance |
|----------------|---------------|-----------|
| Sample size (N) | publication_stats.json | Exact |
| Event counts | publication_stats.json | Exact |
| Percentages | publication_stats.json | ±0.1% |
| Hazard ratios | publication_stats.json | ±0.01 |
| P-values | publication_stats.json | ±0.001 |
| C-statistics | publication_stats.json | ±0.001 |
| Confidence intervals | publication_stats.json | ±0.01 |

### Verification Process

1. **Extract paper statistics:**
   - Parse paper.md for patterns like `N = 928`, `HR 2.27`
   - Note line numbers for each statistic

2. **Load results:**
   - Read `results/publication_stats.json`
   - Cross-reference with `vault/Home.md`

3. **Compare values:**
   - Check within tolerance
   - Flag mismatches with line numbers

4. **Report:**
   ```markdown
   ## Statistics Verification Report

   **Status:** PASS / FAIL
   **Checked:** 24 statistics
   **Matched:** 24
   **Mismatched:** 0

   ### Details
   | Location | Paper | Results | Status |
   |----------|-------|---------|--------|
   | L45 | N=928 | 928 | ✓ |
   | L67 | HR 2.27 | 2.27 | ✓ |
   ```

### Common Issues

**Rounding differences:**
- Paper rounds to 2 decimals, results have more
- Solution: Standardize rounding in results generation

**Stale results:**
- Paper updated but results not regenerated
- Solution: Re-run `/research-scientist:run-analysis`

**Missing mappings:**
- Statistic in paper not in results file
- Solution: Add to `publication_stats.json` with source

## Pre-Submission Checklist

Run before submitting paper:

- [ ] All statistics verified
- [ ] Code audit passed
- [ ] Seeds documented in methods
- [ ] Data availability statement present
- [ ] References all resolve
- [ ] Figures are 300+ DPI
- [ ] Tables have proper formatting
- [ ] Abbreviations defined on first use

## Integration

This skill is automatically invoked by:
- `/research-scientist:run-analysis --validate`
- `/research-scientist:build-paper --verify`

## Audit Report Template

```markdown
# Quality Control Report

**Date:** YYYY-MM-DD
**Status:** PASS / WARN / FAIL

## Code Audit
- Reproducibility: PASS
- Code Quality: PASS (2 warnings)
- Data Handling: PASS

## Statistics Verification
- Total checked: 24
- Matched: 24
- Mismatched: 0

## Warnings
1. Missing docstring in `analyze.py:45`
2. TODO comment in `figures.py:89`

## Recommendations
1. Add docstrings to utility functions
2. Remove TODO or create issue
```
