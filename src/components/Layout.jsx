'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/temporal-analysis', label: 'Análise Temporal', icon: '📈' },
    { href: '/gallery', label: 'FitGram', icon: '📸' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 overflow-x-hidden">
      <header className="bg-white shadow-sm px-2 sm:px-4 lg:px-8 py-2 sm:py-3 lg:py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            {/* Título e informação móvel */}
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-sm sm:text-base lg:text-xl font-semibold truncate">Desafio GymRats</h1>
              <span className="text-xs text-gray-500 sm:hidden">🕒 60 dias</span>
            </div>
            
            {/* Navegação */}
            <nav className="flex justify-center sm:justify-start space-x-1 sm:space-x-2 lg:space-x-4 w-full sm:w-auto overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 whitespace-nowrap text-xs sm:text-sm lg:text-base flex-shrink-0 ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm sm:text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* Informação adicional - visível apenas em telas maiores */}
            <span className="hidden lg:block text-sm text-gray-500 whitespace-nowrap">🕒 60 dias de energia total</span>
          </div>
        </div>
      </header>
      <main className="px-2 sm:px-4 lg:px-12 py-2 sm:py-4 lg:py-8 overflow-x-hidden">{children}</main>
    </div>
  );
}