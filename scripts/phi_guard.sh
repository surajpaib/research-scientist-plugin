#!/bin/bash
# PHI Guard Hook - Blocks access to protected health information paths
#
# This script checks if a file path is in a protected PHI location and
# returns appropriate exit codes:
#   0 = Path is safe to access
#   1 = Path is PHI (blocked)
#   2 = Path needs warning (clinical data headers only)

FILE_PATH="$1"

# Exit early if no path provided
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Define PHI patterns (modify these for your project)
PHI_PATTERNS=(
    # Segmentation data (HIPAA protected images)
    "/Volumes/brossd/TAVR_Segmentations"
    "/Volumes/*/Segmentations"
    "*/TAVR_Segmentations*"

    # Raw clinical data (patient-level PHI)
    "*TAVR_clinical*.csv"
    "*_clinical.csv"
    "*patient*.csv"
    "*mrn*"
    "*MRN*"

    # Common PHI file patterns
    "*.nrrd"
    "*.dcm"
    "*.dicom"
    "*credentials*"
    "*.env"
    "*secrets*"
)

# Define allowed patterns (exceptions within PHI areas)
ALLOWED_PATTERNS=(
    # Aggregated results are safe
    "results/*.json"
    "results/*.csv"
    "results/figures/*"

    # Publication outputs are safe
    "paper/*"
    "vault/*"

    # Feature files (pre-extracted, no PHI)
    "features/*.npz"

    # Code is always safe
    "*.py"
    "*.md"
    "*.yaml"
    "*.yml"
    "*.sh"
    "*.js"
    "*.json"  # except credentials.json handled above
)

# Check if path matches any allowed pattern first
for pattern in "${ALLOWED_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" == $pattern ]]; then
        exit 0
    fi
done

# Check if path matches any PHI pattern
for pattern in "${PHI_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" == $pattern ]]; then
        echo "[PHI GUARD] BLOCKED: Access to '$FILE_PATH' is not allowed."
        echo "[PHI GUARD] This path contains Protected Health Information (PHI)."
        echo "[PHI GUARD] Use aggregated results in 'results/' instead."
        exit 1
    fi
done

# Special case: clinical CSV headers only (warn but allow)
if [[ "$FILE_PATH" == *"clinical"*".csv" ]]; then
    echo "[PHI GUARD] WARNING: Clinical data detected."
    echo "[PHI GUARD] Only reading headers (head -1) is permitted."
    exit 2
fi

# Path is safe
exit 0
