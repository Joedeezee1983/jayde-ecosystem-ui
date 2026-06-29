'use client';

export interface TxPreview {
  contractAddress: `0x${string}`;
  functionName: string;
  amountJayde?: string;
  description: string;
}

interface Props {
  preview: TxPreview;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TxConfirmModal({ preview, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#1e293b] p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white">Confirm Transaction</h3>

        <dl className="space-y-2.5 text-sm">
          <Row
            label="Contract"
            value={`${preview.contractAddress.slice(0, 10)}…${preview.contractAddress.slice(-8)}`}
            mono
          />
          <Row label="Action" value={preview.functionName} />
          {preview.amountJayde && (
            <>
              <Row label="Amount" value={`${preview.amountJayde} JAYDE`} />
              <Row label="Est. USD" value="— (no price feed)" dim />
            </>
          )}
          <Row label="Details" value={preview.description} />
        </dl>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-600 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-[#0d9488] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f766e]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  dim,
}: {
  label: string;
  value: string;
  mono?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd
        className={[
          'break-all text-right',
          mono ? 'font-mono text-xs' : '',
          dim ? 'text-slate-500' : 'text-slate-200',
        ].join(' ')}
      >
        {value}
      </dd>
    </div>
  );
}
