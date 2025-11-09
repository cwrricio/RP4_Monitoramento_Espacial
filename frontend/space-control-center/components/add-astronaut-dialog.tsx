"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AstronautAPI, type CreateAstronautRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AddAstronautDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddAstronautDialog({ open, onOpenChange, onSuccess }: AddAstronautDialogProps) {
  const [nome, setNome] = useState("")
  const [idade, setIdade] = useState("")
  const [nivelAptidaoMedica, setNivelAptidaoMedica] = useState<"ALTO" | "MEDIO" | "BAIXO">("MEDIO")
  const [missoesRealizadas, setMissoesRealizadas] = useState("0")
  const [ativo, setAtivo] = useState("true")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!nome || !idade) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const data: CreateAstronautRequest = {
        nome,
        idade: Number.parseInt(idade),
        ativo: ativo === "true",
        nivelAptidaoMedica,
        missoesRealizadas: Number.parseInt(missoesRealizadas),
      }

      await AstronautAPI.criar(data)

      toast({
        title: "Sucesso",
        description: "Astronauta criado com sucesso!",
      })

      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setNome("")
      setIdade("")
      setNivelAptidaoMedica("MEDIO")
      setMissoesRealizadas("0")
      setAtivo("true")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar astronauta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Astronauta</DialogTitle>
          <DialogDescription>Insira as informações do novo membro.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input
              id="nome"
              placeholder="Ex: Dra. Elena Petrova"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="idade">Idade</Label>
            <Input
              id="idade"
              type="number"
              placeholder="Ex: 35"
              value={idade}
              onChange={(e) => setIdade(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="nivelAptidao">Nível Aptidão Médica</Label>
            <Select value={nivelAptidaoMedica} onValueChange={(value: any) => setNivelAptidaoMedica(value)}>
              <SelectTrigger id="nivelAptidao">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALTO">Alto</SelectItem>
                <SelectItem value="MEDIO">Médio</SelectItem>
                <SelectItem value="BAIXO">Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="missoes">Missões Realizadas</Label>
            <Input
              id="missoes"
              type="number"
              placeholder="0"
              value={missoesRealizadas}
              onChange={(e) => setMissoesRealizadas(e.target.value)}
            />
          </div>
          <div className="grid gap-3">
            <Label>Status</Label>
            <RadioGroup value={ativo} onValueChange={setAtivo}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="active" />
                <Label htmlFor="active" className="font-normal cursor-pointer">
                  Ativo
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="inactive" />
                <Label htmlFor="inactive" className="font-normal cursor-pointer">
                  Inativo
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Astronauta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
