"use client"

import { useState } from "react"
import { Headset, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddOperatorDialog } from "@/components/add-operator-dialog"
import { useOperators } from "@/hooks/useOperators"
import { OperatorAPI, type OperadorDeMissaoDTO } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function OperatorsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOperator, setEditingOperator] = useState<OperadorDeMissaoDTO | null>(null)
  const { operators, isLoading, mutate } = useOperators()
  const { toast } = useToast()

  const handleEdit = (operator: OperadorDeMissaoDTO) => {
    setEditingOperator(operator)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await OperatorAPI.deletar(id)
      mutate()
      toast({
        title: "Operador removido",
        description: "O operador foi removido com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o operador.",
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingOperator(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando operadores...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Operadores</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Headset className="mr-2 h-4 w-4" />
          Adicionar Operador
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Especialização</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators && operators.length > 0 ? (
              operators.map((operator) => (
                <TableRow key={operator.id}>
                  <TableCell className="font-medium">{operator.nome}</TableCell>
                  <TableCell>{operator.idade} anos</TableCell>
                  <TableCell>{operator.turno}</TableCell>
                  <TableCell>{operator.areaDeEspecializacao}</TableCell>
                  <TableCell>
                    <Badge
                      variant={operator.statusAtivo ? "default" : "secondary"}
                      className={
                        operator.statusAtivo
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                      }
                    >
                      {operator.statusAtivo ? "Ativo" : "Inativo"}
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
                        <DropdownMenuItem onClick={() => handleEdit(operator)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(operator.id)}>
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum operador cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AddOperatorDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        operator={editingOperator}
        onSuccess={mutate}
      />
    </div>
  )
}
