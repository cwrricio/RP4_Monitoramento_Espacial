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
import { MissionAPI, AstronautAPI, type CriarMissaoRequest, type AstronautDTO } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface NewMissionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function NewMissionSheet({ open, onOpenChange, onSuccess }: NewMissionSheetProps) {
  const [nome, setNome] = useState("")
  const [objetivo, setObjetivo] = useState("")
  const [dataInicio, setDataInicio] = useState<Date>()
  const [crewOpen, setCrewOpen] = useState(false)
  const [selectedCrew, setSelectedCrew] = useState<string[]>([])
  const [astronauts, setAstronauts] = useState<AstronautDTO[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Fetch astronauts when sheet opens
  useEffect(() => {
    if (open) {
      AstronautAPI.listar()
        .then(setAstronauts)
        .catch(() => {
          toast({
            title: "Erro",
            description: "Falha ao carregar astronautas.",
            variant: "destructive",
          })
        })
    }
  }, [open, toast])

  const toggleCrew = (astronautId: string) => {
    setSelectedCrew((prev) =>
      prev.includes(astronautId) ? prev.filter((id) => id !== astronautId) : [...prev, astronautId],
    )
  }

  const handleSubmit = async () => {
    if (!nome || !objetivo || !dataInicio) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const data: CriarMissaoRequest = {
        nome,
        objetivo,
        dataInicio: dataInicio.toISOString(),
        tripulacaoIds: selectedCrew,
      }

      await MissionAPI.criar(data)

      toast({
        title: "Sucesso",
        description: "Missão criada com sucesso!",
      })

      onOpenChange(false)
      onSuccess?.()

      // Reset form
      setNome("")
      setObjetivo("")
      setDataInicio(undefined)
      setSelectedCrew([])
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar missão. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Criar Nova Missão</SheetTitle>
          <SheetDescription>Preencha os detalhes da missão.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome da Missão</Label>
            <Input
              id="nome"
              placeholder="Ex: Missão Alpha Centauri"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="objetivo">Objetivo</Label>
            <Input
              id="objetivo"
              placeholder="Ex: Explorar Proxima Centauri b"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal", !dataInicio && "text-muted-foreground")}
                >
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
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={crewOpen}
                  className="justify-between bg-transparent"
                >
                  {selectedCrew.length > 0
                    ? `${selectedCrew.length} astronauta(s) selecionado(s)`
                    : "Selecione a tripulação"}
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
                        <CommandItem key={astronaut.id} onSelect={() => toggleCrew(astronaut.id)}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCrew.includes(astronaut.id) ? "opacity-100" : "opacity-0",
                            )}
                          />
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Missão"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
