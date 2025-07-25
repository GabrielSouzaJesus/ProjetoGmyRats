import Link from "next/link";
import { ChartBarIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col fixed shadow-lg z-10">
      <div className="p-6 font-bold text-2xl tracking-tight">GymRats</div>
      <nav className="flex-1">
        <ul>
          <li>
            <Link href="/dashboard" className="flex items-center gap-3 p-4 hover:bg-gray-800 transition-colors">
              <ChartBarIcon className="w-5 h-5" /> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin" className="flex items-center gap-3 p-4 hover:bg-gray-800 transition-colors">
              <Cog6ToothIcon className="w-5 h-5" /> Admin
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}