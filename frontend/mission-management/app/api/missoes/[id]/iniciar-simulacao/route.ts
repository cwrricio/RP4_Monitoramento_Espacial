import { type NextRequest, NextResponse } from "next/server"

// Mock data (in a real app, this would be in a database)
const missions = [
  {
    id: 1,
    nome: "Missão Alfa Centauri",
    objetivo: "Coletar amostras de rochas do planeta Proxima b.",
    dataInicio: "2026-05-20",
    dataFim: null,
    status: "PLANEJADA" as const,
    tripulacaoIds: [1, 5, 8],
  },
  {
    id: 2,
    nome: "Exploração de Marte",
    objetivo: "Estabelecer base de pesquisa no polo sul marciano.",
    dataInicio: "2025-12-15",
    dataFim: null,
    status: "EM_ANDAMENTO" as const,
    tripulacaoIds: [2, 4, 7, 9],
  },
  {
    id: 3,
    nome: "Estação Lunar",
    objetivo: "Construir estação de pesquisa permanente na Lua.",
    dataInicio: "2024-08-10",
    dataFim: "2025-03-22",
    status: "CONCLUIDA" as const,
    tripulacaoIds: [3, 6, 10],
  },
]

// POST /api/missoes/[id]/iniciar-simulacao - Inicia simulação
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const missionIndex = missions.findIndex((m) => m.id === id)

    if (missionIndex === -1) {
      return NextResponse.json({ error: "Missão não encontrada" }, { status: 404 })
    }

    const mission = missions[missionIndex]

    if (mission.status !== "PLANEJADA") {
      return NextResponse.json({ error: "Apenas missões planejadas podem ser iniciadas" }, { status: 400 })
    }

    // Atualizar status para EM_ANDAMENTO
    missions[missionIndex] = {
      ...mission,
      status: "EM_ANDAMENTO" as const,
    }

    return NextResponse.json(missions[missionIndex])
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
