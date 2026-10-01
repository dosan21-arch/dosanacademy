import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const DRAG_CLOSE_PX = 80;

/**
 * 아래에서 올라오는 시트 (가이드 4-3).
 * 휴대폰에서는 화면 아래에 살짝 떠 있는 판, 넓은 화면에서는 가운데 창으로 보인다.
 * 바깥 막을 누르거나, 손잡이를 아래로 끌거나, Esc 를 누르면 닫힌다.
 */
export default function Modal({ open, title, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  // onClose 가 렌더마다 새로 만들어져도 효과(포커스 이동)가 다시 실행되지 않도록 ref 로 보관
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDragY(0);
    const prevFocus = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prevFocus?.focus();
    };
  }, [open]);

  if (!open) return null;

  const onPointerDown = (e: PointerEvent) => {
    dragStartY.current = e.clientY;
    setDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent) => {
    if (dragStartY.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStartY.current));
  };
  const onPointerUp = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    setDragging(false);
    if (dragY > DRAG_CLOSE_PX) onCloseRef.current();
    else setDragY(0);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 px-3 sm:items-center sm:p-4"
      style={{
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
        animation: 'fade-in 150ms ease-out',
      }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-sheet bg-surface px-5 pb-5 focus:outline-none"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? 'none' : 'transform 150ms ease-out',
          animation: 'sheet-up 200ms ease-out',
        }}
      >
        {/* 손잡이 — 아래로 끌면 닫힘 */}
        <div
          className="flex cursor-grab touch-none justify-center pb-2 pt-3"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-hidden="true"
        >
          <div className="h-1.5 w-10 rounded-full bg-line" />
        </div>
        <h2 id="modal-title" className="text-[20px] font-bold">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
