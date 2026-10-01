import { PHOTO_ALLOWED_TYPES, PHOTO_MAX_BYTES, PHOTO_MAX_DIMENSION } from '../config/policy';

export class PhotoValidationError extends Error {}

/** 업로드 전 형식·용량 검사. 문제가 있으면 사용자용 문구로 PhotoValidationError 를 던진다. */
export function validatePhoto(file: File): void {
  if (!(PHOTO_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    throw new PhotoValidationError('jpg 또는 png 사진만 올릴 수 있습니다.');
  }
  if (file.size > PHOTO_MAX_BYTES) {
    throw new PhotoValidationError('5MB 이하의 사진만 올릴 수 있습니다.');
  }
}

async function loadImage(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  // 휴대폰 사진의 회전 정보(EXIF)를 반영해서 불러온다
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* 아래 방식으로 재시도 */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * 긴 변을 maxSize(기본 800px) 이하로 줄여 JPEG 로 변환한다.
 * png 의 투명 영역은 흰색으로 채운다.
 */
export async function resizeImage(file: File, maxSize = PHOTO_MAX_DIMENSION, quality = 0.85): Promise<Blob> {
  const source = await loadImage(file);
  const scale = Math.min(1, maxSize / Math.max(source.width, source.height));
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이미지를 처리할 수 없습니다.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, width, height);
  if ('close' in source && typeof source.close === 'function') source.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('이미지 변환에 실패했습니다.'))), 'image/jpeg', quality),
  );
}
