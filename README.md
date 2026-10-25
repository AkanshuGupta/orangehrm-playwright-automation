├── .github/workflows/playwright.yml
├── Jenkinsfile
├── config/        env.ts, roles.ts
├── src/
│   ├── api/         employee.api.ts
│   ├── components/  sidebar.component.ts
│   ├── data/factories/  employee.factory.ts
│   ├── fixtures/    test.fixture.ts
│   └── pages/       base, login, dashboard, pim/{employee-form, employee-list, personal-details}
├── tests/
│   ├── setup/auth.setup.ts
│   ├── e2e/         login.spec.ts, employee-smoke.spec.ts, employee-lifecycle.spec.ts
│   └── api/         employee.api.spec.ts
├── .env.example, .gitignore, playwright.config.ts, tsconfig.json