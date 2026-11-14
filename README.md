# saged-sama.github.io

My portfolio, served at **https://saged-sama.github.io**. A static [Astro](https://astro.build) site; the
only JavaScript is the light/dark switch.

## Where content lives

| Folder | What |
|---|---|
| `data/profile.json` | Who I am (name, headline, bio, photo, …) |
| `data/<kind>/*.json` | One file per item: `social`, `skills`, `experience`, `education`, `achievements`, `testimonials`, `life-events` |
| `data/projects/*.md` | Projects: front matter + write-up. The file name is the URL slug. |
| `blogs/**/*.md` | Blog posts: front matter + Markdown (math with `$…$`, highlighted code). Folders are topics, nested as deep as you like (`blogs/machine-learning/linear-models/post.md` → `/blog/machine-learning/linear-models/post/`); the blog's sidebar follows the folders. An optional `_meta.json` in a folder sets its name, description and order: `{ "label": "Machine Learning", "order": 1 }`. |
| `images/` | Images referenced from data/front matter by relative path (optimized at build time) |
| `public/` | Served as is (`public/media/` holds media used inside synced rich text) |

The schemas in `src/schemas/` say exactly which fields each file takes.

## Syncing from portfolio-admin

`script/static-gen.ts` fetches everything public from portfolio-admin and writes it into the folders
above. It only adds, updates or deletes files **it wrote itself and nobody edited since**
(tracked in `.sync/manifest.json`), so hand-written or hand-edited files are never touched.

```sh
pnpm sync:dry   # show what would change
pnpm sync       # do it (needs POCKETBASE_URL and POCKETBASE_API_KEY in .env)
```

With `PROFILE_README` and `GH_PROFILE_TOKEN` set, it also regenerates the `<!-- portfolio:… -->`
blocks of the [profile README](https://github.com/saged-sama/saged-sama) and updates my GitHub
name, bio, website, location and company.

## Deploying

`.github/workflows/site.yml` syncs, commits the changes, builds and deploys to GitHub Pages on every
push to `main` and when run by hand. The profile repo's daily workflow starts it once a day.

## Development

```sh
pnpm dev      # local server
pnpm build    # static site in dist/
pnpm check    # type check
pnpm test     # sync script tests
```
