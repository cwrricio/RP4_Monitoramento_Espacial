"use client"

import { useState, useEffect, useRef } from "react"
import { X, Activity, Rocket, AlertTriangle, CheckCircle, Loader, Zap, Gauge, Play } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Mission {
  id: string
  name: string
  destination: string
  launchDate: string
  status: string
  description: string
}

interface SimulationModalProps {
  mission: Mission
  isOpen: boolean
  onClose: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'

export function SimulationModal({ mission, isOpen, onClose }: SimulationModalProps) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'running' | 'completed' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<Array<{ text: string; type: string; timestamp: string }>>([])
  const [emergencies, setEmergencies] = useState<any[]>([])
  const [simulationData, setSimulationData] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentData, setCurrentData] = useState({
    altitude: 0,
    velocity: 0,
    time: 0,
    acceleration: 0
  })

  const wsRef = useRef<WebSocket | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simulationIdRef = useRef<string | null>(null)

  // Conectar WebSocket quando o modal abrir
  useEffect(() => {
    if (!isOpen) return

    const connectWebSocket = () => {
      try {
        console.log('🔌 Tentando conectar ao WebSocket:', WS_URL)
        console.log('🔌 API Base URL:', API_BASE_URL)
        
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('✅ WebSocket conectado com sucesso!')
          console.log('✅ ReadyState:', ws.readyState)
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
          console.error('❌ WebSocket error completo:', error)
          console.error('❌ WebSocket error type:', error.type)
          console.error('❌ WebSocket readyState:', ws.readyState)
          console.error('❌ WebSocket URL:', WS_URL)
          console.error('❌ WebSocket URL válida:', /^wss?:\/\//.test(WS_URL))
          
          // Verificar detalhes específicos do erro
          if (error instanceof ErrorEvent) {
            console.error('❌ WebSocket error message:', error.message)
            console.error('❌ WebSocket error filename:', error.filename)
            console.error('❌ WebSocket error lineno:', error.lineno)
          }
          
          setStatus('error')
          const errorMsg = error instanceof ErrorEvent ? error.message : 'Falha na conexão WebSocket'
          addLog('Erro na conexão WebSocket: ' + errorMsg, 'error')
        }

        ws.onclose = (event) => {
          console.log('🔌 WebSocket desconectado. Code:', event.code, 'Reason:', event.reason)
          console.log('🔌 Was clean:', event.wasClean)
          
          // Interpretar códigos de erro comuns
          let disconnectReason = 'Desconectado do sistema'
          switch (event.code) {
            case 1000:
              disconnectReason = 'Desconexão normal'
              break
            case 1001:
              disconnectReason = 'Servidor indo embora'
              break
            case 1002:
              disconnectReason = 'Erro de protocolo'
              break
            case 1003:
              disconnectReason = 'Tipo de dados não aceito'
              break
            case 1006:
              disconnectReason = 'Desconexão anormal - servidor não disponível'
              break
            case 1011:
              disconnectReason = 'Erro interno do servidor'
              break
            default:
              disconnectReason = `Desconectado (código: ${event.code})`
          }
          
          setIsConnected(false)
          addLog(disconnectReason, event.code === 1000 ? 'info' : 'error')
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
  }, [isOpen])

  const handleWebSocketMessage = (message: any) => {
    console.log('Mensagem recebida:', message)

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

  const handleSimulationUpdate = (message: any) => {
    const { data } = message

    if (data.status === 'INICIANDO') {
      setStatus('running')
      addLog(`Simulação iniciada: ${data.message}`, 'info')
    } else if (data.status === 'EXECUTANDO') {
      setProgress(data.progresso || 0)
      
      // Atualizar dados atuais
      setCurrentData({
        altitude: data.altitude_atual || 0,
        velocity: data.velocidade_atual || 0,
        time: data.tempo_atual || 0,
        acceleration: data.aceleracao_atual || 0
      })

      // Atualizar canvas
      updateCanvas(data)
    } else if (data.status === 'ANIMACAO_INICIADA') {
      addLog('Gerando animação...', 'info')
    } else if (data.status === 'ANIMACAO_CONCLUIDA') {
      addLog('Animação concluída!', 'success')
    }
  }

  const handleSimulationComplete = (message: any) => {
    setStatus('completed')
    setProgress(100)
    setSimulationData(message.results)
    addLog('✅ Simulação concluída com sucesso!', 'success')
  }

  const handleEmergency = (message: any) => {
    const emergency = {
      type: message.emergency_type,
      data: message.data,
      timestamp: message.timestamp
    }

    setEmergencies(prev => [...prev, emergency])
    addLog(`⚠️ EMERGÊNCIA: ${message.emergency_type}`, 'warning')
  }

  const addLog = (text: string, type: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR')
    setLogs(prev => [...prev, { text, type, timestamp }].slice(-20))
  }

  const updateCanvas = (data: any) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Limpar canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, width, height)

    // Desenhar grade
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // Desenhar linha central
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()

    // Desenhar foguete (representação simples)
    const rocketX = (data.tempo_atual / 600) * width
    const rocketY = height - (data.altitude_atual / 400000) * height
    
    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(rocketX, rocketY, 8, 0, Math.PI * 2)
    ctx.fill()

    // Desenhar trilha
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, height)
    ctx.lineTo(rocketX, rocketY)
    ctx.stroke()

    // Desenhar informações
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px monospace'
    ctx.fillText(`TELEMETRIA EM TEMPO REAL`, 20, 30)
    
    ctx.font = '14px monospace'
    ctx.fillStyle = '#3b82f6'
    ctx.fillText(`Altitude: ${(data.altitude_atual || 0).toFixed(0)} m`, 20, 60)
    ctx.fillText(`Velocidade: ${(data.velocidade_atual || 0).toFixed(0)} m/s`, 20, 85)
    ctx.fillText(`Tempo: ${(data.tempo_atual || 0).toFixed(1)} s`, 20, 110)
    
    if (data.aceleracao_atual) {
      ctx.fillText(`Aceleração: ${(data.aceleracao_atual).toFixed(2)} m/s²`, 20, 135)
    }

    // Barra de progresso visual
    const progressHeight = (data.progresso / 100) * height
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
    ctx.fillRect(width - 50, height - progressHeight, 40, progressHeight)
    
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(width - 50, height - progressHeight, 40, 4)
  }

  const determineSimulationType = (missionName: string): 'foguete' | 'orbita' | 'reentrada' => {
    const name = missionName.toLowerCase()
    if (name.includes('orbital') || name.includes('estação')) return 'orbita'
    if (name.includes('reentrada')) return 'reentrada'
    return 'foguete'
  }

  const getSimulationParameters = (type: string) => {
    switch (type) {
      case 'orbita':
        return { altitude_inicial: 400000, tempo_maximo: 6000 }
      case 'reentrada':
        return { altitude_inicial: 120000, velocidade_inicial: 7500, tempo_maximo: 300 }
      default:
        return {
          massa_inicial: 549000,
          massa_combustivel: 507000,
          empuxo: 7607000,
          tempo_maximo: 600
        }
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

      const simulationType = determineSimulationType(mission.name)
      const params = {
        descricao: mission.description || mission.name,
        ...getSimulationParameters(simulationType)
      }

      addLog(`Tipo de simulação: ${simulationType}`, 'info')
      addLog(`Parâmetros: ${JSON.stringify(params)}`, 'info')

      const response = await fetch(`${API_BASE_URL}/simulacoes/${simulationType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      simulationIdRef.current = data.id
      addLog(`✅ Simulação ${data.id} criada com sucesso`, 'success')

    } catch (error: any) {
      console.error('Erro:', error)
      setStatus('error')
      addLog(`❌ Erro: ${error.message}`, 'error')
    }
  }

  const resetSimulation = () => {
    setStatus('idle')
    setProgress(0)
    setLogs([])
    setEmergencies([])
    setSimulationData(null)
    setCurrentData({ altitude: 0, velocity: 0, time: 0, acceleration: 0 })
    simulationIdRef.current = null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Rocket className="w-6 h-6 text-blue-500" />
              <DialogTitle className="text-2xl">
                Simulação em Tempo Real: {mission.name}
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-h-[calc(95vh-180px)] overflow-y-auto">
          {/* Coluna Principal - Visualização */}
          <div className="lg:col-span-2 space-y-4">
            {/* Canvas de Visualização */}
            <div className="bg-black rounded-lg border border-zinc-800 overflow-hidden relative">
              <canvas
                ref={canvasRef}
                width={900}
                height={450}
                className="w-full"
              />
              
              {/* Overlay de Status */}
              {status === 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="text-center">
                    <Rocket className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="text-white text-xl font-semibold">
                      Pronto para iniciar simulação
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Métricas em Tempo Real */}
            {status === 'running' && (
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <Gauge className="w-4 h-4" />
                    <span>Altitude</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">
                    {(currentData.altitude / 1000).toFixed(1)} km
                  </p>
                </div>
                
                <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <Zap className="w-4 h-4" />
                    <span>Velocidade</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">
                    {(currentData.velocity).toFixed(0)} m/s
                  </p>
                </div>
                
                <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <Activity className="w-4 h-4" />
                    <span>Tempo</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-500">
                    {currentData.time.toFixed(1)} s
                  </p>
                </div>
                
                <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <Activity className="w-4 h-4" />
                    <span>Progresso</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-500">
                    {progress.toFixed(0)}%
                  </p>
                </div>
              </div>
            )}

            {/* Barra de Progresso */}
            {status === 'running' && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-zinc-400 text-center">
                  Simulação em andamento...
                </p>
              </div>
            )}

            {/* Alertas de Emergência */}
            {emergencies.length > 0 && (
              <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-500 font-semibold mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Alertas de Emergência ({emergencies.length})</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {emergencies.slice(-5).map((emergency, idx) => (
                    <div key={idx} className="text-sm text-red-300 flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <div>
                        <strong>{emergency.type}</strong>
                        {emergency.data.altitude && (
                          <span className="ml-2 text-red-400">
                            Alt: {emergency.data.altitude.toFixed(0)}m
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Lateral - Informações */}
          <div className="space-y-4">
            {/* Status da Conexão */}
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Conexão
              </h3>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-500 text-sm">WebSocket Conectado</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-red-500 text-sm">Desconectado</span>
                  </>
                )}
              </div>
            </div>

            {/* Status da Simulação */}
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <h3 className="font-semibold text-white mb-3">Status</h3>
              <div className="flex items-center gap-2">
                {status === 'idle' && (
                  <>
                    <Activity className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-400">Aguardando início</span>
                  </>
                )}
                {status === 'connecting' && (
                  <>
                    <Loader className="w-4 h-4 text-yellow-500 animate-spin" />
                    <span className="text-yellow-500">Conectando...</span>
                  </>
                )}
                {status === 'running' && (
                  <>
                    <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-blue-500">Em execução</span>
                  </>
                )}
                {status === 'completed' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Concluída</span>
                  </>
                )}
                {status === 'error' && (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">Erro</span>
                  </>
                )}
              </div>
            </div>

            {/* Detalhes da Missão */}
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <h3 className="font-semibold text-white mb-3">Detalhes</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-zinc-400">Destino:</span>
                  <p className="text-white font-medium">{mission.destination}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Lançamento:</span>
                  <p className="text-white font-medium">{mission.launchDate}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Tipo:</span>
                  <p className="text-white font-medium">
                    {determineSimulationType(mission.name).toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400">Descrição:</span>
                  <p className="text-white">{mission.description}</p>
                </div>
              </div>
            </div>

            {/* Log de Eventos */}
            <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Log de Eventos
              </h3>
              <div className="space-y-1 text-xs font-mono max-h-64 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4">
                    Nenhum evento registrado
                  </p>
                ) : (
                  logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        log.type === 'success' ? 'text-green-400' :
                        'text-zinc-400'
                      }`}
                    >
                      [{log.timestamp}] {log.text}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            {status === 'completed' && (
              <Button variant="outline" onClick={resetSimulation}>
                Resetar
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button
              onClick={startSimulation}
              disabled={status === 'running' || !isConnected}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {status === 'running' ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {status === 'completed' ? 'Executar Novamente' : 'Executar Simulação Real'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}