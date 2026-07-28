const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// E1 (bug thị giác — xem ảnh chụp thật của chủ dự án): bản cũ dùng bề rộng cột
// CỐ ĐỊNH bằng px (7 cột x 6px + 6 khoảng cách x 6px = 78px tối thiểu, không
// co giãn được) — ở layout lưới 2 cột trên điện thoại, phần còn lại của card
// (sau icon/nhãn/giá trị) hẹp hơn 78px nên các cột tràn hẳn ra ngoài card,
// đè lên nền phía sau. Sửa bằng cách bỏ hoàn toàn bề rộng cố định: dùng
// `w-full` + `flex-1` cho mỗi cột để tổng bề rộng LUÔN khớp đúng bằng
// container cha, bất kể card hẹp cỡ nào — không cần biết trước độ rộng khả
// dụng, tự co giãn đúng.
export default function MiniBars({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex w-full items-end gap-1">
      {data.map((v, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div
            className="w-full max-w-[6px] rounded-full transition-all"
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
