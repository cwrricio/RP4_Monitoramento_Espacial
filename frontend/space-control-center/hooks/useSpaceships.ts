import useSWR from "swr"
import { SpaceshipAPI, type EspaconaveDTO } from "@/lib/api"

export function useSpaceships() {
  const { data, error, isLoading, mutate } = useSWR<EspaconaveDTO[]>("/espaconaves", () => SpaceshipAPI.listar())

  return {
    spaceships: data,
    isLoading,
    isError: error,
    mutate,
  }
}
