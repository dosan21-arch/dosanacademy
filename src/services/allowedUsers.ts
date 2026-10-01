import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AllowedUser, Role } from '../types/user';

const ALLOWED_USERS = 'allowedUsers';

/** 문서 ID 로 쓰기 때문에 이메일은 항상 소문자·공백 제거 형태로 맞춘다. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function parseRole(value: unknown): Role | null {
  return value === 'admin' || value === 'editor' ? value : null;
}

/** 로그인 직후 1회 조회 */
export async function fetchRole(email: string): Promise<Role | null> {
  try {
    const snap = await getDoc(doc(db, ALLOWED_USERS, normalizeEmail(email)));
    return snap.exists() ? parseRole(snap.data().role) : null;
  } catch {
    return null;
  }
}

/** 본인 권한 실시간 구독 (관리자가 권한을 바꾸면 바로 반영) */
export function subscribeOwnRole(email: string, cb: (role: Role | null) => void): () => void {
  return onSnapshot(
    doc(db, ALLOWED_USERS, normalizeEmail(email)),
    (snap) => cb(snap.exists() ? parseRole(snap.data().role) : null),
    () => cb(null),
  );
}

/** 허용 목록 전체 (관리자만 규칙상 읽기 가능) */
export function subscribeAllowedUsers(
  onData: (users: AllowedUser[]) => void,
  onError: (e: Error) => void,
): () => void {
  return onSnapshot(
    collection(db, ALLOWED_USERS),
    (snap) =>
      onData(
        snap.docs
          .map((d) => ({
            email: d.id,
            role: parseRole(d.data().role) ?? 'editor',
            addedBy: d.data().addedBy ?? '',
            addedAt: d.data().addedAt ?? null,
          }))
          .sort((a, b) => a.email.localeCompare(b.email)),
      ),
    onError,
  );
}

export function addAllowedUser(email: string, role: Role, addedBy: string): Promise<void> {
  return setDoc(doc(db, ALLOWED_USERS, normalizeEmail(email)), {
    role,
    addedBy,
    addedAt: serverTimestamp(),
  });
}

export function updateAllowedUserRole(email: string, role: Role): Promise<void> {
  return updateDoc(doc(db, ALLOWED_USERS, normalizeEmail(email)), { role });
}

export function removeAllowedUser(email: string): Promise<void> {
  return deleteDoc(doc(db, ALLOWED_USERS, normalizeEmail(email)));
}
