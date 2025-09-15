import { useState } from 'react';

export default function GenderSelector({ selectedGender, onGenderChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const genderOptions = [
    { value: 'all', label: 'Todos', icon: '👥' },
    { value: 'masculino', label: 'Masculino', icon: '👨' },
    { value: 'feminino', label: 'Feminino', icon: '👩' }
  ];

  const selectedOption = genderOptions.find(option => option.value === selectedGender) || genderOptions[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-3 hover:bg-white transition-all shadow-sm"
      >
        <span className="text-lg">{selectedOption.icon}</span>
        <span className="font-medium text-gray-900">{selectedOption.label}</span>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {genderOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onGenderChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                selectedGender === option.value ? 'bg-gradient-to-r from-azul-50 to-verde-50 text-azul-700' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
              {selectedGender === option.value && (
                <svg className="w-4 h-4 ml-auto text-azul-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay para fechar o dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
