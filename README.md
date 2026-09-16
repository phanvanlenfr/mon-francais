# Mon Français

Website tự học tiếng Pháp và luyện DELF B1, chạy hoàn toàn trên trình duyệt.

## Đăng lên GitHub Pages

1. Tạo repository công khai mới trên GitHub, ví dụ `mon-francais`.
2. Chọn **Add file → Upload files**.
3. Tải trực tiếp các tệp `index.html`, `style.css`, `script.js` và `README.md` vào thư mục gốc của repository.
4. Chọn **Commit changes**.
5. Mở **Settings → Pages**.
6. Trong **Build and deployment**, chọn **Deploy from a branch**.
7. Chọn nhánh `main`, thư mục `/ (root)`, sau đó chọn **Save**.
8. Chờ vài phút. Website sẽ có dạng `https://TEN-TAI-KHOAN.github.io/mon-francais/`.

## Chức năng

- Hai chế độ đồng hồ: đếm thời gian học và đếm ngược theo số phút tự chọn.
- Phát âm tiếng Pháp bằng Web Speech API.
- Chọn ngày và tải từ vựng từ Google Sheets: từ ở cột B, nghĩa ở D, ví dụ ở E và ngày ở J.
- Đánh dấu từ đã thuộc.
- Tiến độ ngữ pháp và bốn kỹ năng khởi tạo từ 0.
- Bài tập Subjonctif mẫu.
- Nhiệm vụ và tiến độ bốn kỹ năng.
- Lưu dữ liệu bằng `localStorage`.

## Điều kiện đọc Google Sheets

Trong Google Sheets, chọn **Chia sẻ → Quyền truy cập chung → Bất kỳ ai có liên kết → Người xem**. Website tĩnh trên GitHub Pages chỉ có thể đọc bảng tính khi bảng được cấp quyền xem công khai qua liên kết.

Không cần cài đặt thư viện hoặc chạy lệnh. Mở `index.html` để chạy thử trên máy tính.
