import React from 'react';

const TAMANHO_EQUIPE = {
  "Dados e Indicadores": 12,
  "Pós Operação": 15,
  "Estudos e Proteção": 21,
  "Planejamento de Redes": 12,
};

// Data limite para cadastro: 08/08/2025 23:59
const DATA_LIMITE_CADASTRO = "2025-08-08T23:59:59";

export default function PunicoesSummary({ teams = [], members = [], teamMemberships = [] }) {
  // Função para calcular punições por equipe
  function calcularPunicoesEquipe(teamName, teamMembers) {
    const tamanhoEsperado = TAMANHO_EQUIPE[teamName?.trim()] || 0;
    const membrosCadastrados = teamMembers.length;
    const membrosFaltantes = Math.max(0, tamanhoEsperado - membrosCadastrados);
    const pontosPunicao = membrosFaltantes * 5;
    
    return {
      tamanhoEsperado,
      membrosCadastrados,
      membrosFaltantes,
      pontosPunicao
    };
  }

  // Função para verificar se um membro se cadastrou até o prazo limite
  function membroCadastradoNoPrazo(member) {
    if (!member.created_at) return false;
    
    const dataCadastro = new Date(member.created_at);
    const dataLimite = new Date(DATA_LIMITE_CADASTRO);
    
    return dataCadastro <= dataLimite;
  }

  // Calcula punições para todas as equipes
  const punicoesEquipes = teams.map(team => {
    const memberIds = teamMemberships
      .filter(tm => String(tm.team_id) === String(team.id))
      .map(tm => String(tm.account_id));

    const teamMembers = members.filter(m => memberIds.includes(String(m.id)));
    const punicoes = calcularPunicoesEquipe(team.name, teamMembers);
    
    // Filtra membros que se cadastraram após o prazo
    const membrosAposPrazo = teamMembers.filter(m => !membroCadastradoNoPrazo(m));
    
    return {
      ...team,
      ...punicoes,
      membros: teamMembers,
      membrosAposPrazo
    };
  });

  // Calcula totais
  const totalPunicoes = punicoesEquipes.reduce((sum, team) => sum + team.pontosPunicao, 0);
  const totalMembrosFaltantes = punicoesEquipes.reduce((sum, team) => sum + team.membrosFaltantes, 0);
  const totalMembrosEsperados = punicoesEquipes.reduce((sum, team) => sum + team.tamanhoEsperado, 0);
  const totalMembrosCadastrados = punicoesEquipes.reduce((sum, team) => sum + team.membrosCadastrados, 0);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 relative">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Círculos decorativos nos cantos */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full opacity-20 blur-xl" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full opacity-20 blur-xl" />
        <div className="absolute bottom-40 left-20 w-28 h-28 bg-gradient-to-r from-orange-200 to-red-200 rounded-full opacity-20 blur-xl" />
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 blur-xl" />
        
        {/* Linhas de conexão sutis */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent opacity-30" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-30" />
        
        {/* Elementos flutuantes nos lados */}
        <div className="absolute top-1/3 left-4 w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-2/3 left-4 w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/2 left-4 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
        
        <div className="absolute top-1/3 right-4 w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-2/3 right-4 w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute top-1/2 right-4 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1.3s'}}></div>
        
        {/* Linhas verticais decorativas */}
        <div className="absolute left-8 top-0 w-px h-full bg-gradient-to-b from-transparent via-purple-200 to-transparent opacity-20" />
        <div className="absolute right-8 top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-20" />
      </div>

      {/* Header Principal com Design Impactante */}
      <div className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <span className="text-white text-3xl">📊</span>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Resumo de Punições
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-2">
              Sistema de punições por equipe - Prazo: 08/08/2025 23:59
            </p>
          </div>
        </div>
        
        {/* Badge de Contagem de Equipes */}
        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-full text-white font-semibold shadow-xl transform hover:scale-105 transition-all duration-300">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          <span className="text-lg">{punicoesEquipes.length} equipes</span>
        </div>
      </div>

      {/* Cards de Estatísticas Principais com Animações */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Cards principais - ocupam 8 colunas */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Total Esperado */}
          <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                  🎯
                </div>
                <div className="text-white/90 text-sm font-medium">
                  Total Esperado
                </div>
              </div>
              
              <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {totalMembrosEsperados}
              </div>
            </div>
            
            {/* Decoração de fundo */}
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20">
              <div className="w-full h-full rounded-full border-4 border-white/40" />
            </div>
          </div>

          {/* Total Cadastrados */}
          <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-green-600 to-green-700 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                  ✅
                </div>
                <div className="text-white/90 text-sm font-medium">
                  Total Cadastrados
                </div>
              </div>
              
              <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {totalMembrosCadastrados}
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20">
              <div className="w-full h-full rounded-full border-4 border-white/40" />
            </div>
          </div>

          {/* Total Faltantes */}
          <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                  ⚠️
                </div>
                <div className="text-white/90 text-sm font-medium">
                  Total Faltantes
                </div>
              </div>
              
              <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                {totalMembrosFaltantes}
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20">
              <div className="w-full h-full rounded-full border-4 border-white/40" />
            </div>
          </div>

          {/* Total Punições */}
          <div className="group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 ease-out transform hover:scale-105 hover:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-red-600 to-red-700 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                  🚨
                </div>
                <div className="text-white/90 text-sm font-medium">
                  Total Punições
                </div>
              </div>
              
              <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                -{totalPunicoes}
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20">
              <div className="w-full h-full rounded-full border-4 border-white/40" />
            </div>
          </div>
        </div>

        {/* Cards laterais informativos - ocupam 4 colunas */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card de Status Geral */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📈</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Status Geral</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Equipes em dia:</span>
                <span className="text-lg font-bold text-green-600">
                  {punicoesEquipes.filter(t => t.pontosPunicao === 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Equipes com pendências:</span>
                <span className="text-lg font-bold text-red-600">
                  {punicoesEquipes.filter(t => t.pontosPunicao > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taxa de sucesso:</span>
                <span className="text-lg font-bold text-blue-600">
                  {Math.round((totalMembrosCadastrados / totalMembrosEsperados) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Card de Timeline */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 border border-orange-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">⏰</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Timeline</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Prazo: 08/08/2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Punições aplicadas</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Ranking atualizado</span>
              </div>
            </div>
          </div>

          {/* Card de Dicas */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border border-green-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">💡</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Dicas Rápidas</h3>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Cada membro não cadastrado = -5 pontos</p>
              <p>• Equipes verdes estão em dia</p>
              <p>• Equipes vermelhas têm pendências</p>
              <p>• Punições afetam o ranking final</p>
            </div>
          </div>
        </div>
      </div>

      {/* Separador Visual com Elementos Decorativos */}
      <div className="relative mb-12">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-white px-8 py-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-orange-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Detalhamento por Equipe */}
      <div className="mb-10">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white text-xl">🏆</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Detalhamento por Equipe</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {punicoesEquipes.map((team, index) => (
            <div
              key={team.id}
              className={`group relative overflow-hidden rounded-3xl transition-all duration-500 ease-out transform hover:scale-105 ${
                team.pontosPunicao > 0 
                  ? 'bg-gradient-to-br from-red-50 via-pink-50 to-red-100 border-2 border-red-200' 
                  : 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-2 border-green-200'
              } hover:shadow-2xl`}
            >
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative p-8">
                {/* Header da Equipe */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      team.pontosPunicao > 0 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg'
                    }`}>
                      <span className="text-white text-2xl">
                        {team.pontosPunicao > 0 ? '⚠️' : '✅'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                        {team.name}
                      </h3>
                      <p className={`text-lg font-medium ${
                        team.pontosPunicao > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {team.membrosCadastrados} de {team.tamanhoEsperado} membros
                      </p>
                    </div>
                  </div>
                  
                  {/* Badge de Pontuação */}
                  <div className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 group-hover:scale-110 ${
                    team.pontosPunicao > 0 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  }`}>
                    {team.pontosPunicao > 0 ? `-${team.pontosPunicao} pts` : '0 pts'}
                  </div>
                </div>
                
                {/* Métricas Detalhadas */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Meta', value: team.tamanhoEsperado, color: 'from-blue-500 to-blue-600' },
                    { label: 'Cadastrados', value: team.membrosCadastrados, color: 'from-green-500 to-green-600' },
                    { label: 'Faltantes', value: team.membrosFaltantes, color: 'from-orange-500 to-orange-600' },
                    { label: 'Punição', value: team.pontosPunicao, color: 'from-red-500 to-red-600' }
                  ].map((metric, idx) => (
                    <div key={idx} className="text-center group-hover:scale-105 transition-transform duration-300">
                      <div className={`w-full h-3 rounded-full bg-gradient-to-r ${metric.color} mb-2 shadow-lg`} />
                      <div className="text-sm font-medium text-gray-600">{metric.label}</div>
                      <div className="text-xl font-bold text-gray-800">{metric.value}</div>
                    </div>
                  ))}
                </div>
                
                {/* Barra de Progresso */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-medium text-gray-700">Progresso do Cadastro</span>
                    <span className={`text-lg font-bold ${
                      team.pontosPunicao > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {Math.round((team.membrosCadastrados / team.tamanhoEsperado) * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        team.pontosPunicao > 0 
                          ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (team.membrosCadastrados / team.tamanhoEsperado) * 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Status da Equipe */}
                <div className={`text-center py-4 rounded-2xl transition-all duration-300 ${
                  team.pontosPunicao > 0 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}>
                  <span className="text-lg font-semibold">
                    {team.pontosPunicao > 0 ? '⚠️ Equipe com pendências' : '✅ Equipe em dia'}
                  </span>
                </div>
                
                {/* Lista de Membros Atrasados */}
                {team.membrosAposPrazo.length > 0 && (
                  <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-200">
                    <h5 className="font-semibold text-red-800 mb-3 text-lg">
                      ⚠️ Membros cadastrados após o prazo ({team.membrosAposPrazo.length}):
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {team.membrosAposPrazo.map((member) => (
                        <span
                          key={member.id}
                          className="px-3 py-2 bg-red-200 text-red-800 text-sm rounded-full font-medium hover:bg-red-300 transition-colors"
                          title={`Cadastrado em: ${new Date(member.created_at).toLocaleDateString('pt-BR')}`}
                        >
                          {member.full_name || member.name || `Membro ${member.id}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regras do Sistema com Design Moderno */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 rounded-3xl p-8 border border-gray-200 shadow-xl">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">📋</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Regras do Sistema de Punições</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg">⏰</span>
              </div>
              <span className="text-gray-700 text-lg">
                <strong>Prazo limite:</strong> 08/08/2025 às 23:59
              </span>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg">💥</span>
              </div>
              <span className="text-gray-700 text-lg">
                <strong>Punição:</strong> 5 pontos por integrante não cadastrado
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">🎯</span>
              </div>
              <span className="text-gray-700 text-lg">
                <strong>Meta por equipe:</strong>
              </span>
            </div>
            
            <div className="ml-12 space-y-2 text-lg text-gray-600">
              <div>• Dados e Indicadores: <strong>12</strong></div>
              <div>• Pós Operação: <strong>15</strong></div>
              <div>• Estudos e Proteção: <strong>21</strong></div>
              <div>• Planejamento de Redes: <strong>12</strong></div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl mt-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg">⚡</span>
              </div>
              <span className="text-gray-700 text-lg">
                <strong>Impacto:</strong> As punições são subtraídas da pontuação total da equipe
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 