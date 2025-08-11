import React from 'react';
import Link from 'next/link';

export default function LeftSidebar({ searchQuery, setSearchQuery, darkMode }) {
  const navItems = [
    { icon: '🏠', label: 'Página inicial', active: true },
    { icon: '🔍', label: 'Pesquisa', active: false },
    { icon: '🧭', label: 'Explorar', active: false },
    { icon: '▶️', label: 'Reels', active: false },
    { icon: '💬', label: 'Mensagens', active: false, badge: 3 },
    { icon: '❤️', label: 'Notificações', active: false },
    { icon: '➕', label: 'Criar', active: false },
    { icon: '📊', label: 'Painel', active: false },
    { icon: '👤', label: 'Perfil', active: false },
    { icon: '☰', label: 'Mais', active: false }
  ];

  return (
    <div className={`hidden lg:block w-64 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} h-screen fixed left-0 top-0 p-4 border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">FitGram</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar pessoas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-black placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item, index) => (
          <div key={index} className="relative">
            <button
              className={`w-full flex items-center space-x-4 px-3 py-2 rounded-lg transition-colors ${
                item.active 
                  ? darkMode ? 'bg-gray-800' : 'bg-gray-100'
                  : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {item.badge}
                </span>
              )}
            </button>
          </div>
        ))}
      </nav>

      {/* Back to Dashboard */}
      <div className="mt-8 pt-8 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center space-x-4 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-blue-400"
        >
          <span className="text-xl">⬅️</span>
          <span className="text-sm font-medium">Voltar ao Dashboard</span>
        </Link>
      </div>
    </div>
  );
} 