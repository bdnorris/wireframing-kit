---
name: deploy
description: Build one client, check for leaks, and publish or print the access checklist.
---

# Deploy

Input: a project name.

1. Run `npm run deploy -- <project>`.
2. The command sets `PROJECT` and `SKIN`, builds, and fails if another client's title or fixture copy is in `dist/`.
3. `access: none` prints that the site is public.
4. `access: basic` writes an env-bound Pages Function. Set `BASIC_AUTH_PASSWORD` with Wrangler. The password is not written into the repo.
5. `access: access` prints the hostnames and emails to cover in Cloudflare Access. Wrangler does not apply that policy.
6. Add `--publish` only when the filtered build and leak check have passed and you want the upload. Add `--preview` with `--publish` for a branch alias.
