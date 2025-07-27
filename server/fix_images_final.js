import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database/ai_club.db');
const db = new Database(dbPath);

console.log('🔧 最终修复图片路径...\n');

// 查询特定文章
const article = db.prepare(`
  SELECT id, title, content, images 
  FROM articles 
  WHERE id = ?
`).get('1753603943510');

if (!article) {
  console.log('❌ 文章不存在');
  process.exit(1);
}

console.log(`📝 处理文章: ${article.title} (ID: ${article.id})`);

// 解析图片数据
let images = {};
try {
  if (article.images) {
    images = JSON.parse(article.images);
    console.log('📷 图片映射:', images);
  }
} catch (error) {
  console.log(`❌ 图片数据解析失败: ${error.message}`);
  process.exit(1);
}

let processedContent = article.content;
console.log('原始内容长度:', article.content.length);

// 手动替换每个base64图片
const imageNames = Object.keys(images);
console.log('可用图片名称:', imageNames);

imageNames.forEach((imageName, index) => {
  const serverPath = images[imageName];
  console.log(`处理图片 ${index + 1}: ${imageName} -> ${serverPath}`);
  
  // 查找并替换对应的base64图片
  const base64Pattern = new RegExp(`!\\[${imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\(data:image\\/[^;]+;base64,[^)]+\\)`, 'g');
  const beforeReplace = processedContent;
  processedContent = processedContent.replace(base64Pattern, `![${imageName}](${serverPath})`);
  
  if (beforeReplace !== processedContent) {
    console.log(`✅ 成功替换图片: ${imageName}`);
  } else {
    console.log(`⚠️ 未找到匹配的base64图片: ${imageName}`);
  }
});

console.log('处理后内容长度:', processedContent.length);

// 更新数据库
const updateStmt = db.prepare(`UPDATE articles SET content = ? WHERE id = ?`);
try {
  updateStmt.run(processedContent, article.id);
  console.log('💾 文章内容已更新');
} catch (error) {
  console.log(`❌ 更新失败: ${error.message}`);
}

console.log('🎉 修复完成！');
db.close();