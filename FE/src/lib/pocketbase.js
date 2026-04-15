import PocketBase from 'pocketbase';

// Khởi tạo kết nối tới server PocketBase của bạn
// (Mặc định PocketBase chạy ở cổng 8090 trên máy tính)
const pb = new PocketBase('https://husc-api.pockethost.io'); 

export default pb;
