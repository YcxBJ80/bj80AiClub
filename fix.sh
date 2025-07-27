#!/bin/bash

echo "🔧 修复AI社团网站问题..."

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 重新初始化数据库
echo "🗄️ 重新初始化数据库..."
node server/database/init.js

# 3. 检查数据库
echo "🔍 检查数据库结构..."
node -e "
import Database from 'better-sqlite3';
const db = new Database('./server/database/ai_club.db');
console.log('用户表结构:');
console.log(db.prepare('PRAGMA table_info(users)').all());
console.log('文章表结构:');
console.log(db.prepare('PRAGMA table_info(articles)').all());
db.close();
"

echo "✅ 修复完成！现在可以启动项目了："
echo "npm run dev:full"