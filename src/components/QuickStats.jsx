// src/components/QuickStats.jsx
export default function QuickStats({ media = [], comments = [], reactions = [], checkins = [], challenge = null, members = [], teams = [] }) {
    const cardColors = [
      'from-azul-600 to-verde-600',
      'from-verde-600 to-laranja-600',
      'from-laranja-600 to-azul-600',
      'from-azul-600 to-verde-600'
    ];

    const cardIcons = ['📸', '💬', '❤️', '👥'];

    // Calcula participantes ativos (que fizeram pelo menos 1 check-in)
    const getParticipantesAtivos = () => {
      const participantesComCheckins = new Set();
      checkins.forEach(checkin => {
        participantesComCheckins.add(String(checkin.account_id));
      });
      return participantesComCheckins.size;
    };

    const participantesAtivos = getParticipantesAtivos();

    const stats = [
      {
        value: checkins.length,
        label: 'Total Check-ins',
        icon: '🏃',
        color: 'from-azul-600 to-verde-600',
        description: 'Atividades registradas'
      },
      {
        value: participantesAtivos,
        label: 'Participantes Ativos',
        icon: '👥',
        color: 'from-verde-600 to-laranja-600',
        description: 'Membros engajados'
      },
      {
        value: teams.length,
        label: 'Equipes',
        icon: '🏆',
        color: 'from-laranja-600 to-azul-600',
        description: 'Times organizados'
      },
      {
        value: Math.round((participantesAtivos / members.length) * 100),
        label: 'Taxa de Participação',
        icon: '📊',
        color: 'from-azul-600 to-verde-600',
        description: 'Percentual de ativos',
        suffix: '%'
      }
    ];

    return (
      <div className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 hover:border-verde-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-verde-600/20 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Background decorativo */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-r from-verde-600/10 to-azul-600/10 rounded-full -translate-y-8 translate-x-8 animate-float"></div>
              
              <div className="relative z-10">
                {/* Ícone */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white text-xl">{stat.icon}</span>
                  </div>
                  <div className="text-right">
                    <div className="w-2 h-2 bg-verde-600 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Valor */}
                <div className="mb-2">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-verde-600 group-hover:to-azul-600 transition-all duration-500">
                    {stat.value.toLocaleString()}{stat.suffix || ''}
                  </div>
                </div>

                {/* Label */}
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                    {stat.label}
                  </h3>
                </div>

                {/* Descrição */}
                <div>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                    {stat.description}
                  </p>
                </div>

                {/* Indicador de crescimento */}
                <div className="mt-4 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-verde-600 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-azul-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-1 h-1 bg-laranja-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Tempo real</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }