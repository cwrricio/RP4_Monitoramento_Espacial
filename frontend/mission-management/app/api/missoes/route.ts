import { type NextRequest, NextResponse } from "next/server"

// Mock data for demonstration
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

// GET /api/missoes - Lista todas as missões
export async function GET() {
  try {
    return NextResponse.json(missions)
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

// POST /api/missoes - Cria nova missão
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validação básica
    if (!body.nome || body.nome.length < 3 || body.nome.length > 100) {
      return NextResponse.json({ error: "Nome deve ter entre 3 e 100 caracteres" }, { status: 400 })
    }

    if (!body.objetivo || body.objetivo.length > 500) {
      return NextResponse.json({ error: "Objetivo é obrigatório e deve ter no máximo 500 caracteres" }, { status: 400 })
    }

    if (!body.tripulacaoIds || !Array.isArray(body.tripulacaoIds) || body.tripulacaoIds.length === 0) {
      return NextResponse.json({ error: "Pelo menos um tripulante deve ser selecionado" }, { status: 400 })
    }

    // Criar nova missão
    const newMission = {
      id: Math.max(...missions.map((m) => m.id)) + 1,
      nome: body.nome,
      objetivo: body.objetivo,
      dataInicio: body.dataInicio || new Date().toISOString().split("T")[0],
      dataFim: null,
      status: "PLANEJADA" as const,
      tripulacaoIds: body.tripulacaoIds,
    }

    missions.push(newMission)

    return NextResponse.json(newMission, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
