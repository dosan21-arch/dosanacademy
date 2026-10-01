import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';

export default function NotFoundPage() {
  return (
    <EmptyState title="페이지를 찾을 수 없습니다." icon="🧭">
      <Link
        to="/"
        className="mt-4 inline-flex min-h-12 items-center rounded-control bg-brand-500 px-6 font-bold text-white"
      >
        원우 명단으로 돌아가기
      </Link>
    </EmptyState>
  );
}
