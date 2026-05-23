# PlayDoom Website

Public explainer and installer website for PlayDoom.

This repo is the website for `https://playdoom.ossy.dev`. It explains the product and links users to the deployable game template:

```text
https://github.com/ericbae/playdoom-template
```

The actual Cloudflare Worker game does not live here. It lives in `playdoom-template`.

The website includes a step-by-step deploy guide at `/#guide`. Screenshot capture notes live in [docs/deploy-screenshot-checklist.md](./docs/deploy-screenshot-checklist.md).

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:8788`.

## Deploy

```bash
npm run deploy
```

The GitHub Actions workflow for this website expects these repository secrets in `ericbae/playdoom.ossy.dev`:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

These are only for deploying the public website. People deploying the game template through the Deploy to Cloudflare button do not need to add these secrets to this repo.
