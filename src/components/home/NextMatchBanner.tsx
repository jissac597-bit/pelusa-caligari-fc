import React from 'react';
import { Calendar, Clock, MapPin, ShieldAlert } from 'lucide-react';
import { Partido } from '@/types/database';

interface NextMatchBannerProps {
  partido: Partido | null;
}

export const NextMatchBanner: React.FC<NextMatchBannerProps> = ({ partido }) => {
  if (!partido) {
    return (
      <div className="w-full bg-pelusa-dark/90 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 backdrop-blur-md">
        <ShieldAlert className="w-10 h-10 mx-auto mb-2 text-zinc-500" />
        <p className="text-base font-bold text-zinc-300">No hay partidos programados por el momento.</p>
      </div>
    );
  }

  const matchDate = new Date(partido.fecha_hora);
  const formattedDate = matchDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = matchDate.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-pelusa-dark/95 via-pelusa-black/95 to-black/95 border-2 border-pelusa-gold/40 p-5 sm:p-7 md:p-9 shadow-2xl backdrop-blur-md">
      {/* Glows decorativos */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pelusa-gold/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
        
        {/* Info del Encuentro: Pelusa Caligari vs Rival */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8 w-full md:w-auto">
          <div className="text-center sm:text-left">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-pelusa-gold block mb-0.5">
              Local
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight drop-shadow-md">
              Pelusa Caligari
            </h2>
          </div>

          <div className="flex flex-col items-center my-0.5 sm:my-0 px-2">
            <span className="text-[10px] sm:text-xs font-black bg-pelusa-dark border border-pelusa-gold/60 text-pelusa-gold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
              VS
            </span>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-black text-red-400 block mb-0.5">
              Rival
            </span>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight drop-shadow-md">
              {partido.rival}
            </h2>
          </div>
        </div>

        {/* Metadatos: Cancha, Fecha y Hora */}
        <div className="flex flex-col sm:flex-row md:flex-col items-center sm:justify-center md:items-end gap-3 text-xs sm:text-sm md:text-base text-zinc-200 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-800 pt-5 md:pt-0 md:pl-8">
          <div className="flex items-center gap-2.5 bg-pelusa-dark/90 px-4 py-2 rounded-xl border border-zinc-700/80 w-full sm:w-auto justify-center sm:justify-start shadow-sm font-bold">
            <Calendar className="w-5 h-5 text-pelusa-gold shrink-0" />
            <span className="capitalize">{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2.5 bg-pelusa-dark/90 px-4 py-2 rounded-xl border border-zinc-700/80 w-full sm:w-auto justify-center sm:justify-start shadow-sm font-bold">
            <Clock className="w-5 h-5 text-pelusa-gold shrink-0" />
            <span>{formattedTime} hrs</span>
          </div>

          <div className="flex items-center gap-2.5 bg-pelusa-dark/90 px-4 py-2 rounded-xl border border-zinc-700/80 w-full sm:w-auto justify-center sm:justify-start shadow-sm font-bold">
            <MapPin className="w-5 h-5 text-pelusa-gold shrink-0" />
            <span>{partido.cancha}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NextMatchBanner;
