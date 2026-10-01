import { useEffect, useState, type ReactNode } from 'react';
import { getContact } from '../../services/contacts';
import type { MemberContact } from '../../types/member';
import Button from '../common/Button';

interface Props {
  memberId: string;
  /** 현재 사용자가 연락처를 볼 수 있는지 (CONTACT_VISIBILITY 정책 기준) */
  canView: boolean;
  /** 비로그인 상태일 때만 전달 (로그인 버튼 표시) */
  onRequestLogin?: () => void;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-3 py-3.5">
      <dt className="font-semibold text-ink-muted">{label}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

export default function ContactSection({ memberId, canView, onRequestLogin }: Props) {
  const [contact, setContact] = useState<MemberContact | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!canView) return;
    let cancelled = false;
    setContact(null);
    setFailed(false);
    getContact(memberId)
      .then((c) => !cancelled && setContact(c))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [memberId, canView]);

  if (!canView) {
    return (
      <div className="rounded-card bg-fill p-5 text-center">
        <p className="text-ink-muted">
          {onRequestLogin
            ? '전화번호·이메일·메모는 로그인 후 확인 가능합니다.'
            : '연락처 열람 권한이 없습니다. 사무처에 문의해 주세요.'}
        </p>
        {onRequestLogin && (
          <Button className="mt-3" onClick={onRequestLogin}>
            로그인하고 보기
          </Button>
        )}
      </div>
    );
  }

  if (failed) return <p className="py-3 font-semibold text-danger">연락처를 불러오지 못했습니다.</p>;
  if (!contact) return <p className="py-3 text-ink-muted">연락처를 불러오는 중…</p>;

  const empty = <span className="text-ink-faint">미등록</span>;
  return (
    <dl className="divide-y divide-line">
      <Row label="전화">
        {contact.phone ? (
          <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="font-bold text-brand-ink underline underline-offset-4">
            {contact.phone}
          </a>
        ) : (
          empty
        )}
      </Row>
      <Row label="이메일">
        {contact.email ? (
          <a href={`mailto:${contact.email}`} className="font-bold text-brand-ink underline underline-offset-4">
            {contact.email}
          </a>
        ) : (
          empty
        )}
      </Row>
      <Row label="메모">{contact.memo ? <p className="whitespace-pre-wrap">{contact.memo}</p> : empty}</Row>
    </dl>
  );
}
