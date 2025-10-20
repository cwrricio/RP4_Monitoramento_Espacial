"use client"

import { useState, useEffect } from "react"
import { missionAPI, type MissaoDTO, type CriarMissaoRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function useMissions() {
  const [missions, setMissions] = useState<MissaoDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchMissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await missionAPI.listarMissoes()
      setMissions(data)
    } catch (err) {
      const errorMessage = "Erro ao carregar missões"
      setError(errorMessage)
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createMission = async (missionData: CriarMissaoRequest): Promise<MissaoDTO | null> => {
    try {
      const newMission = await missionAPI.criarMissao(missionData)
      setMissions((prev) => [...prev, newMission])
      toast({
        title: "Missão criada com sucesso!",
        description: `A missão "${newMission.nome}" foi criada e está pronta para ser iniciada.`,
      })
      return newMission
    } catch (err) {
      toast({
        title: "Erro ao criar missão",
        description: "Ocorreu um erro ao criar a missão. Tente novamente.",
        variant: "destructive",
      })
      return null
    }
  }

  const deleteMission = async (id: number): Promise<boolean> => {
    try {
      await missionAPI.deletarMissao(id)
      setMissions((prev) => prev.filter((mission) => mission.id !== id))
      toast({
        title: "Missão excluída",
        description: "A missão foi excluída com sucesso.",
      })
      return true
    } catch (err) {
      toast({
        title: "Erro ao excluir missão",
        description: "Ocorreu um erro ao excluir a missão. Tente novamente.",
        variant: "destructive",
      })
      return false
    }
  }

  const startSimulation = async (id: number): Promise<boolean> => {
    try {
      const updatedMission = await missionAPI.iniciarSimulacao(id)
      setMissions((prev) => prev.map((mission) => (mission.id === id ? updatedMission : mission)))
      toast({
        title: "Simulação iniciada!",
        description: `A missão "${updatedMission.nome}" está agora em andamento.`,
      })
      return true
    } catch (err) {
      toast({
        title: "Erro ao iniciar simulação",
        description: "Ocorreu um erro ao iniciar a simulação. Tente novamente.",
        variant: "destructive",
      })
      return false
    }
  }

  const getMissionById = (id: number): MissaoDTO | undefined => {
    return missions.find((mission) => mission.id === id)
  }

  useEffect(() => {
    fetchMissions()
  }, [])

  return {
    missions,
    loading,
    error,
    fetchMissions,
    createMission,
    deleteMission,
    startSimulation,
    getMissionById,
  }
}
