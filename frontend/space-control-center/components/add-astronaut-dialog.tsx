"use client"

import { useState, useEffect } from "react"
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
import { AtualizaAstronautaRequest, AstronautaDTO } from "@/lib/api" // Importar tipos
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddAstronautDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: AtualizaAstronautaRequest) => Promise<any>
  astronautData?: AstronautaDTO | null; // Dados para edição
  isEditMode?: boolean;
}

export function AddAstronautDialog({
   open,
   onOpenChange,
   onSubmit,
   astronautData = null, // Valor padrão
   isEditMode = false
}: AddAstronautDialogProps) {
  const [formData, setFormData] = useState<Partial<AtualizaAstronautaRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializa ou reseta o formulário
  useEffect(() => {
    if (open) {
      setFormData({
        nome: astronautData?.nome ?? "",
        idade: astronautData?.idade ?? undefined,
        ativo: astronautData?.ativo ?? true,
        nivelAptidaoMedica: astronautData?.nivelAptidaoMedica ?? "MEDIO", // Default razoável
        missoesRealizadas: astronautData?.missoesRealizadas ?? 0,
        // Campos de biometria podem ser adicionados aqui se necessário
      });
       setErrors({});
       setIsSubmitting(false);
    }
  }, [open, astronautData]);

  const handleInputChange = (field: keyof AtualizaAstronautaRequest, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
     if (errors[field]) {
       setErrors(prev => ({...prev, [field]: ''}));
     }
  }

  const validateForm = (): boolean => {
     const newErrors: Record<string, string> = {};
     if (!formData.nome || formData.nome.length < 2) newErrors.nome = "Nome inválido (mín. 2 caracteres).";
     if (formData.idade === undefined || formData.idade < 18 || formData.idade > 100) newErrors.idade = "Idade inválida (18-100).";
     if (!formData.nivelAptidaoMedica) newErrors.nivelAptidaoMedica = "Nível de aptidão é obrigatório.";
     if (formData.missoesRealizadas === undefined || formData.missoesRealizadas < 0) newErrors.missoesRealizadas = "Número de missões inválido.";

     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Garante que todos os campos não opcionais da API estão presentes
      const payload: AtualizaAstronautaRequest = {
        nome: formData.nome!,
        idade: Number(formData.idade!),
        ativo: formData.ativo!,
        nivelAptidaoMedica: formData.nivelAptidaoMedica!,
        missoesRealizadas: Number(formData.missoesRealizadas!),
        // Adicione campos de biometria se foram incluídos no formulário
      };
      await onSubmit(payload);
      // Fechar o dialog é responsabilidade do componente pai após o sucesso
    } catch (error) {
       console.error("Erro no submit do dialog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Astronauta" : "Adicionar Novo Astronauta"}</DialogTitle>
          <DialogDescription>
             {isEditMode ? "Atualize as informações do membro." : "Insira as informações do novo membro."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="fullname">Nome Completo *</Label>
            <Input
              id="fullname"
              placeholder="Ex: Dra. Elena Petrova"
              value={formData.nome || ""}
              onChange={(e) => handleInputChange("nome", e.target.value)}
              className={cn(errors.nome && "border-destructive")}
            />
             {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
          </div>
           <div className="grid gap-2">
            <Label htmlFor="idade">Idade *</Label>
            <Input
              id="idade"
              type="number"
              placeholder="Ex: 35"
              value={formData.idade ?? ""}
              onChange={(e) => handleInputChange("idade", Number(e.target.value))}
               className={cn(errors.idade && "border-destructive")}
            />
             {errors.idade && <p className="text-sm text-destructive">{errors.idade}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="aptidao">Nível Aptidão Médica *</Label>
            <Select
               value={formData.nivelAptidaoMedica || ""}
               onValueChange={(value: string) => handleInputChange("nivelAptidaoMedica", value)}
            >
              <SelectTrigger id="aptidao" className={cn(errors.nivelAptidaoMedica && "border-destructive")}>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALTO">Alto</SelectItem>
                <SelectItem value="MEDIO">Médio</SelectItem>
                <SelectItem value="BAIXO">Baixo</SelectItem>
                 {/* Adicione outros níveis se existirem no backend */}
              </SelectContent>
            </Select>
             {errors.nivelAptidaoMedica && <p className="text-sm text-destructive">{errors.nivelAptidaoMedica}</p>}
          </div>
           <div className="grid gap-2">
            <Label htmlFor="missoes">Missões Realizadas *</Label>
            <Input
              id="missoes"
              type="number"
              min="0"
              placeholder="Ex: 5"
              value={formData.missoesRealizadas ?? ""}
              onChange={(e) => handleInputChange("missoesRealizadas", Number(e.target.value))}
               className={cn(errors.missoesRealizadas && "border-destructive")}
            />
             {errors.missoesRealizadas && <p className="text-sm text-destructive">{errors.missoesRealizadas}</p>}
          </div>
          <div className="grid gap-3">
            <Label>Status *</Label>
            <RadioGroup
              value={formData.ativo ? "active" : "inactive"}
              onValueChange={(value: String) => handleInputChange("ativo", value === "active")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="active" id="active" />
                <Label htmlFor="active" className="font-normal cursor-pointer"> Ativo </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inactive" id="inactive" />
                <Label htmlFor="inactive" className="font-normal cursor-pointer"> Inativo </Label>
              </div>
            </RadioGroup>
          </div>
          {/* Adicionar campos de Biometria aqui se necessário */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {isSubmitting ? "Salvando..." : (isEditMode ? "Salvar Alterações" : "Adicionar Astronauta")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}