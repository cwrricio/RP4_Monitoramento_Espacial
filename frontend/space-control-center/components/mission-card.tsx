// space-control-center/components/mission-card.tsx
"use client"

import { MoreVertical, Play, Calendar, Trash2, Pencil, Users } from "lucide-react" // Adicionar ícones
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MissaoDTO, getStatusLabel, getStatusConfig } from "@/lib/api" // Importar DTO e utils
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


interface MissionCardProps {
  mission: MissaoDTO;
  onDelete: (id: number) => void; 
  onStart: (id: number) => void;  
  //onEdit: (mission: MissaoDTO) => void; 
}

export function MissionCard({ mission, onDelete, onStart }: MissionCardProps) {
  const statusStyle = getStatusConfig(mission.status)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 mr-2">
            <CardTitle className="text-lg leading-tight">{mission.nome}</CardTitle>
            <CardDescription className="text-sm">{mission.objetivo || "Sem objetivo definido."}</CardDescription>
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
             <Badge variant={statusStyle.variant} className={`${statusStyle.className} mb-1`}>
               {getStatusLabel(mission.status)}
             </Badge>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuItem onClick={() => onEdit(mission)}> <Pencil className="mr-2 h-4 w-4" /> Editar </DropdownMenuItem> */}
                <DropdownMenuItem disabled> <Pencil className="mr-2 h-4 w-4" /> Editar (Em breve) </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e: Event) => e.preventDefault()} 
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a missão "{mission.nome}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDelete(mission.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Início: {mission.dataInicio ? new Date(mission.dataInicio).toLocaleDateString("pt-BR") : "Não definido"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{mission.tripulacaoIds.length} Tripulantes</span>
        </div>
      </CardContent>
      <CardFooter>
        {mission.status === 'PLANEJADA' && (
           <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => onStart(mission.id)}>
             <Play className="mr-2 h-4 w-4" />
             Iniciar Simulação
           </Button>
        )}
         {/* Adicionar outras ações se necessário, ex: Ver Relatório, etc. */}
      </CardFooter>
    </Card>
  )
}