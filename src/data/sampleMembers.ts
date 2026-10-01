import type { NewMemberRow } from '../services/memberWrites';

/**
 * 시험용 가상 원우 10명 (실존 인물·기관과 무관).
 * 문서 ID 를 'sample-' 로 시작하게 해서 관리 화면에서 한 번에 지울 수 있게 한다.
 */
const RAW: [string, string, string][] = [
  ['김현우', '대표이사', '(주)도산상사'],
  ['이서연', '교수', '한빛대학교'],
  ['박준호', '원장', '새벽내과의원'],
  ['최민지', '이사', '누리나눔재단'],
  ['정도윤', '변호사', '바른길법률사무소'],
  ['강지훈', '회계사', '정도회계법인'],
  ['조수아', '팀장', '푸른무역(주)'],
  ['윤태민', '대표', '한결연구소'],
  ['장하은', '부장', '다온테크(주)'],
  ['임도현', '과장', '도산상사'],
];

export const SAMPLE_ID_PREFIX = 'sample-';

export const SAMPLE_MEMBERS: NewMemberRow[] = RAW.map(([name, position, organization], i) => {
  const n = String(i + 1).padStart(2, '0');
  return {
    id: `${SAMPLE_ID_PREFIX}${n}`,
    member: { name, cohort: 1, position, organization },
    contact: {
      phone: `010-0000-00${n}`,
      email: `sample${n}@example.com`,
      memo: '시험용 샘플 데이터입니다.',
    },
  };
});
