import type { Member } from '../types/member';
import { hangulIncludes, toChosung } from './hangul';

/** 공백 제거 + 소문자 */
export function normalize(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase();
}

/**
 * Firestore 에 저장할 searchKeywords.
 * (화면 검색은 아래 matchesMember 가 원본 필드로 직접 수행하지만,
 *  추후 서버 쿼리나 외부 도구에서 쓸 수 있도록 문서에도 함께 저장한다.)
 */
export function buildSearchKeywords(m: Pick<Member, 'name' | 'position' | 'organization'>): string[] {
  const fields = [m.name, m.position, m.organization].map(normalize).filter(Boolean);
  const keywords = new Set<string>();
  for (const f of fields) {
    keywords.add(f);
    keywords.add(toChosung(f));
  }
  return Array.from(keywords);
}

/** 이름·직책·소속(+ "15기" 형태의 기수) 중 하나라도 부분 일치하면 true */
export function matchesMember(member: Member, rawQuery: string): boolean {
  const q = normalize(rawQuery);
  if (!q) return true;

  const cohortMatch = q.match(/^(\d+)기?$/);
  if (cohortMatch && member.cohort === Number(cohortMatch[1])) return true;

  return [member.name, member.position, member.organization].some((f) =>
    hangulIncludes(normalize(f ?? ''), q),
  );
}

const collator = new Intl.Collator('ko');

export function sortByName(a: Member, b: Member): number {
  return collator.compare(a.name, b.name);
}

export type ViewMode = 'name' | 'cohort';

/** 기수별 묶음 (최근 기수가 위) */
export function groupByCohort(members: Member[]): { cohort: number; members: Member[] }[] {
  const map = new Map<number, Member[]>();
  for (const m of members) {
    const list = map.get(m.cohort) ?? [];
    list.push(m);
    map.set(m.cohort, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([cohort, list]) => ({ cohort, members: list.sort(sortByName) }));
}
