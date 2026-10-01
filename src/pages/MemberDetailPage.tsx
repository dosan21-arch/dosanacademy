import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../components/common/Button';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/members/Avatar';
import ContactSection from '../components/members/ContactSection';
import { useAuth } from '../contexts/AuthContext';
import { useMembers } from '../contexts/MembersContext';
import { useToast } from '../contexts/ToastContext';
import { deleteMember } from '../services/memberWrites';
import type { Member } from '../types/member';

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-3 py-3.5">
      <dt className="font-semibold text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{children || <span className="text-ink-faint">미등록</span>}</dd>
    </div>
  );
}

function formatDate(ts: Member['updatedAt']): string {
  if (!ts) return '';
  const d = ts.toDate();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { members, loading } = useMembers();
  const { user, isAdmin, canViewContact, signIn, requireEditor } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = (location.state as { from?: string } | null)?.from ?? '/';
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const member = members.find((m) => m.id === id);

  const backButton = (
    <button
      type="button"
      onClick={() => navigate(backTo)}
      className="mb-2 inline-flex min-h-12 items-center gap-1 rounded-control px-2 text-[17px] font-bold text-brand-ink hover:bg-brand-50"
    >
      ‹ 목록으로
    </button>
  );

  if (loading) return <Spinner />;
  if (!member) {
    // 삭제 직후에는 목록으로 이동하므로 이 화면이 잠깐 보이지 않게 한다
    if (deleting) return <Spinner />;
    return (
      <div>
        {backButton}
        <EmptyState title="원우 정보를 찾을 수 없습니다.">삭제되었거나 잘못된 주소입니다.</EmptyState>
      </div>
    );
  }

  const onEdit = () => void requireEditor(() => navigate(`/members/${member.id}/edit`));

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteMember(member.id, member.photoUrl);
      toast.success(`${member.name} 원우를 삭제했습니다.`);
      navigate('/', { replace: true });
    } catch {
      toast.error('삭제에 실패했습니다. 관리자 권한을 확인해 주세요.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const lastUpdated = formatDate(member.updatedAt);

  return (
    <div className="mx-auto max-w-xl">
      {backButton}
      <article className="overflow-hidden rounded-card bg-surface hairline">
        <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-8 text-center">
          <Avatar name={member.name} photoUrl={member.photoUrl} size="lg" />
          <h1 className="mt-2 text-[24px] font-bold">{member.name}</h1>
          <p className="rounded-full bg-brand-50 px-4 py-1 font-bold text-brand-ink">{member.cohort}기</p>
        </div>

        <div className="space-y-6 px-5 pb-6">
          <dl className="divide-y divide-line border-y border-line">
            <InfoRow label="직책">{member.position}</InfoRow>
            <InfoRow label="소속">{member.organization}</InfoRow>
          </dl>

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="mb-1 text-[18px] font-bold">
              연락처
            </h2>
            <ContactSection
              memberId={member.id}
              canView={canViewContact}
              onRequestLogin={user ? undefined : () => void signIn()}
            />
          </section>

          {user && lastUpdated && (
            <p className="text-[15px] text-ink-faint">
              최종 수정 {lastUpdated}
              {member.updatedBy && ` · ${member.updatedBy}`}
            </p>
          )}
        </div>
      </article>

      <div className={`mt-4 grid gap-2 ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <Button variant="secondary" onClick={onEdit}>
          정보 수정
        </Button>
        {isAdmin && (
          <Button variant="secondary" className="text-danger!" onClick={() => setConfirmDelete(true)}>
            삭제
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="원우를 삭제할까요?"
        confirmLabel="삭제"
        danger
        busy={deleting}
        onConfirm={() => void onDelete()}
        onCancel={() => setConfirmDelete(false)}
      >
        <b>{member.name}</b>({member.cohort}기) 원우의 정보와 연락처·사진이 모두 삭제되며 되돌릴 수 없습니다.
      </ConfirmDialog>
    </div>
  );
}
