# Continuous Integration Guide

This guide explains how to use GitHub Actions for automated validation of your research project.

## Overview

The Research CI workflow automatically validates:
- YAML configuration files (syntax, reproducibility requirements)
- Paper build process (citations, Pandoc conversion)
- Python code quality (linting with ruff)
- Vault structure (required files, broken wikilinks)

## Getting Started

### Enable CI for Your Project

1. Copy the workflow template to your project:
   ```bash
   mkdir -p .github/workflows
   cp ~/.claude/plugins/research-scientist/templates/project/.github/workflows/research.yml \
      .github/workflows/research.yml
   ```

2. Commit and push:
   ```bash
   git add .github/workflows/research.yml
   git commit -m "Add research CI workflow"
   git push
   ```

3. GitHub Actions will now run on every push to `main` and on pull requests.

### View CI Results

1. Go to your repository on GitHub
2. Click the "Actions" tab
3. View workflow runs and their status

## What CI Validates

### 1. Configuration Validation

**What it checks:**
- YAML syntax is valid
- Config files have required fields (seed, data paths)
- No hardcoded absolute paths (`/Users/...`)

**Why it matters:**
- Ensures reproducibility requirements are met
- Catches config errors before they cause analysis failures

### 2. Paper Build

**What it checks:**
- Citation keys used in paper.md exist in references.bib
- Pandoc can process the paper (syntax check)

**Why it matters:**
- Prevents build failures when generating DOCX
- Catches missing citations early

### 3. Python Linting

**What it checks:**
- Basic syntax errors
- Import organization
- Common style issues

**Why it matters:**
- Maintains code quality
- Catches errors before runtime

### 4. Vault Validation

**What it checks:**
- Required vault files exist (Home.md, Statistical Decisions.md, Session Log.md)
- Wikilinks point to existing files

**Why it matters:**
- Ensures documentation structure is maintained
- Prevents broken links in knowledge base

## Customizing the Workflow

### Change Trigger Paths

Edit the `paths` section to specify which files trigger CI:

```yaml
on:
  push:
    paths:
      - 'approaches/**'    # Analysis code
      - 'paper/**'         # Paper files
      - 'vault/**'         # Vault documentation
      - '*.py'             # Python scripts
      - 'requirements.txt' # Dependencies
```

### Add Analysis Validation

Uncomment the `validate-analysis` job for projects where you want to run actual analysis:

```yaml
validate-analysis:
  name: Validate Analysis
  runs-on: self-hosted  # Use self-hosted for data access

  steps:
    - name: Run analysis
      run: |
        python -m approaches.body_composition.scripts.clinical_analysis --validate
```

**Important**: Only enable this if:
- Your data is accessible to the CI runner
- You're using a self-hosted runner for PHI protection
- Analysis runs quickly enough for CI

### Add Custom Checks

Add project-specific validation:

```yaml
- name: Check custom requirements
  run: |
    # Your custom validation script
    python scripts/validate_project.py
```

## Self-Hosted Runners

For projects with PHI or requiring local data access, use a self-hosted runner.

### Setup Self-Hosted Runner

1. Go to your repo → Settings → Actions → Runners
2. Click "New self-hosted runner"
3. Follow the setup instructions for your OS
4. Update workflow to use `runs-on: self-hosted`

### Security Considerations

For self-hosted runners with PHI access:
- Run on isolated machine with no external network access
- Use ephemeral runners when possible
- Don't store credentials in workflow files
- Review workflow changes carefully

## Branch Protection

Use CI with branch protection for quality control:

1. Go to repo → Settings → Branches
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select the CI jobs you want required

This ensures all changes pass CI before merging to main.

## Workflow Status Badge

Add a status badge to your README:

```markdown
[![Research CI](https://github.com/username/repo/actions/workflows/research.yml/badge.svg)](https://github.com/username/repo/actions/workflows/research.yml)
```

## Troubleshooting

### CI Fails on Paper Build

**Symptom**: "Citation key not found" error

**Fix**: Add missing citation to `paper/references.bib`:
```bash
# Use add-citation skill
/add-citation 10.1234/example.doi
```

### CI Fails on Config Validation

**Symptom**: "Hardcoded path" warning

**Fix**: Use relative paths or environment variables:
```yaml
# Bad
data_path: /Users/bro/data/file.csv

# Good
data_path: ${DATA_DIR}/file.csv
# or
data_path: ../data/file.csv
```

### CI Times Out

**Symptom**: Workflow exceeds time limit

**Fix**:
1. Increase timeout in workflow:
   ```yaml
   jobs:
     job-name:
       timeout-minutes: 30
   ```
2. Split long jobs into smaller steps
3. Use caching for dependencies

### Vault Validation Finds Broken Links

**Symptom**: "Broken wikilink" warnings

**Fix**:
1. Create the missing file
2. Update the link to the correct file name
3. If intentional (placeholder), add to ignore list

## Manual Trigger

Run CI manually without pushing:

1. Go to Actions tab in GitHub
2. Select "Research CI" workflow
3. Click "Run workflow"
4. Select branch and click "Run"

Or use GitHub CLI:
```bash
gh workflow run research.yml
```

## Integration with Claude Code

After CI runs, check results in Claude Code:

```
> "Check the status of my latest CI run"
```

Use CI failures to guide fixes:
```
> "The CI is failing on citation validation. Help me fix it."
```
