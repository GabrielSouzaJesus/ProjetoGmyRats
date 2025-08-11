'use client';

// import { Bell, Plus, MessageCircle, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function ModernHeader({ darkMode, setDarkMode, currentUser, setShowStories, recentMedia }) {
  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-900/95 backdrop-blur-md border-gray-700' 
        : 'bg-white/95 backdrop-blur-md border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo e Nome */}
          <div className="flex items-center space-x-4">
            {/* Botão de Voltar */}
            <a 
              href="/" 
              className={`p-2 rounded-full transition-all duration-200 ${
                darkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Voltar ao Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </a>
            
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className={`text-2xl font-display bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${
              darkMode ? 'hidden md:block' : 'hidden md:block'
            }`}>
              Fitgram
            </h1>
          </div>

          {/* Barra de Busca Central */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar no Fitgram..."
                className={`w-full pl-4 pr-10 py-2 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className={`w-2 h-2 rounded-full ${
                  darkMode ? 'bg-blue-400' : 'bg-blue-500'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Ações do Usuário */}
          <div className="flex items-center space-x-4">
            
            {/* Botão de Stories */}
            {recentMedia.length > 0 && (
              <button
                onClick={() => setShowStories(true)}
                className={`relative p-2 rounded-full transition-all duration-200 ${
                  darkMode 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                  {recentMedia.length > 9 ? '9+' : recentMedia.length}
                </div>
                <span className="sr-only">Ver stories</span>
              </button>
            )}

            {/* Botão de Notificações */}
            <button className={`relative p-2 rounded-full transition-all duration-200 ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}>
              🔔
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>

            {/* Botão de Mensagens */}
            <button className={`relative p-2 rounded-full transition-all duration-200 ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}>
              💬
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
            </button>

            {/* Botão de Criar */}
            <button className={`p-2 rounded-full transition-all duration-200 ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}>
              ➕
            </button>

            {/* Toggle de Tema */}
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

            {/* Avatar do Usuário */}
            <button className={`p-2 rounded-full transition-all duration-200 ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de Scroll */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    </header>
  );
} 