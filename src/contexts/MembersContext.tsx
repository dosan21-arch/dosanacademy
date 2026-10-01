import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { VISIBLE_COHORTS } from '../config/policy';
import { subscribeMembers } from '../services/members';
import type { Member } from '../types/member';

interface MembersState {
  members: Member[];
  loading: boolean;
  error: Error | null;
}

const MembersContext = createContext<MembersState | null>(null);

/** 앱 전체에서 원우 명단 구독을 한 번만 유지한다 (목록 ↔ 상세 이동 시 재조회 없음). */
export function MembersProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MembersState>({ members: [], loading: true, error: null });

  useEffect(
    () =>
      subscribeMembers(
        (members) =>
          setState({
            members: VISIBLE_COHORTS ? members.filter((m) => VISIBLE_COHORTS!.includes(m.cohort)) : members,
            loading: false,
            error: null,
          }),
        (error) => setState((s) => ({ ...s, loading: false, error })),
      ),
    [],
  );

  return <MembersContext.Provider value={state}>{children}</MembersContext.Provider>;
}

export function useMembers(): MembersState {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error('useMembers 는 MembersProvider 안에서만 사용할 수 있습니다.');
  return ctx;
}
