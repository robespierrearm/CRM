import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  FileText,
  Users,
  Bell,
  Calculator,
  Settings,
  LogOut,
  Menu,
  X,
  FolderOpen,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

const menuItems = [
  { path: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { 
    path: '/tenders', 
    label: 'Тендеры', 
    icon: FileText,
    hasSubmenu: true,
    submenu: [
      { path: '/tenders/new', label: 'Новые' },
      { path: '/tenders/review', label: 'На рассмотрении' },
      { path: '/tenders/in-progress', label: 'В работе' },
      { path: '/tenders/archive', label: 'Архив' },
    ]
  },
  { path: '/suppliers', label: 'Поставщики', icon: Users },
  { path: '/reminders', label: 'Напоминания', icon: Bell },
  { path: '/accounting', label: 'Бухгалтерия', icon: Calculator },
  { path: '/files', label: 'Файлы', icon: FolderOpen },
  { path: '/admin', label: 'Админ-панель', icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { tenders } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tendersExpanded, setTendersExpanded] = useState(
    location.pathname.startsWith('/tenders')
  );
  
  // Подсчет тендеров для каждой категории
  const tenderCounts = {
    new: tenders.filter(t => t.status === 'Новый').length,
    review: tenders.filter(t => t.status === 'Подано' || t.status === 'Рассмотрение').length,
    inProgress: tenders.filter(t => t.status === 'Победа' || t.status === 'В работе').length,
    archive: tenders.filter(t => t.status === 'Завершён - Оплачен' || t.status === 'Проигран').length,
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-40 px-4 py-3 flex items-center justify-between">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 group"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <FileText className="h-3.5 w-3.5 text-white" />
          </div>
          <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CRM Тендеры
          </h1>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white border-r w-64 z-50 transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <Link 
            to="/dashboard" 
            className="p-4 border-b hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CRM Тендеры
              </h1>
            </div>
            <p className="text-xs text-gray-500 ml-10 group-hover:text-blue-600 transition-colors">{user?.username}</p>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.hasSubmenu && location.pathname.startsWith('/tenders'));
              
              if (item.hasSubmenu) {
                return (
                  <div key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        setTendersExpanded(!tendersExpanded);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTendersExpanded(!tendersExpanded);
                        }}
                        className="p-1 hover:bg-blue-100 rounded"
                      >
                        {tendersExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </Link>
                    {tendersExpanded && item.submenu && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.submenu.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          let count = 0;
                          if (subItem.path === '/tenders/new') count = tenderCounts.new;
                          else if (subItem.path === '/tenders/review') count = tenderCounts.review;
                          else if (subItem.path === '/tenders/in-progress') count = tenderCounts.inProgress;
                          else if (subItem.path === '/tenders/archive') count = tenderCounts.archive;
                          
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                'flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-colors',
                                isSubActive
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50'
                              )}
                            >
                              <span>{subItem.label}</span>
                              <span className="text-xs text-gray-400">({count})</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Выйти
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
