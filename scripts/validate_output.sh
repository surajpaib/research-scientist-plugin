#!/bin/bash
# PostToolUse Validation Hook - Scans newly created files for PHI leakage
#
# This script runs AFTER a file is written to check if it contains PHI.
# Unlike phi_guard.sh (which blocks reads), this WARNS about PHI in outputs.
#
# Exit codes:
#   0 = File is safe or not a data file
#   (Always exits 0 - this is a warning hook, not a blocking hook)
#
# Usage:
#   validate_output.sh <tool_input>

TOOL_INPUT="$1"

# Extract file path from tool input (handles JSON format)
extract_file_path() {
    local input="$1"

    # Try to extract file_path from JSON
    if echo "$input" | grep -q '"file_path"'; then
        echo "$input" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p'
    else
        # Assume input is the path directly
        echo "$input"
    fi
}

FILE_PATH=$(extract_file_path "$TOOL_INPUT")

# Exit early if no path or path doesn't exist
if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
    exit 0
fi

# Only validate files in results/ or features/ directories
if [[ ! "$FILE_PATH" == *"/results/"* ]] && [[ ! "$FILE_PATH" == *"/features/"* ]]; then
    exit 0
fi

# =============================================================================
# PHI column patterns to detect
# =============================================================================
PHI_COLUMNS=(
    "mrn"
    "empi"
    "dob"
    "dod"
    "ssn"
    "date_of_birth"
    "date_of_death"
    "accession"
    "medical_record"
    "patient_id"
)

# =============================================================================
# Check CSV files for PHI columns
# =============================================================================
check_csv() {
    local file="$1"

    if [[ ! "$file" == *.csv ]]; then
        return 0
    fi

    local header
    header=$(head -1 "$file" 2>/dev/null)

    if [ -z "$header" ]; then
        return 0
    fi

    # Build regex pattern
    local pattern=""
    for col in "${PHI_COLUMNS[@]}"; do
        if [ -z "$pattern" ]; then
            pattern="$col"
        else
            pattern="$pattern|$col"
        fi
    done

    # Check for PHI columns
    local matches
    matches=$(echo "$header" | tr ',' '\n' | grep -iE "^($pattern)$" | head -3)

    if [ -n "$matches" ]; then
        echo ""
        echo "[PHI VALIDATION WARNING] ================================================"
        echo "[PHI VALIDATION] File may contain PHI columns: $file"
        echo "[PHI VALIDATION] Detected:"
        echo "$matches" | while read -r col; do
            echo "  - $col"
        done
        echo "[PHI VALIDATION] Consider:"
        echo "  1. Remove PHI columns before saving"
        echo "  2. Use filter_to_allowed_columns() from phi_utils.py"
        echo "  3. Verify this file should contain these columns"
        echo "[PHI VALIDATION] ========================================================"
        echo ""
    fi

    return 0
}

# =============================================================================
# Check JSON files for PHI patterns in values
# =============================================================================
check_json() {
    local file="$1"

    if [[ ! "$file" == *.json ]]; then
        return 0
    fi

    # Check for common PHI patterns in JSON values
    # Look for MRN-like patterns (6-10 digit numbers that aren't stats)
    # Look for date patterns (YYYY-MM-DD format)

    # Check for suspicious keys
    local suspicious
    suspicious=$(grep -iE '"(mrn|patient_id|dob|dod|ssn|accession)"[[:space:]]*:' "$file" 2>/dev/null | head -3)

    if [ -n "$suspicious" ]; then
        echo ""
        echo "[PHI VALIDATION WARNING] ================================================"
        echo "[PHI VALIDATION] JSON may contain PHI keys: $file"
        echo "[PHI VALIDATION] Detected suspicious keys - please verify"
        echo "[PHI VALIDATION] ========================================================"
        echo ""
    fi

    return 0
}

# =============================================================================
# Run validation
# =============================================================================
check_csv "$FILE_PATH"
check_json "$FILE_PATH"

# Always exit 0 (warning only, don't block)
exit 0
