import { Estado } from './dashboard-estado';

export interface Robo {
    status: boolean,
    id: number,
    nome: string,
    estados: Estado[],
    estadoAtual: number,
    distancia: number,
    velocidade: number,
    potenciaEsq: number,
    potenciaDir: number,
    conexao: boolean;
  }