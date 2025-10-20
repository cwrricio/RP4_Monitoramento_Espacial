"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Rocket, Calendar, Users, Play, Trash2, Eye } from "lucide-react"
import { MissionForm } from "./mission-form"
import { MissionDetails } from "./mission-details"
import { useMissions } from "@/hooks/use-missions"
import { getStatusLabel, getStatusColor } from "@/lib/api"
import type { MissaoDTO } from "@/lib/api"

export function MissionDashboard() {
  const { missions, loading, createMission, deleteMission, startSimulation } = useMissions()
  const [showForm, setShowForm] = useState(false)
  const [selectedMission, setSelectedMission] = useState<MissaoDTO | null>(null)

  const handleMissionCreated = async (missionData: any) => {
    const newMission = await createMission(missionData)
    if (newMission) {
      setShowForm(false)
    }
  }

  const handleStartSimulation = async (missionId: number) => {
    await startSimulation(missionId)
  }

  const handleDeleteMission = async (missionId: number) => {
    await deleteMission(missionId)
  }

  if (showForm) {
    return <MissionForm onCancel={() => setShowForm(false)} onSuccess={handleMissionCreated} />
  }

  if (selectedMission) {
    return <MissionDetails mission={selectedMission} onBack={() => setSelectedMission(null)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 font-[var(--font-playfair)]">
            Sistema de Gerenciamento de Missões
          </h1>
          <p className="text-muted-foreground text-lg">Controle e monitore suas missões espaciais</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Missões</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{missions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{missions.filter((m) => m.status === "EM_ANDAMENTO").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{missions.filter((m) => m.status === "CONCLUIDA").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tripulantes Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{missions.reduce((acc, m) => acc + m.tripulacaoIds.length, 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Missões Ativas</h2>
          <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Missão
          </Button>
        </div>

        {/* Mission Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission) => (
              <Card key={mission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-balance">{mission.nome}</CardTitle>
                      <CardDescription className="text-pretty">{mission.objetivo}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(mission.status)}>{getStatusLabel(mission.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      Início: {new Date(mission.dataInicio).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {mission.tripulacaoIds.length} tripulantes
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedMission(mission)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>

                      {mission.status === "PLANEJADA" && (
                        <Button
                          size="sm"
                          onClick={() => handleStartSimulation(mission.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Iniciar
                        </Button>
                      )}

                      <Button variant="destructive" size="sm" onClick={() => handleDeleteMission(mission.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {missions.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma missão encontrada</h3>
              <p className="text-muted-foreground mb-4">Comece criando sua primeira missão espacial</p>
              <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Missão
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
