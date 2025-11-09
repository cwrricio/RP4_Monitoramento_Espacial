"use client"

import { useState } from "react"
import { UserPlus, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddAstronautDialog } from "@/components/add-astronaut-dialog"

const mockAstronauts = [
  {
    id: "1",
    name: "Dra. Elena Petrova",
    nationality: "Russa",
    skill: "Engenheira Chefe",
    status: "Ativo" as const,
  },
  {
    id: "2",
    name: "Cmdr. James Chen",
    nationality: "Chinês",
    skill: "Piloto",
    status: "Ativo" as const,
  },
  {
    id: "3",
    name: "Dr. Marcus Silva",
    nationality: "Brasileiro",
    skill: "Cientista",
    status: "Ativo" as const,
  },
  {
    id: "4",
    name: "Eng. Sarah Johnson",
    nationality: "Americana",
    skill: "Engenheira",
    status: "Inativo" as const,
  },
  {
    id: "5",
    name: "Dr. Yuki Tanaka",
    nationality: "Japonesa",
    skill: "Médica",
    status: "Ativo" as const,
  },
]

export function AstronautsManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
              <TableHead>Nacionalidade</TableHead>
              <TableHead>Habilidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAstronauts.map((astronaut) => (
              <TableRow key={astronaut.id}>
                <TableCell className="font-medium">{astronaut.name}</TableCell>
                <TableCell>{astronaut.nationality}</TableCell>
                <TableCell>{astronaut.skill}</TableCell>
                <TableCell>
                  <Badge
                    variant={astronaut.status === "Ativo" ? "default" : "secondary"}
                    className={
                      astronaut.status === "Ativo"
                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                    }
                  >
                    {astronaut.status}
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
                      <DropdownMenuItem>Editar Perfil</DropdownMenuItem>
                      <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Remover</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddAstronautDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  )
}
