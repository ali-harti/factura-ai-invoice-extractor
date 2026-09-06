<div align="center">
  <img src="./frontend/public/logo.svg" alt="Factura Logo" width="120" />
  <h1>Factura</h1>
  <p><strong>Open-Source AI-Powered Invoice Extraction Engine</strong></p>

  <p>
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
    <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi" alt="FastAPI" /></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  </p>
</div>

---

**Factura** is an advanced, AI-powered invoice data extraction platform. It seamlessly reads invoices in over 50 languages (including RTL, CJK, and Cyrillic scripts), processes various formats (PDF, JPG, PNG), and outputs clean, structured JSON and CSV formats ready for ERP integration. 

Say goodbye to manual data entry and brittle OCR templates. Factura leverages advanced vision-language models (VLMs) to intelligently parse any invoice structure instantly.

---

## ✨ Key Features

- 🌍 **Global Language Support**: Accurately extracts data from Latin, Arabic, CJK, Cyrillic, and Devanagari scripts using advanced vision models.
- 🎯 **High Accuracy & Confidence Scoring**: Provides per-extraction confidence scores to identify which invoices need human review.
- 🛠️ **Interactive Corrections**: Inline JSON editor for human-in-the-loop corrections before exporting.
- 📥 **Flexible Export**: Export extracted data directly to CSV or JSON, or sync via API.
- 🔒 **Enterprise-Grade Security**: Self-hostable backend ensures maximum data privacy.
- ⚡ **Real-time Processing**: Fast asynchronous extraction and background polling.

## 🏗️ Architecture

Factura is built on a modern, decoupled, scalable stack:

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Firebase Auth.
- **Backend**: FastAPI (Python), SQLite (extensible to PostgreSQL), OpenRouter API (Qwen/LLaVA Vision capabilities).
- **Architecture Pattern**: RESTful API with background processing and polling.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- Firebase Project for Authentication (Client credentials)
- OpenRouter API Key (or alternative LLM API key)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/factura.git
cd factura
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```
*The API will be available at `http://localhost:8000/api/v1/`*

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your Firebase credentials
```

Start the Vite development server:
```bash
npm run dev
```
*The application will be available at `http://localhost:5173`*

## 📖 API Documentation

Once the backend is running, you can access the interactive Swagger UI documentation at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## 🤝 Contributing

We love our contributors! Please read our [Contributing Guidelines](CONTRIBUTING.md) and submit pull requests. Ensure all code passes `ruff` and `oxlint` checks before submitting a PR.

## 📄 License

This project is open-source and licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
