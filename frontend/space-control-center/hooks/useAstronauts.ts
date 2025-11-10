import useSWR from "swr"
import { AstronautAPI, type AstronautDTO } from "@/lib/api"

export function useAstronauts() {
  const { data, error, isLoading, mutate } = useSWR<AstronautDTO[]>(
    "/astronauts", // Chave SWR para o endpoint
    () => AstronautAPI.listar() // Função de fetcher
  )

  return {
    astronauts: data, // Renomeado de 'operators' para 'astronauts'
    isLoading,
    isError: error,
    mutate,
  }
}