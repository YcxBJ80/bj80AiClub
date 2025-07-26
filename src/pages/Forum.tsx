import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, User, PlusCircle, Loader2, Heart, MessageCircle, Send, ArrowUp, ArrowDown, Reply, X } from 'lucide-react';
import MarkdownEditor, { MarkdownEditorRef } from '../components/MarkdownEditor';
import { useArticleStore, Comment } from '../store/useArticleStore';
import { cn } from '../lib/utils';
import 'highlight.js/styles/github.css';

const Forum = () => {
  const { 
    selectedArticle, 
    selectArticle, 
    clearSelection, 
    likeArticle, 
    addComment, 
    likeComment, 
    currentUser,
    sortBy,
    setSortBy,
    getSortedArticles
  } = useArticleStore();
  const [leftWidth, setLeftWidth] = useState(30); // 左侧宽度百分比
  const [isDragging, setIsDragging] = useState(false);
  const [isMarkdownLoading, setIsMarkdownLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [commentSortBy, setCommentSortBy] = useState<'hot' | 'time'>('hot');
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  
  const articles = getSortedArticles();

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // 限制宽度范围在20%-80%之间
      const clampedWidth = Math.max(20, Math.min(80, newLeftWidth));
      setLeftWidth(clampedWidth);
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLikeArticle = () => {
    if (selectedArticle) {
      likeArticle(selectedArticle.id);
    }
  };

  const handleAddComment = () => {
    if (selectedArticle && commentContent.trim()) {
      addComment(selectedArticle.id, commentContent.trim(), replyTo || undefined);
      setCommentContent('');
      setReplyTo(null);
    }
  };

  const handleLikeComment = (commentId: string) => {
    if (selectedArticle) {
      likeComment(selectedArticle.id, commentId);
    }
  };

  const getSortedComments = (comments: Comment[]): Comment[] => {
    const sortedComments = [...comments].sort((a, b) => {
      if (commentSortBy === 'hot') {
        return b.likes - a.likes;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return sortedComments.map(comment => ({
      ...comment,
      replies: comment.replies ? getSortedComments(comment.replies) : undefined
    }));
  };

  // 递归计算所有层级回复的总数
  const getTotalRepliesCount = (comment: Comment): number => {
    if (!comment.replies || comment.replies.length === 0) {
      return 0;
    }
    
    let total = comment.replies.length;
    comment.replies.forEach(reply => {
      total += getTotalRepliesCount(reply);
    });
    
    return total;
  };

  // 计算文章的总评论数（包含所有嵌套回复）
  const getTotalCommentsCount = (comments: Comment[]): number => {
    let total = comments.length;
    comments.forEach(comment => {
      total += getTotalRepliesCount(comment);
    });
    return total;
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isLiked = comment.likedBy.includes(currentUser);
    const maxDepth = 3;
    const showAllReplies = expandedReplies[comment.id] || false;
    
    const handleCommentClick = (e: React.MouseEvent) => {
      // 如果点击的是点赞按钮，不触发回复
      if ((e.target as HTMLElement).closest('button')) {
        return;
      }
      // 只有在深度小于最大深度时才允许回复
      if (depth < maxDepth) {
        setReplyTo(comment.id);
      }
    };
    
    // 处理回复显示逻辑 - 默认折叠所有回复
    const replies = comment.replies || [];
    const totalRepliesCount = getTotalRepliesCount(comment);
    const hasReplies = replies.length > 0;
    const displayedReplies = showAllReplies ? replies : [];
    
    return (
      <div key={comment.id} className={cn('border-l-2 border-gray-100', depth > 0 && 'ml-4 pl-4')}>
        <div 
          className={cn(
            'bg-gray-50 rounded p-4 mb-3 transition-colors',
            depth < maxDepth && 'cursor-pointer hover:bg-gray-100'
          )}
          onClick={handleCommentClick}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{comment.author}</span>
              <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
          </div>
          <p className="text-gray-700 mb-3">{comment.content}</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLikeComment(comment.id);
              }}
              className={cn(
                'flex items-center space-x-1 text-sm transition-colors',
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              )}
            >
              <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
              <span>{comment.likes}</span>
            </button>
          </div>
          {replyTo === comment.id && (
            <div className="mt-3 p-3 bg-white rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">回复 {comment.author}:</span>
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="写下你的回复..."
                className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={!commentContent.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>发送</span>
                </button>
              </div>
            </div>
          )}
        </div>
        {hasReplies && (
          <div className="space-y-2">
            {displayedReplies.map(reply => renderComment(reply, depth + 1))}
            <div className="ml-4 pl-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedReplies(prev => ({
                    ...prev,
                    [comment.id]: !showAllReplies
                  }));
                }}
                className="text-blue-500 hover:text-blue-600 text-sm transition-colors"
              >
                {showAllReplies 
                  ? `收起回复 (${totalRepliesCount})` 
                  : `展开回复 (${totalRepliesCount})`
                }
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const editorRef = useRef<MarkdownEditorRef>(null);

  // 处理Markdown内容加载
  useEffect(() => {
    if (selectedArticle) {
      setIsMarkdownLoading(true);
      // 模拟异步渲染延迟
      const timer = setTimeout(() => {
        setIsMarkdownLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedArticle?.id]);

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">论坛</h1>
              <p className="text-gray-600 mt-1">分享你的AI学习心得和项目经验</p>
            </div>
            <Link
              to="/publish"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center space-x-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>发布文章</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex flex-1 relative overflow-hidden"
      >
        {/* Left Panel - Article List */}
        <div 
          className="bg-white border-r border-gray-200 overflow-y-auto"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                文章列表 ({articles.length})
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortBy('time')}
                  className={cn(
                    'px-3 py-1 rounded text-sm transition-colors',
                    sortBy === 'time'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  时间
                </button>
                <button
                  onClick={() => setSortBy('hot')}
                  className={cn(
                    'px-3 py-1 rounded text-sm transition-colors',
                    sortBy === 'hot'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  热度
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => selectArticle(article.id)}
                  className={cn(
                    'p-4 rounded border cursor-pointer transition-all hover:shadow-md',
                    selectedArticle?.id === article.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex space-x-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(article.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3" />
                          <span>{article.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{getTotalCommentsCount(article.comments)}</span>
                        </div>
                      </div>
                    </div>
                    {article.coverImage && (
                      <div className="flex-shrink-0">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="w-16 h-12 object-cover rounded border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div
          className={cn(
            'w-1 bg-gray-300 cursor-col-resize hover:bg-blue-500 transition-colors relative group',
            isDragging && 'bg-blue-500'
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
        </div>

        {/* Right Panel - Article Content */}
        <div 
          className="bg-white overflow-y-auto"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {selectedArticle ? (
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedArticle.title}
                </h1>
                <div className="flex items-center text-gray-500 space-x-6">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{selectedArticle.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(selectedArticle.createdAt)}</span>
                  </div>
                </div>
              </div>
              {/* 文章内容区域 - 固定高度和滚动 */}
              <div className="bg-white rounded shadow-sm border border-gray-100" style={{ height: 'calc(100vh - 350px)', overflow: 'hidden' }}>
                {isMarkdownLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-gray-500">正在渲染内容...</span>
                  </div>
                ) : (
                  <MarkdownEditor
                    ref={editorRef}
                    value={selectedArticle.content}
                    mode="PREVIEW"
                    className="h-full"
                  />
                )}
              </div>
              
              {/* 文章交互区域 */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-end items-center space-x-3">
                  <button
                    onClick={handleLikeArticle}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-1.5 rounded-sm transition-colors',
                      selectedArticle.likedBy.includes(currentUser)
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    )}
                  >
                    <Heart className={cn(
                      'h-4 w-4',
                      selectedArticle.likedBy.includes(currentUser) && 'fill-current'
                    )} />
                    <span>{selectedArticle.likes}</span>
                  </button>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-sm bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{getTotalCommentsCount(selectedArticle.comments)}</span>
                  </button>
                </div>
              </div>
              
              {/* 评论悬浮框 */}
              {showComments && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowComments(false)}>
                  <div className="bg-white rounded shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        评论 ({getTotalCommentsCount(selectedArticle.comments)})
                      </h3>
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCommentSortBy('hot')}
                            className={cn(
                              'px-3 py-1 rounded text-sm transition-colors',
                              commentSortBy === 'hot'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            热度
                          </button>
                          <button
                            onClick={() => setCommentSortBy('time')}
                            className={cn(
                              'px-3 py-1 rounded text-sm transition-colors',
                              commentSortBy === 'time'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            )}
                          >
                            时间
                          </button>
                        </div>
                        <button
                          onClick={() => setShowComments(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6 max-h-[75vh] overflow-y-auto">
                      {/* 添加评论 */}
                      {!replyTo && (
                        <div className="mb-6 p-4 bg-gray-50 rounded">
                          <textarea
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="写下你的评论..."
                            className="w-full p-3 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                          />
                          <div className="flex justify-end mt-3">
                            <button
                              onClick={handleAddComment}
                              disabled={!commentContent.trim()}
                              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded transition-colors flex items-center space-x-2"
                            >
                              <Send className="h-4 w-4" />
                              <span>发表评论</span>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* 评论列表 */}
                      <div className="space-y-4">
                        {getSortedComments(selectedArticle.comments).map(comment => renderComment(comment))}
                      </div>
                      
                      {selectedArticle.comments.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>还没有评论，来发表第一条评论吧！</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  选择一篇文章开始阅读
                </h3>
                <p className="text-gray-500">
                  点击左侧文章列表中的任意文章来查看详细内容
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;