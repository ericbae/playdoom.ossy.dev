# PlayDoom Website

Public installer website for PlayDoom.

This repo explains the product and links users to the deployable game template:

```text
https://github.com/ericbae/playdoom-template
```

The actual Cloudflare Worker game lives in `playdoom-template`.

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

The GitHub Actions workflow expects these repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
