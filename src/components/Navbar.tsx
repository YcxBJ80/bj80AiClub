import { Link, useLocation } from 'react-router-dom';
import { Brain, MessageSquare, PlusCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '首页', icon: Brain },
    { path: '/forum', label: '论坛', icon: MessageSquare },
    { path: '/publish', label: '发布', icon: PlusCircle },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors">
            <Brain className="h-8 w-8" />
            <span className="text-xl font-bold">AI社团</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-1 px-3 py-2 rounded text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;