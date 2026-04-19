const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Consultation = require('../models/Consultation');

const rooms = new Map(); // consultationId -> Set of ws clients

const initWebSocket = (server) => {
  const wss = new WebSocket.Server({ server, path: '/ws/consultation' });

  wss.on('connection', (ws, req) => {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const token = params.get('token');
    const consultationId = params.get('consultationId');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.id;
      ws.consultationId = consultationId;
    } catch {
      ws.close(1008, 'Invalid token');
      return;
    }

    if (!rooms.has(consultationId)) rooms.set(consultationId, new Set());
    rooms.get(consultationId).add(ws);

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw);
        const payload = { ...msg, senderId: ws.userId, timestamp: new Date() };

        // Broadcast to room
        rooms.get(consultationId)?.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(payload));
          }
        });

        // Persist chat message
        if (msg.type === 'chat') {
          await Consultation.findByIdAndUpdate(consultationId, {
            $push: { chatHistory: { sender: ws.userId, message: msg.message, timestamp: payload.timestamp } }
          });
        }
      } catch {}
    });

    ws.on('close', () => {
      rooms.get(consultationId)?.delete(ws);
      if (rooms.get(consultationId)?.size === 0) rooms.delete(consultationId);
    });
  });
};

module.exports = { initWebSocket };
