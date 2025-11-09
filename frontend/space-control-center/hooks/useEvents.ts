import useSWR from "swr"
import { EventAPI, type EventoDTO } from "@/lib/api"

export function useEvents(missaoId: string) {
  const { data, error, isLoading, mutate } = useSWR<EventoDTO[]>(
    missaoId ? `/api/missions/${missaoId}/events` : null,
    () => EventAPI.listarPorMissao(missaoId),
    {
      refreshInterval: 2000, // Refresh every 2 seconds for real-time event feed
    },
  )

  return {
    events: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
