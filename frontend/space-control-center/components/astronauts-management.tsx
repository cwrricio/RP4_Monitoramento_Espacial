"use client"

import { useState } from "react"
import { UserPlus, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddAstronautDialog } from "@/components/add-astronaut-dialog"
import { useAstronauts } from "@/hooks/useAstronauts" 
import { AstronautAPI, type AstronautDTO } from "@/lib/api" 
import { useToast } from "@/hooks/use-toast"

export function AstronautsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAstronaut, setEditingAstronaut] = useState<AstronautDTO | null>(null)
  const { astronauts, isLoading, mutate } = useAstronauts() 
  const { toast } = useToast()

  const handleEdit = (astronaut: AstronautDTO) => {
    setEditingAstronaut(astronaut)
    setIsDialogOpen(true)
    toast({ title: "Edição", description: "Função de edição a ser implementada." })
  }

  const handleDelete = async (id: string) => {
    
    try {
      await AstronautAPI.deletar(id)
      mutate() 
      toast({
        title: "Astronauta removido",
        description: "O astronauta foi removido com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o astronauta.",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingAstronaut(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando astronautas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Astronautas</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Astronauta
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Nível de Aptidão</TableHead> 
              <TableHead>Missões</TableHead> 
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {astronauts && astronauts.length > 0 ? (
              astronauts.map((astronaut) => (
                <TableRow key={astronaut.id}>
                  <TableCell className="font-medium">{astronaut.nome}</TableCell>
                  <TableCell>{astronaut.nivelAptidaoMedica}</TableCell> 
                  <TableCell>{astronaut.missoesRealizadas}</TableCell> 
                  <TableCell>
                    <Badge
                      variant={astronaut.ativo ? "default" : "secondary"}
                      className={
                        astronaut.ativo
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                      }
                    >
                      {astronaut.ativo ? "Ativo" : "Inativo"}
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
                        <DropdownMenuItem onClick={() => handleEdit(astronaut)}>Editar Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(astronaut.id)}>
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhum astronauta cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <AddAstronautDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={mutate}
        // A lógica de edição pode ser adicionada aqui
        // astronaut={editingAstronaut} 
      />
    </div>
  )
}