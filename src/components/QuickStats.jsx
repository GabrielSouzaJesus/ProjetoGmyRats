// src/components/QuickStats.jsx
export default function QuickStats({ media = [], comments = [], reactions = [], checkins = [], diasDesafio = 1 }) {
    const cardColors = [
      'border-azul-600',
      'border-verde-600',
      'border-laranja-600',
      'border-azul-600'
    ];
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className={`bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 text-center transition hover:scale-105 hover:shadow-azul-600/40 animate-fade-in ${cardColors[0]}`}>
          <div className="text-2xl font-bold">{media.length}</div>
          <div className="text-xs text-gray-500">Fotos/Vídeos</div>
        </div>
        <div className={`bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 text-center transition hover:scale-105 hover:shadow-verde-600/40 animate-fade-in ${cardColors[1]}`}>
          <div className="text-2xl font-bold">{comments.length}</div>
          <div className="text-xs text-gray-500">Comentários</div>
        </div>
        <div className={`bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 text-center transition hover:scale-105 hover:shadow-laranja-600/40 animate-fade-in ${cardColors[2]}`}>
          <div className="text-2xl font-bold">{reactions.length}</div>
          <div className="text-xs text-gray-500">Reações</div>
        </div>
        <div className={`bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 text-center transition hover:scale-105 hover:shadow-azul-600/40 animate-fade-in ${cardColors[3]}`}>
          <div className="text-2xl font-bold">{Math.round(checkins.length / diasDesafio)}</div>
          <div className="text-xs text-gray-500">Média Check-ins/dia</div>
        </div>
      </div>
    );
  }