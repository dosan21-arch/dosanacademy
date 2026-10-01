# 도산 아카데미 원우수첩 — 작업 안내

> **먼저 [docs/WEBAPP_GUIDE.md](docs/WEBAPP_GUIDE.md) 를 읽으세요.** 디자인 원칙·작은 규칙들은 그 문서를 따릅니다.
> 아래는 이 프로젝트에서 가이드와 **다르게** 정한 점과, 이 프로젝트만의 값입니다.

## 프로젝트 개요
- 사단법인 도산아카데미 원우 명단 웹앱. 주 사용자 40~70대, 휴대폰 위주. UI 는 모두 한국어.
- 사이트: https://dosanacademy21.web.app (Firebase 프로젝트 `dosanacademy21`)
- 저장소: https://github.com/dosan21-arch/dosanacademy

## 기술 스택 (가이드 2장과 다른 점)
| 영역 | 이 프로젝트 | 가이드 |
|---|---|---|
| 프레임워크 | **React + Vite + TypeScript** (SPA, react-router) | Next.js |
| 호스팅 | **Firebase Hosting + GitHub Actions** | App Hosting(GitHub 미연결) |
| 서버 로직 | 없음 — 권한은 전부 `firestore.rules`/`storage.rules` 로 강제 | Admin SDK API 라우트 |
| 로그인 | Google 만 | 구글·카카오·문자 |

## 커밋·배포 규칙 (2026-10-01 사용자 결정)
1. **GitHub 이 유일한 원본.** 대화를 시작하면 먼저 `git status`·`git log` 로 로컬이 GitHub 과 같은지 확인한다.
2. **무언가 고치면 묻지 않고 바로 커밋 + `git push origin main`.**
   - ⚠️ 가이드와 달리 이 프로젝트는 **main push = 라이브 배포**다(GitHub Actions). 사용자가 이를 알고
     (b)안 "main 에 바로 push" 를 선택했다. 그러므로 push 전에 반드시 `npm run build` 가 통과하는지 확인한다.
   - Pull Request 를 열면 프리뷰 채널(`dosanacademy21--pr번호-xxxx.web.app`)로 배포된다.
     프리뷰 주소는 승인된 도메인이 아니라서 **로그인은 안 되고** 열람·검색만 확인 가능.
3. 커밋 전 개인정보(실제 연락처), `.env.local`, 서비스 계정 키가 섞이지 않았는지 확인한다.
4. 보안 규칙(`firestore.rules`, `storage.rules`)도 main push 시 함께 게시된다(⑤단계에서 워크플로에 포함).
5. 작업 기록·값 변경 이유는 이 파일이나 코드 주석에 **날짜와 이유**와 함께 남긴다.

## 이 앱만의 값
- 강조색: 로고 색 `#27235E` (다크 모드 버튼은 `#4A45A8`, 글씨용 `#AAA6EC`) — `src/index.css`
- 본문 17px (가이드 예시보다 한 단계 큼 — 40~70대 사용자 고려)
- 정책 상수는 모두 `src/config/policy.ts`:
  - `CONTACT_VISIBILITY = 'signedIn'` — 연락처는 로그인한 모든 사용자에게 공개.
    바꾸면 `firestore.rules` 의 `canReadContact()` 도 같이 바꿔야 함
  - `VISIBLE_COHORTS = [1]` — 2026-10-01 사용자 요청으로 당분간 1기만 표시. `null` 이면 전체
- 수정 이력(`createdBy`/`updatedBy`)은 이메일로 저장 (공개 문서에 노출됨을 사용자가 수용, 2026-10-01)

## 데이터 구조
- `members/{id}` 공개 정보 / `members/{id}/private/contact` 전화·이메일·메모 / `allowedUsers/{소문자 이메일}` role
- 사진: Storage `members/{id}/photo_{시각}.jpg` (800px JPEG 로 줄여서 업로드)
- 샘플 데이터 문서 ID 는 `sample-` 로 시작 (관리 화면에서 일괄 삭제)

## 명령
- `npm run dev` — 개발 서버 (`.env.local` 필요, `.env.example` 참고)
- `npm run build` — 타입 검사 + 빌드
