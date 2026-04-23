# Stock Monitor

Stock Monitor is a backend-first project intended to support stock price tracking and monitoring workflows through a clean service-oriented foundation. The current repository contains an initial price service built with ASP.NET Core, providing a starting point for future market data integrations, monitoring features, and application expansion.

This README is designed to give contributors and reviewers a clear understanding of the project at a high level without diving into implementation-heavy details.

## Overview

The goal of Stock Monitor is to provide a reliable base for building a stock monitoring platform. At this stage, the repository focuses on establishing the backend service structure, development workflow, and project organization required for future growth.

The project is currently in an early setup phase, with the foundational API service in place and ready for iterative feature development.

## Current Scope

The repository currently includes:

- A backend service for price-related functionality
- Local development configuration for running the service
- API documentation support for development environments
- Basic project scaffolding for continued expansion

## Repository Structure

```text
stock-monitor/
├── .gitignore
├── backend/
│   ├── gateway-api/
│   └── services/
│       └── price-service/
│           ├── Controllers/
│           ├── Models/
│           ├── Properties/
│           ├── Services/
│           ├── Program.cs
│           ├── appsettings.Development.json
│           ├── appsettings.json
│           ├── price-service.csproj
│           ├── price-service.http
│           └── price-service.sln
├── docker/
├── frontend/
└── README.md
```

## Technology Stack

- .NET 8
- ASP.NET Core Web API
- Swagger / OpenAPI for development-time API exploration

## Getting Started

### Prerequisites

Make sure the following are installed on your machine:

- .NET 8 SDK

### Run the Service

From the repository root:

```bash
cd backend/services/price-service
dotnet run
```

Once the service is running, you can access the local API endpoint using the URL shown in the terminal output.

## Development Experience

The service is configured to support a simple local development workflow. In development mode, API documentation is available through Swagger UI, making it easier to inspect and test available endpoints as the service evolves.

An HTTP request file is also included for lightweight local API testing:

- [backend/services/price-service/price-service.http](backend/services/price-service/price-service.http)

## Configuration

Application settings are managed through standard ASP.NET Core configuration files. Default settings for logging and host behavior are available in:

- [backend/services/price-service/appsettings.json](backend/services/price-service/appsettings.json)
- [backend/services/price-service/appsettings.Development.json](backend/services/price-service/appsettings.Development.json)

## Project Status

Stock Monitor is currently at a foundational stage. The repository is best understood as a clean starting point for a broader stock monitoring platform rather than a feature-complete product.

Planned evolution may include:

- Market data integration
- Portfolio or watchlist tracking
- Alerting and notification workflows
- Expanded API surface and service capabilities

## Contributing

Contributions are easiest when changes remain focused, clearly documented, and aligned with the existing service structure. If you extend the platform, keep the repository organization consistent and update this README when the project scope changes meaningfully.

## License

No license has been defined in this repository yet. Add a license file before distributing or open-sourcing the project.
