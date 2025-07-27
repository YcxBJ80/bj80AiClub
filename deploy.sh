#!/bin/bash

echo "🚀 开始部署AI社团网站..."

# 设置环境变量
export NODE_ENV=production

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建前端
echo "🔨 构建前端..."
npm run build

# 启动服务器
echo "🌐 启动服务器..."
npm run server
