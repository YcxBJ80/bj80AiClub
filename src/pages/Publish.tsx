import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Eye, EyeOff, Save, Image, X, Edit, Send, FileText, Info } from 'lucide-react';
import { useArticleStore } from '../store/useArticleStore';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import MarkdownEditor, { MarkdownEditorRef } from '../components/MarkdownEditor';

const Publish = () => {
  const navigate = useNavigate();
  const { addArticle } = useArticleStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  
  // 实时处理图片引用的函数
  const processImageReferences = (content: string) => {
    if (!content || Object.keys(uploadedImages).length === 0) {
      return content;
    }
    
    let processedContent = content;
    console.log('🔍 处理图片引用 - 原始内容长度:', content.length);
    console.log('🔍 可用图片:', Object.keys(uploadedImages));
    
    Object.entries(uploadedImages).forEach(([fileName, dataUrl]) => {
      const patterns = [
        `![[${fileName}]]`,
        `![](${fileName})`,
        `![alt](${fileName})`,
        `![](./images/${fileName})`,
        `![](./${fileName})`,
        `![[${fileName.replace(/\.[^/.]+$/, '')}]]`
      ];
      
      patterns.forEach(pattern => {
        if (processedContent.includes(pattern)) {
          console.log(`🔄 替换图片引用: ${pattern} -> base64`);
          processedContent = processedContent.replace(
            new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
            `![${fileName}](${dataUrl})`
          );
        }
      });
    });
    
    const base64Count = (processedContent.match(/data:image\/[^)]+/g) || []).length;
    console.log('✅ 处理完成，base64图片数量:', base64Count);
    
    return processedContent;
  };
  const [author, setAuthor] = useState('');
  const [editorMode, setEditorMode] = useState<'SOURCE' | 'PREVIEW'>('SOURCE');
  const editorRef = useRef<MarkdownEditorRef>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<{[key: string]: string}>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');

  const handleFileUpload = (files: FileList) => {
    const markdownFiles = Array.from(files).filter(file => 
      file.type === 'text/markdown' || file.name.endsWith('.md')
    );
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (markdownFiles.length === 0 && imageFiles.length === 0) {
      toast.error('请上传 .md 文件或图片文件');
      return;
    }

    // 处理 Markdown 文件
    if (markdownFiles.length > 0) {
      const mdFile = markdownFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setContent(fileContent);
        
        // 尝试从文件内容中提取标题
        const lines = fileContent.split('\n');
        const titleLine = lines.find(line => line.startsWith('# '));
        if (titleLine && !title) {
          setTitle(titleLine.replace('# ', '').trim());
        }
        
        toast.success('Markdown 文件上传成功！');
      };
      reader.readAsText(mdFile);
    }

    // 处理图片文件
    if (imageFiles.length > 0) {
      handleImageUpload(imageFiles);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    setIsProcessingImages(true);
    const newImageFiles = [...imageFiles, ...files];
    setImageFiles(newImageFiles);
    
    let processedCount = 0;
    const totalFiles = files.length;
    
    try {
      for (const file of files) {
        await new Promise<void>((resolve, reject) => {
          compressImage(file, (compressedDataUrl) => {
            console.log(`图片上传成功: ${file.name}, 大小: ${Math.round(compressedDataUrl.length / 1024)}KB`);
            setUploadedImages(prev => ({
              ...prev,
              [file.name]: compressedDataUrl
            }));
            processedCount++;
            resolve();
          });
        });
      }
      
      console.log('所有图片处理完成，当前上传的图片:', Object.keys(uploadedImages));
      toast.success(`成功处理 ${totalFiles} 张图片！`);
    } catch (error) {
      toast.error('图片处理失败，请重试');
      console.error('Image processing error:', error);
    } finally {
      setIsProcessingImages(false);
    }
  };

  const removeImage = (fileName: string) => {
    setImageFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadedImages(prev => {
      const newImages = { ...prev };
      delete newImages[fileName];
      return newImages;
    });
    toast.success('图片已移除');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(Array.from(files));
    }
  };

  // 图片压缩函数
  const compressImage = (file: File, callback: (dataUrl: string) => void) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    
    img.onload = () => {
      // 设置最大尺寸
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      // 计算缩放比例
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 转换为base64，质量设为0.8
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      callback(compressedDataUrl);
    };
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCoverImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    // 使用压缩函数处理封面图
    compressImage(file, (compressedDataUrl) => {
      setCoverImage(compressedDataUrl);
      toast.success('封面图上传成功！');
    });
  };

  const removeCoverImage = () => {
    setCoverImage('');
    toast.success('封面图已移除');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('请输入文章标题');
      return;
    }
    
    if (!content.trim()) {
      toast.error('请输入文章内容');
      return;
    }
    
    if (!author.trim()) {
      toast.error('请输入作者姓名');
      return;
    }

    // 处理内容中的图片引用
    console.log('📝 提交时处理图片引用');
    const processedContent = processImageReferences(content.trim());

    addArticle({
      title: title.trim(),
      content: processedContent,
      author: author.trim(),
      images: uploadedImages,
      coverImage: coverImage || undefined,
    });
    
    toast.success('文章发布成功！');
    navigate('/forum');
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">发布文章</h1>
              <p className="text-gray-600 mt-1">分享你的AI学习心得和项目经验</p>
            </div>
            <button
              type="submit"
              form="publish-form"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>发布文章</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="publish-form" onSubmit={handleSubmit} className="min-h-[calc(100vh-12rem)]">
          <div className="flex min-h-full space-x-6">
            {/* Left Panel - Article Info & File Upload */}
            <div className="w-1/3 space-y-6">
              {/* Article Information */}
              <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">文章信息</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      文章标题 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入文章标题"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                      作者姓名 *
                    </label>
                    <input
                      type="text"
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请输入作者姓名"
                      required
                    />
                  </div>
                  
                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      封面图 (可选)
                    </label>
                    {coverImage ? (
                      <div className="relative inline-block">
                        <img
                          src={coverImage}
                          alt="封面图预览"
                          className="w-full h-32 object-cover rounded border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-gray-400 transition-colors">
                        <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">上传封面图</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleCoverImageUpload(file);
                          }}
                          className="hidden"
                          id="cover-image-input"
                        />
                        <label
                          htmlFor="cover-image-input"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm cursor-pointer transition-colors"
                        >
                          选择图片
                        </label>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      封面图将显示在文章列表中，建议尺寸 16:9
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">上传文件</h2>
                <div
                  className={cn(
                    'border-2 border-dashed rounded p-6 text-center transition-colors',
                    isDragOver
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    拖拽文件到此处，或点击选择文件
                  </p>
                  <div className="flex justify-center space-x-3 mb-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors flex items-center space-x-2 text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      <span>选择 Markdown</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isProcessingImages}
                      className={cn(
                        "px-3 py-2 rounded transition-colors flex items-center space-x-2 text-sm",
                        isProcessingImages
                          ? "bg-gray-400 cursor-not-allowed text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      )}
                    >
                      {isProcessingImages ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>处理中...</span>
                        </>
                      ) : (
                        <>
                          <Image className="h-4 w-4" />
                          <span>选择图片</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    支持 Markdown 文件 (.md) 和图片文件 (jpg, png, gif, webp)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".md,.markdown"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    multiple
                  />
                </div>
              </div>

          {/* Uploaded Images */}
          {imageFiles.length > 0 && (
            <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">已上传的图片</h2>
              <div className="grid grid-cols-2 gap-2">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                      <img
                        src={uploadedImages[file.name]}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(file.name)}
                      className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate" title={file.name}>
                      {file.name.length > 10 ? file.name.substring(0, 10) + '...' : file.name}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded">
                <p className="text-xs text-blue-800">
                  <strong>使用提示：</strong>在 Markdown 中可以使用以下格式来引用图片：
                </p>
                <div className="text-xs text-blue-600 mt-2 space-y-1">
                  <p>• 标准格式：<code>![描述](文件名)</code></p>
                  <p>• Obsidian格式：<code>![[文件名]]</code></p>
                  <p>• 相对路径：<code>![描述](./文件名)</code></p>
                </div>
              </div>
            </div>
          )}

            </div>

            {/* Right Panel - Content Editor & Preview */}
            <div className="w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col min-h-[600px]">
              {/* Header with mode toggles */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">文章内容</h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditorMode('SOURCE');
                      setPreviewContent(''); // 清空预览内容
                      editorRef.current?.switchViewMode('SOURCE');
                    }}
                    className={cn(
                      "py-2 px-3 rounded-lg transition-colors flex items-center space-x-2 text-sm",
                      editorMode === 'SOURCE'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    <span>源码模式</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!content.trim()) {
                        toast.error('请先输入内容再预览');
                        return;
                      }
                      
                      console.log('🔍 预览模式 - 开始处理图片引用');
                      const processedContent = processImageReferences(content);
                      setPreviewContent(processedContent);
                      setEditorMode('PREVIEW');
                      editorRef.current?.switchViewMode('PREVIEW');
                    }}
                    className={cn(
                      "py-2 px-3 rounded-lg transition-colors flex items-center space-x-2 text-sm",
                      editorMode === 'PREVIEW'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    <Eye className="h-4 w-4" />
                    <span>预览模式</span>
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-4 overflow-hidden">
                <MarkdownEditor
                  ref={editorRef}
                  value={editorMode === 'PREVIEW' ? (previewContent || processImageReferences(content)) : content}
                  onChange={setContent}
                  mode={editorMode}
                  placeholder="请输入 Markdown 格式的文章内容...\n\n示例：\n# 标题\n\n这是一段正文内容。\n\n## 二级标题\n\n- 列表项 1\n- 列表项 2\n\n```python\nprint('Hello, AI!')\n```"
                  className="h-full"
                  style={{height: 'calc(100vh - 400px)', maxHeight: 'calc(100vh - 400px)'}}
                />
              </div>
            </div>
          </div>


        </form>
      </div>
    </div>
  );
};

export default Publish;