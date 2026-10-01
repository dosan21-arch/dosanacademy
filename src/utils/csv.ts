import type { MemberContact } from '../types/member';
import type { MemberInput } from '../services/memberWrites';
import { formatPhone, isValidEmail, isValidPhone, parseCohort } from './validation';

/** CSV 양식 열 순서 (양식 다운로드·안내에 사용) */
export const CSV_COLUMNS = ['이름', '기수', '직책', '소속', '전화번호', '이메일', '메모'] as const;

/** 엑셀에서 흔히 쓰는 다른 열 이름도 인식 */
const HEADER_ALIASES: Record<string, keyof MemberInput | keyof MemberContact> = {
  이름: 'name',
  성명: 'name',
  성함: 'name',
  기수: 'cohort',
  직책: 'position',
  직위: 'position',
  직함: 'position',
  소속: 'organization',
  회사: 'organization',
  회사명: 'organization',
  기관: 'organization',
  소속기관: 'organization',
  전화번호: 'phone',
  전화: 'phone',
  휴대폰번호: 'phone',
  휴대폰: 'phone',
  휴대전화: 'phone',
  핸드폰: 'phone',
  연락처: 'phone',
  이메일: 'email',
  메일: 'email',
  email: 'email',
  메모: 'memo',
  비고: 'memo',
};

/** RFC 4180 CSV 파서 (따옴표 안의 쉼표·줄바꿈·"" 처리) */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, '');

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** 엑셀 "CSV UTF-8" 과 기본 "CSV(쉼표로 분리)"(CP949) 를 모두 지원 */
export async function readCsvFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('euc-kr').decode(buffer);
  }
}

export interface ParsedMemberRow {
  /** 엑셀 기준 행 번호 (제목 행 = 1) */
  line: number;
  member: MemberInput;
  contact: MemberContact;
  errors: string[];
}

export interface CsvParseResult {
  rows: ParsedMemberRow[];
  /** 파일 자체 문제 (제목 행 누락 등) */
  fileError?: string;
}

export function parseMemberCsv(text: string): CsvParseResult {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], fileError: '제목 행과 원우 정보가 한 줄 이상 있어야 합니다.' };

  // "이름*", " 전화 번호 " 처럼 공백·별표가 섞여도 인식
  const header: (string | undefined)[] = table[0].map((h) => {
    const key = h.replace(/[\s*]/g, '');
    return HEADER_ALIASES[key] ?? HEADER_ALIASES[key.toLowerCase()];
  });
  if (!header.includes('name') || !header.includes('cohort')) {
    return { rows: [], fileError: `첫 줄(제목 행)에 '이름'과 '기수' 열이 있어야 합니다. 양식을 내려받아 확인해 주세요.` };
  }

  const rows = table.slice(1).map((cells, idx): ParsedMemberRow => {
    const get = (key: string) => {
      const col = header.indexOf(key);
      return col >= 0 ? (cells[col] ?? '').trim() : '';
    };
    const errors: string[] = [];
    const name = get('name');
    const cohortRaw = get('cohort');
    const cohort = parseCohort(cohortRaw);
    const phone = get('phone');
    const email = get('email').toLowerCase();

    if (!name) errors.push('이름 없음');
    else if (name.length > 50) errors.push('이름이 너무 김');
    if (!cohortRaw) errors.push('기수 없음');
    else if (cohort === null) errors.push(`기수 형식 오류(${cohortRaw})`);
    if (phone && !isValidPhone(phone)) errors.push(`전화번호 형식 오류(${phone})`);
    if (email && !isValidEmail(email)) errors.push(`이메일 형식 오류(${email})`);

    return {
      line: idx + 2,
      member: {
        name,
        cohort: cohort ?? 0,
        position: get('position').slice(0, 100),
        organization: get('organization').slice(0, 100),
      },
      contact: {
        phone: phone && isValidPhone(phone) ? formatPhone(phone) : phone,
        email,
        memo: get('memo').slice(0, 2000),
      },
      errors,
    };
  });

  return { rows };
}

/** 엑셀에서 바로 열리는 빈 양식 (UTF-8 BOM 포함 → 한글 깨짐 방지) */
export function csvTemplateBlob(): Blob {
  const example = ['홍길동', '1', '대표이사', '(주)예시상사', '010-1234-5678', 'hong@example.com', ''];
  const content = `﻿${CSV_COLUMNS.join(',')}\r\n${example.join(',')}\r\n`;
  return new Blob([content], { type: 'text/csv;charset=utf-8' });
}
