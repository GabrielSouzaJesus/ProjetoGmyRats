import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart, CartesianGrid } from "recharts";
import { corrigirFusoHorario } from "../lib/utils";

export default function ActivityChart({ checkins = [], teams = [], members = [], teamMemberships = [], challenge = null }) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [showAverage, setShowAverage] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    setIsVisible(true);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Função para obter membros de uma equipe
  const getTeamMembers = (teamId) => {
    if (teamId === "all") return members;
    
    const teamMemberIds = teamMemberships
      .filter(tm => String(tm.team_id) === String(teamId))
      .map(tm => String(tm.account_id));
    
    return members.filter(m => teamMemberIds.includes(String(m.id)));
  };

  // Função para filtrar check-ins por equipe
  const getFilteredCheckins = () => {
    if (selectedTeam === "all") return checkins;
    
    const teamMembers = getTeamMembers(selectedTeam);
    const teamMemberIds = teamMembers.map(m => String(m.id));
    
    return checkins.filter(c => teamMemberIds.includes(String(c.account_id)));
  };

  // Calcula dias passados desde o início do desafio
  const getDiasPassados = () => {
    if (!challenge?.start_date) return 1;
    const startDate = new Date(challenge.start_date);
    const today = new Date();
    const diasPassados = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    return diasPassados;
  };

  // Processa dados do gráfico
  const processChartData = () => {
    const filteredCheckins = getFilteredCheckins();
    
    const dataByDate = filteredCheckins.reduce((acc, c) => {
      const date = corrigirFusoHorario(c.created_at || c.occurred_at || "");
      if (date) {
        acc[date] = acc[date] || { date, checkins: 0 };
        acc[date].checkins += 1;
      }
      return acc;
    }, {});

    const data = Object.values(dataByDate).sort((a, b) => a.date.localeCompare(b.date));
    
    // Calcula média baseada nos dias que já passaram do desafio
    const totalCheckins = filteredCheckins.length;
    const diasPassados = getDiasPassados();
    const average = diasPassados > 0 ? totalCheckins / diasPassados : 0;
    
    // Adiciona linha de média aos dados
    return data.map(item => ({
      ...item,
      average: Math.round(average * 100) / 100
    }));
  };

  const data = processChartData();
  const selectedTeamData = teams.find(t => String(t.id) === selectedTeam);
  const filteredCheckins = getFilteredCheckins();
  const diasPassados = getDiasPassados();

  // Formatação otimizada para mobile
  const xTickFormatter = isMobile
    ? (date, idx) => {
        if (idx === 0 || idx === data.length - 1 || idx % Math.ceil(data.length / 4) === 0) {
          return date.split('-')[2]; // Retorna apenas o dia
        }
        return '';
      }
    : (date) => date;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-2 sm:p-3 shadow-lg text-xs sm:text-sm">
          <p className="font-semibold text-gray-900 mb-1 sm:mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs sm:text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white/80 backdrop-blur-md border border-white/30 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 mt-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Header com controles - Otimizado para mobile */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="text-center sm:text-left">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">
            Evolução Diária de Check-ins
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            {selectedTeam === "all" 
              ? "Todos os participantes" 
              : `Equipe: ${selectedTeamData?.name || 'Selecionada'}`
            }
          </p>
        </div>

        {/* Controles - Layout otimizado para mobile */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          {/* Seletor de Equipe - Prioridade no mobile */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-azul-600 focus:border-transparent transition-all hover:bg-white"
            >
              <option value="all">🏆 Todas as Equipes</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Toggle Média - Botão otimizado */}
          <button
            onClick={() => setShowAverage(!showAverage)}
            className={`w-full sm:w-auto px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
              showAverage 
                ? 'bg-gradient-to-r from-verde-600 to-azul-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showAverage ? '📊' : '📈'} Média
          </button>
        </div>
      </div>

      {/* Estatísticas rápidas - Grid otimizado para mobile */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-gradient-to-r from-azul-600 to-verde-600 text-white rounded-lg p-2 sm:p-3 text-center">
          <div className="text-sm sm:text-lg md:text-xl font-bold">{data.length}</div>
          <div className="text-xs opacity-90">Dias Ativos</div>
        </div>
        <div className="bg-gradient-to-r from-verde-600 to-laranja-600 text-white rounded-lg p-2 sm:p-3 text-center">
          <div className="text-sm sm:text-lg md:text-xl font-bold">
            {filteredCheckins.length}
          </div>
          <div className="text-xs opacity-90">Total Check-ins</div>
        </div>
        <div className="bg-gradient-to-r from-laranja-600 to-azul-600 text-white rounded-lg p-2 sm:p-3 text-center">
          <div className="text-sm sm:text-lg md:text-xl font-bold">
            {Math.round(filteredCheckins.length / diasPassados)}
          </div>
          <div className="text-xs opacity-90">Média/Dia</div>
        </div>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-2 sm:p-3 text-center">
          <div className="text-sm sm:text-lg md:text-xl font-bold">
            {getTeamMembers(selectedTeam).length}
          </div>
          <div className="text-xs opacity-90">Participantes</div>
        </div>
      </div>

      {/* Gráfico - Altura otimizada para mobile */}
      <div className="bg-white/50 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 border border-white/20">
        <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={xTickFormatter}
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
              interval={isMobile ? Math.ceil(data.length / 6) : 0}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
              label={!isMobile ? { value: 'Check-ins', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666' } } : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            {!isMobile && <Legend />}
            <Bar 
              dataKey="checkins" 
              fill="#2563eb" 
              name="Check-ins"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
            {showAverage && (
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#ea580c" 
                strokeWidth={isMobile ? 2 : 3}
                dot={{ fill: '#ea580c', strokeWidth: 2, r: isMobile ? 3 : 4 }}
                name="Média"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Informações adicionais - Texto otimizado para mobile */}
      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-gray-600 text-xs sm:text-sm">
          {selectedTeam === "all" 
            ? "📊 Mostrando dados de todas as equipes"
            : `👥 Dados da equipe ${selectedTeamData?.name}`
          }
        </p>
      </div>
    </div>
  );
}