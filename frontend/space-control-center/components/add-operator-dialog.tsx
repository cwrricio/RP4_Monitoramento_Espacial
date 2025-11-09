"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { OperatorAPI, type OperadorDeMissaoDTO, type CriarOperadorRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AddOperatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operator?: OperadorDeMissaoDTO | null
  onSuccess?: () => void
}

export function AddOperatorDialog({ open, onOpenChange, operator, onSuccess }: AddOperatorDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CriarOperadorRequest>({
    nome: "",
    idade: 0,
    turno: "",
    areaDeEspecializacao: "",
    statusAtivo: true,
  })

  useEffect(() => {
    if (operator) {
      setFormData({
        nome: operator.nome,
        idade: operator.idade,
        turno: operator.turno,
        areaDeEspecializacao: operator.areaDeEspecializacao,
        statusAtivo: operator.statusAtivo,
      })
    } else {
      setFormData({
        nome: "",
        idade: 0,
        turno: "",
        areaDeEspecializacao: "",
        statusAtivo: true,
      })
    }
  }, [operator, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (operator) {
        await OperatorAPI.atualizar(operator.id, formData)
        toast({
          title: "Operador atualizado",
          description: "O operador foi atualizado com sucesso.",
        })
      } else {
        await OperatorAPI.criar(formData)
        toast({
          title: "Operador criado",
          description: "O operador foi criado com sucesso.",
        })
      }
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o operador.",
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
          <DialogTitle>{operator ? "Editar Operador" : "Adicionar Novo Operador"}</DialogTitle>
          <DialogDescription>
            {operator ? "Edite as informações do operador abaixo." : "Preencha as informações do novo operador."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Operador</Label>
            <Input
              id="nome"
              placeholder="Ex: João Silva"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idade">Idade</Label>
            <Input
              id="idade"
              type="number"
              min="18"
              max="100"
              placeholder="Ex: 35"
              value={formData.idade || ""}
              onChange={(e) => setFormData({ ...formData, idade: Number.parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="turno">Turno</Label>
            <Input
              id="turno"
              placeholder="Ex: Integral, Noturno, Diurno"
              value={formData.turno}
              onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="especializacao">Área de Especialização</Label>
            <Input
              id="especializacao"
              placeholder="Ex: Controle de Voo"
              value={formData.areaDeEspecializacao}
              onChange={(e) => setFormData({ ...formData, areaDeEspecializacao: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Status</Label>
            <RadioGroup
              value={formData.statusAtivo ? "ativo" : "inativo"}
              onValueChange={(value) => setFormData({ ...formData, statusAtivo: value === "ativo" })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ativo" id="ativo" />
                <Label htmlFor="ativo" className="font-normal cursor-pointer">
                  Ativo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inativo" id="inativo" />
                <Label htmlFor="inativo" className="font-normal cursor-pointer">
                  Inativo
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : operator ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
