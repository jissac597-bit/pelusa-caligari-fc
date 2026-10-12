import React from 'react';
import { ShieldCheck, Target, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import { Partido } from '@/types/database';

interface TeamStatsProps {
  partidos: Partido[];
}

export const TeamStats: React.FC<TeamStatsProps> = ({ partidos }) => {
  const partidosFinalizados = partidos.filter((p) => p.estatus === 'Finalizado');

  const golesFavor = partidosFinalizados.reduce((sum, p) => sum + (p.goles_pelusa || 0), 0);
  const golesContra = partidosFinalizados.reduce((sum, p) => sum + (p.goles_rival || 0), 0);
  const diferenciaGoles = golesFavor - golesContra;

  const victorias = partidosFinalizados.filter((p) => (p.goles_pelusa || 0) > (p.goles_rival || 0)).length;
  const empates = partidosFinalizados.filter((p) => (p.goles_pelusa || 0) === (p.goles_rival || 0)).length;
  const derrotas = partidosFinalizados.filter((p) => (p.goles_pelusa || 0) < (p.goles_rival || 0)).length;

  const vallasInvictas = partidosFinalizados.filter(
    (p) => p.valla_invicta || (p.goles_rival || 0) === 0
  ).length;

  const puntosTotales = victorias * 3 + empates * 1;
  const puntosPosibles = partidosFinalizados.length * 3;
  const efectividad = puntosPosibles > 0 ? Math.round((puntosTotales / puntosPosibles) * 100) : 0;

  return (
    <div className="w-full bg-pelusa-dark/95 border border-zinc-800 rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pelusa-gold" />
            Balance General del Equipo
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Rendimiento global en el torneo</p>
        </div>
        <div className="bg-pelusa-black border border-pelusa-gold/30 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-xs text-zinc-400">Efectividad: </span>
          <span className="text-sm font-black text-pelusa-gold">{efectividad}%</span>
        </div>
      </div>

      {/* Tarjetas Clave: Goles Favor, Contra, Diferencia */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-pelusa-black/80 border border-zinc-800 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mb-1">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Goles a Favor</span>
          </div>
          <p className="text-3xl font-black text-emerald-400">{golesFavor}</p>
          <span className="text-[0.6875rem] text-zinc-500 uppercase tracking-wider">Generados</span>
        </div>

        <div className="bg-pelusa-black/80 border border-zinc-800 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mb-1">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Goles en Contra</span>
          </div>
          <p className="text-3xl font-black text-red-400">{golesContra}</p>
          <span className="text-[0.6875rem] text-zinc-500 uppercase tracking-wider">Recibidos</span>
        </div>

        <div className="bg-pelusa-black/80 border border-zinc-800 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs mb-1">
            <Award className="w-4 h-4 text-pelusa-gold" />
            <span>Diferencia</span>
          </div>
          <p
            className={`text-3xl font-black ${
              diferenciaGoles > 0
                ? 'text-pelusa-gold'
                : diferenciaGoles < 0
                ? 'text-red-400'
                : 'text-zinc-300'
            }`}
          >
            {diferenciaGoles > 0 ? `+${diferenciaGoles}` : diferenciaGoles}
          </p>
          <span className="text-[0.6875rem] text-zinc-500 uppercase tracking-wider">Dif. Neta</span>
        </div>
      </div>

      {/* Récord y Desglose de Partidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3">
          <span className="text-xs text-zinc-400">Partidos Jugados</span>
          <p className="text-xl font-bold text-white mt-0.5">{partidosFinalizados.length}</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3">
          <span className="text-xs text-zinc-400">Récord (V-E-D)</span>
          <p className="text-xl font-bold text-white mt-0.5">
            <span className="text-emerald-400">{victorias}</span> -{' '}
            <span className="text-zinc-400">{empates}</span> -{' '}
            <span className="text-red-400">{derrotas}</span>
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3">
          <span className="text-xs text-zinc-400">Puntos Sumados</span>
          <p className="text-xl font-bold text-pelusa-gold mt-0.5">{puntosTotales} pts</p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3">
          <span className="text-xs text-zinc-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Vallas Invictas
          </span>
          <p className="text-xl font-bold text-emerald-400 mt-0.5">{vallasInvictas}</p>
        </div>
      </div>
    </div>
  );
};
export default TeamStats;
