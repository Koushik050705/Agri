import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, AlertTriangle, CheckCircle, Leaf, Loader2,
  RefreshCw, Upload, Image as ImageIcon, Beaker, ShieldCheck, ShieldX, Sparkles
} from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';

/* ─────────────────────────────────────────────────────────────────────────────
   Google Gemini Vision API  (gemini-1.5-flash — free tier, no rate limit issues)
   API key is read from .env → VITE_GEMINI_API_KEY
 ──────────────────────────────────────────────────────────────────────────── */
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_KEY}`;

// Convert an image source to base64 string
async function toBase64(src) {
  if (src instanceof File || src instanceof Blob) {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload  = () => res(reader.result.split(',')[1]);
      reader.onerror = rej;
      reader.readAsDataURL(src);
    });
  }
  // HTMLImageElement / HTMLCanvasElement / HTMLVideoElement
  const canvas = document.createElement('canvas');
  canvas.width  = src.naturalWidth  || src.videoWidth  || src.width  || 224;
  canvas.height = src.naturalHeight || src.videoHeight || src.height || 224;
  canvas.getContext('2d').drawImage(src, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  return dataUrl.split(',')[1];
}

// Detect mime type from file
function mimeType(src) {
  if (src instanceof File) return src.type || 'image/jpeg';
  return 'image/jpeg';
}

// Call Gemini with text + image, expect JSON back
async function analyseWithGemini(base64, mime, prompt) {
  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType: mime, data: base64 } }
      ]
    }],
    generationConfig: {
      temperature: 0.1,         // low temp for structured / factual output
      responseMimeType: 'application/json'
    }
  };

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return JSON.parse(text);
}

// ── Prompts ──────────────────────────────────────────────────────────────────

const CROP_PROMPT = `You are an expert plant pathologist AI.

Analyse the uploaded image and return ONLY a JSON object (no markdown, no code fences) in this exact format:

{
  "is_valid": true/false,
  "invalid_reason": "string (only if is_valid is false — describe what the image actually shows)",
  "crop_name": "string (e.g. Tomato, Corn, Apple — only if is_valid is true)",
  "disease_name": "string (e.g. Early Blight, or Healthy — only if is_valid is true)",
  "confidence": "string (percentage, e.g. 91.4%)",
  "severity": "string (Mild / Moderate / Severe / None — only if is_valid is true)",
  "visual_symptoms": "string (2-3 sentences describing what you see in the image)",
  "cause": "string (pathogen name and type, e.g. Alternaria solani — fungal)",
  "treatment": "string (specific actionable treatment steps, 3-5 sentences)",
  "prevention": "string (preventive measures for future)",
  "affected_parts": "string (which plant part is affected, e.g. Leaves, Stems, Roots)"
}

Rules:
- If the image does NOT show a crop leaf, plant part, or any agricultural subject, set is_valid to false.
- Be extremely specific. Do not give generic answers.
- confidence should reflect your actual certainty.`;

const SOIL_PROMPT = `You are an expert soil scientist and agronomist AI.

Analyse the uploaded image of soil and return ONLY a JSON object (no markdown, no code fences) in this exact format:

{
  "is_valid": true/false,
  "invalid_reason": "string (only if is_valid is false — describe what the image actually shows)",
  "soil_type": "string (e.g. Loamy, Clayey, Sandy, Black Cotton, Red Laterite, etc.)",
  "colour": "string (scientific soil colour description)",
  "texture": "string (Fine / Medium / Coarse)",
  "moisture_level": "string (Dry / Moist / Wet)",
  "ph_range": "string (e.g. 5.5 – 6.5)",
  "organic_matter": "string (Low / Medium / High)",
  "primary_issue": "string (main soil problem detected, e.g. Salinity, Compaction, Waterlogging, or None)",
  "confidence": "string (percentage)",
  "recommended_crops": "string (top 3-4 crops suited for this soil)",
  "amendments": "string (specific soil amendment recommendations — fertilisers, organic matter, pH corrections)",
  "irrigation_advice": "string (irrigation frequency and method suggestion)",
  "visual_observations": "string (what you physically see in the image)"
}

