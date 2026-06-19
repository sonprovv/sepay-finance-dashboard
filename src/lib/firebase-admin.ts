import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const initFirebase = () => {
  if (!getApps().length) {
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.warn('Firebase config missing - skipping init (safe if building)');
      return;
    }
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase Admin initialization error', error);
    }
  }
};

initFirebase();

export const db = {
  collection: (path: string) => {
    initFirebase();
    return getFirestore().collection(path);
  }
} as any;

export default { getFirestore };
