import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws"
    try:
        print(f"🔌 Tentando conectar em {uri}...")
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket conectado com sucesso!")
            
            # Enviar uma mensagem de teste
            test_message = {"type": "test", "message": "Hello WebSocket!"}
            await websocket.send(json.dumps(test_message))
            print(f"📤 Enviado: {test_message}")
            
            # Aguardar resposta
            response = await websocket.recv()
            print(f"📨 Recebido: {response}")
            
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        print(f"❌ Tipo do erro: {type(e)}")

if __name__ == "__main__":
    asyncio.run(test_websocket())