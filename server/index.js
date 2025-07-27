import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import { articleService, commentService, userService, activityService, memberService } from './database/db.js';

// 重启服务器 - 添加调试信息
console.log('🚀 正在启动服务器...');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 2025; // 修改为2025端口，与前端配置匹配

// 创建上传目录
const uploadsDir = path.join(__dirname, 'uploads');
const articlesDir = path.join(uploadsDir, 'articles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(articlesDir)) {
  fs.mkdirSync(articlesDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const articleId = req.params.articleId || req.body.articleId || Date.now().toString();
    const articleDir = path.join(articlesDir, articleId);
    
    if (!fs.existsSync(articleDir)) {
      fs.mkdirSync(articleDir, { recursive: true });
    }
    
    cb(null, articleDir);
  },
  filename: (req, file, cb) => {
    // 保持原始文件名，支持中文
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

// 中间件
// app.use(helmet()); // 暂时注释掉helmet
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:2025'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务 - 提供图片访问，支持中文文件名和URL编码
app.use('/api/uploads', (req, res, next) => {
  // 设置CORS头
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // 解码URL路径中的中文文件名
  try {
    const decodedPath = decodeURIComponent(req.path);
    console.log('🔍 图片请求:', {
      originalPath: req.path,
      decodedPath: decodedPath,
      fullUrl: req.url
    });
    // 更新请求路径为解码后的路径
    req.url = decodedPath + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');
  } catch (error) {
    console.log('⚠️ URL解码失败:', error.message);
  }

  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    console.log('📁 服务静态文件:', filePath);
    // 设置正确的Content-Type
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }

  try {
    const result = userService.verifyToken(token);
    if (result.success) {
      req.user = result.user; // 修复：使用 result.user 而不是 result
    } else {
      return res.status(403).json({ error: result.error || '无效的访问令牌' });
    }
    next();
  } catch (error) {
    return res.status(403).json({ error: '无效的访问令牌' });
  }
};

// 可选认证中间件
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const result = userService.verifyToken(token);
      if (result.success) {
        req.user = result.user; // 修复：使用 result.user 而不是 result
      }
    } catch (error) {
      // 忽略错误，继续执行
    }
  }
  next();
};

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 用户认证路由
app.post('/api/register', async (req, res) => {
  try {
    const { email, nickname, avatar, password } = req.body;
    
    if (!email || !nickname) {
      return res.status(400).json({ error: '邮箱和昵称不能为空' });
    }

    const result = await userService.createUser({ email, nickname, avatar, password });
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: '邮箱不能为空' });
    }

    const result = userService.loginUser(email, password);
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json({ error: result.error });
    }
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const user = userService.getUserById(req.user.id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: '用户不存在' });
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

app.put('/api/profile', authenticateToken, (req, res) => {
  try {
    const { nickname, avatar } = req.body;
    const success = userService.updateUser(req.user.id, { nickname, avatar });
    
    if (success) {
      const updatedUser = userService.getUserById(req.user.id);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } else {
      res.status(500).json({ error: '更新用户信息失败' });
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ error: '更新用户信息失败' });
  }
});

// 社团信息路由
app.get('/api/club-info', (req, res) => {
  res.json({
    name: 'AI创新社团',
    description: '致力于人工智能技术研究与应用的学生社团',
    founded: '2023年9月',
    memberCount: 156,
    activities: 24,
    projects: 12
  });
});

// 活动路由
app.get('/api/activities', (req, res) => {
  try {
    const activities = activityService.getAllActivities();
    res.json(activities);
  } catch (error) {
    console.error('获取活动列表失败:', error);
    res.status(500).json({ error: '获取活动列表失败' });
  }
});

// 成员路由
app.get('/api/members', (req, res) => {
  try {
    const members = memberService.getAllMembers();
    res.json(members);
  } catch (error) {
    console.error('获取成员列表失败:', error);
    res.status(500).json({ error: '获取成员列表失败' });
  }
});

