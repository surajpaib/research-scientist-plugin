Assemble all completed paper sections into a formatted document.

1. Read `paper/paper.md` and `paper/context.json`.
2. Report which sections are complete and which are still empty.
3. If Introduction, Methods, Results, and Discussion are all present, proceed. Otherwise tell the user which sections are missing and which commands to run.
4. Read `paper_style` from `context.json`. If the field is missing, treat it as `"docx"` (backwards compatibility).

---

## Branch A: `paper_style == "docx"` (default)

Build a Word document:

```
pandoc paper/paper.md --bibliography paper/references.bib --citeproc -o paper/manuscript.raw.docx
python scripts/format_docx.py paper/manuscript.raw.docx paper/manuscript.docx
```

Update `context.json`:
- `build.docx_file = "paper/manuscript.docx"`
- `build.last_built = <today's date>`

Confirm the file was created and provide the path.

---

## Branch B: `paper_style == "mlforhealth"`

**Step 1 — Abstract check:**
Read the `abstract:` field in `paper/paper.md`. If it is still the placeholder comment (`<!-- Fill in: ...`), stop and tell the user:
> "Please fill in the `abstract:` field in `paper/paper.md` before building. ML4H submissions require a structured abstract (150–250 words)."

**Step 2 — Emit LaTeX intermediary:**
```
pandoc paper/paper.md --bibliography paper/references.bib --natbib \
       --template templates/ml4h.tex -o paper/manuscript.tex
```
Tell the user:
> "LaTeX written to `paper/manuscript.tex` — inspect or edit before the PDF is compiled."

**Step 3 — Compile PDF (triple pdflatex pass):**
```
cd paper && pdflatex -interaction=nonstopmode manuscript.tex \
         && bibtex manuscript \
         && pdflatex -interaction=nonstopmode manuscript.tex \
         && pdflatex -interaction=nonstopmode manuscript.tex
```
If compilation fails, show the last 40 lines of `paper/manuscript.log` and suggest common fixes (missing package, undefined citation key, etc.).

Update `context.json`:
- `build.tex_file = "paper/manuscript.tex"`
- `build.pdf_file = "paper/manuscript.pdf"`
- `build.last_built = <today's date>`

Confirm the PDF was created and provide the path.

---

## Branch C: `paper_style == "latex"`

Same as Branch B but use `--template templates/latex-default.tex`. No abstract check required (abstract is recommended but optional for preprints).

**Step 1 — Emit LaTeX intermediary:**
```
pandoc paper/paper.md --bibliography paper/references.bib --natbib \
       --template templates/latex-default.tex -o paper/manuscript.tex
```
Tell the user:
> "LaTeX written to `paper/manuscript.tex` — inspect or edit before the PDF is compiled."

**Step 2 — Compile PDF:**
```
cd paper && pdflatex -interaction=nonstopmode manuscript.tex \
         && bibtex manuscript \
         && pdflatex -interaction=nonstopmode manuscript.tex \
         && pdflatex -interaction=nonstopmode manuscript.tex
```
If compilation fails, show the last 40 lines of `paper/manuscript.log`.

Update `context.json`:
- `build.tex_file = "paper/manuscript.tex"`
- `build.pdf_file = "paper/manuscript.pdf"`
- `build.last_built = <today's date>`

Confirm the PDF was created and provide the path.
