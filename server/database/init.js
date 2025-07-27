import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'ai_club.db');
const db = new Database(dbPath);

console.log('🗄️ 初始化数据库...');

// 创建文章表
db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    author_avatar TEXT,
    user_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    liked_by TEXT DEFAULT '[]',
    cover_image TEXT,
    images TEXT DEFAULT '{}',
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`);

// 创建评论表
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    author_avatar TEXT,
    user_id TEXT,
    created_at TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    liked_by TEXT DEFAULT '[]',
    parent_id TEXT,
    FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )
`);

// 创建用户表
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nickname TEXT NOT NULL,
    avatar TEXT,
    password TEXT,
    created_at TEXT NOT NULL
  )
`);

// 创建活动表
db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    participants INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);

// 创建成员表
db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    grade TEXT NOT NULL,
    skills TEXT DEFAULT '[]',
    created_at TEXT NOT NULL
  )
`);

// 检查是否需要添加新字段
const addColumnIfNotExists = (table, column, type) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    console.log(`✅ 添加字段 ${table}.${column}`);
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log(`ℹ️ 字段 ${table}.${column} 已存在`);
    } else {
      console.error(`❌ 添加字段 ${table}.${column} 失败:`, error.message);
    }
  }
};

// 为现有表添加新字段
addColumnIfNotExists('articles', 'user_id', 'TEXT');
addColumnIfNotExists('comments', 'user_id', 'TEXT');
addColumnIfNotExists('users', 'password', 'TEXT');

// 插入示例数据
const insertSampleData = () => {
  console.log('📝 插入示例数据...');
  
  // 插入示例用户
  const sampleUsers = [
    {
      id: '1',
      email: 'admin@bj80ai.com',
      nickname: 'AI社团管理员',
      avatar: '🤖',
      created_at: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      email: 'student@bj80ai.com',
      nickname: '热爱AI的学生',
      avatar: '👨‍💻',
      created_at: '2024-01-02T00:00:00.000Z'
    }
  ];

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users 
    (id, email, nickname, avatar, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  sampleUsers.forEach(user => {
    insertUser.run(
      user.id,
      user.email,
      user.nickname,
      user.avatar,
      user.created_at
    );
  });
  
  // 插入示例文章
  const sampleArticles = [
    {
      id: '1',
      title: 'AI社团成立公告',
      content: '# AI社团成立公告\n\n欢迎大家加入我们的AI社团！我们致力于探索人工智能的奥秘，分享学习心得，共同进步。\n\n## 社团目标\n\n- 学习AI基础知识\n- 分享项目经验\n- 组织技术讨论\n\n让我们一起在AI的世界中探索前进！',
      author: 'AI社团管理员',
      author_avatar: '🤖',
      user_id: '1',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      likes: 15,
      liked_by: JSON.stringify(['1', '2'])
    },
    {
      id: '2',
      title: '机器学习入门指南',
      content: '# 机器学习入门指南\n\n机器学习是人工智能的一个重要分支，本文将为大家介绍机器学习的基本概念。\n\n## 什么是机器学习\n\n机器学习是一种让计算机通过数据学习规律的方法，而不需要明确编程。\n\n## 主要类型\n\n1. **监督学习**：有标签的数据训练\n2. **无监督学习**：无标签数据中发现模式\n3. **强化学习**：通过奖励机制学习\n\n```python\n# 简单的线性回归示例\nfrom sklearn.linear_model import LinearRegression\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)\n```',
      author: '热爱AI的学生',
      author_avatar: '👨‍💻',
      user_id: '2',
      created_at: '2024-01-16T14:30:00Z',
      updated_at: '2024-01-16T14:30:00Z',
      likes: 8,
      liked_by: JSON.stringify(['1'])
    }
  ];

  const insertArticle = db.prepare(`
    INSERT OR IGNORE INTO articles 
    (id, title, content, author, author_avatar, user_id, created_at, updated_at, likes, liked_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleArticles.forEach(article => {
    insertArticle.run(
      article.id,
      article.title,
      article.content,
      article.author,
      article.author_avatar,
      article.user_id,
      article.created_at,
      article.updated_at,
      article.likes,
      article.liked_by
    );
  });

  // 插入示例评论
  const sampleComments = [
    {
      id: 'c1',
      article_id: '1',
      content: '太棒了！期待社团的发展！',
      author: '热爱AI的学生',
      author_avatar: '👨‍💻',
      user_id: '2',
      created_at: '2024-01-15T11:00:00Z',
      likes: 5,
      liked_by: JSON.stringify(['1'])
    },
    {
      id: 'c1-r1',
      article_id: '1',
      content: '我也很期待！',
      author: 'AI社团管理员',
      author_avatar: '🤖',
      user_id: '1',
      created_at: '2024-01-15T11:30:00Z',
      likes: 2,
      liked_by: JSON.stringify(['2']),
      parent_id: 'c1'
    }
  ];

  const insertComment = db.prepare(`
    INSERT OR IGNORE INTO comments 
    (id, article_id, content, author, author_avatar, user_id, created_at, likes, liked_by, parent_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleComments.forEach(comment => {
    insertComment.run(
      comment.id,
      comment.article_id,
      comment.content,
      comment.author,
      comment.author_avatar,
      comment.user_id,
      comment.created_at,
      comment.likes,
      comment.liked_by,
      comment.parent_id
    );
  });

  // 插入示例活动
  const sampleActivities = [
    {
      title: 'Python编程入门',
      date: '2024-01-15',
      description: '学习Python基础语法和数据结构',
      participants: 20,
      created_at: new Date().toISOString()
    },
    {
      title: '机器学习实战',
      date: '2024-01-22',
      description: '使用scikit-learn进行机器学习项目',
      participants: 15,
      created_at: new Date().toISOString()
    },
    {
      title: '深度学习基础',
      date: '2024-01-29',
      description: '神经网络和深度学习原理',
      participants: 12,
      created_at: new Date().toISOString()
    }
  ];

  const insertActivity = db.prepare(`
    INSERT OR IGNORE INTO activities 
    (title, date, description, participants, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  sampleActivities.forEach(activity => {
    insertActivity.run(
      activity.title,
      activity.date,
      activity.description,
      activity.participants,
      activity.created_at
    );
  });

  // 插入示例成员
  const sampleMembers = [
    {
      name: '张三',
      role: '社长',
      grade: '高三',
      skills: JSON.stringify(['Python', '机器学习', '深度学习']),
      created_at: new Date().toISOString()
    },
    {
      name: '李四',
      role: '技术部长',
      grade: '高二',
      skills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
      created_at: new Date().toISOString()
    },
    {
      name: '王五',
      role: '宣传部长',
      grade: '高一',
      skills: JSON.stringify(['设计', '摄影', '视频制作']),
      created_at: new Date().toISOString()
    }
  ];

  const insertMember = db.prepare(`
    INSERT OR IGNORE INTO members 
    (name, role, grade, skills, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  sampleMembers.forEach(member => {
    insertMember.run(
      member.name,
      member.role,
      member.grade,
      member.skills,
      member.created_at
    );
  });
};

insertSampleData();

console.log('✅ 数据库初始化完成');
console.log('📊 数据库文件位置:', dbPath);

db.close();
