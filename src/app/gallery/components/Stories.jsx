import React from 'react';

export default function Stories({ 
  recentMedia, 
  getCheckinInfo, 
  getMemberInfo, 
  setSelectedMember, 
  setShowStories, 
  setCurrentStoryIndex, 
  darkMode, 
  currentUser 
}) {
  const uniqueMembers = [...new Set(recentMedia.map(m => {
    const checkin = getCheckinInfo(m.workout_id);
    return checkin ? checkin.account_id : null;
  }))].filter(id => id !== null);

  if (uniqueMembers.length === 0) return null;

  return (
    <div className={`${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-b p-4`}>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {/* Seu story */}
        <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
          <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            <div className={`w-full h-full rounded-full ${darkMode ? 'bg-black' : 'bg-white'} p-0.5`}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {currentUser.name[0].toUpperCase()}
              </div>
            </div>
          </div>
          <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} truncate max-w-16`}>
            Seu story
          </span>
        </div>

        {uniqueMembers.slice(0, 10).map((memberId, index) => {
          const member = getMemberInfo(memberId);
          const memberMedia = recentMedia.filter(m => {
            const checkin = getCheckinInfo(m.workout_id);
            return checkin && String(checkin.account_id) === String(memberId);
          });

          return (
            <div 
              key={memberId}
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
              onClick={() => {
                setSelectedMember(member);
                setShowStories(true);
                setCurrentStoryIndex(0);
              }}
            >
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                <div className={`w-full h-full rounded-full ${darkMode ? 'bg-black' : 'bg-white'} p-0.5`}>
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {(member.name || member.full_name || '?')[0].toUpperCase()}
                  </div>
                </div>
              </div>
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} truncate max-w-16`}>
                {member.name || member.full_name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 