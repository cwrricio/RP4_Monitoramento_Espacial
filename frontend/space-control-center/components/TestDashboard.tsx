"use client"

import { useState } from "react"

export default function TestDashboard() { // Mude para export default
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")

  const iniciarSimulacao = () => {
    setLoading(true)
    setResult("")
    
    setTimeout(() => {
      setResult("Simulação iniciada com sucesso!")
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Teste Dashboard - FUNCIONANDO</h1>
      
      <div className="border p-4 rounded-lg mb-4 max-w-md">
        <h2 className="text-xl font-bold">Missão Teste Marte</h2>
        <p className="text-gray-600">Destino: Marte</p>
        <p className="text-sm mt-2">Missão de teste sem enums problemáticos</p>
        
        <button
          onClick={iniciarSimulacao}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded mt-2 disabled:bg-gray-400"
        >
          {loading ? "Iniciando..." : "Iniciar Simulação"}
        </button>
        
        {result && (
          <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
            {result}
          </div>
        )}
      </div>
    </div>
  )
}