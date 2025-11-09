import useSWR from "swr"
import { MissionAPI, type MissaoDTO } from "@/lib/api"

export function useMissions() {
  const { data, error, isLoading, mutate } = useSWR<MissaoDTO[]>("/api/missions", () => MissionAPI.listar(), {
    refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
  })

  return {
    missions: data,
    isLoading,
    isError: error,
    mutate,
  }
}

export function useMission(id: string) {
  const { data, error, isLoading, mutate } = useSWR<MissaoDTO>(
    id ? `/api/missions/${id}` : null,
    () => MissionAPI.buscarPorId(id),
    {
      refreshInterval: 3000, // Refresh every 3 seconds for real-time mission data
    },
  )

  return {
    mission: data,
    isLoading,
    isError: error,
    mutate,
  }
}
