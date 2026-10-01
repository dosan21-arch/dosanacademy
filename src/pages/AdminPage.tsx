import { useState } from 'react';
import AllowedUsersSection from '../components/admin/AllowedUsersSection';
import CsvImportSection from '../components/admin/CsvImportSection';
import SampleDataSection from '../components/admin/SampleDataSection';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { normalizeEmail } from '../services/allowedUsers';

type Tab = 'users' | 'import';
const TABS: { value: Tab; label: string }[] = [
  { value: 'users', label: '권한 관리' },
  { value: 'import', label: '명단 일괄 등록' },
];

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  if (loading) return <Spinner />;
  if (!user || !isAdmin) {
    return (
      <EmptyState title="관리자만 이용할 수 있는 화면입니다." icon="🔒">
        관리자 계정으로 로그인해 주세요.
      </EmptyState>
    );
  }
  const myEmail = normalizeEmail(user.email ?? '');

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="px-1 text-[22px] font-bold">관리</h1>
      <div role="tablist" aria-label="관리 메뉴" className="grid grid-cols-2 rounded-full bg-surface p-1 hairline">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setTab(t.value)}
            className={`min-h-11 rounded-full font-bold transition ${
              tab === t.value ? 'bg-brand-500 text-white' : 'text-ink-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' ? (
        <AllowedUsersSection myEmail={myEmail} />
      ) : (
        <div className="space-y-4">
          <CsvImportSection myEmail={myEmail} />
          <SampleDataSection myEmail={myEmail} />
        </div>
      )}
    </div>
  );
}
