# Stock Monitor

Stock Monitor is a backend-first system designed to track stock prices, build watchlists, and evolve into a fully automated trading and monitoring platform.

The project focuses on building a clean, scalable foundation using a service-oriented architecture that can grow from a simple monitoring tool into a more advanced system over time.

---

## Overview

This project starts with a minimal goal:

- Fetch and monitor stock prices
- Provide clean APIs for frontend consumption
- Establish a scalable backend structure

The long-term vision includes:

- Watchlist and portfolio tracking
- Alerting and notifications
- Strategy-based trade automation

---

## Repository Structure

```text
stock-monitor/
├── .gitignore
├── backend/
│   ├── gateway-api/
│   └── services/
│       └── price-service/
├── frontend/
│   └── web-app/
├── docker/
└── README.md
```

---

## Technology Stack

- .NET 8 (ASP.NET Core Web API)
- Swagger / OpenAPI
- Angular 18

---

## Current Scope

The repository currently includes:

- A price service with mock stock price generation for development
- An in-memory watchlist API on the backend
- An Angular frontend for the web experience
- A watchlist with real-time price updates via SignalR (WebSockets)
- Live interactive stock charts using Chart.js
- Basic API structure for future expansion
- Development-time API testing via Swagger

---

## Getting Started

### Prerequisites

- .NET 8 SDK
- Node.js and npm

### Run the Backend

```bash
cd backend/services/price-service
dotnet run
```

The backend runs on `http://localhost:5062`.

Swagger is available in development.

Current backend endpoints include:

- `/price/{symbol}`
- `/price/{symbol}/history`
- `/watchlist`
- `/priceHub` (SignalR WebSocket endpoint)

### Run the Frontend

```bash
cd frontend/web-app
npm install
npm start
```

The frontend runs on `http://localhost:4200` and connects to the backend at `http://localhost:5062`.

The frontend uses the backend watchlist API as its source of truth, so the watchlist persists across page refreshes while the backend is running.

---

## Development Workflow

- Backend services are developed independently inside the `services/` directory
- Each service is designed to be modular and microservice-ready
- The frontend is developed as a separate Angular application inside the same repository

---

## Roadmap

### Phase 1 & 2 (Current)

- Price service & Watchlist API
- Web frontend foundation
- Real-time data streaming (SignalR)
- Historical data and live charts

### Phase 3

- Alerts and notifications
- Persistent database storage (EF Core/PostgreSQL)

### Phase 4

- Strategy engine
- Automated trade execution

---

## Project Status

The project is in an early foundational stage. It is not feature-complete and is actively being built.

---

## Contributing

Keep changes small, focused, and aligned with the current structure. Update documentation when adding new features or services.

---

## License

No license has been defined yet.
