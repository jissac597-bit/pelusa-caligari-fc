export type Asistencia = 'Presente' | 'Falta Injustificada' | 'Falta Justificada';
export type EstatusPartido = 'Programado' | 'Finalizado';
export type PiernaHabil = 'Derecho' | 'Izquierdo' | string;

export interface Jugador {
  id: string;
  nombre: string;
  dorsal: number | null;
  posicion: 'POR' | 'DEF' | 'MED' | 'DEL' | string;
  avatar_url: string | null;
  saldo_actual: number;
  pierna_habil?: PiernaHabil | null;
}

export interface Partido {
  id: string;
  fecha_hora: string;
  cancha: string;
  rival: string;
  estatus: EstatusPartido;
  goles_pelusa: number;
  goles_rival: number;
  valla_invicta: boolean;
}

export interface EstadisticaPartido {
  id: string;
  partido_id: string;
  jugador_id: string;
  asistencia: Asistencia;
  goles: number;
  asistencias: number;
  calificacion: number | null; // 1 al 10
  es_mvp: boolean;
  cobro_aplicado: number;
}

// Estadísticas acumuladas para renderizar el cromo coleccionable
export interface JugadorStatsTotales extends Jugador {
  totalGoles: number;
  totalAsistencias: number;
  promedioCalificacion: number;
  totalMvps: number;
  partidosJugados: number;
  overall?: number;
}
