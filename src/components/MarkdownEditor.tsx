import React, { useImperativeHandle, forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  mode?: 'PREVIEW' | 'SOURCE';
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface MarkdownEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
  clearContent: () => void;
  switchViewMode: (mode?: 'PREVIEW' | 'SOURCE') => void;
  focus: () => void;
  blur: () => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>((
  { value = '', onChange, mode = 'SOURCE', placeholder = '', className = '', style },
  ref
) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getContent: () => value,
    setContent: (content: string) => {
      if (onChange) {
        onChange(content);
      }
    },
    clearContent: () => {
      if (onChange) {
        onChange('');
      }
    },
    switchViewMode: (newMode?: 'PREVIEW' | 'SOURCE') => {
      // 模式切换由父组件处理
    },
    focus: () => textareaRef.current?.focus(),
    blur: () => textareaRef.current?.blur()
  }), [value, onChange]);

  // 调试：检查内容中的图片（移到条件渲染外部）
  React.useEffect(() => {
    if (mode === 'PREVIEW' && value) {
      const imageMatches = value.match(/!\[.*?\]\([^)]+\)/g);
      console.log('MarkdownEditor预览模式 - 发现的图片引用:', imageMatches);
      
      const base64Images = value.match(/!\[.*?\]\(data:image\/[^)]+\)/g);
      console.log('MarkdownEditor预览模式 - base64图片数量:', base64Images ? base64Images.length : 0);
      
      if (base64Images) {
        base64Images.forEach((img, index) => {
          const dataUrlMatch = img.match(/data:image\/[^)]+/);
          if (dataUrlMatch) {
            const dataUrl = dataUrlMatch[0];
            console.log(`图片 ${index + 1}: ${dataUrl.substring(0, 100)}...`);
          }
        });
      }
    }
  }, [mode, value]);

  if (mode === 'PREVIEW') {
    
    return (
      <div 
        className={`markdown-content ${className}`}
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          padding: '1rem',
          overflow: 'auto',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.33rem',
          ...style
        }}
      >
        {value ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeKatex]}
            components={{
              img: ({node, ...props}: any) => {
                console.log('ReactMarkdown渲染图片:', {
                  alt: props.alt,
                  src: props.src?.substring(0, 100) + '...',
                  srcLength: props.src?.length,
                  isBase64: props.src?.startsWith('data:image/')
                });
                return (
                  <img 
                    {...props} 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '2px'
                    }}
                    onLoad={() => {
                      console.log('✅ 图片加载成功:', props.alt);
                    }}
                    onError={(e: any) => {
                      console.error('❌ 图片加载失败:', {
                        alt: props.alt,
                        src: props.src?.substring(0, 100) + '...',
                        error: e.target?.error || e
                      });
                    }}
                  />
                );
              }
            }}
          >
            {value}
          </ReactMarkdown>
        ) : (
          <div className="text-gray-500 italic">
            暂无内容，请在编辑模式下输入文章内容
          </div>
        )}
      </div>
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-full resize-none border-0 focus:outline-none focus:ring-0 font-mono text-sm ${className}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '0.33rem',
        padding: '1rem',
        ...style
      }}
    />
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';

export default MarkdownEditor;