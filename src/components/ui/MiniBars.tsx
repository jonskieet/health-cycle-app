const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export default function MiniBars({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className="w-1.5 rounded-full transition-all"
            style={{
              height: `${Math.max((v / max) * 36, 4)}px`,
              background: color,
              opacity: i === data.length - 1 ? 1 : 0.35,
            }}
          />
          <span className="text-[9px] text-[var(--ink-faint)]">
            {dayLabels[i][0]}
          </span>
        </div>
      ))}
    </div>
  );
}
