"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AstronautAPI, type CreateAstronautRequest, type AstronautDTO } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AddAstronautDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  astronaut?: AstronautDTO | null
}

export function AddAstronautDialog({ open, onOpenChange, onSuccess, astronaut }: AddAstronautDialogProps) {
  const [nome, setNome] = useState("")
  const [idade, setIdade] = useState("")
  const [nivelAptidaoMedica, setNivelAptidaoMedica] = useState<"ALTO" | "MEDIO" | "BAIXO">("MEDIO")
  const [missoesRealizadas, setMissoesRealizadas] = useState("0")
  const [ativo, setAtivo] = useState("true")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (astronaut) {
      setNome(astronaut.nome)
      setIdade(astronaut.idade.toString())
      setNivelAptidaoMedica(astronaut.nivelAptidaoMedica as any)
      setMissoesRealizadas(astronaut.missoesRealizadas.toString())
      setAtivo(astronaut.ativo ? "true" : "false")
    } else {
      setNome("")
      setIdade("")
      setNivelAptidaoMedica("MEDIO")
      setMissoesRealizadas("0")
      setAtivo("true")
    }
  }, [astronaut, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const parsedIdade = Number.parseInt(idade, 10)
    const parsedMissoes = Number.parseInt(missoesRealizadas, 10)

    // CORREÇÃO 1: Validação de idade mínima e máxima
    if (!nome || isNaN(parsedIdade) || isNaN(parsedMissoes)) {
      toast({ title: "Erro", description: "Campos inválidos.", variant: "destructive" })
      setIsSubmitting(false); return
    }

    if (parsedIdade < 18 || parsedIdade > 100) {
        toast({ 
            title: "Idade Inválida", 
            description: "A idade do astronauta deve ser entre 18 e 100 anos.", 
            variant: "destructive" 
        })
        setIsSubmitting(false); return
    }

    try {
      const data: CreateAstronautRequest = {
        nome,
        idade: parsedIdade,
        ativo: ativo === "true",
        nivelAptidaoMedica,
        missoesRealizadas: parsedMissoes,
      }

      if (astronaut) {
        await AstronautAPI.atualizar(astronaut.id, data)
        toast({ title: "Sucesso", description: "Astronauta atualizado!" })
      } else {
        await AstronautAPI.criar(data)
        toast({ title: "Sucesso", description: "Astronauta criado!" })
      }

      onOpenChange(false)
      onSuccess?.()
      
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{astronaut ? "Editar Astronauta" : "Novo Astronauta"}</DialogTitle>
          <DialogDescription>Insira as informações do membro.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="idade">Idade</Label>
            {/* CORREÇÃO 2: Limites visuais no input */}
            <Input 
                id="idade" 
                type="number" 
                min="18" 
                max="100" 
                value={idade} 
                onChange={(e) => setIdade(e.target.value)} 
                required 
            />
          </div>
          <div className="grid gap-2">
            <Label>Aptidão</Label>
            <Select value={nivelAptidaoMedica} onValueChange={(v: any) => setNivelAptidaoMedica(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALTO">Alto</SelectItem>
                <SelectItem value="MEDIO">Médio</SelectItem>
                <SelectItem value="BAIXO">Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="missoes">Missões Realizadas</Label>
            <Input id="missoes" type="number" min="0" value={missoesRealizadas} onChange={(e) => setMissoesRealizadas(e.target.value)} />
          </div>
          <div className="grid gap-3">
             <RadioGroup value={ativo} onValueChange={setAtivo} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="true" id="active" /><Label htmlFor="active">Ativo</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="false" id="inactive" /><Label htmlFor="inactive">Inativo</Label></div>
             </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}