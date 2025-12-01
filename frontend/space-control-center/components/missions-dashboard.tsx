"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MissionCard } from "@/components/mission-card"
import { NewMissionSheet } from "@/components/new-mission-sheet"
import { MissionAPI, type MissaoDTO } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function MissionsDashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [missions, setMissions] = useState<MissaoDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingMission, setEditingMission] = useState<MissaoDTO | null>(null) // Estado para edição
  const { toast } = useToast()

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

  useEffect(() => {
    fetchMissions()
  }, [])

  // --- FUNÇÃO DE DELETAR (CORREÇÃO DO ERRO) ---
  const handleDeleteMission = async (id: string) => {
    try {
      await MissionAPI.deletar(id)
      toast({ title: "Missão removida", description: "A missão foi excluída com sucesso." })
      // Atualiza a lista visualmente
      setMissions((prev) => prev.filter((m) => m.id !== id))
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível remover a missão.", variant: "destructive" })
    }
  }

  // --- FUNÇÃO DE EDITAR ---
  const handleEditMission = (mission: MissaoDTO) => {
    setEditingMission(mission) // Salva a missão no estado
    setIsSheetOpen(true)       // Abre o modal
  }

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) setEditingMission(null) // Limpa a edição ao fechar
  }

  const filterMissions = (status?: string) => {
    if (!status) return missions
    return missions.filter((m) => m.status === status)
  }

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
        <h1 className="text-3xl font-bold tracking-tight" data-testid="dashboard-title">Dashboard de Missões</h1>
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Missão
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="PLANEJADA" data-testid="tab-planejada">Planejadas</TabsTrigger>
          <TabsTrigger value="EM_ANDAMENTO" data-testid="tab-em-andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="CONCLUIDA" data-testid="tab-concluida">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground" data-testid="loading-state">Carregando...</div>
          ) : missions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground" data-testid="empty-state">Nenhuma missão encontrada.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="missions-grid">
              {missions.map((mission) => (
                <MissionCard 
                    key={mission.id} 
                    mission={mapToCardProps(mission)}
                    onDelete={handleDeleteMission}
                    onEdit={() => handleEditMission(mission)} 
                />
              ))}
            </div>
          )}
        </TabsContent>

        {["PLANEJADA", "EM_ANDAMENTO", "CONCLUIDA"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterMissions(status).map((mission) => (
                <MissionCard 
                    key={mission.id} 
                    mission={mapToCardProps(mission)} 
                    onDelete={handleDeleteMission}
                    onEdit={() => handleEditMission(mission)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <NewMissionSheet 
        open={isSheetOpen} 
        onOpenChange={handleSheetOpenChange}
        onSuccess={fetchMissions}
        mission={editingMission} 
      />
    </div>
  )
}