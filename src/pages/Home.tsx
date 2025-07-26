import { Link } from 'react-router-dom';
import { Brain, ArrowRight } from 'lucide-react';

export default function Home() {

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Brain className="h-20 w-20 text-blue-200" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              高中AI社团
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              探索人工智能的奥秘，分享学习心得，共同成长。我们致力于为高中生提供一个学习AI技术、交流经验的平台。
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/forum"
                className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-6 rounded transition-colors flex items-center space-x-2"
              >
                <span>进入论坛</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/publish"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-3 px-6 rounded transition-colors"
              >
                发布文章
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                关于我们
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                我们的AI社团成立于2024年，致力于为高中生提供一个学习和交流人工智能技术的平台。
                社团汇聚了对AI技术充满热情的同学们，大家在这里分享学习心得、讨论技术问题、合作完成项目。
              </p>
              <p className="text-lg text-gray-600 mb-8">
                无论你是AI初学者还是有一定基础的同学，都能在这里找到适合自己的学习内容和合作伙伴。
                让我们一起在AI的世界中探索前进！
              </p>
              <Link
                to="/forum"
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded transition-colors"
              >
                <span>加入讨论</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded p-8 w-full max-w-md">
                <div className="text-center">
                  <Brain className="h-24 w-24 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    AI社团
                  </h3>
                  <p className="text-gray-600">
                    探索 · 学习 · 分享 · 成长
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}