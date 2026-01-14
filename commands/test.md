---
description: Run plugin setup tests and API connectivity checks
allowed-tools: Bash, Read
argument-hint: [optional: --apis | --verbose]
---

# Test Plugin Setup

Validate that the Research Scientist plugin is correctly installed and configured.

## Usage

```
/research-scientist:test [options]
```

Options:
- Default: Run setup tests
- `--apis`: Also test API connectivity
- `--verbose`: Show detailed output

## What Gets Tested

### Setup Tests
1. **Plugin structure** - Required directories exist
2. **plugin.json** - Valid configuration
3. **Commands** - All command files valid
4. **Skills** - All skill files valid
5. **Agents** - All agent files valid
6. **hooks.json** - Valid hook configuration
7. **MCP dependencies** - Package.json files present
8. **Node.js** - Available for MCP servers
9. **Python packages** - PyYAML, python-docx installed
10. **Pandoc** - Available for document building
11. **Profiles** - Journal profiles valid

### API Tests (--apis)
1. PubMed E-utilities
2. OpenAlex
3. CrossRef
4. Semantic Scholar
5. Zotero Better BibTeX (local, optional)

## Running Tests

### Setup Tests Only
```bash
python ~/.claude/plugins/research-scientist/tests/test_setup.py
```

### With API Tests
```bash
python ~/.claude/plugins/research-scientist/tests/test_setup.py
python ~/.claude/plugins/research-scientist/tests/test_apis.py
```

### Verbose Output
```bash
python ~/.claude/plugins/research-scientist/tests/test_setup.py --verbose
```

## Expected Output

```
==================================================
Research Scientist Plugin - Setup Tests
==================================================

✓ Plugin structure
  All 9 directories present
✓ plugin.json
  Valid (v1.0.0)
✓ Commands
  5 valid commands
✓ Skills
  8 valid skills
✓ Agents
  6 valid agents
✓ hooks.json
  Valid (PreToolUse, PostToolUse, Notification)
✓ MCP dependencies
  2 MCP servers configured
✓ Node.js
  Available (v20.10.0)
✓ Python packages
  All required packages installed
✓ Pandoc
  Available (pandoc 3.1.9)
✓ Profiles
  4 valid journal profiles

--------------------------------------------------
Results: 11 passed, 0 failed
--------------------------------------------------
```

## Fixing Common Issues

### Missing Python packages
```bash
pip install pyyaml python-docx
```

### Missing Node.js
```bash
brew install node
```

### Missing Pandoc
```bash
brew install pandoc
```

### MCP servers not installed
```bash
cd ~/.claude/plugins/research-scientist/mcp-servers/pubmed-server
npm install

cd ~/.claude/plugins/research-scientist/mcp-servers/zotero-server
npm install
```

## Integration

Run tests after:
- Installing the plugin
- Updating the plugin
- Setting up a new machine
