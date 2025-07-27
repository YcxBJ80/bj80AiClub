#!/bin/bash

echo "🔍 检查数据库状态..."

# 检查数据库文件是否存在
if [ -f "server/database/ai_club.db" ]; then
    echo "✅ 数据库文件存在"
    echo "📁 位置: server/database/ai_club.db"
    echo "📏 大小: $(du -h server/database/ai_club.db | cut -f1)"
else
    echo "❌ 数据库文件不存在"
    echo "🔄 正在初始化数据库..."
    node server/database/init.js
fi

echo ""
echo "📊 数据库统计信息:"
node server/database/manage.js stats

echo ""
echo "🌐 测试API连接..."
if curl --noproxy localhost -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ API服务器运行正常"
    echo "📝 文章数量: $(curl --noproxy localhost -s http://localhost:3001/api/articles | jq 'length')"
else
    echo "❌ API服务器未运行"
    echo "💡 请运行 ./start.sh 启动服务器"
fi
