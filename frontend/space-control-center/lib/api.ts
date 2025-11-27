// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// --- ASTRONAUTAS ---
export interface AstronautDTO {
  id: string
  nome: string
  idade: number
  ativo: boolean
  nivelAptidaoMedica: "ALTO" | "MEDIO" | "BAIXO"
  missoesRealizadas: number
  tipoBiometria?: string
  valorBiometria?: string
  unidadeBiometria?: string
  registradoEm?: string
}

export interface CreateAstronautRequest {
  nome: string
  idade: number
  ativo: boolean
  nivelAptidaoMedica: "ALTO" | "MEDIO" | "BAIXO"
  missoesRealizadas: number
  // Opcionais para criação/update
  tipoBiometria?: string
  valorBiometria?: string
  unidadeBiometria?: string
}

// --- MISSÕES ---
export interface MissaoDTO {
  id: string
  nome: string
  objetivo: string
  dataInicio: string
  dataFim?: string
  status: "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "FALHOU"
  // CORREÇÃO: Recebe objetos completos, não números!
  tripulacao: AstronautDTO[] 
}

export interface CriarMissaoRequest {
  nome: string
  objetivo: string
  dataInicio: string
  tripulacaoIds: number[] 
}

// --- API CLASSES ---

export class AstronautAPI {
  static async listar(): Promise<AstronautDTO[]> {
    const response = await fetch(`${API_BASE_URL}/astronautas`)
    if (!response.ok) throw new Error("Failed to fetch astronauts")
    return response.json()
  }

  static async buscarPorId(id: string): Promise<AstronautDTO> {
    const response = await fetch(`${API_BASE_URL}/astronautas/${id}`)
    if (!response.ok) throw new Error("Failed to fetch astronaut")
    return response.json()
  }

  static async criar(data: CreateAstronautRequest): Promise<AstronautDTO> {
    const response = await fetch(`${API_BASE_URL}/astronautas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create astronaut")
    return response.json()
  }

  static async atualizar(id: string, data: CreateAstronautRequest): Promise<AstronautDTO> {
    const response = await fetch(`${API_BASE_URL}/astronautas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update astronaut")
    return response.json()
  }

  static async deletar(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/astronautas/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete astronaut")
  }
}

export class MissionAPI {
  static async listar(): Promise<MissaoDTO[]> {
    const response = await fetch(`${API_BASE_URL}/missoes`)
    if (!response.ok) throw new Error("Failed to fetch missions")
    return response.json()
  }

  static async buscarPorId(id: string): Promise<MissaoDTO> {
    const response = await fetch(`${API_BASE_URL}/missoes/${id}`)
    if (!response.ok) throw new Error("Failed to fetch mission")
    return response.json()
  }

  static async criar(data: CriarMissaoRequest): Promise<MissaoDTO> {
    const response = await fetch(`${API_BASE_URL}/missoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
    }
    return response.json()
  }
  
  // Update method (New)
  static async atualizar(id: string, data: any): Promise<MissaoDTO> {
      const response = await fetch(`${API_BASE_URL}/missoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update mission")
      return response.json()
  }

  static async concluir(id: string): Promise<MissaoDTO> {
    const response = await fetch(`${API_BASE_URL}/missoes/${id}/concluir`, {
      method: "POST",
    })
    if (!response.ok) throw new Error("Failed to complete mission")
    return response.json()
  }

  static async deletar(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/missoes/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete mission")
  }
}

// ... (Mantenha SpaceshipAPI, OperatorAPI, EventAPI, ProtocolAPI como estavam, parecem ok)
// Só adicionei o que mudou
export interface EspaconaveDTO {
  id: string
  nome: string
  capacidade: number
  statusOperacional: string
}
export interface SalvarEspaconaveRequest {
  nome: string
  capacidade: number
  statusOperacional: string
}
export class SpaceshipAPI {
    static async listar(): Promise<EspaconaveDTO[]> {
        const res = await fetch(`${API_BASE_URL}/espaconaves`); return res.json();
    }
    static async criar(data: SalvarEspaconaveRequest) {
        const res = await fetch(`${API_BASE_URL}/espaconaves`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)}); return res.json();
    }
    static async atualizar(id: string, data: SalvarEspaconaveRequest) {
        const res = await fetch(`${API_BASE_URL}/espaconaves/${id}`, { method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)}); return res.json();
    }
    static async deletar(id: string) { await fetch(`${API_BASE_URL}/espaconaves/${id}`, { method: "DELETE" }); }
}
export interface OperadorDeMissaoDTO { id: string, nome: string, idade: number, turno: string, areaEspecializacao: string, ativo: boolean }
export interface CriarOperadorRequest { nome: string, idade: number, turno: string, areaEspecializacao: string, ativo: boolean }
export class OperatorAPI {
    static async listar(): Promise<OperadorDeMissaoDTO[]> { const res = await fetch(`${API_BASE_URL}/operadores`); return res.json(); }
    static async criar(data: CriarOperadorRequest) { const res = await fetch(`${API_BASE_URL}/operadores`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)}); return res.json(); }
    static async atualizar(id: string, data: CriarOperadorRequest) { const res = await fetch(`${API_BASE_URL}/operadores/${id}`, { method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)}); return res.json(); }
    static async deletar(id: string) { await fetch(`${API_BASE_URL}/operadores/${id}`, { method: "DELETE" }); }
}
export interface EventoDTO { id: string, missaoId: string, timestamp: string, tipo: string, descricao: string }
export class EventAPI { static async listarPorMissao(id: string): Promise<EventoDTO[]> { const res = await fetch(`${API_BASE_URL}/missoes/${id}/eventos`); return res.json(); } }
export interface ProtocoloEmergencialDTO { id: string, missaoId: string, tipo: string, descricao: string, acionadoEm: string }
export class ProtocolAPI { 
    static async listarPorMissao(id: string): Promise<ProtocoloEmergencialDTO[]> { const res = await fetch(`${API_BASE_URL}/missoes/${id}/protocolos`); return res.json(); }
    static async acionar(id: string, data: any) { const res = await fetch(`${API_BASE_URL}/missoes/${id}/protocolos`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)}); return res.json(); }
}