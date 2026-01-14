---
name: build-paper
description: |
  Build publication-ready Word documents from markdown with proper table formatting.

  **USE WHEN:**
  - User says "build the paper", "generate Word document", "make docx"
  - User says "build supplement", "build overview", "build all documents"
  - User says "compile the manuscript", "export to Word"
  - User asks to run Pandoc on paper.md, supplement.md, or overview.md
  - After editing paper.md and wanting to see the formatted output

  **DON'T USE WHEN:**
  - User is writing paper content (use academic-writing)
  - User is running analysis (use run-analysis)
  - User is verifying statistics (use quality-control first, then build)
  - User asks about journal requirements (use journal-profiles)

  Trigger phrases: build paper, generate docx, make Word document, compile paper,
  export Word, pandoc, build supplement, build overview, build all, format tables,
  "create docx", "generate manuscript", paper.docx, supplement.docx
tags: [build, paper, docx, pandoc, manuscript, export]
---

# Build Paper Skill

Build publication-ready Word documents from markdown with proper table formatting.

## Build Targets

| Target | Input | Output |
|--------|-------|--------|
| paper | paper.md | paper.docx |
| supplement | supplement.md | supplement.docx |
| overview | overview.md | overview.docx |
| all | all .md files | all .docx files |

## Two-Step Build Process

### Step 1: Pandoc Conversion
```bash
cd paper

pandoc paper.md -o paper.raw.docx \
  --citeproc \
  --bibliography=references.bib \
  --csl=styles/vancouver.csl \
  --reference-doc=styles/reference.docx \
  --resource-path=.:figures \
  --dpi=600
```

### Step 2: Table Formatting
```bash
python scripts/format_docx.py paper.raw.docx paper.docx
rm paper.raw.docx
```

## Using Makefile

```bash
cd paper
make docx        # Main paper only
make supplement  # Supplementary material
make overview    # Technical overview
make all         # All documents
make check       # Validate citations
make wordcount   # Count words
make clean       # Remove generated files
```

## Table Formatting Applied

The `format_docx.py` script applies:
- Single-line black borders on all cells
- 6.5" table width (fits 1" margins)
- Bold header rows
- Consistent cell padding
- Center alignment

## Prerequisites

1. **Pandoc**: `brew install pandoc`
2. **python-docx**: `pip install python-docx`
3. **Citation style**: `styles/vancouver.csl`
4. **Reference template**: `styles/reference.docx`

## Build with Verification

Recommended before submission:
```bash
# First verify statistics
/research-scientist:run-analysis --validate

# Then build
cd paper && make all
```

## Troubleshooting

### Missing citations
```bash
make check  # Lists undefined citation keys
```
Fix by adding missing entries to `references.bib`.

### Low-resolution figures
Ensure `--dpi=600` in Pandoc options.

### Tables without borders
Verify `format_docx.py` ran after Pandoc.

### Missing reference template
Create `styles/reference.docx` with proper styles.

## Word Count

```bash
make wordcount
```

Reports word count excluding:
- YAML frontmatter
- Code blocks
- Tables (counted separately)

## Citation Validation

```bash
make check
```

Reports:
- Undefined citation keys
- Unused references
- Duplicate entries

## Output Format

After building, report:
```markdown
## Build Complete

**Document:** paper.docx
**Word count:** 4,523 words
**Tables:** 3
**Figures:** 4
**Citations:** 42

### Validation
- [ ] Word count within limit
- [ ] All citations resolved
- [ ] Figures embedded correctly
- [ ] Tables formatted properly
```

## Integration

This skill works with:
- **quality-control skill**: Run --validate before final build
- **journal-profiles skill**: Check requirements before building
- **academic-writing skill**: For editing content before building
- **session-logging skill**: Log successful builds
