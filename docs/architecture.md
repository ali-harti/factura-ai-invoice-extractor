# Architecture Overview

## High-Level System Design

Factura follows a standard, decoupled modern web application architecture:

1.  **Frontend (React/Vite)**
    *   **Responsibility**: Presentation layer, user interactions, displaying extraction results, and human-in-the-loop review.
    *   **Tech Stack**: React 18, Vite, TypeScript, React Router.
    *   **State & Context**: Context API for Theme, Auth, Language.
    *   **Styling**: Pure CSS scoped to specific components for maintainability.

2.  **Backend (FastAPI)**
    *   **Responsibility**: Core business logic, handling file uploads, orchestrating OCR/AI extraction, API endpoints.
    *   **Tech Stack**: FastAPI (Python), Uvicorn, Pydantic for validation.
    *   **Database**: SQLite via SQLAlchemy (ORM). Easy to migrate to PostgreSQL.
    *   **Security**: Firebase Admin SDK for validating JWT tokens passed by the frontend.

3.  **Extraction Engine (AI/OCR)**
    *   **Responsibility**: Extracting text from images/PDFs and converting it to structured JSON.
    *   **Tech Stack**: OpenRouter API (Qwen / GPT-4o Vision).
    *   **Flow**: Files are converted to Base64 (PDFs rasterized if necessary) and sent to the Vision API with a strict system prompt to enforce JSON schema output.

## Directory Structure

```text
factura/
├── backend/                  # FastAPI Application
│   ├── app/                  # Application code
│   │   ├── api/              # API Routes (Endpoints)
│   │   ├── core/             # Configs, Security (Firebase Admin)
│   │   ├── models/           # SQLAlchemy Database Models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic (OCR, DB ops)
│   │   └── utils/            # Helper functions (Validators)
│   ├── tests/                # Pytest test suite
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React Application
│   ├── src/                  
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Contexts (Auth, Theme)
│   │   ├── pages/            # Page-level components
│   │   ├── services/         # API clients, Firebase init
│   │   └── styles/           # CSS stylesheets
│   └── package.json          # Node dependencies
├── docs/                     # Documentation
└── docker-compose.yml        # Docker configuration
```
