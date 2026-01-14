#!/usr/bin/env bash
#
# Research Scientist Plugin - Quick Setup
# Configures Claude Code to load the plugin from this directory
#

set -e

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETTINGS_FILE="$HOME/.claude/settings.json"

echo "Setting up Research Scientist plugin..."

# Create .claude directory if needed
mkdir -p "$HOME/.claude"

# Create or update settings.json
if [ -f "$SETTINGS_FILE" ]; then
    # Check if python3 is available for JSON manipulation
    if command -v python3 &> /dev/null; then
        python3 << EOF
import json
from pathlib import Path

settings_file = Path("$SETTINGS_FILE")
settings = json.loads(settings_file.read_text())

# Add pluginDirectories
dirs = settings.get("pluginDirectories", [])
if "$PLUGIN_DIR" not in dirs:
    dirs.append("$PLUGIN_DIR")
settings["pluginDirectories"] = dirs

# Add enabledPlugins
plugins = settings.get("enabledPlugins", {})
plugins["research-scientist"] = True
settings["enabledPlugins"] = plugins

settings_file.write_text(json.dumps(settings, indent=2))
print("Updated $SETTINGS_FILE")
EOF
    else
        echo "Python3 not found. Please manually add to $SETTINGS_FILE:"
        echo '  "pluginDirectories": ["'"$PLUGIN_DIR"'"],'
        echo '  "enabledPlugins": {"research-scientist": true}'
        exit 1
    fi
else
    # Create new settings file
    cat > "$SETTINGS_FILE" << EOF
{
  "pluginDirectories": ["$PLUGIN_DIR"],
  "enabledPlugins": {
    "research-scientist": true
  }
}
EOF
    echo "Created $SETTINGS_FILE"
fi

echo ""
echo "Setup complete! Now:"
echo "  1. Restart Claude Code"
echo "  2. Run: /research-scientist:test"
echo ""
