"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SpaceshipAPI, type EspaconaveDTO, type SalvarEspaconaveRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AddSpaceshipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  spaceship?: EspaconaveDTO | null
  onSuccess?: () => void
}

export function AddSpaceshipDialog({ open, onOpenChange, spaceship, onSuccess }: AddSpaceshipDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<SalvarEspaconaveRequest>({
    nome: "",
    capacidade: 0,
    statusOperacional: "OPERACIONAL",
  })

  useEffect(() => {
    if (spaceship) {
      setFormData({
        nome: spaceship.nome,
        capacidade: spaceship.capacidade,
        statusOperacional: spaceship.statusOperacional,
      })
    } else {
      setFormData({
        nome: "",
        capacidade: 0,
        statusOperacional: "OPERACIONAL",
      })
    }
  }, [spaceship, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (spaceship) {
        await SpaceshipAPI.atualizar(spaceship.id, formData)
        toast({
          title: "Espaçonave atualizada",
          description: "A espaçonave foi atualizada com sucesso.",
        })
      } else {
        await SpaceshipAPI.criar(formData)
        toast({
          title: "Espaçonave criada",
          description: "A espaçonave foi criada com sucesso.",
        })
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a espaçonave.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{spaceship ? "Editar Espaçonave" : "Adicionar Nova Espaçonave"}</DialogTitle>
          <DialogDescription>
            {spaceship ? "Edite as informações da espaçonave abaixo." : "Preencha as informações da nova espaçonave."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Espaçonave</Label>
            <Input
              id="nome"
              placeholder="Ex: Apollo 11"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacidade">Capacidade da Tripulação</Label>
            <Input
              id="capacidade"
              type="number"
              min="1"
              placeholder="Ex: 5"
              value={formData.capacidade || ""}
              onChange={(e) => setFormData({ ...formData, capacidade: Number.parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status Operacional</Label>
            <Select
              value={formData.statusOperacional}
              onValueChange={(value: any) => setFormData({ ...formData, statusOperacional: value })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPERACIONAL">Operacional</SelectItem>
                <SelectItem value="EM_MANUTENCAO">Em Manutenção</SelectItem>
                <SelectItem value="DESATIVADA">Desativada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : spaceship ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
