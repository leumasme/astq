# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automating various tasks in the repository.

## Workflows

### `test.yml`

This workflow runs on every push to the main/master branch and on every pull request to these branches. It:

1. Sets up Node.js (testing on both Node.js 18.x and 20.x)
2. Installs dependencies
3. Builds the project
4. Runs linting
5. Runs tests

### `release.yml`

This workflow runs when a tag matching the pattern `v*.*.*` (e.g., `v1.2.3`) is pushed. It:

1. Sets up Node.js
2. Installs dependencies
3. Builds the project
4. Runs tests
5. Extracts release notes from CHANGES_SUMMARY.md (if available)
6. Creates a GitHub Release with the built files
7. Publishes the package to npm

## Required Secrets

For the release workflow to work properly, you need to set up the following secrets in your repository:

- `NPM_TOKEN`: An npm access token with publish permissions

The `GITHUB_TOKEN` is automatically provided by GitHub Actions and doesn't need to be set up manually.

## Creating a Release

To create a new release:

1. Update the version in `package.json`
2. Update `CHANGES_SUMMARY.md` with the changes in the new version
3. Commit these changes
4. Create and push a new tag:
   ```
   git tag v1.2.3
   git push origin v1.2.3
   ```

The release workflow will automatically create a GitHub release and publish to npm.