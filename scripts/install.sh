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

# ── 2. MCP server dependencies ───────────────────────────────────────────────
echo ""
info "Installing MCP server dependencies..."

for server in pubmed-server zotero-server; do
  dir="$PLUGIN_ROOT/mcp-servers/$server"
  if [ -f "$dir/package.json" ]; then
    (cd "$dir" && npm install --silent 2>/dev/null) && ok "$server" || warn "$server install failed"
  fi
done

# ── 3. Python packages ────────────────────────────────────────────────────────
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

# Add pluginDirectories entry using Python (avoids jq dependency)
python3 - <<PYEOF
import json, sys

settings_file = "$SETTINGS_FILE"
plugin_root   = "$PLUGIN_ROOT"

try:
    with open(settings_file) as f:
        settings = json.load(f)
except Exception:
    settings = {}

dirs = settings.get("pluginDirectories", [])
if plugin_root not in dirs:
    dirs.append(plugin_root)
    settings["pluginDirectories"] = dirs
    with open(settings_file, "w") as f:
        json.dump(settings, f, indent=2)
    print("  Added to pluginDirectories: " + plugin_root)
else:
    print("  Already registered: " + plugin_root)
PYEOF

ok "Plugin registered in $SETTINGS_FILE"

# ── 5. Validate plugin manifest ──────────────────────────────────────────────
echo ""
info "Validating plugin..."

if command -v claude &>/dev/null; then
  claude plugin validate "$PLUGIN_ROOT" 2>&1 | grep -E "✔|✘|error" || true
  ok "Plugin manifest valid"
else
  warn "claude not found in PATH — skipping validation"
fi

# ── 6. Done ───────────────────────────────────────────────────────────────────
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
echo "  /rs:build       — assemble Word document"
echo ""
echo "Restart Claude Code if it is already running."
echo ""
