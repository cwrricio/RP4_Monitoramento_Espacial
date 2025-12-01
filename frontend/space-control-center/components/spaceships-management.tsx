"use client"

import { useState } from "react"
import { Rocket, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddSpaceshipDialog } from "@/components/add-spaceship-dialog"
import { useSpaceships } from "@/hooks/useSpaceships"
import { SpaceshipAPI, type EspaconaveDTO } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "OPERACIONAL":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    case "EM_MANUTENCAO":
      return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
    case "DESATIVADA":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    default:
      return ""
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "OPERACIONAL":
      return "Operacional"
    case "EM_MANUTENCAO":
      return "Em Manutenção"
    case "DESATIVADA":
      return "Desativada"
    default:
      return status
  }
}

export function SpaceshipsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSpaceship, setEditingSpaceship] = useState<EspaconaveDTO | null>(null)
  const { spaceships, isLoading, mutate } = useSpaceships()
  const { toast } = useToast()

  const handleEdit = (spaceship: EspaconaveDTO) => {
    setEditingSpaceship(spaceship)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await SpaceshipAPI.deletar(id)
      mutate()
      toast({
        title: "Espaçonave removida",
        description: "A espaçonave foi removida com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover a espaçonave.",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingSpaceship(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando espaçonaves...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Espaçonaves</h1>
        <Button onClick={() => setIsDialogOpen(true)}
          data-testid="btn-add-spaceship" >
          <Rocket className="mr-2 h-4 w-4" />
          Adicionar Espaçonave
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Status Operacional</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {spaceships && spaceships.length > 0 ? (
              spaceships.map((spaceship) => (
                <TableRow key={spaceship.id}>
                  <TableCell className="font-medium">{spaceship.nome}</TableCell>
                  <TableCell>{spaceship.capacidade} tripulantes</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusBadgeColor(spaceship.statusOperacional)}>
                      {getStatusLabel(spaceship.statusOperacional)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(spaceship)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(spaceship.id)}>
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhuma espaçonave cadastrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddSpaceshipDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        spaceship={editingSpaceship}
        onSuccess={mutate}
      />
    </div>
  )
}
