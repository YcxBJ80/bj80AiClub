import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'ai_club.db');
const db = new Database(dbPath);

console.log('🗄️ 数据库管理工具');
console.log(`📁 数据库文件: ${dbPath}`);
console.log('');

// 显示数据库统计信息
const showStats = () => {
  console.log('📊 数据库统计信息:');
  
  const articleCount = db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
  const commentCount = db.prepare('SELECT COUNT(*) as count FROM comments').get().count;
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const activityCount = db.prepare('SELECT COUNT(*) as count FROM activities').get().count;
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
  
  console.log(`📝 文章数量: ${articleCount}`);
  console.log(`💬 评论数量: ${commentCount}`);
  console.log(`👥 用户数量: ${userCount}`);
  console.log(`🎯 活动数量: ${activityCount}`);
  console.log(`👨‍💼 成员数量: ${memberCount}`);
  console.log('');
};

// 显示最新文章
const showLatestArticles = () => {
  console.log('📝 最新文章:');
  const articles = db.prepare(`
    SELECT id, title, author, created_at, likes 
    FROM articles 
    ORDER BY created_at DESC 
    LIMIT 5
  `).all();
  
  articles.forEach((article, index) => {
    console.log(`${index + 1}. ${article.title} (作者: ${article.author}, 点赞: ${article.likes})`);
  });
  console.log('');
};

// 备份数据库
const backupDatabase = () => {
  const originalPath = path.join(__dirname, 'ai_club.db');
  const backupPath = path.join(__dirname, `ai_club_backup_${Date.now()}.db`);
  
  try {
    fs.copyFileSync(originalPath, backupPath);
    console.log(`💾 数据库已备份到: ${backupPath}`);
  } catch (error) {
    console.error('❌ 备份失败:', error.message);
  }
  console.log('');
};

// 清理旧数据
const cleanupOldData = () => {
  console.log('🧹 清理30天前的测试数据...');
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const result = db.prepare(`
    DELETE FROM articles 
    WHERE created_at < ? AND title LIKE '%测试%'
  `).run(thirtyDaysAgo.toISOString());
  
  console.log(`🗑️ 删除了 ${result.changes} 条测试文章`);
  console.log('');
};

// 主函数
const main = () => {
  const command = process.argv[2];
  
  switch (command) {
    case 'stats':
      showStats();
      break;
    case 'articles':
      showLatestArticles();
      break;
    case 'backup':
      backupDatabase();
      break;
    case 'cleanup':
      cleanupOldData();
      break;
    case 'all':
      showStats();
      showLatestArticles();
      break;
    default:
      console.log('使用方法: node manage.js [命令]');
      console.log('命令:');
      console.log('  stats     - 显示数据库统计信息');
      console.log('  articles  - 显示最新文章');
      console.log('  backup    - 备份数据库');
      console.log('  cleanup   - 清理旧数据');
      console.log('  all       - 显示所有信息');
  }
};

main();
db.close();
