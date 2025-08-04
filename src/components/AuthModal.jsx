import React, { useState } from 'react';
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Senha do admin (em produção, usar sistema mais robusto)
  const ADMIN_PASSWORD = '252425';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === ADMIN_PASSWORD) {
      // Salvar sessão no localStorage
      localStorage.setItem('adminAuthenticated', 'true');
      localStorage.setItem('adminLoginTime', new Date().toISOString());
      
      onSuccess();
      onClose();
    } else {
      setError('Senha incorreta. Tente novamente.');
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-azul-600 to-verde-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <LockClosedIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Acesso Administrativo
                </h3>
                <p className="text-white/90 font-medium">
                  Digite a senha para continuar
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Administrador
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-azul-500 focus:border-transparent text-lg"
                  placeholder="Digite a senha"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-azul-600 to-verde-600 text-white rounded-xl hover:from-azul-700 hover:to-verde-700 transition-all duration-300 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verificando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <LockClosedIcon className="w-5 h-5" />
                    <span>Acessar</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              ⚠️ Acesso restrito apenas para administradores
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 