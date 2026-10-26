# Deploy

Production only: one Vercel project, one Supabase project (no staging).

| What     | How                                      | Trigger                                      |
| -------- | ---------------------------------------- | -------------------------------------------- |
| App      | Vercel Git integration                   | push to `master` → production, PRs → preview |
| Database | GitHub Actions `supabase-migrations.yml` | push to `master` touching `supabase/**`      |
| Checks   | GitHub Actions `ci.yml`                  | every PR and push to `master`                |

Previews use **production data**. There is no staging project.

## One-time setup

### 1. GitHub repository

Create the repository at github.com/new, then point the local clone at it:

```bash
git remote add origin https://github.com/itispx/tenho-dado.git
git add -A
git commit -m "chore: automatic deploy to vercel + supabase migrations"
git push -u origin master
```

If the push is rejected because the credential lacks the `workflow` scope,
push the code without `.github/` and create the two workflow files through the
GitHub web editor (Add file → Create new file), pasting the contents of
`.github/workflows/ci.yml` and `.github/workflows/supabase-migrations.yml`.

### 2. Vercel

1. **Add New → Project → Import** the repository.
2. Framework: Next.js (auto-detected). Root directory: `.`. Node 22.
3. Environment variables, applied to **Production, Preview and Development**:

   | Name                                   | Where to get it                                          |
   | -------------------------------------- | -------------------------------------------------------- |
   | `NEXT_PUBLIC_SUPABASE_URL`             | Supabase → Project Settings → API                        |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys                   |
   | `SUPABASE_SERVICE_ROLE_KEY`            | Supabase → Project Settings → API Keys (server only)     |
   | `REGISTRATION_INVITE_CODE`             | Optional. When set, account creation requires this code. |

4. Settings → Git → Production Branch: `master`.
5. Deploy. `.vercelignore` keeps `supabase/` and `*.md` out of the upload.

### 3. Supabase

1. Project Settings → API: copy the **project ref**.
2. Account → Access Tokens: create a token.
3. Project Settings → Database: copy the database **password**.
4. GitHub → Settings → Environments → **New environment** `production`, then add secrets:

   | Secret                  | Value                 |
   | ----------------------- | --------------------- |
   | `SUPABASE_ACCESS_TOKEN` | the access token      |
   | `SUPABASE_PROJECT_ID`   | the project ref       |
   | `SUPABASE_DB_PASSWORD`  | the database password |

   Optionally add required reviewers here — migrations then wait for approval.

5. Authentication → URL Configuration:
   - **Site URL**: `https://<production-domain>`
   - **Redirect URLs**: `https://<production-domain>/**` and `https://*-<team-slug>.vercel.app/**` (previews).

> Do not run `supabase config push` from CI. `supabase/config.toml` points at
> `127.0.0.1` and would overwrite the production Auth settings above.

## First migration push

If production already has tables/DDL applied outside of migrations, `db push`
will refuse to run. Baseline it once, from your machine:

```bash
pnpm exec supabase link --project-ref <project-ref>
pnpm exec supabase migration list --linked          # compare Local vs Remote
```

For every migration already applied remotely:

```bash
pnpm exec supabase migration repair --status applied <timestamp>
```

Then trigger the workflow manually: **Actions → Supabase migrations → Run
workflow** with `dry_run` checked. It should report nothing to push. Run it
again unchecked, or just merge a migration.

Migrations committed after this point are applied automatically on merge.

## Rollback

- **App**: Vercel → Deployments → previous deployment → **Promote to Production**.
  (Instant; no rebuild.)
- **Database**: migrations are forward-only. Write a new migration that undoes
  the change and merge it. Never edit or delete an applied migration file.

## Local development

Unchanged: `pnpm supabase:start`, `pnpm dev`. Migrations are authored locally
with `pnpm supabase:db:reset` and committed under `supabase/migrations/`.
