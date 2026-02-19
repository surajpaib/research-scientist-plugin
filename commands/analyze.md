Run hypothesis-driven statistical analysis on the project's data file.

Follow the analysis-agent instructions:

1. Read `paper/context.json` to find the data file. If it doesn't exist, ask the user for the file path.
2. Load and summarize the data (rows, columns, types, missing values).
3. Ask the user: "What hypotheses do you want to test?" — wait for their answer before proceeding.
4. Propose the appropriate statistical tests with rationale. Wait for user confirmation.
5. Write and run a Python script using pandas, numpy, scipy.stats, and statsmodels.
6. Save outputs:
   - `results/analysis_output.json` — raw statistics
   - `results/findings_summary.md` — human-readable summary with key findings
   - `results/analysis_script.py` — the script (for reproducibility)
7. Update `paper/context.json`: set `analysis_complete` to true and record the hypotheses tested.
8. Tell the user: "Run `/rs:figures` to generate figures, or `/rs:results` to draft the Results section."
