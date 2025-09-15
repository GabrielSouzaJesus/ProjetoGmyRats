# 🛠️ Guia do Sistema de Manutenção/Apuração

## 📋 Visão Geral

O sistema de manutenção foi criado para permitir que você bloqueie o acesso ao dashboard durante a fase final da competição, enquanto trabalha nas premiações e cálculos finais.

## 🎯 Como Funciona

### Para Usuários Normais:
- Quando ativo, todos os usuários veem uma tela elegante de "Sistema em Apuração"
- Não conseguem acessar rankings, dados ou funcionalidades do dashboard
- Veem animações e informações sobre o status da apuração

### Para Administradores:
- Podem ativar/desativar o modo de manutenção
- Controle disponível no canto inferior direito da tela
- Confirmação obrigatória antes de ativar

## 🚀 Como Ativar o Modo de Apuração

### Método 1: Interface Administrativa (Recomendado)
1. Faça login como administrador
2. Procure o controle no canto inferior direito da tela
3. Clique em "Ativar" 
4. Confirme a ação no modal
5. O sistema será bloqueado imediatamente

### Método 2: Variável de Ambiente
1. Crie/edite o arquivo `.env.local`
2. Adicione: `NEXT_PUBLIC_MAINTENANCE_MODE=true`
3. Reinicie o servidor

### Método 3: Local Storage (Para Testes)
1. Abra o console do navegador (F12)
2. Execute: `localStorage.setItem('maintenance-mode', 'true')`
3. Recarregue a página

## 🔧 Como Desativar o Modo de Apuração

### Método 1: Interface Administrativa
1. Acesse a tela de manutenção
2. Use o controle no canto inferior direito
3. Clique em "Desativar"

### Método 2: Variável de Ambiente
1. Edite o arquivo `.env.local`
2. Mude para: `NEXT_PUBLIC_MAINTENANCE_MODE=false`
3. Reinicie o servidor

### Método 3: Local Storage
1. Console do navegador: `localStorage.setItem('maintenance-mode', 'false')`
2. Recarregue a página

## 🎨 Personalização

### Mensagens Personalizadas
Edite o arquivo `src/config/maintenance.js`:
```javascript
export const maintenanceConfig = {
  isActive: false,
  customMessage: "Sua mensagem personalizada aqui",
  estimatedReturn: "Data estimada",
  supportContact: "seu-email@exemplo.com"
};
```

### Cores e Estilo
Edite o arquivo `src/components/MaintenanceScreen.jsx` para personalizar:
- Cores do gradiente de fundo
- Animações
- Textos e ícones
- Layout geral

## 🔒 Segurança

- Apenas administradores autenticados podem ativar/desativar
- Confirmação obrigatória antes de ativar
- Múltiplas formas de controle (interface, env, localStorage)
- Verificação automática a cada 30 segundos

## 📱 Responsividade

- Design totalmente responsivo
- Funciona em desktop, tablet e mobile
- Animações otimizadas para diferentes dispositivos

## 🚨 Cenários de Uso

### Fase Final da Competição
- Ativar durante cálculos finais
- Bloquear acesso aos rankings
- Mostrar status de apuração

### Manutenção Técnica
- Ativar durante atualizações
- Informar sobre melhorias
- Manter usuários informados

### Problemas Técnicos
- Ativar em caso de bugs críticos
- Comunicar sobre correções
- Evitar confusão dos usuários

## 💡 Dicas

1. **Teste antes**: Sempre teste o modo de manutenção antes de ativar em produção
2. **Comunique**: Informe os usuários sobre quando o sistema voltará
3. **Backup**: Tenha sempre uma forma de desativar (múltiplos métodos)
4. **Monitoramento**: Verifique se está funcionando corretamente

## 🆘 Solução de Problemas

### Não consegue desativar?
1. Tente o método via localStorage
2. Verifique a variável de ambiente
3. Reinicie o servidor

### Tela não aparece?
1. Verifique se o componente está importado
2. Confirme se o hook está funcionando
3. Verifique o console para erros

### Controle não aparece?
1. Confirme se está logado como administrador
2. Verifique se o componente está renderizado
3. Confirme se `isAuthenticated` está true

---

**Desenvolvido para GymRats Challenge 2025** 🏆
