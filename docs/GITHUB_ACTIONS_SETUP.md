# GitHub Actions CI/CD Setup Guide

This guide explains how to set up GitHub Actions to run Cypress tests automatically on push or pull request to the main branch.

## Prerequisites

1. A GitHub repository for your project
2. A Supabase project with test data
3. A test user account in your Supabase project

## Step-by-Step Setup

### 1. Add GitHub Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

#### Required Secrets:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `CYPRESS_TEST_USER_EMAIL` - Email for the test user (e.g., `test@example.com`)
- `CYPRESS_TEST_USER_PASSWORD` - Password for the test user

#### Optional Secrets (for Cypress Dashboard):

- `CYPRESS_RECORD_KEY` - If you want to record test results to Cypress Dashboard

### 2. Create Test User in Supabase

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Users
3. Click "Add user" → "Create new user"
4. Use the same email and password as your GitHub secrets
5. Verify the email address if needed

### 3. Choose Your Workflow

We've created two workflow options:

#### Option 1: Basic Cypress Tests (`cypress.yml`)

- Runs Cypress tests only
- Simpler setup
- Good for getting started

#### Option 2: Comprehensive CI (`ci.yml`)

- Includes linting and formatting checks
- Runs tests in parallel for faster execution
- Includes Cypress Dashboard integration (optional)

### 4. Workflow Configuration

The workflows are already configured in `.github/workflows/`. They will:

1. Trigger on:
   - Push to main branch
   - Pull requests targeting main branch

2. Run the following steps:
   - Check out code
   - Set up Node.js 20
   - Install dependencies
   - Create .env.local with secrets
   - Build the application
   - Start the server
   - Run Cypress tests
   - Upload screenshots/videos on failure

### 5. Verify Setup

1. Make a small change to your code
2. Create a pull request or push to main
3. Check the "Actions" tab in your GitHub repository
4. You should see the workflow running

### 6. Troubleshooting

#### Tests Failing Due to Authentication

- Ensure your test user exists in Supabase
- Verify the email is confirmed
- Check that the credentials in GitHub secrets match

#### Environment Variables Not Working

- Double-check secret names match exactly
- Ensure no extra spaces in secret values
- Verify Supabase URL includes `https://`

#### Timeouts

- The workflow has a 30-minute timeout
- Individual tests have 10-second timeouts
- Adjust in `cypress.config.ts` if needed

### 7. Cypress Dashboard Integration (Optional)

To use Cypress Dashboard for test analytics:

1. Sign up at https://dashboard.cypress.io
2. Create a new project
3. Copy the Record Key
4. Add `CYPRESS_RECORD_KEY` to GitHub secrets
5. Update `cypress.yml` to set `record: true`

### 8. Running Specific Tests

To run only specific test files in CI, modify the workflow:

```yaml
- name: Run Cypress tests
  uses: cypress-io/github-action@v6
  with:
    spec: 'cypress/e2e/login.cy.ts,cypress/e2e/dashboard.cy.ts'
    # ... other config
```

### 9. Parallel Testing

The `ci.yml` workflow includes parallel testing setup:

- Tests are split across 2 containers
- Requires Cypress Dashboard (record key)
- Reduces total test time

### 10. Best Practices

1. **Keep test user data minimal** - Only create necessary test data
2. **Use separate Supabase project** - Consider using a dedicated project for CI/CD
3. **Monitor usage** - GitHub Actions has usage limits on free tier
4. **Cache dependencies** - The workflows already cache npm dependencies
5. **Clean up test data** - Consider adding cleanup steps after tests

## Workflow Files

- `.github/workflows/cypress.yml` - Basic Cypress test runner
- `.github/workflows/ci.yml` - Comprehensive CI with linting and parallel tests

## Local Testing

Before pushing, test locally:

```bash
# Run linting
npm run lint

# Run Cypress tests
npm run cypress:headless

# Check formatting
npx prettier --check .
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cypress GitHub Action](https://github.com/cypress-io/github-action)
- [Cypress Dashboard](https://www.cypress.io/dashboard)
- [Supabase Documentation](https://supabase.com/docs)
