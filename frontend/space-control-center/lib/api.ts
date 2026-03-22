// API Base URL - Update this to your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Debug logging
if (typeof window !== 'undefined') {
  console.log('API_BASE_URL:', API_BASE_URL)
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
}

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
  tipoSimulacao?: "foguete" | "orbita" | "reentrada"
  
  // Tripulação como objetos completos
  tripulacao: AstronautDTO[] 
  
  // CORREÇÃO: Espaçonave pode vir preenchida ou nula
  espaconave?: EspaconaveDTO 
}

export interface CriarMissaoRequest {
  nome: string
  objetivo: string
  dataInicio: string
  tipoSimulacao?: "foguete" | "orbita" | "reentrada"
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
    try {
      const response = await fetch(`${API_BASE_URL}/astronautas`)
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[${response.status}] ${response.statusText}:`, errorText)
        throw new Error(`Failed to fetch astronauts: ${response.status}`)
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching astronauts:", error)
      throw error
    }
  }

  static async buscarPorId(id: string): Promise<AstronautDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/astronautas/${id}`)
      if (!response.ok) throw new Error(`Failed to fetch astronaut: ${response.status}`)
      return response.json()
    } catch (error) {
      console.error("Error fetching astronaut:", error)
      throw error
    }
  }

  static async criar(data: CreateAstronautRequest): Promise<AstronautDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/astronautas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }
      return response.json()
    } catch (error) {
      console.error("Error creating astronaut:", error)
      throw error
    }
  }

  static async atualizar(id: string, data: CreateAstronautRequest): Promise<AstronautDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/astronautas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(`Failed to update astronaut: ${response.status}`)
      return response.json()
    } catch (error) {
      console.error("Error updating astronaut:", error)
      throw error
    }
  }

  static async deletar(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/astronautas/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error(`Failed to delete astronaut: ${response.status}`)
    } catch (error) {
      console.error("Error deleting astronaut:", error)
      throw error
    }
  }
}

export class SpaceshipAPI {
  static async listar(): Promise<EspaconaveDTO[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/espaconaves`)
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[${response.status}] ${response.statusText}:`, errorText)
        throw new Error(`Failed to fetch spaceships: ${response.status}`)
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching spaceships:", error)
      throw error
    }
  }

  static async buscarPorId(id: string): Promise<EspaconaveDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/espaconaves/${id}`)
      if (!response.ok) throw new Error(`Failed to fetch spaceship: ${response.status}`)
      return response.json()
    } catch (error) {
      console.error("Error fetching spaceship:", error)
      throw error
    }
  }

  static async criar(data: SalvarEspaconaveRequest): Promise<EspaconaveDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/espaconaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }
      return response.json()
    } catch (error) {
      console.error("Error creating spaceship:", error)
      throw error
    }
  }

  static async atualizar(id: string, data: SalvarEspaconaveRequest): Promise<EspaconaveDTO> {
    try {
      const response = await fetch(`${API_BASE_URL}/espaconaves/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(`Failed to update spaceship: ${response.status}`)
      return response.json()
    } catch (error) {
      console.error("Error updating spaceship:", error)
      throw error
    }
  }

  static async deletar(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/espaconaves/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error(`Failed to delete spaceship: ${response.status}`)
    } catch (error) {
      console.error("Error deleting spaceship:", error)
      throw error
    }
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
    try {
      console.log(`Fetching missions from: ${API_BASE_URL}/missoes`)
      const response = await fetch(`${API_BASE_URL}/missoes`)
      console.log(`Response status: ${response.status}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[${response.status}] ${response.statusText}:`, errorText)
        throw new Error(`Failed to fetch missions: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      console.log('Missions fetched successfully:', data)
      return data
    } catch (error: any) {
      console.error("Error fetching missions:", error)
      console.error("Error message:", error?.message)
      console.error("Error type:", error?.name)
      throw error
    }
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