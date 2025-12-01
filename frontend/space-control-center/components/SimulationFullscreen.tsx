"use client"

import { useState, useEffect, useRef } from "react"
import { X, Activity, Rocket, AlertTriangle, Gauge, Zap, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface Mission {
  id: string
  name: string
  destination: string
  launchDate: string
  status: string
  description: string
}

interface SimulationFullscreenProps {
  mission: Mission
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'

export function SimulationFullscreen({ mission }: SimulationFullscreenProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'running' | 'completed' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<Array<{ text: string; type: string; timestamp: string }>>([])
  const [emergencies, setEmergencies] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [currentData, setCurrentData] = useState({
    altitude: 0,
    velocity: 0,
    time: 0,
    acceleration: 0
  })
  const [maxAltitude, setMaxAltitude] = useState(0)
  const [maxVelocity, setMaxVelocity] = useState(0)
  const [executionTime, setExecutionTime] = useState(0)

  const wsRef = useRef<WebSocket | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simulationIdRef = useRef<string | null>(null)
  const latestRenderDataRef = useRef<any | null>(null)
  const displayedDataRef = useRef<any | null>(null)
  const emergencySeenRef = useRef<Set<string>>(new Set())
  const emergenciesRef = useRef<any[]>([])
  const rafRef = useRef<number | null>(null)
  const lastRafTimeRef = useRef<number | null>(null)
  const lastMetricUpdateRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)
  
  const SMOOTH_ALPHA = 0.12
  const METRIC_UPDATE_DEBOUNCE_MS = 1000

  // Conectar WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        console.log('🔌 Tentando conectar ao WebSocket:', WS_URL)
        
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('✅ WebSocket conectado com sucesso!')
          setIsConnected(true)
          setStatus('connecting')
          addLog('Conectado ao sistema de simulação', 'success')
        }

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data)
          console.log('📨 Mensagem recebida:', message)
          handleWebSocketMessage(message)
        }

        ws.onerror = (error: Event) => {
          console.error('❌ WebSocket error:', error)
          setStatus('error')
          const errorMsg = error instanceof ErrorEvent ? error.message : 'Falha na conexão WebSocket'
          addLog('Erro na conexão WebSocket: ' + errorMsg, 'error')
        }

        ws.onclose = (event) => {
          console.log('🔌 WebSocket desconectado. Code:', event.code)
          setIsConnected(false)
          addLog('Desconectado do sistema', event.code === 1000 ? 'info' : 'error')
        }
      } catch (error) {
        console.error('❌ Erro ao criar WebSocket:', error)
        setStatus('error')
        addLog('Erro ao conectar: ' + error, 'error')
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'simulation_update':
        handleSimulationUpdate(message)
        break
      case 'simulation_complete':
        handleSimulationComplete(message)
        break
      case 'emergency':
        handleEmergency(message)
        break
    }
  }

  const addLog = (text: string, type: string = 'info') => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    setLogs(prev => [...prev, { text, type, timestamp }])
  }

  const handleSimulationUpdate = (message: any) => {
    const { data } = message

    if (data.status === 'INICIANDO') {
      setStatus('running')
      addLog(`Simulação iniciada: ${data.message}`, 'info')
      startTimeRef.current = Date.now()
      setMaxAltitude(0)
      setMaxVelocity(0)
    } else if (data.status === 'EXECUTANDO') {
      const altitude = data.altitude_atual || 0
      const velocity = data.velocidade_atual || 0
      if (altitude > maxAltitude) setMaxAltitude(altitude)
      if (velocity > maxVelocity) setMaxVelocity(velocity)

      const now = Date.now()
      if (now - lastMetricUpdateRef.current >= METRIC_UPDATE_DEBOUNCE_MS) {
        setProgress(data.progresso || 0)
        setCurrentData({
          altitude: altitude,
          velocity: velocity,
          time: data.tempo_atual || 0,
          acceleration: data.aceleracao_atual || 0
        })
        lastMetricUpdateRef.current = now
      }

      latestRenderDataRef.current = data
      startAnimationLoop()
    } else if (data.status === 'ANIMACAO_CONCLUIDA') {
      addLog('Animação concluída!', 'success')
    }
  }

  const handleSimulationComplete = (message: any) => {
    const { data } = message
    if (startTimeRef.current) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      setExecutionTime(elapsed)
    }
    setStatus('completed')
    setProgress(100)
    addLog('✅ Simulação concluída com sucesso!', 'success')

    if (data) {
      latestRenderDataRef.current = data
      displayedDataRef.current = {
        altitude: data.altitude_atual || 0,
        velocity: data.velocidade_atual || 0,
        time: data.tempo_atual || 0,
        progresso: data.progresso || 0
      }
      updateCanvas(data)
    }

    stopAnimationLoop()
  }

  const handleEmergency = (message: any) => {
    const emergency = {
      type: message.emergency_type || message.type || 'EMERGENCIA',
      data: message.data || message.payload || {},
      timestamp: message.timestamp || new Date().toISOString()
    }

    const id = `${emergency.type}-${emergency.timestamp}-${JSON.stringify(emergency.data || {})}`
    if (emergencySeenRef.current.has(id)) return
    emergencySeenRef.current.add(id)

    emergenciesRef.current.push(emergency)
    setEmergencies([...emergenciesRef.current])
    addLog(`⚠️ EMERGÊNCIA: ${emergency.type}`, 'warning')
  }

  const updateCanvas = (data: any) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke()
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke()
    }

    const disp = displayedDataRef.current || {
      altitude: data.altitude_atual || 0,
      velocity: data.velocidade_atual || 0,
      time: data.tempo_atual || 0,
      progresso: data.progresso || 0
    }

    const maxTime = data.tempo_maximo || 600
    const rocketX = Math.min(width, (disp.time / maxTime) * width)
    const rocketY = height - Math.min(height, (disp.altitude / 400000) * height)

    ctx.fillStyle = '#3b82f6'
    ctx.beginPath(); ctx.arc(rocketX, rocketY, 8, 0, Math.PI * 2); ctx.fill()

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(0, height); ctx.lineTo(rocketX, rocketY); ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px monospace'
    ctx.fillText(`TELEMETRIA`, 20, 25)

    ctx.font = '11px monospace'
    ctx.fillStyle = '#3b82f6'
    ctx.fillText(`Alt: ${(disp.altitude || 0).toFixed(0)}m`, 20, 45)
    ctx.fillText(`Vel: ${(disp.velocity || 0).toFixed(0)}m/s`, 20, 60)
    ctx.fillText(`T: ${(disp.time || 0).toFixed(1)}s`, 20, 75)

    const progressHeight = (disp.progresso / 100) * height
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
    ctx.fillRect(width - 50, height - progressHeight, 40, progressHeight)
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(width - 50, height - progressHeight, 40, 4)

    const lastEmerg = emergenciesRef.current[emergenciesRef.current.length - 1]
    if (lastEmerg && /VELOCIDADE_CRITICA|FALHA_ORBITAL|TEMPERATURA_ALTA/i.test(lastEmerg.type)) {
      const now = Date.now()
      const emergTime = new Date(lastEmerg.timestamp).getTime()
      if (now - emergTime < 30_000) {
        const gradient = ctx.createRadialGradient(rocketX, rocketY, 0, rocketX, rocketY, 60)
        gradient.addColorStop(0, 'rgba(255,200,0,0.95)')
        gradient.addColorStop(0.4, 'rgba(255,80,0,0.9)')
        gradient.addColorStop(1, 'rgba(120,0,0,0.0)')
        ctx.fillStyle = gradient
        ctx.beginPath(); ctx.arc(rocketX, rocketY, 60, 0, Math.PI * 2); ctx.fill()
      }
    }
  }

  const loop = (timestamp: number) => {
    if (!lastRafTimeRef.current) lastRafTimeRef.current = timestamp
    const dt = Math.min(0.1, (timestamp - (lastRafTimeRef.current || timestamp)) / 1000)
    lastRafTimeRef.current = timestamp

    const target = latestRenderDataRef.current
    if (target) {
      let disp = displayedDataRef.current
      if (!disp) {
        disp = {
          altitude: target.altitude_atual || 0,
          velocity: target.velocidade_atual || 0,
          time: target.tempo_atual || 0,
          progresso: target.progresso || 0
        }
        displayedDataRef.current = disp
      }

      const lerpFactor = 1 - Math.pow(1 - SMOOTH_ALPHA, dt * 60)
      disp.altitude += ((target.altitude_atual || 0) - disp.altitude) * lerpFactor
      disp.velocity += ((target.velocidade_atual || 0) - disp.velocity) * lerpFactor
      disp.time += ((target.tempo_atual || 0) - disp.time) * lerpFactor
      disp.progresso += ((target.progresso || 0) - disp.progresso) * lerpFactor

      updateCanvas(target)
    }

    rafRef.current = requestAnimationFrame(loop)
  }

  const startAnimationLoop = () => {
    if (!rafRef.current) {
      lastRafTimeRef.current = null
      rafRef.current = requestAnimationFrame(loop)
    }
  }

  const stopAnimationLoop = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastRafTimeRef.current = null
    }
  }

  const startSimulation = async () => {
    if (!isConnected) {
      addLog('Aguardando conexão...', 'warning')
      return
    }

    try {
      setStatus('running')
      setProgress(0)
      setLogs([])
      setEmergencies([])
      addLog('🚀 Iniciando simulação...', 'info')

      const simulationType = mission.name.toLowerCase().includes('orbital') ? 'orbita' : 'foguete'
      const params = simulationType === 'orbita' 
        ? { altitude_inicial: 400000, tempo_maximo: 6000 }
        : { massa_inicial: 549000, massa_combustivel: 507000, empuxo: 7607000, tempo_maximo: 600 }

      const response = await fetch(`${API_BASE_URL}/simulacoes/${simulationType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: mission.name, ...params })
      })

      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`)
      const data = await response.json()
      simulationIdRef.current = data.id
      addLog(`✅ Simulação ${data.id} criada com sucesso`, 'success')
    } catch (error: any) {
      setStatus('error')
      addLog(`❌ Erro: ${error.message}`, 'error')
    }
  }

  const resetSimulation = () => {
    setStatus('idle')
    setProgress(0)
    setLogs([])
    setEmergencies([])
    setCurrentData({ altitude: 0, velocity: 0, time: 0, acceleration: 0 })
    setMaxAltitude(0)
    setMaxVelocity(0)
    setExecutionTime(0)
    simulationIdRef.current = null
    startTimeRef.current = null
    displayedDataRef.current = null
    latestRenderDataRef.current = null
    emergencySeenRef.current.clear()
    emergenciesRef.current = []
    lastMetricUpdateRef.current = 0
    stopAnimationLoop()
  }

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <Rocket className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{mission.name}</h1>
            <p className="text-xs text-zinc-400 truncate">{mission.destination}</p>
          </div>
        </div>
        <Link href="/missoes">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left: Canvas - Takes most space */}
        <div className="flex-1 flex flex-col gap-3">
          <div className="bg-black rounded-lg border border-zinc-800 overflow-hidden flex-1 relative">
            <canvas
              ref={canvasRef}
              width={1400}
              height={450}
              className="w-full h-full"
            />
            {status === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <Rocket className="w-16 h-16 text-blue-500 mx-auto mb-3" />
                  <p className="text-white text-lg font-semibold">Pronto para iniciar</p>
                </div>
              </div>
            )}
          </div>

          {/* Metrics Row */}
          {(status === 'running' || status === 'completed') && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                <p className="text-xs text-zinc-400 mb-1">Alt / Alt Máx</p>
                <p className="text-sm font-bold text-blue-500">{(currentData.altitude / 1000).toFixed(1)} / {(maxAltitude / 1000).toFixed(1)} km</p>
              </div>
              <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                <p className="text-xs text-zinc-400 mb-1">Veloc / V Máx</p>
                <p className="text-sm font-bold text-green-500">{(currentData.velocity).toFixed(0)} / {(maxVelocity).toFixed(0)} m/s</p>
              </div>
              <div className="bg-zinc-900 rounded p-2 border border-zinc-800">
                <p className="text-xs text-zinc-400 mb-1">Tempo Sim / Real</p>
                <p className="text-sm font-bold text-purple-500">{currentData.time.toFixed(1)} / {executionTime.toFixed(2)} s</p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {(status === 'running' || status === 'completed') && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-zinc-400 text-center">
                {status === 'running' ? 'Em andamento...' : 'Concluída'}
              </p>
            </div>
          )}
        </div>

        {/* Right: Info Panel */}
        <div className="w-64 flex flex-col gap-3 overflow-hidden">
          {/* Conexão */}
          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
              <Activity className="w-3 h-3" />
              Status
            </h3>
            <div className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
            </div>
          </div>

          {/* Emergências */}
          {emergencies.length > 0 && (
            <div className="bg-red-950/30 rounded-lg p-3 border border-red-900/50 flex-1 overflow-auto max-h-32">
              <h3 className="font-semibold text-red-500 mb-2 flex items-center gap-2 text-sm">
                <AlertTriangle className="w-3 h-3" />
                Alertas ({emergencies.length})
              </h3>
              <div className="space-y-1 text-xs">
                {emergencies.slice(-5).map((e, i) => (
                  <div key={i} className="text-red-300 truncate">
                    <strong>{e.type}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex-1 overflow-auto min-h-32">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
              <Activity className="w-3 h-3" />
              Log
            </h3>
            <div className="space-y-0.5 text-xs font-mono">
              {logs.slice(-10).map((log, i) => (
                <div key={i} className={log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-zinc-400'} title={log.text}>
                  {log.text.substring(0, 30)}
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {status === 'completed' && (
              <Button onClick={resetSimulation} variant="outline" className="flex-1 h-8" size="sm">
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
            <Button
              onClick={startSimulation}
              disabled={status === 'running' || !isConnected}
              className="flex-1 bg-blue-600 hover:bg-blue-700 h-8"
              size="sm"
            >
              <Play className="w-3 h-3 mr-1" />
              {status === 'running' ? 'Executando...' : status === 'completed' ? 'Exec Novamente' : 'Executar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
