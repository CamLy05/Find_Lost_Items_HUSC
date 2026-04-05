//// Duyệt bài đăng của người dùng, bao gồm:
//// - Xem chi tiết thông tin của item (hình ảnh, mô tả, thông tin liên hệ, vị trí, tình trạng, giá cả).
//// - Duyệt và phê duyệt hoặc từ chối bài đăng dựa trên các tiêu chí đã đặt ra.
//// - Gửi phản hồi cho người dùng về lý do từ chối (nếu có) để họ có thể chỉnh sửa và đăng lại.
// const handleApprove = (id) => {
//   axios.patch(`http://localhost:5000/items/${id}`, { status: 'approved' })
//     .then(() => alert("Đã duyệt bài thành công!"));
// };