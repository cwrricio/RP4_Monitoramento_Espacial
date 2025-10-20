"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, X } from "lucide-react"
import type { CriarMissaoRequest } from "@/lib/api"

interface MissionFormProps {
  onCancel: () => void
  onSuccess: (missionData: CriarMissaoRequest) => void
}

// Mock astronaut data
const astronautas = [
  { id: 1, nome: "Ana Silva" },
  { id: 2, nome: "Carlos Santos" },
  { id: 3, nome: "Maria Oliveira" },
  { id: 4, nome: "João Costa" },
  { id: 5, nome: "Lucia Ferreira" },
  { id: 6, nome: "Pedro Almeida" },
  { id: 7, nome: "Sofia Rodrigues" },
  { id: 8, nome: "Miguel Torres" },
  { id: 9, nome: "Isabel Martins" },
  { id: 10, nome: "Rafael Pereira" },
]

export function MissionForm({ onCancel, onSuccess }: MissionFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CriarMissaoRequest>({
    nome: "",
    objetivo: "",
    dataInicio: "",
    tripulacaoIds: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome || formData.nome.length < 3) {
      newErrors.nome = "Nome deve ter pelo menos 3 caracteres"
    }
    if (formData.nome.length > 100) {
      newErrors.nome = "Nome deve ter no máximo 100 caracteres"
    }

    if (!formData.objetivo) {
      newErrors.objetivo = "Objetivo é obrigatório"
    }
    if (formData.objetivo.length > 500) {
      newErrors.objetivo = "Objetivo deve ter no máximo 500 caracteres"
    }

    if (formData.tripulacaoIds.length === 0) {
      newErrors.tripulacao = "Selecione pelo menos um tripulante"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await onSuccess(formData)
    } finally {
      setLoading(false)
    }
  }

  const handleCrewSelection = (astronautId: number) => {
    setFormData((prev) => ({
      ...prev,
      tripulacaoIds: prev.tripulacaoIds.includes(astronautId)
        ? prev.tripulacaoIds.filter((id) => id !== astronautId)
        : [...prev.tripulacaoIds, astronautId],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onCancel} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>

          <h1 className="text-4xl font-bold text-foreground mb-2 font-[var(--font-playfair)]">Nova Missão Espacial</h1>
          <p className="text-muted-foreground text-lg">Preencha os detalhes para criar uma nova missão</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Missão</CardTitle>
              <CardDescription>Defina os parâmetros básicos da sua missão espacial</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome da Missão */}
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Missão *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Missão Alfa Centauri"
                    className={errors.nome ? "border-destructive" : ""}
                  />
                  {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                  <p className="text-xs text-muted-foreground">{formData.nome.length}/100 caracteres</p>
                </div>

                {/* Objetivo */}
                <div className="space-y-2">
                  <Label htmlFor="objetivo">Objetivo da Missão *</Label>
                  <Textarea
                    id="objetivo"
                    value={formData.objetivo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, objetivo: e.target.value }))}
                    placeholder="Descreva o objetivo principal desta missão..."
                    rows={4}
                    className={errors.objetivo ? "border-destructive" : ""}
                  />
                  {errors.objetivo && <p className="text-sm text-destructive">{errors.objetivo}</p>}
                  <p className="text-xs text-muted-foreground">{formData.objetivo.length}/500 caracteres</p>
                </div>

                {/* Data de Início */}
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data de Início (Opcional)</Label>
                  <Input
                    id="dataInicio"
                    type="date"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dataInicio: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-xs text-muted-foreground">Se não especificada, será definida como hoje</p>
                </div>

                {/* Seleção de Tripulação */}
                <div className="space-y-4">
                  <div>
                    <Label>Tripulação *</Label>
                    <p className="text-sm text-muted-foreground">
                      Selecione os astronautas que participarão desta missão
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {astronautas.map((astronauta) => (
                      <div
                        key={astronauta.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.tripulacaoIds.includes(astronauta.id)
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        }`}
                        onClick={() => handleCrewSelection(astronauta.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              formData.tripulacaoIds.includes(astronauta.id)
                                ? "border-accent bg-accent"
                                : "border-muted-foreground"
                            }`}
                          >
                            {formData.tripulacaoIds.includes(astronauta.id) && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{astronauta.nome}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errors.tripulacao && <p className="text-sm text-destructive">{errors.tripulacao}</p>}

                  <p className="text-xs text-muted-foreground">
                    {formData.tripulacaoIds.length} astronauta(s) selecionado(s)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                  <Button type="submit" disabled={loading} className="bg-accent hover:bg-accent/90 flex-1">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Criando Missão...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Criar Missão
                      </>
                    )}
                  </Button>

                  <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
