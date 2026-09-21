# Freshers Grade Tracker

A private, live-updating table of grade cutoffs per subject, filled in by
students and restricted to your college's email domain.

- **Sign-in**: Google account, restricted to `@lnmiit.ac.in` (checked both in
  the UI and, more importantly, in Firestore's security rules — so it can't
  be bypassed by editing the frontend).
- **One entry per person per subject** — resubmitting overwrites your own
  earlier entry, so people can fix typos but can't spam.
- **Live table**: for each subject, the minimum marks reported for each
  grade, an overall passing mark, average, and a response count so you can
  judge how reliable a subject's numbers are.

Everything you'd tweak semester-to-semester (subject list, grade scale) lives
in one file: `lib/config.js`.

## 1. Create a Firebase project (free tier is plenty)

1. Go to https://console.firebase.google.com → **Add project** → give it any
   name (e.g. `lnmiit-grade-tracker`).
2. In the project, go to **Build → Authentication → Get started**, enable
   the **Google** sign-in provider.
3. Go to **Build → Firestore Database → Create database** → start in
   **production mode** (we supply our own rules below) → pick a region close
   to you.
4. Go to **Project settings (gear icon) → General → Your apps → Add app →
   Web (`</>`)**. Register it (no need for Firebase Hosting here). Copy the
   `firebaseConfig` values shown.

## 2. Configure the project locally

```bash
cp .env.local.example .env.local
```

Paste the values from step 1.4 into `.env.local`. Set
`NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN` to your actual student email domain (this
repo defaults to `lnmiit.ac.in` — double check this is really the domain
your student emails use).

**Important:** `firestore.rules` hardcodes the same domain in a regex
(Firestore rules can't read your `.env`). If your domain differs, edit the
line in `firestore.rules` too:

```
request.auth.token.email.matches('.*@lnmiit[.]ac[.]in$')
```

## 3. Deploy the Firestore security rules

Install the Firebase CLI once, then push the rules:

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # pick the project you created above
firebase deploy --only firestore:rules
```

This step is what actually enforces "college emails only" — without it,
anyone signed into Firebase could read/write the data.

## 4. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, sign in with a college Google account, submit a
test entry, confirm the table updates.

## 5. Deploy it for real (Vercel — free, easiest for Next.js)

1. Push this folder to a GitHub repo (can be private).
2. Go to https://vercel.com → **New Project** → import that repo.
3. In the Vercel project's **Environment Variables** settings, add every
   variable from your `.env.local`.
4. Deploy. Vercel gives you a URL like `https://your-project.vercel.app` —
   that's the private link you share with your batch.

The link itself isn't secret-private (anyone with it can *load* the page),
but nobody can sign in, read data, or submit anything unless their Google
account's email ends in your college domain — Firestore rejects everyone
else server-side.

## Notes / things worth deciding before you share the link

- **Google Workspace assumption**: this relies on students signing in with
  Google accounts that use their college email. If LNMIIT doesn't give
  students Google-backed college accounts, Google Sign-In won't work and
  you'd need a different auth method (e.g. email-link/OTP sign-in instead —
  ask if you want that swapped in).
- **Grade scale / subject list**: edit `lib/config.js` — nothing else needs
  to change.
- **Outliers**: the table doesn't currently flag or exclude obvious
  mis-entries (e.g. someone fat-fingering marks). If that becomes a problem,
  an easy add is an admin view that lists all raw entries per subject so you
  can eyeball them.
