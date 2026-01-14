---
description: Build Word documents with proper table formatting - includes paper, supplement, and PI overview
allowed-tools: Bash, Read, Write, Glob
argument-hint: [optional: paper|supplement|overview|all|--verify]
---

# Build Paper

Build publication-ready Word documents from markdown with proper table formatting (borders, widths).

## Usage

```
/research-scientist:build-paper [target]
```

Targets:
- `paper` - Build main paper (default)
- `supplement` - Build supplementary material
- `overview` - Build technical overview for PI review
- `all` - Build all documents
- `--verify` - Verify stats before building (recommended)

Examples:
- `/research-scientist:build-paper` - Main paper only
- `/research-scientist:build-paper all` - Everything
- `/research-scientist:build-paper all --verify` - Verify + build all
- `/research-scientist:build-paper overview` - PI summary only

## Build Process

### Two-Step Process for Proper Tables

1. **Pandoc conversion** - Markdown to raw DOCX
2. **Python formatting** - Add table borders and set widths

```bash
cd paper

# Step 1: Pandoc conversion
pandoc paper.md -o paper.raw.docx \
  --citeproc \
  --bibliography=references.bib \
  --csl=styles/vancouver.csl \
  --reference-doc=styles/reference.docx \
  --resource-path=.:figures \
  --dpi=600

# Step 2: Format tables
python scripts/format_docx.py paper.raw.docx paper.docx

# Cleanup
rm paper.raw.docx
```

## Makefile Targets

```makefile
# Build main paper
make docx

# Build supplementary material
make supplement

# Build technical overview
make overview

# Build all documents
make all

# Validate citations
make check

# Word count
make wordcount

# Clean generated files
make clean
```

## Table Formatting Applied

The `format_docx.py` script applies:
- **Single-line black borders** on all cells
- **6.5" table width** (fits 1" margins)
- **Bold header rows**
- **Consistent cell padding**
- **Center alignment**

## Prerequisites

1. **Pandoc installed**: `brew install pandoc` or equivalent
2. **python-docx installed**: `pip install python-docx`
3. **Citation style**: `styles/vancouver.csl`
4. **Reference template**: `styles/reference.docx`

## Output Files

| Input | Output | Description |
|-------|--------|-------------|
| paper.md | paper.docx | Main manuscript |
| supplement.md | supplement.docx | Supplementary material |
| overview.md | overview.docx | Technical overview |

## Troubleshooting

### Missing citations
```bash
make check  # Lists undefined citation keys
```

### Low-resolution figures
Ensure `--dpi=600` in Pandoc options.

### Tables without borders
Verify `format_docx.py` ran after Pandoc:
```bash
python scripts/format_docx.py paper.raw.docx paper.docx
```

### Missing reference template
Download or create `styles/reference.docx` with proper styles.

## Word Count

```bash
make wordcount
```

Excludes:
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

## Output

```
Building paper.docx...
  Running Pandoc conversion...
  Formatting tables...
    Formatting table 1...
    Formatting table 2...
    Formatting table 3...
  Tables processed: 3
Done: paper.docx

Word count: 4,523 words
Tables: 3
Figures: 4
Citations: 42
```
