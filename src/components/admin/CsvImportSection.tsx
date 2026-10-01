import { useRef, useState, type ChangeEvent } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { bulkCreateMembers } from '../../services/memberWrites';
import { fetchAllMembers } from '../../services/members';
import { CSV_COLUMNS, csvTemplateBlob, parseMemberCsv, readCsvFile, type ParsedMemberRow } from '../../utils/csv';
import Button from '../common/Button';

interface Preview {
  fileName: string;
  valid: ParsedMemberRow[];
  duplicates: ParsedMemberRow[];
  invalid: ParsedMemberRow[];
}

const keyOf = (name: string, cohort: number) => `${name.replace(/\s/g, '')}|${cohort}`;

export default function CsvImportSection({ myEmail }: { myEmail: string }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [reading, setReading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const downloadTemplate = () => {
    const url = URL.createObjectURL(csvTemplateBlob());
    const a = document.createElement('a');
    a.href = url;
    a.download = '원우명단_양식.csv';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setReading(true);
    setPreview(null);
    try {
      const { rows, fileError } = parseMemberCsv(await readCsvFile(file));
      if (fileError) {
        toast.error(fileError);
        return;
      }
      // 이미 등록된 원우(이름+기수 동일)와 파일 안의 중복은 건너뛴다
      const existing = new Set((await fetchAllMembers()).map((m) => keyOf(m.name, m.cohort)));
      const next: Preview = { fileName: file.name, valid: [], duplicates: [], invalid: [] };
      for (const row of rows) {
        if (row.errors.length) {
          next.invalid.push(row);
          continue;
        }
        const key = keyOf(row.member.name, row.member.cohort);
        if (existing.has(key)) next.duplicates.push(row);
        else {
          existing.add(key);
          next.valid.push(row);
        }
      }
      setPreview(next);
    } catch {
      toast.error('파일을 읽지 못했습니다. CSV 파일인지 확인해 주세요.');
    } finally {
      setReading(false);
    }
  };

  const onImport = async () => {
    if (!preview?.valid.length) return;
    setProgress({ done: 0, total: preview.valid.length });
    try {
      await bulkCreateMembers(
        preview.valid.map((r) => ({ member: r.member, contact: r.contact })),
        myEmail,
        (done, total) => setProgress({ done, total }),
      );
      toast.success(`${preview.valid.length}명을 등록했습니다.`);
      setPreview(null);
    } catch {
      toast.error('등록 중 오류가 발생했습니다. 일부만 등록되었을 수 있으니 명단을 확인해 주세요.');
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-card bg-surface p-5 hairline">
        <h2 className="text-[18px] font-bold">엑셀(CSV)로 한꺼번에 등록</h2>
        <ol className="list-decimal space-y-1 pl-5 text-ink-soft">
          <li>아래 「양식 내려받기」로 받은 파일을 엑셀로 엽니다.</li>
          <li>
            한 줄에 한 명씩 입력합니다. 열 순서: <b>{CSV_COLUMNS.join(', ')}</b> (이름·기수는 필수)
          </li>
          <li>
            「다른 이름으로 저장」 → 파일 형식 <b>CSV</b> 로 저장한 뒤 「파일 선택」으로 올립니다.
          </li>
        </ol>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="secondary" onClick={downloadTemplate}>
            양식 내려받기
          </Button>
          <Button onClick={() => inputRef.current?.click()} disabled={reading || !!progress}>
            {reading ? '읽는 중…' : '파일 선택'}
          </Button>
        </div>
        <input ref={inputRef} type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => void onPick(e)} />
      </div>

      {preview && (
        <div className="space-y-3 rounded-card bg-surface p-5 hairline">
          <p className="break-all font-bold">{preview.fileName}</p>
          <ul className="grid grid-cols-3 gap-2 text-center">
            <li className="rounded-control bg-brand-50 p-3">
              <p className="text-[22px] font-bold text-brand-ink">{preview.valid.length}</p>
              <p className="text-[15px] text-ink-muted">등록 예정</p>
            </li>
            <li className="rounded-control bg-fill p-3">
              <p className="text-[22px] font-bold">{preview.duplicates.length}</p>
              <p className="text-[15px] text-ink-muted">중복 제외</p>
            </li>
            <li className="rounded-control bg-fill p-3">
              <p className={`text-[22px] font-bold ${preview.invalid.length ? 'text-danger' : ''}`}>{preview.invalid.length}</p>
              <p className="text-[15px] text-ink-muted">오류</p>
            </li>
          </ul>

          {preview.invalid.length > 0 && (
            <details open className="rounded-control bg-fill p-3">
              <summary className="cursor-pointer font-bold">오류가 있는 줄 (등록되지 않음)</summary>
              <ul className="mt-2 space-y-1 text-[15px]">
                {preview.invalid.map((r) => (
                  <li key={r.line}>
                    {r.line}번째 줄 {r.member.name && `(${r.member.name})`}: <span className="text-danger">{r.errors.join(', ')}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
          {preview.duplicates.length > 0 && (
            <details className="rounded-control bg-fill p-3">
              <summary className="cursor-pointer font-bold">이미 등록된 원우 (건너뜀)</summary>
              <p className="mt-2 text-[15px] text-ink-muted">
                {preview.duplicates.map((r) => `${r.member.name}(${r.member.cohort}기)`).join(', ')}
              </p>
            </details>
          )}
          {preview.valid.length > 0 && (
            <details className="rounded-control bg-fill p-3">
              <summary className="cursor-pointer font-bold">등록될 원우 미리보기</summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left text-[15px]">
                  <thead className="text-ink-muted">
                    <tr>
                      <th className="py-1 pr-3">이름</th>
                      <th className="py-1 pr-3">기수</th>
                      <th className="py-1 pr-3">직책</th>
                      <th className="py-1 pr-3">소속</th>
                      <th className="py-1">전화번호</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.valid.map((r) => (
                      <tr key={r.line} className="border-t border-line">
                        <td className="py-1 pr-3 font-semibold">{r.member.name}</td>
                        <td className="py-1 pr-3">{r.member.cohort}기</td>
                        <td className="py-1 pr-3">{r.member.position}</td>
                        <td className="py-1 pr-3">{r.member.organization}</td>
                        <td className="py-1">{r.contact.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setPreview(null)} disabled={!!progress}>
              취소
            </Button>
            <Button onClick={() => void onImport()} disabled={!preview.valid.length || !!progress}>
              {progress ? `등록 중… ${progress.done}/${progress.total}` : `${preview.valid.length}명 등록하기`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
