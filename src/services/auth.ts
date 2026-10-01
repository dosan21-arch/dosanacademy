import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider } from '../lib/firebase';

export type { User };

export function subscribeAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, cb);
}

/** 사용자가 로그인 창을 닫는 등 '오류가 아닌' 취소 */
export class SignInCancelled extends Error {}

/**
 * Google 로그인 팝업. 팝업이 차단된 환경이면 리다이렉트 방식으로 전환한다
 * (리다이렉트 시 페이지가 이동하므로 이 함수는 반환되지 않는다).
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (e) {
    if (e instanceof FirebaseError) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        throw new SignInCancelled();
      }
      if (e.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
        throw new SignInCancelled();
      }
    }
    throw e;
  }
}

export function signOut(): Promise<void> {
  return fbSignOut(auth);
}

/** Firebase 오류 코드를 사용자용 한국어 문구로 변환 */
export function authErrorMessage(e: unknown): string {
  if (e instanceof FirebaseError) {
    switch (e.code) {
      case 'auth/unauthorized-domain':
        return '이 주소에서는 로그인이 허용되지 않았습니다. 사무처에 문의해 주세요. (승인된 도메인 미등록)';
      case 'auth/network-request-failed':
        return '인터넷 연결을 확인해 주세요.';
      case 'auth/too-many-requests':
        return '잠시 후 다시 시도해 주세요.';
    }
  }
  return '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.';
}
