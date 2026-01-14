---
name: figure-design
description: |
  Creating publication-quality scientific figures: style, colors, dimensions, captions.

  **USE WHEN:**
  - User says "create a figure", "make a Kaplan-Meier plot", "generate forest plot"
  - User asks about matplotlib/seaborn style setup for publication
  - User asks about colorblind-friendly palettes, DPI, figure dimensions
  - User needs to create ROC curves, calibration plots, multi-panel figures
  - User asks "how should I caption this figure", "what format for figures"
  - User asks about figure resolution, export formats (PDF, PNG, TIFF)

  **DON'T USE WHEN:**
  - User is writing figure captions as prose (use academic-writing)
  - User is running the full analysis pipeline (use run-analysis skill)
  - User is asking about which statistical results to show (use statistical-methods)

  Trigger phrases: create figure, publication figure, matplotlib, seaborn,
  colorblind palette, DPI, figure size, Kaplan-Meier, forest plot, ROC curve,
  calibration plot, figure caption, multi-panel figure, axis labels, 300 DPI,
  figure dimensions, Paul Tol colors, viridis, "make a plot", "style setup"
tags: [figures, visualization, publication, matplotlib, plots]
---

# Figure Design Skill

Creating publication-quality scientific figures.

## Standards

### Resolution
| Purpose | DPI |
|---------|-----|
| Screen/web | 72-150 |
| Print | 300+ |
| High quality | 600 |

### Format
- **PDF**: Vector graphics, scalable
- **PNG**: Raster with transparency
- **TIFF**: Required by some journals
- **SVG**: Web, editable

### Dimensions
- **Single column**: 3.5 inches (89 mm)
- **1.5 column**: 5 inches (127 mm)
- **Full width**: 7 inches (178 mm)

## Style Setup

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Publication defaults
plt.rcParams.update({
    # Fonts
    'font.family': 'Arial',
    'font.size': 10,
    'axes.titlesize': 11,
    'axes.labelsize': 10,
    'xtick.labelsize': 9,
    'ytick.labelsize': 9,
    'legend.fontsize': 9,

    # Figure
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'savefig.pad_inches': 0.1,

    # Axes
    'axes.spines.top': False,
    'axes.spines.right': False,
    'axes.linewidth': 0.8,

    # Lines
    'lines.linewidth': 1.5,
    'lines.markersize': 6,
})
```

## Color Palettes

### Colorblind-Friendly
```python
# Paul Tol's palette
COLORS = [
    '#0077BB',  # Blue
    '#EE7733',  # Orange
    '#009988',  # Teal
    '#CC3311',  # Red
    '#33BBEE',  # Cyan
    '#EE3377',  # Magenta
    '#BBBBBB',  # Grey
]

# Or use seaborn
sns.set_palette("colorblind")
```

### Sequential
```python
# For continuous data
cmap = plt.cm.viridis
cmap = plt.cm.Blues
```

### Diverging
```python
# For data with meaningful center
cmap = plt.cm.RdBu_r
```

## Common Figure Types

### Kaplan-Meier Curves
```python
from lifelines import KaplanMeierFitter
from lifelines.plotting import add_at_risk_counts

fig, ax = plt.subplots(figsize=(7, 5))

kmf = KaplanMeierFitter()
for name, group in df.groupby('risk_group'):
    kmf.fit(group['time'], group['event'], label=name)
    kmf.plot_survival_function(ax=ax, ci_show=True)

add_at_risk_counts(kmf, ax=ax)
ax.set_xlabel('Time (days)')
ax.set_ylabel('Survival probability')
ax.set_ylim(0, 1)
ax.legend(loc='lower left')

fig.savefig('km_curve.pdf')
```

### Forest Plot
```python
fig, ax = plt.subplots(figsize=(6, 4))

y_pos = range(len(effects))
ax.errorbar(
    effects['HR'],
    y_pos,
    xerr=[effects['HR'] - effects['CI_low'],
          effects['CI_high'] - effects['HR']],
    fmt='o',
    capsize=3,
    color=COLORS[0]
)

ax.axvline(x=1, color='gray', linestyle='--', linewidth=0.8)
ax.set_yticks(y_pos)
ax.set_yticklabels(effects['Variable'])
ax.set_xlabel('Hazard Ratio (95% CI)')

fig.savefig('forest_plot.pdf')
```

### ROC Curve
```python
from sklearn.metrics import roc_curve, auc

fig, ax = plt.subplots(figsize=(5, 5))

fpr, tpr, _ = roc_curve(y_true, y_pred)
roc_auc = auc(fpr, tpr)

ax.plot(fpr, tpr, color=COLORS[0],
        label=f'AUC = {roc_auc:.3f}')
ax.plot([0, 1], [0, 1], 'k--', linewidth=0.8)
ax.set_xlabel('False Positive Rate')
ax.set_ylabel('True Positive Rate')
ax.set_xlim([0, 1])
ax.set_ylim([0, 1])
ax.legend(loc='lower right')
ax.set_aspect('equal')

fig.savefig('roc_curve.pdf')
```

### Calibration Plot
```python
from sklearn.calibration import calibration_curve

fig, ax = plt.subplots(figsize=(5, 5))

prob_true, prob_pred = calibration_curve(y_true, y_pred, n_bins=10)

ax.plot(prob_pred, prob_true, 'o-', color=COLORS[0])
ax.plot([0, 1], [0, 1], 'k--', linewidth=0.8)
ax.set_xlabel('Predicted probability')
ax.set_ylabel('Observed frequency')
ax.set_xlim([0, 1])
ax.set_ylim([0, 1])
ax.set_aspect('equal')

fig.savefig('calibration.pdf')
```

## Multi-Panel Figures

```python
fig, axes = plt.subplots(2, 2, figsize=(7, 7))

# Label panels
for ax, label in zip(axes.flat, 'ABCD'):
    ax.text(-0.15, 1.05, label, transform=ax.transAxes,
            fontsize=12, fontweight='bold')

plt.tight_layout()
fig.savefig('multi_panel.pdf')
```

## Captions

### Structure
```markdown
**Figure 1. Title of figure.**
Brief description of what is shown.
(A) Description of panel A.
(B) Description of panel B.
Abbreviations: HR, hazard ratio; CI, confidence interval.
Statistical test or model used.
```

### Example
```markdown
**Figure 2. Forest plot of hazard ratios for mortality.**
Hazard ratios (squares) with 95% confidence intervals
(horizontal lines) for the association between body
composition metrics and 1-year mortality. The dashed
vertical line indicates HR = 1.0 (no association).
Models adjusted for age, sex, and STS risk score.
Abbreviations: HR, hazard ratio; CI, confidence interval;
SAT, subcutaneous adipose tissue; VAT, visceral adipose tissue.
```

## Quality Checklist

- [ ] Resolution ≥300 DPI
- [ ] Fonts readable at final size
- [ ] Colorblind-friendly palette
- [ ] Axes labeled with units
- [ ] Legend clear and positioned
- [ ] No overlapping elements
- [ ] Consistent style across figures
- [ ] Caption complete and accurate
