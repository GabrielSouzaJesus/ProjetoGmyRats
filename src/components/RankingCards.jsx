import React, { useState } from 'react';
import { TrophyIcon, FireIcon, BoltIcon } from '@heroicons/react/24/solid';

const RankingCards = ({ members, checkins, checkInActivities = [] }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showVarietyModal, setShowVarietyModal] = useState(false);

  // Mapeamento de traduções para tipos de atividades
  const activityTranslations = {
    'strength_training': 'Musculação',
    'martial_arts': 'Artes Marciais',
    'core_training': 'Treino de Core',
    'elliptical': 'Elíptico',
    'running': 'Corrida',
    'cycling': 'Ciclismo',
    'swimming': 'Natação',
    'yoga': 'Yoga',
    'pilates': 'Pilates',
    'dance': 'Dança',
    'boxing': 'Boxe',
    'kickboxing': 'Kickboxing',
    'crossfit': 'CrossFit',
    'functional_training': 'Treino Funcional',
    'cardio': 'Cardio',
    'walking': 'Caminhada',
    'hiking': 'Trilha',
    'tennis': 'Tênis',
    'basketball': 'Basquete',
    'soccer': 'Futebol',
    'volleyball': 'Vôlei',
    'badminton': 'Badminton',
    'table_tennis': 'Tênis de Mesa',
    'golf': 'Golfe',
    'rowing': 'Remo',
    'skiing': 'Esqui',
    'snowboarding': 'Snowboard',
    'surfing': 'Surfe',
    'climbing': 'Escalada',
    'gymnastics': 'Ginástica',
    'weightlifting': 'Levantamento de Peso',
    'powerlifting': 'Powerlifting',
    'bodybuilding': 'Musculação',
    'calisthenics': 'Calistenia',
    'stretching': 'Alongamento',
    'meditation': 'Meditação',
    'hiit': 'HIIT',
    'zumba': 'Zumba',
    'spinning': 'Spinning',
    'aerobics': 'Aeróbica',
    'step': 'Step',
    'kickboxing': 'Kickboxing',
    'muay_thai': 'Muay Thai',
    'jiu_jitsu': 'Jiu-Jitsu',
    'karate': 'Karatê',
    'taekwondo': 'Taekwondo',
    'kung_fu': 'Kung Fu',
    'capoeira': 'Capoeira',
    'ballet': 'Balé',
    'jazz': 'Jazz',
    'contemporary': 'Contemporâneo',
    'hip_hop': 'Hip Hop',
    'salsa': 'Salsa',
    'bachata': 'Bachata',
    'merengue': 'Merengue',
    'forro': 'Forró',
    'samba': 'Samba',
    'axé': 'Axé',
    'funk': 'Funk',
    'reggaeton': 'Reggaeton',
    'pole_dance': 'Pole Dance',
    'aerial_yoga': 'Yoga Aéreo',
    'acro_yoga': 'Acro Yoga',
    'vinyasa': 'Vinyasa',
    'hatha': 'Hatha',
    'ashtanga': 'Ashtanga',
    'bikram': 'Bikram',
    'yin': 'Yin',
    'restorative': 'Restaurativo',
    'power': 'Power',
    'flow': 'Flow',
    'gentle': 'Suave',
    'beginner': 'Iniciante',
    'intermediate': 'Intermediário',
    'advanced': 'Avançado',
    'mixed': 'Misto',
    'other': 'Outro',
    'unknown': 'Desconhecido'
  };

  const translateActivity = (activity) => {
    const key = activity.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    return activityTranslations[key] || activity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Processar dados para rankings
  const calorieTotals = {};
  const activityTypes = {};

  checkins.forEach(checkin => {
    const memberId = checkin.account_id;
    const calories = parseFloat(checkin.calories) || 0;
    
    // Somar calorias
    if (calories > 0) {
      calorieTotals[memberId] = (calorieTotals[memberId] || 0) + calories;
    }
  });

  // Processar tipos de atividades
  checkInActivities.forEach(activity => {
    const memberId = activity.workout_id ? 
      checkins.find(c => c.id === activity.workout_id)?.account_id : null;
    
    if (memberId && activity.platform_activity) {
      if (!activityTypes[memberId]) {
        activityTypes[memberId] = new Set();
      }
      activityTypes[memberId].add(activity.platform_activity);
    }
  });

  // Criar rankings
  const calorieRanking = Object.entries(calorieTotals)
    .map(([memberId, calories]) => ({
      memberId,
      calories: Math.round(calories),
      member: members.find(m => String(m.id) === String(memberId))
    }))
    .filter(item => item.member)
    .sort((a, b) => b.calories - a.calories)
    .slice(0, 5);

  const varietyRanking = Object.entries(activityTypes)
    .map(([memberId, types]) => ({
      memberId,
      variety: types.size,
      activities: Array.from(types),
      member: members.find(m => String(m.id) === String(memberId))
    }))
    .filter(item => item.member)
    .sort((a, b) => b.variety - a.variety)
    .slice(0, 5);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2: return "bg-gradient-to-r from-gray-300 to-gray-400";
      case 3: return "bg-gradient-to-r from-amber-600 to-amber-800";
      default: return "bg-gradient-to-r from-blue-500 to-blue-600";
    }
  };

  const RankingCard = ({ title, subtitle, icon, iconColor, ranking, valueKey, valueFormatter, unit, emptyMessage, onItemClick }) => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className={`p-2 sm:p-3 ${iconColor} rounded-xl shadow-sm`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {ranking.length > 0 ? (
          ranking.map((item, index) => (
            <div 
              key={item.memberId} 
              className={`flex items-center space-x-2 sm:space-x-4 p-3 sm:p-4 rounded-xl transition-all duration-200 ${
                onItemClick ? 'hover:bg-gray-50 hover:shadow-md cursor-pointer' : 'hover:bg-gray-50'
              }`}
              onClick={() => onItemClick && onItemClick(item)}
            >
              <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md ${getRankColor(index + 1)}`}>
                {getRankIcon(index + 1)}
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 shadow-md">
                  {item.member.profile_picture_url ? (
                    <img 
                      src={item.member.profile_picture_url} 
                      alt={item.member.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                      {item.member.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                    {item.member.full_name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {valueFormatter ? valueFormatter(item[valueKey]) : item[valueKey]} {unit}
                  </p>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  {valueFormatter ? valueFormatter(item[valueKey]) : item[valueKey]}
                </div>
                <div className="text-xs text-gray-500 font-medium hidden sm:block">{unit}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );

  const VarietyModal = ({ isOpen, onClose, member, activities }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden border border-gray-100">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-azul-600 to-verde-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm flex-shrink-0 shadow-lg border-2 border-white/30">
                  {member?.profile_picture_url ? (
                    <img 
                      src={member.profile_picture_url} 
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-azul-400 to-verde-500 flex items-center justify-center text-white font-bold text-xl">
                      {member?.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {member?.full_name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                    <p className="text-white/90 font-medium">
                      {activities?.length || 0} tipos de atividades diferentes
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Conteúdo */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activities && activities.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-2 h-2 bg-gradient-to-r from-azul-600 to-verde-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-600">
                    {activities.length} atividades encontradas
                  </span>
                </div>
                {activities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:from-azul-50 hover:to-verde-50 hover:border-azul-200 transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-azul-500 to-verde-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <BoltIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-lg font-semibold text-gray-900 group-hover:text-azul-700 transition-colors">
                        {translateActivity(activity)}
                      </span>
                      <p className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors">
                        {activity}
                      </p>
                    </div>
                    <div className="text-azul-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-azul-100 to-verde-100 rounded-full flex items-center justify-center animate-pulse">
                  <BoltIcon className="w-10 h-10 text-azul-400" />
                </div>
                <p className="text-lg font-medium text-gray-600">Nenhuma atividade registrada</p>
                <p className="text-sm text-gray-400 mt-2">Este participante ainda não registrou atividades</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-azul-600 to-verde-600 text-white py-4 px-6 rounded-xl hover:from-azul-700 hover:to-verde-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Fechar</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleVarietyClick = (item) => {
    setSelectedMember(item.member);
    setShowVarietyModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Rankings principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingCard
          title="Mais Calorias"
          subtitle="Ranking de queima calórica"
          icon={<FireIcon className="h-6 w-6 text-orange-600" />}
          iconColor="bg-orange-100"
          ranking={calorieRanking}
          valueKey="calories"
          valueFormatter={(value) => value.toLocaleString()}
          unit="calorias"
          emptyMessage="Nenhuma caloria registrada ainda"
        />
        
        <RankingCard
          title="Mais Variedade"
          subtitle="Ranking de tipos de atividades"
          icon={<BoltIcon className="h-6 w-6 text-purple-600" />}
          iconColor="bg-purple-100"
          ranking={varietyRanking}
          valueKey="variety"
          unit="tipos"
          emptyMessage="Nenhuma variedade registrada ainda"
          onItemClick={handleVarietyClick}
        />
      </div>

      {/* Modal para mostrar variedades */}
      <VarietyModal
        isOpen={showVarietyModal}
        onClose={() => setShowVarietyModal(false)}
        member={selectedMember}
        activities={varietyRanking.find(item => item.member?.id === selectedMember?.id)?.activities}
      />
    </div>
  );
};

export default RankingCards; 