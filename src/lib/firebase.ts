import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const env = import.meta.env;

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
};

/** False until the .env values from the Firebase console are filled in. */
export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

const app = initializeApp(firebaseConfigured ? config : { apiKey: 'unset', projectId: 'unset', appId: 'unset' });

export const auth = getAuth(app);
export const db = getFirestore(app);
