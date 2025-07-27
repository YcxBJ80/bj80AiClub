import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'ai-club.db');
const db = new Database(dbPath);

console.log('🗄️ 初始化数据库...');

// 创建用户表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    nickname TEXT NOT NULL,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 创建文章表
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    cover_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users (id)
  )
`);

// 创建点赞表
db.exec(`
  CREATE TABLE IF NOT EXISTS article_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(article_id, user_id)
  )
`);

// 创建评论表
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    parent_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER DEFAULT 0,
    FOREIGN KEY (article_id) REFERENCES articles (id),
    FOREIGN KEY (author_id) REFERENCES users (id),
    FOREIGN KEY (parent_id) REFERENCES comments (id)
  )
`);

// 创建评论点赞表
db.exec(`
  CREATE TABLE IF NOT EXISTS comment_likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments (id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(comment_id, user_id)
  )
`);

// 插入示例数据
const insertSampleData = () => {
  // 插入示例用户
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, nickname, avatar) 
    VALUES (?, ?, ?)
  `);
  
  insertUser.run('admin@ai-club.com', '社团管理员', '👨‍💼');
  insertUser.run('zhang@ai-club.com', '张同学', '🧑‍💻');
  insertUser.run('li@ai-club.com', '李同学', '👨‍🔬');
  
  // 获取用户ID
  const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@ai-club.com');
  const zhangUser = db.prepare('SELECT id FROM users WHERE email = ?').get('zhang@ai-club.com');
  
  if (adminUser && zhangUser) {
    // 插入示例文章
    const insertArticle = db.prepare(`
      INSERT OR IGNORE INTO articles (title, content, author_id, author_name, author_avatar) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertArticle.run(
      'AI社团成立公告',
      '# AI社团成立公告\n\n欢迎大家加入我们的AI社团！我们致力于探索人工智能的奥秘，分享学习心得，共同进步。\n\n## 社团目标\n\n- 学习AI基础知识\n- 分享项目经验\n- 组织技术讨论\n\n让我们一起在AI的世界中探索前进！',
      adminUser.id,
      '社团管理员',
      '👨‍💼'
    );
    
    insertArticle.run(
      '机器学习入门指南',
      '# 机器学习入门指南\n\n机器学习是人工智能的一个重要分支，本文将为大家介绍机器学习的基本概念。\n\n## 什么是机器学习\n\n机器学习是一种让计算机通过数据学习规律的方法，而不需要明确编程。\n\n## 主要类型\n\n1. **监督学习**：有标签的数据训练\n2. **无监督学习**：无标签数据中发现模式\n3. **强化学习**：通过奖励机制学习\n\n```python\n# 简单的线性回归示例\nfrom sklearn.linear_model import LinearRegression\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)\n```',
      zhangUser.id,
      '张同学',
      '🧑‍💻'
    );
    
    // 插入示例评论
    const insertComment = db.prepare(`
      INSERT OR IGNORE INTO comments (article_id, content, author_id, author_name, author_avatar) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertComment.run(1, '太棒了！期待社团的发展！', zhangUser.id, '张同学', '🧑‍💻');
    insertComment.run(2, '很好的入门教程！', adminUser.id, '社团管理员', '👨‍💼');
  }
};

insertSampleData();

console.log('✅ 数据库初始化完成！');
console.log(`📁 数据库文件位置: ${dbPath}`);

db.close();