Rules:
- If the image does NOT show soil or earth, set is_valid to false.
- Base your analysis on the visible colour, texture, and moisture cues in the image.
- Be specific and actionable.`;

export default function Agritech() {
  const [scanState, setScanState]         = useState('idle');
  const [scanResult, setScanResult]       = useState(null);
  const [soilType, setSoilType]           = useState('');
  const [rainfall, setRainfall]           = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [recommending, setRecommending]   = useState(false);
  const [scanType, setScanType]           = useState('crop');
  const [mode, setMode]                   = useState('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true); }
    } catch (e) { alert('Camera error: ' + e.message); }
  };
  const stopCamera = () => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
  };
  useEffect(() => () => stopCamera(), []);

  // ── Main Pipeline ─────────────────────────────────────────────────────────
  const processAnalysis = async (inputSource) => {
    setScanState('scanning');
    setScanResult(null);

    try {
      const mime   = mimeType(inputSource);
      const b64    = await toBase64(inputSource);
      const prompt = scanType === 'crop' ? CROP_PROMPT : SOIL_PROMPT;

      const result = await analyseWithGemini(b64, mime, prompt);
      console.log('[Gemini Vision Result]', result);

      if (!result.is_valid) {
        setScanState('invalid');
        setScanResult({
          message: 'Invalid or Irrelevant Image',
          detail:  result.invalid_reason || 'The AI could not identify an agricultural subject in this image.'
        });
        return;
      }

      setScanState('valid');
      setScanResult(result);

    } catch (err) {
      console.error('[Gemini API Error]', err);
      setScanState('invalid');
      setScanResult({ message: 'API Error', detail: err.message });
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width  = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);
      processAnalysis(canvasRef.current);
      stopCamera();
    }
  };

  const handleRecommend = () => {
    if (!soilType || !rainfall) return;
    setRecommending(true); setRecommendation(null);
    setTimeout(() => {
      const rain = parseInt(rainfall), soil = soilType.toLowerCase();
      let result;
      if      (soil.includes('loam') && rain > 1000) result = { crops: 'Rice, Sugarcane, Banana', reason: 'Loamy soil + high rainfall → water-intensive crops.' };
      else if (soil.includes('loam') && rain >= 500) result = { crops: 'Wheat, Maize, Mustard', reason: 'Versatile loamy soil with moderate rainfall.' };
      else if (soil.includes('sand') || rain < 500)  result = { crops: 'Millets, Pulses, Guar', reason: 'Sandy/dry conditions → drought-resistant crops.' };
      else if (soil.includes('black'))               result = { crops: 'Cotton, Soybean, Groundnut', reason: 'Black cotton soil → fibre & oilseeds.' };
      else if (soil.includes('clay'))                result = { crops: 'Rice, Jute, Wheat', reason: 'Clay retains moisture → paddy & fibre crops.' };
      else                                           result = { crops: 'Vegetables, Pulses, Fodder', reason: 'General conditions → short-duration rotational crops.' };
      setRecommendation(result); setRecommending(false);
    }, 1200);
  };

  // ── Reusable result row ───────────────────────────────────────────────────
  const Row = ({ label, value, mono }) => value ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', flexShrink: 0, paddingTop: '0.15rem' }}>{label}:</span>
      <span style={{ fontWeight: 600, fontSize: mono ? '0.78rem' : '0.88rem', textAlign: 'right', lineHeight: 1.4 }}>{value}</span>
    </div>
  ) : null;

  const Block = ({ label, value, color = 'var(--color-primary)', bg = 'rgba(74,222,128,0.05)', border = 'rgba(74,222,128,0.2)' }) => value ? (
    <div style={{ padding: '0.9rem', backgroundColor: bg, borderRadius: 12, border: `1px solid ${border}` }}>
      <p style={{ fontSize: '0.6rem', color, fontWeight: 700, marginBottom: '0.35rem', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontSize: '0.85rem', lineHeight: 1.55, margin: 0 }}>{value}</p>
    </div>
  ) : null;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title-glow" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI Agritech Insights</h1>
          <p className="subtitle">Powered by Google Gemini Vision AI — real agricultural intelligence.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-bg-elevated)', border: '1px solid rgba(74,222,128,0.3)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          <Sparkles size={13} /> Gemini 2.5 Pro
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

        {/* ── Scanner ──────────────────────────────────────────────────────── */}
        <div className="glass-card" style={{ gridColumn: '1 / -1', maxWidth: '980px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Camera style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Smart {scanType === 'crop' ? 'Plant' : 'Soil'} Scanner</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['crop', 'soil'].map(t => (
                <button key={t}
                  onClick={() => { setScanType(t); setScanState('idle'); setScanResult(null); }}
                  style={{ fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, color: scanType === t ? 'white' : 'var(--color-text-muted)', backgroundColor: scanType === t ? 'var(--color-primary)' : 'var(--color-bg-elevated)', padding: '0.3rem 0.9rem', borderRadius: 'var(--radius-pill)', border: '1px solid rgba(74,222,128,.25)', transition: 'all .2s' }}>
                  {t === 'crop' ? <><Leaf size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} />Crop Leaf</> : <><Beaker size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} />Soil Health</>}
                </button>
              ))}
            </div>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
            {scanType === 'crop'
              ? 'Gemini Vision will identify crop type, disease, severity, treatment steps, and prevention measures.'
              : 'Gemini Vision will analyse soil colour, texture, pH, organic matter, amendments, and crop suitability.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {[{ id: 'upload', icon: <Upload size={16} />, label: 'Upload Image' }, { id: 'webcam', icon: <Camera size={16} />, label: 'Live Scan' }].map(b => (
              <button key={b.id}
                className={mode === b.id ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => { setMode(b.id); if (b.id === 'webcam') startCamera(); else stopCamera(); setScanState('idle'); setScanResult(null); }}>
                {b.icon} {b.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>

            {/* View area */}
            <div style={{ flex: '1 1 400px', minHeight: 320, backgroundColor: '#000', borderRadius: 'var(--radius-md)', position: 'relative', overflow: 'hidden', border: '1px solid var(--color-bg-elevated)' }}>
              {mode === 'webcam' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isCameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 200, height: 200, border: '2px solid rgba(74,222,128,.5)', borderRadius: 24, boxShadow: '0 0 0 1000px rgba(0,0,0,.5)' }} />
                      <button onClick={captureImage} style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', width: 60, height: 60, borderRadius: '50%', border: '3px solid white', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Camera size={24} color="white" />
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}><Camera size={44} style={{ marginBottom: '1rem' }} /><p>Starting Camera…</p></div>
                  )}
                </div>
              )}

              {mode === 'upload' && scanState === 'idle' && (
                <label style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', cursor: 'pointer', border: '2px dashed var(--color-bg-elevated)' }}>
                  <ImageIcon size={52} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Upload {scanType === 'crop' ? 'Crop Leaf' : 'Soil'} Image</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 240 }}>Sent to Gemini Vision API for deep agricultural analysis</p>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) processAnalysis(f); }} />
                </label>
              )}

              {['scanning', 'valid', 'invalid'].includes(scanState) && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {scanState === 'scanning' && (
                    <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                      <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 1.5rem' }}>
                        <Loader2 size={100} className="animate-spin" style={{ color: 'var(--color-primary)', position: 'absolute', inset: 0 }} />
                        <div style={{ position: 'absolute', inset: 8, backgroundColor: 'var(--color-bg-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={32} className="animate-pulse" style={{ color: 'var(--color-primary)' }} />
                        </div>
                      </div>
                      <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Gemini Vision Analysing…</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>Sending image to Google AI for deep {scanType} analysis</p>
                    </div>
                  )}
                  {scanState === 'invalid' && (
                    <div style={{ textAlign: 'center', padding: '2rem', maxWidth: 320 }}>
                      <ShieldX size={60} style={{ color: 'var(--color-danger)', margin: '0 auto 1.5rem' }} />
                      <p style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '1.05rem', marginBottom: '0.5rem' }}>{scanResult?.message}</p>
                      <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>{scanResult?.detail}</p>
                      <button className="btn-secondary" onClick={() => { setScanState('idle'); setScanResult(null); }}>Try Again</button>
                    </div>
                  )}
                  {scanState === 'valid' && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <ShieldCheck size={60} style={{ color: 'var(--color-primary)', margin: '0 auto 1.5rem' }} />
                      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>Analysis Complete!</p>
                      <button className="btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setScanState('idle'); setScanResult(null); if (mode === 'webcam') startCamera(); }}>New Scan</button>
                    </div>
                  )}
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Results panel */}
            <div style={{ flex: '1 1 290px', padding: '1.5rem', backgroundColor: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-elevated)', overflowY: 'auto', maxHeight: 560 }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} style={{ color: 'var(--color-primary)' }} /> Gemini AI Report
              </h3>

              {scanState === 'valid' && scanResult ? (
                <div style={{ display: 'grid', gap: '0.9rem' }}>
                  {/* Validity */}
                  <div style={{ padding: '0.5rem 1rem', backgroundColor: 'rgba(74,222,128,0.08)', borderRadius: 8, border: '1px solid rgba(74,222,128,0.2)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Image Validity</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white' }}>✓ PASS</span>
                  </div>

                  {/* ── CROP results ── */}
                  {scanType === 'crop' && (<>
                    <Row label="Detected Crop"  value={scanResult.crop_name} />
                    <Row label="Confidence"      value={scanResult.confidence} />
                    <div style={{ padding: '0.9rem', backgroundColor: scanResult.disease_name === 'Healthy' ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: 12, border: `1px solid ${scanResult.disease_name === 'Healthy' ? 'rgba(74,222,128,.2)' : 'rgba(239,68,68,.2)'}` }}>
                      <p style={{ fontSize: '0.6rem', color: scanResult.disease_name === 'Healthy' ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>Disease / Condition</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{scanResult.disease_name}</p>
                      {scanResult.severity && scanResult.severity !== 'None' && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.25rem 0 0' }}>Severity: {scanResult.severity}</p>}
                    </div>
                    <Row label="Cause"           value={scanResult.cause} />
                    <Row label="Affected Parts"  value={scanResult.affected_parts} />
                    <Block label="Visual Symptoms"  value={scanResult.visual_symptoms} color="var(--color-warning)" bg="rgba(255,184,0,0.05)" border="rgba(255,184,0,0.2)" />
                    <Block label="Treatment Plan"   value={scanResult.treatment} />
                    <Block label="Prevention"       value={scanResult.prevention} color="#a0cfff" bg="rgba(100,160,255,0.05)" border="rgba(100,160,255,0.2)" />
                  </>)}

                  {/* ── SOIL results ── */}
                  {scanType === 'soil' && (<>
                    <Row label="Soil Type"       value={scanResult.soil_type} />
                    <Row label="Colour"          value={scanResult.colour} />
                    <Row label="Texture"         value={scanResult.texture} />
                    <Row label="Moisture"        value={scanResult.moisture_level} />
                    <Row label="pH Range"        value={scanResult.ph_range} />
                    <Row label="Organic Matter"  value={scanResult.organic_matter} />
                    <Row label="Confidence"      value={scanResult.confidence} />
                    <div style={{ padding: '0.9rem', backgroundColor: scanResult.primary_issue === 'None' ? 'rgba(74,222,128,0.06)' : 'rgba(239,68,68,0.06)', borderRadius: 12, border: `1px solid ${scanResult.primary_issue === 'None' ? 'rgba(74,222,128,.2)' : 'rgba(239,68,68,.2)'}` }}>
                      <p style={{ fontSize: '0.6rem', color: scanResult.primary_issue === 'None' ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>Primary Issue</p>
                      <p style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{scanResult.primary_issue}</p>
                    </div>
                    <Block label="Recommended Crops" value={scanResult.recommended_crops} />
                    <Block label="Visual Observations" value={scanResult.visual_observations} color="var(--color-warning)" bg="rgba(255,184,0,0.05)" border="rgba(255,184,0,0.2)" />
                    <Block label="Soil Amendments"    value={scanResult.amendments} />
                    <Block label="Irrigation Advice"  value={scanResult.irrigation_advice} color="#a0cfff" bg="rgba(100,160,255,0.05)" border="rgba(100,160,255,0.2)" />
                  </>)}
                </div>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  {scanState === 'scanning' ? 'Gemini Vision is analysing your image…' : 'Upload or capture an image to begin Gemini AI analysis.'}
                </div>
              )}
            </div>
          </div>
        </div>

        <WeatherWidget />

        {/* Smart Recommender */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Leaf style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Smart Recommender</h2>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Enter your soil type and expected rainfall for crop recommendations.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <input type="text"   className="input-field" placeholder="Soil Type (e.g. Loamy, Black, Sandy)" value={soilType} onChange={e => setSoilType(e.target.value)} />
            <input type="number" className="input-field" placeholder="Average Annual Rainfall (mm)"        value={rainfall} onChange={e => setRainfall(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }} onClick={handleRecommend} disabled={recommending || !soilType || !rainfall}>
            {recommending ? <Loader2 size={18} className="animate-spin" /> : 'Generate Recommendations'}
          </button>
          {recommendation && (
            <div style={{ backgroundColor: 'var(--color-bg-dark)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-dim)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Best Crops</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{recommendation.crops}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Why: </span>{recommendation.reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
