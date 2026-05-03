# QA screenshots (local)

Generated PNG, `verification-390-large.json`, and `REPORT.md` are gitignored. Re-run to refresh.

```bash
npm run build
npx playwright install chromium
npm run qa:screenshots
```

Outputs (examples on Windows):

- `qa/screenshots/landing-390-default.png`
- `qa/screenshots/landing-430-default.png`
- `qa/screenshots/landing-1440-default.png`
- `qa/screenshots/landing-390-text-large.png` (`localStorage` `sensora:textSize` = `large` before load)
- `qa/screenshots/verification-390-large.json`
