# 部署指南

本项目支持多种部署方式，以下是常见的部署平台配置说明。

## Vercel 部署（推荐）

1. 将项目推送到 GitHub
2. 在 [Vercel](https://vercel.com) 注册账号
3. 连接 GitHub 仓库
4. 选择项目进行部署
5. Vercel 会自动检测为 Vite 项目并配置构建设置

### 构建配置
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Netlify 部署

1. 将项目推送到 GitHub
2. 在 [Netlify](https://netlify.com) 注册账号
3. 连接 GitHub 仓库
4. 配置构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 重定向配置
在 `public` 目录下创建 `_redirects` 文件：
```
/*    /index.html   200
```

## GitHub Pages 部署

1. 安装 gh-pages 包：
```bash
npm install --save-dev gh-pages
```

2. 在 `package.json` 中添加部署脚本：
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://your-username.github.io/ai-club-website"
}
```

3. 构建并部署：
```bash
npm run build
npm run deploy
```

## 自定义服务器部署

1. 构建项目：
```bash
npm run build
```

2. 将 `dist` 目录内容上传到服务器

3. 配置 Web 服务器（如 Nginx）支持 SPA 路由：
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 环境变量

如果需要配置环境变量，在项目根目录创建 `.env` 文件：
```
VITE_API_URL=https://your-api-url.com
VITE_APP_TITLE=高中AI社团网站
```

## 性能优化建议

1. **代码分割**：考虑使用动态导入来减少初始包大小
2. **图片优化**：使用 WebP 格式和适当的压缩
3. **CDN**：使用 CDN 加速静态资源加载
4. **缓存策略**：配置适当的缓存头

## 监控和分析

建议集成以下工具：
- Google Analytics 或其他分析工具
- 错误监控（如 Sentry）
- 性能监控工具

---

如有部署问题，请查看项目的 [Issues](https://github.com/your-username/ai-club-website/issues) 或联系维护者。