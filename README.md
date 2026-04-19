# 🏥 TeleCare — AI-Powered Rural Telemedicine Platform

> Scalable, offline-first telemedicine platform connecting rural villages to doctors via AI-assisted triage, IoT health devices, and multi-modal consultations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN / WAF                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Nginx Reverse Proxy                        │
│              (Rate Limiting + SSL Termination)                │
└──────┬───────────────────┬──────────────────────────────────┘
       │                   │
┌──────▼──────┐    ┌───────▼──────┐    ┌──────────────────────┐
│  React.js   │    │  Node.js +   │    │  Python FastAPI       │
│  Frontend   │    │  Express API │◄───│  AI Microservice      │
│  (Tailwind) │    │  WebSocket   │    │  (Symptom Analysis)   │
└─────────────┘    └──────┬───────┘    └──────────────────────┘
                          │
                   ┌──────▼───────┐
                   │   MongoDB    │
                   │  (Atlas /    │
                   │  Self-hosted)│
                   └──────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Recharts |
| Backend | Node.js, Express, WebSocket (ws) |
| Database | MongoDB + Mongoose |
| AI Service | Python FastAPI, scikit-learn |
| Auth | JWT + bcrypt + AES encryption |
| DevOps | Docker, Kubernetes, GitHub Actions |
| Monitoring | Prometheus + Grafana |
| Proxy | Nginx |

---

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone and setup
git clone <repo-url> && cd telecare

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your secrets

# Start all services
docker-compose up --build

# Access:
# Frontend:  http://localhost
# Backend:   http://localhost:5000
# AI:        http://localhost:8000
# Grafana:   http://localhost:3001
```

### Option 2: Local Development

```bash
bash scripts/setup.sh

# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start

# Terminal 3 - AI Service
cd ai-service && source venv/bin/activate && uvicorn main:app --reload
```

---

## API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/me` | Get current user | JWT |
| PUT | `/api/auth/profile` | Update profile | JWT |

### Appointments
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/appointments` | Book appointment | patient, asha_worker |
| GET | `/api/appointments/my` | Patient's appointments | patient |
| GET | `/api/appointments/doctor` | Doctor's queue | doctor |
| GET | `/api/appointments/available-doctors` | Online doctors | all |
| PUT | `/api/appointments/:id/status` | Update status | doctor, admin |

### Consultations
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/consultations/start/:appointmentId` | Start session | doctor |
| PUT | `/api/consultations/:id/end` | End + diagnose | doctor |
| GET | `/api/consultations/:id` | Get details | all |
| POST | `/api/consultations/:id/sync` | Sync offline msgs | all |

### AI Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/analyze` | Symptom analysis |
| GET | `/api/ai/trends` | Disease trends |
| POST | `/api/ai/schemes` | Scheme recommendations |

### IoT
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/iot/reading` | Submit device reading |
| GET | `/api/iot/my-readings` | Patient readings |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/village-stats` | Village heatmap data |
| GET | `/api/admin/doctor-load` | Load balancing |
| GET | `/api/admin/audit-logs` | Security audit logs |
| GET | `/api/admin/disease-trends` | Outbreak detection |

---

## WebSocket Protocol

Connect: `ws://host/ws/consultation?token=<JWT>&consultationId=<id>`

Message format:
```json
{ "type": "chat", "message": "Patient message here" }
```

---

## Role-Based Access

| Feature | Patient | Doctor | ASHA Worker | Admin |
|---------|---------|--------|-------------|-------|
| Book Appointment | ✅ | ❌ | ✅ | ✅ |
| View Own Records | ✅ | ❌ | ❌ | ✅ |
| Start Consultation | ❌ | ✅ | ❌ | ❌ |
| Write Prescription | ❌ | ✅ | ❌ | ❌ |
| Admin Dashboard | ❌ | ❌ | ❌ | ✅ |
| View All Patients | ❌ | ✅ | ✅ | ✅ |

---

## Security Features

