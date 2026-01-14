---
description: Generate AI peer review of the current paper draft
allowed-tools: Read, Write, Glob
argument-hint: [optional: --strict or --quick]
---

# AI Peer Review

Simulate rigorous academic peer review of the manuscript following journal/conference review standards.

## Usage

```
/research-scientist:peer-review [options]
```

Options:
- `--strict`: Apply top-tier journal standards
- `--quick`: Focus on major issues only
- Default: Comprehensive review

## Review Dimensions

### 1. Soundness (1-10)
- Methods appropriate for research question?
- Statistical tests correctly applied?
- Conclusions supported by data?
- Limitations addressed?

### 2. Presentation (1-10)
- Clearly written?
- Logical structure?
- Figures/tables informative?
- Methods sufficiently detailed?

### 3. Contribution (1-10)
- Advances the field?
- Important problem?
- Significant results?
- Comparison to prior work?

### 4. Reproducibility (1-10)
- Methods replicable?
- Data availability stated?
- Code availability mentioned?
- Seeds/parameters reported?

## Files to Review

1. `paper/paper.md` - Main manuscript
2. `paper/supplement.md` - Supplementary material
3. `paper/figures/` - All figures
4. `vault/Reference/Statistical Decisions.md` - Method choices

## Review Process

### Step 1: Read Full Paper
- Abstract for overview
- Introduction for claims
- Methods for rigor
- Results for evidence
- Discussion for interpretation

### Step 2: Score Each Dimension
- 1-3: Major issues, reject
- 4-5: Significant concerns
- 6-7: Accept with revisions
- 8-9: Strong, minor issues
- 10: Exceptional

### Step 3: Identify Issues
- Major issues (must fix)
- Minor issues (should fix)
- Suggestions (could improve)

### Step 4: Write Report

## Output Format

```markdown
# Peer Review: {Paper Title}

**Reviewed:** {timestamp}
**Mode:** {standard/strict/quick}

## Summary

{2-3 sentence summary}

## Scores

| Dimension | Score | Assessment |
|-----------|-------|------------|
| Soundness | X/10 | {brief} |
| Presentation | X/10 | {brief} |
| Contribution | X/10 | {brief} |
| Reproducibility | X/10 | {brief} |
| **Overall** | **X/10** | |

**Recommendation:** Accept / Minor Revision / Major Revision / Reject

## Strengths

1. **{Strength 1}**: {why it's good}
2. **{Strength 2}**: {why it's good}
3. **{Strength 3}**: {why it's good}

## Major Issues

### Issue 1: {Title}
- **Problem:** {what's wrong}
- **Impact:** {why it matters}
- **Solution:** {how to fix}

### Issue 2: {Title}
...

## Minor Issues

1. **{Issue}**: {description} → {suggestion}
2. **{Issue}**: {description} → {suggestion}

## Section-by-Section Comments

### Abstract
- {specific feedback}

### Introduction
- {specific feedback}

### Methods
- {specific feedback}

### Results
- {specific feedback}

### Discussion
- {specific feedback}

### Figures/Tables
- Figure 1: {feedback}
- Table 1: {feedback}

## Reproducibility Checklist

- [ ] Methods described sufficiently
- [ ] Data source stated
- [ ] Code availability mentioned
- [ ] Software versions listed
- [ ] Random seeds reported
- [ ] Preprocessing documented

## Questions for Authors

1. {Question about methodology}
2. {Question about interpretation}

## Priority Actions

1. **High:** {what to fix first}
2. **Medium:** {what to fix next}
3. **Low:** {nice to have}
```

## Common Issues Checked

### Statistical
- P-hacking / multiple testing
- Inappropriate test selection
- Overfitting
- Missing confidence intervals

### Methodological
- Selection bias
- Unaddressed confounding
- Inadequate sample size

### Presentation
- Missing method details
- Hard-to-read figures
- Inconsistent terminology

### Claims
- Overclaiming from limited data
- Ignoring contradictory evidence

## Output Location

Review saved to: `vault/Reference/Peer Review {date}.md`
