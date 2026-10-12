import React from 'react';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { Partido } from '@/types/database';

export interface AnotadorPartido {
  jugador_nombre: string;
  goles: number;
}

interface LastMatchWidgetProps {
  partido: Partido;
  anotadores: AnotadorPartido[];
}

export const LastMatchWidget: React.FC<LastMatchWidgetProps> = ({ partido, anotadores }) => {
  const matchDate = new Date(partido.fecha_hora);
  const formattedDate = matchDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const ganoPelusa = (partido.goles_pelusa || 0) > (partido.goles_rival || 0);
  const empato = (partido.goles_pelusa || 0) === (partido.goles_rival || 0);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-pelusa-dark/95 via-pelusa-black/95 to-black/95 border-2 border-pelusa-gold/40 p-5 sm:p-7 md:p-9 shadow-2xl backdrop-blur-md">
      {/* Glows decorativos */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-pelusa-gold/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Cabecera del Marcador: Estado y Fecha estilo Google Sports */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-zinc-800/80 pb-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-black uppercase tracking-wider">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-extrabold">Partido Finalizado</span>
            <span className="text-zinc-600 font-bold">&bull;</span>
            <span className="text-zinc-300 font-semibold capitalize">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-3">
            {partido.valla_invicta && (
              <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-[0.6875rem] font-black px-2.5 py-0.5 rounded-full">
                Valla Invicta 🧤
              </span>
            )}
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
              <MapPin className="w-3.5 h-3.5 text-pelusa-gold" />
              <span>{partido.cancha}</span>
            </div>
          </div>
        </div>

        {/* MARCADOR GIGANTE (Google Deportivo) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
          {/* Pelusa Caligari */}
          <div className="flex items-center justify-between md:justify-start gap-4 sm:gap-6 w-full md:w-auto">
            <div className="text-center md:text-left">
              <span className="text-xs uppercase tracking-widest font-black text-pelusa-gold block mb-0.5">
                Local
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight drop-shadow-md">
                Pelusa Caligari
              </h2>
            </div>
          </div>

          {/* Resultado Numérico Gigante Central */}
          <div className="flex items-center gap-4 sm:gap-6 bg-pelusa-black/80 px-6 sm:px-8 py-3 rounded-2xl border-2 border-pelusa-gold/40 shadow-inner">
            <span
              className={`text-4xl sm:text-5xl md:text-6xl font-black font-mono drop-shadow-md ${
                ganoPelusa ? 'text-pelusa-gold' : 'text-white'
              }`}
            >
              {partido.goles_pelusa ?? 0}
            </span>
            <span className="text-xl sm:text-2xl font-black text-zinc-500">-</span>
            <span
              className={`text-4xl sm:text-5xl md:text-6xl font-black font-mono drop-shadow-md ${
                !ganoPelusa && !empato ? 'text-red-400' : 'text-zinc-200'
              }`}
            >
              {partido.goles_rival ?? 0}
            </span>
          </div>

          {/* Rival */}
          <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 w-full md:w-auto">
            <div className="text-center md:text-right">
              <span className="text-xs uppercase tracking-widest font-black text-zinc-400 block mb-0.5">
                Visitante
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight drop-shadow-md">
                {partido.rival}
              </h2>
            </div>
          </div>
        </div>

        {/* LISTA DE ANOTADORES (Estilo Resúmenes Deportivos Google) */}
        <div className="pt-4 border-t border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-xs font-black uppercase tracking-wider text-pelusa-gold flex items-center gap-1.5 shrink-0">
              <Trophy className="w-3.5 h-3.5 text-pelusa-gold" /> Anotadores Pelusa:
            </span>

            {anotadores.length === 0 ? (
              <span className="text-xs text-zinc-500 italic">
                {partido.goles_pelusa === 0
                  ? 'Sin anotaciones en este partido'
                  : 'Goles no asignados en las actas'}
              </span>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {anotadores.map((a, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-pelusa-dark/90 border border-pelusa-gold/30 text-white font-bold text-xs sm:text-sm px-3 py-1 rounded-full shadow-sm"
                  >
                    <span>⚽</span>
                    <span className="text-zinc-100">{a.jugador_nombre}</span>
                    <span className="text-pelusa-gold font-black font-mono">
                      ({a.goles})
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LastMatchWidget;
