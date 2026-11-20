/**
 * Verifies the privacy guarantees of firestore.rules.
 * Run with the emulator:   npm run test:rules
 * (needs Java 11+ installed; firebase-tools downloads the emulator on first run)
 */
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

let env: RulesTestEnvironment;

const ratings = { contribution: 4, quality: 4, communication: 4, teamwork: 4, reliability: 4, initiative: 4 };
const text = 'A helpful and specific comment here.';

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'peercheck-rules-test',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});
afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/adv'), { name: 'Adviser', email: 'adv@x.com', role: 'adviser', teamId: null, projectRole: 'Capstone Adviser' });
    await setDoc(doc(db, 'teams/CAP-A'), { name: 'Team A', project: 'Some project', code: 'CAP-A', adviserId: 'adv' });
    for (const u of ['ana', 'ben', 'cy']) {
      await setDoc(doc(db, `users/${u}`), { name: u, email: `${u}@x.com`, role: 'student', teamId: 'CAP-A', projectRole: 'Member' });
    }
    await setDoc(doc(db, 'users/zed'), { name: 'Zed', email: 'zed@x.com', role: 'student', teamId: 'CAP-OTHER', projectRole: 'Member' });
    // Ben evaluated Ana
    await setDoc(doc(db, 'evaluations/ben_ana_Midterm'), {
      teamId: 'CAP-A', term: 'Midterm', evaluatorId: 'ben', evaluateeId: 'ana', ratings, strengths: text, improvements: text,
    });
  });
});

const evalData = (from: string, to: string) => ({
  teamId: 'CAP-A', term: 'Midterm', evaluatorId: from, evaluateeId: to, ratings, strengths: text, improvements: text,
  createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
});

describe('privacy', () => {
  it('the author can read their own evaluation', async () => {
    const db = env.authenticatedContext('ben').firestore();
    await assertSucceeds(getDoc(doc(db, 'evaluations/ben_ana_Midterm')));
  });

  it('the person who was evaluated can NOT read it', async () => {
    const db = env.authenticatedContext('ana').firestore();
    await assertFails(getDoc(doc(db, 'evaluations/ben_ana_Midterm')));
  });

  it('the evaluated person can NOT query evaluations about themselves', async () => {
    const db = env.authenticatedContext('ana').firestore();
    await assertFails(getDocs(query(collection(db, 'evaluations'), where('evaluateeId', '==', 'ana'))));
  });

  it('another teammate can NOT read it', async () => {
    const db = env.authenticatedContext('cy').firestore();
    await assertFails(getDoc(doc(db, 'evaluations/ben_ana_Midterm')));
  });

  it('the team adviser can read all evaluations of the team', async () => {
    const db = env.authenticatedContext('adv').firestore();
    await assertSucceeds(getDocs(query(collection(db, 'evaluations'), where('teamId', '==', 'CAP-A'), where('term', '==', 'Midterm'))));
  });

  it('a student can query only the evaluations they wrote', async () => {
    const db = env.authenticatedContext('ben').firestore();
    await assertSucceeds(getDocs(query(collection(db, 'evaluations'), where('evaluatorId', '==', 'ben'))));
  });
});

describe('writing evaluations', () => {
  it('a student can evaluate a teammate', async () => {
    const db = env.authenticatedContext('cy').firestore();
    await assertSucceeds(setDoc(doc(db, 'evaluations/cy_ana_Midterm'), evalData('cy', 'ana')));
  });

  it('a student can NOT evaluate themselves', async () => {
    const db = env.authenticatedContext('cy').firestore();
    await assertFails(setDoc(doc(db, 'evaluations/cy_cy_Midterm'), evalData('cy', 'cy')));
  });

  it('a student can NOT evaluate someone from another team', async () => {
    const db = env.authenticatedContext('cy').firestore();
    await assertFails(setDoc(doc(db, 'evaluations/cy_zed_Midterm'), evalData('cy', 'zed')));
  });

  it('a student can NOT write an evaluation as someone else', async () => {
    const db = env.authenticatedContext('cy').firestore();
    await assertFails(setDoc(doc(db, 'evaluations/ben_cy_Midterm'), evalData('ben', 'cy')));
  });

  it('rejects ratings outside 1-5 and short comments', async () => {
    const db = env.authenticatedContext('cy').firestore();
    await assertFails(setDoc(doc(db, 'evaluations/cy_ana_Midterm'), { ...evalData('cy', 'ana'), ratings: { ...ratings, quality: 6 } }));
    await assertFails(setDoc(doc(db, 'evaluations/cy_ana_Midterm'), { ...evalData('cy', 'ana'), strengths: 'short' }));
  });

  it('an adviser cannot write evaluations', async () => {
    const db = env.authenticatedContext('adv').firestore();
    await assertFails(setDoc(doc(db, 'evaluations/adv_ana_Midterm'), evalData('adv', 'ana')));
  });
});

describe('accounts and teams', () => {
  it('a new user cannot make themselves an adviser without an invite', async () => {
    const db = env.authenticatedContext('newbie', { email: 'newbie@x.com' }).firestore();
    await assertFails(setDoc(doc(db, 'users/newbie'), {
      name: 'New Bie', email: 'newbie@x.com', role: 'adviser', studentId: null, teamId: null, projectRole: 'Capstone Adviser', createdAt: serverTimestamp(),
    }));
  });

  it('a student cannot read the adviser invite list', async () => {
    const db = env.authenticatedContext('ben').firestore();
    await assertFails(getDoc(doc(db, 'adviserInvites/adv@x.com')));
  });

  it('a student cannot edit or delete a team', async () => {
    const db = env.authenticatedContext('ben').firestore();
    await assertFails(setDoc(doc(db, 'teams/CAP-A'), { name: 'Hacked', project: 'Hacked project', code: 'CAP-A', adviserId: 'ben' }));
  });
});
