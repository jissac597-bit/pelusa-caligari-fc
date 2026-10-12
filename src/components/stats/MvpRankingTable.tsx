import React from 'react';
import { Trophy } from 'lucide-react';
import { PlayerStatEntry } from './TopScorersTable';

interface MvpRankingTableProps {
  jugadores: PlayerStatEntry[];
}

export const MvpRankingTable: React.FC<MvpRankingTableProps> = ({ jugadores }) => {
  const sorted = [...jugadores].sort((a, b) => {
    if (b.totalMvps !== a.totalMvps) return b.totalMvps - a.totalMvps;
    return b.promedioCalificacion - a.promedioCalificacion;
  });

  return (
    <div className="w-full bg-pelusa-dark/95 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-5 h-5 text-pelusa-gold" />
          Ranking de Jugador del Partido (MVP)
        </h3>
        <span className="text-xs text-pelusa-gold font-bold">Temporada Actual</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-pelusa-black text-zinc-400 uppercase text-xs">
            <tr>
              <th className="p-3 text-center w-12">#</th>
              <th className="p-3">Jugador</th>
              <th className="p-3 text-center">Pos</th>
              <th className="p-3 text-center">Partidos</th>
              <th className="p-3 text-center font-bold text-pelusa-gold">Premios MVP</th>
              <th className="p-3 text-center">Calificación Promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 bg-pelusa-dark/50">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-zinc-500">
                  No hay MVPs otorgados aún.
                </td>
              </tr>
            ) : (
              sorted.map((j, idx) => (
                <tr
                  key={j.id}
                  className={`hover:bg-zinc-800/40 transition-colors ${
                    idx === 0 ? 'bg-pelusa-gold/10 font-bold' : ''
                  }`}
                >
                  <td className="p-3 text-center font-extrabold text-zinc-400">
                    {idx === 0 ? (
                      <span className="text-pelusa-gold text-base">👑</span>
                    ) : idx === 1 ? (
                      <span className="text-zinc-300 text-base">🥈</span>
                    ) : idx === 2 ? (
                      <span className="text-amber-700 text-base">🥉</span>
                    ) : (
                      idx + 1
                    )}
                  </td>
                  <td className="p-3 font-semibold text-white flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={j.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(j.nombre)}`}
                      alt={j.nombre}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(j.nombre)}`;
                      }}
                      className="w-8 h-8 rounded-full bg-gray-800 object-cover border border-zinc-700 shrink-0"
                    />
                    <span>
                      #{j.dorsal ?? '--'} {j.nombre}
                    </span>
                  </td>
                  <td className="p-3 text-center text-zinc-400 text-xs">{j.posicion || 'JUG'}</td>
                  <td className="p-3 text-center text-zinc-300">{j.partidosJugados}</td>
                  <td className="p-3 text-center font-black text-pelusa-gold text-base">
                    {j.totalMvps}
                  </td>
                  <td className="p-3 text-center text-zinc-300 font-semibold">
                    {j.promedioCalificacion > 0 ? j.promedioCalificacion.toFixed(1) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default MvpRankingTable;
