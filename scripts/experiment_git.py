#!/usr/bin/env python3
"""
Git integration for experiment versioning.

Manages experiment branches, tracks lineage, and enables comparison.

Usage:
    python experiment_git.py create EXP-001 "Baseline model"
    python experiment_git.py compare EXP-001 EXP-002
    python experiment_git.py lineage EXP-003
    python experiment_git.py list
"""

import sys
import subprocess
import json
import re
from pathlib import Path
from datetime import datetime


def run_git(args: list, check: bool = True) -> subprocess.CompletedProcess:
    """Run a git command."""
    return subprocess.run(
        ["git"] + args,
        capture_output=True,
        text=True,
        check=check
    )


def get_current_branch() -> str:
    """Get the current git branch."""
    result = run_git(["branch", "--show-current"])
    return result.stdout.strip()


def branch_exists(branch: str) -> bool:
    """Check if a branch exists."""
    result = run_git(["branch", "--list", branch], check=False)
    return bool(result.stdout.strip())


def create_experiment_branch(exp_id: str, description: str, base_branch: str = None):
    """Create a new experiment branch."""
    branch_name = f"exp/{exp_id}"

    if branch_exists(branch_name):
        print(f"Error: Branch {branch_name} already exists")
        return False

    # Use current branch as base if not specified
    if base_branch is None:
        base_branch = get_current_branch()

    # Create and checkout new branch
    run_git(["checkout", "-b", branch_name, base_branch])

    # Create experiment metadata
    metadata = {
        "experiment_id": exp_id,
        "description": description,
        "base_branch": base_branch,
        "created": datetime.now().isoformat(),
        "status": "active"
    }

    # Store metadata in a commit
    metadata_file = Path(f".experiment/{exp_id}.json")
    metadata_file.parent.mkdir(exist_ok=True)
    metadata_file.write_text(json.dumps(metadata, indent=2))

    run_git(["add", str(metadata_file)])
    run_git(["commit", "-m", f"Create experiment {exp_id}: {description}"])

    print(f"Created experiment branch: {branch_name}")
    print(f"  Base: {base_branch}")
    print(f"  Description: {description}")

    return True


def list_experiments():
    """List all experiment branches."""
    result = run_git(["branch", "-a", "--list", "exp/*"])
    branches = [b.strip().replace("* ", "") for b in result.stdout.split("\n") if b.strip()]

    if not branches:
        print("No experiment branches found")
        return []

    experiments = []
    for branch in branches:
        exp_id = branch.replace("exp/", "")

        # Try to get metadata
        metadata_file = Path(f".experiment/{exp_id}.json")
        if metadata_file.exists():
            metadata = json.loads(metadata_file.read_text())
        else:
            metadata = {"experiment_id": exp_id, "description": "Unknown"}

        experiments.append({
            "branch": branch,
            "id": exp_id,
            **metadata
        })

    print(f"\nExperiment Branches ({len(experiments)}):\n")
    print(f"{'ID':<12} {'Status':<10} {'Base':<15} {'Description'}")
    print("-" * 60)

    for exp in experiments:
        print(f"{exp['id']:<12} {exp.get('status', 'unknown'):<10} {exp.get('base_branch', '-'):<15} {exp.get('description', '')[:30]}")

    return experiments


def get_experiment_lineage(exp_id: str):
    """Get the lineage (parent experiments) for an experiment."""
    lineage = []
    current = exp_id

    while current:
        metadata_file = Path(f".experiment/{current}.json")
        if not metadata_file.exists():
            break

        metadata = json.loads(metadata_file.read_text())
        lineage.append(metadata)

        # Check if base is another experiment
        base = metadata.get("base_branch", "")
        if base.startswith("exp/"):
            current = base.replace("exp/", "")
        else:
            # Add the non-experiment base
            lineage.append({"branch": base, "description": "Base branch"})
            break

    print(f"\nLineage for {exp_id}:\n")
    for i, exp in enumerate(lineage):
        prefix = "  " * i + ("└─ " if i > 0 else "")
        exp_id = exp.get("experiment_id", exp.get("branch", "?"))
        desc = exp.get("description", "")[:40]
        print(f"{prefix}{exp_id}: {desc}")

    return lineage


