import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-2">
        <Outlet />
      </main>
      <footer
        className="py-6 text-center text-sm text-ink-faint"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        사단법인 도산아카데미 원우수첩
      </footer>
    </div>
  );
}
