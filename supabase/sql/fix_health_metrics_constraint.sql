-- Fix: thêm unique constraint còn thiếu cho health_metrics
-- (cần thiết để upsert onConflict: "user_id,metric_type,recorded_date" hoạt động)

-- 1) Xoá constraint cũ (nếu có, đặt theo tên cột logged_at cũ) để tránh trùng lặp
alter table public.health_metrics
  drop constraint if exists health_metrics_user_type_date_key;

-- 2) Tạo lại unique constraint đúng theo cột thật hiện tại: recorded_date
do $$ begin
  alter table public.health_metrics
    add constraint health_metrics_user_type_date_key
    unique (user_id, metric_type, recorded_date);
exception
  when duplicate_object then null;
end $$;

-- 3) (tuỳ chọn nhưng nên có) index hỗ trợ truy vấn theo user + loại chỉ số + ngày
create index if not exists health_metrics_user_type_date_idx
  on public.health_metrics (user_id, metric_type, recorded_date desc);

-- 4) Đảm bảo cột recorded_date NOT NULL có default = ngày hiện tại,
--    để tránh lỗi "null value in column recorded_date" như trước đây
alter table public.health_metrics
  alter column recorded_date set default current_date;
