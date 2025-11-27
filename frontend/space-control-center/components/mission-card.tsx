"use client"

import { useState } from "react"
import { MoreVertical, Play, Calendar, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Mission {
  id: string
  name: string
  destination: string
  launchDate: string
  status: string 
  description: string
}

const statusConfig: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; className: string; label: string }> = {
  "PLANEJADA": { variant: "default", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20", label: "Planejada" },
  "EM_ANDAMENTO": { variant: "secondary", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20", label: "Em Andamento" },
  "CONCLUIDA": { variant: "outline", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20", label: "Concluída" },
  "FALHOU": { variant: "destructive", className: "bg-red-500/10 text-red-500 hover:bg-red-500/20", label: "Falhou" },
}

// Props atualizadas: Recebe onDelete e onEdit
interface MissionCardProps {
    mission: Mission
    onDelete: (id: string) => void
    onEdit?: () => void
}

export function MissionCard({ mission, onDelete, onEdit }: MissionCardProps) {
  const [isSimulationOpen, setIsSimulationOpen] = useState(false)
  const statusStyle = statusConfig[mission.status] || { variant: "outline", className: "text-gray-500", label: mission.status }

  return (
    <>
      <Card className="flex flex-col h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{mission.name}</CardTitle>
              <CardDescription>{mission.destination}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Botão de Editar Conectado */}
                <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setIsSimulationOpen(true)}>Ver Simulação</DropdownMenuItem>
                
                {/* Botão de Excluir Conectado */}
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => onDelete(mission.id)}>
                    Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" /><span>Lançamento: {mission.launchDate}</span>
          </div>
          <Badge variant={statusStyle.variant} className={statusStyle.className}>{statusStyle.label}</Badge>
          <p className="text-sm text-muted-foreground">{mission.description}</p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setIsSimulationOpen(true)} disabled={mission.status === "CONCLUIDA"}>
            <Play className="mr-2 h-4 w-4" /> Iniciar Simulação
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isSimulationOpen} onOpenChange={setIsSimulationOpen}>
        <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle>Simulação: {mission.name}</DialogTitle></DialogHeader>
            <div className="flex justify-center bg-black/5 rounded-lg p-4 h-64 items-center">
                <p>Simulação Visual...</p>
            </div>
        </DialogContent>
      </Dialog>
    </>
  )
}