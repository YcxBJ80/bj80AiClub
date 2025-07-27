import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database/ai_club.db');
const db = new Database(dbPath);

console.log('🔧 修复现有文章的图片路径...\n');

// 查询包含base64图片的文章
const articles = db.prepare(`
  SELECT id, title, content, images 
  FROM articles 
  WHERE content LIKE '%data:image%'
  ORDER BY created_at DESC
`).all();

console.log(`📝 找到 ${articles.length} 篇包含base64图片的文章\n`);

const updateStmt = db.prepare(`
  UPDATE articles 
  SET content = ? 
  WHERE id = ?
`);

articles.forEach((article, index) => {
  console.log(`${index + 1}. 处理文章: ${article.title} (ID: ${article.id})`);
  
  // 解析图片数据
  let images = {};
  try {
    if (article.images) {
      images = JSON.parse(article.images);
    }
  } catch (error) {
    console.log(`   ❌ 图片数据解析失败: ${error.message}`);
    return;
  }
  
  let processedContent = article.content;
  
  if (Object.keys(images).length > 0) {
    console.log(`   📷 可用图片: ${Object.keys(images).join(', ')}`);
    
    // 处理base64图片
    const base64Pattern = /!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/g;
    const base64Matches = [...article.content.matchAll(base64Pattern)];
    console.log(`   🔍 发现 ${base64Matches.length} 个base64图片`);
    
    // 按顺序替换base64图片
    let imageIndex = 0;
    const imageNames = Object.keys(images);
    
    base64Matches.forEach((match, matchIndex) => {
      if (imageIndex < imageNames.length) {
        const imageName = imageNames[imageIndex];
        const serverPath = images[imageName];
        
        // 替换这个base64图片
        processedContent = processedContent.replace(match[0], `![${imageName}](${serverPath})`);
        console.log(`   ✅ 替换base64图片 ${matchIndex + 1}: ${imageName} -> ${serverPath}`);
        
        imageIndex++;
      }
    });
    
    // 更新数据库
    try {
      updateStmt.run(processedContent, article.id);
      console.log(`   💾 文章内容已更新`);
    } catch (error) {
      console.log(`   ❌ 更新失败: ${error.message}`);
    }
  } else {
    console.log(`   ⚠️ 没有图片映射数据`);
  }
  
  console.log('');
});

console.log('🎉 修复完成！');
db.close();