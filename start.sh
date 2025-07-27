#!/bin/bash

echo "�� 启动AI社团网站服务器..."

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 初始化数据库
echo "🗄️ 初始化数据库..."
node server/database/init.js

# 构建前端
echo "🔨 构建前端..."
npm run build

# 设置生产环境
export NODE_ENV=production

# 启动服务器
echo "🌐 启动服务器..."
echo "📍 网站地址: http://localhost:3001"
echo "📊 API健康检查: http://localhost:3001/api/health"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

node server/index.js
