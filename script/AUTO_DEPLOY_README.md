# Auto-Deploy Script — Comprehensive Deployment Workflow

## Overview

`auto-deploy.sh` automates the entire deployment pipeline from code changes to production. It orchestrates all the steps needed to safely deploy new features and fixes to production.

## Quick Start

```bash
# Interactive mode (asks for confirmation at each step)
./script/auto-deploy.sh

# Auto-proceed without prompts
./script/auto-deploy.sh --yes

# Show help
./script/auto-deploy.sh --help

# Via manage script
./script/manage --auto-deploy
```

## Workflow Steps

The script performs 6 sequential steps:

### Step 1: Verify Dev Worktree
- Checks that script is running from `dev/` worktree
- Fails if run from wrong location
- Prevents accidental deployment from production

### Step 2: Create Release Candidate
- Runs `release-candidate.sh`
- Creates git tag with version number
- Bumps version in `settings.dev.txt`
- Commits version bump

### Step 3: Commit Pending Changes
- Checks for uncommitted changes in dev
- Prompts to commit all changes
- Uses standard co-author commit message
- Can skip if no changes

### Step 4: Verify Git Branch State
- Confirms current branch is `dev`
- Counts commits ahead of `master`
- Warns if no new commits (nothing to deploy)
- Allows proceeding with partial state

### Step 5: Merge to Master
- Switches to `prod/` worktree
- Checks out `master` branch
- Merges `dev` into `master`
- Fails on merge conflicts (requires manual resolution)

### Step 6: Update Production
- Runs `update-production.sh` from prod worktree
- Deploys backend and frontend
- Runs full test validation
- Verifies production health

## When to Use

### Best For:
- Regular feature deployments
- Bug fix releases
- Version bumps and releases
- Automated CI/CD integration

### When to Skip:
- Hotfixes (use individual scripts in order)
- Emergency rollbacks (use `update-production.sh` directly)
- Manual testing required before merge

## Usage Examples

### Interactive Deployment
```bash
cd dev
./script/auto-deploy.sh
# Responds to prompts for each step
# Review plan, approve merges, validate results
```

### Automated CI/CD
```bash
cd dev
./script/auto-deploy.sh --yes
# Runs all steps without interaction
# Useful for scheduled deployments or CI pipelines
```

### Manual Workflow (without auto-deploy)
```bash
# Step 1: Tag and version
./script/release-candidate.sh

# Step 2: Verify and push
git log --oneline -5
git status

# Step 3: Merge manually
cd ../prod
git checkout master
git merge dev

# Step 4: Deploy
./script/update-production.sh
```

## Script Architecture

The script is modular with each workflow step as a separate function:

```bash
step_verify_dev_worktree()      # Safety check
step_create_release_candidate() # Tag & version
step_commit_changes()           # Git commit
step_verify_branch_state()      # Git audit
step_merge_to_master()          # Git merge
step_update_production()        # Deploy & validate
step_final_report()             # Summary
```

## Return Values

- `0` = Success: All steps completed
- `1` = Failure: Aborted at step X (see error message)

## Safety Features

✅ **Worktree Verification** — Must run from dev/  
✅ **Branch Validation** — Confirms dev and master state  
✅ **Interactive Confirmation** — Pauses before risky operations  
✅ **Merge Conflict Detection** — Fails safely on conflicts  
✅ **Production Health Check** — Validates after deployment  

## Troubleshooting

### Merge Conflict
If merge fails due to conflicts:
```bash
# Go to prod worktree
cd ../prod

# Resolve conflicts manually
git status
# Edit conflicted files
git add .
git commit -m "Resolved merge conflicts"

# Continue deployment
./script/update-production.sh
```

### Wrong Worktree
If script reports wrong worktree:
```bash
# Ensure you are in dev
cd /var/www/html/<project>/dev
./script/auto-deploy.sh
```

### Production Update Failed
If deployment validation fails:
```bash
# Check error messages from update-production.sh
# Debug in prod worktree
cd ../prod

# Run tests manually
./script/testing_framework.sh --all

# Check backend status
./script/manage --backend

# Fix issues and retry
./script/update-production.sh
```

## Environment Variables

- `AUTO_YES=true` — Auto-proceed without prompts (same as `--yes` flag)

## Integration with Development Workflow

This script completes the development cycle:

1. **Development Phase** — Write code in `dev/` branch
2. **Testing Phase** — Run `./script/testing_framework.sh`
3. **Release Phase** — Run `./script/auto-deploy.sh`
4. **Production Phase** — Validate at `<project>.boardmansgame.com`

## Manual vs Automated

### Use `auto-deploy.sh` when:
- Features are complete and tested
- Multiple steps need to be coordinated
- You want audit trail of deployment

### Use individual scripts when:
- Debugging (run steps individually)
- Selective deployment (skip some steps)
- Emergency procedures (manual control)

## Monitoring Deployments

After deployment, monitor production:

```bash
# Check frontend
curl -s https://<project>.boardmansgame.com/api/health

# Check backend
curl -s https://admin.<project>.boardmansgame.com/api/health

# Run smoke tests
cd prod
./script/testing_framework.sh --all
```

## Future Enhancements

Potential improvements for the script:
- Pre-flight checks (branch protection, CI status)
- Automated rollback on deployment failure
- Slack/email notifications
- Deployment history logging
- Canary deployments
- A/B testing support
