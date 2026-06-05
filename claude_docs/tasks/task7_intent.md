# Git Repository Mirroring Implementation

## Decision

We have decided to maintain two GitHub repositories containing identical content.

Canonical repository:

buyflorabella/buyflorabella-marketohub-v2

Deployment repository:

boardmansgameremotedeveloper/buyflorabella-marketohub-v2

The boardmansgameremotedeveloper repository exists because Shopify can connect to repositories under that GitHub account, while the canonical development repository remains under buyflorabella.

## Architecture

* buyflorabella/buyflorabella-marketohub-v2 remains the source of truth.
* All development work continues in the buyflorabella repository.
* The boardmansgameremotedeveloper repository is a synchronized mirror.
* Shopify will connect to and deploy from the boardmansgameremotedeveloper repository.
* Developers should never need to manually keep the two repositories synchronized.

## Requirements

Implement automatic repository mirroring from:

buyflorabella/buyflorabella-marketohub-v2

to

boardmansgameremotedeveloper/buyflorabella-marketohub-v2

Requirements:

1. Mirror all branches.
2. Mirror all tags.
3. Mirror all refs required to keep repositories functionally identical.
4. Synchronization should occur automatically whenever changes are pushed to the canonical repository.
5. No manual push to the mirror repository should be required.
6. The mirror repository should be treated as deployment-only.
7. Document all required GitHub secrets, permissions, and repository settings.
8. Document initial setup steps.
9. Document verification and recovery procedures.

## Deliverables

Provide:

* GitHub Actions workflow YAML
* Required GitHub secret configuration
* Repository configuration steps
* Initial synchronization procedure
* Validation procedure
* Rollback/recovery procedure

Implement the mirroring solution and provide all files and instructions necessary for deployment.
