import { UserGroupIcon, UsersIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";

export default function SummaryCards({ members = [], teams = [], checkins = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <p className="text-sm text-gray-500">Participantes</p>
        <p className="text-2xl font-bold">{members.length}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <p className="text-sm text-gray-500">Equipes</p>
        <p className="text-2xl font-bold">{teams.length}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md text-center">
        <p className="text-sm text-gray-500">Total de Check-ins</p>
        <p className="text-2xl font-bold">{checkins.length}</p>
      </div>
    </div>
  );
}