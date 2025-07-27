#!/bin/bash

echo "🚀 启动AI社团网站开发环境..."

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

# 启动开发环境
echo "🌐 启动开发环境..."
echo "📍 前端地址: http://localhost:5173"
echo "📍 后端API: http://localhost:3001"
echo "🛑 按 Ctrl+C 停止服务器"
echo ""

# 同时启动前端和后端
npm run dev:full
