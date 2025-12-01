import { SimulationFullscreen } from "@/components/SimulationFullscreen"
import { Suspense } from "react"

async function getMissionDetails(id: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  try {
    const response = await fetch(`${API_URL}/missoes/${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erro ao buscar missão:', error)
    return null
  }
}

export default async function SimulationPage({
  params,
  searchParams
}: {
  params: { id: string }
  searchParams: Record<string, string>
}) {
  // Dados padrão - em produção estes viriam de uma API
  const mission = {
    id: params.id,
    name: searchParams.name || 'Simulação de Voo',
    destination: searchParams.destination || 'Órbita Terrestre',
    launchDate: searchParams.date || new Date().toLocaleDateString('pt-BR'),
    status: 'simulation',
    description: searchParams.description || 'Simulação de voo espacial em tempo real'
  }

  return (
    <Suspense fallback={<div className="w-screen h-screen bg-zinc-950 flex items-center justify-center"><p className="text-white">Carregando...</p></div>}>
      <SimulationFullscreen mission={mission} />
    </Suspense>
  )
}
