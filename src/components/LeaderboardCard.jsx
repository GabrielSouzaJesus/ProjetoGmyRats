import { useState, useEffect } from "react";
import { corrigirFusoHorario } from "../lib/utils";
import ActivityModal from './ActivityModal';

function getMemberScoreWithRules(memberId, checkins, checkInActivities, manualActivities = []) {
  // IMPORTANTE: Nova regra de pontuação (2025)
  // - Treino individual: 1 ponto
  // - Treino coletivo (#coletivo): 1 ponto (não mais 3 pontos)
  // - Treinos coletivos aprovados: pontos vão para ranking de equipes, não individual
  
  // 1. Filtra todos os check-ins do membro
  const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));

  // 2. Agrupa os check-ins por data (ex: "2024-06-20")
  const checkinsByDay = {};

  memberCheckIns.forEach(checkin => {
    // Corrige o fuso horário para contabilizar corretamente
    const date = corrigirFusoHorario(checkin.occurred_at || checkin.created_at || "");
    if (!date) return;
    
          // Verificar se o check-in foi feito no mesmo dia do treino
      const workoutDay = corrigirFusoHorario(checkin.occurred_at || checkin.created_at);
      const checkinDay = corrigirFusoHorario(checkin.created_at);
      
      // Se o check-in foi criado em um dia diferente do treino, não contabilizar
      if (workoutDay !== checkinDay) {
        return; // Ignora este check-in
      }
    
    if (!checkinsByDay[date]) checkinsByDay[date] = [];
    checkinsByDay[date].push(checkin);
  });

  let total = 0;

  // 3. Para cada dia, aplica a regra
  Object.values(checkinsByDay).forEach(dayCheckins => {
    let diaTemColetivo = false;
    let diaTemIndividual = false;
    
    // Verificar se há atividades manuais neste dia
    const dayDate = Object.keys(checkinsByDay).find(date => checkinsByDay[date] === dayCheckins);
    const manualActivitiesForDay = manualActivities.filter(activity => {
      if (!activity.created_at) return false;
      const activityDate = corrigirFusoHorario(activity.created_at);
      return activityDate === dayDate;
    });

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

      // Verifica se é coletivo especial com pontuação distribuída
      const coletivoMatch = (checkin.description || checkin.notes || checkin.hashtag || checkin.tags || "").match(/#coletivo_([^_]+)_([^_]+)_(\d+)pts/);
      
      if (coletivoMatch && durationMinutes >= 40) {
        const [, equipe1, equipe2, pontosTotal] = coletivoMatch;
        const pontos = parseInt(pontosTotal);
        
        // Calcula distribuição: 80% para equipe principal, 20% para secundária
        const pontosEquipe1 = Math.round(pontos * 0.8);
        const pontosEquipe2 = Math.round(pontos * 0.2);
        
        // Aqui você pode implementar a lógica para distribuir pontos entre equipes
        // Por enquanto, vamos manter a lógica individual
        diaTemColetivo = true;
        break;
      }
      
      // Verifica se é coletivo6 (6 pontos)
      const isColetivo6 = (checkin.description && checkin.description.includes("#coletivo6")) ||
                          (checkin.notes && checkin.notes.includes("#coletivo6")) ||
                          (checkin.hashtag && checkin.hashtag.includes("#coletivo6")) ||
                          (checkin.tags && checkin.tags.includes("#coletivo6"));

      // Verifica se é coletivo normal (3 pontos)
      const isColetivo = (checkin.description && checkin.description.includes("#coletivo")) ||
                         (checkin.notes && checkin.notes.includes("#coletivo")) ||
                         (checkin.hashtag && checkin.hashtag.includes("#coletivo")) ||
                         (checkin.tags && checkin.tags.includes("#coletivo"));

      if (isColetivo6 && durationMinutes >= 40) {
        diaTemColetivo = true;
        break; // já achou coletivo, não precisa olhar mais nada no dia
      } else if (isColetivo && durationMinutes >= 40) {
        diaTemColetivo = true;
        break; // já achou coletivo, não precisa olhar mais nada no dia
      } else if (durationMinutes >= 40) {
        diaTemIndividual = true;
      }
    }

    // Ranking individual: 1 ponto por dia com treino válido (independente do tipo)
    if (diaTemColetivo || diaTemIndividual || manualActivitiesForDay.length > 0) {
      total += 1; // Sempre 1 ponto por dia com treino válido
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

export default function LeaderboardCard({ members = [], checkins = [], checkInActivities = [], coletivos = [], manualActivities = [] }) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedMemberForActivity, setSelectedMemberForActivity] = useState(null);
  const [selectedDateForActivity, setSelectedDateForActivity] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [localManualActivities, setLocalManualActivities] = useState(manualActivities);
  
  // Loga os dados recebidos
  console.log("LeaderboardCard - members:", members);
  console.log("LeaderboardCard - checkins:", checkins);
  console.log("LeaderboardCard - checkInActivities:", checkInActivities);
  
  // Atualizar estado local quando as props mudarem
  useEffect(() => {
    setLocalManualActivities(manualActivities);
  }, [manualActivities]);

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

  function getColetivoScore(memberId, coletivos) {
    let total = 0;
    
    // Verificar se coletivos é um array
    if (!Array.isArray(coletivos)) {
      console.log('coletivos não é um array:', coletivos);
      return 0;
    }
    
    // Filtrar apenas treinos coletivos aprovados
    const approvedColetivos = coletivos.filter(coletivo => coletivo.status === 'approved');
    
    approvedColetivos.forEach(coletivo => {
      // Verificar se o membro participou do treino coletivo
      const isInTeam1 = coletivo.team1_participants.some(p => String(p.id) === String(memberId));
      const isInTeam2 = coletivo.team2_participants.some(p => String(p.id) === String(memberId));
      
      if (isInTeam1) {
        // Distribuir pontos da equipe 1 entre os participantes
        const pontosPorParticipante = Math.round(coletivo.team1_points / coletivo.team1_participants.length);
        total += pontosPorParticipante;
      } else if (isInTeam2) {
        // Distribuir pontos da equipe 2 entre os participantes
        const pontosPorParticipante = Math.round(coletivo.team2_points / coletivo.team2_participants.length);
        total += pontosPorParticipante;
      }
    });
    
    return total;
  }

  const allRanking = members
    .map(m => ({
      ...m,
      individualScore: getMemberScoreWithRules(m.id, checkins, checkInActivities, localManualActivities),
      coletivoScore: 0, // ❌ Não contar pontos coletivos no individual
      total: getMemberScoreWithRules(m.id, checkins, checkInActivities, localManualActivities) // ❌ Só pontos individuais
    }))
    .filter(m => m.total > 0)
    .filter(m => !search || (m.name || m.full_name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.total) - Number(a.total));

  const ranking = showAllParticipants ? allRanking : allRanking.slice(0, 20);
  const maiorPontuacao = allRanking.length > 0 ? allRanking[0].total : 0;

  // Função para calcular ranking correto com empates
  function calculateRanking(members) {
    if (members.length === 0) return [];
    
    let currentRank = 1;
    let currentScore = members[0].total;
    let membersWithRank = [];
    
    members.forEach((member, index) => {
      if (member.total < currentScore) {
        currentRank = index + 1;
        currentScore = member.total;
      }
      
      membersWithRank.push({
        ...member,
        rank: currentRank
      });
    });
    
    return membersWithRank;
  }

  const rankingWithRanks = calculateRanking(ranking);

  // Função para verificar se há empates nos 3 primeiros lugares
  function hasTiesInTop3() {
    if (rankingWithRanks.length < 3) return true;
    
    const top3 = rankingWithRanks.slice(0, 3);
    const firstScore = top3[0].total;
    const secondScore = top3[1].total;
    const thirdScore = top3[2].total;
    
    // Se os 3 primeiros têm a mesma pontuação, há empate
    if (firstScore === secondScore && secondScore === thirdScore) return true;
    
    // Se pelo menos 2 dos 3 primeiros têm a mesma pontuação, há empate
    if (firstScore === secondScore || secondScore === thirdScore || firstScore === thirdScore) return true;
    
    return false;
  }

  function getCheckinsByDay(memberId) {
    const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));
    const byDay = {};
    const ignoredCheckins = []; // Para armazenar check-ins ignorados
    
    memberCheckIns.forEach(checkin => {
      // Corrige o fuso horário para contabilizar corretamente
      const date = corrigirFusoHorario(checkin.occurred_at || checkin.created_at || "");
      if (!date) return;
      
      // Verificar se o check-in foi feito no mesmo dia do treino
      const workoutDay = corrigirFusoHorario(checkin.occurred_at || checkin.created_at);
      const checkinDay = corrigirFusoHorario(checkin.created_at);
      
      // Se o check-in foi criado em um dia diferente do treino, não contabilizar
      // Mas apenas se realmente houver uma diferença válida
      if (workoutDay && checkinDay && workoutDay !== checkinDay) {
        console.log(`Check-in ${checkin.id} ignorado: treino em ${workoutDay}, postado em ${checkinDay}`);
        ignoredCheckins.push({ checkin, workoutDay, checkinDay, date: workoutDay });
        return; // Ignora este check-in
      }
      
      // Se chegou até aqui, o check-in é válido
      if (!byDay[date]) byDay[date] = [];
      byDay[date].push(checkin);
    });
    
    // Para cada dia, soma os pontos conforme a regra
    const result = Object.entries(byDay).map(([date, dayCheckins]) => {
      let diaTemColetivo = false;
      let diaTemIndividual = false;
      let temAtividadesRegistradas = false;
      
      for (const checkin of dayCheckins) {
        const activities = checkInActivities.filter(a => String(a.workout_id) === String(checkin.id));
        
        // Verificar se há atividades registradas (com platform_activity preenchido)
        const activitiesWithType = activities.filter(a => a.platform_activity && a.platform_activity.trim() !== '');
        if (activitiesWithType.length > 0) {
          temAtividadesRegistradas = true;
        }
        
        let durationMinutes = 0;
        if (checkin.duration) {
          durationMinutes = Number(checkin.duration);
        } else if (activities.length > 0) {
          durationMinutes = activities.reduce((sum, a) => sum + (Number(a.duration_millis) || 0), 0) / 1000 / 60;
        }
        
        // Se não tem duração explícita, usar 60 minutos como padrão se há check-in
        if (durationMinutes === 0 && checkin.id) {
          durationMinutes = 60;
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
      
      // Verificar se há atividades manuais neste dia
      const manualActivitiesForDay = localManualActivities.filter(activity => {
        if (!activity.created_at) return false;
        const activityDate = corrigirFusoHorario(activity.created_at);
        return activityDate === date;
      });
      
      let pontos = 0;
      if (diaTemColetivo || manualActivitiesForDay.length > 0) pontos = 1; // Coletivo ou atividades manuais = 1 ponto
      else if (diaTemIndividual) pontos = 1;
      return { date, pontos, checkins: dayCheckins, temAtividadesRegistradas, manualActivities: manualActivitiesForDay };
    }).sort((a, b) => a.date.localeCompare(b.date));
    
    // Adicionar dias ignorados ao resultado
    const ignoredDays = ignoredCheckins.reduce((acc, item) => {
      const existingDay = acc.find(day => day.date === item.date);
      if (existingDay) {
        if (!existingDay.ignoredCheckins) {
          existingDay.ignoredCheckins = [];
        }
        existingDay.ignoredCheckins.push(item);
      } else {
        acc.push({ date: item.date, pontos: 0, checkins: [], temAtividadesRegistradas: false, ignoredCheckins: [item] });
      }
      return acc;
    }, []);
    
    // Combinar dias válidos e ignorados, ordenar por data
    // Se já existe um dia válido, NÃO mostrar os ignorados
    const allDays = [...result];
    
    // Adicionar apenas os dias ignorados que NÃO têm correspondente válido
    ignoredDays.forEach(ignoredDay => {
      const existingValidDay = allDays.find(day => day.date === ignoredDay.date);
      if (!existingValidDay) {
        // Se NÃO existe um dia válido, adicionar o dia ignorado
        allDays.push(ignoredDay);
      }
      // Se já existe um dia válido, IGNORAR completamente os check-ins ignorados
    });
    
    // Ordenar por data
    return allDays.sort((a, b) => a.date.localeCompare(b.date));
  }

  function formatDateBR(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  function formatDateTimeBR(dateTimeStr) {
    if (!dateTimeStr) return "";
    try {
      const date = new Date(dateTimeStr);
      // Converte UTC para horário de Brasília (UTC-3)
      const dataLocal = new Date(date.getTime() - (3 * 60 * 60 * 1000));
      const day = dataLocal.getDate().toString().padStart(2, '0');
      const month = (dataLocal.getMonth() + 1).toString().padStart(2, '0');
      const year = dataLocal.getFullYear();
      const hours = dataLocal.getHours().toString().padStart(2, '0');
      const minutes = dataLocal.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} às ${hours}:${minutes}`;
    } catch (error) {
      return dateTimeStr;
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 animate-fade-in min-h-[800px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Classificação Individual</h2>
          <p className="text-gray-600 text-sm">Ranking dos participantes</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-verde-600 to-azul-600 text-white px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
            {allRanking.length} participantes
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6 flex-shrink-0">
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
      {rankingWithRanks.length >= 3 && !search && !showAllParticipants && !hasTiesInTop3() && (
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-end justify-center space-x-2 mb-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-2 shadow-lg">
                {rankingWithRanks[1]?.profile_picture_url ? (
                  <img 
                    src={rankingWithRanks[1].profile_picture_url} 
                    alt={rankingWithRanks[1]?.name || rankingWithRanks[1]?.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(rankingWithRanks[1]?.name || rankingWithRanks[1]?.full_name || '')}
                  </div>
                )}
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-sm font-semibold text-gray-700">{rankingWithRanks[1]?.name || rankingWithRanks[1]?.full_name || 'Participante'}</div>
                <div className="text-lg font-bold text-gray-900">{rankingWithRanks[1]?.total} pts</div>
              </div>
            </div>
            
            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-2 shadow-lg">
                {rankingWithRanks[0]?.profile_picture_url ? (
                  <img 
                    src={rankingWithRanks[0].profile_picture_url} 
                    alt={rankingWithRanks[0]?.name || rankingWithRanks[0]?.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold text-xl">
                    {getInitials(rankingWithRanks[0]?.name || rankingWithRanks[0]?.full_name || '')}
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-3 text-center min-w-[100px] text-white">
                <div className="text-sm font-semibold">{rankingWithRanks[0]?.name || rankingWithRanks[0]?.full_name || 'Participante'}</div>
                <div className="text-lg font-bold">{rankingWithRanks[0]?.total} pts</div>
              </div>
            </div>
            
            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 mb-2 shadow-lg">
                {rankingWithRanks[2]?.profile_picture_url ? (
                  <img 
                    src={rankingWithRanks[2].profile_picture_url} 
                    alt={rankingWithRanks[2]?.name || rankingWithRanks[2]?.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-orange-600 to-orange-700 flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(rankingWithRanks[2]?.name || rankingWithRanks[2]?.full_name || '')}
                  </div>
                )}
              </div>
              <div className="bg-orange-100 rounded-lg p-3 text-center min-w-[80px]">
                <div className="text-sm font-semibold text-orange-700">{rankingWithRanks[2]?.name || rankingWithRanks[2]?.full_name || 'Participante'}</div>
                <div className="text-lg font-bold text-orange-900">{rankingWithRanks[2]?.total} pts</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando há empates */}
      {rankingWithRanks.length >= 3 && !search && !showAllParticipants && hasTiesInTop3() && (
        <div className="mb-6 p-4 bg-gradient-to-r from-azul-50 to-verde-50 border border-azul-200 rounded-xl flex-shrink-0">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-azul-500 to-verde-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🏆</span>
            </div>
            <div className="text-center">
              <p className="text-azul-800 font-semibold">Pódio em formação</p>
              <p className="text-azul-600 text-sm">Aguardando desempate entre os primeiros colocados</p>
            </div>
          </div>
        </div>
      )}

      {/* Participants List */}
      <div className="space-y-3 flex-1 min-h-[600px] overflow-y-auto">
        {rankingWithRanks.length > 0 ? (
          rankingWithRanks.map((m, i) => (
            <div
              key={m.id}
              className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:bg-white transition-all cursor-pointer group ${
                i < 3 && !search && !showAllParticipants && !hasTiesInTop3() ? 'hidden' : ''
              }`}
              onClick={() => setSelectedMember(m)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 shadow-lg ${
                    i === 0 ? 'ring-2 ring-yellow-500' :
                    i === 1 ? 'ring-2 ring-gray-400' :
                    i === 2 ? 'ring-2 ring-orange-600' :
                    ''
                  }`}>
                    {m.profile_picture_url ? (
                      <img 
                        src={m.profile_picture_url} 
                        alt={m.name || m.full_name || `Participante ${m.id}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-white font-bold text-sm sm:text-lg ${
                        i === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        i === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                        'bg-gradient-to-r from-azul-600 to-verde-600'
                      }`}>
                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : getInitials(m.name || m.full_name || `P${m.id}`)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex items-center">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base" title={m.name || m.full_name || `Participante ${m.id}`}>
                        {m.name || m.full_name || `Participante ${m.id}`}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {m.rank}º lugar
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                      {/* Botão de cadastrar atividade */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMemberForActivity(m);
                          setShowActivityModal(true);
                        }}
                        className="p-2 bg-gradient-to-r from-azul-500 to-verde-500 text-white rounded-lg hover:from-azul-600 hover:to-verde-600 transition-all"
                        title="Cadastrar atividade manual"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-white font-bold text-xs sm:text-sm whitespace-nowrap ${
                        m.total >= 15 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        m.total >= 10 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' :
                        m.total >= 5 ? 'bg-gradient-to-r from-azul-600 to-verde-600' :
                        'bg-gradient-to-r from-gray-500 to-gray-600'
                      }`}>
                        {m.total} pts
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold">Nenhum participante encontrado</p>
              <p className="text-sm">Tente ajustar sua pesquisa</p>
            </div>
          </div>
        )}
      </div>

      {/* Show All Participants Button */}
      {!showAllParticipants && allRanking.length > 20 && !search && (
        <div className="mt-6 text-center flex-shrink-0">
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
        <div className="mt-6 text-center flex-shrink-0">
          <button
            onClick={() => setShowAllParticipants(false)}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
          >
            Mostrar apenas top 20
          </button>
        </div>
      )}

      {/* Audit Modal */}
      {selectedMember && (
        <div className="modal-mobile modal-overlay" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl h-[98vh] sm:h-[95vh] md:h-[90vh] overflow-hidden animate-fade-in flex flex-col relative z-[999999] max-h-[98vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-verde-600 to-azul-600 text-white p-3 sm:p-4 md:p-6 rounded-t-xl sm:rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm sm:text-lg md:text-xl font-bold">
                      {getInitials(selectedMember.name || selectedMember.full_name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-lg md:text-xl font-bold truncate">
                      Auditoria de {selectedMember.name || selectedMember.full_name}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm">
                      Total: {selectedMember.total} pontos
                    </p>
                  </div>
                </div>
                <button
                  className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                  onClick={() => setSelectedMember(null)}
                  title="Fechar"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 modal-scroll min-h-0">
              <div className="space-y-3 sm:space-y-4">
                {getCheckinsByDay(selectedMember.id).map((dia, index) => (
                  <div key={dia.date} className="bg-gray-50 border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 border">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                          dia.pontos === 3 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' : 'bg-gradient-to-r from-azul-600 to-verde-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                            {formatDateBR(dia.date)}
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-white font-bold text-xs sm:text-sm ${
                          dia.pontos === 3 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' : 'bg-gradient-to-r from-azul-600 to-verde-600'
                        }`}>
                          {dia.pontos} {dia.pontos === 1 ? 'ponto' : 'pontos'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Exibir apenas check-ins válidos */}
                      {dia.checkins && dia.checkins.length > 0 && dia.checkins.map((checkin, idx) => (
                        <div key={checkin.id} className="bg-white rounded-lg p-2 sm:p-3 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 mb-1 text-sm sm:text-base truncate">
                                {checkin.title || checkin.description || `Check-in ${idx + 1}`}
                              </p>
                              {checkin.notes && (
                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{checkin.notes}</p>
                              )}
                            </div>
                            <div className="ml-2 sm:ml-3 text-right flex-shrink-0">
                              <div className="text-xs text-gray-500">
                                {checkin.duration ? `${Math.round(checkin.duration)}min` : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Exibir check-ins ignorados apenas se NÃO há check-ins válidos */}
                      {(!dia.checkins || dia.checkins.length === 0) && dia.ignoredCheckins && dia.ignoredCheckins.length > 0 && dia.ignoredCheckins.map((item, idx) => (
                        <div key={`ignored-${item.checkin.id}`} className="bg-red-100 rounded-lg p-3 border border-red-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-red-600 font-medium text-sm">
                                  ⚠️ Treino Ignorado
                                </span>
                              </div>
                              <p className="font-medium text-gray-900 mb-1 text-sm sm:text-base truncate">
                                {item.checkin.title || item.checkin.description || `Check-in ${item.checkin.id}`}
                              </p>
                              {item.checkin.notes && (
                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{item.checkin.notes}</p>
                              )}
                              <p className="text-xs text-red-600 mt-1">
                                <strong>Treino realizado:</strong> {formatDateBR(item.workoutDay)} | 
                                <strong> Postado em:</strong> {formatDateTimeBR(item.checkin.created_at)}
                              </p>
                            </div>
                            <div className="ml-2 sm:ml-3 text-right flex-shrink-0">
                              <div className="text-xs text-red-500 bg-red-200 px-2 py-1 rounded">
                                Ignorado
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.checkin.duration ? `${Math.round(item.checkin.duration)}min` : ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Mostrar atividades manuais se existirem */}
                      {dia.manualActivities && dia.manualActivities.length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Atividades Manuais Cadastradas</p>
                                <div className="space-y-1 mt-1">
                                  {dia.manualActivities.map((activity, idx) => (
                                    <div key={idx} className="text-xs text-gray-600">
                                      • {activity.activity_label} ({activity.activity_type})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded font-medium">
                                ✓ Atividade Manual
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mostrar treinos coletivos se existirem (apenas para auditoria) */}
                      {(() => {
                        // Debug: Log para verificar se está funcionando
                        console.log('=== DEBUG CHECKINS COLETIVOS ===');
                        console.log('checkins recebidos:', checkins.length);
                        console.log('selectedMember.id:', selectedMember.id);
                        console.log('dia.date:', dia.date);
                        
                        // Buscar check-ins coletivos da pessoa neste dia
                        const checkinsColetivosDoDia = checkins.filter(checkin => {
                          // Verificar se é da pessoa
                          if (String(checkin.account_id) !== String(selectedMember.id)) return false;
                          
                          // Verificar se é do mesmo dia
                          const checkinDate = corrigirFusoHorario(checkin.occurred_at || checkin.created_at);
                          if (checkinDate !== dia.date) return false;
                          
                          // Verificar se tem hashtag coletiva
                          const hasColetivo = (checkin.description && checkin.description.includes("#coletivo")) ||
                                            (checkin.notes && checkin.notes.includes("#coletivo")) ||
                                            (checkin.hashtag && checkin.hashtag.includes("#coletivo")) ||
                                            (checkin.tags && checkin.tags.includes("#coletivo")) ||
                                            (checkin.title && checkin.title.includes("#coletivo"));
                          
                          const hasColetivo6 = (checkin.description && checkin.description.includes("#coletivo6")) ||
                                             (checkin.notes && checkin.notes.includes("#coletivo6")) ||
                                             (checkin.hashtag && checkin.hashtag.includes("#coletivo6")) ||
                                             (checkin.tags && checkin.tags.includes("#coletivo6")) ||
                                             (checkin.title && checkin.title.includes("#coletivo6"));
                          
                          if (hasColetivo || hasColetivo6) {
                            console.log('Check-in coletivo encontrado:', checkin);
                            console.log('hasColetivo:', hasColetivo);
                            console.log('hasColetivo6:', hasColetivo6);
                          }
                          
                          return hasColetivo || hasColetivo6;
                        });

                        console.log('checkinsColetivosDoDia encontrados:', checkinsColetivosDoDia);
                        console.log('=== FIM DEBUG ===');

                        if (checkinsColetivosDoDia.length === 0) return null;

                        return (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">🏆</span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Treinos Coletivos (Check-ins)</p>
                                  <p className="text-xs text-gray-500">Pontuação destinada às equipes - não contabilizada no ranking individual</p>
                                  <div className="space-y-1 mt-1">
                                    {checkinsColetivosDoDia.map((checkin, idx) => {
                                      const isColetivo6 = (checkin.description && checkin.description.includes("#coletivo6")) ||
                                                        (checkin.notes && checkin.notes.includes("#coletivo6")) ||
                                                        (checkin.hashtag && checkin.hashtag.includes("#coletivo6")) ||
                                                        (checkin.tags && checkin.tags.includes("#coletivo6")) ||
                                                        (checkin.title && checkin.title.includes("#coletivo6"));
                                      
                                      const pontosEquipe = isColetivo6 ? 6 : 3;
                                      const titulo = checkin.title || checkin.description || checkin.notes || 'Treino coletivo';
                                      
                                      return (
                                        <div key={idx} className="text-xs text-gray-600">
                                          • {titulo} ({pontosEquipe}pts para equipe)
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-purple-600 bg-purple-200 px-2 py-1 rounded font-medium">
                                  🏆 Coletivo
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Botão para cadastrar atividade se não há atividades registradas */}
                      {dia.checkins && dia.checkins.length > 0 && !dia.temAtividadesRegistradas && !dia.manualActivities?.length && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Nenhuma atividade registrada</p>
                                <p className="text-xs text-gray-500">Cadastre a atividade realizada neste dia</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedMemberForActivity(selectedMember);
                                setSelectedDateForActivity(formatDateBR(dia.date));
                                setShowActivityModal(true);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              Cadastrar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && selectedMemberForActivity && (
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedMemberForActivity(null);
            setSelectedDateForActivity(null);
          }}
          onSave={async () => {
            // Recarregar apenas as atividades manuais
            try {
              const response = await fetch('/api/manual-activities');
              const newManualActivities = await response.json();
              // Atualizar o estado local das atividades manuais
              setLocalManualActivities(newManualActivities);
            } catch (error) {
              console.error('Erro ao recarregar atividades manuais:', error);
            }
            setShowActivityModal(false);
            setSelectedMemberForActivity(null);
            setSelectedDateForActivity(null);
          }}
          member={selectedMemberForActivity}
          selectedDate={selectedDateForActivity}
        />
      )}
    </div>
  );
}