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

- A price service for fetching stock market data
- An Angular frontend for the web experience
- Basic API structure for future expansion
- Development-time API testing via Swagger

---

## Getting Started

### Prerequisites

- .NET 8 SDK
- Alpha Vantage API key

### Configure the Price Service

Before running the price service, add your Alpha Vantage API key to the service configuration.

For local development, this can be set in `backend/services/price-service/appsettings.Development.json`.

### Run the Backend

```bash
cd backend/services/price-service
dotnet run
```

Access Swagger UI via the URL shown in the terminal.

### Run the Frontend

```bash
cd frontend/web-app
npm start
```

The frontend runs as a separate Angular application during development.

---

## Development Workflow

- Backend services are developed independently inside the `services/` directory
- Each service is designed to be modular and microservice-ready
- The frontend is developed as a separate Angular application inside the same repository

---

## Roadmap

### Phase 1 (Current)

- Price service
- Web frontend foundation
- Basic API structure

### Phase 2

- Watchlist service
- Frontend integration

### Phase 3

- Alerts and notifications
- Historical data and charts

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
