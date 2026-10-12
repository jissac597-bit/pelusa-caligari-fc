import React, { useState } from 'react';
import { User, Footprints } from 'lucide-react';
import { Jugador } from '@/types/database';

export interface PlayerCardStats {
  pj?: number;
  partidosJugados?: number;
  goles?: number;
  totalGoles?: number;
  asistencias?: number;
  totalAsistencias?: number;
  mvps?: number;
  totalMvps?: number;
  promedioCalificacion?: number;
  overall?: number;
}

interface PlayerCardProps {
  jugador: Jugador & PlayerCardStats;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ jugador }) => {
  const [imgError, setImgError] = useState(false);

  // Stats reales
  const pj = jugador.pj ?? jugador.partidosJugados ?? 0;
  const goles = jugador.goles ?? jugador.totalGoles ?? 0;
  const asistencias = jugador.asistencias ?? jugador.totalAsistencias ?? 0;
  const mvps = jugador.mvps ?? jugador.totalMvps ?? 0;
  const tir = goles * 10;
  const pas = asistencias * 10;

  // Overall (Media): viene calculado desde la vista principal o fallback a 70
  const overall = jugador.overall ?? 70;

  // Posición corta
  const posicion = (jugador.posicion || 'JUG').trim().toUpperCase();

  // Pie hábil
  const pieDisplay =
    jugador.pierna_habil === 'Izquierdo'
      ? 'IZQ'
      : jugador.pierna_habil === 'Derecho'
      ? 'DER'
      : jugador.pierna_habil
      ? jugador.pierna_habil.toUpperCase()
      : 'DER';

  const hasAvatar = Boolean(jugador.avatar_url && jugador.avatar_url.trim() !== '' && !imgError);

  return (
    <div className="relative group w-full max-w-[15rem] sm:max-w-[16rem] transition-all duration-300 hover:scale-105 select-none drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]">
      {/* Contenedor Exterior: Borde y Silueta de Escudo FUT EA Sports FC 27 */}
      <div
        className="relative p-[2.5px] rounded-t-lg bg-gradient-to-b from-[#fceea6] via-[#d4af37] to-[#aa7c11] shadow-2xl border border-[#fceea6]/80 overflow-hidden"
        style={{
          clipPath:
            'polygon(0 0, 100% 0, 100% calc(100% - 24px), 50% 100%, 0 calc(100% - 24px))',
        }}
      >
        {/* Cuerpo Interior de la Carta: Gradiente Oro EA FC 27 */}
        <div
          className="relative bg-gradient-to-b from-[#f9e596] via-[#d4af37] to-[#aa7c11] text-[#2a2a2a] p-3 pt-3.5 pb-7 flex flex-col justify-between overflow-hidden"
          style={{
            clipPath:
              'polygon(0 0, 100% 0, 100% calc(100% - 22px), 50% 100%, 0 calc(100% - 22px))',
          }}
        >
          {/* Texturas y Reflejos Dorados Premium */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/35 via-transparent to-black/25 pointer-events-none" />
          <div className="absolute top-0 -left-10 w-28 h-28 bg-white/20 rounded-full blur-xl pointer-events-none" />

          {/* DISTRIBUCIÓN SUPERIOR */}
          <div className="relative z-20 flex justify-between items-start pointer-events-none">
            {/* Esquina superior izquierda: Media (Overall) y Posición */}
            <div className="flex flex-col items-center leading-none">
              <span className="text-3xl font-black text-[#2a2a2a] tracking-tighter font-mono drop-shadow-sm">
                {overall}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3d2f09] mt-0.5">
                {posicion}
              </span>
              <span className="text-base mt-1 drop-shadow-xs" title="México">
                🇲🇽
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Pelusa FC"
                className="w-4 h-4 object-contain mt-1 opacity-80"
              />
            </div>

            {/* Esquina superior derecha: Dorsal y Pierna Hábil */}
            <div className="flex flex-col items-end leading-none">
              <span className="text-sm font-black text-[#443309]/80">
                #{jugador.dorsal ?? '--'}
              </span>
              <div className="flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider text-[#443309] mt-1 bg-white/30 px-1 py-0.5 rounded">
                <Footprints className="w-2 h-2 text-[#443309]" />
                <span>{pieDisplay}</span>
              </div>
            </div>
          </div>

          {/* AVATAR: Foto real o Silueta profesional con Lucide User */}
          <div className="relative w-full flex items-center justify-center -mt-3 mb-1">
            {hasAvatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={jugador.avatar_url!}
                alt={jugador.nombre}
                onError={() => setImgError(true)}
                className="w-24 h-24 object-contain mx-auto drop-shadow-md relative z-10"
              />
            ) : (
              <div className="w-24 h-24 mx-auto flex items-center justify-center bg-black/10 rounded-full border border-black/15 shadow-inner">
                <User className="w-16 h-16 text-[#555] drop-shadow-sm" />
              </div>
            )}
          </div>

          {/* NOMBRE DEL JUGADOR */}
          <div className="relative z-10 text-center">
            <h3 className="text-sm font-black uppercase tracking-tighter truncate px-1 text-[#2a2a2a] drop-shadow-xs">
              {jugador.nombre}
            </h3>
          </div>

          {/* LÍNEA SEPARADORA */}
          <div className="border-t border-[#8a6825]/30 w-11/12 mx-auto my-1 relative z-10" />

          {/* DISTRIBUCIÓN INFERIOR: CUADRÍCULA DE 6 ESTADÍSTICAS TIPO FIFA */}
          {/* Fila 1: PJ | GOL | AST */}
          {/* Fila 2: MVP | TIR | PAS */}
          <div className="relative z-10 grid grid-cols-3 gap-x-2 gap-y-1 text-center pb-2 px-1">
            {/* Columna 1 */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#5a4310] font-bold tracking-wider leading-none">PJ</span>
              <span className="text-xs font-black text-[#2a2a2a] leading-tight">{pj}</span>
            </div>

            {/* Columna 2 */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#5a4310] font-bold tracking-wider leading-none">GOL</span>
              <span className="text-xs font-black text-[#2a2a2a] leading-tight">{goles}</span>
            </div>

            {/* Columna 3 */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#5a4310] font-bold tracking-wider leading-none">AST</span>
              <span className="text-xs font-black text-[#2a2a2a] leading-tight">{asistencias}</span>
            </div>

            {/* Columna 4 (Fila 2) */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#5a4310] font-bold tracking-wider leading-none">MVP</span>
              <span className="text-xs font-black text-[#2a2a2a] leading-tight">{mvps}</span>
            </div>

            {/* Columna 5 (Fila 2) */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#5a4310] font-bold tracking-wider leading-none">TIR</span>
              <span className="text-xs font-black text-[#2a2a2a] leading-tight">{tir}</span>
            </div>

            {/* Columna 6 (Fila 2) */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-[#5a4310] font-bold tracking-wider leading-none">PAS</span>
              <span className="text-xs font-black text-[#2a2a2a] leading-tight">{pas}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlayerCard;
