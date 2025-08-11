'use client';

import { useState } from 'react';
// import { Play, Pause, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ModernStories({ 
  recentMedia, 
  getCheckinInfo, 
  getMemberInfo, 
  setSelectedMember, 
  setShowStories, 
  setCurrentStoryIndex, 
  darkMode, 
  currentUser 
}) {
  const [currentStory, setCurrentStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  if (!recentMedia.length) return null;

  const currentMedia = recentMedia[currentStory];
  const checkin = getCheckinInfo(currentMedia.workout_id);
  const member = checkin ? getMemberInfo(checkin.account_id) : null;
  const isVideo = currentMedia.medium_type?.includes('video');

  const nextStory = () => {
    if (currentStory < recentMedia.length - 1) {
      setCurrentStory(currentStory + 1);
      setProgress(0);
    } else {
      setShowStories(false);
    }
  };

  const prevStory = () => {
    if (currentStory > 0) {
      setCurrentStory(currentStory - 1);
      setProgress(0);
    }
  };

  const closeStories = () => {
    setShowStories(false);
    setCurrentStory(0);
    setProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="relative w-full max-w-md h-full max-h-[600px] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
        
        {/* Header com progress bar */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          {/* Progress bars */}
          <div className="flex space-x-1 mb-4">
            {recentMedia.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index === currentStory ? 'bg-white' : 'bg-white bg-opacity-30'
                }`}
              >
                {index === currentStory && (
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Header info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {member?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-white font-display font-medium">
                  {member?.name || member?.full_name || 'Participante'}
                </h3>
                <p className="text-white text-opacity-70 text-sm">
                  {new Date(currentMedia.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <button
              onClick={closeStories}
              className="p-2 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-200"
            >
              <span className="text-xl text-white">✕</span>
            </button>
          </div>
        </div>

        {/* Mídia */}
        <div className="relative w-full h-full">
          {isVideo ? (
            <video
              src={currentMedia.url}
              poster={currentMedia.thumbnail_url}
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <img
              src={currentMedia.url}
              alt="Story"
              className="w-full h-full object-cover"
            />
          )}

          {/* Controles de navegação */}
          <button
            onClick={prevStory}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-200 ${
              currentStory === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={currentStory === 0}
          >
            <span className="text-2xl text-white">◀</span>
          </button>

          <button
            onClick={nextStory}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-200"
          >
            <span className="text-2xl text-white">▶</span>
          </button>

          {/* Controle de play/pause para vídeos */}
          {isVideo && (
            <button
              onClick={() => {
                const video = document.querySelector('video');
                if (video) {
                  if (isPlaying) {
                    video.pause();
                  } else {
                    video.play();
                  }
                }
              }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-4 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200"
            >
              {isPlaying ? (
                <span className="text-2xl text-white">⏸</span>
              ) : (
                <span className="text-2xl text-white">▶</span>
              )}
            </button>
          )}
        </div>

        {/* Footer com informações */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/50 to-transparent">
          <div className="text-white">
            {checkin && (
              <div className="mb-2">
                <span className="text-sm bg-green-500 px-2 py-1 rounded-full">
                  💪 Treino realizado
                </span>
              </div>
            )}
            <p className="text-sm text-white text-opacity-90">
              {currentMedia.medium_type?.split('/')[1]?.toUpperCase() || 'MEDIA'}
              {currentMedia.exif_location_latitude && ' • 📍 Com localização'}
            </p>
          </div>
        </div>

        {/* Indicador de posição */}
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 px-3 py-1 rounded-full">
          <span className="text-white text-sm">
            {currentStory + 1} / {recentMedia.length}
          </span>
        </div>
      </div>
    </div>
  );
} 