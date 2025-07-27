# AI社团官方网站

一个现代化的高中AI社团官方网站，包含前端展示和后端API服务。

## 🚀 快速开始

### 生产环境部署
```bash
# 一键启动生产环境
./start.sh
```

### 开发环境
```bash
# 启动开发环境（前端 + 后端）
./dev.sh
```

## 📁 项目结构

```
社团web/
├── src/                    # 前端源代码
│   ├── components/         # React组件
│   ├── pages/             # 页面组件
│   ├── store/             # 状态管理
│   ├── hooks/             # 自定义Hooks
│   └── ...
├── server/                # 后端服务器
│   └── index.js           # Express服务器
├── dist/                  # 构建输出
├── public/                # 静态资源
├── start.sh               # 生产环境启动脚本
├── dev.sh                 # 开发环境启动脚本
└── package.json           # 项目配置
```

## 🌐 访问地址

### 生产环境
- 网站: http://localhost:3001
- API健康检查: http://localhost:3001/api/health

### 开发环境
- 前端: http://localhost:5173
- 后端API: http://localhost:3001

## 📡 API接口

### 健康检查
- `GET /api/health` - 服务器状态

### 社团信息
- `GET /api/club-info` - 获取社团基本信息

### 活动管理
- `GET /api/activities` - 获取活动列表

### 成员管理
- `GET /api/members` - 获取成员列表

### 文章管理
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建新文章
- `POST /api/articles/:id/like` - 点赞文章
- `POST /api/articles/:id/comments` - 添加评论
- `POST /api/comments/:id/like` - 点赞评论

## 🛠️ 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (状态管理)
- React Router DOM
- React Markdown

### 后端
- Node.js
- Express.js
- SQLite (数据库)
- Better-SQLite3
- CORS
- Helmet (安全)
- Morgan (日志)

## 📦 安装依赖

```bash
npm install
```

## 🔧 开发命令

```bash
# 启动前端开发服务器
npm run dev

# 启动后端服务器
npm run server

# 同时启动前端和后端
npm run dev:full

# 构建前端
npm run build

# 启动生产环境
npm run start

# 数据库管理
node server/database/manage.js stats    # 查看数据库统计
node server/database/manage.js articles # 查看最新文章
node server/database/manage.js backup   # 备份数据库
./check-db.sh                          # 检查数据库状态
```

## 🌍 环境变量

创建 `.env` 文件：
```
NODE_ENV=development
PORT=3001
```

## 📝 功能特性

- ✅ 响应式设计
- ✅ 现代化UI
- ✅ 文章管理系统
- ✅ 用户注册/登录
- ✅ 评论系统
- ✅ Markdown支持
- ✅ 数学公式渲染
- ✅ 实时状态管理
- ✅ RESTful API
- ✅ 安全中间件

## 🚀 部署说明

1. 确保安装了Node.js (版本 >= 16)
2. 克隆项目到服务器
3. 运行 `./start.sh` 启动生产环境
4. 访问 http://localhost:3001

## 📞 联系方式

如有问题，请联系开发团队。

---
© 2024 AI社团官方网站
