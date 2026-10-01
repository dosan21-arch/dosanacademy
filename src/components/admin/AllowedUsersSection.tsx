import { useEffect, useState, type FormEvent } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
  addAllowedUser,
  normalizeEmail,
  removeAllowedUser,
  subscribeAllowedUsers,
  updateAllowedUserRole,
} from '../../services/allowedUsers';
import type { AllowedUser, Role } from '../../types/user';
import { isValidEmail } from '../../utils/validation';
import Button from '../common/Button';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import { Field, TextInput } from '../common/FormField';
import Spinner from '../common/Spinner';

const ROLE_LABEL: Record<Role, string> = { editor: '편집자', admin: '관리자' };

export default function AllowedUsersSection({ myEmail }: { myEmail: string }) {
  const toast = useToast();
  const [users, setUsers] = useState<AllowedUser[] | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('editor');
  const [emailError, setEmailError] = useState('');
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState<AllowedUser | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);

  useEffect(
    () =>
      subscribeAllowedUsers(setUsers, () => {
        setUsers([]);
        toast.error('허용 목록을 불러오지 못했습니다.');
      }),
    [toast],
  );

  const onAdd = async (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      setEmailError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (users?.some((u) => u.email === normalized)) {
      setEmailError('이미 등록된 이메일입니다. 아래 목록에서 역할을 바꿀 수 있습니다.');
      return;
    }
    setSaving(true);
    try {
      await addAllowedUser(normalized, role, myEmail);
      toast.success(`${normalized} 을(를) ${ROLE_LABEL[role]}(으)로 등록했습니다.`);
      setEmail('');
      setRole('editor');
      setEmailError('');
    } catch {
      toast.error('등록에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const onChangeRole = async (u: AllowedUser, next: Role) => {
    try {
      await updateAllowedUserRole(u.email, next);
      toast.success(`${u.email} 의 역할을 ${ROLE_LABEL[next]}(으)로 변경했습니다.`);
    } catch {
      toast.error('역할 변경에 실패했습니다.');
    }
  };

  const onConfirmRemove = async () => {
    if (!removing) return;
    setRemoveBusy(true);
    try {
      await removeAllowedUser(removing.email);
      toast.success(`${removing.email} 의 권한을 삭제했습니다.`);
      setRemoving(null);
    } catch {
      toast.error('삭제에 실패했습니다.');
    } finally {
      setRemoveBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <p className="px-1 text-ink-muted">
        여기에 등록된 Google 계정만 원우 정보를 추가·수정할 수 있습니다. 원우 삭제와 권한 관리는 관리자만 가능합니다.
      </p>

      <form onSubmit={onAdd} noValidate className="space-y-4 rounded-card bg-surface p-5 hairline">
        <h2 className="text-[18px] font-bold">새 사용자 등록</h2>
        <Field id="new-email" label="Google 계정 이메일" error={emailError}>
          <TextInput
            id="new-email"
            type="email"
            inputMode="email"
            autoCapitalize="off"
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            placeholder="example@gmail.com"
            error={emailError}
          />
        </Field>
        <fieldset>
          <legend className="mb-1.5 font-bold">역할</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['editor', 'admin'] as Role[]).map((r) => (
              <label
                key={r}
                className={`flex min-h-12 cursor-pointer items-center justify-center rounded-control px-4 font-bold transition ${
                  role === r ? 'bg-brand-500 text-white' : 'bg-field text-ink-muted hairline'
                }`}
              >
                <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} className="sr-only" />
                {ROLE_LABEL[r]}
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-[15px] text-ink-muted">편집자: 추가·수정 / 관리자: 추가·수정·삭제·권한 관리</p>
        </fieldset>
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? '등록 중…' : '등록하기'}
        </Button>
      </form>

      <section>
        <h2 className="mb-2.5 px-1 text-[18px] font-bold">
          등록된 사용자 {users && <span className="font-medium text-ink-muted">{users.length}명</span>}
        </h2>
        {users === null ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState title="등록된 사용자가 없습니다." icon="🔑" />
        ) : (
          <ul className="space-y-2">
            {users.map((u) => {
              const isMe = u.email === myEmail;
              return (
                <li key={u.email} className="flex flex-col gap-3 rounded-card bg-surface p-4 hairline sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-bold">
                      {u.email} {isMe && <span className="text-[15px] font-semibold text-brand-ink">(나)</span>}
                    </p>
                    {u.addedBy && <p className="text-[15px] text-ink-faint">등록: {u.addedBy}</p>}
                  </div>
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor={`role-${u.email}`}>
                      {u.email} 역할
                    </label>
                    <select
                      id={`role-${u.email}`}
                      value={u.role}
                      disabled={isMe}
                      onChange={(e) => void onChangeRole(u, e.target.value as Role)}
                      className="h-12 flex-1 rounded-control bg-field px-3 font-bold text-ink hairline disabled:opacity-50 sm:flex-none"
                    >
                      <option value="editor">편집자</option>
                      <option value="admin">관리자</option>
                    </select>
                    <Button variant="secondary" disabled={isMe} onClick={() => setRemoving(u)}>
                      삭제
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 px-1 text-[15px] text-ink-faint">본인 계정은 실수 방지를 위해 역할 변경·삭제가 불가합니다.</p>
      </section>

      <ConfirmDialog
        open={!!removing}
        title="권한을 삭제할까요?"
        confirmLabel="삭제"
        danger
        busy={removeBusy}
        onConfirm={() => void onConfirmRemove()}
        onCancel={() => setRemoving(null)}
      >
        <b className="break-all">{removing?.email}</b> 계정은 더 이상 원우 정보를 추가·수정할 수 없게 됩니다.
      </ConfirmDialog>
    </div>
  );
}