- **JWT Authentication** — stateless, 7-day expiry
- **AES-256 Encryption** — medical notes & sensitive records
- **Rate Limiting** — 100 req/15min global, 10 req/15min auth
- **Helmet.js** — security headers (XSS, CSRF, HSTS)
- **Audit Logs** — all authenticated requests logged (90-day TTL)
- **Role-Based Access Control** — 4 roles with granular permissions
- **Trivy Scanning** — container vulnerability scanning in CI
- **TruffleHog** — secrets detection in CI pipeline

---

## Offline-First Design

1. **Service Worker** — caches static assets
2. **Offline Queue** — messages queued in localStorage when disconnected
3. **Auto-reconnect** — WebSocket reconnects every 3 seconds
4. **Sync API** — `POST /consultations/:id/sync` flushes offline messages
5. **IoT Buffer** — devices store readings locally, sync on connectivity

---

## IoT Integration

Submit health readings from any device:

```bash
curl -X POST http://api/iot/reading \
  -H "Content-Type: application/json" \
  -d '{
    "healthCardId": "HC-ABC12345",
    "deviceId": "DEVICE-001",
    "readings": {
      "bloodPressure": { "systolic": 145, "diastolic": 92 },
      "temperature": { "value": 38.8 },
      "pulse": { "value": 95 },
      "oxygenSaturation": { "value": 96 }
    },
    "location": { "village": "Rampur", "district": "Lucknow" }
  }'
```

Auto-alerts generated for:
- Systolic BP > 140 or < 90
- Temperature > 38.5°C
- Pulse > 100 or < 50
- SpO2 < 94% (CRITICAL)

---

## Deployment Guide

### AWS Production Deployment

```bash
# 1. Create EKS cluster
eksctl create cluster --name telecare --region ap-south-1 --nodes 3

# 2. Install ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/aws/deploy.yaml

# 3. Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# 4. Apply secrets (edit first!)
kubectl apply -f k8s/namespace-ingress.yaml

# 5. Deploy services
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-ai-deployment.yaml

# 6. Verify
kubectl get pods -n telecare
kubectl get ingress -n telecare
```

### Environment Variables Required

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Min 32 chars, random |
| `AES_SECRET` | Exactly 32 chars |
| `AI_SERVICE_URL` | Internal AI service URL |
| `FRONTEND_URL` | CORS allowed origin |

---

## Monitoring

- **Prometheus**: `http://localhost:9090` — metrics collection
- **Grafana**: `http://localhost:3001` — dashboards (admin/admin)
- **Logs**: Winston → `logs/combined.log` + `logs/error.log`

---

## Future Scalability Roadmap

### Phase 2 (3-6 months)
- [ ] Real ML model (XGBoost trained on symptom datasets)
- [ ] SMS/IVR integration via Twilio/Exotel
- [ ] PWA with full offline support
- [ ] Multi-language UI (Hindi, Tamil, Telugu, Bengali)
- [ ] Video consultation via WebRTC

### Phase 3 (6-12 months)
- [ ] ABDM (Ayushman Bharat Digital Mission) integration
- [ ] HL7 FHIR compliance for health records
- [ ] Federated learning for privacy-preserving AI
- [ ] Satellite connectivity support (VSAT)
- [ ] Wearable device SDK

### Phase 4 (12+ months)
- [ ] State government API integrations
- [ ] Predictive outbreak modeling
- [ ] AI-powered drug interaction checker
- [ ] Telemedicine regulatory compliance (MCI guidelines)
- [ ] Multi-tenant architecture for state deployments

---

## Project Structure

```
telecare/
├── frontend/          # React.js + Tailwind
├── backend/           # Node.js + Express
├── ai-service/        # Python FastAPI
├── k8s/               # Kubernetes manifests
├── nginx/             # Reverse proxy config
├── monitoring/        # Prometheus config
├── .github/workflows/ # CI/CD pipeline
├── scripts/           # Setup scripts
├── docker-compose.yml
└── README.md
```

---

*Built for government-grade rural healthcare deployment. Designed to scale to 100,000+ villages.*
