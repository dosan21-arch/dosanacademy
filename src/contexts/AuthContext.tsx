import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { CONTACT_VISIBILITY, NO_PERMISSION_MESSAGE } from '../config/policy';
import { fetchRole, subscribeOwnRole } from '../services/allowedUsers';
import {
  authErrorMessage,
  SignInCancelled,
  signInWithGoogle,
  signOut as authSignOut,
  subscribeAuth,
  type User,
} from '../services/auth';
import type { Role } from '../types/user';
import { isInAppBrowser, isKakaoTalk, openInExternalBrowser } from '../utils/inAppBrowser';
import { useToast } from './ToastContext';

export interface Session {
  user: User;
  role: Role | null;
}

interface AuthApi {
  user: User | null;
  role: Role | null;
  /** 최초 로그인 상태/권한 확인 중 */
  loading: boolean;
  isEditor: boolean;
  isAdmin: boolean;
  /** 연락처(전화·이메일·메모) 열람 가능 여부 — policy.ts 의 CONTACT_VISIBILITY 기준 */
  canViewContact: boolean;
  signIn: () => Promise<Session | null>;
  signOut: () => Promise<void>;
  /** 로그인되어 있지 않으면 로그인 팝업을 띄운 뒤 action 실행 */
  requireLogin: (action: (s: Session) => void) => Promise<void>;
  /** 로그인 + 허용 목록(editor/admin) 확인 후 action 실행. 권한 없으면 안내 토스트 */
  requireEditor: (action: (s: Session) => void) => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [inAppNoticeOpen, setInAppNoticeOpen] = useState(false);

  useEffect(
    () =>
      subscribeAuth((u) => {
        setUser(u);
        setAuthLoading(false);
      }),
    [],
  );

  useEffect(() => {
    if (!user?.email) {
      setRole(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    return subscribeOwnRole(user.email, (r) => {
      setRole(r);
      setRoleLoading(false);
    });
  }, [user]);

  const signIn = useCallback(async (): Promise<Session | null> => {
    if (user) return { user, role: user.email ? await fetchRole(user.email) : null };
    if (isInAppBrowser()) {
      setInAppNoticeOpen(true);
      return null;
    }
    try {
      const u = await signInWithGoogle();
      toast.success(`${u.displayName ?? '원우'}님, 환영합니다.`);
      return { user: u, role: u.email ? await fetchRole(u.email) : null };
    } catch (e) {
      if (!(e instanceof SignInCancelled)) toast.error(authErrorMessage(e));
      return null;
    }
  }, [user, toast]);

  const signOut = useCallback(async () => {
    await authSignOut();
    toast.info('로그아웃되었습니다.');
  }, [toast]);

  const requireLogin = useCallback(
    async (action: (s: Session) => void) => {
      const session = await signIn();
      if (session) action(session);
    },
    [signIn],
  );

  const requireEditor = useCallback(
    async (action: (s: Session) => void) => {
      const session = await signIn();
      if (!session) return;
      if (!session.role) {
        toast.error(NO_PERMISSION_MESSAGE);
        return;
      }
      action(session);
    },
    [signIn, toast],
  );

  const value = useMemo<AuthApi>(
    () => ({
      user,
      role,
      loading: authLoading || roleLoading,
      isEditor: role === 'editor' || role === 'admin',
      isAdmin: role === 'admin',
      canViewContact: CONTACT_VISIBILITY === 'signedIn' ? !!user : !!role,
      signIn,
      signOut,
      requireLogin,
      requireEditor,
    }),
    [user, role, authLoading, roleLoading, signIn, signOut, requireLogin, requireEditor],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Modal open={inAppNoticeOpen} title="다른 브라우저에서 열어 주세요" onClose={() => setInAppNoticeOpen(false)}>
        <p className="text-slate-700">
          카카오톡·네이버 등 앱 안에서 열린 화면에서는 Google 정책상 로그인이 되지 않습니다.
        </p>
        {isKakaoTalk() ? (
          <p className="mt-2 text-slate-700">아래 버튼을 누르면 휴대폰 기본 브라우저로 열립니다.</p>
        ) : (
          <p className="mt-2 text-slate-700">
            화면 오른쪽 위(또는 아래)의 <b>⋮</b> 또는 <b>공유</b> 메뉴에서 <b>“다른 브라우저로 열기”</b>를 눌러 크롬·사파리·삼성
            인터넷으로 열어 주세요.
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setInAppNoticeOpen(false)}>
            닫기
          </Button>
          {isKakaoTalk() && <Button onClick={() => openInExternalBrowser()}>기본 브라우저로 열기</Button>}
        </div>
      </Modal>
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 는 AuthProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}
