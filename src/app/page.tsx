'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Settings, Users, Target, Award, Trophy, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { NextMatchBanner } from '@/components/home/NextMatchBanner';
import { LastMatchWidget, AnotadorPartido } from '@/components/home/LastMatchWidget';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { TopScorersTable, PlayerStatEntry } from '@/components/stats/TopScorersTable';
import { AssistsTable } from '@/components/stats/AssistsTable';
import { MvpRankingTable } from '@/components/stats/MvpRankingTable';
import { TeamStats } from '@/components/stats/TeamStats';
import { supabase } from '@/lib/supabase/client';
import { Partido, Jugador, EstadisticaPartido } from '@/types/database';

type TabType = 'plantilla' | 'goleadores' | 'asistencias' | 'mvps' | 'balance';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('plantilla');
  const [jugadores, setJugadores] = useState<PlayerStatEntry[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [proximoPartido, setProximoPartido] = useState<Partido | null>(null);
  const [ultimoPartidoFinalizado, setUltimoPartidoFinalizado] = useState<Partido | null>(null);
  const [anotadoresUltimoPartido, setAnotadoresUltimoPartido] = useState<AnotadorPartido[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Fetch de Jugadores con Relaciones de Estadísticas
        const { data: jugadoresData, error: jugadoresError } = await supabase
          .from('jugadores')
          .select('*, estadisticas_partido(calificacion, goles, asistencias, asistencia, es_mvp)')
          .order('dorsal', { ascending: true });

        if (jugadoresError) {
          throw jugadoresError;
        }

        // 2. Fetch de Partidos
        const { data: partidosData, error: partidosError } = await supabase
          .from('partidos')
          .select('*')
          .order('fecha_hora', { ascending: true });

        if (partidosError) {
          console.warn('Error al consultar partidos:', partidosError.message);
        }

        // 3. Fetch de Estadísticas de Partidos (para scorer del último partido y fallback)
        const { data: statsData, error: statsError } = await supabase
          .from('estadisticas_partido')
          .select('*');

        if (statsError) {
          console.warn('Error al consultar estadisticas_partido:', statsError.message);
        }

        const rawPartidos = (partidosData || []) as Partido[];
        setPartidos(rawPartidos);

        const rawStats = (statsData || []) as EstadisticaPartido[];
        const rawJugadores = (jugadoresData || []) as any[];

        // Encontrar si hay un próximo partido programado
        const scheduled = rawPartidos.find((p) => p.estatus === 'Programado') || null;
        setProximoPartido(scheduled);

        // Si NO hay partido programado, buscar el último partido finalizado
        if (!scheduled) {
          const finalizados = rawPartidos
            .filter((p) => p.estatus === 'Finalizado')
            .sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());

          const lastFinished = finalizados[0] || null;
          setUltimoPartidoFinalizado(lastFinished);

          if (lastFinished) {
            // Anotadores de ese partido específico filtrando goles > 0
            const scorers: AnotadorPartido[] = rawStats
              .filter((s) => s.partido_id === lastFinished.id && Number(s.goles) > 0)
              .map((s) => {
                const jMatch = rawJugadores.find((j) => j.id === s.jugador_id);
                return {
                  jugador_nombre: jMatch?.nombre || 'Pelusa',
                  goles: Number(s.goles),
                };
              });
            setAnotadoresUltimoPartido(scorers);
          }
        }

        // Cruce y cálculo dinámico de estadísticas acumuladas por cada jugador
        const processedPlayers: PlayerStatEntry[] = rawJugadores.map((j) => {
          // Usar la relación estadisticas_partido de la consulta si existe, de lo contrario rawStats
          const pStats: any[] = Array.isArray(j.estadisticas_partido) && j.estadisticas_partido.length > 0
            ? j.estadisticas_partido
            : rawStats.filter((s) => s.jugador_id === j.id);

          const totalGoles = pStats.reduce((sum, s) => sum + Number(s.goles || 0), 0);
          const totalAsistencias = pStats.reduce((sum, s) => sum + Number(s.asistencias || 0), 0);
          const totalMvps = pStats.filter((s) => s.es_mvp).length;

          // Filtrar calificaciones válidas
          const ratings = pStats
            .map((s) => s.calificacion)
            .filter((c): c is number => c !== null && c !== undefined && !isNaN(Number(c)));

          const promedioCalificacion =
            ratings.length > 0
              ? ratings.reduce((sum, r) => sum + Number(r), 0) / ratings.length
              : 0;

          // Cálculo dinámico de Overall:
          // Si el jugador no tiene partidos/calificaciones, su overall por defecto será 70.
          // Si tiene calificación (escala 1.0 a 10.0), se multiplica por 10 y se redondea (ej. 8.5 -> 85).
          const overall = ratings.length > 0
            ? Math.round(promedioCalificacion * 10)
            : 70;

          const partidosJugados = pStats.filter((s) => s.asistencia === 'Presente').length;

          return {
            id: j.id,
            nombre: j.nombre,
            dorsal: j.dorsal,
            posicion: j.posicion,
            avatar_url: j.avatar_url,
            saldo_actual: j.saldo_actual,
            pierna_habil: j.pierna_habil,
            totalGoles,
            totalAsistencias,
            totalMvps,
            promedioCalificacion,
            partidosJugados,
            overall,
          };
        });

        // Orden Táctico Estricto: 1. POR -> 2. DEF -> 3. MED -> 4. DEL (y dorsal ASC si misma posición)
        const jerarquiaTactico: Record<string, number> = {
          POR: 1,
          DEF: 2,
          MED: 3,
          DEL: 4,
        };

        const sortedPlayers = [...processedPlayers].sort((a, b) => {
          const jerarquiaA = jerarquiaTactico[(a.posicion || '').trim().toUpperCase()] ?? 99;
          const jerarquiaB = jerarquiaTactico[(b.posicion || '').trim().toUpperCase()] ?? 99;

          if (jerarquiaA !== jerarquiaB) {
            return jerarquiaA - jerarquiaB;
          }

          const dorsalA = a.dorsal ?? 999;
          const dorsalB = b.dorsal ?? 999;
          return dorsalA - dorsalB;
        });

        setJugadores(sortedPlayers);
      } catch (err: any) {
        console.error('Error al cargar datos desde Supabase:', err);
        setErrorMsg(err?.message || 'Error al conectar con la base de datos');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const tabsConfig = [
    { id: 'plantilla' as TabType, label: 'Plantilla', icon: Users },
    { id: 'goleadores' as TabType, label: 'Goleadores', icon: Target },
    { id: 'asistencias' as TabType, label: 'Asistencias', icon: Award },
    { id: 'mvps' as TabType, label: 'MVPs', icon: Trophy },
    { id: 'balance' as TabType, label: 'Balance del Equipo', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* Barra de navegación superior con Logotipo Protagonista */}
      <nav className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-zinc-800/80 pb-6 sm:pb-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          {/* Logotipo Protagonista (mínimo 80x80 px responsivo) */}
          <div className="relative shrink-0 flex items-center justify-center p-2 rounded-3xl bg-pelusa-dark/90 border-2 border-pelusa-gold/40 shadow-2xl shadow-pelusa-gold/15 backdrop-blur-md">
            <Image
              alt="Logo Pelusa Caligari"
              height={100}
              src="/logo.png"
              width={100}
              className="object-contain w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-[0_4px_12px_rgba(255,184,0,0.3)]"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-white leading-none drop-shadow-md">
              PELUSA CALIGARI <span className="text-pelusa-gold">FC</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-zinc-300 font-bold uppercase tracking-wider mt-1 sm:mt-2">
              Portal Oficial &bull; El Glorioso Pambolero
            </p>
          </div>
        </div>

        <Link
          href="/admin"
          className="self-stretch sm:self-auto flex items-center justify-center gap-2.5 bg-pelusa-dark/90 hover:bg-zinc-800 text-pelusa-gold border-2 border-pelusa-gold/40 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-black transition-all shadow-xl hover:shadow-pelusa-gold/20 hover:scale-105 active:scale-95"
        >
          <Settings className="w-5 h-5" />
          <span>Panel Admin</span>
        </Link>
      </nav>

      {/* Widget Superior: Próximo Encuentro o Último Resultado Deportivo */}
      <section className="space-y-3">
        {proximoPartido ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3 drop-shadow-sm">
                <span className="w-3 h-3 rounded-full bg-pelusa-gold animate-pulse shadow-lg shadow-pelusa-gold/50" />
                PRÓXIMO ENCUENTRO
              </h2>
            </div>
            <NextMatchBanner partido={proximoPartido} />
          </>
        ) : ultimoPartidoFinalizado ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3 drop-shadow-sm">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                ÚLTIMO RESULTADO OFICIAL
              </h2>
            </div>
            <LastMatchWidget
              partido={ultimoPartidoFinalizado}
              anotadores={anotadoresUltimoPartido}
            />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3 drop-shadow-sm">
                <span className="w-3 h-3 rounded-full bg-pelusa-gold animate-pulse shadow-lg shadow-pelusa-gold/50" />
                PRÓXIMO ENCUENTRO
              </h2>
            </div>
            <NextMatchBanner partido={null} />
          </>
        )}
      </section>

      {/* Módulos de Navegación (Tabs) */}
      <section className="space-y-6 sm:space-y-8">
        <div className="border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-2 scrollbar-none">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-5 sm:px-6 py-3 rounded-2xl text-xs sm:text-sm md:text-base font-black transition-all whitespace-nowrap cursor-pointer shadow-md ${
                    isActive
                      ? 'bg-pelusa-gold text-black shadow-lg shadow-pelusa-gold/30 scale-105'
                      : 'bg-pelusa-dark/90 text-zinc-300 hover:text-white hover:bg-zinc-800/90 border border-zinc-700/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-black' : 'text-pelusa-gold'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Estado de Carga o Error */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-pelusa-dark/60 border border-zinc-800/80 rounded-3xl backdrop-blur-md">
            <Loader2 className="w-10 h-10 text-pelusa-gold animate-spin" />
            <p className="text-base font-bold text-zinc-300">Cargando datos oficiales...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-950/70 border border-red-800 text-red-200 p-8 rounded-3xl text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <p className="text-lg font-black">Error al consultar Supabase</p>
            <p className="text-sm text-zinc-400">{errorMsg}</p>
          </div>
        ) : (
          /* Renderizado del Módulo Seleccionado */
          <div>
            {activeTab === 'plantilla' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-wider flex items-center gap-3 drop-shadow-sm">
                    <Users className="w-7 h-7 text-pelusa-gold" />
                    PLANTILLA OFICIAL ({jugadores.length})
                  </h3>
                </div>

                {jugadores.length === 0 ? (
                  <div className="bg-pelusa-dark/80 border border-zinc-800 text-zinc-400 p-10 rounded-3xl text-center space-y-3 backdrop-blur-sm">
                    <Users className="w-12 h-12 text-pelusa-gold/60 mx-auto" />
                    <h4 className="text-lg font-black text-white">No hay jugadores registrados</h4>
                    <p className="text-sm text-zinc-400">
                      Verifica que existan registros en la tabla &apos;jugadores&apos; de Supabase.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                    {jugadores.map((jugador) => (
                      <PlayerCard
                        key={jugador.id}
                        jugador={jugador}
                        showFinancialStatus={true}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'goleadores' && (
              <TopScorersTable jugadores={jugadores} />
            )}

            {activeTab === 'asistencias' && (
              <AssistsTable jugadores={jugadores} />
            )}

            {activeTab === 'mvps' && (
              <MvpRankingTable jugadores={jugadores} />
            )}

            {activeTab === 'balance' && (
              <TeamStats partidos={partidos} />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
