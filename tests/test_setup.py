#!/usr/bin/env python3
"""
Test suite for Research Scientist plugin setup.

Usage:
    python test_setup.py [--verbose]

Tests:
    1. Plugin structure validation
    2. MCP server dependencies
    3. Required tools availability
    4. API connectivity (optional)
"""

import sys
import os
import json
import subprocess
from pathlib import Path

# Plugin root
PLUGIN_ROOT = Path(__file__).parent.parent


class TestResult:
    def __init__(self, name: str, passed: bool, message: str = ""):
        self.name = name
        self.passed = passed
        self.message = message


def test_plugin_structure():
    """Test that all required plugin directories exist."""
    required_dirs = [
        "commands",
        "skills",
        "agents",
        "hooks",
        "profiles",
        "scripts",
        "mcp-servers",
        "templates",
        ".claude-plugin",
    ]

    missing = []
    for d in required_dirs:
        if not (PLUGIN_ROOT / d).is_dir():
            missing.append(d)

    if missing:
        return TestResult(
            "Plugin structure",
            False,
            f"Missing directories: {', '.join(missing)}"
        )
    return TestResult("Plugin structure", True, f"All {len(required_dirs)} directories present")


def test_plugin_json():
    """Test that plugin.json is valid."""
    plugin_json = PLUGIN_ROOT / ".claude-plugin" / "plugin.json"

    if not plugin_json.exists():
        return TestResult("plugin.json", False, "File not found")

    try:
        with open(plugin_json) as f:
            data = json.load(f)

        required_fields = ["name", "description", "version"]
        missing = [f for f in required_fields if f not in data]

        if missing:
            return TestResult("plugin.json", False, f"Missing fields: {', '.join(missing)}")

        return TestResult("plugin.json", True, f"Valid (v{data.get('version', '?')})")
    except json.JSONDecodeError as e:
        return TestResult("plugin.json", False, f"Invalid JSON: {e}")


def test_commands():
    """Test that command files are valid."""
    commands_dir = PLUGIN_ROOT / "commands"
    commands = list(commands_dir.glob("*.md"))

    if not commands:
        return TestResult("Commands", False, "No command files found")

    valid = 0
    for cmd in commands:
        content = cmd.read_text()
        if "---" in content and "description:" in content:
            valid += 1

    if valid == len(commands):
        return TestResult("Commands", True, f"{valid} valid commands")
    else:
        return TestResult("Commands", False, f"{valid}/{len(commands)} commands valid")


def test_skills():
    """Test that skill files are valid."""
    skills_dir = PLUGIN_ROOT / "skills"
    skills = list(skills_dir.glob("*/SKILL.md"))

    if not skills:
        return TestResult("Skills", False, "No skill files found")

    valid = 0
    for skill in skills:
        content = skill.read_text()
        if "---" in content and "name:" in content and "description:" in content:
            valid += 1

    if valid == len(skills):
        return TestResult("Skills", True, f"{valid} valid skills")
    else:
        return TestResult("Skills", False, f"{valid}/{len(skills)} skills valid")


def test_agents():
    """Test that agent files are valid."""
    agents_dir = PLUGIN_ROOT / "agents"
    agents = list(agents_dir.glob("*.md"))

    if not agents:
        return TestResult("Agents", False, "No agent files found")

    valid = 0
    for agent in agents:
        content = agent.read_text()
        if "---" in content and "name:" in content and "tools:" in content:
            valid += 1

    if valid == len(agents):
        return TestResult("Agents", True, f"{valid} valid agents")
    else:
        return TestResult("Agents", False, f"{valid}/{len(agents)} agents valid")


def test_hooks_json():
    """Test that hooks.json is valid."""
    hooks_file = PLUGIN_ROOT / "hooks" / "hooks.json"

    if not hooks_file.exists():
        return TestResult("hooks.json", False, "File not found")

    try:
        with open(hooks_file) as f:
            data = json.load(f)

        hook_types = list(data.keys())
        return TestResult("hooks.json", True, f"Valid ({', '.join(hook_types)})")
    except json.JSONDecodeError as e:
        return TestResult("hooks.json", False, f"Invalid JSON: {e}")


def test_mcp_dependencies():
    """Test that MCP server dependencies can be installed."""
    mcp_dirs = [
        PLUGIN_ROOT / "mcp-servers" / "pubmed-server",
        PLUGIN_ROOT / "mcp-servers" / "zotero-server",
    ]

    for mcp_dir in mcp_dirs:
        package_json = mcp_dir / "package.json"
        if not package_json.exists():
            return TestResult("MCP dependencies", False, f"Missing package.json in {mcp_dir.name}")

        try:
            with open(package_json) as f:
                data = json.load(f)
            if "dependencies" not in data:
                return TestResult("MCP dependencies", False, f"No dependencies in {mcp_dir.name}")
        except json.JSONDecodeError:
            return TestResult("MCP dependencies", False, f"Invalid package.json in {mcp_dir.name}")

    return TestResult("MCP dependencies", True, f"{len(mcp_dirs)} MCP servers configured")


