---
name: figure-management
description: |
  Manage publication figures: versioning, numbering, manifest tracking, alt-text generation.

  **USE WHEN:**
  - User says "renumber the figures", "update figure numbers", "reorder figures"
  - User says "track this figure", "add figure to manifest", "update Figure Manifest"
  - User asks "which figure is which", "list all figures", "figure inventory"
  - User says "generate alt-text", "add accessibility text", "describe figure for accessibility"
  - User asks about figure versioning, "which version of figure 2"
  - User needs to manage figures across paper.md and results/figures/

  **DON'T USE WHEN:**
  - User is creating new figures (use figure-design)
  - User is running analysis pipeline (use run-analysis)
  - User is writing figure captions (use academic-writing)
  - User asks about figure style/colors (use figure-design)

  Trigger phrases: renumber figures, figure manifest, track figure, list figures,
  figure inventory, figure versioning, alt-text, accessibility, figure order,
  "which figure", "update manifest", figure versions, figure history,
  "figure 1 vs figure 2", reorder figures, figure numbering
tags: [figures, management, versioning, manifest, accessibility, numbering]
---

# Figure Management Skill

Manage publication figures: tracking, versioning, numbering, and accessibility.

## Capabilities

### 1. Figure Manifest Management

The Figure Manifest (`vault/Reference/Figure Manifest.md`) tracks all figures:

```markdown
| ID | File | Script | Description | Version | Updated |
|----|------|--------|-------------|---------|---------|
| Figure 1 | figure1_km.pdf | publication_figures.py | Kaplan-Meier curves | v3 | 2024-01-15 |
| Figure 2 | figure2_forest.pdf | publication_figures.py | Forest plot | v2 | 2024-01-14 |
```

**Adding a figure:**
```markdown
| Figure 3 | figure3_calibration.pdf | publication_figures.py | Calibration plot | v1 | YYYY-MM-DD |
```

**Updating a figure:**
- Increment version number
- Update timestamp
- Note what changed in version history section

### 2. Figure Numbering

#### Check Current Numbering
Scan paper.md for figure references:
```python
# Pattern: Figure \d+, (Figure \d+), **Figure \d+**
```

#### Renumber Figures
When figure order changes:
1. Update references in paper.md
2. Update references in supplement.md
3. Update Figure Manifest
4. Optionally rename files

**Renumbering map example:**
```
Old → New
Figure 2 → Figure 1
Figure 1 → Figure 2
Figure 3 → Figure 3 (unchanged)
```

### 3. Figure Versioning

Track figure versions in manifest:

```markdown
## Version History

### Figure 1 (Kaplan-Meier curves)
- v3 (2024-01-15): Added risk table, changed color palette
- v2 (2024-01-10): Extended follow-up to 365 days
- v1 (2024-01-05): Initial version

### Figure 2 (Forest plot)
- v2 (2024-01-14): Added subgroup analyses
- v1 (2024-01-08): Initial version
```

### 4. Alt-Text Generation

Generate accessibility descriptions for figures:

**Template:**
```markdown
**Alt-text for Figure X:**
{Type of visualization} showing {what is depicted}.
{Key finding or pattern visible}.
{Data source and sample size if relevant}.
```

**Examples:**

**Kaplan-Meier curve:**
```
Line graph showing survival probability over 365 days for high-risk (red)
and low-risk (blue) groups. The high-risk group shows significantly lower
survival (log-rank P < 0.001). Based on N=928 patients.
```

**Forest plot:**
```
Horizontal bar chart showing hazard ratios with 95% confidence intervals
for 8 body composition variables. Total adipose tissue shows the strongest
association with mortality (HR 2.27, 95% CI 1.38-3.73).
```

**Calibration plot:**
```
Scatter plot comparing predicted probabilities (x-axis) to observed
frequencies (y-axis) across 10 risk deciles. Points close to the
diagonal line indicate good calibration.
```

### 5. Figure Inventory

List all figures with status:

```markdown
## Figure Inventory

| # | Location | Status | In Paper | In Supplement |
|---|----------|--------|----------|---------------|
| 1 | results/figures/figure1_km.pdf | ✓ Current | L45 | - |
| 2 | results/figures/figure2_forest.pdf | ✓ Current | L89 | - |
| 3 | results/figures/figure3_calibration.pdf | ✓ Current | - | L23 |
| S1 | results/figures/figureS1_sensitivity.pdf | ✓ Current | - | L67 |
```

## Operations

### Add Figure to Manifest
```
1. Read vault/Reference/Figure Manifest.md
2. Add new row with: ID, File, Script, Description, Version, Date
3. Update version history section
```

### Renumber All Figures
```
1. Get desired new order from user
2. Create renumbering map
3. Update paper.md references
4. Update supplement.md references
5. Update Figure Manifest
6. Report changes made
```

### Generate Alt-Text for All Figures
```
1. List all figures from manifest
2. For each figure:
   a. Read the figure file (if image)
   b. Get context from caption in paper.md
   c. Generate accessibility description
3. Output alt-text collection
```

### Check Figure Consistency
```
1. List figures referenced in paper.md
2. List figures in results/figures/
3. List figures in Figure Manifest
4. Report any mismatches:
   - Referenced but missing
   - Present but not referenced
   - Manifest out of date
```

## Integration

Works with:
- **figure-design skill**: For creating new figures
- **run-analysis skill**: For regenerating figures
- **build-paper skill**: Ensures figures embedded correctly
- **vault-manager agent**: For updating Figure Manifest
- **quality-control skill**: Figure consistency check

## Output Format

```markdown
## Figure Management Report

### Current Inventory
- Total figures: 6 (4 main + 2 supplementary)
- All figures up to date: ✓

### Consistency Check
- All paper references resolved: ✓
- All manifest entries current: ✓
- No orphan figures: ✓

### Alt-Text Status
- Figures with alt-text: 4/6
- Missing alt-text: Figure S1, Figure S2
```
