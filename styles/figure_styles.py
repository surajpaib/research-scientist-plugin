"""
figure_styles.py — Publication figure style presets for the research-scientist plugin.

Usage:
    from styles.figure_styles import apply_style, COLORS, FIG_SIZE

    apply_style("nature")   # Nature / Science
    apply_style("openai")   # OpenAI tech report
    apply_style("clinical") # Clinical / medical journals

    fig, ax = plt.subplots(figsize=FIG_SIZE["nature"]["single"])
    ax.bar(x, y, color=COLORS["nature"][0])
"""

import matplotlib.pyplot as plt
import matplotlib as mpl
import matplotlib.patches as mpatches
import numpy as np


# ---------------------------------------------------------------------------
# Color palettes
# ---------------------------------------------------------------------------

COLORS = {
    # Wong (2011) colorblind-safe palette — standard for Nature/Science
    "nature": [
        "#0072B2",  # blue
        "#E69F00",  # orange
        "#009E73",  # green
        "#D55E00",  # vermilion
        "#CC79A7",  # pink
        "#56B4E9",  # sky blue
        "#F0E442",  # yellow
        "#000000",  # black
    ],
    # Soft, modern palette — OpenAI tech report style
    "openai": [
        "#4A90D9",  # medium blue
        "#F5A623",  # amber
        "#7ED321",  # green
        "#D0021B",  # red
        "#9B59B6",  # purple
        "#1ABC9C",  # teal
        "#E74C3C",  # coral
        "#95A5A6",  # grey
    ],
    # High-contrast, grayscale-safe — clinical journals (NEJM, JAMA, Lancet)
    "clinical": [
        "#000000",  # black
        "#444444",  # dark grey
        "#888888",  # mid grey
        "#BBBBBB",  # light grey
        "#1F77B4",  # blue (for colour figures)
        "#D62728",  # red
        "#2CA02C",  # green
        "#FF7F0E",  # orange
    ],
}

# ---------------------------------------------------------------------------
# Figure sizes (width in inches)
# ---------------------------------------------------------------------------

FIG_SIZE = {
    "nature": {
        "single": (3.5, 2.8),    # single column
        "double": (7.2, 5.0),    # double column / full width
        "half":   (3.5, 3.5),    # square single column
    },
    "openai": {
        "single": (6.0, 4.0),
        "double": (10.0, 6.0),
        "wide":   (12.0, 4.5),   # side-by-side panels
    },
    "clinical": {
        "single": (3.3, 2.8),
        "double": (6.8, 4.5),
        "half":   (3.3, 3.3),
    },
}

# ---------------------------------------------------------------------------
# Style application functions
# ---------------------------------------------------------------------------

def apply_nature():
    """
    Nature / Science style.
    Clean, minimal. No top/right spines. Arial, 7pt base font.
    Use for: Nature, Science, Cell, PNAS, Nature Methods, etc.
    """
    plt.rcParams.update({
        # Font
        "font.family":       "sans-serif",
        "font.sans-serif":   ["Arial", "Helvetica", "DejaVu Sans"],
        "font.size":         7,
        "axes.titlesize":    8,
        "axes.titleweight":  "normal",
        "axes.labelsize":    7,
        "xtick.labelsize":   6,
        "ytick.labelsize":   6,
        "legend.fontsize":   6,
        "legend.frameon":    False,
        # Lines and axes
        "axes.linewidth":    0.75,
        "axes.spines.top":   False,
        "axes.spines.right": False,
        "xtick.major.width": 0.75,
        "ytick.major.width": 0.75,
        "xtick.major.size":  3.0,
        "ytick.major.size":  3.0,
        "lines.linewidth":   1.0,
        # Grid
        "axes.grid":         False,
        # Colors
        "figure.facecolor":  "white",
        "axes.facecolor":    "white",
        # Output
        "figure.dpi":        300,
        "savefig.dpi":       300,
        "savefig.bbox":      "tight",
        "savefig.transparent": False,
        "pdf.fonttype":      42,   # embed fonts for editing in Illustrator
        "ps.fonttype":       42,
    })
    # Set default color cycle
    mpl.rcParams["axes.prop_cycle"] = mpl.cycler(color=COLORS["nature"])


