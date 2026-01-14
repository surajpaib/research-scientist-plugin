#!/usr/bin/env bash
#
# Research Scientist Plugin - Quick Setup
# Configures Claude Code to load the plugin from this directory
#

set -e

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETTINGS_FILE="$HOME/.claude/settings.json"

echo "Setting up Research Scientist plugin..."
echo "Plugin directory: $PLUGIN_DIR"

# Create .claude directory if needed
mkdir -p "$HOME/.claude"

# Create or update settings.json
if [ -f "$SETTINGS_FILE" ]; then
    # Check if python3 is available for JSON manipulation
    if command -v python3 &> /dev/null; then
        python3 - "$PLUGIN_DIR" "$SETTINGS_FILE" << 'PYEOF'
import json
import sys
from pathlib import Path

plugin_dir = sys.argv[1]
settings_file = Path(sys.argv[2])

settings = json.loads(settings_file.read_text())

# Add pluginDirectories
dirs = settings.get("pluginDirectories", [])
if plugin_dir not in dirs:
    dirs.append(plugin_dir)
settings["pluginDirectories"] = dirs

# Remove old marketplace-based entries if present
if "extraKnownMarketplaces" in settings:
    if "research-scientist" in settings["extraKnownMarketplaces"]:
        del settings["extraKnownMarketplaces"]["research-scientist"]
    if not settings["extraKnownMarketplaces"]:
        del settings["extraKnownMarketplaces"]

# Update enabledPlugins - remove marketplace version, add local version
plugins = settings.get("enabledPlugins", {})
plugins.pop("research-scientist@research-scientist", None)
plugins.pop("research-scientist@bro-local", None)
plugins["research-scientist"] = True
settings["enabledPlugins"] = plugins

settings_file.write_text(json.dumps(settings, indent=2) + "\n")
print(f"Updated {settings_file}")
PYEOF
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
