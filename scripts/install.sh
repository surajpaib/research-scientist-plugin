#!/usr/bin/env bash
#
# Research Scientist Plugin - Installation Script
#
# Usage:
#   ./install.sh [--skip-test] [--verbose]
#
# Options:
#   --skip-test   Skip running test suite after installation
#   --verbose     Show detailed output
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Plugin root (relative to this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

# Parse arguments
SKIP_TEST=false
VERBOSE=false
for arg in "$@"; do
    case $arg in
        --skip-test)
            SKIP_TEST=true
            ;;
        --verbose|-v)
            VERBOSE=true
            ;;
    esac
done

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Research Scientist Plugin - Installation Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track installation results
ERRORS=()
WARNINGS=()
SUCCESS=()

log_success() {
    SUCCESS+=("$1")
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    WARNINGS+=("$1")
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    ERRORS+=("$1")
    echo -e "${RED}✗${NC} $1"
}

log_info() {
    echo -e "${BLUE}→${NC} $1"
}

# =============================================================================
# Step 1: Check System Dependencies
# =============================================================================
echo ""
echo -e "${BLUE}Step 1: Checking system dependencies${NC}"
echo "──────────────────────────────────────"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    log_success "Node.js installed ($NODE_VERSION)"
else
    log_error "Node.js not found. Install: brew install node"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "npm installed (v$NPM_VERSION)"
else
    log_error "npm not found. Install: brew install node"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    log_success "Python installed ($PYTHON_VERSION)"
else
    log_error "Python 3 not found. Install: brew install python"
fi

# Check pip
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version | cut -d' ' -f2)
    log_success "pip installed (v$PIP_VERSION)"
else
    log_warning "pip3 not found. Python packages may need manual installation"
fi

# Check Pandoc
if command -v pandoc &> /dev/null; then
    PANDOC_VERSION=$(pandoc --version | head -1)
    log_success "Pandoc installed ($PANDOC_VERSION)"
else
    log_warning "Pandoc not found. Install: brew install pandoc"
    log_info "  Pandoc is required for building Word documents"
fi

# =============================================================================
# Step 2: Install MCP Server Dependencies
# =============================================================================
echo ""
echo -e "${BLUE}Step 2: Installing MCP server dependencies${NC}"
echo "────────────────────────────────────────────"

# PubMed server
PUBMED_DIR="$PLUGIN_ROOT/mcp-servers/pubmed-server"
if [ -d "$PUBMED_DIR" ] && [ -f "$PUBMED_DIR/package.json" ]; then
    log_info "Installing PubMed server dependencies..."
    cd "$PUBMED_DIR"
    if $VERBOSE; then
        npm install
    else
        npm install --silent 2>/dev/null
    fi
    log_success "PubMed server dependencies installed"
else
    log_error "PubMed server directory not found"
fi

# Zotero server
ZOTERO_DIR="$PLUGIN_ROOT/mcp-servers/zotero-server"
if [ -d "$ZOTERO_DIR" ] && [ -f "$ZOTERO_DIR/package.json" ]; then
    log_info "Installing Zotero server dependencies..."
    cd "$ZOTERO_DIR"
    if $VERBOSE; then
        npm install
    else
        npm install --silent 2>/dev/null
    fi
    log_success "Zotero server dependencies installed"
else
    log_error "Zotero server directory not found"
fi

# Return to plugin root
cd "$PLUGIN_ROOT"

# =============================================================================
# Step 3: Install Python Dependencies
# =============================================================================
echo ""
echo -e "${BLUE}Step 3: Installing Python dependencies${NC}"
echo "─────────────────────────────────────────"

PYTHON_PACKAGES="pyyaml python-docx"

# Check if packages are already installed
MISSING_PACKAGES=""
python3 -c "import yaml" 2>/dev/null || MISSING_PACKAGES="$MISSING_PACKAGES pyyaml"
python3 -c "import docx" 2>/dev/null || MISSING_PACKAGES="$MISSING_PACKAGES python-docx"

