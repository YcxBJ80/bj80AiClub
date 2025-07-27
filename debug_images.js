import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 调试图片路径和访问...');

// 检查上传目录
const uploadsDir = path.join(__dirname, 'server', 'uploads', 'articles');
console.log('📁 上传目录:', uploadsDir);

if (fs.existsSync(uploadsDir)) {
  console.log('✅ 上传目录存在');
  
  // 列出所有文章目录
  const articleDirs = fs.readdirSync(uploadsDir);
  console.log('📂 文章目录:', articleDirs);
  
  articleDirs.forEach(articleId => {
    const articleDir = path.join(uploadsDir, articleId);
    if (fs.statSync(articleDir).isDirectory()) {
      console.log(`\n📁 文章 ${articleId}:`);
      const images = fs.readdirSync(articleDir);
      images.forEach(imageName => {
        const imagePath = path.join(articleDir, imageName);
        const stats = fs.statSync(imagePath);
        
        // 测试URL编码
        const encodedName = encodeURIComponent(imageName);
        const serverPath = `/api/uploads/articles/${articleId}/${encodedName}`;
        
        console.log(`  📷 ${imageName}`);
        console.log(`    - 文件大小: ${Math.round(stats.size / 1024)}KB`);
        console.log(`    - 编码后名称: ${encodedName}`);
        console.log(`    - 服务器路径: ${serverPath}`);
        console.log(`    - 本地路径: ${imagePath}`);
        
        // 检查文件是否可读
        try {
          fs.accessSync(imagePath, fs.constants.R_OK);
          console.log(`    - ✅ 文件可读`);
        } catch (error) {
          console.log(`    - ❌ 文件不可读: ${error.message}`);
        }
      });
    }
  });
} else {
  console.log('❌ 上传目录不存在');
}

// 测试URL编码的中文文件名
const testFilenames = [
  '截屏2025-07-21 02.19.27.png',
  '截屏2025-07-21 03.05.20.png',
  '截屏2025-07-22 10.15.15.png'
];

console.log('\n🧪 测试URL编码:');
testFilenames.forEach(filename => {
  const encoded = encodeURIComponent(filename);
  const decoded = decodeURIComponent(encoded);
  console.log(`  原始: ${filename}`);
  console.log(`  编码: ${encoded}`);
  console.log(`  解码: ${decoded}`);
  console.log(`  匹配: ${filename === decoded ? '✅' : '❌'}`);
  console.log('');
});