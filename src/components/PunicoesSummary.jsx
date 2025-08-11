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
    <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-red-800">📊 Resumo de Punições</h2>
          <p className="text-gray-600 text-sm">Sistema de punições por equipe - Prazo: 08/08/2025 23:59</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
            {punicoesEquipes.length} equipes
          </div>
        </div>
      </div>

      {/* Cards de Resumo Geral */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{totalMembrosEsperados}</div>
          <div className="text-sm opacity-90">Total Esperado</div>
        </div>
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{totalMembrosCadastrados}</div>
          <div className="text-sm opacity-90">Total Cadastrados</div>
        </div>
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{totalMembrosFaltantes}</div>
          <div className="text-sm opacity-90">Total Faltantes</div>
        </div>
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">-{totalPunicoes}</div>
          <div className="text-sm opacity-90">Total Punições</div>
        </div>
      </div>

      {/* Lista de Equipes com Punições */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Detalhamento por Equipe</h3>
        
        {punicoesEquipes.map((team) => (
          <div
            key={team.id}
            className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border transition-all ${
              team.pontosPunicao > 0 
                ? 'border-red-200 bg-red-50/50' 
                : 'border-green-200 bg-green-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                  team.pontosPunicao > 0 
                    ? 'bg-red-500' 
                    : 'bg-green-500'
                }`}>
                  {team.pontosPunicao > 0 ? '⚠️' : '✅'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">{team.name}</h4>
                  <p className="text-sm text-gray-600">
                    {team.membrosCadastrados} de {team.tamanhoEsperado} membros
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                {team.pontosPunicao > 0 ? (
                  <div className="text-red-600">
                    <div className="text-2xl font-bold">-{team.pontosPunicao}</div>
                    <div className="text-sm">pontos</div>
                  </div>
                ) : (
                  <div className="text-green-600">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-sm">pontos</div>
                  </div>
                )}
              </div>
            </div>

            {/* Detalhes da Equipe */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <div className="font-semibold text-gray-700">{team.tamanhoEsperado}</div>
                <div className="text-xs text-gray-500">Meta</div>
              </div>
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <div className="font-semibold text-gray-700">{team.membrosCadastrados}</div>
                <div className="text-xs text-gray-500">Cadastrados</div>
              </div>
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <div className="font-semibold text-gray-700">{team.membrosFaltantes}</div>
                <div className="text-xs text-gray-500">Faltantes</div>
              </div>
              <div className="text-center p-2 bg-white/60 rounded-lg">
                <div className="font-semibold text-gray-700">{team.pontosPunicao}</div>
                <div className="text-xs text-gray-500">Punição</div>
              </div>
            </div>

            {/* Lista de Membros Atrasados */}
            {team.membrosAposPrazo.length > 0 && (
              <div className="mt-3 p-3 bg-red-100 rounded-lg">
                <h5 className="font-medium text-red-800 mb-2">
                  ⚠️ Membros cadastrados após o prazo ({team.membrosAposPrazo.length}):
                </h5>
                <div className="flex flex-wrap gap-2">
                  {team.membrosAposPrazo.map((member) => (
                    <span
                      key={member.id}
                      className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full"
                      title={`Cadastrado em: ${new Date(member.created_at).toLocaleDateString('pt-BR')}`}
                    >
                      {member.full_name || member.name || `Membro ${member.id}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Barra de Progresso */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progresso do Cadastro</span>
                <span>{Math.round((team.membrosCadastrados / team.tamanhoEsperado) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    team.pontosPunicao > 0 ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (team.membrosCadastrados / team.tamanhoEsperado) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer com Informações */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">📋 Regras do Sistema de Punições</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Prazo limite:</strong> 08/08/2025 às 23:59</li>
          <li>• <strong>Punição:</strong> 5 pontos por integrante não cadastrado</li>
          <li>• <strong>Meta por equipe:</strong> Dados e Indicadores (12), Pós Operação (15), Estudos e Proteção (21), Planejamento de Redes (12)</li>
          <li>• <strong>Impacto:</strong> As punições são subtraídas da pontuação total da equipe</li>
        </ul>
      </div>
    </div>
  );
} 