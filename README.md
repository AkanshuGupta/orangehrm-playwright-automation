# OrangeHRM Playwright Tests

Playwright and TypeScript tests for the OrangeHRM demo. The suite covers login, employee management, access roles, and the employee API.

---

## Setup instructions

### Requirements

- Node.js 20 or later
- Access to the OrangeHRM site

Clone the repository and install dependencies:

```bash
git clone https://github.com/AkanshuGupta/orangehrm-playwright-automation.git
cd orangehrm-playwright-automation
npm ci
```

Install Chromium:

```bash
npx playwright install --with-deps chromium
```

Copy the example file and add your credentials:

```bash
cp .env.example .env.dev
```

On Windows PowerShell use `copy .env.example .env.dev`.

```
BASE_URL=https://opensource-demo.orangehrmlive.com
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin123
ESS_DEFAULT_PASSWORD=
```

All four variables are required. `.env.*` files are ignored by Git; do not commit real credentials.

Check the setup by running the authentication project:

```bash
npx playwright test --project=setup
```

It logs in as the admin user and saves the session in `.auth/admin.json`. For another environment, create `.env.qa` with the same variables and run `npm run test:qa`. The `cross-env` dependency handles setting `ENV` across platforms.

---

## Execution steps

Run the full suite:

```bash
npm test
```

Playwright runs the setup project before the UI and API projects.

Run tests in a visible browser:

```bash
npm run test:headed          # whole suite
npm run test:e2e:headed      # UI tests only
```

Useful commands:

| Goal | Command |
|---|---|
| UI tests only | `npm run test:e2e` |
| API tests only | `npm run test:api` |
| Smoke tests | `npm run test:smoke` |
| Regression tests | `npm run test:regression` |
| One spec file | `npx playwright test employee-lifecycle` |
| Tests with a tag | `npx playwright test --grep "@smoke"` |
| Match a test title | `npx playwright test -g "invalid password"` |
| Use another environment | `npm run test:qa` |
| Generate / open the Allure report | `npm run allure:generate` / `npm run allure:open` |

For debugging:

| Tool | Command |
|---|---|
| Playwright Inspector | `npx playwright test employee-lifecycle --debug` |
| Interactive UI mode | `npx playwright test --ui` |
| Open the Playwright HTML report | `npm run report` |

Tests use Playwright fixtures, page objects, and API helpers. Employee data is generated per test; tests that create employees register them with `trackEmployee` for cleanup.

---

## Project structure

```
.
├── .github/workflows/playwright.yml   # CI: sharded run + merged report
├── config/
│   ├── env.ts                         # loads and validates environment variables
│   ├── roles.ts                       # role -> saved session file
│   └── constants.ts                   # shared API and role constants
├── src/
│   ├── pages/                         # Page Objects (login, dashboard, pim/*)
│   ├── components/                    # Reusable UI parts (sidebar)
│   ├── api/                           # API clients (base.api.ts, employee.api.ts)
│   ├── fixtures/                      # Custom Playwright fixtures (test.fixture.ts)
│   ├── data/factories/                # Test data builders
│   └── utils/
│       └── logger.ts                  # Structured console logging helper
├── tests/
│   ├── setup/auth.setup.ts            # one-time admin login
│   ├── e2e/                           # UI specs (login, lifecycle)
│   └── api/                           # API-only specs
├── .env.example
├── playwright.config.ts
└── tsconfig.json
```

## CI/CD

### GitHub Actions

The workflow runs smoke, regression, and API tests across two shards on pushes to `main`, pull requests, and manual runs. It publishes the Playwright and Allure HTML reports as downloadable artifacts, retained for 14 days. Quarantined tests are excluded from these runs.

Add these under **Settings → Secrets and variables → Actions**:

| Type | Name | Value |
|---|---|---|
| Variable | `BASE_URL` | `https://opensource-demo.orangehrmlive.com` |
| Variable | `ADMIN_USERNAME` | `Admin` |
| Secret | `ADMIN_PASSWORD` | `admin123` |
| Secret | `ESS_DEFAULT_PASSWORD` | A strong employee test password |

To start a run manually, go to **Actions → Playwright Tests → Run workflow**. Download the reports from the run's **Artifacts** section.

---

## Troubleshooting

| Symptom | Likely cause and fix |
|---|---|
| Missing environment variable | Check that `.env.dev` or the CI variables include all required values |
| Login setup times out | The shared demo may be slow. Check the trace and try again |
| ESS test is already logged in as admin | Use an empty `storageState` for the ESS browser context |
| Allure generation fails | Install Java 8 or later and rerun `npm run allure:generate` |

---

## Flaky tests and quarantine

CI retries failed tests twice. A test that passes on retry is still reported as flaky. Check the first failure, trace, screenshot, and video to find the cause.

### Quarantining a test

If a test needs to be removed temporarily from the CI gate, tag it `@quarantined` and link it to a tracked issue with an owner and review date. CI excludes that tag from the normal runs. Run quarantined tests separately with `npx playwright test --grep "@quarantined"`, and remove the tag once the issue is fixed. Quarantine is temporary; it should not replace investigating the failure.