if [ -z "$MISSING_PACKAGES" ]; then
    log_success "All Python packages already installed"
else
    log_info "Installing missing packages:$MISSING_PACKAGES"
    if pip3 install $MISSING_PACKAGES --quiet 2>/dev/null; then
        log_success "Python packages installed"
    else
        log_warning "Some packages may have failed. Try: pip3 install$MISSING_PACKAGES"
    fi
fi

# =============================================================================
# Step 4: Verify .env file (optional)
# =============================================================================
echo ""
echo -e "${BLUE}Step 4: Checking API configuration${NC}"
echo "────────────────────────────────────"

ENV_FILE="$PLUGIN_ROOT/.env"
ENV_TEMPLATE="$PLUGIN_ROOT/.env.template"

if [ -f "$ENV_FILE" ]; then
    log_success "API configuration file exists (.env)"

    # Check for API keys
    if grep -q "NCBI_API_KEY=." "$ENV_FILE" 2>/dev/null; then
        log_success "  NCBI API key configured"
    else
        log_info "  NCBI API key not set (optional, increases rate limit)"
    fi

    if grep -q "CROSSREF_EMAIL=." "$ENV_FILE" 2>/dev/null; then
        log_success "  CrossRef email configured"
    else
        log_info "  CrossRef email not set (optional, for polite pool access)"
    fi
else
    if [ -f "$ENV_TEMPLATE" ]; then
        log_info "No .env file found. Creating from template..."
        cp "$ENV_TEMPLATE" "$ENV_FILE"
        log_success "Created .env from template"
        log_info "  Edit $ENV_FILE to add your API keys"
    else
        log_info "No API configuration found (optional)"
        log_info "  API keys increase rate limits but are not required"
    fi
fi

# =============================================================================
# Step 5: Run Test Suite (unless skipped)
# =============================================================================
if [ "$SKIP_TEST" = false ]; then
    echo ""
    echo -e "${BLUE}Step 5: Running test suite${NC}"
    echo "───────────────────────────"

    TEST_SCRIPT="$PLUGIN_ROOT/tests/test_setup.py"
    if [ -f "$TEST_SCRIPT" ]; then
        if $VERBOSE; then
            python3 "$TEST_SCRIPT" --verbose
        else
            python3 "$TEST_SCRIPT"
        fi
        TEST_RESULT=$?
        if [ $TEST_RESULT -eq 0 ]; then
            log_success "All tests passed"
        else
            log_warning "Some tests failed (see above for details)"
        fi
    else
        log_warning "Test script not found at $TEST_SCRIPT"
    fi
fi

# =============================================================================
# Summary
# =============================================================================
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   Installation Summary                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Success count
echo -e "${GREEN}Completed:${NC} ${#SUCCESS[@]} items"
if [ ${#SUCCESS[@]} -gt 0 ] && [ "$VERBOSE" = true ]; then
    for item in "${SUCCESS[@]}"; do
        echo -e "  ${GREEN}✓${NC} $item"
    done
fi

# Warnings count
if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo -e "${YELLOW}Warnings:${NC} ${#WARNINGS[@]} items"
    for item in "${WARNINGS[@]}"; do
        echo -e "  ${YELLOW}⚠${NC} $item"
    done
fi

# Errors count
if [ ${#ERRORS[@]} -gt 0 ]; then
    echo -e "${RED}Errors:${NC} ${#ERRORS[@]} items"
    for item in "${ERRORS[@]}"; do
        echo -e "  ${RED}✗${NC} $item"
    done
    echo ""
    echo -e "${RED}Installation completed with errors. Please fix the issues above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Installation completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. (Optional) Edit ~/.claude/plugins/research-scientist/.env to add API keys"
echo "  2. Create a new project: /research-scientist:new-project"
echo "  3. View available commands: /research-scientist:test"
echo ""
