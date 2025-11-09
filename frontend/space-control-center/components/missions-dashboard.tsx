"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MissionCard } from "@/components/mission-card"
import { NewMissionSheet } from "@/components/new-mission-sheet"

const mockMissions = [
  {
    id: "1",
    name: "Missão Alpha Centauri",
    destination: "Proxima Centauri b",
    launchDate: "25/12/2025",
    status: "Planejada" as const,
    description: "Exploração do sistema estelar mais próximo",
  },
  {
    id: "2",
    name: "Missão Marte Base",
    destination: "Marte",
    launchDate: "15/03/2025",
    status: "Em Andamento" as const,
    description: "Estabelecimento de base permanente",
  },
  {
    id: "3",
    name: "Missão Europa",
    destination: "Europa (Lua de Júpiter)",
    launchDate: "10/01/2024",
    status: "Concluída" as const,
    description: "Análise de oceano subterrâneo",
  },
  {
    id: "4",
    name: "Missão Titã",
    destination: "Titã (Lua de Saturno)",
    launchDate: "05/06/2025",
    status: "Planejada" as const,
    description: "Estudo da atmosfera e superfície",
  },
  {
    id: "5",
    name: "Missão Estação Orbital",
    destination: "Órbita Terrestre",
    launchDate: "20/02/2025",
    status: "Em Andamento" as const,
    description: "Manutenção da estação espacial",
  },
]

export function MissionsDashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const filterMissions = (status?: string) => {
    if (!status) return mockMissions
    return mockMissions.filter((m) => m.status === status)
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

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockMissions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planned" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterMissions("Planejada").map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterMissions("Em Andamento").map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterMissions("Concluída").map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <NewMissionSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  )
}
