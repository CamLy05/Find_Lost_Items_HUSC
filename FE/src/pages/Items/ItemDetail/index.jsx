///// Chi tiết thông tin của một item, bao gồm:
//// - Hình ảnh, tên, mô tả chi tiết của item.
//// - Thông tin liên hệ của người đăng (số điện thoại, email).
//// - Vị trí (Giảng đường, Thư viện...) nơi item được đăng.
//// - Tình trạng (mới, đã qua sử dụng) và giá cả (nếu có).
// const user = JSON.parse(localStorage.getItem('user'));

// return (
//     <div>
//         <h1>Chi tiết món đồ</h1>
//         {/* Chỉ Admin thấy nút Xóa/Duyệt bài */}
//         {user?.role === 'admin' && (
//             <button onClick={handleDelete}>Xóa bài vi phạm</button>
//         )}

//         {/* Chỉ Sinh viên thấy nút Chat với người nhặt */}
//         {user?.role === 'student' && (
//             <button onClick={goToChat}>Liên hệ người nhặt</button>
//         )}
//     </div>
// );