def apply_openai():
    """
    OpenAI tech report style.
    Modern, clean. Soft gridlines, no top/right/left/bottom spines on grid plots.
    Rounded bars via the rounded_bar() helper. Inter/Helvetica Neue font.
    Use for: Technical reports, preprints, NeurIPS, ICML, ICLR.
    """
    plt.rcParams.update({
        # Font — fall back gracefully if Inter isn't installed
        "font.family":       "sans-serif",
        "font.sans-serif":   ["Inter", "Helvetica Neue", "Arial", "DejaVu Sans"],
        "font.size":         11,
        "axes.titlesize":    13,
        "axes.titleweight":  "semibold",
        "axes.labelsize":    11,
        "xtick.labelsize":   10,
        "ytick.labelsize":   10,
        "legend.fontsize":   10,
        "legend.frameon":    False,
        # Axes — no border, rely on grid for reference
        "axes.linewidth":    0,
        "axes.spines.top":   False,
        "axes.spines.right": False,
        "axes.spines.left":  False,
        "axes.spines.bottom":False,
        "xtick.bottom":      False,
        "ytick.left":        False,
        # Grid
        "axes.grid":         True,
        "axes.grid.axis":    "y",
        "grid.color":        "#EFEFEF",
        "grid.linewidth":    1.0,
        "axes.axisbelow":    True,
        # Colors
        "figure.facecolor":  "white",
        "axes.facecolor":    "white",
        "patch.linewidth":   0,
        # Lines
        "lines.linewidth":   2.0,
        # Output
        "figure.dpi":        150,
        "savefig.dpi":       300,
        "savefig.bbox":      "tight",
        "pdf.fonttype":      42,
        "ps.fonttype":       42,
    })
    mpl.rcParams["axes.prop_cycle"] = mpl.cycler(color=COLORS["openai"])


def apply_clinical():
    """
    Clinical / medical journal style.
    Times New Roman, high contrast, print-safe.
    Use for: NEJM, JAMA, Lancet, JACC, Circulation, Radiology.
    """
    plt.rcParams.update({
        # Font
        "font.family":       "serif",
        "font.serif":        ["Times New Roman", "Times", "DejaVu Serif"],
        "font.size":         9,
        "axes.titlesize":    10,
        "axes.titleweight":  "bold",
        "axes.labelsize":    9,
        "xtick.labelsize":   8,
        "ytick.labelsize":   8,
        "legend.fontsize":   8,
        "legend.frameon":    True,
        "legend.edgecolor":  "black",
        "legend.linewidth":  0.5,
        # Axes — full box like clinical journals
        "axes.linewidth":    0.8,
        "axes.spines.top":   True,
        "axes.spines.right": True,
        "xtick.major.width": 0.8,
        "ytick.major.width": 0.8,
        "xtick.major.size":  4.0,
        "ytick.major.size":  4.0,
        "xtick.direction":   "in",
        "ytick.direction":   "in",
        "lines.linewidth":   1.0,
        # Grid
        "axes.grid":         False,
        # Colors
        "figure.facecolor":  "white",
        "axes.facecolor":    "white",
        "patch.edgecolor":   "black",
        "patch.linewidth":   0.5,
        # Output — 600 DPI for print submission
        "figure.dpi":        300,
        "savefig.dpi":       600,
        "savefig.bbox":      "tight",
        "pdf.fonttype":      42,
        "ps.fonttype":       42,
    })
    mpl.rcParams["axes.prop_cycle"] = mpl.cycler(color=COLORS["clinical"])


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

