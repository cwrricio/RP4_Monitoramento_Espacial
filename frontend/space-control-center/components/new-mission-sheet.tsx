// space-control-center/components/new-mission-sheet.tsx
"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useAstronauts } from "@/hooks/use-astronauts" 
import { CriarMissaoRequest } from "@/lib/api" 



interface NewMissionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateMission: (data: CriarMissaoRequest) => Promise<any> // Função para criar
}

export function NewMissionSheet({ open, onOpenChange, onCreateMission }: NewMissionSheetProps) {
  const [nome, setNome] = useState("")
  const [objetivo, setObjetivo] = useState("")
  const [date, setDate] = useState<Date>()
  const [crewOpen, setCrewOpen] = useState(false)
  const [selectedCrew, setSelectedCrew] = useState<number[]>([]) 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { astronauts, loading: loadingAstronauts } = useAstronauts();


  useEffect(() => {
    if (open) {
        setNome("");
        setObjetivo("");
        setDate(undefined);
        setSelectedCrew([]);
        setErrors({});
        setIsSubmitting(false);
    }
  }, [open]);


  const toggleCrew = (astronautId: number) => {
    setSelectedCrew((prev) =>
      prev.includes(astronautId) ? prev.filter((id) => id !== astronautId) : [...prev, astronautId],
    )

     if (errors.tripulacaoIds) {
       setErrors(prev => ({...prev, tripulacaoIds: ''}));
     }
  }

  const validateForm = (): boolean => {
     const newErrors: Record<string, string> = {};
     if (!nome || nome.length < 3) newErrors.nome = "Nome inválido (mín. 3 caracteres).";
     if (!objetivo) newErrors.objetivo = "Objetivo é obrigatório.";
     if (selectedCrew.length === 0) newErrors.tripulacaoIds = "Selecione ao menos um tripulante.";

     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    const missionData: CriarMissaoRequest = {
      nome,
      objetivo,
      dataInicio: date ? format(date, "yyyy-MM-dd") : undefined, 
      tripulacaoIds: selectedCrew,
    };

    try {
      await onCreateMission(missionData);
    } catch (error) {
       console.error("Erro no submit do sheet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Criar Nova Missão</SheetTitle>
          <SheetDescription>Preencha os detalhes da missão.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Missão *</Label>
            <Input
              id="name"
              placeholder="Ex: Missão Alpha Centauri"
              value={nome}
              onChange={(e) => { setNome(e.target.value); if (errors.nome) setErrors(prev => ({...prev, nome: ''})); }}
              className={cn(errors.nome && "border-destructive")}
            />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destination">Objetivo *</Label> {/* Era destino, mas API usa objetivo */}
            <Textarea
              id="objetivo"
              placeholder="Descreva os objetivos da missão..."
              rows={4}
              value={objetivo}
              onChange={(e) => { setObjetivo(e.target.value); if (errors.objetivo) setErrors(prev => ({...prev, objetivo: ''})); }}
              className={cn(errors.objetivo && "border-destructive")}
            />
             {errors.objetivo && <p className="text-sm text-destructive">{errors.objetivo}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Data de Lançamento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("justify-start text-left font-normal bg-transparent", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          {/* Remover Select de Status, já que é sempre PLANEJADA ao criar */}
          <div className="grid gap-2">
            <Label>Tripulação *</Label>
            <Popover open={crewOpen} onOpenChange={setCrewOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={crewOpen}
                  className={cn("justify-between bg-transparent", errors.tripulacaoIds && "border-destructive")}
                >
                  {selectedCrew.length > 0
                    ? `${selectedCrew.length} astronauta(s) selecionado(s)`
                    : "Selecione a tripulação"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
               {errors.tripulacaoIds && <p className="text-sm text-destructive">{errors.tripulacaoIds}</p>}
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar astronauta..." />
                  <CommandList>
                    {loadingAstronauts && <CommandEmpty>Carregando...</CommandEmpty>}
                    {!loadingAstronauts && astronauts.length === 0 && <CommandEmpty>Nenhum astronauta encontrado.</CommandEmpty>}
                    <CommandGroup>
                      {!loadingAstronauts && astronauts.map((astronaut) => (
                        <CommandItem key={astronaut.id} onSelect={() => toggleCrew(astronaut.id)}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCrew.includes(astronaut.id) ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {astronaut.nome} ({astronaut.ativo ? 'Ativo' : 'Inativo'}, Apt: {astronaut.nivelAptidaoMedica})
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
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Salvando..." : "Salvar Missão"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}