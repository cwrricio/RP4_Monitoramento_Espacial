"use client"

import { useState } from "react"
import type React from "react" // Importado para o React.FormEvent
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
  const [idade, setIdade] = useState("") // Manter como string para o <Input>
  const [nivelAptidaoMedica, setNivelAptidaoMedica] = useState<"ALTO" | "MEDIO" | "BAIXO">("MEDIO")
  const [missoesRealizadas, setMissoesRealizadas] = useState("0") // Manter como string
  const [ativo, setAtivo] = useState("true")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // --- INÍCIO DA CORREÇÃO ---

  // 1. Mover toda a lógica de parse e validação PARA DENTRO do handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevenir o reload da página
    setIsSubmitting(true)

    // 2. Parsear os números AQUI, usando o estado mais recente
    const parsedIdade = Number.parseInt(idade, 10)
    const parsedMissoes = Number.parseInt(missoesRealizadas, 10)

    // 3. Validação robusta
    //    Verifica se o nome não está vazio E se os números são válidos (não NaN)
    if (!nome || isNaN(parsedIdade) || isNaN(parsedMissoes)) {
      toast({
        title: "Campos Inválidos",
        description: "Nome, Idade e Missões Realizadas são obrigatórios e devem ser números.",
        variant: "destructive",
      })
      setIsSubmitting(false) // Liberar o botão
      return // Impede o envio
    }
    
    // 4. Validação de regras de negócio (opcional, mas recomendado)
    if (parsedIdade <= 0) {
      toast({
        title: "Idade Inválida",
        description: "A idade deve ser um número positivo.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      // 5. Usar os valores parseados para criar o DTO
      const data: CreateAstronautRequest = {
        nome,
        idade: parsedIdade,
        ativo: ativo === "true",
        nivelAptidaoMedica,
        missoesRealizadas: parsedMissoes,
      }

      await AstronautAPI.criar(data)

      toast({
        title: "Sucesso",
        description: "Astronauta criado com sucesso!",
      })

      onOpenChange(false)
      onSuccess?.() // Isto é o 'mutate', vai recarregar a lista

      // Reset form
      setNome("")
      setIdade("")
      setNivelAptidaoMedica("MEDIO")
      setMissoesRealizadas("0")
      setAtivo("true")
    } catch (error: any) {
      // 6. Log de erro melhorado
      console.error("Falha na API ao criar astronauta:", error)
      toast({
        title: "Erro de API",
        description: error?.message || "Não foi possível criar o astronauta. Verifique o console do backend.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  // --- FIM DA CORREÇÃO ---

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Astronauta</DialogTitle>
          <DialogDescription>Insira as informações do novo membro.</DialogDescription>
        </DialogHeader>
        
        {/* 7. Usar <form> e onSubmit */}
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
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
              onChange={(e) => {
                // 8. Correção no onChange de números
                // Isso permite ao usuário apagar o campo sem travar
                const valorString = e.target.value
                if (valorString === "") {
                  setIdade("")
                } else {
                  // Apenas atualiza se for um número válido (evita "e", ".", etc.)
                  const valorInt = Number.parseInt(valorString, 10)
                  if (!isNaN(valorInt)) {
                    setIdade(valorString)
                  }
                }
              }}
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
              onChange={(e) => {
                // 8. Correção no onChange de números
                const valorString = e.target.value
                 if (valorString === "") {
                  setMissoesRealizadas("")
                } else {
                  const valorInt = Number.parseInt(valorString, 10)
                  if (!isNaN(valorInt)) {
                    setMissoesRealizadas(valorString)
                  }
                }
              }}
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
          
          {/* 9. Mover DialogFooter para dentro do <form> e adicionar type="submit" */}
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Astronauta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}