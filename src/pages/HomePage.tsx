import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import MemberList from '../components/members/MemberList';
import MemberListSkeleton from '../components/members/MemberListSkeleton';
import SearchBar from '../components/members/SearchBar';
import ViewToggle from '../components/members/ViewToggle';
import { SEARCH_DEBOUNCE_MS, VISIBLE_COHORTS } from '../config/policy';
import { useAuth } from '../contexts/AuthContext';
import { useMembers } from '../contexts/MembersContext';
import { useDebounce } from '../hooks/useDebounce';
import { matchesMember, sortByName, type ViewMode } from '../utils/search';

export default function HomePage() {
  const { members, loading, error } = useMembers();
  const { requireEditor } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // 검색어·보기 방식은 URL 에 보관 → 상세 화면에서 뒤로 와도 그대로 유지
  const [input, setInput] = useState(() => params.get('q') ?? '');
  const query = useDebounce(input, SEARCH_DEBOUNCE_MS);
  // 표시 기수가 하나뿐이면 기수별 보기는 의미가 없으므로 숨긴다
  const showViewToggle = VISIBLE_COHORTS === null || VISIBLE_COHORTS.length > 1;
  const view: ViewMode = showViewToggle && params.get('view') === 'cohort' ? 'cohort' : 'name';

  useEffect(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (query.trim()) next.set('q', query);
        else next.delete('q');
        return next;
      },
      { replace: true },
    );
  }, [query, setParams]);

  const setView = (v: ViewMode) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (v === 'cohort') next.set('view', 'cohort');
        else next.delete('view');
        return next;
      },
      { replace: true },
    );

  const sorted = useMemo(() => [...members].sort(sortByName), [members]);
  const filtered = useMemo(() => sorted.filter((m) => matchesMember(m, query)), [sorted, query]);

  const onAdd = () => void requireEditor(() => navigate('/members/new'));

  return (
    <div className="space-y-3">
      <SearchBar value={input} onChange={setInput} />

      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 px-1">
        <p className="font-semibold text-ink-muted" aria-live="polite">
          {loading ? '' : query.trim() ? `검색 결과 ${filtered.length}명` : `전체 ${members.length}명`}
        </p>
        <div className="flex items-center gap-2">
          {showViewToggle && <ViewToggle value={view} onChange={setView} />}
          <Button size="sm" onClick={onAdd}>
            ＋ 원우 추가
          </Button>
        </div>
      </div>

      {loading ? (
        <MemberListSkeleton />
      ) : error ? (
        <EmptyState title="명단을 불러오지 못했습니다." icon="⚠️">
          인터넷 연결을 확인한 뒤 새로고침해 주세요.
        </EmptyState>
      ) : filtered.length === 0 ? (
        <EmptyState title={query.trim() ? '검색 결과가 없습니다' : '등록된 원우가 없습니다'} icon={query.trim() ? '🔍' : '👥'}>
          {query.trim() && '이름, 직책, 소속의 일부나 초성(예: ㄱㅎㅇ)으로 검색해 보세요.'}
        </EmptyState>
      ) : (
        <MemberList members={filtered} view={view} />
      )}
    </div>
  );
}
