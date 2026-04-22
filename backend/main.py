import os
import requests
import json
import io
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from groq import Groq
from dotenv import load_dotenv
import PyPDF2

load_dotenv()

app = FastAPI(title="Apex Validator API")

# Update CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq Client
groq_client = Groq()

OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gpt-oss:120b-cloud"

class ExtractRequest(BaseModel):
    text: str

class ExtractionResponse(BaseModel):
    items: List[Dict[str, Any]]
    totalRequested: int
    signatures: Dict[str, bool]

class EvaluateRequest(BaseModel):
    extraction_data: Dict[str, Any]

@app.get("/")
def read_root():
    return {"status": "Apex Validator Backend is running"}

def extract_data_with_groq(text_content: str):
    prompt = f"""
    You are a data extraction assistant. Extract the requested items, their costs, the total requested amount, and the presence of signatures.
    Format your response EXACTLY as a valid JSON object without any markdown wrapping, like this:
    {{
      "items": [{{"name": "Venue", "cost": 5000}}, {{"name": "Food", "cost": 2000}}],
      "totalRequested": 7000,
      "signatures": {{"Mentor": true, "HoD": true, "Principal": false}}
    }}
    
    If you cannot find a value, guess reasonably or use 0/false.
    
    Here is the text to analyze:
    {text_content}
    """
    
    try:
        completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You output only structured JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",  # standard fast model on Groq
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        response_text = completion.choices[0].message.content
        data = json.loads(response_text)
        return data
        
    except Exception as e:
        print(f"Error calling Groq: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/extract")
async def extract_data(req: ExtractRequest):
    """
    Uses Groq LLaMA model to extract structured data from raw Apex text.
    """
    return extract_data_with_groq(req.text)

@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    """
    Extracts text from an uploaded PDF and uses Groq to structure it.
    """
    if file.filename and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    try:
        contents = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                extracted_text += text + "\n"
                
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract any text from the PDF.")
            
        return extract_data_with_groq(extracted_text)
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/evaluate")
async def evaluate_data(req: EvaluateRequest):
    """
    Uses local Ollama gpt-oss:120b-cloud to evaluate the extracted data constraints.
    """
    extraction_json_str = json.dumps(req.extraction_data, indent=2)
    
    prompt = f"""
    You are the Engine Logic Evaluator for an Apex form.
    Evaluate the following JSON data representing a college form request:
    {extraction_json_str}
    
    Validation Rules:
    1. Check mathematical accuracy: Sum of all item costs MUST exactly equal the 'totalRequested'.
    2. Check constraints based on 'totalRequested' Budget:
       - If totalRequested < 10000: 'Principal' signature is NOT needed. 'Mentor' and 'HoD' signatures MUST be true.
       - If totalRequested >= 10000: 'Mentor', 'HoD', AND 'Principal' signatures MUST all be true.
    
    If ANY rule fails, the result is REJECTED. Otherwise, PASSED.
    
    Format your response EXACTLY as valid JSON without markdown wrapping:
    {{
      "result": "PASSED" or "REJECTED",
      "reasoning": "A short, concise explanation of the Engine Logic evaluated."
    }}
    """
    
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }
        
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=60)
        response.raise_for_status()
        
        data = response.json()
        result_text = data.get("response", "")
        # Try to parse the Ollama JSON response
        try:
            parsed_result = json.loads(result_text)
            return parsed_result
        except json.JSONDecodeError:
            # Fallback if the model didn't perfectly structure it
            return {
                "result": "ERROR",
                "reasoning": f"Failed to parse engine output: {result_text}"
            }
            
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        raise HTTPException(status_code=500, detail=str(e))
