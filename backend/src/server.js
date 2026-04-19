require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const connectDB = require('./utils/db');
const { initWebSocket } = require('./websocket/consultationSocket');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const { requestLogger } = require('./middleware/auditLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const httpServer = createServer(app);

connectDB();
initWebSocket(httpServer);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));
app.use(globalRateLimiter);
app.use(requestLogger);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/consultations', require('./routes/consultations'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/iot', require('./routes/iot'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/alerts', require('./routes/alerts'));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`TeleCare backend running on port ${PORT}`));

module.exports = app;
