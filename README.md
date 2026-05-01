🕵️ HUSC Lost & Found - Hệ thống quản lý đồ thất lạc
Hệ thống hỗ trợ sinh viên trường Đại học Khoa học - Đại học Huế tìm kiếm và nhận lại đồ đạc bị thất lạc một cách nhanh chóng và minh bạch.

🚀 Tính năng chính
Đối với Sinh viên
Đăng tin thất lạc: Đăng tải thông tin, hình ảnh đồ vật bị mất hoặc nhặt được.

Quản lý bài đăng: Theo dõi trạng thái bài đăng (Chờ duyệt, Đã duyệt, Đã hoàn thành).

Hỏi đáp trực tiếp: Nhắn tin trực tiếp với Quản trị viên để xác minh và nhận lại đồ.

Thông báo Realtime: Nhận thông báo ngay lập tức khi bài đăng được duyệt hoặc có phản hồi mới.

Đối với Quản trị viên (Admin)
Duyệt bài đăng: Kiểm soát nội dung bài đăng trước khi hiển thị công khai.

Hệ thống hỗ trợ: Trả lời các thắc mắc và yêu cầu nhận đồ từ sinh viên.

Thống kê: Theo dõi số lượng đồ vật đã tìm thấy thành công.

🛠 Công nghệ sử dụng
Frontend: React.js (Vite), Tailwind CSS, Shadcn/UI.

Backend: PocketBase (Database, Auth, Realtime Subscription, File Storage).

Iconography: Lucide React.

Date Management: Date-fns.

Notifications: Sonner (Toast notifications).

📂 Cấu trúc thư mục tiêu biểu
Plaintext
src/
├── components/       # Các component dùng chung (Header, Footer, Modals...)
├── context/          # AppContext để quản lý Auth và UserRole
├── lib/              # Cấu hình PocketBase (pocketbase.js)
├── pages/            # Các trang chính (Dashboard, QAPage, Notifications...)
└── ui/               # Các component giao diện cơ bản từ Shadcn/UI
⚙️ Cài đặt và Chạy dự án
1. Cài đặt Backend (PocketBase)
Tải PocketBase tại pocketbase.io.

Khởi chạy server: ./pocketbase serve.

Tạo các Collection sau:

users: (Thêm trường role, name).

lost_items: (Fields: item_name, description, image, location, status, user_id, category).

questions: (Fields: user_id, title, content).

answers: (Fields: question_id, user_id, content).

notifications: (Fields: user, type, message, item_id, is_read).

2. Cài đặt Frontend
Clone repository này.

Cài đặt dependencies:

Bash
npm install
Cấu hình URL PocketBase trong file src/lib/pocketbase.js.

Chạy dự án ở môi trường development:

Bash
npm run dev
🔒 API Rules (PocketBase)
Để đảm bảo tính riêng tư, hãy cấu hình API Rules cho bảng notifications và questions:

List/Search Rule: user = @request.auth.id || @request.auth.role = "admin"

View Rule: user = @request.auth.id || @request.auth.role = "admin"

📝 Giấy phép
Dự án này được phát triển cho mục đích học tập và hỗ trợ cộng đồng sinh viên HUSC.

Phát triển bởi: Team HUSC Lost & Found 2026 🚀
