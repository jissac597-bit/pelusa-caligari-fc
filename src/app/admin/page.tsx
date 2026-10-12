'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  DollarSign,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Users,
  Trophy,
  Percent,
  Lock,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Jugador, Asistencia } from '@/types/database';

interface PlayerMatchStatInput {
  jugador_id: string;
  asistencia: Asistencia;
  goles: number;
  asistencias: number;
  calificacion: number;
  es_mvp: boolean;
}

export default function AdminPage() {
  const COSTO_ARBITRAJE_TOTAL = 600;

  // --- AUTENTICACIÓN ADMIN (Vista Protegida) ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('pelusa_admin_auth');
      if (savedAuth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'pelusa' && passwordInput === 'admin123') {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pelusa_admin_auth', 'true');
      }
      setLoginError(null);
    } else {
      setLoginError('Credenciales incorrectas. Verifica el usuario y la contraseña.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('pelusa_admin_auth');
    }
    setUsernameInput('');
    setPasswordInput('');
  };

  // Tabs de Administración
  const [activeTab, setActiveTab] = useState<'monedero' | 'reporte'>('monedero');

  // Estado general de jugadores
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loadingJugadores, setLoadingJugadores] = useState<boolean>(true);
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // --- TAB 1: EL MONEDERO ---
  const [abonosInput, setAbonosInput] = useState<Record<string, string>>({});
  const [savingAbonoId, setSavingAbonoId] = useState<string | null>(null);

  // --- TAB 2: REPORTE DE PARTIDO ---
  const [fechaHora, setFechaHora] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [rival, setRival] = useState<string>('');
  const [cancha, setCancha] = useState<string>('Cancha Principal');
  const [golesPelusa, setGolesPelusa] = useState<number>(0);
  const [golesRival, setGolesRival] = useState<number>(0);
  const [vallaInvicta, setVallaInvicta] = useState<boolean>(false);

  const [matchStats, setMatchStats] = useState<Record<string, PlayerMatchStatInput>>({});
  const [mvpSelectedId, setMvpSelectedId] = useState<string | null>(null);
  const [savingReport, setSavingReport] = useState<boolean>(false);

  // Cargar jugadores desde Supabase
  const loadJugadores = async () => {
    try {
      setLoadingJugadores(true);
      const { data, error } = await supabase
        .from('jugadores')
        .select('*')
        .order('dorsal', { ascending: true });

      if (error) throw error;

      const loaded = (data || []) as Jugador[];
      setJugadores(loaded);

      // Inicializar las estadísticas por jugador si no existen
      const initialStats: Record<string, PlayerMatchStatInput> = {};
      loaded.forEach((j) => {
        initialStats[j.id] = {
          jugador_id: j.id,
          asistencia: 'Presente',
          goles: 0,
          asistencias: 0,
          calificacion: 7.0,
          es_mvp: false,
        };
      });
      setMatchStats(initialStats);
    } catch (err: any) {
      console.error('Error al cargar jugadores:', err);
      showNotification('error', `Error al cargar jugadores: ${err.message || 'Verifica Supabase'}`);
    } finally {
      setLoadingJugadores(false);
    }
  };

  useEffect(() => {
    loadJugadores();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotif({ type, message });
    setTimeout(() => {
      setNotif(null);
    }, 6000);
  };

  // --- ACCIONES TAB 1: MONEDERO (ABONOS) ---
  const handleAbonoChange = (jugadorId: string, value: string) => {
    setAbonosInput((prev) => ({ ...prev, [jugadorId]: value }));
  };

  const handleAplicarAbono = async (jugador: Jugador) => {
    const rawVal = abonosInput[jugador.id];
    const amount = parseFloat(rawVal || '0');

    if (isNaN(amount) || amount <= 0) {
      showNotification('error', 'Ingresa una cantidad válida mayor a 0');
      return;
    }

    try {
      setSavingAbonoId(jugador.id);
      const saldoActualNum = Number(jugador.saldo_actual || 0);
      const nuevoSaldo = Number((saldoActualNum + amount).toFixed(2));

      const { error } = await supabase
        .from('jugadores')
        .update({ saldo_actual: nuevoSaldo })
        .eq('id', jugador.id);

      if (error) throw error;

      // Actualizar estado local
      setJugadores((prev) =>
        prev.map((j) => (j.id === jugador.id ? { ...j, saldo_actual: nuevoSaldo } : j))
      );
      setAbonosInput((prev) => ({ ...prev, [jugador.id]: '' }));

      showNotification(
        'success',
        `¡Abono de $${amount.toFixed(2)} registrado para ${jugador.nombre}! Nuevo saldo: $${nuevoSaldo.toFixed(2)}`
      );
    } catch (err: any) {
      console.error('Error al actualizar saldo:', err);
      showNotification('error', `Error al registrar abono: ${err.message}`);
    } finally {
      setSavingAbonoId(null);
    }
  };

  // --- ACCIONES TAB 2: REPORTE DE PARTIDO ---
  const handleStatFieldChange = (
    jugadorId: string,
    field: keyof PlayerMatchStatInput,
    value: any
  ) => {
    setMatchStats((prev) => ({
      ...prev,
      [jugadorId]: {
        ...(prev[jugadorId] || {
          jugador_id: jugadorId,
          asistencia: 'Presente',
          goles: 0,
          asistencias: 0,
          calificacion: 7.0,
          es_mvp: false,
        }),
        [field]: value,
      },
    }));
  };

  const handleSelectMvp = (jugadorId: string) => {
    setMvpSelectedId(jugadorId);
    setMatchStats((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id] = { ...updated[id], es_mvp: id === jugadorId };
      });
      return updated;
    });
  };

  // Cálculo de Arbitraje en Vivo
  const jugadoresConCobro = Object.values(matchStats).filter(
    (s) => s.asistencia === 'Presente' || s.asistencia === 'Falta Injustificada'
  ).length;

  const cuotaArbitrajePorJugador =
    jugadoresConCobro > 0
      ? Number((COSTO_ARBITRAJE_TOTAL / jugadoresConCobro).toFixed(2))
      : 0;

  // Lógica Estricta al Guardar el Reporte
  const handleGuardarReportePartido = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rival.trim()) {
      showNotification('error', 'Por favor ingresa el nombre del equipo rival');
      return;
    }

    if (jugadores.length === 0) {
      showNotification('error', 'No hay jugadores registrados en la base de datos');
      return;
    }

    try {
      setSavingReport(true);

      // PASO 1: Insertar el nuevo partido en la tabla 'partidos' con estatus 'Finalizado' y obtener id
      const { data: partidoInsertado, error: errorPartido } = await supabase
        .from('partidos')
        .insert({
          fecha_hora: new Date(fechaHora).toISOString(),
          cancha: cancha.trim() || 'Cancha Principal',
          rival: rival.trim(),
          estatus: 'Finalizado',
          goles_pelusa: Number(golesPelusa || 0),
          goles_rival: Number(golesRival || 0),
          valla_invicta: Boolean(vallaInvicta || Number(golesRival) === 0),
        })
        .select('id')
        .single();

      if (errorPartido) throw errorPartido;
      if (!partidoInsertado) throw new Error('No se pudo obtener el ID del partido creado.');

      const partidoId = partidoInsertado.id;

      // PASO 2: Procesar estadísticas y cobro por cada jugador
      const statsToInsert = [];
      const updatesJugadoresSaldo = [];

      for (const jugador of jugadores) {
        const stat = matchStats[jugador.id] || {
          jugador_id: jugador.id,
          asistencia: 'Presente',
          goles: 0,
          asistencias: 0,
          calificacion: 7.0,
          es_mvp: false,
        };

        const debePagarArbitraje =
          stat.asistencia === 'Presente' || stat.asistencia === 'Falta Injustificada';
        const cobroAplicado = debePagarArbitraje ? cuotaArbitrajePorJugador : 0;

        // Registro para estadisticas_partido
        statsToInsert.push({
          partido_id: partidoId,
          jugador_id: jugador.id,
          asistencia: stat.asistencia,
          goles: Number(stat.goles || 0),
          asistencias: Number(stat.asistencias || 0),
          calificacion: Number(stat.calificacion || 7.0),
          es_mvp: mvpSelectedId === jugador.id,
          cobro_aplicado: cobroAplicado,
        });

        // Si paga arbitraje, restar de su saldo_actual en Supabase
        if (debePagarArbitraje) {
          const saldoAnterior = Number(jugador.saldo_actual || 0);
          const saldoNuevo = Number((saldoAnterior - cuotaArbitrajePorJugador).toFixed(2));

          updatesJugadoresSaldo.push(
            supabase
              .from('jugadores')
              .update({ saldo_actual: saldoNuevo })
              .eq('id', jugador.id)
          );
        }
      }

      // Insertar en 'estadisticas_partido'
      const { error: errorStats } = await supabase
        .from('estadisticas_partido')
        .insert(statsToInsert);

      if (errorStats) throw errorStats;

      // Ejecutar las deducciones de saldo
      if (updatesJugadoresSaldo.length > 0) {
        await Promise.all(updatesJugadoresSaldo);
      }

      showNotification(
        'success',
        `¡Reporte guardado con éxito! Partido finalizado contra "${rival}". Cobro de $${cuotaArbitrajePorJugador} aplicado a ${jugadoresConCobro} jugadores.`
      );

      // Limpiar formulario y recargar datos de jugadores actualizados
      setRival('');
      setGolesPelusa(0);
      setGolesRival(0);
      setVallaInvicta(false);
      setMvpSelectedId(null);
      await loadJugadores();
    } catch (err: any) {
      console.error('Error al guardar reporte de partido:', err);
      showNotification('error', `Error al guardar reporte: ${err.message || 'Error desconocido'}`);
    } finally {
      setSavingReport(false);
    }
  };

  // VISTA PROTEGIDA: Formulario de Login si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-pelusa-dark/95 border-2 border-pelusa-gold/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 text-white text-center">
          {/* Logo */}
          <div className="relative mx-auto w-24 h-24 p-2 rounded-3xl bg-pelusa-black/90 border-2 border-pelusa-gold/40 shadow-xl flex items-center justify-center">
            <Image
              alt="Logo Pelusa Caligari"
              height={90}
              src="/logo.png"
              width={90}
              className="object-contain w-20 h-20 drop-shadow-[0_4px_12px_rgba(255,184,0,0.3)]"
              priority
            />
          </div>

          <div>
            <h2 className="text-2xl font-black text-pelusa-gold uppercase tracking-wider flex items-center justify-center gap-2">
              <Lock className="w-5 h-5 text-pelusa-gold" /> Acceso Administrativo
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Ingresa las credenciales para gestionar el monedero y cerrar partidos.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-950/80 border border-red-500/80 text-red-200 text-xs font-semibold p-3 rounded-xl flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                Usuario
              </label>
              <input
                type="text"
                placeholder="ej. pelusa"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-pelusa-black border border-zinc-700 focus:border-pelusa-gold rounded-xl p-3 text-sm text-white font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                className="w-full bg-pelusa-black border border-zinc-700 focus:border-pelusa-gold rounded-xl p-3 text-sm text-white font-bold outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-pelusa-gold hover:bg-pelusa-gold-hover text-black font-black py-3.5 rounded-xl uppercase tracking-wider text-sm shadow-xl shadow-pelusa-gold/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Ingresar al Panel</span>
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-pelusa-gold transition-colors font-semibold"
            >
              &larr; Volver al Portal Público
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 sm:space-y-10">
      {/* Header del Panel */}
      <header className="border-b border-zinc-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
            <Link
              href="/"
              className="text-zinc-400 hover:text-white transition-colors p-2.5 rounded-2xl bg-pelusa-dark/90 border border-zinc-800 hover:border-pelusa-gold/40 shadow-md self-start sm:self-auto"
              title="Volver a la vista pública"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="relative shrink-0 flex items-center justify-center p-2 rounded-3xl bg-pelusa-dark/90 border-2 border-pelusa-gold/40 shadow-xl shadow-pelusa-gold/15">
              <Image
                alt="Logo Pelusa Caligari"
                height={90}
                src="/logo.png"
                width={90}
                className="object-contain w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_4px_12px_rgba(255,184,0,0.3)]"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-pelusa-gold leading-tight drop-shadow-sm">
                PANEL DE ADMINISTRACIÓN
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 font-bold uppercase tracking-wider mt-1">
                Pelusa Caligari FC &bull; Gestión Oficial
              </p>
            </div>
          </div>
        </div>

        {/* Indicador de Tarifa de Arbitraje & Botón Cerrar Sesión */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <div className="bg-pelusa-dark border border-pelusa-gold/30 rounded-2xl px-4 py-2 shadow-md">
            <span className="text-[0.6875rem] text-zinc-400 uppercase tracking-wider block font-bold">
              Costo de Arbitraje por Partido
            </span>
            <p className="text-base sm:text-lg font-black text-pelusa-gold">
              ${COSTO_ARBITRAJE_TOTAL}.00 MXN
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 font-extrabold px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            title="Cerrar sesión de administrador"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>

      {/* Banner de Notificación Flotante */}
      {notif && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
            notif.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
              : 'bg-red-950/70 border-red-500 text-red-200'
          }`}
        >
          {notif.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <p className="text-xs sm:text-sm font-semibold">{notif.message}</p>
        </div>
      )}

      {/* Selector de Pestañas (Tabs) */}
      <div className="flex border-b border-zinc-800/80 gap-3">
        <button
          onClick={() => setActiveTab('monedero')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm sm:text-base font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'monedero'
              ? 'border-pelusa-gold text-pelusa-gold font-black'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span>TAB 1: El Monedero (Finanzas)</span>
        </button>

        <button
          onClick={() => setActiveTab('reporte')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm sm:text-base font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'reporte'
              ? 'border-pelusa-gold text-pelusa-gold font-black'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          <CalendarCheck className="w-5 h-5" />
          <span>TAB 2: Reporte de Partido (Cierre Dominical)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EL MONEDERO (FINANZAS & ABONOS)                   */}
      {/* ======================================================== */}
      {activeTab === 'monedero' && (
        <section className="bg-pelusa-dark/95 border border-zinc-800 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Estado de Cuenta & Abonos de Jugadores
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ingresa abonos en efectivo para sumar saldo a favor al monedero de cada jugador.
              </p>
            </div>
            <button
              onClick={loadJugadores}
              className="text-xs text-pelusa-gold hover:underline self-start sm:self-auto font-semibold"
            >
              Refrescar datos
            </button>
          </div>

          {loadingJugadores ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <Loader2 className="w-8 h-8 text-pelusa-gold animate-spin" />
              <p className="text-xs text-zinc-400">Consultando jugadores en Supabase...</p>
            </div>
          ) : jugadores.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No se encontraron jugadores registrados en la tabla &apos;jugadores&apos;.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-pelusa-black text-zinc-400 uppercase text-[0.6875rem]">
                  <tr>
                    <th className="p-3.5 text-center w-16">Dorsal</th>
                    <th className="p-3.5">Jugador</th>
                    <th className="p-3.5 text-center">Posición</th>
                    <th className="p-3.5 text-center font-bold text-white">Saldo Actual</th>
                    <th className="p-3.5 text-right w-64">Acción (Abono)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70 bg-pelusa-dark/50">
                  {jugadores.map((jugador) => {
                    const saldo = Number(jugador.saldo_actual || 0);
                    const isSaving = savingAbonoId === jugador.id;
                    const abonoVal = abonosInput[jugador.id] || '';

                    return (
                      <tr key={jugador.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="p-3.5 text-center font-black text-pelusa-gold">
                          #{jugador.dorsal ?? '--'}
                        </td>
                        <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              jugador.avatar_url ||
                              `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(
                                jugador.nombre
                              )}`
                            }
                            alt={jugador.nombre}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
                                jugador.nombre
                              )}`;
                            }}
                            className="w-8 h-8 rounded-full bg-gray-800 object-cover border border-zinc-700 shrink-0"
                          />
                          <span>{jugador.nombre}</span>
                        </td>
                        <td className="p-3.5 text-center text-zinc-400">{jugador.posicion || 'JUG'}</td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black ${
                              saldo < 0
                                ? 'bg-red-950/80 text-red-400 border border-red-800/60'
                                : saldo > 0
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            ${saldo.toFixed(2)} MXN
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-bold">
                                $
                              </span>
                              <input
                                type="number"
                                min={1}
                                step="any"
                                placeholder="0.00"
                                value={abonoVal}
                                onChange={(e) => handleAbonoChange(jugador.id, e.target.value)}
                                className="w-24 sm:w-28 bg-pelusa-black border border-zinc-700 rounded-xl py-1.5 pl-6 pr-2 text-right text-xs font-bold text-white focus:border-pelusa-gold outline-none"
                              />
                            </div>
                            <button
                              onClick={() => handleAplicarAbono(jugador)}
                              disabled={isSaving}
                              className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                            >
                              {isSaving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <span>Abonar</span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REPORTE DE PARTIDO (CIERRE DOMINICAL)             */}
      {/* ======================================================== */}
      {activeTab === 'reporte' && (
        <form onSubmit={handleGuardarReportePartido} className="space-y-8">
          {/* 1. Datos Generales del Partido */}
          <div className="bg-pelusa-dark/95 border border-zinc-800 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 shadow-xl">
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
              <CalendarCheck className="w-5 h-5 text-pelusa-gold" />
              1. Datos del Encuentro
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Fecha y Hora del Partido
                </label>
                <input
                  type="datetime-local"
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  required
                  className="w-full bg-pelusa-black border border-zinc-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-pelusa-gold outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Equipo Rival *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Galácticos FC"
                  value={rival}
                  onChange={(e) => setRival(e.target.value)}
                  required
                  className="w-full bg-pelusa-black border border-zinc-700 rounded-xl p-2.5 text-xs sm:text-sm text-white font-bold focus:border-pelusa-gold outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Cancha o Sede
                </label>
                <input
                  type="text"
                  placeholder="Ej. Bombonera Cancha 1"
                  value={cancha}
                  onChange={(e) => setCancha(e.target.value)}
                  className="w-full bg-pelusa-black border border-zinc-700 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:border-pelusa-gold outline-none"
                />
              </div>
            </div>

            {/* Marcador y Valla Invicta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-800/70 items-center">
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Goles Pelusa Caligari
                </label>
                <input
                  type="number"
                  min={0}
                  value={golesPelusa}
                  onChange={(e) => setGolesPelusa(parseInt(e.target.value) || 0)}
                  className="w-full bg-pelusa-black border border-zinc-700 rounded-xl p-2.5 text-sm font-black text-pelusa-gold focus:border-pelusa-gold outline-none text-center"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">
                  Goles Rival
                </label>
                <input
                  type="number"
                  min={0}
                  value={golesRival}
                  onChange={(e) => {
                    const r = parseInt(e.target.value) || 0;
                    setGolesRival(r);
                    if (r === 0) setVallaInvicta(true);
                  }}
                  className="w-full bg-pelusa-black border border-zinc-700 rounded-xl p-2.5 text-sm font-black text-red-400 focus:border-pelusa-gold outline-none text-center"
                />
              </div>

              <div className="flex items-center gap-3 pt-4 sm:pt-0">
                <label className="flex items-center gap-2.5 cursor-pointer bg-pelusa-black border border-zinc-700/80 px-4 py-3 rounded-2xl w-full">
                  <input
                    type="checkbox"
                    checked={vallaInvicta}
                    onChange={(e) => setVallaInvicta(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Valla Invicta (Portería a Cero)</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Estadísticas Individuales & Cálculo de Arbitraje */}
          <div className="bg-pelusa-dark/95 border border-zinc-800 rounded-3xl p-4 sm:p-6 md:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-5 h-5 text-pelusa-gold" />
                  2. Estadísticas Individuales & Asistencia
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Marca la asistencia, goles, asistencias y califica a los jugadores del partido.
                </p>
              </div>
            </div>

            {/* Banner de Cálculo de Arbitraje en Vivo */}
            <div className="bg-pelusa-gold/10 border border-pelusa-gold/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-inner">
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider font-extrabold text-pelusa-gold flex items-center gap-1.5">
                  <Percent className="w-4 h-4" /> División Automática de Arbitraje ($600.00 MXN)
                </span>
                <p className="text-xs text-zinc-300">
                  Jugadores a pagar (<strong>Presente</strong> o <strong>Falta Injustificada</strong>):{' '}
                  <span className="font-black text-white">{jugadoresConCobro}</span> de{' '}
                  {jugadores.length} jugadores.
                </p>
                <p className="text-[0.6875rem] text-zinc-400">
                  * Las <em>Faltas Justificadas</em> están exentas de cobro.
                </p>
              </div>

              <div className="bg-pelusa-black/90 border border-pelusa-gold/40 px-4 py-2.5 rounded-xl text-right self-stretch md:self-auto">
                <span className="text-[0.6875rem] text-zinc-400 uppercase tracking-widest block font-semibold">
                  Cuota individual calculada
                </span>
                <span className="text-xl font-black text-pelusa-gold">
                  ${cuotaArbitrajePorJugador.toFixed(2)} MXN
                </span>
              </div>
            </div>

            {/* Tabla de Jugadores */}
            {loadingJugadores ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-pelusa-gold animate-spin" />
              </div>
            ) : jugadores.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No hay jugadores disponibles.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-pelusa-black text-zinc-400 uppercase text-[0.6875rem]">
                    <tr>
                      <th className="p-3">Jugador</th>
                      <th className="p-3">Asistencia</th>
                      <th className="p-3 text-center">Goles</th>
                      <th className="p-3 text-center">Asist.</th>
                      <th className="p-3 text-center">Calificación (1-10)</th>
                      <th className="p-3 text-center">MVP</th>
                      <th className="p-3 text-center">Cobro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 bg-pelusa-dark/50">
                    {jugadores.map((jugador) => {
                      const stat = matchStats[jugador.id] || {
                        jugador_id: jugador.id,
                        asistencia: 'Presente',
                        goles: 0,
                        asistencias: 0,
                        calificacion: 7.0,
                        es_mvp: false,
                      };
                      const aplicaCobro =
                        stat.asistencia === 'Presente' ||
                        stat.asistencia === 'Falta Injustificada';

                      return (
                        <tr key={jugador.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-3 font-bold text-white whitespace-nowrap">
                            <span className="text-pelusa-gold mr-1.5">
                              #{jugador.dorsal ?? '--'}
                            </span>
                            {jugador.nombre}
                          </td>

                          <td className="p-3">
                            <select
                              value={stat.asistencia}
                              onChange={(e) =>
                                handleStatFieldChange(
                                  jugador.id,
                                  'asistencia',
                                  e.target.value as Asistencia
                                )
                              }
                              className={`bg-pelusa-black border rounded-xl p-2 text-xs font-bold outline-none cursor-pointer ${
                                stat.asistencia === 'Presente'
                                  ? 'border-emerald-500/60 text-emerald-300'
                                  : stat.asistencia === 'Falta Injustificada'
                                  ? 'border-red-500/60 text-red-300'
                                  : 'border-zinc-700 text-zinc-400'
                              }`}
                            >
                              <option value="Presente">Presente</option>
                              <option value="Falta Injustificada">Falta Injustificada</option>
                              <option value="Falta Justificada">Falta Justificada</option>
                            </select>
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={0}
                              value={stat.goles}
                              onChange={(e) =>
                                handleStatFieldChange(
                                  jugador.id,
                                  'goles',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-14 bg-pelusa-black border border-zinc-700 rounded-xl p-1.5 text-center text-xs font-bold text-white focus:border-pelusa-gold outline-none"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={0}
                              value={stat.asistencias}
                              onChange={(e) =>
                                handleStatFieldChange(
                                  jugador.id,
                                  'asistencias',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-14 bg-pelusa-black border border-zinc-700 rounded-xl p-1.5 text-center text-xs font-bold text-white focus:border-pelusa-gold outline-none"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min={1}
                              max={10}
                              step="0.1"
                              value={stat.calificacion}
                              onChange={(e) =>
                                handleStatFieldChange(
                                  jugador.id,
                                  'calificacion',
                                  parseFloat(e.target.value) || 1
                                )
                              }
                              className="w-16 bg-pelusa-black border border-zinc-700 rounded-xl p-1.5 text-center text-xs font-extrabold text-pelusa-gold focus:border-pelusa-gold outline-none"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer p-1">
                              <input
                                type="radio"
                                name="mvp_player_radio"
                                checked={mvpSelectedId === jugador.id}
                                onChange={() => handleSelectMvp(jugador.id)}
                                className="w-4 h-4 accent-amber-500 cursor-pointer"
                              />
                            </label>
                          </td>

                          <td className="p-3 text-center">
                            <span
                              className={`text-xs font-extrabold ${
                                aplicaCobro ? 'text-red-400' : 'text-zinc-500'
                              }`}
                            >
                              {aplicaCobro
                                ? `-$${cuotaArbitrajePorJugador.toFixed(2)}`
                                : '$0.00'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* BOTÓN FINAL DE GUARDAR */}
          <button
            type="submit"
            disabled={savingReport || jugadores.length === 0}
            className="w-full bg-pelusa-gold hover:bg-pelusa-gold-hover text-black font-black py-4 rounded-2xl shadow-xl shadow-pelusa-gold/20 transition-all uppercase tracking-wider text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savingReport ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Guardando partido y aplicando descuentos...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Guardar Reporte Oficial & Cerrar Partido</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
