#!/usr/bin/env bash
# Run this in your Mac terminal to diagnose the PubMed MCP connection:
# bash ~/path/to/research-scientist/scripts/debug-mcp.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
PUBMED_JS="$PLUGIN_ROOT/mcp-servers/pubmed-server/index.js"
SETTINGS="$HOME/.claude/settings.json"

GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

echo ""
echo "PubMed MCP Diagnostics"
echo "══════════════════════"
echo ""

# 1. Node version
NODE_VER=$(node --version 2>/dev/null || echo "not found")
if [[ "$NODE_VER" == "not found" ]]; then
  fail "Node.js not found — install with: brew install node"
elif [[ "${NODE_VER#v}" =~ ^([0-9]+) ]] && [[ "${BASH_REMATCH[1]}" -lt 18 ]]; then
  fail "Node.js $NODE_VER too old — need 18+. Upgrade: brew upgrade node"
else
  ok "Node.js $NODE_VER (18+ required for native fetch)"
fi

# 2. Server file
if [[ -f "$PUBMED_JS" ]]; then
  ok "Server file found: $PUBMED_JS"
else
  fail "Server file NOT found at: $PUBMED_JS"
fi

# 3. settings.json
echo ""
echo "── ~/.claude/settings.json ──"
if [[ ! -f "$SETTINGS" ]]; then
  fail "Settings file does not exist: $SETTINGS"
  echo "   Run: ./scripts/install.sh"
else
  ok "Settings file exists"
  
  # Check pluginDirectories
  if grep -q "pluginDirectories" "$SETTINGS" 2>/dev/null; then
    ok "pluginDirectories is set"
  else
    fail "pluginDirectories NOT found — run ./scripts/install.sh"
  fi
  
  # Check pubmed MCP
  if grep -q '"pubmed"' "$SETTINGS" 2>/dev/null; then
    ok "pubmed MCP entry found"
    REGISTERED_PATH=$(python3 -c "
import json
with open('$SETTINGS') as f:
    s = json.load(f)
mcp = s.get('mcpServers', {}).get('pubmed', {})
args = mcp.get('args', [])
print(args[0] if args else 'NO PATH')
" 2>/dev/null)
    echo "   Registered path: $REGISTERED_PATH"
    if [[ "$REGISTERED_PATH" == "$PUBMED_JS" ]]; then
      ok "Path matches actual server location"
    else
      fail "Path MISMATCH"
      echo "   Expected: $PUBMED_JS"
      echo "   Got:      $REGISTERED_PATH"
      echo "   Fix: run ./scripts/install.sh to re-register"
    fi
  else
    fail "pubmed MCP NOT registered in settings"
    echo "   Run: ./scripts/install.sh"
  fi
fi

# 4. Smoke test: actually start the server and send initialize
echo ""
echo "── Server smoke test ──"
if [[ -f "$PUBMED_JS" ]] && node --version &>/dev/null; then
  RESPONSE=$(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' \
    | timeout 5 node "$PUBMED_JS" 2>/dev/null | head -1)
  if echo "$RESPONSE" | grep -q '"protocolVersion"'; then
    ok "Server starts and responds correctly"
    TOOLS=$(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' \
      | timeout 5 node "$PUBMED_JS" 2>/dev/null | tail -1)
    TOOL_COUNT=$(echo "$TOOLS" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d['result']['tools']))" 2>/dev/null || echo "?")
    ok "Server exposes $TOOL_COUNT tools: pubmed_search, pubmed_fetch, pubmed_bibtex"
  else
    fail "Server did not respond — output: $RESPONSE"
  fi
fi

# 5. NCBI API key
echo ""
echo "── NCBI API Key ──"
KEY=$(python3 -c "
import json
try:
    with open('$SETTINGS') as f:
        s = json.load(f)
    k = s.get('mcpServers', {}).get('pubmed', {}).get('env', {}).get('NCBI_API_KEY', '')
    print('SET' if k else 'NOT SET')
except:
    print('CANNOT READ')
" 2>/dev/null)
if [[ "$KEY" == "SET" ]]; then
  ok "NCBI_API_KEY is configured (10 req/s)"
else
  warn "NCBI_API_KEY not set (3 req/s — fine for normal use)"
  echo "   Get a free key: https://www.ncbi.nlm.nih.gov/account/"
fi

echo ""
echo "══════════════════════"
echo "If all checks pass but Claude still can't use PubMed:"
echo "  → Restart Claude Code after running ./scripts/install.sh"
echo "  → Verify Claude Code has the plugin loaded: /rs:start"
echo ""
