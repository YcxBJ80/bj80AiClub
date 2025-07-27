import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__dirname);

const dbPath = path.join(__dirname, 'database/ai_club.db');
const db = new Database(dbPath);

console.log('🔧 最终修复图片路径 - 使用直接路径...\n');

// 新的内容，使用直接的中文文件名路径
const newContent = `# 测试文章

这是一个测试文章，包含多张图片。

![截屏2025-07-21 02.19.27.png](/api/uploads/articles/1753603943510/截屏2025-07-21 02.19.27.png)

![截屏2025-07-22 10.15.15.png](/api/uploads/articles/1753603943510/截屏2025-07-22 10.15.15.png)

![截屏2025-07-21 03.05.20.png](/api/uploads/articles/1753603943510/截屏2025-07-21 03.05.20.png)

图片测试完成。`;

// 更新数据库
const updateStmt = db.prepare(`UPDATE articles SET content = ? WHERE id = ?`);
try {
  updateStmt.run(newContent, '1753603943510');
  console.log('✅ 文章内容已更新为直接中文路径');
} catch (error) {
  console.log(`❌ 更新失败: ${error.message}`);
}

console.log('🎉 修复完成！');
db.close();