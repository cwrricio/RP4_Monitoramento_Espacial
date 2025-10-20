"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, Users, Target, Play, Square, Trash2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface Missao {
  id: number
  nome: string
  objetivo: string
  dataInicio: string
  dataFim: string | null
  status: "PLANEJADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "FALHOU"
  tripulacaoIds: number[]
}

interface MissionDetailsProps {
  mission: Missao
  onBack: () => void
}

const statusColors = {
  PLANEJADA: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  EM_ANDAMENTO: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CONCLUIDA: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  FALHOU: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusLabels = {
  PLANEJADA: "Planejada",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  FALHOU: "Falhou",
}

// Mock astronaut data
const astronautas = [
  { id: 1, nome: "Ana Silva", especialidade: "Comandante", experiencia: "15 anos" },
  { id: 2, nome: "Carlos Santos", especialidade: "Engenheiro", experiencia: "12 anos" },
  { id: 3, nome: "Maria Oliveira", especialidade: "Cientista", experiencia: "10 anos" },
  { id: 4, nome: "João Costa", especialidade: "Piloto", experiencia: "18 anos" },
  { id: 5, nome: "Lucia Ferreira", especialidade: "Médica", experiencia: "14 anos" },
  { id: 6, nome: "Pedro Almeida", especialidade: "Especialista em Comunicações", experiencia: "8 anos" },
  { id: 7, nome: "Sofia Rodrigues", especialidade: "Geóloga", experiencia: "11 anos" },
  { id: 8, nome: "Miguel Torres", especialidade: "Engenheiro de Sistemas", experiencia: "13 anos" },
  { id: 9, nome: "Isabel Martins", especialidade: "Bióloga", experiencia: "9 anos" },
  { id: 10, nome: "Rafael Pereira", especialidade: "Navegador", experiencia: "16 anos" },
]

export function MissionDetails({ mission, onBack }: MissionDetailsProps) {
  const { toast } = useToast()
  const [currentMission, setCurrentMission] = useState(mission)
  const [loading, setLoading] = useState(false)

  const getProgressPercentage = () => {
    switch (currentMission.status) {
      case "PLANEJADA":
        return 0
      case "EM_ANDAMENTO":
        return 65 // Mock progress
      case "CONCLUIDA":
        return 100
      case "FALHOU":
        return 45 // Mock progress where it failed
      default:
        return 0
    }
  }

  const getDaysElapsed = () => {
    const startDate = new Date(currentMission.dataInicio)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleStartSimulation = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setCurrentMission((prev) => ({ ...prev, status: "EM_ANDAMENTO" }))

      toast({
        title: "Simulação iniciada!",
        description: `A missão "${currentMission.nome}" está agora em andamento.`,
      })
    } catch (error) {
      toast({
        title: "Erro ao iniciar simulação",
        description: "Ocorreu um erro ao iniciar a simulação. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStopSimulation = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setCurrentMission((prev) => ({ ...prev, status: "PLANEJADA" }))

      toast({
        title: "Simulação interrompida",
        description: `A missão "${currentMission.nome}" foi pausada.`,
      })
    } catch (error) {
      toast({
        title: "Erro ao parar simulação",
        description: "Ocorreu um erro ao parar a simulação. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMission = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Missão excluída",
        description: `A missão "${currentMission.nome}" foi excluída com sucesso.`,
      })

      onBack()
    } catch (error) {
      toast({
        title: "Erro ao excluir missão",
        description: "Ocorreu um erro ao excluir a missão. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const crewMembers = astronautas.filter((astronauta) => currentMission.tripulacaoIds.includes(astronauta.id))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 font-[var(--font-playfair)] text-balance">
                {currentMission.nome}
              </h1>
              <p className="text-muted-foreground text-lg text-pretty">{currentMission.objetivo}</p>
            </div>
            <Badge className={`${statusColors[currentMission.status]} text-sm px-3 py-1`}>
              {statusLabels[currentMission.status]}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mission Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progresso da Missão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso Geral</span>
                    <span>{getProgressPercentage()}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{getDaysElapsed()}</div>
                      <div className="text-sm text-muted-foreground">Dias desde o início</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-foreground">{currentMission.tripulacaoIds.length}</div>
                      <div className="text-sm text-muted-foreground">Tripulantes ativos</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mission Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">Data de Início</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(currentMission.dataInicio).toLocaleDateString("pt-BR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>

                  {currentMission.dataFim && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">Data de Conclusão</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(currentMission.dataFim).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Crew Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Tripulação ({crewMembers.length} membros)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crewMembers.map((member) => (
                    <div key={member.id} className="p-4 border rounded-lg">
                      <div className="font-medium text-foreground">{member.nome}</div>
                      <div className="text-sm text-muted-foreground">{member.especialidade}</div>
                      <div className="text-xs text-muted-foreground mt-1">Experiência: {member.experiencia}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mission Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Controles da Missão</CardTitle>
                <CardDescription>Gerencie o status e execução da missão</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentMission.status === "PLANEJADA" && (
                  <Button
                    onClick={handleStartSimulation}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Simulação
                      </>
                    )}
                  </Button>
                )}

                {currentMission.status === "EM_ANDAMENTO" && (
                  <Button
                    onClick={handleStopSimulation}
                    disabled={loading}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2" />
                        Parando...
                      </>
                    ) : (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Parar Simulação
                      </>
                    )}
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={loading}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Missão
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Confirmar Exclusão
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a missão "{currentMission.nome}"? Esta ação não pode ser desfeita
                        e todos os dados da missão serão perdidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteMission}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Excluir Missão
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>

            {/* Mission Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium">{statusLabels[currentMission.status]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID da Missão</span>
                  <span className="text-sm font-medium">#{currentMission.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duração</span>
                  <span className="text-sm font-medium">
                    {currentMission.dataFim
                      ? `${Math.ceil((new Date(currentMission.dataFim).getTime() - new Date(currentMission.dataInicio).getTime()) / (1000 * 60 * 60 * 24))} dias`
                      : "Em andamento"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
