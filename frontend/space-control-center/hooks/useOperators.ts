import useSWR from "swr"
import { OperatorAPI, type OperadorDeMissaoDTO } from "@/lib/api"

export function useOperators() {
  const { data, error, isLoading, mutate } = useSWR<OperadorDeMissaoDTO[]>("/operadores", () => OperatorAPI.listar())

  return {
    operators: data,
    isLoading,
    isError: error,
    mutate,
  }
}
