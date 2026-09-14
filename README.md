# WebCraft Conference 2027 Registration

Public registration page for WebCraft Conference 2027, hosted with GitHub Pages.

## Local development

```bash
npm ci
npm run dev
```

## Deployment

Pushes to `main` are deployed automatically by GitHub Actions. The repository
must have GitHub Pages configured to use GitHub Actions as its source.

Set the repository Actions secret `FORM_ENDPOINT` to the HTTPS form-processing
endpoint used for registration delivery.
