import { collection, getDocs, onSnapshot, type DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Member } from '../types/member';

export const MEMBERS = 'members';

export function toMember(id: string, data: DocumentData): Member {
  return {
    id,
    name: data.name ?? '',
    cohort: Number(data.cohort) || 0,
    position: data.position ?? '',
    organization: data.organization ?? '',
    photoUrl: data.photoUrl ?? null,
    searchKeywords: data.searchKeywords ?? [],
    createdAt: data.createdAt ?? null,
    createdBy: data.createdBy ?? '',
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? '',
  };
}

/** 표시 기수 제한(VISIBLE_COHORTS)과 무관하게 전체 원우를 1회 조회 — 관리 화면의 중복 확인용 */
export async function fetchAllMembers(): Promise<Member[]> {
  const snap = await getDocs(collection(db, MEMBERS));
  return snap.docs.map((d) => toMember(d.id, d.data()));
}

/** 원우 전체 명단 실시간 구독. 반환값을 호출하면 구독 해제. */
export function subscribeMembers(
  onData: (members: Member[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    collection(db, MEMBERS),
    (snap) => onData(snap.docs.map((d) => toMember(d.id, d.data()))),
    onError,
  );
}
