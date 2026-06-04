###############################################
# File: scripts/scriptname.sh
#
# PURPOSE:
# Generate a clean, flat list of ONLY directory
# names (no files) from the user's current
# working directory downward. The result is
# ideal for pasting into ChatGPT so the model
# understands your project structure.
###############################################

#!/usr/bin/env bash

set -e

OUTPUT_FILE="project_directories.txt"

echo "# Directory Listing (Directories Only)" > "$OUTPUT_FILE"
echo "# Generated: $(date)" >> "$OUTPUT_FILE"
echo "# Root: $(pwd)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "Collecting directory tree..."

# List directories only, recursively
find . -type d \
    | sed 's|^\./||' \
    | sort \
    >> "$OUTPUT_FILE"

echo "Created: ${OUTPUT_FILE}"
echo "Done."
