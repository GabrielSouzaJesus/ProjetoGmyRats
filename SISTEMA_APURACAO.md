# Sistema de Apuração - GymRats App

## 📋 Visão Geral

O Sistema de Apuração foi criado para permitir que os administradores bloqueiem o acesso ao dashboard durante a fase final da competição, enquanto trabalham nas premiações e cálculos finais.

## 🎯 Funcionalidades

### 1. Tela de Apuração Profissional
- **Design moderno** com gradientes e animações
- **Mensagens dinâmicas** que alternam automaticamente
- **Indicadores de progresso** visuais
- **Responsivo** para todos os dispositivos
- **Animações suaves** para melhor UX

### 2. Controle Administrativo
- **Painel de controle** no canto inferior direito (apenas para admins)
- **Dois modos disponíveis**:
  - **Modo Apuração**: Para fase final da competição
  - **Modo Manutenção**: Para manutenção técnica
- **Ativação/desativação** com confirmação de segurança

## 🚀 Como Usar

### Para Administradores:

1. **Acesse o dashboard** normalmente
2. **Faça login** como administrador
3. **Localize o painel de controle** no canto inferior direito
4. **Clique em "Ativar"** para abrir o modal de configuração
5. **Selecione "Modo Apuração"** para a fase final da competição
6. **Confirme a ativação**

### Para Desativar:
1. **Clique em "Desativar"** no painel de controle
2. **O sistema voltará ao normal** imediatamente

## 🎨 Características da Tela de Apuração

### Elementos Visuais:
- **Ícone de troféu** animado
- **Título**: "Sistema em Apuração"
- **Subtítulo**: "Fase Final da Competição"
- **Mensagens rotativas**:
  - "Calculando pontuações finais..."
  - "Processando dados dos treinos..."
  - "Preparando rankings..."
  - "Finalizando premiações..."

### Indicadores de Status:
- ✅ **Dados Coletados**: 100%
- 🔄 **Processando**: Em andamento
- ⏰ **Premiações**: Em breve

### Design:
- **Background**: Gradiente azul/roxo/índigo
- **Efeitos**: Blur, animações de partículas
- **Cores**: Esquema profissional com dourado para destaque
- **Tipografia**: Inter (Google Fonts)

## ⚙️ Configuração Técnica

### Arquivos Principais:
- `src/components/ApuracaoScreen.jsx` - Componente da tela
- `src/config/maintenance.js` - Configurações
- `src/hooks/useMaintenance.js` - Hook de controle
- `src/components/MaintenanceControl.jsx` - Painel de controle

### Configurações Disponíveis:
```javascript
// Em src/config/maintenance.js
export const maintenanceConfig = {
  isActive: false, // Ativar/desativar
  mode: 'apuration', // 'apuration' ou 'maintenance'
  customMessage: "Mensagem personalizada...",
  estimatedReturn: "Em breve",
  supportContact: "contato@gymrats.com"
};
```

## 🔧 Personalização

### Alterar Mensagens:
Edite o array `messages` em `ApuracaoScreen.jsx`:
```javascript
const messages = [
  "Sua mensagem personalizada...",
  "Outra mensagem...",
  // Adicione quantas quiser
];
```

### Alterar Cores:
Modifique as classes Tailwind no componente:
```javascript
// Background
bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900

// Ícone principal
from-yellow-400 to-orange-500
```

### Alterar Tempo de Rotação:
```javascript
// Em ApuracaoScreen.jsx, linha ~30
setInterval(() => {
  setCurrentMessage(prev => (prev + 1) % messages.length);
}, 3000); // 3 segundos - altere aqui
```

## 🛡️ Segurança

- **Apenas administradores** podem ativar/desativar
- **Confirmação obrigatória** antes da ativação
- **Persistência local** para manter estado
- **Verificação periódica** do status

## 📱 Responsividade

A tela foi projetada para funcionar perfeitamente em:
- **Desktop** (1920px+)
- **Tablet** (768px - 1024px)
- **Mobile** (320px - 767px)

## 🎯 Casos de Uso

### Fase Final da Competição:
1. Ative o **Modo Apuração**
2. Trabalhe nas premiações sem pressão
3. Finalize os cálculos
4. Desative quando estiver pronto

### Manutenção Técnica:
1. Ative o **Modo Manutenção**
2. Faça as correções necessárias
3. Teste o sistema
4. Desative quando concluído

## 🚨 Importante

- **Sempre teste** antes de ativar em produção
- **Informe os usuários** sobre a manutenção
- **Tenha um plano B** caso algo dê errado
- **Monitore** o sistema durante a manutenção

## 📞 Suporte

Em caso de problemas:
1. Verifique o console do navegador
2. Confirme se está logado como admin
3. Tente desativar e reativar
4. Limpe o localStorage se necessário

---

**Desenvolvido para GymRats App** 🏆
