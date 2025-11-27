"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Activity, AlertTriangle, CheckCircle2, Info, Shield, Stethoscope, Users, Wrench, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMission } from "@/hooks/useMissions"
import { useEvents } from "@/hooks/useEvents"
import { useProtocols } from "@/hooks/useProtocols"
import { ProtocolAPI, MissionAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface MissionControlPanelProps {
  missionId: string
}

export function MissionControlPanel({ missionId }: MissionControlPanelProps) {
  // Hooks customizados para buscar dados (SWR ou React Query)
  const { mission, isLoading: missionLoading, mutate: mutateMission } = useMission(missionId)
  const { events, mutate: mutateEvents } = useEvents(missionId)
  const { protocols, mutate: mutateProtocols } = useProtocols(missionId)
  
  const [isActivating, setIsActivating] = useState<string | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // --- AÇÕES ---

  const handleActivateProtocol = async (tipo: "MEDICO" | "TECNICO" | "EVACUACAO", descricao: string) => {
    setIsActivating(tipo)
    try {
      await ProtocolAPI.acionar(missionId, { tipo, descricao })
      toast({
        title: "Protocolo Acionado",
        description: `Protocolo ${tipo} ativado com sucesso!`,
      })
      mutateProtocols()
      mutateEvents() // Protocolos geram eventos, então atualizamos a lista
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao acionar protocolo.",
        variant: "destructive",
      })
    } finally {
      setIsActivating(null)
    }
  }

  const handleCompleteMission = async () => {
    setIsCompleting(true)
    try {
      await MissionAPI.concluir(missionId)
      toast({
        title: "Missão Concluída",
        description: "A missão foi encerrada com sucesso!",
      })
      mutateMission()
      // Opcional: Redirecionar para dashboard ou ficar na tela para ver o status "Concluída"
      // router.push("/") 
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao concluir missão.",
        variant: "destructive",
      })
    } finally {
      setIsCompleting(false)
    }
  }

  // --- AUXILIARES DE UI ---

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case "INFO": return <Info className="h-4 w-4" />
      case "ALERTA": return <AlertTriangle className="h-4 w-4" />
      case "ERRO_CRITICO": return <XCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getEventBadgeVariant = (tipo: string): "default" | "secondary" | "destructive" => {
    switch (tipo) {
      case "INFO": return "default"
      case "ALERTA": return "secondary"
      case "ERRO_CRITICO": return "destructive"
      default: return "default"
    }
  }

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "EM_ANDAMENTO": return "default"
      case "PLANEJADA": return "secondary"
      case "CONCLUIDA": return "default"
      case "FALHOU": return "destructive"
      default: return "default"
    }
  }

  // --- RENDERIZAÇÃO ---

  if (missionLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando dados da missão...</p>
        </div>
      </div>
    )
  }

  if (!mission) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Missão não encontrada.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mission Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{mission.nome}</h1>
          <p className="text-muted-foreground mt-1">{mission.objetivo}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getStatusBadgeVariant(mission.status)} className="text-sm">
            {mission.status === "EM_ANDAMENTO" ? "Em Andamento" : mission.status}
          </Badge>
          {mission.status === "EM_ANDAMENTO" && (
            <Button variant="destructive" onClick={handleCompleteMission} disabled={isCompleting}>
              {isCompleting ? "Encerrando..." : "Encerrar Missão"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* =================================================================================
            CORREÇÃO PRINCIPAL: TRIPULAÇÃO E BIOMETRIA
            Agora itera sobre objetos AstronautaDTO completos, não IDs.
           ================================================================================= */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tripulação e Biometria
            </CardTitle>
            <CardDescription>Dados biométricos em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Verifica se a lista existe antes de mapear */}
                {mission.tripulacao && mission.tripulacao.length > 0 ? (
                  mission.tripulacao.map((astronauta) => (
                    <div key={astronauta.id} className="border rounded-lg p-4 space-y-3">
                      
                      {/* Cabeçalho do Card do Astronauta */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{astronauta.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            Missões: {astronauta.missoesRealizadas}
                          </p>
                        </div>
                        <Badge variant={astronauta.ativo ? "default" : "secondary"}>
                          {astronauta.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      {/* Seção de Biometria (Renderiza apenas se houver dados) */}
                      {astronauta.tipoBiometria ? (
                        <>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium">{astronauta.tipoBiometria}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">{astronauta.valorBiometria}</span>
                              <span className="text-sm text-muted-foreground">{astronauta.unidadeBiometria}</span>
                            </div>
                          </div>
                          {astronauta.registradoEm && (
                            <p className="text-xs text-muted-foreground">
                              Atualizado:{" "}
                              {formatDistanceToNow(new Date(astronauta.registradoEm), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          )}
                        </>
                      ) : (
                        // Fallback elegante se não tiver biometria ainda
                        <div className="bg-muted/30 p-2 rounded text-center">
                            <p className="text-xs text-muted-foreground italic">
                                Aguardando sincronização biométrica...
                            </p>
                        </div>
                      )}

                      {/* Rodapé do Card do Astronauta */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">Aptidão:</span>
                        <Badge
                          variant={
                            astronauta.nivelAptidaoMedica === "ALTO" ? "default" :
                            astronauta.nivelAptidaoMedica === "MEDIO" ? "secondary" : "destructive"
                          }
                          className="text-xs"
                        >
                          {astronauta.nivelAptidaoMedica}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">Nenhum astronauta na tripulação.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* =================================================================================
            LOG DE EVENTOS
           ================================================================================= */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Log de Eventos
            </CardTitle>
            <CardDescription>Feed em tempo real dos eventos da missão</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {events && events.length > 0 ? (
                    events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-3">
                        <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getEventIcon(event.tipo)}</div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                            <Badge variant={getEventBadgeVariant(event.tipo)} className="text-xs">
                                {event.tipo}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(event.timestamp), {
                                addSuffix: true,
                                locale: ptBR,
                                })}
                            </span>
                            </div>
                            <p className="text-sm">{event.descricao}</p>
                        </div>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground">Nenhum evento registrado até o momento.</p>
                    </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* =================================================================================
            PROTOCOLOS DE EMERGÊNCIA
           ================================================================================= */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Protocolos de Emergência
          </CardTitle>
          <CardDescription>Acione protocolos manuais em caso de falha sistêmica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Botões Grandes de Ação */}
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
              onClick={() => handleActivateProtocol("MEDICO", "Protocolo médico de emergência acionado manualmente")}
              disabled={isActivating !== null}
            >
              <Stethoscope className="h-6 w-6" />
              <span>Protocolo Médico</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
              onClick={() => handleActivateProtocol("TECNICO", "Protocolo técnico de suporte acionado")}
              disabled={isActivating !== null}
            >
              <Wrench className="h-6 w-6" />
              <span>Protocolo Técnico</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
              onClick={() => handleActivateProtocol("EVACUACAO", "ALERTA: Protocolo de evacuação total da nave iniciado!")}
              disabled={isActivating !== null}
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Evacuação Total</span>
            </Button>
          </div>

          {/* Histórico de Protocolos */}
          <div>
            <h4 className="font-semibold mb-3">Histórico de Protocolos Acionados</h4>
            <ScrollArea className="h-[150px]">
              <div className="space-y-2">
                {protocols && protocols.length > 0 ? (
                    protocols.map((protocol) => (
                    <div key={protocol.id} className="border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-center justify-between mb-1">
                        <Badge variant={protocol.tipo === "EVACUACAO" ? "destructive" : "secondary"} className="text-xs">
                            {protocol.tipo}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(protocol.acionadoEm), {
                            addSuffix: true,
                            locale: ptBR,
                            })}
                        </span>
                        </div>
                        <p className="text-sm font-medium">{protocol.descricao}</p>
                    </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-4 text-sm bg-muted/10 rounded border border-dashed">
                        Nenhum protocolo acionado nesta missão.
                    </p>
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}