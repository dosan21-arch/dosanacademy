import { Link, useLocation } from 'react-router-dom';
import type { Member } from '../../types/member';
import Avatar from './Avatar';

export default function MemberCard({ member }: { member: Member }) {
  const location = useLocation();
  const subtitle = [`${member.cohort}기`, member.position].filter(Boolean).join(' · ');

  return (
    <Link
      to={`/members/${member.id}`}
      state={{ from: location.pathname + location.search }}
      className="flex min-h-[88px] items-center gap-4 rounded-card bg-surface p-4 hairline transition active:bg-fill"
    >
      <Avatar name={member.name} photoUrl={member.photoUrl} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[18px] font-bold text-ink">{member.name}</p>
        <p className="truncate text-ink-soft">{subtitle}</p>
        {member.organization && <p className="truncate text-ink-muted">{member.organization}</p>}
      </div>
      <span aria-hidden="true" className="text-2xl text-ink-faint">
        ›
      </span>
    </Link>
  );
}
