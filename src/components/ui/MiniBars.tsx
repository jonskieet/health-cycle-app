const dayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const CHART_HEIGHT = 40;

// G2 (VISUAL_POLISH_ROADMAP.md): biểu đồ mini gần như không đọc được — 2
// nguyên nhân: (1) 6/7 cột "quá khứ" chỉ có opacity 0.35 trên nền card cũng
// nhạt màu, độ tương phản quá thấp để nhận ra là biểu đồ chứ không phải hoạ
// tiết trang trí; (2) không có "vạch nền" tham chiếu — 1 giá trị gần 0 chỉ
// còn lại 1 chấm nhỏ 4px, dễ hiểu nhầm là ô trống/thiếu dữ liệu thay vì "giá
// trị thấp". Sửa: tăng opacity cột quá khứ lên mức đọc được rõ hơn (vẫn thấp
// hơn cột "hôm nay" để giữ đúng phân cấp thị giác — hôm nay vẫn nổi bật nhất),
// và thêm 1 track nền mờ cao hết khung cho mỗi cột để mắt luôn có 1 "trần"
// tham chiếu, phân biệt được "thấp" và "không có dữ liệu".
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
      {data.map((v, i) => {
        const isToday = i === data.length - 1;
        return (
          <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className="relative w-full max-w-[6px] rounded-full"
              style={{ height: CHART_HEIGHT }}
            >
              {/* Track tham chiếu — luôn cao hết khung, rất mờ, để mắt có 1
                  "trần" cố định khi so sánh độ cao giữa các cột. */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ background: color, opacity: 0.12 }}
              />
              <div
                className="absolute bottom-0 w-full rounded-full transition-all"
                style={{
                  height: `${Math.max((v / max) * CHART_HEIGHT, 4)}px`,
                  background: color,
                  opacity: isToday ? 1 : 0.55,
                }}
              />
            </div>
            <span className="text-[9px] text-[var(--ink-faint)]">
              {dayLabels[i][0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
