import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'ai_club.db');
const db = new Database(dbPath);

// 启用外键约束
db.pragma('foreign_keys = ON');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'ai-club-secret-key-2024';

// 文章相关操作
export const articleService = {
  // 获取所有文章
  getAllArticles: () => {
    const articles = db.prepare(`
      SELECT a.*, u.nickname as author_name, u.avatar as author_avatar
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `).all();
    
    return articles.map(article => ({
      id: article.id,
      title: article.title,
      content: article.content,
      author: article.author_name || article.author,
      authorAvatar: article.author_avatar || article.author_avatar,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      likes: article.likes,
      likedBy: JSON.parse(article.liked_by || '[]'),
      images: JSON.parse(article.images || '{}'),
      coverImage: article.cover_image,
      comments: [] // 评论将在需要时单独获取
    }));
  },

  // 根据ID获取文章
  getArticleById: (id) => {
    const article = db.prepare(`
      SELECT a.*, u.nickname as author_name, u.avatar as author_avatar
      FROM articles a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `).get(id);
    
    if (!article) return null;
    
    return {
      id: article.id,
      title: article.title,
      content: article.content,
      author: article.author_name || article.author,
      authorAvatar: article.author_avatar || article.author_avatar,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      likes: article.likes,
      likedBy: JSON.parse(article.liked_by || '[]'),
      images: JSON.parse(article.images || '{}'),
      coverImage: article.cover_image
    };
  },

  // 创建文章
  createArticle: (article) => {
    const stmt = db.prepare(`
      INSERT INTO articles 
      (id, title, content, author, author_avatar, user_id, created_at, updated_at, likes, liked_by, cover_image, images)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      article.id,
      article.title,
      article.content,
      article.author,
      article.author_avatar,
      article.user_id,
      article.created_at,
      article.updated_at,
      article.likes || 0,
      JSON.stringify(article.liked_by || []),
      article.cover_image,
      JSON.stringify(article.images || {})
    );
    
    return result.changes > 0;
  },

  // 更新文章
  updateArticle: (id, updates) => {
    const stmt = db.prepare(`
      UPDATE articles 
      SET title = ?, content = ?, updated_at = ?, cover_image = ?, images = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(
      updates.title,
      updates.content,
      updates.updated_at,
      updates.cover_image,
      JSON.stringify(updates.images || {}),
      id
    );
    
    return result.changes > 0;
  },

  // 删除文章
  deleteArticle: (id) => {
    const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // 点赞文章
  likeArticle: (id, userId) => {
    const article = articleService.getArticleById(id);
    if (!article) return false;
    
    const likedBy = article.likedBy;
    const isLiked = likedBy.includes(userId);
    
    if (isLiked) {
      // 取消点赞
      const newLikedBy = likedBy.filter(id => id !== userId);
      const stmt = db.prepare(`
        UPDATE articles 
        SET likes = ?, liked_by = ?
        WHERE id = ?
      `);
      stmt.run(newLikedBy.length, JSON.stringify(newLikedBy), id);
    } else {
      // 点赞
      likedBy.push(userId);
      const stmt = db.prepare(`
        UPDATE articles 
        SET likes = ?, liked_by = ?
        WHERE id = ?
      `);
      stmt.run(likedBy.length, JSON.stringify(likedBy), id);
    }
    
    return true;
  }
};

// 评论相关操作
export const commentService = {
  // 获取文章的所有评论
  getCommentsByArticleId: (articleId) => {
    const comments = db.prepare(`
      SELECT c.*, u.nickname as author_name, u.avatar as author_avatar
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ? 
      ORDER BY c.created_at ASC
    `).all(articleId);
    
    const mappedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      author: comment.author_name || comment.author,
      authorAvatar: comment.author_avatar || comment.author_avatar,
      createdAt: comment.created_at,
      likes: comment.likes,
      likedBy: JSON.parse(comment.liked_by || '[]'),
      parentId: comment.parent_id
    }));

    // 构建嵌套评论结构
    const commentMap = new Map();
    const rootComments = [];

    // 首先创建所有评论的映射
    mappedComments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    // 然后构建嵌套结构
    mappedComments.forEach(comment => {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  },

  // 创建评论
  createComment: (comment) => {
    const stmt = db.prepare(`
      INSERT INTO comments 
      (id, article_id, content, author, author_avatar, user_id, created_at, likes, liked_by, parent_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      comment.id,
      comment.article_id,
      comment.content,
      comment.author,
      comment.author_avatar,
      comment.user_id,
      comment.created_at,
      comment.likes || 0,
      JSON.stringify(comment.liked_by || []),
      comment.parent_id
    );
    
    return result.changes > 0;
  },

  // 点赞评论
  likeComment: (commentId, userId) => {
    const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId);
    if (!comment) return false;
    
    const likedBy = JSON.parse(comment.liked_by || '[]');
    const isLiked = likedBy.includes(userId);
    
    if (isLiked) {
      // 取消点赞
      const newLikedBy = likedBy.filter(id => id !== userId);
      const stmt = db.prepare(`
        UPDATE comments 
        SET likes = ?, liked_by = ?
        WHERE id = ?
      `);
      stmt.run(newLikedBy.length, JSON.stringify(newLikedBy), commentId);
    } else {
      // 点赞
      likedBy.push(userId);
      const stmt = db.prepare(`
        UPDATE comments 
        SET likes = ?, liked_by = ?
        WHERE id = ?
      `);
      stmt.run(likedBy.length, JSON.stringify(likedBy), commentId);
    }
    
    return true;
  }
};

// 用户相关操作
export const userService = {
  // 创建用户（注册）
  createUser: async (user) => {
    try {
      // 检查邮箱是否已存在
      const existingUser = userService.getUserByEmail(user.email);
      if (existingUser) {
        return { success: false, error: '邮箱已被注册' };
      }

      // 加密密码（如果提供了密码）
      let hashedPassword = null;
      if (user.password) {
        hashedPassword = await bcrypt.hash(user.password, 10);
      }

      // 自动生成ID和创建时间
      const userId = user.id || Date.now().toString();
      const createdAt = user.created_at || new Date().toISOString();

      const stmt = db.prepare(`
        INSERT INTO users (id, email, nickname, avatar, password, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        userId,
        user.email,
        user.nickname,
        user.avatar,
        hashedPassword,
        createdAt
      );
      
      if (result.changes > 0) {
        const newUser = userService.getUserById(userId);
        // 生成JWT token
        const token = jwt.sign(
          { userId: newUser.id, email: newUser.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        return { 
          success: true, 
          user: {
            id: newUser.id,
            email: newUser.email,
            nickname: newUser.nickname,
            avatar: newUser.avatar,
            createdAt: newUser.created_at
          },
          token 
        };
      }
      
      return { success: false, error: '注册失败' };
    } catch (error) {
      console.error('创建用户失败:', error);
      return { success: false, error: '注册失败' };
    }
  },

  // 用户登录
  login: async (email, password) => {
    try {
      const user = userService.getUserByEmail(email);
      if (!user) {
        return { success: false, error: '用户不存在' };
      }

      // 如果用户没有密码（老用户），直接登录
      if (!user.password) {
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            avatar: user.avatar,
            createdAt: user.created_at
          },
          token
        };
      }

      // 验证密码
      if (password && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            avatar: user.avatar,
            createdAt: user.created_at
          },
          token
        };
      }

      return { success: false, error: '密码错误' };
    } catch (error) {
      console.error('登录失败:', error);
      return { success: false, error: '登录失败' };
    }
  },

  // 验证JWT token
  verifyToken: (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = userService.getUserById(decoded.userId);
      if (user) {
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            avatar: user.avatar,
            createdAt: user.created_at
          }
        };
      }
      return { success: false, error: '用户不存在' };
    } catch (error) {
      return { success: false, error: 'Token无效' };
    }
  },

  // 根据邮箱获取用户
  getUserByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  // 根据ID获取用户
  getUserById: (id) => {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  // 更新用户信息
  updateUser: (id, updates) => {
    const stmt = db.prepare(`
      UPDATE users 
      SET nickname = ?, avatar = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(updates.nickname, updates.avatar, id);
    return result.changes > 0;
  }
};

// 活动相关操作
export const activityService = {
  // 获取所有活动
  getAllActivities: () => {
    return db.prepare(`
      SELECT * FROM activities 
      ORDER BY date DESC
    `).all();
  },

  // 创建活动
  createActivity: (activity) => {
    const stmt = db.prepare(`
      INSERT INTO activities (title, date, description, participants, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      activity.title,
      activity.date,
      activity.description,
      activity.participants || 0,
      activity.created_at
    );
    
    return result.changes > 0;
  }
};

// 成员相关操作
export const memberService = {
  // 获取所有成员
  getAllMembers: () => {
    const members = db.prepare(`
      SELECT * FROM members 
      ORDER BY created_at ASC
    `).all();
    
    return members.map(member => ({
      ...member,
      skills: JSON.parse(member.skills || '[]')
    }));
  },

  // 创建成员
  createMember: (member) => {
    const stmt = db.prepare(`
      INSERT INTO members (name, role, grade, skills, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      member.name,
      member.role,
      member.grade,
      JSON.stringify(member.skills || []),
      member.created_at
    );
    
    return result.changes > 0;
  }
};

export default db;
