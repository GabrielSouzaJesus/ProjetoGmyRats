'use client';

import { useState } from 'react';
// import { Search, Filter, TrendingUp, Users, Trophy, Calendar, Home, User, Settings } from 'lucide-react';

export default function ModernSidebar({ searchQuery, setSearchQuery, darkMode, members, selectedMember, setSelectedMember }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const navigationItems = [
    { icon: '🏠', label: 'Feed', active: true },
    { icon: '📈', label: 'Trending', active: false },
    { icon: '👥', label: 'Comunidade', active: false },
    { icon: '🏆', label: 'Desafios', active: false },
    { icon: '📅', label: 'Eventos', active: false },
    { icon: '👤', label: 'Perfil', active: false },
    { icon: '⚙️', label: 'Configurações', active: false },
  ];

  const topMembers = members
    .slice(0, 5)
    .sort((a, b) => (b.checkins_count || 0) - (a.checkins_count || 0));

  return (
    <div className={`h-full transition-all duration-300 ${
      isExpanded ? 'w-80' : 'w-20'
    } ${darkMode ? 'bg-gray-900' : 'bg-white'} border-r ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      
      {/* Header */}
      <div className={`p-4 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          {isExpanded && (
            <h1 className={`text-xl font-display ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Fitgram
            </h1>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              darkMode 
                ? 'hover:bg-gray-800 text-gray-400' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <div className={`w-4 h-4 border-2 border-current rounded transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}>
              <div className="w-2 h-2 border-r-2 border-b-2 border-current absolute top-0 left-0 transform rotate-45 translate-x-1 translate-y-1"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Search */}
      {isExpanded && (
        <div className="p-4">
          <div className="relative">
            <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar posts, pessoas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-4 py-2">
        {navigationItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 mb-1 ${
              item.active
                ? darkMode 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-50 text-blue-700'
                : darkMode 
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isExpanded && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Top Members */}
      {isExpanded && (
        <div className="px-4 py-4">
          <h3 className={`font-display font-medium mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Top Membros
          </h3>
          <div className="space-y-2">
            {topMembers.map((member, index) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${
                  selectedMember?.id === member.id
                    ? darkMode 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-50 text-purple-700'
                    : darkMode 
                      ? 'hover:bg-gray-800 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold ${
                    index < 3 ? 'ring-2 ring-yellow-400' : ''
                  }`}>
                    {member.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-display font-medium">{member.name || member.full_name}</p>
                  <p className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {member.checkins_count || 0} treinos
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {isExpanded && (
        <div className="px-4 py-4">
          <h3 className={`font-display font-medium mb-3 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Estatísticas Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl ${
              darkMode ? 'bg-gray-800' : 'bg-blue-50'
            }`}>
              <p className={`text-2xl font-bold ${
                darkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {members.length}
              </p>
              <p className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-blue-700'
              }`}>
                Membros
              </p>
            </div>
            <div className={`p-3 rounded-xl ${
              darkMode ? 'bg-gray-800' : 'bg-green-50'
            }`}>
              <p className={`text-2xl font-bold ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {members.reduce((total, m) => total + (m.checkins_count || 0), 0)}
              </p>
              <p className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-green-700'
              }`}>
                Treinos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 