# Model detail page source

`page.tsx` re-exports `page.generated.tsx`, which is produced at `prebuild`/`predev` from `page.tsx.b64` (gzip+base64) via `scripts/decode-model-pages.cjs`.

This keeps the large page bodies out of the GitHub Contents API path used by automation while still shipping full EN/KO UI at build time.
