import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database/ai_club.db');
const db = new Database(dbPath);

console.log('🔍 检查文章中的图片数据...\n');

// 查询所有文章
const articles = db.prepare(`
  SELECT id, title, author, content, images, created_at 
  FROM articles 
  ORDER BY created_at DESC
`).all();

console.log(`📝 总共找到 ${articles.length} 篇文章\n`);

articles.forEach((article, index) => {
  console.log(`${index + 1}. 文章: ${article.title} (ID: ${article.id})`);
  console.log(`   作者: ${article.author}`);
  console.log(`   创建时间: ${article.created_at}`);
  
  // 解析图片数据
  let images = {};
  try {
    if (article.images) {
      images = JSON.parse(article.images);
    }
  } catch (error) {
    console.log(`   ❌ 图片数据解析失败: ${error.message}`);
  }
  
  console.log(`   📷 图片数量: ${Object.keys(images).length}`);
  if (Object.keys(images).length > 0) {
    Object.entries(images).forEach(([name, path]) => {
      console.log(`      - ${name}: ${path}`);
    });
  }
  
  // 检查内容中的图片引用
  const imageMatches = article.content.match(/!\[.*?\]\([^)]+\)/g) || [];
  console.log(`   🖼️ 内容中的图片引用: ${imageMatches.length}`);
  imageMatches.forEach((match, i) => {
    console.log(`      ${i + 1}. ${match.substring(0, 80)}...`);
  });
  
  console.log('');
});

db.close();