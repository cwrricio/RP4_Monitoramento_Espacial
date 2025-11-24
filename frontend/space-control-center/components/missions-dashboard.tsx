"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react" // Adicionei o Loader2 para o loading
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MissionCard } from "@/components/mission-card"
import { NewMissionSheet } from "@/components/new-mission-sheet"
import { useMissions } from "@/hooks/useMissions" // Importando o hook real
import { MissaoDTO } from "@/lib/api"

// Função auxiliar para converter o Status do Backend para o formato do Frontend
const mapStatus = (backendStatus: string): "Planejada" | "Em Andamento" | "Concluída" => {
  const map: Record<string, "Planejada" | "Em Andamento" | "Concluída"> = {
    "PLANEJADA": "Planejada",
    "EM_ANDAMENTO": "Em Andamento",
    "CONCLUIDA": "Concluída",
    "FALHOU": "Concluída" // Mapeando falha como concluída para não quebrar o card, ou você pode ajustar o card depois
  }
  return map[backendStatus] || "Planejada"
}

// Função para formatar a data (YYYY-MM-DD -> DD/MM/YYYY)
const formatDate = (dateString?: string) => {
  if (!dateString) return "TBD"
  return new Date(dateString).toLocaleDateString('pt-BR')
}

export function MissionsDashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  
  // 1. Buscando os dados reais do banco
  const { missions: data, isLoading, isError } = useMissions()

  // 2. Transformando os dados do backend para o formato que o Card espera
  const formattedMissions = data?.map((missao: MissaoDTO) => ({
    id: missao.id,
    name: missao.nome,
    // Como o backend não tem campo "destino" separado, usamos o objetivo ou um padrão
    destination: "Sistema Solar", 
    launchDate: formatDate(missao.dataInicio),
    status: mapStatus(missao.status),
    description: missao.objetivo,
  })) || []

  const filterMissions = (statusFilter?: string) => {
    if (!statusFilter) return formattedMissions
    return formattedMissions.filter((m) => m.status === statusFilter)
  }

  // 3. Tratamento de Loading e Erro
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando missões...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        Erro ao carregar missões. Verifique se o Backend está rodando.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Missões</h1>
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Missão
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="planned">Planejadas</TabsTrigger>
          <TabsTrigger value="ongoing">Em Andamento</TabsTrigger>
          <TabsTrigger value="completed">Concluídas</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formattedMissions.length === 0 ? (
              <p className="text-muted-foreground col-span-3 text-center py-10">
                Nenhuma missão encontrada. Crie a primeira!
              </p>
            ) : (
              formattedMissions.map((mission) => (
                <MissionCard key={mission.id} mission={mission} />
              ))
            )}
          </div>
        </TabsContent>

        {/* Abas Filtradas */}
        {["planned", "ongoing", "completed"].map((tabValue) => {
            // Mapeia o valor da tab para o status esperado no filtro
            const statusMap: Record<string, string> = {
                "planned": "Planejada",
                "ongoing": "Em Andamento",
                "completed": "Concluída"
            }
            const statusLabel = statusMap[tabValue]
            const filtered = filterMissions(statusLabel)

            return (
                <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.length === 0 ? (
                            <p className="text-muted-foreground col-span-3 text-center py-10">
                                Nenhuma missão com status "{statusLabel}".
                            </p>
                        ) : (
                            filtered.map((mission) => (
                                <MissionCard key={mission.id} mission={mission} />
                            ))
                        )}
                    </div>
                </TabsContent>
            )
        })}
      </Tabs>

      <NewMissionSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  )
}