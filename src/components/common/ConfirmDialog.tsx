import type { ReactNode } from 'react';
import Button from './Button';
import Modal from './Modal';

interface Props {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** 되돌릴 수 없는 동작 확인 시트. 아래 단추 한 줄: 왼쪽 "취소" + 오른쪽 주 버튼 (가이드 4-3, 4-4) */
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = '확인',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal open={open} title={title} onClose={busy ? () => {} : onCancel}>
      <div className="text-ink-soft">{children}</div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          취소
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={busy}>
          {busy ? '처리 중…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
