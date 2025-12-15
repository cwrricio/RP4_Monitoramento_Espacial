"use client"

import { useState, useEffect, useRef } from "react"
import { Activity, Rocket, AlertTriangle, Gauge, Zap, Play, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface Mission {
  id: string
  name: string
  destination: string
  launchDate: string
  status: string
  description: string
  tipoSimulacao?: string
}

interface SimulationFullscreenProps {
  mission: Mission
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
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
  const simulationTypeRef = useRef<string>('foguete')
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

  // Conectar WebSocket com fallback para polling
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null
    
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
          // Parar polling se WebSocket conectar
          if (pollInterval) clearInterval(pollInterval)
        }

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            console.log('📨 Mensagem recebida:', message)
            handleWebSocketMessage(message)
          } catch (e) {
            console.error('Erro ao parsear mensagem WebSocket:', e)
          }
        }

        ws.onerror = (error: Event) => {
          console.warn('⚠️ WebSocket não disponível, usando HTTP polling', error)
          addLog('Usando modo polling...', 'info')
          // Começa polling se WebSocket falhar
          startPolling()
        }

        ws.onclose = (event) => {
          console.log('🔌 WebSocket desconectado. Code:', event.code)
          setIsConnected(false)
          if (event.code !== 1000) {
            addLog('WebSocket desconectado, usando polling...', 'warning')
            startPolling()
          }
        }
      } catch (error) {
        console.error('❌ Erro ao criar WebSocket:', error)
        console.log('Usando HTTP polling como fallback...')
        startPolling()
      }
    }

    const startPolling = () => {
      // Não conectado via WebSocket, mas marca como pronto para simulação
      setIsConnected(true)
      addLog('Modo polling ativado', 'info')
      if (pollInterval) clearInterval(pollInterval)
    }

    connectWebSocket()

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [])

  const handleWebSocketMessage = (message: any) => {
    console.log('📨 Processando mensagem WebSocket:', message.type, message)
    switch (message.type) {
      case 'simulation_update':
        console.log('📊 Atualização de simulação recebida')
        handleSimulationUpdate(message)
        break
      case 'simulation_complete':
        console.log('✅ Simulação completa')
        handleSimulationComplete(message)
        break
      case 'emergency':
        console.log('⚠️ Emergência detectada')
        handleEmergency(message)
        break
      default:
        console.warn('❓ Tipo de mensagem desconhecido:', message.type)
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
    } else if (data.status === 'EXECUTANDO' || data.status === 'CONCLUIDA') {
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

    // Fundo com gradiente
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
    bgGradient.addColorStop(0, '#001a33')
    bgGradient.addColorStop(1, '#0a0a0a')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, width, height)

    // Grid de fundo
    ctx.strokeStyle = '#1a1a2e'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 100) {
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
    const progress = disp.progresso / 100
    
    let rocketX, rocketY
    const simulationType = simulationTypeRef.current

    // Animações diferentes por tipo
    if (simulationType === 'orbita') {
      // Órbita: trajetória circular com altitudes progressivas
      const centerX = width * 0.5
      const centerY = height * 0.4
      const radiusBase = Math.min(width, height) * 0.25
      
      // Raio aumenta com o progresso (órbita maior)
      const radius = radiusBase + (progress * radiusBase * 0.3)
      const angle = progress * Math.PI * 4 // 2 voltas
      
      rocketX = centerX + Math.cos(angle) * radius
      rocketY = centerY + Math.sin(angle) * radius

      // Desenhar órbita esperada em fases
      for (let phase = 0; phase < 2; phase++) {
        const phaseRadius = radiusBase + (phase * 0.5) * radiusBase * 0.3
        ctx.strokeStyle = phase === 0 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, phaseRadius, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Desenhar traço da órbita completada
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, angle)
      ctx.stroke()

      // Planeta/Terra no centro (maior)
      const planetGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40)
      planetGradient.addColorStop(0, '#3b82f6')
      planetGradient.addColorStop(0.7, '#1e40af')
      planetGradient.addColorStop(1, '#0c2340')
      ctx.fillStyle = planetGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, 35, 0, Math.PI * 2)
      ctx.fill()

      // Animação de rotação do planeta
      ctx.strokeStyle = 'rgba(93, 177, 255, 0.3)'
      ctx.lineWidth = 1
      for (let i = 0; i < 3; i++) {
        const lineAngle = (progress * 2 + i * Math.PI / 3) % (Math.PI * 2)
        const startX = centerX + Math.cos(lineAngle) * 30
        const startY = centerY + Math.sin(lineAngle) * 30
        const endX = centerX + Math.cos(lineAngle) * 36
        const endY = centerY + Math.sin(lineAngle) * 36
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
      }
    } else if (simulationType === 'reentrada') {
      // Reentrada: trajetória em espiral descendente com queimação intensa
      const startX = width * 0.15
      const startY = height * 0.15
      const endX = width * 0.85
      const endY = height * 0.85
      
      // Espiral descendente
      const spirals = 3
      const spiralProgress = (progress * spirals) % 1
      const currentSpiral = Math.floor(progress * spirals)
      
      rocketX = startX + (endX - startX) * progress
      
      // Movimento sinusoidal (espiral)
      const sideMovement = Math.sin(progress * spirals * Math.PI) * (height * 0.15)
      rocketY = startY + (endY - startY) * progress + sideMovement

      // Desenhar trajetória esperada em vermelho (reentrada)
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      for (let i = 0; i <= progress; i += 0.02) {
        const x = startX + (endX - startX) * i
        const side = Math.sin(i * spirals * Math.PI) * (height * 0.15)
        const y = startY + (endY - startY) * i + side
        ctx.lineTo(x, y)
      }
      ctx.stroke()

      // Trilho de plasma/queimação (muito mais visível)
      const trailLength = Math.min(progress * 200, 100)
      for (let i = 0; i < trailLength; i += 5) {
        const t = (progress - i / trailLength / 2) % 1
        if (t < 0) continue
        
        const trailX = startX + (endX - startX) * t
        const trailSide = Math.sin(t * spirals * Math.PI) * (height * 0.15)
        const trailY = startY + (endY - startY) * t + trailSide
        
        const opacity = (1 - i / trailLength) * 0.8
        ctx.fillStyle = `rgba(255, ${150 - i}, 0, ${opacity})`
        ctx.beginPath()
        ctx.arc(trailX, trailY, 8 - i / 20, 0, Math.PI * 2)
        ctx.fill()
      }

      // Efeito de queimação massivo ao redor do foguete
      const heatIntensity = 0.3 + progress * 0.7 // Aumenta com o progresso
      for (let ring = 0; ring < 3; ring++) {
        const ringSize = 40 + ring * 20
        const ringOpacity = heatIntensity * (1 - ring * 0.2)
        ctx.fillStyle = `rgba(255, ${120 - ring * 30}, 0, ${ringOpacity * 0.3})`
        ctx.beginPath()
        ctx.arc(rocketX, rocketY, ringSize, 0, Math.PI * 2)
        ctx.fill()
      }
    } else {
      // Foguete: trajetória vertical com decolagem realista
      rocketX = width * 0.5
      rocketY = height * (1 - progress)

      // Desenhar plataforma de lançamento no início
      if (progress < 0.1) {
        ctx.strokeStyle = '#888888'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(width * 0.45, height - 10)
        ctx.lineTo(width * 0.55, height - 10)
        ctx.stroke()
      }

      // Desenhar caminho do foguete
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(rocketX, height)
      ctx.lineTo(rocketX, rocketY)
      ctx.stroke()

      // Fumaça/esteira do foguete
      for (let i = 0; i < 5; i++) {
        const smokeProgress = (progress + i * 0.05) % 1
        const smokeX = rocketX + (Math.random() - 0.5) * 20
        const smokeY = height * (1 - smokeProgress)
        const smokeSize = (1 - smokeProgress) * 15
        ctx.fillStyle = `rgba(200, 200, 200, ${(1 - smokeProgress) * 0.4})`
        ctx.beginPath()
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // Chama do foguete (muito mais realista)
      if (progress < 0.9) {
        for (let flame = 0; flame < 3; flame++) {
          const flameOffset = (flame - 1) * 8
          const flameLength = 40 + Math.random() * 30
          const flameX = rocketX + flameOffset
          const flameY = rocketY + flameLength
          
          ctx.fillStyle = flame === 0 ? `rgba(255, 150, 0, ${0.7 * (1 - progress * 0.3)})` :
                         flame === 1 ? `rgba(255, 200, 0, ${0.5 * (1 - progress * 0.3)})` :
                         `rgba(255, 255, 0, ${0.3 * (1 - progress * 0.3)})`
          
          ctx.beginPath()
          ctx.arc(flameX, flameY, 10 - flame * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Foguete/Objeto principal (maior)
    const gradient = ctx.createRadialGradient(rocketX, rocketY, 0, rocketX, rocketY, 15)
    gradient.addColorStop(0, '#60a5fa')
    gradient.addColorStop(1, '#1e40af')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(rocketX, rocketY, 12, 0, Math.PI * 2)
    ctx.fill()

    // Borda do objeto
    ctx.strokeStyle = '#93c5fd'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(rocketX, rocketY, 12, 0, Math.PI * 2)
    ctx.stroke()

    // Telemetria em tela
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 14px monospace'
    ctx.fillText(`TELEMETRIA`, 20, 25)

    ctx.font = '12px monospace'
    ctx.fillStyle = '#60a5fa'
    ctx.fillText(`Alt: ${(disp.altitude / 1000).toFixed(2)} km`, 20, 45)
    ctx.fillStyle = '#10b981'
    ctx.fillText(`Vel: ${(disp.velocity).toFixed(0)} m/s`, 20, 65)
    ctx.fillStyle = '#a78bfa'
    ctx.fillText(`Tempo: ${(disp.time).toFixed(1)}s`, 20, 85)

    // Barra de progresso vertical
    const progressHeight = (disp.progresso / 100) * (height - 40)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
    ctx.fillRect(width - 40, 20, 30, height - 40)
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(width - 40, height - 20 - progressHeight, 30, progressHeight)

    // Emergências com glow
    const lastEmerg = emergenciesRef.current[emergenciesRef.current.length - 1]
    if (lastEmerg && /VELOCIDADE_CRITICA|FALHA_ORBITAL|TEMPERATURA_ALTA/i.test(lastEmerg.type)) {
      const now = Date.now()
      const emergTime = new Date(lastEmerg.timestamp).getTime()
      if (now - emergTime < 30_000) {
        const glowIntensity = Math.sin((now % 500) / 500 * Math.PI) * 0.8
        const gradient = ctx.createRadialGradient(rocketX, rocketY, 0, rocketX, rocketY, 80)
        gradient.addColorStop(0, `rgba(255,100,0,${0.6 * glowIntensity})`)
        gradient.addColorStop(0.4, `rgba(255,200,0,${0.3 * glowIntensity})`)
        gradient.addColorStop(1, 'rgba(255,0,0,0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(rocketX, rocketY, 80, 0, Math.PI * 2)
        ctx.fill()
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
    console.log('🚀 startSimulation chamado. isConnected:', isConnected)
    
    if (!isConnected) {
      addLog('Aguardando conexão...', 'warning')
      return
    }

    try {
      setStatus('running')
      setProgress(0)
      setLogs([])
      setEmergencies([])
      startTimeRef.current = Date.now()
      addLog('🚀 Iniciando simulação...', 'info')

      // Usar tipoSimulacao da missão se disponível, senão detectar pelo nome
      let simulationType = mission.tipoSimulacao || 
                          (mission.name.toLowerCase().includes('orb') ? 'orbita' : 
                           mission.name.toLowerCase().includes('reen') ? 'reentrada' : 'foguete')
      
      // Garantir que é um dos tipos válidos
      if (!['foguete', 'orbita', 'reentrada'].includes(simulationType)) {
        simulationType = 'foguete'
      }
      
      simulationTypeRef.current = simulationType
      console.log('📋 Tipo de simulação:', simulationType)
      
      const params = simulationType === 'orbita' 
        ? { altitude_inicial: 400000, tempo_maximo: 6000 }
        : { massa_inicial: 549000, massa_combustivel: 507000, empuxo: 7607000, tempo_maximo: 600 }

      // Usar porta 8000 para simulações em Python
      const pythonApiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('8080', '8000') || 'http://localhost:8000'
      const url = `${pythonApiUrl}/simulacoes/${simulationType}`
      console.log('🌐 POST para:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descricao: mission.name, ...params })
      })

      console.log('📬 Response status:', response.status)
      if (!response.ok) throw new Error(`Erro HTTP ${response.status}`)
      
      const data = await response.json()
      console.log('✅ Simulação criada:', data)
      simulationIdRef.current = data.id
      addLog(`✅ Simulação ${data.id} criada com sucesso`, 'success')
      
      // Iniciar polling para receber dados
      startPollingForSimulationData(pythonApiUrl)
      startAnimationLoop()
    } catch (error: any) {
      console.error('❌ Erro ao iniciar simulação:', error)
      setStatus('error')
      addLog(`❌ Erro: ${error.message}`, 'error')
    }
  }

  const startPollingForSimulationData = (pythonApiUrl: string) => {
    let pollCount = 0
    const maxPolls = 15 // ~8 segundos com interval de 500ms
    
    const poll = () => {
      if (!status || status === 'completed') return
      
      pollCount++
      
      // Calcular progresso
      const progresso = (pollCount / maxPolls) * 100
      
      // Simular dados de simulação (já que WebSocket não está disponível)
      // Em produção, você faria um GET para um endpoint que retorna dados da simulação
      const mockData = {
        altitude_atual: Math.random() * 100000,
        velocidade_atual: Math.random() * 8000,
        tempo_atual: pollCount * 0.5,
        progresso: progresso,
        status: progresso >= 100 ? 'CONCLUIDA' : 'EXECUTANDO'
      }
      
      handleSimulationUpdate({ data: mockData, type: 'simulation_update' })
      
      // Se atingiu o fim, marca como completa
      if (pollCount >= maxPolls) {
        setTimeout(() => {
          handleSimulationComplete({ data: mockData })
        }, 300)
      } else {
        setTimeout(poll, 500)
      }
    }
    
    poll()
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
    <div className="w-full h-full bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-1 border-b border-zinc-800">
        <div className="flex items-center gap-2 min-w-0">
          <Rocket className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{mission.name}</h1>
            <p className="text-xs text-zinc-400 truncate">{mission.destination}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Horizontal Layout */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left: Canvas - Takes most space */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-black rounded border border-zinc-800 overflow-hidden flex-1 relative">
            <canvas
              ref={canvasRef}
              width={1024}
              height={400}
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
        </div>

        {/* Right: Info Panel */}
        <div className="w-72 flex flex-col gap-2 overflow-hidden">
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

          {/* Metrics */}
          {(status === 'running' || status === 'completed') && (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <h3 className="font-semibold text-white mb-2 text-sm">Telemetria</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-zinc-400">Altitude</p>
                  <p className="font-bold text-blue-500">{(currentData.altitude / 1000).toFixed(1)} / {(maxAltitude / 1000).toFixed(1)} km</p>
                </div>
                <div>
                  <p className="text-zinc-400">Velocidade</p>
                  <p className="font-bold text-green-500">{(currentData.velocity).toFixed(0)} / {(maxVelocity).toFixed(0)} m/s</p>
                </div>
                <div>
                  <p className="text-zinc-400">Tempo Sim / Real</p>
                  <p className="font-bold text-purple-500">{currentData.time.toFixed(1)} / {executionTime.toFixed(2)} s</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {(status === 'running' || status === 'completed') && (
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-zinc-400 text-center">
                  {progress.toFixed(0)}% - {status === 'running' ? 'Em andamento...' : 'Concluída'}
                </p>
              </div>
            </div>
          )}

          {/* Emergências */}
          {emergencies.length > 0 && (
            <div className="bg-red-950/30 rounded-lg p-3 border border-red-900/50 flex-1 overflow-auto">
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
          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex-1 overflow-auto min-h-24">
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
