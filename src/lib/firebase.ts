import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  generateReferenceCode,
  sanitizeConsultationValues,
  validateConsultationForm,
  validateNewsletterEmail,
  type ConsultationFormValues,
} from '../utils/estimator';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const ADMIN_EMAIL = 'priya.globallygi@gmail.com';
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIRESTORE_DATABASE_ID = firebaseConfig.firestoreDatabaseId;

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function formatFriendlyFirestoreError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("Free daily read units per project")) {
    return `Firestore daily free read quota reached. Upgrade or inspect database at https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIRESTORE_DATABASE_ID}/data?openUpgradeDialog=true`;
  }
  if (raw.includes('Quota exceeded')) {
    return 'Daily Firestore quota exceeded. Quota resets tomorrow (Spark plan Enterprise edition limits apply).';
  }
  if (raw.includes('Missing or insufficient permissions') || raw.includes('permission-denied')) {
    return 'Access denied by Firestore security rules. Please ensure you are signed in with the authorized admin account.';
  }
  return 'Could not save right now. Please try again or call us at +91 96008 10952.';
}

export type AppointmentStatus = 'new' | 'contacted' | 'scheduled' | 'closed';

export interface StoredAppointment {
  id: string;
  referenceCode: string;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  message: string;
  status: AppointmentStatus;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export async function submitAppointment(
  values: ConsultationFormValues
): Promise<{ id: string; referenceCode: string; snapshot: ConsultationFormValues }> {
  const sanitized = sanitizeConsultationValues(values);
  const validationErrors = validateConsultationForm(sanitized);
  if (Object.keys(validationErrors).length > 0) {
    throw new Error('Validation failed before database write.');
  }

  const referenceCode = generateReferenceCode();
  const appointmentsCol = collection(db, 'appointments');
  const docRef = doc(appointmentsCol);
  const path = `appointments/${docRef.id}`;

  try {
    await setDoc(docRef, {
      referenceCode,
      name: sanitized.name,
      email: sanitized.email,
      phone: sanitized.phone,
      serviceType: sanitized.service,
      message: sanitized.message,
      status: 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, referenceCode, snapshot: sanitized };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function subscribeToNewsletter(email: string): Promise<string> {
  const cleanEmail = email.trim().toLowerCase();
  if (!validateNewsletterEmail(cleanEmail)) {
    throw new Error('Please enter a valid email address.');
  }

  const subscribersCol = collection(db, 'newsletter_subscribers');
  const docRef = doc(subscribersCol);
  const path = `newsletter_subscribers/${docRef.id}`;

  try {
    await setDoc(docRef, {
      email: cleanEmail,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function signInAdminWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

export function subscribeAppointments(
  onData: (items: StoredAppointment[]) => void,
  onError: (message: string) => void
): Unsubscribe {
  const path = 'appointments';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: StoredAppointment[] = snapshot.docs.map((d) => {
        const data = d.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : null;
        return {
          id: d.id,
          referenceCode: String(data.referenceCode ?? ''),
          name: String(data.name ?? ''),
          email: String(data.email ?? ''),
          phone: String(data.phone ?? ''),
          serviceType: String(data.serviceType ?? ''),
          message: String(data.message ?? ''),
          status: (data.status as AppointmentStatus) ?? 'new',
          createdAt,
          updatedAt,
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (structured) {
        onError(formatFriendlyFirestoreError(structured));
      }
    }
  );
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus
): Promise<void> {
  const path = `appointments/${appointmentId}`;
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAppointment(appointmentId: string): Promise<void> {
  const path = `appointments/${appointmentId}`;
  try {
    await deleteDoc(doc(db, 'appointments', appointmentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
