# Mon Français

Website tự học tiếng Pháp và luyện DELF B1, chạy hoàn toàn trên trình duyệt.

## Đăng lên GitHub Pages

1. Tạo repository công khai mới trên GitHub, ví dụ `mon-francais`.
2. Chọn **Add file → Upload files**.
3. Giải nén gói mã và tải **toàn bộ các tệp** `.html`, `.css`, `.js` cùng `README.md` vào thư mục gốc của repository.
4. Chọn **Commit changes**.
5. Mở **Settings → Pages**.
6. Trong **Build and deployment**, chọn **Deploy from a branch**.
7. Chọn nhánh `main`, thư mục `/ (root)`, sau đó chọn **Save**.
8. Chờ vài phút. Website sẽ có dạng `https://TEN-TAI-KHOAN.github.io/mon-francais/`.

## Chức năng

- Đồng hồ nổi hình tròn ở góc dưới bên phải; bấm vào để mở hai chế độ đếm thời gian học và đếm ngược.
- Phát âm tiếng Pháp bằng Web Speech API.
- Chọn ngày và tải từ vựng từ trang `T6` của Google Sheets: từ ở cột B, nghĩa ở D, ví dụ ở E và ngày ở J.
- Danh sách ngày chỉ hiển thị những ngày thực sự có dữ liệu trong cột J.
- Ôn Flashcard tối đa 20 từ mỗi lượt và tự đánh giá theo 5 mức độ thuộc.
- Xem toàn bộ kho từ vựng T6 theo thứ tự A–Z.
- Nhiệm vụ và tiến độ bốn kỹ năng.
- Lưu dữ liệu bằng `localStorage`.
- Trang Ngữ pháp: thêm, sửa, xóa chủ điểm; lý thuyết, ví dụ, bài tập, đáp án và liên kết tài liệu.
- Trang Đọc: thêm bài đọc, mở từng bài, tự tải toàn bộ T6; tô màu khi từ hoặc một thành phần của cụm từ khớp với bài đọc và mở thẻ nghĩa/phát âm.
- Trang Nghe: thêm test, audio trực tuyến, transcription, từ vựng, cấu trúc, câu hỏi, điểm số và ghi chú.
- Trang Nói: lưu đề, dàn ý, từ vựng, câu hỏi giám khảo và ghi âm trong phiên sử dụng.
- Trang Viết: lưu đề, dàn ý, bài viết, bản sửa lỗi, nhận xét và điểm số.
- Dữ liệu tự nhập được lưu riêng trong trình duyệt. Trang Ngữ pháp hỗ trợ xuất/nhập JSON.
- `errors.html`: Sổ lỗi cá nhân, lịch ôn, bộ lọc và trạng thái đã tự sửa được.
- `scores.html`: bảng điểm CO–CE–PE–PO trên 25, tổng điểm, cảnh báo và mức độ sẵn sàng.
- `mock-exam.html`: tạo lượt thi thử, đồng hồ, bốn phần thi, lưu/nộp bài và nhập điểm.
- `planner.html`: tạo kế hoạch tuần dựa trên kỹ năng yếu, số phút và ngày có thể học.
- `settings.html`: xuất/nhập toàn bộ dữ liệu JSON, đặt lại hai bước, cấu hình đồng bộ và prompt AI.
- Kho dữ liệu `storage.js` phiên bản 4 tự nhập dữ liệu từ các khóa `localStorage` cũ và giữ bản dự phòng khi khôi phục/đặt lại.

## Điều kiện đọc Google Sheets

Trong Google Sheets, chọn **Chia sẻ → Quyền truy cập chung → Bất kỳ ai có liên kết → Người xem**. Website tĩnh trên GitHub Pages chỉ có thể đọc bảng tính khi bảng được cấp quyền xem công khai qua liên kết.

Không cần cài đặt thư viện hoặc chạy lệnh. Mở `index.html` để chạy thử trên máy tính.

Lưu ý: tệp audio chọn trực tiếp từ máy tính không thể được lưu bền vững bằng `localStorage`. Hãy dùng đường dẫn audio công khai hoặc tải audio vào repository rồi nhập đường dẫn tương đối.

Đồng bộ và AI cần dịch vụ bên ngoài được người dùng tự cấu hình. Khi chưa cấu hình, website luôn ghi rõ “Chỉ lưu trên thiết bị này” và cung cấp prompt AI để sao chép, không nhúng khóa bí mật trong GitHub Pages.
