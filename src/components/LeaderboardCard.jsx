import { useState } from "react";
import { corrigirFusoHorario } from "../lib/utils";

function getMemberScoreWithRules(memberId, checkins, checkInActivities) {
  // 1. Filtra todos os check-ins do membro
  const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));

  // 2. Agrupa os check-ins por data (ex: "2024-06-20")
  const checkinsByDay = {};

  memberCheckIns.forEach(checkin => {
    // Corrige o fuso horário para contabilizar corretamente
    const date = corrigirFusoHorario(checkin.occurred_at || checkin.created_at || "");
    if (!date) return;
    if (!checkinsByDay[date]) checkinsByDay[date] = [];
    checkinsByDay[date].push(checkin);
  });

  let total = 0;

  // 3. Para cada dia, aplica a regra
  Object.values(checkinsByDay).forEach(dayCheckins => {
    let diaTemColetivo = false;
    let diaTemIndividual = false;

    for (const checkin of dayCheckins) {
      // Busca atividades desse check-in
      const activities = checkInActivities.filter(a => String(a.workout_id) === String(checkin.id));

      // Calcula duração
      let durationMinutes = 0;
      if (checkin.duration) {
        durationMinutes = Number(checkin.duration);
      } else if (activities.length > 0) {
        durationMinutes = activities.reduce((sum, a) => sum + (Number(a.duration_millis) || 0), 0) / 1000 / 60;
      }

      // Verifica se é coletivo
      const isColetivo = (checkin.description && checkin.description.includes("#coletivo")) ||
                         (checkin.notes && checkin.notes.includes("#coletivo")) ||
                         (checkin.hashtag && checkin.hashtag.includes("#coletivo")) ||
                         (checkin.tags && checkin.tags.includes("#coletivo"));

      if (isColetivo && durationMinutes >= 40) {
        diaTemColetivo = true;
        break; // já achou coletivo, não precisa olhar mais nada no dia
      } else if (durationMinutes >= 40) {
        diaTemIndividual = true;
      }
    }

    // Prioriza coletivo
    if (diaTemColetivo) {
      total += 3;
    } else if (diaTemIndividual) {
      total += 1;
    }
    // Se não teve treino válido, não soma nada
  });

  return total;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LeaderboardCard({ members = [], checkins = [], checkInActivities = [] }) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  
  // Loga os dados recebidos
  console.log("LeaderboardCard - members:", members);
  console.log("LeaderboardCard - checkins:", checkins);
  console.log("LeaderboardCard - checkInActivities:", checkInActivities);

  function getMemberScore(memberId, checkins, checkInActivities) {
    const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));
    console.log(`memberId: ${memberId} | memberCheckIns:`, memberCheckIns);

    let total = 0;
    memberCheckIns.forEach(checkin => {
      const activities = checkInActivities.filter(a => String(a.workout_id) === String(checkin.id));
      console.log(`checkin.id: ${checkin.id} | activities:`, activities);
      activities.forEach(a => {
        total += Number(a.points) || 0;
      });
    });
    console.log(`memberId: ${memberId} | total:`, total);
    return total;
  }

  const allRanking = members
    .map(m => ({
      ...m,
      total: getMemberScoreWithRules(m.id, checkins, checkInActivities)
    }))
    .filter(m => m.total > 0)
    .filter(m => !search || (m.name || m.full_name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.total) - Number(a.total));

  const ranking = showAllParticipants ? allRanking : allRanking.slice(0, 10);
  const maiorPontuacao = allRanking.length > 0 ? allRanking[0].total : 0;

  function getCheckinsByDay(memberId) {
    const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));
    const byDay = {};
    memberCheckIns.forEach(checkin => {
      // Corrige o fuso horário para contabilizar corretamente
      const date = corrigirFusoHorario(checkin.occurred_at || checkin.created_at || "");
      if (!date) return;
      if (!byDay[date]) byDay[date] = [];
      byDay[date].push(checkin);
    });
    // Para cada dia, soma os pontos conforme a regra
    return Object.entries(byDay).map(([date, dayCheckins]) => {
      let diaTemColetivo = false;
      let diaTemIndividual = false;
      for (const checkin of dayCheckins) {
        const activities = checkInActivities.filter(a => String(a.workout_id) === String(checkin.id));
        let durationMinutes = 0;
        if (checkin.duration) {
          durationMinutes = Number(checkin.duration);
        } else if (activities.length > 0) {
          durationMinutes = activities.reduce((sum, a) => sum + (Number(a.duration_millis) || 0), 0) / 1000 / 60;
        }
        const isColetivo =
          (checkin.description && checkin.description.includes("#coletivo")) ||
          (checkin.notes && checkin.notes.includes("#coletivo")) ||
          (checkin.hashtag && checkin.hashtag.includes("#coletivo")) ||
          (checkin.tags && checkin.tags.includes("#coletivo")) ||
          (checkin.title && checkin.title.includes("#coletivo"));
        if (isColetivo && durationMinutes >= 40) {
          diaTemColetivo = true;
          break;
        } else if (durationMinutes >= 40) {
          diaTemIndividual = true;
        }
      }
      let pontos = 0;
      if (diaTemColetivo) pontos = 3;
      else if (diaTemIndividual) pontos = 1;
      return { date, pontos, checkins: dayCheckins };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  function formatDateBR(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Classificação Individual</h2>
          <p className="text-gray-600 text-sm">Ranking dos participantes</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-verde-600 to-azul-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {allRanking.length} participantes
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar participante..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azul-600 focus:border-transparent transition-all"
          autoComplete="off"
        />
      </div>

      {/* Top 3 Podium */}
      {ranking.length >= 3 && !search && !showAllParticipants && (
        <div className="mb-6">
          <div className="flex items-end justify-center space-x-2 mb-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                {getInitials(ranking[1]?.name || ranking[1]?.full_name || '')}
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-sm font-semibold text-gray-700">{ranking[1]?.name || ranking[1]?.full_name || 'Participante'}</div>
                <div className="text-lg font-bold text-gray-900">{ranking[1]?.total} pts</div>
              </div>
            </div>
            
            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
                {getInitials(ranking[0]?.name || ranking[0]?.full_name || '')}
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-3 text-center min-w-[100px] text-white">
                <div className="text-sm font-semibold">{ranking[0]?.name || ranking[0]?.full_name || 'Participante'}</div>
                <div className="text-lg font-bold">{ranking[0]?.total} pts</div>
              </div>
            </div>
            
            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-700 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                {getInitials(ranking[2]?.name || ranking[2]?.full_name || '')}
              </div>
              <div className="bg-orange-100 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-sm font-semibold text-orange-700">{ranking[2]?.name || ranking[2]?.full_name || 'Participante'}</div>
                <div className="text-lg font-bold text-orange-900">{ranking[2]?.total} pts</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="space-y-3">
        {ranking.map((m, i) => (
          <div
            key={m.id}
            className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:bg-white transition-all cursor-pointer group ${
              i < 3 && !search && !showAllParticipants ? 'hidden' : ''
            }`}
            onClick={() => setSelectedMember(m)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  i === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                  'bg-gradient-to-r from-azul-600 to-verde-600'
                }`}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : getInitials(m.name || m.full_name || `P${m.id}`)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate" title={m.name || m.full_name || `Participante ${m.id}`}>
                    {m.name || m.full_name || `Participante ${m.id}`}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {i + 1}º lugar
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-4 py-2 rounded-full text-white font-bold text-sm ${
                  m.total >= 15 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  m.total >= 10 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' :
                  m.total >= 5 ? 'bg-gradient-to-r from-azul-600 to-verde-600' :
                  'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}>
                  {m.total} pontos
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show All Participants Button */}
      {!showAllParticipants && allRanking.length > 10 && !search && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAllParticipants(true)}
            className="bg-gradient-to-r from-verde-600 to-azul-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-verde-700 hover:to-azul-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Visualizar todos os participantes ({allRanking.length})
          </button>
        </div>
      )}

      {/* Show Less Button */}
      {showAllParticipants && !search && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAllParticipants(false)}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
          >
            Mostrar apenas top 10
          </button>
        </div>
      )}

      {/* Audit Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-verde-600 to-azul-600 text-white p-4 sm:p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg sm:text-xl font-bold">
                      {getInitials(selectedMember.name || selectedMember.full_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold truncate">
                      Auditoria de {selectedMember.name || selectedMember.full_name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      Total: {selectedMember.total} pontos
                    </p>
                  </div>
                </div>
                <button
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  onClick={() => setSelectedMember(null)}
                  title="Fechar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 max-h-[65vh] sm:max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {getCheckinsByDay(selectedMember.id).map((dia, index) => (
                  <div key={dia.date} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          dia.pontos === 3 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' : 'bg-gradient-to-r from-azul-600 to-verde-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {formatDateBR(dia.date)}
                          </h4>
                          {/* Removida a data completa para evitar confusão */}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-white font-bold text-sm ${
                          dia.pontos === 3 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' : 'bg-gradient-to-r from-azul-600 to-verde-600'
                        }`}>
                          {dia.pontos} {dia.pontos === 1 ? 'ponto' : 'pontos'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {dia.checkins.map((checkin, idx) => (
                        <div key={checkin.id} className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-1">
                                {checkin.title || checkin.description || `Check-in ${idx + 1}`}
                              </p>
                              {checkin.notes && (
                                <p className="text-sm text-gray-600">{checkin.notes}</p>
                              )}
                            </div>
                            <div className="ml-3 text-right">
                              <div className="text-xs text-gray-500">
                                {checkin.duration ? `${Math.round(checkin.duration)}min` : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}