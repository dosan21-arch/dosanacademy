import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

/** 제목 줄 — 바탕을 페이지 바탕(canvas)과 같게 해서 스크롤 시 색 띠가 생기지 않게 (가이드 4-1) */
export default function Header() {
  const { user, isAdmin, loading, signIn, signOut } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || '';

  return (
    <header
      className="sticky z-30 bg-canvas/95 backdrop-blur"
      style={{ top: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4">
        <Link to="/" className="shrink-0 text-[22px] font-bold tracking-tight text-brand-ink">
          도산 아카데미
        </Link>

        <div className="flex min-w-0 items-center gap-1.5">
          {loading && !user ? null : user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex min-h-11 items-center rounded-control px-2.5 font-bold text-brand-ink hover:bg-brand-50"
                >
                  관리
                </Link>
              )}
              <span
                className="max-w-[5.5rem] truncate font-semibold text-ink-soft sm:max-w-[12rem]"
                title={user.email ?? ''}
              >
                {displayName}
              </span>
              <Button variant="secondary" size="sm" onClick={signOut}>
                로그아웃
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => void signIn()}>
              로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
