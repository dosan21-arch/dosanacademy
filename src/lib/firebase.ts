import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';

const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

/** .env 값이 모두 채워져 있는지 여부. false 이면 앱이 설정 안내 화면을 보여준다. */
export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (v) => typeof v === 'string' && v.length > 0,
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.languageCode = 'ko';
  db = getFirestore(app);
  storage = getStorage(app);

  if (env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db, storage };
