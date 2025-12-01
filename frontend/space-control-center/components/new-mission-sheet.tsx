"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Check, ChevronsUpDown, Rocket } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { 
  MissionAPI, 
  AstronautAPI, 
  SpaceshipAPI, // <--- IMPORTADO
  type CriarMissaoRequest, 
  type AstronautDTO, 
  type MissaoDTO,
  type EspaconaveDTO // <--- IMPORTADO
} from "@/lib/api"
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
  
  // Estados da Tripulação
  const [crewOpen, setCrewOpen] = useState(false)
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]) 
  const [astronauts, setAstronauts] = useState<AstronautDTO[]>([])

  // Estados da Espaçonave (NOVO)
  const [selectedSpaceship, setSelectedSpaceship] = useState<string>("")
  const [spaceships, setSpaceships] = useState<EspaconaveDTO[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Carrega Astronautas e Espaçonaves ao abrir
  useEffect(() => {
    if (open) {
      AstronautAPI.listar()
        .then(setAstronauts)
        .catch(() => console.error("Erro ao carregar astronautas"))
      
      // Carrega as naves para o Select
      SpaceshipAPI.listar()
        .then(setSpaceships)
        .catch(() => console.error("Erro ao carregar espaçonaves"))
    }
  }, [open])

  // Lógica de Edição (Popula o form)
  useEffect(() => {
    if (mission && open) {
        setNome(mission.nome)
        setObjetivo(mission.objetivo)
        if (mission.dataInicio) {
            const [ano, mes, dia] = mission.dataInicio.split('-').map(Number);
            setDataInicio(new Date(ano, mes - 1, dia)); 
        }
        if (mission.tripulacao) {
            setSelectedCrew(mission.tripulacao.map(a => a.id.toString()))
        }
        // Se o DTO da missão trouxer a espaçonave (depende do seu backend mapper), preenche aqui
        // Assumindo que mission possa ter uma propriedade 'espaconave' ou similar no futuro
        // Por enquanto, deixamos em branco ou tentamos ler de uma propriedade dinâmica se existir
        if ((mission as any).espaconave?.id) {
            setSelectedSpaceship((mission as any).espaconave.id.toString())
        }
    } else if (!mission && open) {
        setNome("")
        setObjetivo("")
        setDataInicio(undefined)
        setSelectedCrew([])
        setSelectedSpaceship("") // Limpa nave
    }
  }, [mission, open])

  const toggleCrew = (astronautId: string) => {
    setSelectedCrew((prev) =>
      prev.includes(astronautId) ? prev.filter((id) => id !== astronautId) : [...prev, astronautId],
    )
  }

  const handleSubmit = async () => {
    // Validação
    if (!nome || !objetivo || !dataInicio) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" })
      return
    }

    if (!selectedSpaceship) {
        toast({ title: "Falta Espaçonave", description: "Selecione uma espaçonave para a missão.", variant: "destructive" })
        return
    }

    setIsSubmitting(true)
    try {
      const dataFormatada = format(dataInicio, "yyyy-MM-dd")
      const tripulacaoNumerica = selectedCrew.map((id) => Number(id))

      // Payload com espaçonave
      const payload = {
        nome,
        objetivo,
        dataInicio: dataFormatada,
        tripulacaoIds: tripulacaoNumerica,
        espaconaveId: Number(selectedSpaceship) // <--- ENVIO DO ID
      }

      if (mission) {
         await MissionAPI.atualizar(mission.id, payload)
         toast({ title: "Sucesso", description: "Missão atualizada!" })
      } else {
         // @ts-ignore
         await MissionAPI.criar(payload)
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
      {/* CORREÇÃO VISUAL 1: Aumentei para 640px e removi padding padrão para controlar manualmente */}
      <SheetContent className="sm:max-w-[640px] w-full p-0 overflow-y-auto">
        
        {/* Header com Padding */}
        <SheetHeader className="px-6 py-6 border-b border-border">
          <SheetTitle>{mission ? "Editar Missão" : "Criar Nova Missão"}</SheetTitle>
          <SheetDescription>Preencha os detalhes da missão.</SheetDescription>
        </SheetHeader>

        {/* CORREÇÃO VISUAL 2: Padding interno (px-6) no container do form */}
        <div className="grid gap-6 px-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome da Missão</Label>
            <Input data-testid="input-mission-name" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Missão Marte I" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="objetivo">Objetivo</Label>
            <Input data-testid="input-mission-objective" id="objetivo" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} placeholder="Ex: Estabelecer base avançada" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label>Data de Início</Label>
                <Popover>
                <PopoverTrigger asChild>
                    <Button data-testid="btn-calendar-trigger" variant="outline" className={cn("justify-start text-left font-normal w-full", !dataInicio && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecione"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dataInicio} onSelect={setDataInicio} initialFocus />
                </PopoverContent>
                </Popover>
            </div>

            {/* CAMPO DE ESPAÇONAVE ADICIONADO */}
            <div className="grid gap-2">
                <Label>Espaçonave</Label>
                <Select value={selectedSpaceship} onValueChange={setSelectedSpaceship}>
                    <SelectTrigger data-testid="select-mission-spaceship" className="w-full">
                        <SelectValue placeholder="Selecione a nave" />
                    </SelectTrigger>
                    <SelectContent>
                        {spaceships.map((ship) => (
                            <SelectItem 
                                key={ship.id} 
                                value={ship.id.toString()}
                                disabled={ship.statusOperacional !== "OPERACIONAL"}
                                data-testid={`option-spaceship-${ship.id}`}
                            >
                                <span className="flex items-center gap-2">
                                    <Rocket className="h-4 w-4" />
                                    {ship.nome}
                                    {ship.statusOperacional !== "OPERACIONAL" && " (Indisp.)"}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tripulação ({selectedCrew.length} selecionados)</Label>
            <Popover open={crewOpen} onOpenChange={setCrewOpen}>
              <PopoverTrigger asChild>
                <Button data-testid="btn-crew-combobox" variant="outline" role="combobox" aria-expanded={crewOpen} className="justify-between bg-transparent w-full">
                  {selectedCrew.length > 0 ? `${selectedCrew.length} astronauta(s)` : "Selecionar Tripulação"}
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
                        <CommandItem key={astronaut.id} onSelect={() => toggleCrew(astronaut.id.toString())}>
                          <Check className={cn("mr-2 h-4 w-4", selectedCrew.includes(astronaut.id.toString()) ? "opacity-100" : "opacity-0")} />
                          <div className="flex flex-col">
                             <span>{astronaut.nome}</span>
                             <span className="text-xs text-muted-foreground">{astronaut.nivelAptidaoMedica} • {astronaut.ativo ? "Ativo" : "Inativo"}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Footer com Padding */}
        <SheetFooter className="px-6 py-4 border-t border-border mt-auto">
          <Button data-testid="btn-save-mission" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}