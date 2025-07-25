// src/components/QuickStats.jsx
export default function QuickStats({ media = [], comments = [], reactions = [], checkins = [], diasDesafio = 1 }) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 text-center transition hover:scale-105 hover:shadow-indigo-300/40 animate-fade-in">
          <div className="text-2xl font-bold">{media.length}</div>
          <div className="text-xs text-gray-500">Fotos/Vídeos</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 text-center transition hover:scale-105 hover:shadow-indigo-300/40 animate-fade-in">
          <div className="text-2xl font-bold">{comments.length}</div>
          <div className="text-xs text-gray-500">Comentários</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 text-center transition hover:scale-105 hover:shadow-indigo-300/40 animate-fade-in">
          <div className="text-2xl font-bold">{reactions.length}</div>
          <div className="text-xs text-gray-500">Reações</div>
        </div>
        <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 text-center transition hover:scale-105 hover:shadow-indigo-300/40 animate-fade-in">
          <div className="text-2xl font-bold">{Math.round(checkins.length / diasDesafio)}</div>
          <div className="text-xs text-gray-500">Média Check-ins/dia</div>
        </div>
      </div>
    );
  }