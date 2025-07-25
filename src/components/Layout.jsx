export default function Layout({ children }) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-xl font-semibold">Desafio GymRats</h1>
          <span className="text-sm text-gray-500">🕒 60 dias de energia total</span>
        </header>
        <main className="px-6 md:px-12 py-8">{children}</main>
      </div>
    );
  }