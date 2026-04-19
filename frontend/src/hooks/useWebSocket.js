import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (consultationId, token) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);
  const offlineQueue = useRef([]);

  const connect = useCallback(() => {
    if (!consultationId || !token) return;
    const url = `ws://${window.location.host}/ws/consultation?token=${token}&consultationId=${consultationId}`;
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      setConnected(true);
      // Flush offline queue
      offlineQueue.current.forEach(msg => ws.current.send(JSON.stringify(msg)));
      offlineQueue.current = [];
    };

    ws.current.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setMessages(prev => [...prev, msg]);
    };

    ws.current.onclose = () => {
      setConnected(false);
      setTimeout(connect, 3000); // Auto-reconnect
    };
  }, [consultationId, token]);

  useEffect(() => {
    connect();
    return () => ws.current?.close();
  }, [connect]);

  const sendMessage = useCallback((message) => {
    const payload = { type: 'chat', message, timestamp: new Date().toISOString() };
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
    } else {
      offlineQueue.current.push(payload);
    }
    setMessages(prev => [...prev, { ...payload, isMine: true }]);
  }, []);

  return { messages, connected, sendMessage, offlineQueue: offlineQueue.current };
};
