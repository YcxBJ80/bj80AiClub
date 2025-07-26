import { create } from 'zustand';

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  likedBy: string[];
  parentId?: string; // 用于回复功能
  replies?: Comment[];
}

export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  images?: {[key: string]: string};
  coverImage?: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

interface ArticleStore {
  articles: Article[];
  selectedArticle: Article | null;
  currentUser: string;
  sortBy: 'time' | 'hot';
  addArticle: (article: Omit<Article, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'likedBy' | 'comments'>) => void;
  selectArticle: (id: string) => void;
  clearSelection: () => void;
  likeArticle: (articleId: string) => void;
  addComment: (articleId: string, content: string, parentId?: string) => void;
  likeComment: (articleId: string, commentId: string) => void;
  setSortBy: (sortBy: 'time' | 'hot') => void;
  getSortedArticles: () => Article[];
}

export const useArticleStore = create<ArticleStore>((set, get) => ({
  articles: [
    {
      id: '1',
      title: 'AI社团成立公告',
      content: '# AI社团成立公告\n\n欢迎大家加入我们的AI社团！我们致力于探索人工智能的奥秘，分享学习心得，共同进步。\n\n## 社团目标\n\n- 学习AI基础知识\n- 分享项目经验\n- 组织技术讨论\n\n让我们一起在AI的世界中探索前进！',
      author: '社团管理员',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      likes: 15,
      likedBy: ['user1', 'user2', 'user3'],
      comments: [
        {
          id: 'c1',
          content: '太棒了！期待社团的发展！',
          author: '李同学',
          createdAt: '2024-01-15T11:00:00Z',
          likes: 5,
          likedBy: ['user1', 'user2'],
          replies: [
            {
              id: 'c1-r1',
              content: '我也很期待！',
              author: '王同学',
              createdAt: '2024-01-15T11:30:00Z',
              likes: 2,
              likedBy: ['user1'],
              parentId: 'c1'
            }
          ]
        }
      ],
    },
    {
      id: '2',
      title: '机器学习入门指南',
      content: '# 机器学习入门指南\n\n机器学习是人工智能的一个重要分支，本文将为大家介绍机器学习的基本概念。\n\n## 什么是机器学习\n\n机器学习是一种让计算机通过数据学习规律的方法，而不需要明确编程。\n\n## 主要类型\n\n1. **监督学习**：有标签的数据训练\n2. **无监督学习**：无标签数据中发现模式\n3. **强化学习**：通过奖励机制学习\n\n```python\n# 简单的线性回归示例\nfrom sklearn.linear_model import LinearRegression\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\npredictions = model.predict(X_test)\n```',
      author: '张同学',
      createdAt: '2024-01-16T14:30:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
      likes: 8,
      likedBy: ['user1', 'user3'],
      comments: [
        {
          id: 'c2',
          content: '很好的入门教程！',
          author: '陈同学',
          createdAt: '2024-01-16T15:00:00Z',
          likes: 3,
          likedBy: ['user1', 'user2', 'user3'],
        }
      ],
    },
    {
      id: '3',
      title: 'Markdown语法测试文章',
      content: `# Markdown语法测试文章

这是一篇用于测试各种Markdown语法的文章。

## 文本样式

**加粗文本** 和 __另一种加粗__

*斜体文本* 和 _另一种斜体_

***粗斜体文本*** 和 ___另一种粗斜体___

~~删除线文本~~

## 标题层级

### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 列表

### 有序列表
1. 第一项
2. 第二项
   1. 子项 1
   2. 子项 2
3. 第三项

### 无序列表
- 项目 1
* 项目 2
  - 子项目 A
  - 子项目 B
+ 项目 3

### 任务列表
- [x] 完成 Markdown 学习
- [ ] 练习使用表格
- [ ] 尝试代码块语法

## 链接和图片

这是一个 [链接示例](https://example.com "点击访问")

![示例图片](https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20landscape%20with%20mountains%20and%20lake&image_size=landscape_4_3 "这是一张示例图片")

## 引用

> 一级引用
>> 二级引用（嵌套）
> 回到一级引用

## 代码

行内代码：\`console.log('Hello World')\`

代码块：
\`\`\`javascript
function hello() {
  console.log("Hello Markdown");
  return "success";
}
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

## 表格

| 姓名 | 年龄 | 职业 |
| :--- | :--: | ---: |
| 张三 | 25   | 程序员 |
| 李四 | 30   | 设计师 |
| 王五 | 28   | 产品经理 |

## 数学公式

行内数学：$E = mc^2$

块级数学：
$$\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n$$

## 分割线

---

## 脚注

这是一个需要注释的内容[^1]。

这里还有另一个脚注[^note]。

[^1]: 这里是脚注的详细说明。
[^note]: 这是另一个脚注的说明。

---

以上就是常用的Markdown语法示例！`,
      author: 'Markdown测试员',
      createdAt: '2024-01-17T09:00:00Z',
      updatedAt: '2024-01-17T09:00:00Z',
      likes: 12,
      likedBy: ['user1', 'user2'],
      comments: [
        {
          id: 'c3',
          content: '很全面的Markdown语法展示！',
          author: '语法爱好者',
          createdAt: '2024-01-17T10:00:00Z',
          likes: 4,
          likedBy: ['user1', 'user2', 'user3'],
        }
      ],
    },
  ],
  selectedArticle: null,
  currentUser: 'user1', // 模拟当前用户
  sortBy: 'time',
  addArticle: (articleData) => {
    const newArticle: Article = {
      ...articleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: [],
    };
    set((state) => ({
      articles: [newArticle, ...state.articles],
    }));
  },
  selectArticle: (id) => {
    const article = get().articles.find((a) => a.id === id);
    set({ selectedArticle: article || null });
  },
  clearSelection: () => {
    set({ selectedArticle: null });
  },
  likeArticle: (articleId) => {
    const { currentUser } = get();
    set((state) => ({
      articles: state.articles.map((article) => {
        if (article.id === articleId) {
          const isLiked = article.likedBy.includes(currentUser);
          return {
            ...article,
            likes: isLiked ? article.likes - 1 : article.likes + 1,
            likedBy: isLiked
              ? article.likedBy.filter((id) => id !== currentUser)
              : [...article.likedBy, currentUser],
          };
        }
        return article;
      }),
      selectedArticle: state.selectedArticle?.id === articleId
        ? state.articles.find((a) => a.id === articleId) || null
        : state.selectedArticle,
    }));
  },
  addComment: (articleId, content, parentId) => {
    const { currentUser } = get();
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: currentUser,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      parentId,
    };

    set((state) => {
      const updatedArticles = state.articles.map((article) => {
        if (article.id === articleId) {
          if (parentId) {
            // 添加回复
            const updateComments = (comments: Comment[]): Comment[] => {
              return comments.map((comment) => {
                if (comment.id === parentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newComment],
                  };
                }
                if (comment.replies) {
                  return {
                    ...comment,
                    replies: updateComments(comment.replies),
                  };
                }
                return comment;
              });
            };
            return {
              ...article,
              comments: updateComments(article.comments),
            };
          } else {
            // 添加新评论
            return {
              ...article,
              comments: [...article.comments, newComment],
            };
          }
        }
        return article;
      });
      
      // 同时更新selectedArticle
      const updatedSelectedArticle = state.selectedArticle?.id === articleId
        ? updatedArticles.find((a) => a.id === articleId) || null
        : state.selectedArticle;
      
      return {
        articles: updatedArticles,
        selectedArticle: updatedSelectedArticle,
      };
    });
  },
  likeComment: (articleId, commentId) => {
    const { currentUser } = get();
    
    const updateCommentLikes = (comments: Comment[]): Comment[] => {
      return comments.map((comment) => {
        if (comment.id === commentId) {
          const isLiked = comment.likedBy.includes(currentUser);
          return {
            ...comment,
            likes: isLiked ? comment.likes - 1 : comment.likes + 1,
            likedBy: isLiked
              ? comment.likedBy.filter((id) => id !== currentUser)
              : [...comment.likedBy, currentUser],
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentLikes(comment.replies),
          };
        }
        return comment;
      });
    };

    set((state) => ({
      articles: state.articles.map((article) => {
        if (article.id === articleId) {
          return {
            ...article,
            comments: updateCommentLikes(article.comments),
          };
        }
        return article;
      }),
    }));
  },
  setSortBy: (sortBy) => {
    set({ sortBy });
  },
  getSortedArticles: () => {
    const { articles, sortBy } = get();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (sortBy === 'hot') {
      return [...articles].sort((a, b) => {
        // 计算近一周的点赞数
        const aRecentLikes = new Date(a.createdAt) > oneWeekAgo ? a.likes : 0;
        const bRecentLikes = new Date(b.createdAt) > oneWeekAgo ? b.likes : 0;
        return bRecentLikes - aRecentLikes;
      });
    } else {
      return [...articles].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  },
}));