'use client';

import { useState, useEffect } from 'react';
import { corrigirFusoHorario } from '../../lib/utils';
import Link from 'next/link';

export default function TemporalAnalysisPage() {
  const [data, setData] = useState({
    members: [],
    checkins: [],
    checkInActivities: [],
    checkInMedia: [],
    teamMemberships: [],
    teams: [],
    loading: true
  });

  const [viewType, setViewType] = useState('patterns');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [members, checkins, checkInActivities, checkInMedia, teamMemberships, teams] = await Promise.all([
          fetch('/api/members').then(res => res.json()),
          fetch('/api/checkins').then(res => res.json()),
          fetch('/api/check_in_activities').then(res => res.json()),
          fetch('/api/check_in_media').then(res => res.json()),
          fetch('/api/team_memberships').then(res => res.json()),
          fetch('/api/teams').then(res => res.json())
        ]);

        setData({
          members,
          checkins,
          checkInActivities,
          checkInMedia,
          teamMemberships,
          teams,
          loading: false
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  // Análise de padrões únicos
  const analyzePatterns = () => {
    const patterns = {
      peakHours: {},
      peakDays: {},
      activityTrends: {},
      teamPerformance: {},
      timeDistribution: {},
      weeklyPatterns: {},
      intensityAnalysis: {},
      consistencyPatterns: {},
      teamComparison: {},
      performanceMetrics: {}
    };

    // Padrões por hora
    data.checkins.forEach(checkin => {
      const hour = new Date(checkin.created_at).getHours();
      patterns.peakHours[hour] = (patterns.peakHours[hour] || 0) + 1;
    });

    // Padrões por dia da semana
    data.checkins.forEach(checkin => {
      const day = new Date(checkin.created_at).getDay();
      patterns.peakDays[day] = (patterns.peakDays[day] || 0) + 1;
    });

    // Análise de tendências de atividade
    const activityByDate = {};
    data.checkins.forEach(checkin => {
      const date = corrigirFusoHorario(checkin.occurred_at || checkin.created_at);
      if (!activityByDate[date]) activityByDate[date] = 0;
      activityByDate[date]++;
    });

    patterns.activityTrends = Object.entries(activityByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7);

    // Análise de distribuição temporal
    const timeSlots = {
      'Manhã (6h-12h)': 0,
      'Tarde (12h-18h)': 0,
      'Noite (18h-24h)': 0,
      'Madrugada (0h-6h)': 0
    };

    data.checkins.forEach(checkin => {
      const hour = new Date(checkin.created_at).getHours();
      if (hour >= 6 && hour < 12) timeSlots['Manhã (6h-12h)']++;
      else if (hour >= 12 && hour < 18) timeSlots['Tarde (12h-18h)']++;
      else if (hour >= 18 && hour < 24) timeSlots['Noite (18h-24h)']++;
      else timeSlots['Madrugada (0h-6h)']++;
    });

    patterns.timeDistribution = timeSlots;

    // Análise de intensidade por participante
    data.members.forEach(member => {
      const memberCheckins = data.checkins.filter(c => String(c.account_id) === String(member.id));
      const totalCalories = memberCheckins.reduce((sum, c) => sum + (parseFloat(c.calories) || 0), 0);
      const totalDuration = memberCheckins.reduce((sum, c) => sum + (parseFloat(c.duration) || 0), 0);
      
      patterns.intensityAnalysis[member.id] = {
        member: member,
        totalCheckins: memberCheckins.length,
        avgCalories: totalCalories / Math.max(memberCheckins.length, 1),
        avgDuration: totalDuration / Math.max(memberCheckins.length, 1),
        intensity: (totalCalories * totalDuration) / Math.max(memberCheckins.length, 1)
      };
    });

    // Análise de consistência semanal
    const weeklyData = {};
    data.checkins.forEach(checkin => {
      const date = new Date(checkin.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) weeklyData[weekKey] = 0;
      weeklyData[weekKey]++;
    });

    patterns.weeklyPatterns = Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-4);

    // Análise de performance por equipe
    const teamData = {};
    
    // Criar um mapa de membros para suas equipes
    const memberTeamMap = {};
    data.teamMemberships.forEach(membership => {
      memberTeamMap[membership.account_id] = membership.team_name;
    });
    
    console.log('Team Memberships:', data.teamMemberships.length);
    console.log('Member Team Map:', Object.keys(memberTeamMap).length);
    console.log('Teams found:', [...new Set(Object.values(memberTeamMap))]);
    
    data.members.forEach(member => {
      const team = memberTeamMap[member.id] || 'Sem Equipe';
      if (!teamData[team]) teamData[team] = { checkins: 0, calories: 0, members: 0 };
      teamData[team].members++;
      
      const memberCheckins = data.checkins.filter(c => String(c.account_id) === String(member.id));
      teamData[team].checkins += memberCheckins.length;
      teamData[team].calories += memberCheckins.reduce((sum, c) => sum + (parseFloat(c.calories) || 0), 0);
    });
    
    console.log('Final Team Data:', teamData);

    patterns.teamComparison = teamData;

    return patterns;
  };

  const patterns = analyzePatterns();

  // Componente: Horários de Pico com UX Avançada
  const PeakHoursView = () => {
    const sortedHours = Object.entries(patterns.peakHours)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const maxCount = Math.max(...sortedHours.map(([,count]) => count));

    return (
      <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:border-blue-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/20 hover:-translate-y-1 relative overflow-hidden">
        {/* Animação de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 animate-bounce-subtle"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg animate-glow-pulse group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg sm:text-xl">🕐</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Horários de Pico</h3>
              <p className="text-xs sm:text-sm text-gray-500">Horários com maior atividade no desafio</p>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {sortedHours.map(([hour, count], index) => {
              const percentage = (count / maxCount) * 100;
              return (
                <div key={hour} className="group/item relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">🔥</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-base sm:text-lg">{hour}h</div>
                        <div className="text-xs sm:text-sm text-gray-600">{count} treinos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {count}
                      </div>
                      <div className="text-xs text-gray-500">treinos</div>
                    </div>
                  </div>
                  
                  {/* Barra de progresso animada */}
                  <div className="mt-2 sm:mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Componente: Dias Mais Ativos com UX Avançada
  const PeakDaysView = () => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const sortedDays = Object.entries(patterns.peakDays)
      .sort(([,a], [,b]) => b - a);

    const maxCount = Math.max(...sortedDays.map(([,count]) => count));

    return (
      <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:border-green-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-green-600/20 hover:-translate-y-1 relative overflow-hidden">
        {/* Animação de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 animate-bounce-subtle"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg animate-glow-pulse group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg sm:text-xl">📅</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Dias Mais Ativos</h3>
              <p className="text-xs sm:text-sm text-gray-500">Dias da semana com maior engajamento</p>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {sortedDays.map(([day, count], index) => {
              const percentage = (count / maxCount) * 100;
              return (
                <div key={day} className="group/item relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-100 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white font-bold">⭐</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-base sm:text-lg">{dayNames[day]}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{count} treinos</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {count}
                      </div>
                      <div className="text-xs text-gray-500">treinos</div>
                    </div>
                  </div>
                  
                  {/* Barra de progresso animada */}
                  <div className="mt-2 sm:mt-3 relative">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Componente: Distribuição Temporal com UX Avançada
  const TimeDistributionView = () => {
    const timeSlots = Object.entries(patterns.timeDistribution);
    const maxCount = Math.max(...timeSlots.map(([,count]) => count));

    return (
      <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:border-purple-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-600/20 hover:-translate-y-1 relative overflow-hidden">
        {/* Animação de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 animate-bounce-subtle"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg animate-glow-pulse group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg sm:text-xl">⏰</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Distribuição Temporal</h3>
              <p className="text-xs sm:text-sm text-gray-500">Como o tempo é distribuído ao longo do dia</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {timeSlots.map(([slot, count], index) => {
              const percentage = (count / maxCount) * 100;
              const colors = [
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500', 
                'from-orange-500 to-red-500',
                'from-purple-500 to-pink-500'
              ];
              
              return (
                <div key={slot} className="group/item relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${colors[index]} rounded-xl flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300`}>
                      <span className="text-white text-xl sm:text-2xl">
                        {index === 0 ? '🌅' : index === 1 ? '☀️' : index === 2 ? '🌆' : '🌙'}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">{slot}</div>
                      <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {count}
                      </div>
                      <div className="text-xs text-gray-500">treinos</div>
                    </div>
                    
                    {/* Barra de progresso linear */}
                    <div className="w-full mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r ${colors[index]} h-2 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Componente: Tendência de Atividade com UX Avançada
  const ActivityTrendView = () => {
    return (
      <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:border-orange-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-600/20 hover:-translate-y-1 relative overflow-hidden">
        {/* Animação de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 to-red-600/5 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 animate-bounce-subtle"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg animate-glow-pulse group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg sm:text-xl">📈</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Tendência de Atividade</h3>
              <p className="text-xs sm:text-sm text-gray-500">Últimos 7 dias de engajamento</p>
            </div>
          </div>
          
          <div className="flex justify-between items-end h-32 sm:h-40 space-x-1 sm:space-x-2">
            {patterns.activityTrends.map(([date, count], index) => {
              const maxCount = Math.max(...patterns.activityTrends.map(([,c]) => c));
              const height = (count / maxCount) * 100;
              const isToday = new Date(date).toDateString() === new Date().toDateString();
              
              return (
                <div key={date} className="flex flex-col items-center flex-1 group/item">
                  <div 
                    className={`w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t transition-all duration-500 hover:scale-110 ${
                      isToday ? 'ring-2 sm:ring-4 ring-orange-300 shadow-lg' : ''
                    }`}
                    style={{ height: `${Math.max(height, 8)}px` }}
                    title={`${date}: ${count} treinos`}
                  >
                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-white/20 h-full rounded-t"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium">
                    {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // NOVO: Componente de Análise de Intensidade
  const IntensityAnalysisView = () => {
    const sortedIntensity = Object.values(patterns.intensityAnalysis)
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 5);

    return (
      <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:border-red-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-red-600/20 hover:-translate-y-1 relative overflow-hidden">
        {/* Animação de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-pink-600/5 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 animate-bounce-subtle"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg animate-glow-pulse group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg sm:text-xl">💪</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Maior Intensidade</h3>
              <p className="text-xs sm:text-sm text-gray-500">Participantes com treinos mais intensos</p>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {sortedIntensity.map((item, index) => (
              <div key={item.member.id} className="group/item relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-3 sm:p-4 border border-red-100 hover:from-red-100 hover:to-pink-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">🔥</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-base sm:text-lg break-words">{item.member.name || item.member.full_name}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{item.totalCheckins} treinos</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {Math.round(item.avgCalories)}
                    </div>
                    <div className="text-xs text-gray-500">cal/dia</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // NOVO: Componente de Comparação por Equipe
  const TeamComparisonView = () => {
    const sortedTeams = Object.entries(patterns.teamComparison)
      .sort(([,a], [,b]) => b.checkins - a.checkins);

    return (
      <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:border-indigo-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-600/20 hover:-translate-y-1 relative overflow-hidden">
        {/* Animação de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 animate-bounce-subtle"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-glow-pulse group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg sm:text-xl">🏆</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Performance por Equipe</h3>
              <p className="text-xs sm:text-sm text-gray-500">Comparação de engajamento entre equipes</p>
            </div>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {sortedTeams.map(([team, data], index) => (
              <div key={team} className="group/item relative overflow-hidden bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 sm:p-4 border border-indigo-100 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                        {index + 1}
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">🏅</span>
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-base sm:text-lg break-words">{team}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{data.members} membros</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {data.checkins}
                    </div>
                    <div className="text-xs text-gray-500">treinos</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // NOVO: Componente de Padrões Semanais
  const WeeklyPatternsView = () => {
    return (
      <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:border-teal-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-600/20 hover:-translate-y-1 relative overflow-hidden">
        {/* Animação de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/5 to-cyan-600/5 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-r from-teal-600/20 to-cyan-600/20 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 animate-bounce-subtle"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg animate-glow-pulse group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg sm:text-xl">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg sm:text-xl">Padrões Semanais</h3>
              <p className="text-xs sm:text-sm text-gray-500">Evolução do engajamento por semana</p>
            </div>
          </div>
          
          <div className="flex justify-between items-end h-32 sm:h-40 space-x-1 sm:space-x-2">
            {patterns.weeklyPatterns.map(([week, count], index) => {
              const maxCount = Math.max(...patterns.weeklyPatterns.map(([,c]) => c));
              const height = (count / maxCount) * 100;
              
              return (
                <div key={week} className="flex flex-col items-center flex-1 group/item">
                  <div 
                    className="w-full bg-gradient-to-t from-teal-500 to-cyan-500 rounded-t transition-all duration-500 hover:scale-110"
                    style={{ height: `${Math.max(height, 8)}px` }}
                    title={`Sem ${index + 1}: ${count} treinos`}
                  >
                    <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 bg-white/20 h-full rounded-t"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 sm:mt-2 font-medium">
                    Sem {index + 1}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4 lg:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header com UX Avançada e Navegação */}
        <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 border border-white/50 hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
          {/* Animação de fundo */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16 animate-bounce-subtle"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                {/* Botão de Retorno */}
                <Link 
                  href="/"
                  className="group/back flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-lg hover:scale-105 font-semibold text-sm sm:text-base w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover/back:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Voltar ao Dashboard</span>
                </Link>
                
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent break-words">
                    Análise Temporal Avançada
                  </h1>
                  <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">
                    Insights únicos sobre padrões de comportamento e tendências temporais
                  </p>
                </div>
              </div>
              
              {/* Seletor responsivo */}
              <div className="relative w-full sm:w-auto">
                <select
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                  className="appearance-none bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl px-4 sm:px-6 py-2 sm:py-3 pr-10 sm:pr-12 text-gray-700 font-semibold focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:bg-white/90 hover:shadow-lg cursor-pointer w-full sm:w-auto text-sm sm:text-base min-w-[200px] max-w-full"
                >
                  <option value="patterns" className="py-2">📊 Padrões Temporais</option>
                  <option value="insights" className="py-2">💡 Insights Especiais</option>
                </select>
                <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content com Grid Responsivo */}
        {viewType === 'patterns' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <PeakHoursView />
            <PeakDaysView />
            <TimeDistributionView />
            <ActivityTrendView />
          </div>
        )}

        {viewType === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            <IntensityAnalysisView />
            <TeamComparisonView />
            <WeeklyPatternsView />
            <ActivityTrendView />
          </div>
        )}
      </div>
    </div>
  );
} 