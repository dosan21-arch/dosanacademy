import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { MemberContact } from '../types/member';
import { MEMBERS } from './members';

export function contactRef(memberId: string) {
  return doc(db, MEMBERS, memberId, 'private', 'contact');
}

/** 연락처 조회. 권한이 없으면 Firestore 규칙에 의해 permission-denied 오류가 난다. */
export async function getContact(memberId: string): Promise<MemberContact> {
  const snap = await getDoc(contactRef(memberId));
  const data = snap.data() ?? {};
  return {
    phone: data.phone ?? '',
    email: data.email ?? '',
    memo: data.memo ?? '',
  };
}
