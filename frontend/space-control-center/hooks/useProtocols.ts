import useSWR from "swr"
import { ProtocolAPI, type ProtocoloEmergencialDTO } from "@/lib/api"

export function useProtocols(missaoId: string) {
  const { data, error, isLoading, mutate } = useSWR<ProtocoloEmergencialDTO[]>(
    missaoId ? `/api/missions/${missaoId}/protocols` : null,
    () => ProtocolAPI.listarPorMissao(missaoId),
    {
      refreshInterval: 3000, // Refresh every 3 seconds
    },
  )

  return {
    protocols: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
