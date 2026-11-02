# Sign-in and sign-out links can't send people to another website

A link like `/auth/signout?return_to=/.//evil.com` sent people to `evil.com`. The return path was checked for a leading `//` before it was cleaned up, and the clean-up turns `/.//evil.com` into `//evil.com`, which browsers read as another site.

- The cleaned-up path is now checked too, so anything that would leave the site goes to the home page instead.
- The same fix is in the local dev sign-in.
- New test: `tests/session.test.mjs`.

Files: `app/session.ts` (`safeReturnTo`), `build/sites-vite-plugin.ts` (`safeReturn`), `tests/session.test.mjs`, `tests/workers-stub.cjs`.
