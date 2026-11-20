/**
 * Seeds demo data for the defense: 1 adviser, 4 students, 2 teams and 3 sample evaluations.
 * Uses the Firebase Admin SDK, which bypasses Security Rules (so it must only be run by YOU, locally).
 *
 * 1. Firebase Console > Project settings > Service accounts > Generate new private key
 * 2. Save it as  serviceAccountKey.json  in the project root (it is git-ignored – never commit it!)
 * 3. Run:  npm run seed
 */
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const key = JSON.parse(readFileSync(new URL('../serviceAccountKey.json', import.meta.url), 'utf8'));
initializeApp({ credential: cert(key) });
const auth = getAuth();
const db = getFirestore();

const ADVISER = { name: 'Prof. Maria Santos', email: 'adviser@sorsu.edu.ph', password: 'adviser123' };
const STUDENTS = [
  { key: 'juan', name: 'Juan Dela Cruz', studentId: '2023-0101', role: 'Project Leader / System Analyst' },
  { key: 'ana', name: 'Ana Reyes', studentId: '2023-0102', role: 'Technical Writer' },
  { key: 'mark', name: 'Mark Villanueva', studentId: '2023-0103', role: 'Frontend Developer' },
  { key: 'liza', name: 'Liza Garcia', studentId: '2023-0104', role: 'Frontend Developer' },
].map((s) => ({ ...s, email: `${s.key}@student.sorsu.edu.ph`, password: 'student123' }));

async function ensureUser({ email, password, name }) {
  try {
    return await auth.getUserByEmail(email);
  } catch {
    return auth.createUser({ email, password, displayName: name });
  }
}

const adviser = await ensureUser(ADVISER);
await db.doc(`adviserInvites/${ADVISER.email}`).set({ createdAt: FieldValue.serverTimestamp() });
await db.doc(`users/${adviser.uid}`).set({
  name: ADVISER.name, email: ADVISER.email, role: 'adviser', studentId: null, teamId: null,
  projectRole: 'Capstone Adviser', createdAt: FieldValue.serverTimestamp(),
});

for (const t of [
  { code: 'CAP-ALPHA', name: 'Team Alpha', project: 'Barangay Health Records Portal' },
  { code: 'CAP-BRAVO', name: 'Team Bravo', project: 'Campus Equipment Borrowing System' },
]) {
  await db.doc(`teams/${t.code}`).set({ ...t, adviserId: adviser.uid, createdAt: FieldValue.serverTimestamp() });
}

const uid = {};
for (const s of STUDENTS) {
  const u = await ensureUser(s);
  uid[s.key] = u.uid;
  await db.doc(`users/${u.uid}`).set({
    name: s.name, email: s.email, role: 'student', studentId: s.studentId, teamId: 'CAP-ALPHA',
    projectRole: s.role, createdAt: FieldValue.serverTimestamp(),
  });
}

const sample = (from, to, r, strengths, improvements) => {
  const term = 'Midterm';
  return db.doc(`evaluations/${uid[from]}_${uid[to]}_${term}`).set({
    teamId: 'CAP-ALPHA', term, evaluatorId: uid[from], evaluateeId: uid[to],
    ratings: { contribution: r[0], quality: r[1], communication: r[2], teamwork: r[3], reliability: r[4], initiative: r[5] },
    strengths, improvements, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
};
await sample('ana', 'juan', [5, 4, 5, 5, 4, 5], 'Keeps the team organized and always shares clear task lists.', 'Could delegate a bit more instead of doing many tasks alone.');
await sample('mark', 'juan', [4, 4, 4, 5, 4, 4], 'Very supportive leader who explains requirements well.', 'Please post meeting notes sooner after each meeting.');
await sample('juan', 'ana', [4, 5, 4, 4, 5, 4], 'Documentation is neat, complete and always on time.', 'Ask for our inputs earlier so we can review the paper together.');

console.log('Seed complete.\n  Adviser: adviser@sorsu.edu.ph / adviser123\n  Student: juan@student.sorsu.edu.ph / student123  (team code CAP-ALPHA)');
