import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'server/database/ai_club.db');
const db = new Database(dbPath);

console.log('🔍 检查数据库中的文章内容...\n');

// 获取最新的文章
const articles = db.prepare(`
  SELECT id, title, content, images, created_at 
  FROM articles 
  ORDER BY created_at DESC 
  LIMIT 3
`).all();

articles.forEach((article, index) => {
  console.log(`📝 文章 ${index + 1}:`);
  console.log(`ID: ${article.id}`);
  console.log(`标题: ${article.title}`);
  console.log(`创建时间: ${article.created_at}`);
  console.log(`图片映射: ${article.images}`);
  console.log(`内容预览: ${article.content.substring(0, 300)}...`);
  
  // 检查内容中的图片引用
  const imageRefs = article.content.match(/!\[.*?\]\([^)]+\)/g);
  if (imageRefs) {
    console.log(`🖼️ 发现的图片引用:`);
    imageRefs.forEach(ref => console.log(`  - ${ref}`));
  } else {
    console.log(`❌ 未发现图片引用`);
  }
  console.log('---\n');
});

db.close();