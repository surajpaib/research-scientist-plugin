Generate publication-quality figures from the analysis results.

Follow the figure-agent instructions:

1. Ask the user which style they want:
   - `nature` — minimal, Arial, no top/right spines, colorblind-safe palette (Wong 2011)
   - `openai` — rounded bars, soft colors, gridlines, modern sans-serif
   - `clinical` — Times New Roman, full box, high contrast, 600 DPI

2. Ask what figures to create (e.g. "bar chart of AUC by model", "ROC curves", "box plot by group").

3. Write a Python script that:
   - Imports and applies the style from `styles/figure_styles.py`
   - Reads from `results/analysis_output.json` or the raw data file
   - Generates each requested figure
   - Saves each as both PDF (vector) and PNG (300 DPI) in `results/figures/`

4. List the generated figures with their paths.

5. Update `paper/context.json`: set `figures_complete` to true and `figure_style` to the chosen style.

6. Tell the user: "Run `/rs:results` to write the Results section."