def test_node_available():
    """Test that Node.js is available for MCP servers."""
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version = result.stdout.strip()
            return TestResult("Node.js", True, f"Available ({version})")
        return TestResult("Node.js", False, "Command failed")
    except FileNotFoundError:
        return TestResult("Node.js", False, "Not installed")
    except subprocess.TimeoutExpired:
        return TestResult("Node.js", False, "Timeout")


def test_python_packages():
    """Test that required Python packages are available."""
    required = ["yaml", "docx"]
    missing = []

    for package in required:
        try:
            __import__(package)
        except ImportError:
            # Try alternative names
            alt_names = {"yaml": "pyyaml", "docx": "python-docx"}
            missing.append(alt_names.get(package, package))

    if missing:
        return TestResult(
            "Python packages",
            False,
            f"Missing: {', '.join(missing)}. Install with: pip install {' '.join(missing)}"
        )
    return TestResult("Python packages", True, "All required packages installed")


def test_pandoc_available():
    """Test that Pandoc is available for document building."""
    try:
        result = subprocess.run(
            ["pandoc", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            version = result.stdout.split("\n")[0]
            return TestResult("Pandoc", True, f"Available ({version})")
        return TestResult("Pandoc", False, "Command failed")
    except FileNotFoundError:
        return TestResult("Pandoc", False, "Not installed. Install with: brew install pandoc")
    except subprocess.TimeoutExpired:
        return TestResult("Pandoc", False, "Timeout")


def test_profiles():
    """Test that journal profiles are valid YAML."""
    profiles_dir = PLUGIN_ROOT / "profiles"
    profiles = list(profiles_dir.glob("*.yaml"))

    if not profiles:
        return TestResult("Profiles", False, "No profile files found")

    try:
        import yaml
        valid = 0
        for profile in profiles:
            with open(profile) as f:
                data = yaml.safe_load(f)
                if "journal" in data and "manuscript" in data:
                    valid += 1

        if valid == len(profiles):
            return TestResult("Profiles", True, f"{valid} valid journal profiles")
        else:
            return TestResult("Profiles", False, f"{valid}/{len(profiles)} profiles valid")
    except ImportError:
        return TestResult("Profiles", False, "PyYAML not installed")


def test_api_keys():
    """Test API key configuration (optional)."""
    env_file = PLUGIN_ROOT / ".env"
    env_template = PLUGIN_ROOT / ".env.template"

    if not env_file.exists():
        if env_template.exists():
            return TestResult("API keys", True, "Not configured (optional) - template available")
        return TestResult("API keys", True, "Not configured (optional)")

    # Check which keys are configured
    configured = []
    with open(env_file) as f:
        content = f.read()
        if "NCBI_API_KEY=" in content and not content.split("NCBI_API_KEY=")[1].startswith("\n"):
            # Check if there's actually a value after the =
            value = content.split("NCBI_API_KEY=")[1].split("\n")[0].strip()
            if value:
                configured.append("NCBI")
        if "CROSSREF_EMAIL=" in content:
            value = content.split("CROSSREF_EMAIL=")[1].split("\n")[0].strip()
            if value:
                configured.append("CrossRef")
        if "ZOTERO_API_KEY=" in content:
            value = content.split("ZOTERO_API_KEY=")[1].split("\n")[0].strip()
            if value:
                configured.append("Zotero")
        if "SEMANTIC_SCHOLAR_API_KEY=" in content:
            value = content.split("SEMANTIC_SCHOLAR_API_KEY=")[1].split("\n")[0].strip()
            if value:
                configured.append("Semantic Scholar")

    if configured:
        return TestResult("API keys", True, f"Configured: {', '.join(configured)}")
    return TestResult("API keys", True, "Not configured (optional)")


def run_all_tests(verbose: bool = False):
    """Run all tests and report results."""
    tests = [
        test_plugin_structure,
        test_plugin_json,
        test_commands,
        test_skills,
        test_agents,
        test_hooks_json,
        test_mcp_dependencies,
        test_node_available,
        test_python_packages,
        test_pandoc_available,
        test_profiles,
        test_api_keys,
    ]

    results = []
    for test in tests:
        try:
            result = test()
        except Exception as e:
            result = TestResult(test.__name__, False, f"Error: {e}")
        results.append(result)

    # Print results
    print("\n" + "=" * 50)
    print("Research Scientist Plugin - Setup Tests")
    print("=" * 50 + "\n")

    passed = 0
    failed = 0

    for result in results:
        status = "✓" if result.passed else "✗"
        color = "\033[92m" if result.passed else "\033[91m"
        reset = "\033[0m"

        print(f"{color}{status}{reset} {result.name}")
        if verbose or not result.passed:
            print(f"  {result.message}")

        if result.passed:
            passed += 1
        else:
            failed += 1

    print("\n" + "-" * 50)
    print(f"Results: {passed} passed, {failed} failed")
    print("-" * 50 + "\n")

    return failed == 0


def main():
    verbose = "--verbose" in sys.argv or "-v" in sys.argv
    success = run_all_tests(verbose)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
