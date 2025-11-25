"use client"

import { useState } from "react"
import { MoreVertical, Play, Calendar, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Interface flexível para aceitar tanto status do Java quanto legados
interface Mission {
  id: string
  name: string
  destination: string
  launchDate: string
  status: string 
  description: string
}

// Configuração expandida para aceitar os ENUMS do Java (Maiúsculo)
const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string; label: string }> = {
  // Status vindos do JAVA (Backend)
  "PLANEJADA": { 
    variant: "default", 
    className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    label: "Planejada"
  },
  "EM_ANDAMENTO": { 
    variant: "secondary", 
    className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    label: "Em Andamento"
  },
  "CONCLUIDA": { 
    variant: "outline", 
    className: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    label: "Concluída"
  },
  "FALHOU": { 
    variant: "destructive", 
    className: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    label: "Falhou"
  },

  // Status Legados (para compatibilidade)
  "Planejada": { variant: "default", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20", label: "Planejada" },
  "Em Andamento": { variant: "secondary", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20", label: "Em Andamento" },
  "Concluída": { variant: "outline", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20", label: "Concluída" },
}

export function MissionCard({ mission }: { mission: Mission }) {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false)

  // CORREÇÃO DE SEGURANÇA: Fallback se o status não existir no mapa
  const statusStyle = statusConfig[mission.status] || { 
    variant: "outline", 
    className: "text-gray-500 border-gray-500",
    label: mission.status 
  }

  const getMissionAnimation = (missionName: string) => {
    const animations: Record<string, string> = {
      "Missão Alpha Centauri": "/foguete_20251110_163829.gif",
      "Missão Marte Base": "/foguete_20251110_163829.gif",
      "Missão Europa": "/animations/europa-mission.gif",
      "Missão Titã": "/animations/titan-mission.gif",
      "Missão Estação Orbital": "/orbita_20251110_165300.gif",
    }
    return animations[missionName] || "/animations/default-rocket.gif"
  }

  const handleStartSimulation = () => {
    setIsSimulationOpen(true)
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{mission.name}</CardTitle>
              <CardDescription>{mission.destination}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Editar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSimulationOpen(true)}>
                  Ver Simulação
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Lançamento: {mission.launchDate}</span>
          </div>
          {/* Usa o label traduzido e seguro */}
          <Badge variant={statusStyle.variant} className={statusStyle.className}>
            {statusStyle.label}
          </Badge>
          <p className="text-sm text-muted-foreground">{mission.description}</p>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleStartSimulation}
            disabled={mission.status === "CONCLUIDA" || mission.status === "FALHOU"}
          >
            <Play className="mr-2 h-4 w-4" />
            Iniciar Simulação
          </Button>
        </CardFooter>
      </Card>

      {/* Modal de Simulação */}
      <Dialog open={isSimulationOpen} onOpenChange={setIsSimulationOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Simulação: {mission.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSimulationOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Animação GIF */}
            <div className="flex justify-center bg-black/5 rounded-lg p-4">
              <img 
                src={getMissionAnimation(mission.name)}
                alt={`Simulação da ${mission.name}`}
                className="max-w-full h-auto rounded-lg"
                onError={(e) => {
                  console.error(`Imagem não encontrada: ${e.currentTarget.src}`)
                  e.currentTarget.src = "/animations/default-rocket.gif"
                  e.currentTarget.alt = "Simulação padrão"
                }}
              />
            </div>
            
            {/* Informações da Missão */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-sm">Destino:</span>
                  <p className="text-sm">{mission.destination}</p>
                </div>
                <div>
                  <span className="font-medium text-sm">Status:</span>
                  <Badge variant={statusStyle.variant} className={statusStyle.className}>
                    {statusStyle.label}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-sm">Data de Lançamento:</span>
                  <p className="text-sm">{mission.launchDate}</p>
                </div>
                <div>
                  <span className="font-medium text-sm">Descrição:</span>
                  <p className="text-sm">{mission.description}</p>
                </div>
              </div>
            </div>
            
            {/* Botões de Ação */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsSimulationOpen(false)}
              >
                Fechar
              </Button>
              <Button>
                Executar Simulação Real
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}