_STYLE_MAP = {
    "nature":   apply_nature,
    "openai":   apply_openai,
    "clinical": apply_clinical,
}


def apply_style(style: str):
    """
    Apply a named figure style globally.

    Parameters
    ----------
    style : str
        One of "nature", "openai", or "clinical".

    Example
    -------
    >>> from styles.figure_styles import apply_style
    >>> apply_style("nature")
    >>> import matplotlib.pyplot as plt
    >>> fig, ax = plt.subplots()
    """
    style = style.lower().strip()
    if style not in _STYLE_MAP:
        raise ValueError(
            f"Unknown style '{style}'. Choose from: {', '.join(_STYLE_MAP.keys())}"
        )
    _STYLE_MAP[style]()
    print(f"[figure_styles] Applied '{style}' style.")


# ---------------------------------------------------------------------------
# OpenAI rounded bar helper
# ---------------------------------------------------------------------------

def rounded_bar(ax, x, height, width=0.6, color="#4A90D9", radius=0.04, **kwargs):
    """
    Draw a single bar with rounded top corners (OpenAI style).

    Parameters
    ----------
    ax : matplotlib.axes.Axes
    x : float — center position of the bar
    height : float — bar height
    width : float — bar width (default 0.6)
    color : str — fill color
    radius : float — corner rounding radius (in data units; adjust to your y-scale)

    Example
    -------
    >>> fig, ax = plt.subplots()
    >>> apply_style("openai")
    >>> for i, (label, val) in enumerate(zip(labels, values)):
    ...     rounded_bar(ax, i, val, color=COLORS["openai"][i])
    >>> ax.set_xticks(range(len(labels)))
    >>> ax.set_xticklabels(labels)
    """
    from matplotlib.patches import FancyBboxPatch
    bar = FancyBboxPatch(
        (x - width / 2, 0),
        width,
        height,
        boxstyle=f"round,pad=0,rounding_size={radius}",
        facecolor=color,
        **kwargs,
    )
    ax.add_patch(bar)
    ax.autoscale_view()
    return bar


# ---------------------------------------------------------------------------
# Quick demo (run this file directly to preview styles)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    style = sys.argv[1] if len(sys.argv) > 1 else "nature"
    apply_style(style)

    np.random.seed(42)
    categories = ["A", "B", "C", "D", "E"]
    values = np.random.uniform(0.5, 1.0, len(categories))
    errors = np.random.uniform(0.02, 0.08, len(categories))

    fig, axes = plt.subplots(1, 3, figsize=FIG_SIZE[style]["double"])

    # Panel 1: bar chart
    ax = axes[0]
    if style == "openai":
        for i, (v, c) in enumerate(zip(values, COLORS[style])):
            rounded_bar(ax, i, v, color=c)
        ax.set_xticks(range(len(categories)))
        ax.set_xticklabels(categories)
    else:
        ax.bar(categories, values, color=COLORS[style][:len(categories)])
    ax.set_title("Bar Chart")
    ax.set_ylabel("Score")

    # Panel 2: line chart with error bands
    ax = axes[1]
    x = np.linspace(0, 4, 50)
    for i in range(3):
        y = np.sin(x + i) + i * 0.3
        ax.plot(x, y, color=COLORS[style][i], label=f"Group {i+1}")
    ax.set_title("Line Chart")
    ax.legend()

    # Panel 3: scatter
    ax = axes[2]
    for i in range(3):
        ax.scatter(
            np.random.randn(20), np.random.randn(20),
            color=COLORS[style][i], alpha=0.7, label=f"Condition {i+1}"
        )
    ax.set_title("Scatter Plot")
    ax.legend()

    fig.suptitle(f"Style: {style}", fontsize=10)
    plt.tight_layout()
    plt.savefig(f"style_preview_{style}.pdf")
    plt.savefig(f"style_preview_{style}.png", dpi=300)
    print(f"Saved style_preview_{style}.pdf and .png")
