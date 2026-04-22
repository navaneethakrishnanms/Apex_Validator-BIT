import { useState } from 'react'
import { FileText, CheckCircle2, XCircle, Loader2, UploadCloud, Layers, ShieldCheck, LogOut, File as FileIcon } from 'lucide-react'
import axios from 'axios'
import './App.css'

type ExtractionData = {
  items: { name: string; cost: number }[];
  totalRequested: number;
  signatures: { Mentor?: boolean; HoD?: boolean; Principal?: boolean };
}

type EvaluationResult = {
  result: "PASSED" | "REJECTED";
  reasoning: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // Login State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Validation State
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [extraction, setExtraction] = useState<ExtractionData | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      setIsLoggedIn(true)
    }
  }

  const handleValidate = async () => {
    if (!file) {
      setError('Please upload a PDF to validate.')
      return
    }
    
    setLoading(true)
    setError('')
    setExtraction(null)
    setEvaluation(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const extractRes = await axios.post('http://localhost:8001/api/extract-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const extractedData = extractRes.data
      
      setExtraction(extractedData)

      const evaluateRes = await axios.post('http://localhost:8001/api/evaluate', {
        extraction_data: extractedData
      })
      
      setEvaluation(evaluateRes.data)
      
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError('Only PDF files are allowed.')
        setFile(null)
        e.target.value = ''
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <div className="login-wrapper glass">
          <div className="login-header">
            <div className="login-icon">
              <ShieldCheck size={32} strokeWidth={2.5} />
            </div>
            <h1 className="login-title">Apex Secure Portal</h1>
            <p className="login-subtitle">Enter your credentials to access the validator</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="admin@apex.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '2rem' }}>
              Login to Account
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container dashboard">
      <button className="logout-btn glass" onClick={() => { setIsLoggedIn(false); setFile(null); setExtraction(null); setEvaluation(null); }}>
        <LogOut size={16} /> Logout
      </button>

      <div className="content-wrapper">
        <header className="header">
          <h1>
            <FileText className="header-icon" size={36} strokeWidth={2.5} />
            Apex Validator
          </h1>
          <p>
            Upload a PDF form document to extract data and evaluate constraints automatically.
          </p>
        </header>

        <main className="main-grid">
          
          {/* Input Panel */}
          <div className="panel glass">
            <h2 className="panel-title">Upload Document</h2>
            
            <div className={`upload-zone ${file ? 'has-file' : ''}`}>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              
              {!file ? (
                <>
                  <UploadCloud className="upload-icon" size={48} strokeWidth={1.5} />
                  <div className="upload-text">Click or drag PDF to upload</div>
                  <div className="upload-subtext">Only .pdf files are supported</div>
                </>
              ) : (
                <>
                  <FileIcon className="upload-icon" size={48} strokeWidth={1.5} />
                  <div className="upload-text">Document Ready</div>
                  <div className="file-name">
                    <CheckCircle2 size={16} />
                    {file.name}
                  </div>
                </>
              )}
            </div>

            {error && (
              <div className="error-msg">
                <XCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleValidate}
              disabled={loading || !file}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="spin-icon" size={20} />
                  Analyzing PDF Document...
                </>
              ) : (
                <>
                  <UploadCloud size={20} />
                  Run AI Validation
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="results-panel">
            
            {!extraction && !evaluation && !loading && (
              <div className="empty-results glass">
                <Layers className="empty-icon" size={56} strokeWidth={1.5} />
                <p>Upload a document and run validation.<br/>AI results will appear here.</p>
              </div>
            )}

            {/* Extraction Data */}
            {extraction && (
              <div className="extraction-card">
                <h3>Extracted Details</h3>
                <ul className="extraction-list">
                  <li>
                    <strong>Line Items:</strong>
                    <span>
                      {extraction.items.length > 0
                        ? extraction.items.map(i => `${i.name} (₹${i.cost})`).join('  •  ')
                        : 'None found'}
                    </span>
                  </li>
                  <li>
                    <strong>Total Requested:</strong> 
                    <span>₹{extraction.totalRequested}</span>
                  </li>
                  <li>
                    <strong>Signatures:</strong> 
                    <span>
                      {Object.entries(extraction.signatures)
                        .map(([key, value]) => `${key} (${value ? 'Yes' : 'No'})`)
                        .join(', ')}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            {/* Evaluation Result */}
            {evaluation && (
              <div className={`evaluation-card ${evaluation.result === 'PASSED' ? 'passed' : 'rejected'}`}>
                <div className="eval-icon">
                  {evaluation.result === 'PASSED' ? (
                    <CheckCircle2 size={32} strokeWidth={2.5} />
                  ) : (
                    <XCircle size={32} strokeWidth={2.5} />
                  )}
                </div>
                <div className="eval-content">
                  <h3>
                    {evaluation.result === 'PASSED' ? "Approved Document" : "Rejected Document"}
                  </h3>
                  <div className="eval-reasoning">
                    <strong>Rule Engine Decision:</strong>
                    <p>{evaluation.reasoning}</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}

export default App
