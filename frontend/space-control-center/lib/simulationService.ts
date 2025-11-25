// lib/simulationService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SimulationRequest {
  descricao: string;
  tempo_maximo?: number;
  massa_inicial?: number;
  massa_combustivel?: number;
  empuxo?: number;
  altitude_inicial?: number;
  velocidade_inicial?: number;
}

export interface SimulationResponse {
  id: string;
  descricao: string;
  tipo: string;
  resultado: string;
  data_execucao: string;
  detalhes: any;
}

class SimulationService {
  async startRocketSimulation(params: SimulationRequest): Promise<SimulationResponse> {
    const response = await fetch(`${API_BASE_URL}/simulacoes/foguete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Erro ao iniciar simulação de foguete');
    }

    return response.json();
  }

  async startOrbitalSimulation(params: SimulationRequest): Promise<SimulationResponse> {
    const response = await fetch(`${API_BASE_URL}/simulacoes/orbita`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Erro ao iniciar simulação orbital');
    }

    return response.json();
  }

  async startReentrySimulation(params: SimulationRequest): Promise<SimulationResponse> {
    const response = await fetch(`${API_BASE_URL}/simulacoes/reentrada`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Erro ao iniciar simulação de reentrada');
    }

    return response.json();
  }

  async getSimulation(simulationId: string) {
    const response = await fetch(`${API_BASE_URL}/simulacoes/${simulationId}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar simulação');
    }

    return response.json();
  }

  async listSimulations() {
    const response = await fetch(`${API_BASE_URL}/simulacoes`);
    
    if (!response.ok) {
      throw new Error('Erro ao listar simulações');
    }

    return response.json();
  }

  async generateChart(simulationId: string) {
    const response = await fetch(`${API_BASE_URL}/simulacoes/${simulationId}/graficos`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar gráfico');
    }

    return response.json();
  }
}

export const simulationService = new SimulationService();