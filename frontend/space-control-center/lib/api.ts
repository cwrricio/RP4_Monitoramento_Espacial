// API Base URL - Update this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// ============================================
// ASTRONAUT DTOs
// ============================================
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
  // Campos opcionais
  tipoBiometria?: string
  valorBiometria?: string
  unidadeBiometria?: string
}

// ============================================
// SPACESHIP DTOs
// ============================================
export interface EspaconaveDTO {
  id: string
  nome: string
  capacidade: number
  statusOperacional: "OPERACIONAL" | "EM_MANUTENCAO" | "DESATIVADA"
}

export interface SalvarEspaconaveRequest {
  nome: string
  capacidade: number
  statusOperacional: "OPERACIONAL" | "EM_MANUTENCAO" | "DESATIVADA"
}

// ============================================
// OPERATOR DTOs
// ============================================
export interface OperadorDeMissaoDTO {
  id: string
  nome: string
  idade: number
  turno: string
  areaEspecializacao: string 
  ativo: boolean             
}

export interface CriarOperadorRequest {
  nome: string
  idade: number
  turno: string
  areaEspecializacao: string
  ativo: boolean
}

// ============================================
// MISSION DTOs
// ============================================
export interface MissaoDTO {
  id: string
  nome: string
  objetivo: string
  dataInicio: string
  dataFim?: string
  status: "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "FALHOU"
  
  // Tripulação como objetos completos
  tripulacao: AstronautDTO[] 
  
  // CORREÇÃO: Espaçonave pode vir preenchida ou nula
  espaconave?: EspaconaveDTO 
}

export interface CriarMissaoRequest {
  nome: string
  objetivo: string
  dataInicio: string
  tripulacaoIds: number[] 
  
  // CORREÇÃO: ID da nave para salvar
  espaconaveId?: number 
}

// ============================================
// EVENT & PROTOCOL DTOs
// ============================================
export interface EventoDTO {
  id: string
  missaoId: string
  timestamp: string
  tipo: "INFO" | "ALERTA" | "ERRO_CRITICO"
  descricao: string
}

export interface ProtocoloEmergencialDTO {
  id: string
  missaoId: string
  tipo: "MEDICO" | "TECNICO" | "EVACUACAO"
  descricao: string
  acionadoEm: string
}

export interface AcionarProtocoloRequest {
  tipo: "MEDICO" | "TECNICO" | "EVACUACAO"
  descricao: string
}

// ============================================
// API CLIENT CLASSES
// ============================================

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

export class SpaceshipAPI {
  static async listar(): Promise<EspaconaveDTO[]> {
    const response = await fetch(`${API_BASE_URL}/espaconaves`)
    if (!response.ok) throw new Error("Failed to fetch spaceships")
    return response.json()
  }

  static async buscarPorId(id: string): Promise<EspaconaveDTO> {
    const response = await fetch(`${API_BASE_URL}/espaconaves/${id}`)
    if (!response.ok) throw new Error("Failed to fetch spaceship")
    return response.json()
  }

  static async criar(data: SalvarEspaconaveRequest): Promise<EspaconaveDTO> {
    const response = await fetch(`${API_BASE_URL}/espaconaves`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create spaceship")
    return response.json()
  }

  static async atualizar(id: string, data: SalvarEspaconaveRequest): Promise<EspaconaveDTO> {
    const response = await fetch(`${API_BASE_URL}/espaconaves/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update spaceship")
    return response.json()
  }

  static async deletar(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/espaconaves/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete spaceship")
  }
}

export class OperatorAPI {
  static async listar(): Promise<OperadorDeMissaoDTO[]> {
    const response = await fetch(`${API_BASE_URL}/operadores`)
    if (!response.ok) throw new Error("Failed to fetch operators")
    return response.json()
  }

  static async buscarPorId(id: string): Promise<OperadorDeMissaoDTO> {
    const response = await fetch(`${API_BASE_URL}/operadores/${id}`)
    if (!response.ok) throw new Error("Failed to fetch operator")
    return response.json()
  }

  static async criar(data: CriarOperadorRequest): Promise<OperadorDeMissaoDTO> {
    const response = await fetch(`${API_BASE_URL}/operadores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to create operator")
    return response.json()
  }

  static async atualizar(id: string, data: CriarOperadorRequest): Promise<OperadorDeMissaoDTO> {
    const response = await fetch(`${API_BASE_URL}/operadores/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update operator")
    return response.json()
  }

  static async deletar(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/operadores/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete operator")
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

export class EventAPI {
  static async listarPorMissao(missaoId: string): Promise<EventoDTO[]> {
    const response = await fetch(`${API_BASE_URL}/missoes/${missaoId}/eventos`)
    if (!response.ok) throw new Error("Failed to fetch events")
    return response.json()
  }
}

export class ProtocolAPI {
  static async listarPorMissao(missaoId: string): Promise<ProtocoloEmergencialDTO[]> {
    const response = await fetch(`${API_BASE_URL}/missoes/${missaoId}/protocolos`)
    if (!response.ok) throw new Error("Failed to fetch protocols")
    return response.json()
  }

  static async acionar(missaoId: string, data: AcionarProtocoloRequest): Promise<ProtocoloEmergencialDTO> {
    const response = await fetch(`${API_BASE_URL}/missoes/${missaoId}/protocolos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to activate protocol")
    return response.json()
  }
}