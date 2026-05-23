# Deploy Screenshot Checklist

Use real screenshots from the GitHub and Cloudflare setup flow. Do not use mock UI screenshots for the public guide.

Capture these screens:

1. GitHub new repository page
   - Show the repository name field.
   - Show that README, gitignore, and license are not selected.
   - Suggested filename: `public/assets/deploy-guide/01-empty-github-repo.png`

2. PlayDoom website deploy button
   - Show the `Deploy to Cloudflare` button on `playdoom.ossy.dev`.
   - Suggested filename: `public/assets/deploy-guide/02-deploy-button.png`

3. Cloudflare create Worker screen
   - Show the step after clicking Deploy to Cloudflare.
   - Suggested filename: `public/assets/deploy-guide/03-create-worker.png`

4. GitHub authorization repository access screen
   - Show `Only select repositories`.
   - Show the empty PlayDoom repo selected.
   - Suggested filename: `public/assets/deploy-guide/04-github-repo-access.png`

5. Cloudflare setup application screen
   - Show destination repository and Worker name fields.
   - Suggested filename: `public/assets/deploy-guide/05-setup-application.png`

6. Cloudflare secret setup screen
   - Show `DOOM_KEY` as the required secret.
   - Do not show a real secret value.
   - Suggested filename: `public/assets/deploy-guide/06-doom-key.png`

7. Successful deployment screen
   - Show the final `workers.dev` URL.
   - Suggested filename: `public/assets/deploy-guide/07-success.png`

After screenshots are captured, add them to the public site guide next to the matching steps.
