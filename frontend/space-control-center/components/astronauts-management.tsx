// space-control-center/components/astronauts-management.tsx
"use client"

import { useState } from "react"
import { UserPlus, MoreHorizontal, Loader2, Pencil, Trash2 } from "lucide-react" // Add icons
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddAstronautDialog } from "@/components/add-astronaut-dialog"
import { useAstronauts } from "@/hooks/use-astronauts" // Import hook
import { AstronautaDTO } from "@/lib/api" // Import DTO
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
} from "@/components/ui/alert-dialog" // Import AlertDialog


// REMOVER mockAstronauts

export function AstronautsManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAstronaut, setEditingAstronaut] = useState<AstronautaDTO | null>(null); // State for editing

  // Usar o hook
  const { astronauts, loading, error, createAstronaut, updateAstronaut, deleteAstronaut } = useAstronauts();

   const handleCreate = async (data: any) => {
     const success = await createAstronaut(data);
     if (success) {
       setIsAddDialogOpen(false); // Fecha o dialog de adição
     }
   };

   const handleUpdate = async (data: any) => {
     if (!editingAstronaut) return;
     const success = await updateAstronaut(editingAstronaut.id, data);
     if (success) {
       setEditingAstronaut(null); // Fecha o dialog de edição
     }
   };

   const handleDelete = async (id: number) => {
     await deleteAstronaut(id);
   }

  // Funções auxiliares para badges (poderiam ir para lib/api ou utils)
  const getAptitudeColor = (nivel: string | null) => {
    switch (nivel?.toUpperCase()) {
      case "ALTO": return "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20";
      case "MEDIO": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20";
      case "BAIXO": return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20";
    }
  }
   const getStatusColor = (ativo: boolean) => {
     return ativo
       ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
       : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 border-gray-500/20";
   }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Astronautas</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Astronauta
        </Button>
      </div>

      {/* Error/Loading State */}
       {error && <div className="text-destructive p-4 border border-destructive rounded">{error}</div>}


      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Idade</TableHead> {/* Adicionado Idade */}
              <TableHead>Nível Aptidão</TableHead> {/* Mudado de Habilidade */}
              <TableHead>Missões</TableHead> {/* Adicionado Missões */}
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Carregando astronautas...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : astronauts.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                   Nenhum astronauta encontrado.
                 </TableCell>
               </TableRow>
            ) : (
              astronauts.map((astronaut) => (
              <TableRow key={astronaut.id}>
                <TableCell className="font-medium">{astronaut.nome}</TableCell>
                <TableCell>{astronaut.idade}</TableCell>
                <TableCell>
                   <Badge variant="outline" className={getAptitudeColor(astronaut.nivelAptidaoMedica)}>
                     {astronaut.nivelAptidaoMedica || "N/A"}
                   </Badge>
                </TableCell>
                <TableCell>{astronaut.missoesRealizadas}</TableCell>
                <TableCell>
                  <Badge variant={"outline"} className={getStatusColor(astronaut.ativo)}>
                    {astronaut.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingAstronaut(astronaut)}>
                         <Pencil className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem>Ver Detalhes</DropdownMenuItem> */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem
                             onSelect={(e: Event) => e.preventDefault()}
                             className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                           >
                             <Trash2 className="mr-2 h-4 w-4" /> Remover
                           </DropdownMenuItem>
                         </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover o astronauta "{astronaut.nome}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(astronaut.id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </div>

       {/* Dialog para Adicionar */}
      <AddAstronautDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreate} // Passa a função de criar
      />

       {/* Dialog para Editar (reutiliza o mesmo componente) */}
       {editingAstronaut && (
         <AddAstronautDialog
           key={editingAstronaut.id} 
           open={!!editingAstronaut}
           onOpenChange={(open) => !open && setEditingAstronaut(null)}
           onSubmit={handleUpdate} 
           astronautData={editingAstronaut} 
           isEditMode={true}
         />
       )}
    </div>
  )
}