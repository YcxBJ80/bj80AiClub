# AI社团网站后端服务

## 快速开始

### 开发环境
```bash
# 启动前端开发服务器
npm run dev

# 启动后端服务器
npm run server

# 同时启动前端和后端（推荐）
npm run dev:full
```

### 生产环境
```bash
# 一键部署
./deploy.sh

# 或者手动部署
npm run start
```

## API接口

### 健康检查
- GET `/api/health`
- 返回服务器状态信息

### 社团信息
- GET `/api/club-info`
- 返回社团基本信息

### 活动列表
- GET `/api/activities`
- 返回社团活动列表

### 成员列表
- GET `/api/members`
- 返回社团成员信息

## 环境变量

- `NODE_ENV`: 环境模式 (development/production)
- `PORT`: 服务器端口 (默认: 3001)

## 访问地址

- 前端: http://localhost:5173 (开发) / http://localhost:3001 (生产)
- 后端API: http://localhost:3001/api
- 健康检查: http://localhost:3001/api/health
