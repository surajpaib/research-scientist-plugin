# Paper Build System
# ==================
# Uses Pandoc + python-docx for Word documents with proper table formatting

# Configuration
PAPER = paper
SUPPLEMENT = supplement
OVERVIEW = overview
BIBFILE = references.bib
CSL = styles/vancouver.csl
TEMPLATE = styles/reference.docx
FORMAT_SCRIPT = scripts/format_docx.py

# Pandoc options
PANDOC_OPTS = --citeproc \
              --bibliography=$(BIBFILE) \
              --csl=$(CSL) \
              --resource-path=.:figures \
              --dpi=600

# Add template if exists
ifneq ($(wildcard $(TEMPLATE)),)
    PANDOC_OPTS += --reference-doc=$(TEMPLATE)
endif

# Default target
.PHONY: all
all: docx supplement overview

# Build main paper with formatted tables
.PHONY: docx
docx: $(PAPER).docx

$(PAPER).docx: $(PAPER).md $(BIBFILE) $(CSL)
	@echo "Building $(PAPER).docx..."
	pandoc $(PAPER).md -o $(PAPER).raw.docx $(PANDOC_OPTS)
	@if [ -f $(FORMAT_SCRIPT) ]; then \
		echo "Formatting tables..."; \
		python $(FORMAT_SCRIPT) $(PAPER).raw.docx $(PAPER).docx; \
		rm $(PAPER).raw.docx; \
	else \
		mv $(PAPER).raw.docx $(PAPER).docx; \
	fi
	@echo "Done: $(PAPER).docx"

# Build supplementary material
.PHONY: supplement
supplement: $(SUPPLEMENT).docx

$(SUPPLEMENT).docx: $(SUPPLEMENT).md $(BIBFILE) $(CSL)
	@echo "Building $(SUPPLEMENT).docx..."
	pandoc $(SUPPLEMENT).md -o $(SUPPLEMENT).raw.docx $(PANDOC_OPTS)
	@if [ -f $(FORMAT_SCRIPT) ]; then \
		python $(FORMAT_SCRIPT) $(SUPPLEMENT).raw.docx $(SUPPLEMENT).docx; \
		rm $(SUPPLEMENT).raw.docx; \
	else \
		mv $(SUPPLEMENT).raw.docx $(SUPPLEMENT).docx; \
	fi
	@echo "Done: $(SUPPLEMENT).docx"

# Build overview (without bibliography)
.PHONY: overview
overview: $(OVERVIEW).docx

$(OVERVIEW).docx: $(OVERVIEW).md
	@echo "Building $(OVERVIEW).docx..."
	pandoc $(OVERVIEW).md -o $(OVERVIEW).raw.docx --resource-path=.:figures:../results
	@if [ -f $(FORMAT_SCRIPT) ]; then \
		python $(FORMAT_SCRIPT) $(OVERVIEW).raw.docx $(OVERVIEW).docx; \
		rm $(OVERVIEW).raw.docx; \
	else \
		mv $(OVERVIEW).raw.docx $(OVERVIEW).docx; \
	fi
	@echo "Done: $(OVERVIEW).docx"

# Build PDF (requires LaTeX)
.PHONY: pdf
pdf: $(PAPER).pdf

$(PAPER).pdf: $(PAPER).md $(BIBFILE) $(CSL)
	@echo "Building $(PAPER).pdf..."
	pandoc $(PAPER).md -o $(PAPER).pdf --citeproc --bibliography=$(BIBFILE) --csl=$(CSL)
	@echo "Done: $(PAPER).pdf"

# Validate citation keys
.PHONY: check
check:
	@echo "Checking citation keys..."
	@grep -oE '@[a-zA-Z0-9_]+' $(PAPER).md $(SUPPLEMENT).md 2>/dev/null | \
		sed 's/.*@//' | sort -u | \
		while read key; do \
			if ! grep -q "$$key" $(BIBFILE); then \
				echo "WARNING: Citation key '$$key' not found in $(BIBFILE)"; \
			fi; \
		done
	@echo "Citation check complete."

# Word count
.PHONY: wordcount
wordcount:
	@echo "Approximate word count for $(PAPER).md:"
	@sed '/^---$$/,/^---$$/d' $(PAPER).md | \
		sed '/^```/,/^```/d' | \
		sed '/^|/d' | \
		wc -w | \
		awk '{print $$1 " words"}'

# Download citation style
.PHONY: download-styles
download-styles:
	@mkdir -p styles
	@if [ ! -f $(CSL) ]; then \
		echo "Downloading Vancouver CSL..."; \
		curl -sL "https://raw.githubusercontent.com/citation-style-language/styles/master/vancouver.csl" -o $(CSL); \
		echo "Downloaded $(CSL)"; \
	else \
		echo "$(CSL) already exists"; \
	fi

# Clean generated files
.PHONY: clean
clean:
	rm -f $(PAPER).docx $(PAPER).pdf $(PAPER).raw.docx
	rm -f $(SUPPLEMENT).docx $(SUPPLEMENT).raw.docx
	rm -f $(OVERVIEW).docx $(OVERVIEW).raw.docx
	@echo "Cleaned generated files."

# Help
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make docx         - Build main paper (with table formatting)"
	@echo "  make supplement   - Build supplementary material"
	@echo "  make overview     - Build technical overview"
	@echo "  make pdf          - Build PDF (requires LaTeX)"
	@echo "  make all          - Build all documents"
	@echo "  make check        - Validate citation keys"
	@echo "  make wordcount    - Count words in paper.md"
	@echo "  make download-styles - Download Vancouver CSL"
	@echo "  make clean        - Remove generated files"