// 图片上传API - 修复中文文件名处理
app.post('/api/articles/:articleId/upload', authenticateToken, upload.array('images'), (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const uploadedFiles = files.map(file => {
      // 正确处理中文文件名
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      // URL编码文件名以确保正确访问
      const encodedFilename = encodeURIComponent(file.filename);
      
      console.log('📷 处理上传文件:', {
        originalName,
        filename: file.filename,
        encodedFilename,
        size: file.size
      });
      
      return {
        originalName,
        filename: file.filename,
        encodedFilename,
        path: `/api/uploads/articles/${req.params.articleId}/${encodedFilename}`,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    console.log('✅ 文件上传成功:', uploadedFiles.length, '个文件');

    res.json({
      message: '文件上传成功',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 文章路由
app.get('/api/articles', optionalAuth, (req, res) => {
  try {
    const articles = articleService.getAllArticles();
    // 为每篇文章添加评论
    const articlesWithComments = articles.map(article => ({
      ...article,
      comments: commentService.getCommentsByArticleId(article.id)
    }));
    res.json(articlesWithComments);
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

app.get('/api/articles/:id', optionalAuth, (req, res) => {
  try {
    const article = articleService.getArticleById(req.params.id);
    if (article) {
      article.comments = commentService.getCommentsByArticleId(article.id);
      res.json(article);
    } else {
      res.status(404).json({ error: '文章不存在' });
    }
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({ error: '获取文章详情失败' });
  }
});

// 修改文章创建API
app.post('/api/articles', authenticateToken, (req, res) => {
  try {
    const { title, content, images, tempArticleId } = req.body;
    
    console.log('📝 创建文章请求:', {
      title,
      contentLength: content?.length,
      tempArticleId,
      imagesKeys: images ? Object.keys(images) : [],
      hasImages: !!images
    });
    
    if (!title || !content) {
      return res.status(400).json({ error: '标题和内容不能为空' });
    }

    const articleId = Date.now().toString();
    console.log('🆔 生成文章ID:', articleId);
    
    // 如果有临时上传的图片，需要移动到正确的文件夹
    let finalImages = {};
    if (tempArticleId && images && typeof images === 'object') {
      const tempDir = path.join(articlesDir, tempArticleId);
      const finalDir = path.join(articlesDir, articleId);
      
      console.log('📁 目录信息:', {
        tempDir,
        finalDir,
        tempDirExists: fs.existsSync(tempDir),
        finalDirExists: fs.existsSync(finalDir)
      });
      
      // 创建最终目录
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
        console.log('✅ 创建最终目录:', finalDir);
      }
      
      // 移动文件并更新路径映射
      Object.keys(images).forEach(imageName => {
        const tempPath = path.join(tempDir, imageName);
        const finalPath = path.join(finalDir, imageName);
        
        console.log('🔄 处理图片:', {
          imageName,
          tempPath,
          finalPath,
          tempExists: fs.existsSync(tempPath)
        });
        
        if (fs.existsSync(tempPath)) {
          try {
            fs.renameSync(tempPath, finalPath);
            finalImages[imageName] = `/api/uploads/articles/${articleId}/${imageName}`;
            console.log('✅ 图片移动成功:', imageName);
          } catch (error) {
            console.error('❌ 图片移动失败:', imageName, error.message);
          }
        } else {
          console.warn('⚠️ 临时图片文件不存在:', tempPath);
          // 如果临时文件不存在，但有映射，尝试使用原路径
          if (images[imageName]) {
            finalImages[imageName] = images[imageName];
          }
        }
      });
      
      // 删除临时目录（如果为空）
      try {
        if (fs.existsSync(tempDir)) {
          const files = fs.readdirSync(tempDir);
          console.log('🗂️ 临时目录文件:', files);
          if (files.length === 0) {
            fs.rmdirSync(tempDir);
            console.log('🗑️ 删除空临时目录:', tempDir);
          }
        }
      } catch (error) {
        console.log('⚠️ 删除临时目录失败:', error.message);
      }
    } else if (images) {
      finalImages = images;
      console.log('📷 使用现有图片映射:', Object.keys(finalImages));
    }
    
    // 处理markdown中的图片路径 - 修复版本
    let processedContent = content;
    console.log('🔄 开始处理Markdown图片路径...');
    console.log('原始内容长度:', content.length);
    
    if (finalImages && typeof finalImages === 'object') {
      console.log('📷 可用图片映射:', Object.keys(finalImages));
      
      // 方法1: 先处理所有base64图片（按出现顺序替换）
      const base64Pattern = /!\[([^\]]*)\]\(data:image\/[^;]+;base64,[^)]+\)/g;
      const base64Matches = [...content.matchAll(base64Pattern)];
      console.log(`🔍 发现 ${base64Matches.length} 个base64图片`);
      
      // 按顺序替换base64图片
      let imageIndex = 0;
      const imageNames = Object.keys(finalImages);
      
      // 重要修复：直接替换所有base64图片
      let tempContent = processedContent;
      base64Matches.forEach((match, index) => {
        if (imageIndex < imageNames.length) {
          const imageName = imageNames[imageIndex];
          const encodedImageName = encodeURIComponent(imageName);
          const serverPath = `/api/uploads/articles/${articleId}/${encodedImageName}`;
          
          // 替换这个base64图片
          tempContent = tempContent.replace(match[0], `![${imageName}](${serverPath})`);
          console.log(`✅ 替换base64图片 ${index + 1}: ${imageName} -> ${serverPath}`);
          
          // 更新映射
          finalImages[imageName] = serverPath;
          imageIndex++;
        }
      });
      processedContent = tempContent;
      
      // 方法2: 处理文件名引用的图片
      Object.keys(finalImages).forEach(imageName => {
        const encodedImageName = encodeURIComponent(imageName);
        const serverPath = `/api/uploads/articles/${articleId}/${encodedImageName}`;
        
        // 转义特殊字符用于正则表达式
        const escapedName = imageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const patterns = [
          // 标准markdown: ![alt](imageName)
          { regex: new RegExp(`!\\[([^\\]]*)\\]\\(${escapedName}\\)`, 'g'), replacement: `![$1](${serverPath})` },
          // Obsidian格式: ![[imageName]]
          { regex: new RegExp(`!\\[\\[${escapedName}\\]\\]`, 'g'), replacement: `![${imageName}](${serverPath})` },
          // 相对路径: ![alt](./imageName)
          { regex: new RegExp(`!\\[([^\\]]*)\\]\\(\\.\/${escapedName}\\)`, 'g'), replacement: `![$1](${serverPath})` },
          // 图片目录: ![alt](images/imageName)
          { regex: new RegExp(`!\\[([^\\]]*)\\]\\(images\\/${escapedName}\\)`, 'g'), replacement: `![$1](${serverPath})` }
        ];
        
        patterns.forEach((pattern, index) => {
          const beforeReplace = processedContent;
          processedContent = processedContent.replace(pattern.regex, pattern.replacement);
          
          if (beforeReplace !== processedContent) {
            console.log(`✅ 替换文件名引用 (模式${index + 1}): ${imageName} -> ${serverPath}`);
          }
        });
        
        // 更新最终图片映射
        finalImages[imageName] = serverPath;
      });
    }
    
    console.log('处理后内容长度:', processedContent.length);
    console.log('处理后内容预览:', processedContent.substring(0, 500));
    
    // 验证处理结果
    const finalImageMatches = processedContent.match(/!\[.*?\]\([^)]+\)/g) || [];
    console.log('🔍 处理后的图片引用:', finalImageMatches.length);
    finalImageMatches.forEach((match, index) => {
      console.log(`  ${index + 1}. ${match.substring(0, 100)}...`);
    });
    
    const article = {
      id: articleId,
      title,
      content: processedContent,
      author: req.user.nickname,
      author_avatar: req.user.avatar,
      user_id: req.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      liked_by: [],
      images: finalImages || {}
    };
    
    const success = articleService.createArticle(article);
    if (success) {
      console.log('✅ 文章创建成功:', articleId);
      res.status(201).json(article);
    } else {
      console.error('❌ 文章创建失败');
      res.status(500).json({ error: '创建文章失败' });
    }
  } catch (error) {
    console.error('❌ 创建文章异常:', error);
    res.status(500).json({ error: '创建文章失败' });
  }
});

app.post('/api/articles/:id/like', authenticateToken, (req, res) => {
  try {
    const success = articleService.likeArticle(req.params.id, req.user.id);
    if (success) {
      res.json({ message: '操作成功' });
    } else {
      res.status(404).json({ error: '文章不存在' });
    }
  } catch (error) {
    console.error('点赞文章失败:', error);
    res.status(500).json({ error: '点赞文章失败' });
  }
});

app.post('/api/articles/:id/comments', authenticateToken, (req, res) => {
  try {
    const { content, parent_id } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    const comment = {
      id: Date.now().toString(),
      article_id: req.params.id,
      content,
      author: req.user.nickname,
      author_avatar: req.user.avatar,
      user_id: req.user.id,
      parent_id: parent_id || null,
      created_at: new Date().toISOString(),
      likes: 0,
      liked_by: []
    };

    const success = commentService.createComment(comment);
    if (success) {
      res.status(201).json(comment);
    } else {
      res.status(500).json({ error: '创建评论失败' });
    }
  } catch (error) {
    console.error('创建评论失败:', error);
    res.status(500).json({ error: '创建评论失败' });
  }
});

app.post('/api/comments/:id/like', authenticateToken, (req, res) => {
  try {
    const success = commentService.likeComment(req.params.id, req.user.id);
    if (success) {
      res.json({ message: '操作成功' });
    } else {
      res.status(404).json({ error: '评论不存在' });
    }
  } catch (error) {
    console.error('点赞评论失败:', error);
    res.status(500).json({ error: '点赞评论失败' });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制' });
    }
  }
  console.error('服务器错误:', error);
  res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 触发重启 - 修复认证中间件用户信息设置问题
