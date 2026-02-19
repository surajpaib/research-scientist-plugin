Assemble all completed paper sections into a formatted Word document.

1. Read `paper/paper.md` and `paper/context.json`.
2. Report which sections are complete and which are still empty.
3. If Introduction, Methods, Results, and Discussion are all present, proceed. Otherwise tell the user which sections are missing and which commands to run.
4. Build `paper/manuscript.docx` from `paper/paper.md` using pandoc:
   ```
   pandoc paper/paper.md --bibliography paper/references.bib --citeproc -o paper/manuscript.raw.docx
   python scripts/format_docx.py paper/manuscript.raw.docx paper/manuscript.docx
   ```
5. Confirm the file was created and provide the path.
