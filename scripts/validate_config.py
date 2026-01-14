#!/usr/bin/env python3
"""
Validate experiment configuration files for reproducibility requirements.

Exit codes:
  0 - Valid
  1 - Warnings (non-blocking)
  2 - Errors (blocking)
"""

import sys
import json
import yaml
from pathlib import Path


def validate_config(config_path: str) -> tuple[list, list]:
    """Validate a YAML config file for reproducibility."""
    errors = []
    warnings = []

    path = Path(config_path)
    if not path.exists():
        return [f"Config file not found: {config_path}"], []

    try:
        with open(path) as f:
            config = yaml.safe_load(f)
    except yaml.YAMLError as e:
        return [f"Invalid YAML: {e}"], []

    if not config:
        return ["Empty config file"], []

    # Check for reproducibility section
    repro = config.get('reproducibility', {})

    if 'seed' not in repro:
        errors.append("Missing 'reproducibility.seed' - random seed required")
    elif not isinstance(repro.get('seed'), int):
        errors.append("'reproducibility.seed' must be an integer")

    if 'python_version' not in repro:
        warnings.append("Missing 'reproducibility.python_version'")

    # Check for experiment section
    exp = config.get('experiment', {})

    if 'id' not in exp:
        warnings.append("Missing 'experiment.id'")

    if 'hypothesis' not in exp:
        warnings.append("Missing 'experiment.hypothesis' - document your hypothesis")

    # Check for data section
    data = config.get('data', {})

    if 'source' not in data:
        errors.append("Missing 'data.source' - specify data path")
    elif data.get('source', '').startswith('/Users/'):
        warnings.append("Hardcoded path in 'data.source' - consider using relative path")

    if 'version' not in data:
        warnings.append("Missing 'data.version' - track data versions")

    return errors, warnings


def main():
    if len(sys.argv) < 2:
        print("Usage: validate_config.py <config.yaml>")
        sys.exit(1)

    config_path = sys.argv[1]
    errors, warnings = validate_config(config_path)

    result = {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "config_path": config_path
    }

    # Print as JSON for hook consumption
    print(json.dumps(result))

    if errors:
        sys.exit(2)
    elif warnings:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
