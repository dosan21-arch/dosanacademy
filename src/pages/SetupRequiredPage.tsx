/** .env 설정이 비어 있을 때 보여주는 안내 화면 (개발자용) */
export default function SetupRequiredPage() {
  return (
    <div className="mx-auto mt-16 max-w-xl px-4">
      <div className="rounded-card bg-surface p-6 hairline">
        <h1 className="text-[20px] font-bold">Firebase 설정이 필요합니다</h1>
        <p className="mt-3 text-ink-soft">
          프로젝트 폴더의 <code className="rounded bg-fill px-1">.env.example</code> 파일을 복사해{' '}
          <code className="rounded bg-fill px-1">.env.local</code> 로 저장하고, Firebase 콘솔의 웹 앱 설정값을 채운 뒤
          개발 서버를 다시 실행해 주세요.
        </p>
        <p className="mt-2 text-ink-muted">자세한 방법은 README.md 를 참고하세요.</p>
      </div>
    </div>
  );
}
