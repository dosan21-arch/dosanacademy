/**
 * 카카오톡·네이버·인스타그램 등 앱 내장 브라우저 감지.
 * Google 은 보안 정책상 이런 내장 브라우저(WebView)에서 로그인을 차단하므로
 * 외부 브라우저(크롬·사파리·삼성 인터넷)로 열도록 안내해야 한다.
 */
const IN_APP_PATTERN = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|FB_IAB|Line\/|DaumApps|everytimeApp|; wv\)/i;

export function isInAppBrowser(ua = navigator.userAgent): boolean {
  return IN_APP_PATTERN.test(ua);
}

export function isKakaoTalk(ua = navigator.userAgent): boolean {
  return /KAKAOTALK/i.test(ua);
}

/** 카카오톡은 전용 스킴으로 외부 브라우저 열기를 지원한다. */
export function openInExternalBrowser(url = window.location.href): boolean {
  if (isKakaoTalk()) {
    window.location.href = `kakaotalk://web/openExternal?url=${encodeURIComponent(url)}`;
    return true;
  }
  return false;
}
