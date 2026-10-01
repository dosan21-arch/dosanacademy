import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Spinner from './components/common/Spinner';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { MembersProvider } from './contexts/MembersContext';
import { ToastProvider } from './contexts/ToastContext';
import { isFirebaseConfigured } from './lib/firebase';
import HomePage from './pages/HomePage';
import MemberDetailPage from './pages/MemberDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import SetupRequiredPage from './pages/SetupRequiredPage';

// 편집·관리 화면은 일부 사용자만 쓰므로 필요할 때만 불러온다
const MemberEditPage = lazy(() => import('./pages/MemberEditPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

export default function App() {
  if (!isFirebaseConfigured) return <SetupRequiredPage />;

  return (
    <ToastProvider>
      <AuthProvider>
        <MembersProvider>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="members/new" element={<MemberEditPage />} />
                <Route path="members/:id" element={<MemberDetailPage />} />
                <Route path="members/:id/edit" element={<MemberEditPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </MembersProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
