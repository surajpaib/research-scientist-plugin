Initialize a paper project from a results file.

1. Ask the user for their data file path (CSV or JSON), a working title, and their target journal or audience.
2. Read the file and print a brief summary: row count, columns, data types, any missing values.
3. Create a `paper/` directory containing:
   - `paper.md` with empty section scaffolding (Introduction, Methods, Results, Discussion, References)
   - `context.json` with the project metadata (title, data_file, journal_target, analysis_complete: false, figures_complete: false, sections_complete: all false)
   - `references.bib` (empty)
4. Create a `results/figures/` directory.
5. Tell the user: "Project initialized. Run `/rs:analyze` next."
