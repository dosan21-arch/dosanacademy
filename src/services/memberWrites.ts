import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { MemberContact } from '../types/member';
import { buildSearchKeywords } from '../utils/search';
import { contactRef } from './contacts';
import { MEMBERS } from './members';
import { deletePhotoByUrl } from './storage';

/** 공개 정보 입력값 */
export interface MemberInput {
  name: string;
  cohort: number;
  position: string;
  organization: string;
}

export interface NewMemberRow {
  member: MemberInput;
  contact: MemberContact;
  photoUrl?: string | null;
  /** 지정하지 않으면 자동 생성 */
  id?: string;
}

/** 사진 경로에 쓰기 위해 저장 전에 미리 문서 ID 를 만든다 */
export function newMemberId(): string {
  return doc(collection(db, MEMBERS)).id;
}

function publicFields(input: MemberInput, photoUrl: string | null) {
  return {
    name: input.name,
    cohort: input.cohort,
    position: input.position,
    organization: input.organization,
    photoUrl,
    searchKeywords: buildSearchKeywords(input),
  };
}

/**
 * 원우 생성. 공개 정보와 연락처를 한 번에(batch) 저장해서 한쪽만 저장되는 일이 없게 한다.
 * createdBy/updatedBy 에는 저장한 사람의 이메일, 시각은 서버 시각 (firestore.rules 가 검증).
 */
export async function createMember(
  id: string,
  input: MemberInput,
  contact: MemberContact,
  photoUrl: string | null,
  actorEmail: string,
): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, MEMBERS, id), {
    ...publicFields(input, photoUrl),
    createdAt: serverTimestamp(),
    createdBy: actorEmail,
    updatedAt: serverTimestamp(),
    updatedBy: actorEmail,
  });
  batch.set(contactRef(id), contact);
  await batch.commit();
}

/** 원우 수정. 최초 작성 이력(createdAt/By)은 건드리지 않는다. */
export async function updateMember(
  id: string,
  input: MemberInput,
  contact: MemberContact,
  photoUrl: string | null,
  actorEmail: string,
): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, MEMBERS, id), {
    ...publicFields(input, photoUrl),
    updatedAt: serverTimestamp(),
    updatedBy: actorEmail,
  });
  batch.set(contactRef(id), contact);
  await batch.commit();
}

/** 원우 삭제 (관리자 전용 — 규칙에서 강제). 연락처·사진도 함께 정리한다. */
export async function deleteMember(id: string, photoUrl: string | null): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(contactRef(id));
  batch.delete(doc(db, MEMBERS, id));
  await batch.commit();
  await deletePhotoByUrl(photoUrl);
}

/**
 * 여러 명 일괄 생성 (CSV 업로드·샘플 데이터).
 * Firestore batch 한도(500 쓰기)와 보안 규칙 평가 한도를 고려해 50명(100 쓰기)씩 나눠 저장한다.
 */
export async function bulkCreateMembers(
  rows: NewMemberRow[],
  actorEmail: string,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const CHUNK = 50;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const batch = writeBatch(db);
    for (const row of rows.slice(i, i + CHUNK)) {
      const id = row.id ?? newMemberId();
      batch.set(doc(db, MEMBERS, id), {
        ...publicFields(row.member, row.photoUrl ?? null),
        createdAt: serverTimestamp(),
        createdBy: actorEmail,
        updatedAt: serverTimestamp(),
        updatedBy: actorEmail,
      });
      batch.set(contactRef(id), row.contact);
    }
    await batch.commit();
    onProgress?.(Math.min(i + CHUNK, rows.length), rows.length);
  }
}
