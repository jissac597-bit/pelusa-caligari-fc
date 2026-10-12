import React from 'react';
import { Footprints, DollarSign } from 'lucide-react';
import { Jugador } from '@/types/database';

interface PlayerCardProps {
  jugador: Jugador & {
    totalGoles?: number;
    totalAsistencias?: number;
    promedioCalificacion?: number;
    totalMvps?: number;
    partidosJugados?: number;
    overall?: number;
  };
  showFinancialStatus?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  jugador,
  showFinancialStatus = false,
}) => {
  const totalGoles = jugador.totalGoles ?? 0;
  const totalAsistencias = jugador.totalAsistencias ?? 0;
  const promedioCalificacion = jugador.promedioCalificacion ?? 0;
  const totalMvps = jugador.totalMvps ?? 0;
  const partidosJugados = jugador.partidosJugados ?? 0;

  // Lógica del Overall (Media):
  // Si viene calculado dinámicamente, se usa directamente.
  // Si no, o si no tiene partidos (promedioCalificacion <= 0), por defecto es 70.
  const overall = jugador.overall !== undefined
    ? jugador.overall
    : promedioCalificacion > 0
    ? Math.round(promedioCalificacion * 10)
    : 70;

  const avatarSrc =
    jugador.avatar_url && jugador.avatar_url.trim() !== ''
      ? jugador.avatar_url
      : `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(
          jugador.nombre
        )}`;

  // Formato para Pierna Hábil
  const pieDisplay =
    jugador.pierna_habil === 'Izquierdo'
      ? 'IZQ'
      : jugador.pierna_habil === 'Derecho'
      ? 'DER'
      : jugador.pierna_habil
      ? jugador.pierna_habil.toUpperCase()
      : 'DER';

  return (
    <div className="relative group w-full max-w-[18.5rem] transition-all duration-300 hover:scale-105 select-none drop-shadow-[0_20px_25px_rgba(0,0,0,0.7)]">
      {/* Silueta de Escudo / Carta FUT (EA Sports FC 27 Shield Cutout) */}
      <div
        className="relative p-[3px] bg-gradient-to-b from-[#FFE27D] via-[#C99726] to-[#453106] shadow-2xl"
        style={{
          clipPath:
            'polygon(0 0, 100% 0, 100% calc(100% - 32px), 50% 100%, 0 calc(100% - 32px))',
        }}
      >
        <div
          className="relative bg-gradient-to-b from-[#1E190F] via-[#120F09] to-[#0A0804] text-white p-4 pt-5 pb-9 flex flex-col justify-between overflow-hidden"
          style={{
            clipPath:
              'polygon(0 0, 100% 0, 100% calc(100% - 30px), 50% 100%, 0 calc(100% - 30px))',
          }}
        >
          {/* Textura geométrica dorada de fondo estilo Ultimate Team */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFD25F]/20 via-transparent to-black/80 pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#FFE27D]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 right-0 w-40 h-40 bg-[#C99726]/10 rounded-full blur-3xl pointer-events-none" />

          {/* PARTE SUPERIOR: Columna Izquierda (Overall, Posición, Bandera) + Escudo Club */}
          <div className="relative z-20 flex justify-between items-start pointer-events-none">
            {/* Columna Izquierda estilo EA FC */}
            <div className="flex flex-col items-center leading-none">
              <span className="text-4xl sm:text-5xl font-black tracking-tighter text-[#FFE58F] font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {overall}
              </span>
              <span className="text-base sm:text-lg font-black text-white uppercase tracking-wider mt-1 drop-shadow-sm">
                {jugador.posicion || 'JUG'}
              </span>
              <span className="text-2xl mt-1.5 drop-shadow-md" title="México">
                🇲🇽
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Pelusa FC"
                className="w-6 h-6 object-contain mt-1 opacity-90"
              />
            </div>

            {/* Dorsal en la esquina superior derecha */}
            <div className="flex flex-col items-end">
              <span className="text-lg sm:text-xl font-black text-[#FFE58F]/70 drop-shadow-sm">
                #{jugador.dorsal ?? '--'}
              </span>
            </div>
          </div>

          {/* AVATAR EN EL CENTRO SUPERIOR (HTML estándar <img> a prueba de fallos) */}
          <div className="relative w-full -mt-16 mb-2 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt={jugador.nombre}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                  jugador.nombre
                )}`;
              }}
              className="w-32 h-32 object-contain mx-auto relative z-10 drop-shadow-xl"
            />
          </div>

          {/* NOMBRE DEL JUGADOR CON BANDA ESTILO FUT */}
          <div className="relative z-10 text-center mb-2.5">
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest text-[#FFF4CC] truncate drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              {jugador.nombre}
            </h3>
            <div className="h-[2px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-[#FFD25F] to-transparent mt-1 mb-1.5 opacity-80" />
            
            {/* Pierna Hábil */}
            <div className="inline-flex items-center gap-1 text-[0.6875rem] font-black uppercase tracking-wider text-[#FFD25F] bg-black/60 px-2 py-0.5 rounded-full border border-[#FFD25F]/30">
              <Footprints className="w-3 h-3 text-[#FFD25F]" />
              <span>PIE: {pieDisplay}</span>
            </div>
          </div>

          {/* PARTE INFERIOR: ESTADÍSTICAS ESTILO BLOQUE ULTIMATE TEAM */}
          {/* Fila 1: PJ | GOL  --  Fila 2: AST | MVP */}
          <div className="relative z-10 py-2.5 px-3 border-t border-b border-[#FFD25F]/35 bg-black/50 backdrop-blur-sm rounded-xl space-y-2">
            {/* Fila 1: PJ (Partidos Jugados) | GOL (Goles) */}
            <div className="grid grid-cols-2 divide-x divide-[#FFD25F]/20 text-center">
              <div className="flex items-center justify-between px-2">
                <span className="text-[#FFD25F] text-xs font-black tracking-wider">PJ</span>
                <span className="text-white text-base sm:text-lg font-black">{partidosJugados}</span>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-[#FFD25F] text-xs font-black tracking-wider">GOL</span>
                <span className="text-white text-base sm:text-lg font-black">{totalGoles}</span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-[#FFD25F]/15" />

            {/* Fila 2: AST (Asistencias) | MVP (Veces MVP) */}
            <div className="grid grid-cols-2 divide-x divide-[#FFD25F]/20 text-center">
              <div className="flex items-center justify-between px-2">
                <span className="text-[#FFD25F] text-xs font-black tracking-wider">AST</span>
                <span className="text-white text-base sm:text-lg font-black">{totalAsistencias}</span>
              </div>
              <div className="flex items-center justify-between px-2">
                <span className="text-[#FFD25F] text-xs font-black tracking-wider">MVP</span>
                <span className="text-white text-base sm:text-lg font-black">{totalMvps}</span>
              </div>
            </div>
          </div>

          {/* Monedero Virtual (Si está habilitado) */}
          {showFinancialStatus && (
            <div className="relative z-10 mt-2 flex justify-between items-center text-[0.6875rem] sm:text-xs px-2 pt-1">
              <span className="text-zinc-400 flex items-center gap-1 font-semibold">
                <DollarSign className="w-3 h-3 text-zinc-500" /> Saldo:
              </span>
              <span
                className={`font-black ${
                  Number(jugador.saldo_actual) < 0
                    ? 'text-red-400'
                    : Number(jugador.saldo_actual) > 0
                    ? 'text-emerald-400'
                    : 'text-zinc-400'
                }`}
              >
                ${Number(jugador.saldo_actual ?? 0).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default PlayerCard;
