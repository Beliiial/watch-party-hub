import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  payload: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  connect: (roomId: string) => void;
  disconnect: () => void;
}

// Mock WebSocket URL - replace with actual server
const WS_URL = 'wss://your-server.com';

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback((roomId: string) => {
    // In production, connect to actual WebSocket server
    // For now, simulate connection
    console.log(`Подключение к комнате: ${roomId}`);
    
    // Simulate connection after a delay
    setTimeout(() => {
      setIsConnected(true);
      setLastMessage({
        type: 'connected',
        payload: { roomId },
      });
    }, 500);

    // Actual WebSocket implementation would be:
    // try {
    //   wsRef.current = new WebSocket(`${WS_URL}/room/${roomId}`);
    //   
    //   wsRef.current.onopen = () => {
    //     setIsConnected(true);
    //   };
    //   
    //   wsRef.current.onmessage = (event) => {
    //     const message = JSON.parse(event.data);
    //     setLastMessage(message);
    //   };
    //   
    //   wsRef.current.onclose = () => {
    //     setIsConnected(false);
    //     // Attempt reconnection
    //     reconnectTimeoutRef.current = setTimeout(() => connect(roomId), 3000);
    //   };
    //   
    //   wsRef.current.onerror = (error) => {
    //     console.error('WebSocket ошибка:', error);
    //   };
    // } catch (error) {
    //   console.error('Ошибка подключения:', error);
    // }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    wsRef.current?.close();
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Simulate sending for demo
      console.log('Отправка сообщения:', message);
      
      // Simulate echo for demo
      if (message.type === 'chat') {
        setTimeout(() => {
          setLastMessage({
            type: 'chat',
            payload: {
              ...message.payload,
              id: Date.now(),
            },
          });
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connect,
    disconnect,
  };
};
