// Define as interfaces DTO espelhando o backend Java

export interface CriarMissaoRequest {
  nome: string;
  objetivo: string;
  dataInicio?: string; 
  tripulacaoIds: number[];
}

export interface MissaoDTO {
  id: number;
  nome: string;
  objetivo: string;
  dataInicio: string; 
  dataFim: string | null; 
  status: "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "FALHOU";
  tripulacaoIds: number[];
}

export interface AtualizaAstronautaRequest {
  nome: string;
  idade: number;
  ativo: boolean;
  nivelAptidaoMedica: string;
  missoesRealizadas: number;
  tipoBiometria?: string;
  valorBiometria?: string;
  unidadeBiometria?: string;
}

export interface AstronautaDTO {
  id: number;
  nome: string;
  idade: number;
  ativo: boolean;
  nivelAptidaoMedica: string;
  missoesRealizadas: number;
  tipoBiometria: string | null;
  valorBiometria: string | null;
  unidadeBiometria: string | null;
  registradoEm: string | null; // Formato ISO DateTime
}

// Classe base para requisições
class ApiClient {
  protected async request<T>(baseURL: string, endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || "GET"} ${url}`, options.body ? JSON.parse(options.body as string) : '');
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`HTTP error! Status: ${response.status}, Body: ${errorBody}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (response.status === 204) { // No Content
        return null as T;
      }
      const data = await response.json();
      console.log(`API Response: ${options.method || "GET"} ${url}`, data);
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }
}

// API específica para Missões
class MissionAPI extends ApiClient {
  private baseURL = "http://localhost:8080/missoes"; 

  listarMissoes(): Promise<MissaoDTO[]> {
    return this.request<MissaoDTO[]>(this.baseURL, "");
  }

  buscarMissaoPorId(id: number): Promise<MissaoDTO> {
    return this.request<MissaoDTO>(this.baseURL, `/${id}`);
  }

  criarMissao(dados: CriarMissaoRequest): Promise<MissaoDTO> {
    return this.request<MissaoDTO>(this.baseURL, "", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  }

  deletarMissao(id: number): Promise<void> {
     return this.request<void>(this.baseURL, `/${id}`, { method: "DELETE" });
  }

  iniciarSimulacao(id: number): Promise<MissaoDTO> {
    return this.request<MissaoDTO>(this.baseURL, `/${id}/iniciar-simulacao`, { method: "POST" });
  }
}

// API específica para Astronautas
class AstronautAPI extends ApiClient {
  private baseURL = "http://localhost:8080/astronautas"; 

  listarAstronautas(): Promise<AstronautaDTO[]> {
    return this.request<AstronautaDTO[]>(this.baseURL, "");
  }

  buscarAstronautaPorId(id: number): Promise<AstronautaDTO> {
    return this.request<AstronautaDTO>(this.baseURL, `/${id}`);
  }

  criarAstronauta(dados: AtualizaAstronautaRequest): Promise<AstronautaDTO> {
  
    return this.request<AstronautaDTO>(this.baseURL, "", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  }

   atualizarAstronauta(id: number, dados: AtualizaAstronautaRequest): Promise<AstronautaDTO> {
     return this.request<AstronautaDTO>(this.baseURL, `/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
     });
   }

   deletarAstronauta(id: number): Promise<void> {
     return this.request<void>(this.baseURL, `/${id}`, { method: "DELETE" });
   }
}


export const missionAPI = new MissionAPI();
export const astronautAPI = new AstronautAPI();


export type StatusMissao = "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "FALHOU";

export const getStatusLabel = (status: StatusMissao): string => {
  const labels = {
    PLANEJADA: "Planejada",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDA: "Concluída",
    FALHOU: "Falhou",
  };
  return labels[status];
};

export const getStatusConfig = (status: StatusMissao): { variant: "default" | "secondary" | "outline" | "destructive", className: string } => {
  switch (status) {
    case "PLANEJADA": return { variant: "default", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20" };
    case "EM_ANDAMENTO": return { variant: "secondary", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20" };
    case "CONCLUIDA": return { variant: "outline", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20" };
    case "FALHOU": return { variant: "destructive", className: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20" };
    default: return { variant: "secondary", className: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20" };
  }
}