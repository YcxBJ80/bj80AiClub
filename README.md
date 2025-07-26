# 高中AI社团网站

一个现代化的高中AI社团官方网站，提供社团介绍、论坛交流和文章发布功能。

## 🚀 功能特性

- **首页展示**：社团介绍、活动展示、成员风采
- **论坛系统**：文章发布、浏览、点赞、评论功能
- **Markdown编辑器**：支持实时预览的文章编辑
- **图片上传**：支持图片上传和多种引用格式
- **响应式设计**：适配桌面端和移动端
- **暗色主题**：支持明暗主题切换

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **状态管理**：Zustand
- **路由管理**：React Router
- **Markdown渲染**：ReactMarkdown + 相关插件
- **图标库**：Lucide React

## 📦 安装和运行

### 环境要求

- Node.js >= 18.0.0
- npm 或 pnpm

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发环境

```bash
npm run dev
# 或
pnpm dev
```

访问 `http://localhost:5173` 查看网站

### 构建生产版本

```bash
npm run build
# 或
pnpm build
```

### 预览生产版本

```bash
npm run preview
# 或
pnpm preview
```

## 📁 项目结构

```
src/
├── components/          # 可复用组件
│   ├── Empty.tsx       # 空状态组件
│   ├── MarkdownEditor.tsx  # Markdown编辑器
│   └── Navbar.tsx      # 导航栏
├── hooks/              # 自定义Hooks
│   └── useTheme.ts     # 主题管理
├── pages/              # 页面组件
│   ├── Home.tsx        # 首页
│   ├── Forum.tsx       # 论坛页面
│   └── Publish.tsx     # 文章发布页面
├── store/              # 状态管理
│   └── useArticleStore.ts  # 文章数据管理
├── lib/                # 工具库
│   └── utils.ts        # 通用工具函数
├── App.tsx             # 应用主组件
├── main.tsx            # 应用入口
└── router.tsx          # 路由配置
```

## 🎨 主要功能

### 论坛系统

- 文章列表展示，支持按时间、热度排序
- 文章详情查看，支持点赞和评论
- Markdown格式文章编辑和发布
- 图片上传和多种引用格式支持

### Markdown编辑器

- 实时预览功能
- 支持标准Markdown语法
- 支持数学公式渲染（KaTeX）
- 支持代码高亮
- 支持图片拖拽上传

### 响应式设计

- 移动端友好的界面设计
- 自适应布局
- 触摸友好的交互体验

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 项目Issues：[GitHub Issues](https://github.com/your-username/ai-club-website/issues)
- 邮箱：your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！
