#!/bin/bash
# Pre-commit hook for research projects
# Validates staged changes before commit

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo "Running pre-commit checks..."

# Check 1: Validate YAML configs
if git diff --cached --name-only | grep -q "\.yaml$\|\.yml$"; then
    echo "Checking YAML configs..."
    for file in $(git diff --cached --name-only | grep "\.yaml$\|\.yml$"); do
        if [ -f "$file" ]; then
            python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null || {
                echo -e "${RED}Invalid YAML: $file${NC}"
                ERRORS=$((ERRORS + 1))
            }
        fi
    done
fi

# Check 2: No hardcoded paths in Python files
if git diff --cached --name-only | grep -q "\.py$"; then
    echo "Checking for hardcoded paths..."
    for file in $(git diff --cached --name-only | grep "\.py$"); do
        if [ -f "$file" ]; then
            if grep -n "/Users/\|/home/" "$file" | grep -v "#.*hardcoded\|# noqa" >/dev/null 2>&1; then
                echo -e "${YELLOW}Warning: Hardcoded path in $file${NC}"
                grep -n "/Users/\|/home/" "$file" | grep -v "#.*hardcoded\|# noqa" | head -3
                WARNINGS=$((WARNINGS + 1))
            fi
        fi
    done
fi

# Check 3: No secrets in staged files
echo "Checking for secrets..."
SECRETS_PATTERN="password\s*=\s*['\"][^'\"]+['\"]|api_key\s*=\s*['\"][^'\"]+['\"]|secret\s*=\s*['\"][^'\"]+['\"]"
for file in $(git diff --cached --name-only); do
    if [ -f "$file" ]; then
        if grep -iE "$SECRETS_PATTERN" "$file" >/dev/null 2>&1; then
            echo -e "${RED}Potential secret in $file${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    fi
done

# Check 4: Paper stats should be verified
if git diff --cached --name-only | grep -q "paper\.md$"; then
    if [ -f "results/publication_stats.json" ]; then
        PAPER_MOD=$(git diff --cached paper/paper.md 2>/dev/null | grep "^+.*[0-9]\+\.[0-9]\+" | wc -l)
        if [ "$PAPER_MOD" -gt 0 ]; then
            echo -e "${YELLOW}Warning: Paper contains new numbers - verify with /run-analysis --validate${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
fi

# Check 5: Ensure requirements.txt exists if Python files changed
if git diff --cached --name-only | grep -q "\.py$"; then
    if [ ! -f "requirements.txt" ] && [ ! -f "environment.yml" ]; then
        echo -e "${YELLOW}Warning: No requirements.txt or environment.yml found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
fi

# Summary
echo ""
if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}Pre-commit failed: $ERRORS error(s), $WARNINGS warning(s)${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}Pre-commit passed with $WARNINGS warning(s)${NC}"
    exit 0
else
    echo -e "${GREEN}Pre-commit passed${NC}"
    exit 0
fi
