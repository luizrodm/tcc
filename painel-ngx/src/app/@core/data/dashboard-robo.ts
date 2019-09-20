import { Estado } from './dashboard-estado';

export interface Robo {
    id: number,
    nome: string,
    estados: Estado[],
    estadoAtual: number,
    distancia: number,
    velocidade: number,
    potenciaEsq: number,
    potenciaDir: number;
  }