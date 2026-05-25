# PlayDoom Setup Video

This folder renders a silent screenshot-and-text walkthrough for YouTube or the website.

Requires `ffmpeg` on your machine.

## Render

```bash
npm run video:render
```

Output:

```text
video/output/playdoom-setup.mp4
```

Generated frames and MP4 files are ignored by git.

## Screenshots

Replace the placeholder cards by saving real screenshots with these filenames:

- `video/screenshots/01-empty-github-repo.png`
- `video/screenshots/02-deploy-button.png`
- `video/screenshots/05-setup-application.png`
- `video/screenshots/06-doom-key.png`
- `video/screenshots/07-deploy-success.png`

The GitHub connection and repository-access steps are text-only slides on purpose. Do not capture those screens unless we later decide to show account-specific UI.

Capture rules:

- Use a test GitHub and Cloudflare account if possible.
- Hide email addresses, account IDs, and personal repo lists.
- Never show a real API token or real `DOOM_KEY`.
- Set browser zoom to about 125 percent so text is readable.
- Keep screenshots at 16:9 when possible.

Slides are configured in `video/slides.json`.
