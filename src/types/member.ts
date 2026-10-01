import type { Timestamp } from 'firebase/firestore';

/** members/{id} — 누구나 읽을 수 있는 공개 정보 */
export interface Member {
  id: string;
  name: string;
  /** 기수 (숫자). 화면에는 "15기" 형태로 표시 */
  cohort: number;
  position: string;
  organization: string;
  photoUrl: string | null;
  /** 검색용 키워드 (원문 소문자 + 초성) */
  searchKeywords: string[];
  createdAt: Timestamp | null;
  createdBy: string;
  updatedAt: Timestamp | null;
  updatedBy: string;
}

/** members/{id}/private/contact — 로그인 사용자 전용 */
export interface MemberContact {
  phone: string;
  email: string;
  memo: string;
}

/** 추가/수정 폼 입력값 */
export interface MemberFormValues {
  name: string;
  cohort: string;
  position: string;
  organization: string;
  phone: string;
  email: string;
  memo: string;
}
