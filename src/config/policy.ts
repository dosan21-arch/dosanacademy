/**
 * 앱 정책 설정 — 운영 정책을 바꿀 때는 이 파일만 수정하면 됩니다.
 *
 * ⚠️ 화면 표시 정책만 이곳에서 정합니다. 실제 데이터 접근 차단은 서버(firestore.rules)가 담당하므로
 *    연락처 공개 범위를 바꿀 때는 firestore.rules 의 `canReadContact()` 함수도 같이 바꿔야 합니다.
 */

/**
 * 전화번호·이메일·메모를 볼 수 있는 사용자 범위
 *  - 'signedIn' : 구글 로그인한 모든 사용자  (firestore.rules: isSignedIn())
 *  - 'allowed'  : 허용 목록(allowedUsers)에 등록된 사용자만  (firestore.rules: isAllowed())
 */
export const CONTACT_VISIBILITY: 'signedIn' | 'allowed' = 'signedIn';

/**
 * 명단에 표시할 기수. null 이면 전체 기수 표시.
 * 예) [1] → 1기만, [1, 2] → 1·2기만, null → 전체
 * (화면 표시 범위만 제한합니다. 데이터는 그대로 저장되어 있습니다.)
 */
export const VISIBLE_COHORTS: number[] | null = [1];

/** 검색 입력 후 필터링까지 대기 시간(ms) */
export const SEARCH_DEBOUNCE_MS = 250;

/** 사진 업로드 제한 */
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_ALLOWED_TYPES = ['image/jpeg', 'image/png'] as const;
export const PHOTO_MAX_DIMENSION = 800;

/** 권한 없음 안내 문구 */
export const NO_PERMISSION_MESSAGE = '수정 권한이 없습니다. 사무처에 문의해 주세요.';
