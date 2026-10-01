import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../lib/firebase';

export class UploadTimeoutError extends Error {}

/** 카카오톡 인앱 브라우저 등에서 요청이 응답 없이 멈추는 경우를 대비한 시간제한 (가이드 7-8) */
const UPLOAD_TIMEOUT_MS = 60_000;

/** 원우 사진 업로드 → 다운로드 URL 반환. 경로: members/{memberId}/photo_{시각}.jpg */
export async function uploadMemberPhoto(memberId: string, blob: Blob): Promise<string> {
  const fileRef = ref(storage, `members/${memberId}/photo_${Date.now()}.jpg`);
  const task = uploadBytesResumable(fileRef, blob, {
    contentType: 'image/jpeg',
    cacheControl: 'public, max-age=31536000',
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      task.cancel();
      reject(new UploadTimeoutError('사진 업로드 시간이 초과되었습니다.'));
    }, UPLOAD_TIMEOUT_MS);
    task.then(
      () => {
        clearTimeout(timer);
        resolve();
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });

  return getDownloadURL(fileRef);
}

/** 사진 삭제 (이미 없거나 실패해도 무시 — 사진 정리는 부가 작업) */
export async function deletePhotoByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    await deleteObject(ref(storage, url));
  } catch {
    /* 무시 */
  }
}
