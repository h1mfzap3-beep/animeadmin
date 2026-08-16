import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

// Embedded Firebase Configuration ensuring zero external .env dependency
export const firebaseConfig = {
  projectId: rawConfig.projectId || "gen-lang-client-0003317395",
  appId: rawConfig.appId || "1:166775776818:web:38c2b701cd499feb44be2b",
  apiKey: rawConfig.apiKey || "AIzaSyBT6F3vhAO_P-wb_PosgULeT-D-zwR0Mjo",
  authDomain: rawConfig.authDomain || "gen-lang-client-0003317395.firebaseapp.com",
  firestoreDatabaseId: (rawConfig as any).firestoreDatabaseId || "ai-studio-lunaanimetracker-5c5a6687-bf5d-4dc5-81e8-b9c87e1f2c97",
  storageBucket: rawConfig.storageBucket || "gen-lang-client-0003317395.firebasestorage.app",
  messagingSenderId: rawConfig.messagingSenderId || "166775776818",
  oAuthClientId: (rawConfig as any).oAuthClientId || "166775776818-brmhmbanuine9hni0u85vsiqhue8k8ut.apps.googleusercontent.com"
};

// Constant GitHub and project URLs hardcoded as requested
export const GITHUB_REPO_URL = "https://github.com/h1mfzap3-beep/anime";
export const GITHUB_ZIP_URL = "https://github.com/h1mfzap3-beep/anime/archive/refs/heads/main.zip";
export const ADMIN_EMAIL = "h1mfzap3@gmail.com";
export const EXTENSION_VERSION = "1.0.0";

// Initialize Firebase App instance
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
