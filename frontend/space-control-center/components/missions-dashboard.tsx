"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MissionCard } from "@/components/mission-card"
import { NewMissionSheet } from "@/components/new-mission-sheet"
import { MissionAPI, type MissaoDTO } from "@/lib/api"

export function MissionsDashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [missions, setMissions] = useState<MissaoDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Busca as missões no Backend
  const fetchMissions = async () => {
    try {
      setIsLoading(true)
      const data = await MissionAPI.listar()
      setMissions(data)
    } catch (error) {
      console.error("Erro ao buscar missões:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carrega ao iniciar
  useEffect(() => {
    fetchMissions()
  }, [])

  // Filtra por status
  const filterMissions = (status?: string) => {
    if (!status) return missions
    return missions.filter((m) => m.status === status)
  }

  // Adapta o DTO do Java para o Card do Front
  const mapToCardProps = (m: MissaoDTO) => ({
    id: m.id,
    name: m.nome,
    destination: "Espaço Profundo",
    launchDate: m.dataInicio,
    status: m.status,
    description: m.objetivo,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Missões</h1>
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Missão
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="PLANEJADA">Planejadas</TabsTrigger>
          <TabsTrigger value="EM_ANDAMENTO">Em Andamento</TabsTrigger>
          <TabsTrigger value="CONCLUIDA">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">Carregando...</div>
          ) : missions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Nenhuma missão encontrada.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missions.map((mission) => (
                // @ts-ignore
                <MissionCard key={mission.id} mission={mapToCardProps(mission)} />
              ))}
            </div>
          )}
        </TabsContent>

        {["PLANEJADA", "EM_ANDAMENTO", "CONCLUIDA"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterMissions(status).map((mission) => (
                // @ts-ignore
                <MissionCard key={mission.id} mission={mapToCardProps(mission)} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <NewMissionSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen}
        onSuccess={fetchMissions} 
      />
    </div>
  )
}