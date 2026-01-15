#!/bin/bash
# PHI Guard Hook - Blocks access to protected health information paths
#
# This script checks if a file path is in a protected PHI location.
# It reads patterns from .claude/phi_config.yaml if available,
# otherwise falls back to sensible defaults.
#
# Exit codes:
#   0 = Path is safe to access
#   1 = Path is PHI (blocked)
#
# Usage:
#   phi_guard.sh <file_path>

FILE_PATH="$1"

# Exit early if no path provided
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Find the project root (look for .claude/ directory)
find_project_root() {
    local dir="$PWD"
    while [ "$dir" != "/" ]; do
        if [ -d "$dir/.claude" ]; then
            echo "$dir"
            return 0
        fi
        dir="$(dirname "$dir")"
    done
    echo "$PWD"
}

PROJECT_ROOT="$(find_project_root)"
CONFIG_FILE="$PROJECT_ROOT/.claude/phi_config.yaml"

# =============================================================================
# Default patterns (used if no config file exists)
# =============================================================================
DEFAULT_PHI_PATTERNS=(
    "*.nrrd"
    "*.dcm"
    "*.dicom"
    "*.nii"
    "*.nii.gz"
    "*clinical*.csv"
    "*patient*.csv"
    "*mrn*"
    "*MRN*"
    "/Volumes/*/Segmentations*"
    "*/raw_data/*"
    "*credentials*"
    "*secrets*"
)

DEFAULT_ALLOWED_PATTERNS=(
    "results/*"
    "*/results/*"
    "paper/*"
    "*/paper/*"
    "vault/*"
    "*/vault/*"
    "features/*.npz"
    "features/*.csv"
    "*.py"
    "*.md"
    "*.yaml"
    "*.yml"
    "*.sh"
    "*.js"
    "*.json"
    "*.r"
    "*.R"
)

# =============================================================================
# Parse YAML config (simple parser - handles basic lists)
# =============================================================================
parse_yaml_list() {
    local file="$1"
    local key="$2"

    if [ ! -f "$file" ]; then
        return
    fi

    # Extract lines under the key until next key or end
    awk -v key="$key:" '
        $0 ~ "^"key {found=1; next}
        found && /^[a-z_]+:/ {found=0}
        found && /^  - / {gsub(/^  - ["'"'"']?|["'"'"']?$/, ""); print}
    ' "$file"
}

# =============================================================================
# Load patterns from config or use defaults
# =============================================================================
PHI_PATTERNS=()
ALLOWED_PATTERNS=()

if [ -f "$CONFIG_FILE" ]; then
    # Read from config file
    while IFS= read -r pattern; do
        [ -n "$pattern" ] && PHI_PATTERNS+=("$pattern")
    done < <(parse_yaml_list "$CONFIG_FILE" "phi_patterns")

    while IFS= read -r pattern; do
        [ -n "$pattern" ] && PHI_PATTERNS+=("$pattern")
    done < <(parse_yaml_list "$CONFIG_FILE" "project_phi_patterns")

    while IFS= read -r pattern; do
        [ -n "$pattern" ] && ALLOWED_PATTERNS+=("$pattern")
    done < <(parse_yaml_list "$CONFIG_FILE" "allowed_patterns")

    while IFS= read -r pattern; do
        [ -n "$pattern" ] && ALLOWED_PATTERNS+=("$pattern")
    done < <(parse_yaml_list "$CONFIG_FILE" "project_allowed_patterns")
fi

# Fall back to defaults if no patterns loaded
if [ ${#PHI_PATTERNS[@]} -eq 0 ]; then
    PHI_PATTERNS=("${DEFAULT_PHI_PATTERNS[@]}")
fi

if [ ${#ALLOWED_PATTERNS[@]} -eq 0 ]; then
    ALLOWED_PATTERNS=("${DEFAULT_ALLOWED_PATTERNS[@]}")
fi

# =============================================================================
# Default PHI column patterns for content scanning
# =============================================================================
DEFAULT_PHI_COLUMNS=(
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
    "social_security"
)

# Load content scanning config
CONTENT_SCANNING_ENABLED="true"
PHI_COLUMNS=()

if [ -f "$CONFIG_FILE" ]; then
    # Check if content scanning is enabled
    if grep -q "content_scanning:" "$CONFIG_FILE"; then
        enabled=$(awk '/content_scanning:/{found=1} found && /enabled:/{print $2; exit}' "$CONFIG_FILE")
        if [ "$enabled" = "false" ]; then
            CONTENT_SCANNING_ENABLED="false"
        fi
    fi

    # Load PHI column patterns
    while IFS= read -r col; do
        [ -n "$col" ] && PHI_COLUMNS+=("$col")
    done < <(parse_yaml_list "$CONFIG_FILE" "csv_phi_columns")
fi

# Fall back to defaults if no columns loaded
if [ ${#PHI_COLUMNS[@]} -eq 0 ]; then
    PHI_COLUMNS=("${DEFAULT_PHI_COLUMNS[@]}")
fi

# =============================================================================
# Content scanning function for CSV files
# =============================================================================
check_csv_headers() {
    local file="$1"

    # Only check CSV files
    if [[ ! "$file" == *.csv ]]; then
        return 0
    fi

    # Skip if content scanning disabled
    if [ "$CONTENT_SCANNING_ENABLED" = "false" ]; then
        return 0
    fi

    # Skip if file doesn't exist or isn't readable
    if [ ! -r "$file" ]; then
        return 0
    fi

    # Read first line (header)
    local header
    header=$(head -1 "$file" 2>/dev/null)

    if [ -z "$header" ]; then
        return 0
    fi

    # Build regex pattern from PHI columns
    local pattern=""
    for col in "${PHI_COLUMNS[@]}"; do
        if [ -z "$pattern" ]; then
            pattern="$col"
        else
            pattern="$pattern|$col"
        fi
    done

    # Check for PHI columns (case-insensitive)
    local matches
    matches=$(echo "$header" | tr ',' '\n' | grep -iE "^($pattern)$" | head -5)

    if [ -n "$matches" ]; then
        echo "[PHI GUARD] BLOCKED: CSV contains PHI column names"
        echo "[PHI GUARD] File: $file"
        echo "[PHI GUARD] Detected columns:"
        echo "$matches" | while read -r col; do
            echo "  - $col"
        done
        echo "[PHI GUARD] Remove PHI columns or add file to 'project_allowed_patterns' in .claude/phi_config.yaml"
        return 1
    fi

    return 0
}

# =============================================================================
# Pattern matching
# =============================================================================

# Check if path matches any allowed pattern first (whitelist)
for pattern in "${ALLOWED_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" == $pattern ]]; then
        # Even if path is allowed, check CSV content if it's a CSV file
        if ! check_csv_headers "$FILE_PATH"; then
            exit 1
        fi
        exit 0
    fi
done

# Check if path matches any PHI pattern (blacklist)
for pattern in "${PHI_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" == $pattern ]]; then
        echo "[PHI GUARD] BLOCKED: Access to '$FILE_PATH' is not allowed."
        echo "[PHI GUARD] This path matches PHI pattern: $pattern"
        echo "[PHI GUARD] Use aggregated results in 'results/' instead."
        echo "[PHI GUARD] To allow this path, add it to .claude/phi_config.yaml under 'project_allowed_patterns'"
        exit 1
    fi
done

# For paths not explicitly allowed or blocked, check CSV content
if ! check_csv_headers "$FILE_PATH"; then
    exit 1
fi

# Path is safe
exit 0
