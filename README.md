# 🚀 Apex Validator

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

> An intelligent, full-stack application designed to seamlessly extract and validate structured data from college forms, including manual text inputs and uploaded PDFs. 

## ✨ Features

- **📄 Smart Extraction**: Automatically pull line items, total costs, and signatures from raw text or PDFs using Groq's high-speed LLaMA models.
- **🧠 Local Logic Evaluation**: Keep business logic secure and local by using Ollama to evaluate constraints dynamically.
- **🎨 Modern UI**: Experience a sleek, glassmorphic React interface built with Tailwind CSS.
- **⚡ Fast Backend**: Powered by FastAPI for quick, asynchronous data processing.

---

## 🏗️ Architecture

The application operates on a decoupled architecture for maximum flexibility and performance:

- **Frontend**: A modern React application built with Vite and designed with Tailwind CSS.
- **Backend**: A robust API built with FastAPI, utilizing Groq API for LLM parsing and a local Ollama model (`gpt-oss:120b-cloud`) for evaluating constraints.

---

## 📋 Prerequisites

Before diving in, ensure you have the following installed on your machine:
- 🟢 **Node.js** (v18 or higher recommended)
- 🐍 **Python** (v3.8 or higher)
- 🦙 **Ollama** (Running locally)
- 🔑 A **Groq API Key**

---

## 🚀 Quick Start

This project requires both the frontend and backend to run concurrently. Follow these steps to get everything up and running.

### 1️⃣ Start the Local Ollama Model
The backend relies on local LLMs to dynamically evaluate constraints. You will need Ollama running in the background.

```bash
ollama serve
ollama pull gpt-oss:120b-cloud
```

### 2️⃣ Setup the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment *(optional, but recommended)*:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install fastapi uvicorn groq python-dotenv PyPDF2 python-multipart requests
   ```
4. Setup your environment variables:
   Create a `.env` file in the `backend` folder and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend API will be available at `http://localhost:8000`.*

### 3️⃣ Setup the Frontend

1. Open a **new terminal window** and navigate to the frontend directory:
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
   *The frontend will be accessible at `http://localhost:5173`.*

---

## 💡 Usage Guide

1. **Launch the App**: Open your browser and navigate to `http://localhost:5173`.
2. **Input Data**: You can either type the college form details manually or upload a PDF document containing the requested items, total amounts, and signatures.
3. **Validate**: Click submit! The backend will parse the file via Groq and validate the logic using your local Ollama instance, presenting the results instantly on the UI.
