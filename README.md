# OrangeHRM Automation Framework

End-to-end and API test automation for the OrangeHRM demo (`https://opensource-demo.orangehrmlive.com`), built with **Playwright + TypeScript**. It automates the full employee lifecycle: authentication, employee creation, role-based validation, update, API verification and deletion.

## Table of contents

1. [Setup instructions](#setup-instructions)
2. [Execution steps](#execution-steps)
3. [Key design decisions](#key-design-decisions)
4. [Project structure](#project-structure)
5. [The lifecycle test](#the-lifecycle-test)
6. [CI/CD](#cicd)
7. [Troubleshooting](#troubleshooting)
8. [Known limitations](#known-limitations)

---

## Setup instructions

### Prerequisites

- Node.js 20 or later
- Git
- Internet access to the OrangeHRM demo site

### 1. Clone and install

```bash
git clone https://github.com/AkanshuGupta/orangehrm-playwright-automation.git
cd orangehrm-playwright-automation
npm ci
```

### 2. Install the browser

```bash
npx playwright install --with-deps chromium
```

### 3. Create the environment file

Copy the template and fill in the values:

```bash
cp .env.example .env.dev
```

On Windows PowerShell use `copy .env.example .env.dev`.

Contents of `.env.dev` for the public demo:

```
BASE_URL=https://opensource-demo.orangehrmlive.com
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin123
ESS_DEFAULT_PASSWORD=Test@12345
```

`.env.*` files are gitignored. Only `.env.example` is committed.

### 4. Verify the setup

```bash
npx playwright test --project=setup
```

This logs in once as admin and creates `.auth/admin.json`. If that file appears, the framework is ready.

### Optional: other environments

Create `.env.qa` or `.env.stage` with the same keys and run with `ENV=qa` or `ENV=stage`. No code changes are needed. On Windows, the `test:qa` script uses `cross-env`, so install it once with `npm i -D cross-env` if it is missing.

---

## Execution steps

### Run everything

```bash
npm test
```

The `setup` project runs first (admin login), then the `e2e` and `api` projects.

### Run in headed mode (visible browser)

```bash
npm run test:headed          # whole suite
npm run test:e2e:headed      # UI tests only
```

### Run a subset

| Goal | Command |
|---|---|
| UI tests only | `npm run test:e2e` |
| API tests only | `npm run test:api` |
| One spec file | `npx playwright test employee-lifecycle` |
| One spec, visible, one worker | `npx playwright test employee-lifecycle --headed --workers=1` |
| Tests matching a title | `npx playwright test -g "invalid password"` |
| Another environment | `npm run test:qa` |

### Debug a failure

| Tool | Command |
|---|---|
| Step-through inspector | `npx playwright test employee-lifecycle --debug` |
| Interactive UI mode with timeline | `npx playwright test --ui` |
| Open the last HTML report | `npm run report` |

Failed tests keep a screenshot and video. A trace is captured on the first retry (CI) and can be opened with `npx playwright show-trace <trace.zip>`.

### Run in CI

Push to `main` or open a pull request. The pipeline in `.github/workflows/playwright.yml` runs two shards in parallel and publishes one merged HTML report as the `playwright-report` artifact. A Jenkins equivalent is in `Jenkinsfile`. See [CI/CD](#cicd) for the required variables.

---

## Key design decisions

| Decision | Why |
|---|---|
| **Playwright + TypeScript** | One runner covers UI and API tests, has auto-waiting and tracing built in, and fits CI well |
| **Layered structure** (tests → fixtures → pages and API clients → config) | Each layer has one job, and nothing depends upward, so the framework scales without tangling |
| **Page Object Model, no assertions inside pages** | Pages describe how to act. Specs decide what to verify. Locators stay private and are changed in one place |
| **Custom fixtures** | Page objects, unique test data and the API client are injected per test, so specs have no `new` calls or setup noise |
| **Login once, reuse the session** | A `setup` project saves `storageState`, so tests skip the login screen. It is faster and removes a common source of flakiness |
| **Explicit empty session for other users** | The e2e project starts every context as admin. Contexts for the ESS user and logged-out checks pass an empty `storageState` so they do not inherit it |
| **UI for actions, API for verification** | The UI performs create, update and delete, and the API confirms the backend state. This catches a success toast with nothing saved |
| **Unique data per test** | Faker-based factories give every test its own names, IDs and username, so parallel and sharded runs never collide on the shared demo |
| **Guaranteed cleanup** | The `trackEmployee` fixture deletes registered records through the API after the test, even when it fails |
| **No hard waits** | The framework relies on auto-waiting assertions and explicit conditions (URL, populated fields, toasts, `expect.poll` where needed) |
| **Retries only in CI** | Local runs fail fast. In CI a test that passes on retry is shown as flaky in the report, not hidden |
| **Environment config with fail-fast validation** | `config/env.ts` loads `.env.<ENV>` and throws a clear error when a variable is missing |
| **Role, label and placeholder locators first** | They survive markup changes better than CSS paths. CSS is used only where the app offers nothing else |
| **Sharded CI with merged reports** | Shards run in parallel for speed, and reviewers get one report with traces for retried tests |

---

## Project structure

```
.
├── .github/workflows/playwright.yml   # CI: sharded run + merged report
├── Jenkinsfile                        # Jenkins equivalent
├── config/
│   ├── env.ts                         # loads and validates environment variables
│   └── roles.ts                       # role -> saved session file
├── src/
│   ├── pages/                         # Page Objects (login, dashboard, pim/*)
│   ├── components/                    # Reusable UI parts (sidebar)
│   ├── api/                           # API clients (employee.api.ts)
│   ├── fixtures/                      # Custom Playwright fixtures (test.fixture.ts)
│   ├── data/factories/                # Test data builders
│   └── utils/                         # Shared helpers
├── tests/
│   ├── setup/auth.setup.ts            # one-time admin login
│   ├── e2e/                           # UI specs (login, lifecycle)
│   └── api/                           # API-only specs
├── .env.example
├── playwright.config.ts
└── tsconfig.json
```

---

## The lifecycle test

`tests/e2e/employee-lifecycle.spec.ts` runs these steps:

1. Admin creates an employee with login credentials (UI)
2. Admin navigation is validated
3. API confirms the system user exists, is enabled and has the ESS role
4. The ESS user logs in from a separate browser context and sees restricted navigation
5. Admin updates the employee name (UI)
6. API confirms the update was persisted
7. ESS user sees the new name after a reload
8. Admin deletes the employee (UI)
9. API confirms the employee is gone, and the deleted user can no longer log in

---

## CI/CD

### GitHub Actions

Two shards run in parallel. Each uploads a blob report and a final job merges them into one HTML report.

Add these under **Settings → Secrets and variables → Actions**:

| Type | Name | Value |
|---|---|---|
| Variable | `BASE_URL` | `https://opensource-demo.orangehrmlive.com` |
| Variable | `ADMIN_USERNAME` | `Admin` |
| Secret | `ADMIN_PASSWORD` | `admin123` |
| Secret | `ESS_DEFAULT_PASSWORD` | `Test@12345` |

To run manually: **Actions → Playwright Tests → Run workflow**. Download the merged report from the **Artifacts** section of the run.

### Jenkins

The `Jenkinsfile` uses the Playwright Docker image (keep its version in line with `@playwright/test`), runs two parallel shards, and merges the reports with the HTML Publisher plugin. Add `orangehrm-admin-password` and `orangehrm-ess-password` as "Secret text" credentials.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| `Missing env var "BASE_URL"` | `.env.<ENV>` is missing or incomplete. Create it from `.env.example` (locally) or add the variables (CI) |
| Setup test times out on login | The shared demo is slow or being reset. Rerun once before debugging |
| Login field not found for the ESS user | The context inherited the admin session. Pass `storageState: { cookies: [], origins: [] }` when creating it |
| `npm ci` fails in CI | `package-lock.json` is not committed or is out of sync. Run `npm install` and commit it |
| Passes locally, fails in CI | Open the trace in the report. CI is slower and headless, so timing-based locators show up there |

---

## Known limitations

- The public demo is shared and is reset periodically, so occasional slowness is expected. Rerun before debugging.
- Locators depend on the current OrangeHRM UI and may need updates after a demo upgrade.
- Tagging, a quarantine suite and a scheduled sweep of leftover test data are not implemented yet and are the natural next additions.


