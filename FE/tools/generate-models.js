import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Script này tự động tạo các TypeScript Interfaces từ PocketBase
 * Giúp bạn có gợi ý code (Intellisense) chính xác khi làm việc với API.
 */

// Cấu hình thông tin PocketBase của bạn
const POCKETBASE_URL = 'http://127.0.0.1:8090'; // Thay bằng URL thật nếu cần
const EMAIL = 'camlyphamthi31@gmail.com';             // Email admin
const PASSWORD = 'Camly1610@';                // Password admin
const OUTPUT_FILE = './src/types/pocketbase-types.ts'; // Nơi lưu file kết quả

async function generateModels() {
  console.log('--- Đang bắt đầu quá trình tạo Models từ PocketBase ---');

  try {
    // 1. Kiểm tra và tạo thư mục output nếu chưa tồn tại
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 2. Sử dụng pocketbase-typegen để tạo file types
    // Lệnh này sẽ login vào PB và lấy cấu trúc schema
    const command = `npx pocketbase-typegen --url ${POCKETBASE_URL} --email ${EMAIL} --password ${PASSWORD} --out ${OUTPUT_FILE}`;
    
    console.log(`Đang thực thi: ${command}`);
    execSync(command, { stdio: 'inherit' });

    console.log(`✅ Thành công! File types đã được lưu tại: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error('❌ Lỗi khi tạo models:', error.message);
    // Không thoát bằng process.exit(1) để tránh làm sập quá trình build nếu DB chưa chạy
    process.exit(0); 
  }
}

generateModels();