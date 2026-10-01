import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { SAMPLE_ID_PREFIX, SAMPLE_MEMBERS } from '../../data/sampleMembers';
import { bulkCreateMembers, deleteMember } from '../../services/memberWrites';
import { fetchAllMembers } from '../../services/members';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';

/** 시험용 가상 원우 10명 넣기/지우기 */
export default function SampleDataSection({ myEmail }: { myEmail: string }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const onSeed = async () => {
    setBusy(true);
    try {
      const existingIds = new Set((await fetchAllMembers()).map((m) => m.id));
      const missing = SAMPLE_MEMBERS.filter((s) => !existingIds.has(s.id!));
      if (!missing.length) {
        toast.info('샘플 원우가 이미 모두 등록되어 있습니다.');
        return;
      }
      await bulkCreateMembers(missing, myEmail);
      toast.success(`샘플 원우 ${missing.length}명을 넣었습니다.`);
    } catch {
      toast.error('샘플 데이터를 넣지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    setBusy(true);
    try {
      const samples = (await fetchAllMembers()).filter((m) => m.id.startsWith(SAMPLE_ID_PREFIX));
      for (const m of samples) await deleteMember(m.id, m.photoUrl);
      toast.success(samples.length ? `샘플 원우 ${samples.length}명을 지웠습니다.` : '지울 샘플 원우가 없습니다.');
      setConfirmRemove(false);
    } catch {
      toast.error('샘플 데이터를 지우지 못했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-card bg-surface p-5 hairline">
      <h2 className="text-[18px] font-bold">시험용 샘플 데이터</h2>
      <p className="text-ink-muted">
        가상의 1기 원우 10명(김현우, 이서연 …)을 넣어 화면을 시험해 볼 수 있습니다. 실제 운영 전에는 지워 주세요.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={() => setConfirmRemove(true)} disabled={busy}>
          샘플 지우기
        </Button>
        <Button onClick={() => void onSeed()} disabled={busy}>
          {busy ? '처리 중…' : '샘플 10명 넣기'}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmRemove}
        title="샘플 원우를 지울까요?"
        confirmLabel="지우기"
        danger
        busy={busy}
        onConfirm={() => void onRemove()}
        onCancel={() => setConfirmRemove(false)}
      >
        「샘플 10명 넣기」로 넣은 원우만 지워집니다. 직접 등록한 원우는 그대로 남습니다.
      </ConfirmDialog>
    </div>
  );
}
