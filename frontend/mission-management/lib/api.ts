// API client for Mission Management System
// Based on the Portuguese API documentation provided

export interface CriarMissaoRequest {
  nome: string
  objetivo: string
  dataInicio?: string
  tripulacaoIds: number[]
}

export interface MissaoDTO {
  id: number
  nome: string
  objetivo: string
  dataInicio: string
  dataFim: string | null
  status: "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "FALHOU"
  tripulacaoIds: number[]
}

export type StatusMissao = "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "FALHOU"

class MissionAPI {
  private baseURL = "/api/missoes" // Adjust this to your actual API base URL

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // GET /missoes - Lista todas as missões
  async listarMissoes(): Promise<MissaoDTO[]> {
    return this.request<MissaoDTO[]>("")
  }

  // GET /missoes/{id} - Busca missão por ID
  async buscarMissaoPorId(id: number): Promise<MissaoDTO> {
    return this.request<MissaoDTO>(`/${id}`)
  }

  // POST /missoes - Cria nova missão
  async criarMissao(dados: CriarMissaoRequest): Promise<MissaoDTO> {
    return this.request<MissaoDTO>("", {
      method: "POST",
      body: JSON.stringify(dados),
    })
  }

  // DELETE /missoes/{id} - Remove missão
  async deletarMissao(id: number): Promise<void> {
    await this.request<void>(`/${id}`, {
      method: "DELETE",
    })
  }

  // POST /missoes/{id}/iniciar-simulacao - Inicia simulação
  async iniciarSimulacao(id: number): Promise<MissaoDTO> {
    return this.request<MissaoDTO>(`/${id}/iniciar-simulacao`, {
      method: "POST",
    })
  }
}

// Export singleton instance
export const missionAPI = new MissionAPI()

// Utility functions for status handling
export const getStatusLabel = (status: StatusMissao): string => {
  const labels = {
    PLANEJADA: "Planejada",
    EM_ANDAMENTO: "Em Andamento",
    CONCLUIDA: "Concluída",
    FALHOU: "Falhou",
  }
  return labels[status]
}

export const getStatusColor = (status: StatusMissao): string => {
  const colors = {
    PLANEJADA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    EM_ANDAMENTO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    CONCLUIDA: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    FALHOU: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }
  return colors[status]
}
