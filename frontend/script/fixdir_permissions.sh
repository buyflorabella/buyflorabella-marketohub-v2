#!/usr/bin/env bash
#
# NOTE: Run as root/admin
#
# This script operates in your CURRENT working directory.

TARGET_DIR="$PWD"
echo "Applying permissions to: $TARGET_DIR"

# Apache owns everything
chown -R apache:apache "$TARGET_DIR"

# Directories: 2775
find "$TARGET_DIR" -type d -exec chmod 2775 {} \;

# Normal files: default 664 (rw-rw-r--)
find "$TARGET_DIR" -type f -exec chmod 664 {} \;

# Make shell scripts executable
find "$TARGET_DIR" -type f -name "*.sh" -exec chmod 775 {} \;

# Make python scripts executable if they have a shebang
find "$TARGET_DIR" -type f -name "*.py" \
    -exec grep -Iq "^#\!.*python" {} \; \
    -exec chmod 775 {} \; 2>/dev/null

# Make any file executable if it ALREADY had +x before the mass chmod
# (restores executability)
find "$TARGET_DIR" -type f -perm -0100 -exec chmod 775 {} \;

# Set GID on directories
find "$TARGET_DIR" -type d -exec chmod g+s {} \;

# Shared Git repo for group
git -C "$TARGET_DIR" config core.sharedRepository group

echo "Done. Permissions updated for: $TARGET_DIR"
