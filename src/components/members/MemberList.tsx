import type { Member } from '../../types/member';
import { groupByCohort, type ViewMode } from '../../utils/search';
import MemberCard from './MemberCard';

function Grid({ members }: { members: Member[] }) {
  return (
    <ul className="grid gap-2.5 md:grid-cols-2">
      {members.map((m) => (
        <li key={m.id}>
          <MemberCard member={m} />
        </li>
      ))}
    </ul>
  );
}

/** members 는 이미 가나다순 정렬된 상태로 전달된다. */
export default function MemberList({ members, view }: { members: Member[]; view: ViewMode }) {
  if (view === 'name') return <Grid members={members} />;

  return (
    <div className="space-y-8">
      {groupByCohort(members).map((group) => (
        <section key={group.cohort} aria-labelledby={`cohort-${group.cohort}`}>
          <h2
            id={`cohort-${group.cohort}`}
            className="mb-2.5 px-1 text-[20px] font-bold text-ink"
          >
            {group.cohort}기 <span className="text-base font-medium text-ink-muted">{group.members.length}명</span>
          </h2>
          <Grid members={group.members} />
        </section>
      ))}
    </div>
  );
}
