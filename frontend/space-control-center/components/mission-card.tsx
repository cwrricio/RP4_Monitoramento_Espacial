"use client"

import { MoreVertical, Play, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type MissionStatus = "Planejada" | "Em Andamento" | "Concluída"

interface Mission {
  id: string
  name: string
  destination: string
  launchDate: string
  status: MissionStatus
  description: string
}

const statusConfig: Record<MissionStatus, { variant: "default" | "secondary" | "outline"; className: string }> = {
  Planejada: { variant: "default", className: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
  "Em Andamento": { variant: "secondary", className: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
  Concluída: { variant: "outline", className: "bg-green-500/10 text-green-500 hover:bg-green-500/20" },
}

export function MissionCard({ mission }: { mission: Mission }) {
  const statusStyle = statusConfig[mission.status]

  return (
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
              <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
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
        <Badge variant={statusStyle.variant} className={statusStyle.className}>
          {mission.status}
        </Badge>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          <Play className="mr-2 h-4 w-4" />
          Iniciar Simulação
        </Button>
      </CardFooter>
    </Card>
  )
}
