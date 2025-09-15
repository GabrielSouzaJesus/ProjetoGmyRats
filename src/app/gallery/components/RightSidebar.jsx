import React from 'react';

export default function RightSidebar({ members, darkMode, currentUser }) {
  const suggestions = members.slice(0, 5);

  return (
    <div className={`hidden lg:block w-80 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} h-screen fixed right-0 top-0 p-4 border-l ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      {/* Current User */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
          {currentUser.name[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{currentUser.name}</p>
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.fullName}</p>
        </div>
        <button className="text-blue-400 text-xs font-semibold">Mudar</button>
      </div>

      {/* Suggestions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sugestões para você</h3>
          <button className={`text-xs ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Ver tudo</button>
        </div>
        
        <div className="space-y-3">
          {suggestions.map((member, index) => (
            <div key={member.id} className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {(member.name || member.full_name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{member.name || member.full_name}</p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Seguido(a) por outros</p>
              </div>
              <button className="text-blue-400 text-xs font-semibold">Seguir</button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} space-y-2`}>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sobre</a>
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ajuda</a>
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Imprensa</a>
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>API</a>
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Carreiras</a>
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Privacidade</a>
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Termos</a>
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Localizações</a>
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Idioma</a>
          <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Meta Verified</a>
        </div>
        <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>© 2025 FITGRAM FROM DESEMPENHO</p>
      </div>

      {/* Floating Message Bar */}
      <div className={`absolute bottom-4 right-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-3 shadow-lg`}>
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Mensagens</span>
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
        </div>
        <div className="flex space-x-1 mt-2">
          {suggestions.slice(0, 3).map((member, index) => (
            <div key={index} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {(member.name || member.full_name || '?')[0].toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 