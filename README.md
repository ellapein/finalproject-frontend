# Peer to Apir Evaluation – Peer Evaluation for IT Capstone Teams (Finals)

A responsive web app where capstone team members evaluate each other.
**Students can only read the evaluations they wrote. They can never see what teammates wrote about them.** Only the team's adviser sees results.

Stack: **React 18 · TypeScript · Vite · Firebase Authentication · Cloud Firestore · Vercel**
Course: Frontend Development – Final System Project (same system as the Midterm, now with React + Firebase).

---

## 1. Run it on your computer

Requirements: [Node.js 20+](https://nodejs.org) and [Git](https://git-scm.com).

```bash
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
# fill in .env (see step 2), then:
npm run dev               # opens http://localhost:5173
```

Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | start the development server |
| `npm run build` | type-check and create the production build in `dist/` |
| `npm test` | unit tests for validation and statistics |
| `npm run test:rules` | tests the Firestore Security Rules in the emulator (needs Java 11+) |
| `npm run seed` | adds demo accounts and data (see step 4) |

## 2. Create the Firebase project (one time, free "Spark" plan)

1. Go to <https://console.firebase.google.com> → **Add project** (name it e.g. `peer to apir evaluation-capstone`).
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** → pick a location near you (e.g. `asia-southeast1`) → start in **production mode**.
4. **Project settings (gear icon) → General → Your apps → Web (`</>`)** → register an app → copy the `firebaseConfig` values into your `.env`:
   ```
VITE_FIREBASE_API_KEY=AIzaSyDgOrHPBvvImJ2vY4OMdLILjKK81hLtwhE
VITE_FIREBASE_AUTH_DOMAIN=peerapireval.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=peerapireval
VITE_FIREBASE_STORAGE_BUCKET=peerapireval.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=42967723709
VITE_FIREBASE_APP_ID=1:42967723709:web:cb1d446724aa326ad951d4
   ```
5. **Firestore Database → Rules** tab → delete everything → paste the full contents of [`firestore.rules`](firestore.rules) → **Publish**.
   *(Or with the CLI: `npx firebase-tools login`, `npx firebase-tools use <project-id>`, `npx firebase-tools deploy --only firestore:rules`.)*

> ⚠️ Do not skip step 5. Without the rules, Firestore is either locked or open to everyone, and the privacy feature does not work.

## 3. How accounts work

* **Students** register with their name, student ID, email and a **team code** (e.g. `CAP-ALPHA`). They are added to that team automatically.
* **Advisers** can only register with an email the administrator has approved. To approve one:
  Firestore Database → **Start collection** `adviserInvites` → **Document ID = the adviser's email in lowercase** (e.g. `adviser@sorsu.edu.ph`) → add any field (e.g. `approved: true`) → Save.
  Then the adviser registers on the *Create account → Adviser* tab.
* The adviser creates teams (**Manage Teams → New team**) and gives each team code to the students.

## 4. Demo data for the defense (optional)

1. Firebase Console → **Project settings → Service accounts → Generate new private key**.
2. Save the downloaded file as `serviceAccountKey.json` in the project root. (It is in `.gitignore`. **Never commit or share it.**)
3. `npm run seed`

Demo logins: `adviser@sorsu.edu.ph / adviser123` and `juan@student.sorsu.edu.ph / student123` (also `ana`, `mark`, `liza` @student.sorsu.edu.ph). Team code: `CAP-ALPHA`.

## 5. GitHub (group repository)

```bash
git init
git add .
git commit -m "feat: initial Peer to Apir Evaluation React + Firebase project"
git branch -M main
git remote add origin https://github.com/<your-group>/peerapireval.git
git push -u origin main
```
Every member should clone the repo, work on a branch (`git checkout -b feature/evaluate-form`), commit often with clear messages (`feat:`, `fix:`, `docs:`), and open pull requests. The CI workflow in `.github/workflows/ci.yml` runs type-check, tests and build on each push.

## 6. Deploy on Vercel

1. <https://vercel.com> → sign in with GitHub → **Add New → Project → import your repo**.
2. Framework preset is detected as **Vite** (build `npm run build`, output `dist`).
3. **Environment Variables:** add all six `VITE_FIREBASE_*` values.
4. **Deploy.** Copy the public URL for your paper and slides.
5. In Firebase: **Authentication → Settings → Authorized domains → Add domain** → your `*.vercel.app` domain. *(Sign-in fails on the live site without this.)*

`vercel.json` already contains the rewrite that makes page refreshes on routes like `/dashboard` work.

---

## Project structure

```
src/
  main.tsx, App.tsx          app entry and all routes
  types.ts                   shared TypeScript types
  lib/                       firebase.ts · peer.ts (constants) · validation.ts · stats.ts
  services/                  Firestore/Auth calls: auth · user · team · evaluation
  context/AuthContext.tsx    signed-in user + profile
  hooks/useAsync.ts          loading / error / data state for page loaders
  components/                Header, Layout, ProtectedRoute, Avatar, Badge, ProgressBar,
                             RatingInput, TeammateCard, EvaluationCard, FormField,
                             ConfirmDialog, Toast, EmptyState, ErrorNotice, Spinner,
                             TermSwitch, ResultsTable   (17 reusable components)
  pages/                     Login, Register, Dashboard, Evaluate, MyEvaluations, Team,
                             Guide, AdviserResults, AdviserTeams, TeamForm, NotFound, Setup
firestore.rules              Security Rules (privacy enforced here)
tests/firestore.rules.test.ts  rules tests (emulator)
scripts/seed.mjs             demo data
```

## Firestore data structure

| Collection / document | Fields |
|---|---|
| `users/{uid}` | name, email, role (`student`/`adviser`), studentId, teamId, projectRole, createdAt |
| `teams/{CODE}` | name, project, code, adviserId, createdAt |
| `evaluations/{evaluatorId}_{evaluateeId}_{term}` | teamId, term, evaluatorId, evaluateeId, ratings{contribution, quality, communication, teamwork, reliability, initiative}, strengths, improvements, createdAt, updatedAt |
| `adviserInvites/{email}` | administrator-managed allow-list (no client access) |

The evaluation id combines evaluator, teammate and term, so **one evaluation per person per teammate per term** is guaranteed by the database itself.

## Guideline checklist (Finals)

| Requirement | Where |
|---|---|
| React + TypeScript (TSX) + Vite | whole `src/` |
| ≥ 6 reusable components, props and composition | `src/components/` (17) |
| `useState`, `useEffect`, conditional rendering, dynamic lists | all pages, `hooks/useAsync.ts` |
| ≥ 5 routes with navigation | 13 routes in `App.tsx` (React Router) |
| Controlled forms, validation, error messages | `lib/validation.ts`, Login, Register, Evaluate, TeamForm, Team |
| Loading, success and error states | `Spinner`, `Toast`, `ErrorNotice` |
| Responsive (desktop / tablet / mobile) + accessible | `index.css` (grid/flex + media queries), skip link, labels, ARIA, keyboard-friendly |
| Firestore configuration + collections | `lib/firebase.ts`, `services/` |
| **Create** | register, create evaluation, create team |
| **Read** | dashboard, my evaluations, adviser results |
| **Update** | edit evaluation, edit team, edit profile |
| **Delete** | delete evaluation, remove member, delete team |
| Firestore Security Rules | `firestore.rules` (+ `tests/`) |
| Firebase Authentication | email/password, student and adviser roles |
| GitHub collaboration + README | this file, `.github/workflows/ci.yml` |
| Vercel deployment | `vercel.json`, step 6 |

## Known limitations (write these in Chapter 5.2 of your paper)

* Student ID uniqueness is not enforced (there is no backend to check it).
* There is no maximum team size.
* A team code cannot be changed after creation (it is the document id).
* Adviser approval is a manual step in the Firebase console.
