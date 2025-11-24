"use client"

import { useState, useEffect } from "react" // <-- Adicionado useEffect
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MissionCard } from "@/components/mission-card"
import { NewMissionSheet } from "@/components/new-mission-sheet"
import { MissionAPI, MissaoDTO } from "@/lib/api" // <-- Importar a API

export function MissionsDashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [missions, setMissions] = useState<MissaoDTO[]>([]) // <-- Estado para guardar as missões reais
  const [isLoading, setIsLoading] = useState(true)

  // Função para carregar missões do Backend
  const loadMissions = async () => {
    try {
      setIsLoading(true)
      const data = await MissionAPI.listar()
      setMissions(data)
    } catch (error) {
      console.error("Erro ao carregar missões:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Carrega as missões quando o componente abre
  useEffect(() => {
    loadMissions()
  }, [])

  // Função auxiliar para atualizar a lista quando uma nova missão for criada
  const handleMissionCreated = () => {
    setIsSheetOpen(false)
    loadMissions() // Recarrega a lista do servidor
  }

  // Função de filtro atualizada para usar os dados reais
  const filterMissions = (statusFilter?: string) => {
    if (!statusFilter) return missions
    
    // O Backend retorna status em MAIÚSCULO (ex: "PLANEJADA"), 
    // mas o mock usava "Planejada". Vamos normalizar se necessário.
    return missions.filter((m) => m.status === statusFilter)
  }

  // Função para adaptar o DTO do Java para o formato que o MissionCard espera
  // (Se o MissionCard esperar props específicas como 'destination')
  const mapToCardProps = (m: MissaoDTO) => ({
    id: m.id,
    name: m.nome, // Traduzindo 'nome' -> 'name'
    destination: "Espaço Profundo", // Backend ainda não tem destino, usamos um padrão
    launchDate: m.dataInicio, // Traduzindo 'dataInicio' -> 'launchDate'
    status: m.status,
    description: m.objetivo, // Traduzindo 'objetivo' -> 'description'
  })

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
          <TabsTrigger value="PLANEJADA">Planejadas</TabsTrigger>
          <TabsTrigger value="EM_ANDAMENTO">Em Andamento</TabsTrigger>
          <TabsTrigger value="CONCLUIDA">Concluídas</TabsTrigger>
        </TabsList>

        {/* Conteúdo Geral */}
        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <p>Carregando missões...</p>
          ) : missions.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma missão encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missions.map((mission) => (
                // @ts-ignore - Ignorando erro de tipagem estrita do MissionCard por enquanto
                <MissionCard key={mission.id} mission={mapToCardProps(mission)} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Abas Específicas (Reutilizando lógica) */}
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

      {/* Passamos a função de recarregar para o Sheet */}
      <NewMissionSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        onSuccess={handleMissionCreated} 
      />
    </div>
  )
}