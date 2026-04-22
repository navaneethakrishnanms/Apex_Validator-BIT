# Apex Validator

Apex Validator is a full-stack application designed to validate and extract structured data from college forms, including manual text inputs and uploaded PDFs. 

It uses a decoupled architecture:
- **Frontend:** A modern, glassmorphic React application built with Vite and Tailwind CSS.
- **Backend:** A fast API backend built with FastAPI, utilizing Groq (LLaMA) for data extraction and a local Ollama instance for evaluating business logic constraints.

## Prerequisites

Before you start, ensure you have the following installed:
1. **Node.js** (v18 or higher recommended)
2. **Python** (v3.8 or higher)
3. **Ollama** (Running locally)
4. A **Groq API Key**

## Setup & Running the Application

This project is split into two parts: `frontend` and `backend`. You must run both concurrently.

### 1. Start the Local Ollama Model
The backend relies on a local Ollama instance running the `gpt-oss:120b-cloud` model to evaluate engine logic constraints. Make sure Ollama is running and the model is downloaded.

```bash
ollama serve
ollama pull gpt-oss:120b-cloud
```

### 2. Setting up the Backend
The backend uses FastAPI.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies (assuming you have a requirements.txt, or you can install manually):
   ```bash
   pip install fastapi uvicorn groq python-dotenv PyPDF2 python-multipart requests
   ```
4. Set up your environment variables by making sure the `.env` file in the `backend` folder contains your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend API will be available at `http://localhost:8000`.

### 3. Setting up the Frontend
The frontend is a React application built with Vite.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be accessible at the local URL provided by Vite (usually `http://localhost:5173`).

## Usage
1. Open the frontend URL in your browser.
2. You can either type manual text or upload a PDF document containing the requested items, total, and signatures.
3. The backend will parse the file via Groq and validate the logic using your local Ollama instance.
