#!/usr/bin/env bash
# Research Scientist Plugin — Install Script
# Usage: ./scripts/install.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
SETTINGS_FILE="$HOME/.claude/settings.json"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err()  { echo -e "${RED}✗${NC} $1"; }
info() { echo -e "${BLUE}→${NC} $1"; }

echo ""
echo "Research Scientist Plugin — Installation"
echo "────────────────────────────────────────"
echo ""

# ── 1. System dependencies ───────────────────────────────────────────────────
info "Checking dependencies..."

command -v node   &>/dev/null && ok "Node.js $(node --version)"   || err "Node.js not found — brew install node"
command -v python3 &>/dev/null && ok "Python $(python3 --version)" || err "Python 3 not found — brew install python"
command -v pandoc &>/dev/null && ok "Pandoc $(pandoc --version | head -1)" || warn "Pandoc not found — brew install pandoc  (needed for /rs:build)"
command -v pdflatex &>/dev/null \
  && ok "pdflatex $(pdflatex --version | head -1)" \
  || warn "pdflatex not found — brew install --cask mactex  (needed for /rs:build with LaTeX styles)"

# ── 2. Python packages ────────────────────────────────────────────────────────
echo ""
info "Installing Python packages..."

pip3 install --quiet python-docx pyyaml matplotlib seaborn pandas scipy statsmodels 2>/dev/null \
  && ok "Python packages installed" \
  || warn "Some packages may have failed — run: pip3 install python-docx pyyaml matplotlib seaborn pandas scipy statsmodels"

# ── 4. Register plugin in ~/.claude/settings.json ────────────────────────────
echo ""
info "Registering plugin with Claude Code..."

mkdir -p "$HOME/.claude"

# Read existing settings (or start fresh)
if [ -f "$SETTINGS_FILE" ]; then
  CURRENT=$(cat "$SETTINGS_FILE")
else
  CURRENT="{}"
fi

# Update settings using Python (avoids jq dependency)
python3 - <<PYEOF
import json, os

settings_file = "$SETTINGS_FILE"
plugin_root   = "$PLUGIN_ROOT"
pubmed_js     = os.path.join(plugin_root, "mcp-servers", "pubmed-server", "index.js")
zotero_js     = os.path.join(plugin_root, "mcp-servers", "zotero-server", "index.js")
arxiv_js      = os.path.join(plugin_root, "mcp-servers", "arxiv-server", "index.js")

try:
    with open(settings_file) as f:
        settings = json.load(f)
except Exception:
    settings = {}

# Register plugin directory
dirs = settings.get("pluginDirectories", [])
if plugin_root not in dirs:
    dirs.append(plugin_root)
    settings["pluginDirectories"] = dirs
    print("  Added pluginDirectories: " + plugin_root)
else:
    print("  pluginDirectories: already registered")

# Register MCP servers
mcp = settings.get("mcpServers", {})

if "pubmed" not in mcp:
    mcp["pubmed"] = {
        "command": "node",
        "args": [pubmed_js],
        "env": {}
    }
    print("  Added MCP server: pubmed")
else:
    # Keep existing config (may already have NCBI_API_KEY set)
    mcp["pubmed"]["args"] = [pubmed_js]
    print("  MCP server: pubmed already configured")

if "zotero" not in mcp:
    mcp["zotero"] = {
        "command": "node",
        "args": [zotero_js],
        "env": {}
    }
    print("  Added MCP server: zotero")
else:
    mcp["zotero"]["args"] = [zotero_js]
    print("  MCP server: zotero already configured")

if "arxiv" not in mcp:
    mcp["arxiv"] = {
        "command": "node",
        "args": [arxiv_js],
        "env": {}
    }
    print("  Added MCP server: arxiv")
else:
    mcp["arxiv"]["args"] = [arxiv_js]
    print("  MCP server: arxiv already configured")

settings["mcpServers"] = mcp

with open(settings_file, "w") as f:
    json.dump(settings, f, indent=2)
PYEOF

ok "Plugin + MCP servers registered in $SETTINGS_FILE"

# ── 5. NCBI API key (optional) ───────────────────────────────────────────────
echo ""
info "PubMed API key (optional — increases rate limit from 3 to 10 req/s)"
echo "  Get a free key at: https://www.ncbi.nlm.nih.gov/account/"
echo -n "  Enter NCBI_API_KEY (or press Enter to skip): "
read -r NCBI_KEY

if [ -n "$NCBI_KEY" ]; then
  python3 - <<PYEOF
import json

settings_file = "$SETTINGS_FILE"
key = "$NCBI_KEY"

with open(settings_file) as f:
    settings = json.load(f)

settings["mcpServers"]["pubmed"]["env"]["NCBI_API_KEY"] = key

with open(settings_file, "w") as f:
    json.dump(settings, f, indent=2)

print("  NCBI_API_KEY saved.")
PYEOF
  ok "NCBI API key configured"
else
  warn "No API key set — using anonymous rate limit (3 req/s). Add later via ~/.claude/settings.json"
fi

# ── 7. Validate plugin manifest ──────────────────────────────────────────────
echo ""
info "Validating plugin..."

if command -v claude &>/dev/null; then
  claude plugin validate "$PLUGIN_ROOT" 2>&1 | grep -E "✔|✘|error" || true
  ok "Plugin manifest valid"
else
  warn "claude not found in PATH — skipping validation"
fi

# ── 8. Done ───────────────────────────────────────────────────────────────────
echo ""
echo "────────────────────────────────────────"
echo -e "${GREEN}Installation complete.${NC}"
echo ""
echo "Commands are available in all future Claude Code sessions:"
echo "  /rs:start       — begin a paper project from your CSV/JSON"
echo "  /rs:analyze     — run hypothesis-driven analysis"
echo "  /rs:figures     — generate figures (nature / openai / clinical)"
echo "  /rs:results     — write Results section"
echo "  /rs:intro       — search web + write Introduction"
echo "  /rs:discussion  — write Discussion"
echo "  /rs:methods     — guided Q&A → write Methods"
echo "  /rs:build       — assemble Word document (docx) or PDF (mlforhealth / latex styles)"
echo ""
echo "MCP servers registered: pubmed, zotero, arxiv"
echo ""
echo "Restart Claude Code if it is already running."
echo ""
