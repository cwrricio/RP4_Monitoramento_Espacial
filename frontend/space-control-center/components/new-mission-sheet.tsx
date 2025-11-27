"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { MissionAPI, AstronautAPI, type CriarMissaoRequest, type AstronautDTO, type MissaoDTO } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface NewMissionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  mission?: MissaoDTO | null 
}

export function NewMissionSheet({ open, onOpenChange, onSuccess, mission }: NewMissionSheetProps) {
  const [nome, setNome] = useState("")
  const [objetivo, setObjetivo] = useState("")
  const [dataInicio, setDataInicio] = useState<Date>()
  const [crewOpen, setCrewOpen] = useState(false)
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]) 
  const [astronauts, setAstronauts] = useState<AstronautDTO[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      AstronautAPI.listar().then(setAstronauts).catch(() => console.error("Erro ao carregar astronautas"))
    }
  }, [open])

  useEffect(() => {
    if (mission && open) {
        setNome(mission.nome)
        setObjetivo(mission.objetivo)
        if (mission.dataInicio) {
            const [ano, mes, dia] = mission.dataInicio.split('-').map(Number);
            setDataInicio(new Date(ano, mes - 1, dia)); 
        }
        if (mission.tripulacao) {
            // Garante que os IDs sejam strings ao carregar
            setSelectedCrew(mission.tripulacao.map(a => a.id.toString()))
        }
    } else if (!mission && open) {
        setNome("")
        setObjetivo("")
        setDataInicio(undefined)
        setSelectedCrew([])
    }
  }, [mission, open])

  const toggleCrew = (astronautId: string) => {
    setSelectedCrew((prev) =>
      prev.includes(astronautId) ? prev.filter((id) => id !== astronautId) : [...prev, astronautId],
    )
  }

  const handleSubmit = async () => {
    if (!nome || !objetivo || !dataInicio) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const dataFormatada = format(dataInicio, "yyyy-MM-dd")
      const tripulacaoNumerica = selectedCrew.map((id) => Number(id))

      const payload = {
        nome,
        objetivo,
        dataInicio: dataFormatada,
        tripulacaoIds: tripulacaoNumerica,
      }

      if (mission) {
         await MissionAPI.atualizar(mission.id, payload)
         toast({ title: "Sucesso", description: "Missão atualizada!" })
      } else {
         await MissionAPI.criar(payload as CriarMissaoRequest)
         toast({ title: "Sucesso", description: "Missão criada!" })
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Falha ao salvar missão.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{mission ? "Editar Missão" : "Criar Nova Missão"}</SheetTitle>
          <SheetDescription>Preencha os detalhes da missão.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome da Missão</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="objetivo">Objetivo</Label>
            <Input id="objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !dataInicio && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dataInicio} onSelect={setDataInicio} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label>Tripulação</Label>
            <Popover open={crewOpen} onOpenChange={setCrewOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={crewOpen} className="justify-between bg-transparent">
                  {selectedCrew.length > 0 ? `${selectedCrew.length} selecionado(s)` : "Selecione a tripulação"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar astronauta..." />
                  <CommandList>
                    <CommandEmpty>Nenhum astronauta encontrado.</CommandEmpty>
                    <CommandGroup>
                      {astronauts.map((astronaut) => (
                        // CORREÇÃO 3: Forçamos .toString() para garantir que comparamos String com String
                        <CommandItem key={astronaut.id} onSelect={() => toggleCrew(astronaut.id.toString())}>
                          <Check className={cn("mr-2 h-4 w-4", selectedCrew.includes(astronaut.id.toString()) ? "opacity-100" : "opacity-0")} />
                          {astronaut.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}