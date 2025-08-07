'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/temporal-analysis', label: 'Análise Temporal', icon: '📈' },
    { href: '/gallery', label: 'FitGram', icon: '📸' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-semibold">Desafio GymRats</h1>
          <nav className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <span className="text-sm text-gray-500">🕒 60 dias de energia total</span>
      </header>
      <main className="px-6 md:px-12 py-8">{children}</main>
    </div>
  );
}