def compare_experiments(exp1: str, exp2: str):
    """Compare two experiment branches."""
    branch1 = f"exp/{exp1}" if not exp1.startswith("exp/") else exp1
    branch2 = f"exp/{exp2}" if not exp2.startswith("exp/") else exp2

    if not branch_exists(branch1):
        print(f"Error: Branch {branch1} not found")
        return

    if not branch_exists(branch2):
        print(f"Error: Branch {branch2} not found")
        return

    print(f"\nComparing {exp1} vs {exp2}:\n")

    # Get diff stats
    result = run_git(["diff", "--stat", branch1, branch2], check=False)
    print("File changes:")
    print(result.stdout or "  No differences")

    # Get commit difference
    result = run_git(["log", "--oneline", f"{branch1}..{branch2}"], check=False)
    commits_in_2 = len(result.stdout.strip().split("\n")) if result.stdout.strip() else 0

    result = run_git(["log", "--oneline", f"{branch2}..{branch1}"], check=False)
    commits_in_1 = len(result.stdout.strip().split("\n")) if result.stdout.strip() else 0

    print(f"\nCommits ahead:")
    print(f"  {exp1}: {commits_in_1} commits not in {exp2}")
    print(f"  {exp2}: {commits_in_2} commits not in {exp1}")

    # Compare results if they exist
    for branch, exp in [(branch1, exp1), (branch2, exp2)]:
        result = run_git(["show", f"{branch}:results/publication_stats.json"], check=False)
        if result.returncode == 0:
            try:
                stats = json.loads(result.stdout)
                print(f"\n{exp} metrics:")
                for key in ["c_statistic", "auc", "primary_hr"]:
                    if key in stats:
                        print(f"  {key}: {stats[key]}")
            except json.JSONDecodeError:
                pass


def mark_experiment_complete(exp_id: str, results_summary: str = None):
    """Mark an experiment as complete with results."""
    metadata_file = Path(f".experiment/{exp_id}.json")

    if not metadata_file.exists():
        print(f"Error: Experiment {exp_id} not found")
        return False

    metadata = json.loads(metadata_file.read_text())
    metadata["status"] = "completed"
    metadata["completed"] = datetime.now().isoformat()
    if results_summary:
        metadata["results_summary"] = results_summary

    metadata_file.write_text(json.dumps(metadata, indent=2))

    run_git(["add", str(metadata_file)])
    run_git(["commit", "-m", f"Complete experiment {exp_id}"])

    print(f"Marked {exp_id} as completed")
    return True


def main():
    if len(sys.argv) < 2:
        print("Usage: experiment_git.py <command> [args]")
        print("\nCommands:")
        print("  create <exp_id> <description>  Create new experiment branch")
        print("  list                           List all experiments")
        print("  lineage <exp_id>               Show experiment lineage")
        print("  compare <exp1> <exp2>          Compare two experiments")
        print("  complete <exp_id> [summary]    Mark experiment complete")
        sys.exit(1)

    command = sys.argv[1]

    if command == "create":
        if len(sys.argv) < 4:
            print("Usage: experiment_git.py create <exp_id> <description>")
            sys.exit(1)
        create_experiment_branch(sys.argv[2], sys.argv[3])

    elif command == "list":
        list_experiments()

    elif command == "lineage":
        if len(sys.argv) < 3:
            print("Usage: experiment_git.py lineage <exp_id>")
            sys.exit(1)
        get_experiment_lineage(sys.argv[2])

    elif command == "compare":
        if len(sys.argv) < 4:
            print("Usage: experiment_git.py compare <exp1> <exp2>")
            sys.exit(1)
        compare_experiments(sys.argv[2], sys.argv[3])

    elif command == "complete":
        if len(sys.argv) < 3:
            print("Usage: experiment_git.py complete <exp_id> [summary]")
            sys.exit(1)
        summary = sys.argv[3] if len(sys.argv) > 3 else None
        mark_experiment_complete(sys.argv[2], summary)

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()
