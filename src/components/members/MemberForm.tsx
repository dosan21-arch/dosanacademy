import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import type { MemberFormValues } from '../../types/member';
import { PhotoValidationError, validatePhoto } from '../../utils/image';
import { formatPhone, validateMemberForm, type FormErrors } from '../../utils/validation';
import Button from '../common/Button';
import { Field, TextArea, TextInput } from '../common/FormField';
import Avatar from './Avatar';

/** 사진 변경 의도: 그대로 / 새 사진 / 사진 삭제 */
export type PhotoChange = { kind: 'keep' } | { kind: 'new'; file: File } | { kind: 'remove' };

interface Props {
  initialValues: MemberFormValues;
  initialPhotoUrl: string | null;
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: MemberFormValues, photo: PhotoChange) => void;
  onCancel: () => void;
}

export default function MemberForm({ initialValues, initialPhotoUrl, submitLabel, saving, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photo, setPhoto] = useState<PhotoChange>({ kind: 'keep' });
  const [photoError, setPhotoError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 새로 고른 사진 미리보기 URL 정리
  useEffect(() => {
    if (photo.kind !== 'new') {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(photo.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const shownPhoto = photo.kind === 'new' ? previewUrl : photo.kind === 'remove' ? null : initialPhotoUrl;

  const set = (key: keyof MemberFormValues) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const onPickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 같은 파일을 다시 골라도 동작하도록
    if (!file) return;
    try {
      validatePhoto(file);
      setPhoto({ kind: 'new', file });
      setPhotoError('');
    } catch (err) {
      setPhotoError(err instanceof PhotoValidationError ? err.message : '사진을 불러올 수 없습니다.');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateMemberForm(values);
    setErrors(found);
    const firstKey = Object.keys(found)[0];
    if (firstKey) {
      document.getElementById(`member-${firstKey}`)?.focus();
      return;
    }
    onSubmit(values, photo);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* 사진 */}
      <div className="flex flex-col items-center gap-3">
        <Avatar name={values.name || '?'} photoUrl={shownPhoto} size="lg" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={onPickPhoto}
          className="sr-only"
          id="member-photo"
          aria-describedby="member-photo-hint"
        />
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={saving}>
            {shownPhoto ? '사진 바꾸기' : '사진 올리기'}
          </Button>
          {shownPhoto && (
            <Button
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={() => setPhoto(initialPhotoUrl ? { kind: 'remove' } : { kind: 'keep' })}
            >
              사진 빼기
            </Button>
          )}
        </div>
        {photoError ? (
          <p className="font-semibold text-danger">{photoError}</p>
        ) : (
          <p id="member-photo-hint" className="text-[15px] text-ink-muted">
            jpg·png, 5MB 이하 (자동으로 줄여서 올립니다)
          </p>
        )}
      </div>

      <Field id="member-name" label="이름" required error={errors.name}>
        <TextInput id="member-name" value={values.name} onChange={set('name')} autoComplete="off" error={errors.name} />
      </Field>

      <Field id="member-cohort" label="기수" required error={errors.cohort} hint="숫자만 입력 (예: 1)">
        <TextInput
          id="member-cohort"
          inputMode="numeric"
          value={values.cohort}
          onChange={set('cohort')}
          autoComplete="off"
          error={errors.cohort}
        />
      </Field>

      <Field id="member-position" label="직책" error={errors.position}>
        <TextInput id="member-position" value={values.position} onChange={set('position')} error={errors.position} />
      </Field>

      <Field id="member-organization" label="소속" error={errors.organization}>
        <TextInput
          id="member-organization"
          value={values.organization}
          onChange={set('organization')}
          error={errors.organization}
        />
      </Field>

      <div className="rounded-card bg-fill p-4 text-[15px] text-ink-muted">
        아래 전화번호·이메일·메모는 로그인한 사용자에게만 보입니다.
      </div>

      <Field id="member-phone" label="전화번호" error={errors.phone}>
        <TextInput
          id="member-phone"
          type="tel"
          inputMode="tel"
          value={values.phone}
          onChange={set('phone')}
          onBlur={() => values.phone && setValues((v) => ({ ...v, phone: formatPhone(v.phone) }))}
          placeholder="010-1234-5678"
          error={errors.phone}
        />
      </Field>

      <Field id="member-email" label="이메일" error={errors.email}>
        <TextInput
          id="member-email"
          type="email"
          inputMode="email"
          autoCapitalize="off"
          value={values.email}
          onChange={set('email')}
          placeholder="name@example.com"
          error={errors.email}
        />
      </Field>

      <Field id="member-memo" label="메모" error={errors.memo}>
        <TextArea id="member-memo" value={values.memo} onChange={set('memo')} error={errors.memo} />
      </Field>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          취소
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? '저장 중…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
