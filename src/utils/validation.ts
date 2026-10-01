import type { MemberFormValues } from '../types/member';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** 국내 전화번호 (휴대폰·지역번호·대표번호). 하이픈/공백/괄호 허용 */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[\s\-()]/g, '');
  return /^(\+82)?0?\d{8,11}$/.test(digits);
}

/** "1", "1기", "제1기" → 1. 올바르지 않으면 null */
export function parseCohort(value: string): number | null {
  const m = value.trim().match(/^제?\s*(\d{1,3})\s*기?$/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 999 ? n : null;
}

export type FormErrors = Partial<Record<keyof MemberFormValues, string>>;

/** 원우 입력값 검증 (firestore.rules 의 isValidMember/isValidContact 와 같은 한도) */
export function validateMemberForm(v: MemberFormValues): FormErrors {
  const errors: FormErrors = {};
  if (!v.name.trim()) errors.name = '이름을 입력해 주세요.';
  else if (v.name.trim().length > 50) errors.name = '이름은 50자 이내로 입력해 주세요.';

  if (!v.cohort.trim()) errors.cohort = '기수를 입력해 주세요.';
  else if (parseCohort(v.cohort) === null) errors.cohort = '기수는 숫자로 입력해 주세요. (예: 1)';

  if (v.position.trim().length > 100) errors.position = '100자 이내로 입력해 주세요.';
  if (v.organization.trim().length > 100) errors.organization = '100자 이내로 입력해 주세요.';

  if (v.phone.trim() && !isValidPhone(v.phone)) errors.phone = '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)';
  if (v.email.trim() && !isValidEmail(v.email)) errors.email = '이메일 형식이 올바르지 않습니다. (예: name@example.com)';
  if (v.memo.length > 2000) errors.memo = '메모는 2000자 이내로 입력해 주세요.';
  return errors;
}

/** 01012345678 →010-1234-5678 형태로 정리 (형식을 알 수 없으면 입력값 그대로) */
export function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '');
  if (/^02\d{7,8}$/.test(d)) return d.replace(/^(02)(\d{3,4})(\d{4})$/, '$1-$2-$3');
  if (/^0\d{9,10}$/.test(d)) return d.replace(/^(0\d{2})(\d{3,4})(\d{4})$/, '$1-$2-$3');
  if (/^1\d{7}$/.test(d)) return d.replace(/^(\d{4})(\d{4})$/, '$1-$2');
  return value.trim();
}
