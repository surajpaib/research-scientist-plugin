---
description: Install plugin dependencies and validate setup
allowed-tools: [Bash, Read]
argument-hint: "[--verbose] [--skip-test]"
---

# Install Research Scientist Plugin

Run the installation script to set up all dependencies.

## Steps

1. **Run the installation script**
   ```bash
   ~/.claude/plugins/research-scientist/scripts/install.sh
   ```

   Options:
   - `--verbose` - Show detailed output
   - `--skip-test` - Skip running test suite after installation

2. **What the script does**
   - Checks system dependencies (Node.js, Python, Pandoc)
   - Installs MCP server npm dependencies
   - Installs Python packages (pyyaml, python-docx)
   - Creates .env file from template (if not exists)
   - Runs the test suite to verify installation

3. **After installation**
   - Edit `~/.claude/plugins/research-scientist/.env` to add API keys (optional)
   - Create a new project with `/research-scientist:new-project`

## Troubleshooting

If installation fails:

1. **Missing Node.js**: Install with `brew install node`
2. **Missing Pandoc**: Install with `brew install pandoc`
3. **Python packages fail**: Try `pip3 install pyyaml python-docx`
4. **npm errors**: Delete `node_modules` in mcp-servers and retry

## Manual Installation

If the script doesn't work, install manually:

```bash
# MCP servers
cd ~/.claude/plugins/research-scientist/mcp-servers/pubmed-server && npm install
cd ~/.claude/plugins/research-scientist/mcp-servers/zotero-server && npm install

# Python packages
pip3 install pyyaml python-docx

# Verify
python3 ~/.claude/plugins/research-scientist/tests/test_setup.py
```
