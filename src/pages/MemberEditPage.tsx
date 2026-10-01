import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import MemberForm, { type PhotoChange } from '../components/members/MemberForm';
import { NO_PERMISSION_MESSAGE, VISIBLE_COHORTS } from '../config/policy';
import { useAuth } from '../contexts/AuthContext';
import { useMembers } from '../contexts/MembersContext';
import { useToast } from '../contexts/ToastContext';
import { getContact } from '../services/contacts';
import { createMember, newMemberId, updateMember } from '../services/memberWrites';
import { deletePhotoByUrl, UploadTimeoutError, uploadMemberPhoto } from '../services/storage';
import type { MemberFormValues } from '../types/member';
import { resizeImage } from '../utils/image';
import { formatPhone, parseCohort } from '../utils/validation';

const EMPTY: MemberFormValues = {
  name: '',
  cohort: VISIBLE_COHORTS?.length === 1 ? String(VISIBLE_COHORTS[0]) : '',
  position: '',
  organization: '',
  phone: '',
  email: '',
  memo: '',
};

/** /members/new (추가) 와 /members/:id/edit (수정) 공용 화면 */
export default function MemberEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isEditor, loading: authLoading, requireEditor } = useAuth();
  const { members, loading: membersLoading } = useMembers();
  const member = id ? members.find((m) => m.id === id) : undefined;

  const [initial, setInitial] = useState<MemberFormValues | null>(isNew ? EMPTY : null);
  const [saving, setSaving] = useState(false);

  // 수정: 공개 정보 + 연락처를 불러와 폼 초기값 구성
  useEffect(() => {
    if (isNew || !member || !isEditor || initial) return;
    let cancelled = false;
    getContact(member.id)
      .catch(() => ({ phone: '', email: '', memo: '' }))
      .then((c) => {
        if (cancelled) return;
        setInitial({
          name: member.name,
          cohort: String(member.cohort),
          position: member.position,
          organization: member.organization,
          ...c,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [isNew, member, isEditor, initial]);

  const goBack = () => navigate(isNew ? '/' : `/members/${id}`, { replace: true });

  if (authLoading || (!isNew && membersLoading)) return <Spinner />;

  if (!user || !isEditor) {
    return (
      <EmptyState title={user ? NO_PERMISSION_MESSAGE : '로그인이 필요합니다.'} icon="🔒">
        {!user && (
          <Button className="mt-4" onClick={() => void requireEditor(() => {})}>
            로그인
          </Button>
        )}
      </EmptyState>
    );
  }

  if (!isNew && !member) return <EmptyState title="원우 정보를 찾을 수 없습니다." />;
  if (!initial) return <Spinner />;

  const onSubmit = async (values: MemberFormValues, photo: PhotoChange) => {
    // 규칙(firestore.rules)이 소문자 이메일과 비교하므로 맞춰서 기록
    const actor = (user.email ?? '').toLowerCase();
    const memberId = id ?? newMemberId();
    const oldPhotoUrl = member?.photoUrl ?? null;
    const input = {
      name: values.name.trim(),
      cohort: parseCohort(values.cohort)!,
      position: values.position.trim(),
      organization: values.organization.trim(),
    };
    const contact = {
      phone: values.phone.trim() ? formatPhone(values.phone) : '',
      email: values.email.trim().toLowerCase(),
      memo: values.memo.trim(),
    };

    setSaving(true);
    let uploadedUrl: string | null = null;
    try {
      let photoUrl = oldPhotoUrl;
      if (photo.kind === 'new') {
        uploadedUrl = await uploadMemberPhoto(memberId, await resizeImage(photo.file));
        photoUrl = uploadedUrl;
      } else if (photo.kind === 'remove') {
        photoUrl = null;
      }

      if (isNew) await createMember(memberId, input, contact, photoUrl, actor);
      else await updateMember(memberId, input, contact, photoUrl, actor);

      // 저장이 끝난 뒤에야 이전 사진을 지운다 (실패 시 기존 사진 보존)
      if (photo.kind !== 'keep' && oldPhotoUrl) void deletePhotoByUrl(oldPhotoUrl);

      toast.success(isNew ? `${input.name} 원우를 추가했습니다.` : '저장했습니다.');
      if (VISIBLE_COHORTS && !VISIBLE_COHORTS.includes(input.cohort)) {
        toast.info(`${input.cohort}기는 현재 명단에 표시되지 않는 기수입니다.`);
        navigate('/', { replace: true });
      } else {
        navigate(`/members/${memberId}`, { replace: true });
      }
    } catch (e) {
      // 문서 저장에 실패했다면 방금 올린 사진은 고아 파일이 되므로 정리
      if (uploadedUrl) void deletePhotoByUrl(uploadedUrl);
      toast.error(
        e instanceof UploadTimeoutError
          ? '사진 업로드 시간이 초과되었습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.'
          : '저장에 실패했습니다. 다시 시도해 주세요.',
      );
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 px-1 text-[22px] font-bold">{isNew ? '원우 추가' : '원우 정보 수정'}</h1>
      <div className="rounded-card bg-surface p-5 hairline">
        <MemberForm
          initialValues={initial}
          initialPhotoUrl={member?.photoUrl ?? null}
          submitLabel={isNew ? '추가하기' : '저장하기'}
          saving={saving}
          onSubmit={(v, p) => void onSubmit(v, p)}
          onCancel={goBack}
        />
      </div>
    </div>
  );
}
