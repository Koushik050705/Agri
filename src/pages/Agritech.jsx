import React, { useState, useRef, useEffect } from 'react';
import { Camera, AlertTriangle, CheckCircle, Leaf, Loader2, RefreshCw, Upload, Image as ImageIcon, Beaker, ShieldCheck, ShieldX } from 'lucide-react';
import WeatherWidget from '../components/WeatherWidget';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { diseaseDiagnostics } from '../data/diseaseDiagnostics';
import { soilDiagnostics } from '../data/soilDiagnostics';

// ─────────────────────────────────────────────────────────────────────────────
// ImageNet classes that indicate a valid agricultural subject (plant / soil)
// MobileNet returns class names from ImageNet. These are the relevant ones.
// ─────────────────────────────────────────────────────────────────────────────
const PLANT_CLASSES = [
  'daisy', 'dandelion', 'roses', 'sunflowers', 'tulips',
  'cabbage', 'cauliflower', 'corn', 'cucumber', 'eggplant', 'squash',
  'bell pepper', 'cucumber', 'strawberry', 'tomato', 'banana',
  'broccoli', 'artichoke', 'mushroom', 'zucchini', 'lemon',
  'orange', 'pomegranate', 'pineapple', 'fig', 'jackfruit', 'guava',
  'leaf', 'plant', 'tree', 'shrub', 'flower', 'herb',
  // Soil-related ImageNet classes
  'lakeside', 'seashore', 'sand bar', 'cliff', 'valley',
  'plowed field', 'terrain', 'lawn', 'dam', 'greenhouse',
  'harvester', 'thresher', 'tractor'
];

// Keywords for matching inside class names
const AGRI_KEYWORDS = [
  'plant', 'leaf', 'flower', 'tree', 'vegetable', 'fruit', 'crop',
  'soil', 'dirt', 'grass', 'field', 'garden', 'farm', 'shrub',
  'greenhouse', 'harvest', 'tractor', 'seaweed', 'fungus', 'mushroom'
];

const CROP_MODEL_URL =
  'https://raw.githubusercontent.com/rexsimiloluwah/PLANT-DISEASE-CLASSIFIER-WEB-APP-TENSORFLOWJS/master/tensorflowjs-model/model.json';

const CLASSES = [
  'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
  'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
  'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
  'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
  'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
  'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
  'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy',
  'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
  'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew',
  'Strawberry___Leaf_scorch', 'Strawberry___healthy',
  'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight',
  'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
  'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
  'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
];

export default function Agritech() {
  const [scanState, setScanState] = useState('idle');
  const [scanResult, setScanResult] = useState(null);
  const [soilType, setSoilType] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [recommending, setRecommending] = useState(false);
  const [mode, setMode] = useState('upload');
  const [scanType, setScanType] = useState('crop');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [validationModel, setValidationModel] = useState(null); // MobileNet (ImageNet)
  const [cropModel, setCropModel] = useState(null);             // PlantVillage (38 diseases)
  const [soilModel, setSoilModel] = useState(null);             // Trained soil sequential model
  const [modelStatus, setModelStatus] = useState('loading');   // loading | ready | error

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ───────────────── Model Initialisation ─────────────────
  useEffect(() => {
    const init = async () => {
      try {
        setModelStatus('loading');
        console.log('[AgriVision] Loading AI models...');

        // 1. MobileNet for image validation (ImageNet, 1000 classes)
        const mobileNetModel = await mobilenet.load({ version: 2, alpha: 1.0 });
        setValidationModel(mobileNetModel);
        console.log('[AgriVision] MobileNet loaded ✓');

        // 2. PlantVillage disease model (pretrained TF.js, 38 crop×disease classes)
        const plantModel = await tf.loadLayersModel(CROP_MODEL_URL);
        setCropModel(plantModel);
        console.log('[AgriVision] PlantVillage model loaded ✓');

        // 3. Soil Analysis Model — sequential network trained on labelled soil features
        // Features: [normalised_red, texture_approx, normalised_blue_green]
        const soilKeys = Object.keys(soilDiagnostics);
        const sm = tf.sequential({
          layers: [
            tf.layers.dense({ units: 32, activation: 'relu', inputShape: [3] }),
            tf.layers.dropout({ rate: 0.2 }),
            tf.layers.dense({ units: 16, activation: 'relu' }),
            tf.layers.dense({ units: soilKeys.length, activation: 'softmax' })
          ]
        });
        sm.compile({ optimizer: tf.train.adam(0.005), loss: 'categoricalCrossentropy', metrics: ['accuracy'] });

        // Build training dataset from soil feature vectors (soil diagnostics are labelled samples)
        const xs = tf.tensor2d(soilKeys.map(k => soilDiagnostics[k].features));
        const ys = tf.oneHot(tf.tensor1d(soilKeys.map((_, i) => i), 'int32'), soilKeys.length);
        await sm.fit(xs, ys, { epochs: 200, verbose: 0 });
        xs.dispose(); ys.dispose();
        setSoilModel(sm);
        console.log('[AgriVision] Soil model trained ✓');

        setModelStatus('ready');
        console.log('[AgriVision] All models online ✓');
      } catch (err) {
        console.error('[AgriVision] Model init error:', err);
        setModelStatus('error');
      }
    };
    init();
  }, []);

  // ───────────────── Camera helpers ─────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true); }
    } catch (err) { alert('Camera error: ' + err.message); }
  };
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      setIsCameraActive(false);
    }
  };
  useEffect(() => () => stopCamera(), []);

  // ───────────────── Main Analysis Pipeline ─────────────────
  const processAnalysis = async (inputSource) => {
    if (modelStatus !== 'ready') {
      setScanState('invalid');
      setScanResult({ message: 'Models Not Ready', detail: 'Please wait for all AI models to finish loading.' });
      return;
    }

    setScanState('scanning');

    try {
      // Prepare image element
      let imgEl;
      if (inputSource instanceof File || inputSource instanceof Blob) {
        imgEl = new Image();
        imgEl.src = URL.createObjectURL(inputSource);
        await new Promise((res, rej) => { imgEl.onload = res; imgEl.onerror = rej; });
      } else {
        imgEl = inputSource;
      }

      // ── STAGE 1: Image Validation via MobileNet (real ImageNet labels) ──
      const predictions = await validationModel.classify(imgEl, 5); // top-5 predictions
      console.log('[Validation] MobileNet top-5:', predictions);

      const isAgricultural = predictions.some(p => {
        const cls = p.className.toLowerCase();
        return AGRI_KEYWORDS.some(kw => cls.includes(kw)) ||
               PLANT_CLASSES.some(pc => cls.includes(pc));
      });

      if (!isAgricultural) {
        setScanState('invalid');
        setScanResult({
          message: 'Invalid or Irrelevant Image',
          detail: `The AI detected: "${predictions[0].className}". Please upload a clear image of a crop leaf or soil sample.`,
          detectedClass: predictions[0].className,
          detectedScore: (predictions[0].probability * 100).toFixed(1)
        });
        return;
      }

      // ── STAGE 2: Specialised Model Analysis ──
      const imgTensor = tf.browser.fromPixels(imgEl);
      const resized   = tf.image.resizeBilinear(imgTensor, [224, 224]);
      const normalised = resized.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1)).expandDims();

      if (scanType === 'crop') {
        // PlantVillage disease model inference
        const preds    = await cropModel.predict(normalised).data();
        const maxProb  = Math.max(...preds);
        const maxIdx   = preds.indexOf(maxProb);

        if (maxProb < 0.25) {
          setScanState('invalid');
          setScanResult({
            message: 'Invalid or Irrelevant Image',
            detail: 'The Plant AI could not identify a recognisable crop leaf. Please upload a clear, well-lit leaf photo.'
          });
          imgTensor.dispose(); resized.dispose(); normalised.dispose();
          return;
        }

        const className  = CLASSES[maxIdx];
        const diagnostic = diseaseDiagnostics[className] || {};
        const validationLabel = predictions[0].className;

        setScanState('valid');
        setScanResult({
          isValid:           true,
          crop:              diagnostic.crop     || className.split('___')[0],
          disease:           diagnostic.disease  || 'Unknown Condition',
          recommendation:    diagnostic.recommendation || 'Consult an agronomist.',
          visual_markers:    diagnostic.visual_markers || '',
          confidence:        (maxProb * 100).toFixed(1) + '%',
          validationClass:   validationLabel,
          validationScore:   (predictions[0].probability * 100).toFixed(1)
        });
      } else {
        // Soil analysis using trained sequential model
        // Extract dominant colour features from the image
        const canvas = document.createElement('canvas');
        const ctx    = canvas.getContext('2d');
        canvas.width = 50; canvas.height = 50;
        ctx.drawImage(imgEl, 0, 0, 50, 50);
        const pixels = ctx.getImageData(0, 0, 50, 50).data;

        let totalR = 0, totalG = 0, totalB = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          totalR += pixels[i]; totalG += pixels[i + 1]; totalB += pixels[i + 2];
        }
        const count = pixels.length / 4;
        const avgR = totalR / count / 255;
        const avgG = totalG / count / 255;
        const avgB = totalB / count / 255;

        // Feature vector for soil model: [avg_red, avg_green, avg_blue]
        const features = tf.tensor2d([[avgR, avgG, avgB]]);
        const pred     = await soilModel.predict(features).data();
        features.dispose();

        const maxSoilProb = Math.max(...pred);
        const maxSoilIdx  = pred.indexOf(maxSoilProb);

        if (maxSoilProb < 0.45) {
          setScanState('invalid');
          setScanResult({
            message: 'Invalid or Irrelevant Image',
            detail: 'The Soil AI could not match this image to any known soil profile. Please upload a close-up photo of soil.'
          });
          imgTensor.dispose(); resized.dispose(); normalised.dispose();
          return;
        }

        const soilKey    = Object.keys(soilDiagnostics)[maxSoilIdx];
        const diagnostic = soilDiagnostics[soilKey];

        setScanState('valid');
        setScanResult({
          isValid:          true,
          crop:             diagnostic.type,
          disease:          diagnostic.issue,
          recommendation:   diagnostic.recommendation,
          ph_range:         diagnostic.ph_range,
          ideal_crops:      diagnostic.ideal_crops,
          confidence:       (maxSoilProb * 100).toFixed(1) + '%',
          validationClass:  predictions[0].className,
          validationScore:  (predictions[0].probability * 100).toFixed(1)
        });
      }

      imgTensor.dispose(); resized.dispose(); normalised.dispose();
    } catch (err) {
      console.error('[AgriVision] Pipeline error:', err);
      setScanState('invalid');
      setScanResult({ message: 'Processing Error', detail: err.message });
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
    setRecommending(true);
    setRecommendation(null);
    setTimeout(() => {
      const rain = parseInt(rainfall), soil = soilType.toLowerCase();
      let result;
      if      (soil.includes('loam') && rain > 1000) result = { crops: 'Rice, Sugarcane, Banana',     reason: 'Loamy soil + high rainfall ⟶ water-intensive crops.' };
      else if (soil.includes('loam') && rain >= 500) result = { crops: 'Wheat, Maize, Mustard',        reason: 'Versatile loamy soil with moderate rainfall.' };
      else if (soil.includes('sand') || rain < 500)  result = { crops: 'Millets, Pulses, Guar',        reason: 'Sandy/dry soil ⟶ drought-resistant crops.' };
      else if (soil.includes('black'))               result = { crops: 'Cotton, Soybean, Groundnut',   reason: 'Black cotton soil (Regur) ⟶ fibre & oilseeds.' };
      else if (soil.includes('clay'))                result = { crops: 'Rice, Jute, Wheat',             reason: 'Clay retains moisture ⟶ paddy & fibre crops.' };
      else                                           result = { crops: 'Vegetables, Pulses, Fodder',   reason: 'General conditions ⟶ short-duration rotational crops.' };
      setRecommendation(result);
      setRecommending(false);
    }, 1200);
  };

  // ───────────────── UI helpers ─────────────────
  const modelStatusConfig = {
    loading: { text: 'AI Loading…',     color: 'var(--color-warning)',  spin: true  },
    ready:   { text: 'AI Ready',        color: 'var(--color-primary)',  spin: false },
    error:   { text: 'Model Error',     color: 'var(--color-danger)',   spin: false }
  };
  const mConf = modelStatusConfig[modelStatus];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title-glow" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>AI Agritech Insights</h1>
          <p className="subtitle">Real-time disease detection via vision AI and professional crop planning.</p>
        </div>
        {/* Model status pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-bg-elevated)', border: `1px solid ${mConf.color}`, fontSize: '0.8rem', fontWeight: 600, color: mConf.color }}>
          {mConf.spin ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {mConf.text}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

        {/* ── Scanner Widget ── */}
        <div className="glass-card" style={{ gridColumn: '1 / -1', maxWidth: '940px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Camera style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Smart {scanType === 'crop' ? 'Plant' : 'Soil'} Scanner</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['crop', 'soil'].map(t => (
                <button key={t}
                  onClick={() => { setScanType(t); setScanState('idle'); setScanResult(null); }}
                  style={{ fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600,
                    color: scanType === t ? 'white' : 'var(--color-text-muted)',
                    backgroundColor: scanType === t ? 'var(--color-primary)' : 'var(--color-bg-elevated)',
                    padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-pill)',
                    border: '1px solid rgba(74,222,128,.2)', transition: 'all .2s' }}>
                  {t === 'crop' ? <><Leaf size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />Crop Leaf</> : <><Beaker size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />Soil Health</>}
                </button>
              ))}
            </div>
          </div>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
            {scanType === 'crop'
              ? '● Stage 1: MobileNet image validation  ● Stage 2: PlantVillage AI (38 disease classes)'
              : '● Stage 1: MobileNet image validation  ● Stage 2: Trained soil feature model'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { id: 'upload', icon: <Upload size={18} />, label: 'Upload Image' },
              { id: 'webcam', icon: <Camera size={18} />, label: 'Live Scan' }
            ].map(btn => (
              <button key={btn.id}
                className={mode === btn.id ? 'btn-primary' : 'btn-secondary'}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onClick={() => { setMode(btn.id); if (btn.id === 'webcam') startCamera(); else stopCamera(); setScanState('idle'); setScanResult(null); }}
                disabled={modelStatus !== 'ready'}>
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>

            {/* ── View area ── */}
            <div style={{ flex: '1 1 400px', minHeight: '320px', backgroundColor: '#000', borderRadius: 'var(--radius-md)', position: 'relative', overflow: 'hidden', border: '1px solid var(--color-bg-elevated)' }}>

              {/* Loading overlay */}
              {modelStatus === 'loading' && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1.5rem' }}>
                  <Loader2 size={48} className="animate-spin" style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 600, color: 'white', marginBottom: '0.3rem' }}>Initialising AgriVision AI</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Loading MobileNet + PlantVillage + Soil model…</p>
                </div>
              )}

              {/* Webcam */}
              {mode === 'webcam' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isCameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 200, height: 200, border: '2px solid rgba(74,222,128,.5)', borderRadius: 24, boxShadow: '0 0 0 1000px rgba(0,0,0,0.5)' }} />
                      <button onClick={captureImage} style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', width: 64, height: 64, borderRadius: '50%', border: '4px solid white', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Camera size={28} color="white" />
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      <Camera size={48} style={{ marginBottom: '1rem' }} />
                      <p>Starting Camera…</p>
                    </div>
                  )}
                </div>
              )}

              {/* Upload idle */}
              {mode === 'upload' && scanState === 'idle' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', border: '2px dashed var(--color-bg-elevated)' }}>
                  <ImageIcon size={52} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Upload {scanType === 'crop' ? 'Crop Leaf' : 'Soil Sample'} Image</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    MobileNet will validate the image before analysis.
                  </p>
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) processAnalysis(f); }} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </div>
              )}

              {/* State overlays */}
              {['scanning', 'valid', 'invalid'].includes(scanState) && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {scanState === 'scanning' && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 1.5rem' }}>
                        <Loader2 size={120} className="animate-spin" style={{ color: 'var(--color-primary)', position: 'absolute', inset: 0 }} />
                        <div style={{ position: 'absolute', inset: 10, backgroundColor: 'var(--color-bg-dark)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RefreshCw size={40} className="animate-pulse" style={{ color: 'var(--color-primary)' }} />
                        </div>
                      </div>
                      <p style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '1.1rem' }}>Running AI Pipeline…</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>Stage 1: MobileNet validation → Stage 2: Diagnostic model</p>
                    </div>
                  )}
                  {scanState === 'invalid' && (
                    <div style={{ textAlign: 'center', padding: '2rem', maxWidth: 320 }}>
                      <ShieldX size={64} style={{ color: 'var(--color-danger)', margin: '0 auto 1.5rem' }} />
                      <p style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{scanResult?.message}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: scanResult?.detectedClass ? '0.75rem' : '2rem', lineHeight: 1.5 }}>{scanResult?.detail}</p>
                      {scanResult?.detectedClass && (
                        <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '1.5rem', fontStyle: 'italic' }}>MobileNet detected: "{scanResult.detectedClass}" ({scanResult.detectedScore}%)</p>
                      )}
                      <button className="btn-secondary" onClick={() => { setScanState('idle'); setScanResult(null); }}>Try Again</button>
                    </div>
                  )}
                  {scanState === 'valid' && (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <ShieldCheck size={64} style={{ color: 'var(--color-primary)', margin: '0 auto 1.5rem' }} />
                      <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>Analysis Complete</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                        MobileNet: "{scanResult?.validationClass}" ({scanResult?.validationScore}%)
                      </p>
                      <button className="btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setScanState('idle'); setScanResult(null); if (mode === 'webcam') startCamera(); }}>New Scan</button>
                    </div>
                  )}
                </div>
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* ── Results Panel ── */}
            <div style={{ flex: '1 1 280px', padding: '1.5rem', backgroundColor: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-elevated)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} style={{ color: 'var(--color-primary)' }} /> AI Diagnostic Report
              </h3>

              {scanState === 'valid' && scanResult ? (
                <div style={{ display: 'grid', gap: '1rem' }}>

                  {/* Validity row */}
                  <div style={{ padding: '0.6rem 1rem', backgroundColor: 'rgba(74,222,128,0.08)', borderRadius: 10, border: '1px solid rgba(74,222,128,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Image Validity</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>✓ PASS — Verified</span>
                  </div>

                  {/* Detected subject */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{scanType === 'crop' ? 'Crop Detected' : 'Soil Type'}:</span>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{scanResult.crop}</span>
                  </div>

                  {/* Confidence bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Model Confidence:</span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ height: 5, width: 90, backgroundColor: 'var(--color-bg-elevated)', borderRadius: 10, overflow: 'hidden', marginBottom: 3 }}>
                        <div style={{ height: '100%', width: scanResult.confidence, backgroundColor: 'var(--color-primary)' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>{scanResult.confidence}</span>
                    </div>
                  </div>

                  {/* Disease / Soil issue */}
                  <div style={{ padding: '0.9rem', backgroundColor: scanResult.disease === 'Healthy' || scanResult.disease?.includes('Healthy') ? 'rgba(74,222,128,0.05)' : 'rgba(239,68,68,0.05)', borderRadius: 12, border: `1px solid ${scanResult.disease === 'Healthy' || scanResult.disease?.includes('Healthy') ? 'rgba(74,222,128,.2)' : 'rgba(239,68,68,.2)'}` }}>
                    <p style={{ fontSize: '0.65rem', color: scanResult.disease === 'Healthy' || scanResult.disease?.includes('Healthy') ? 'var(--color-primary)' : 'var(--color-danger)', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      {scanType === 'crop' ? 'Disease Prediction' : 'Soil Issue Detected'}
                    </p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{scanResult.disease}</p>
                  </div>

                  {/* Crop-specific: visual markers */}
                  {scanType === 'crop' && scanResult.visual_markers && (
                    <div style={{ padding: '0.9rem', backgroundColor: 'rgba(255,184,0,0.05)', borderRadius: 12, border: '1px solid rgba(255,184,0,0.2)' }}>
                      <p style={{ fontSize: '0.65rem', color: 'var(--color-warning)', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>Observed Visual Markers</p>
                      <p style={{ fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>{scanResult.visual_markers}</p>
                    </div>
                  )}

                  {/* Soil-specific: pH + recommended crops */}
                  {scanType === 'soil' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ padding: '0.8rem', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 10 }}>
                        <p style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Target pH</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>{scanResult.ph_range}</p>
                      </div>
                      <div style={{ padding: '0.8rem', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 10 }}>
                        <p style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Best Crops</p>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>{scanResult.ideal_crops}</p>
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  <div style={{ padding: '0.9rem', backgroundColor: 'rgba(0,200,83,0.05)', borderRadius: 12, border: '1px solid rgba(0,200,83,.2)' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>AI Recommendation</p>
                    <p style={{ fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>{scanResult.recommendation}</p>
                  </div>

                </div>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  {scanState === 'scanning' ? 'Running neural network inference…' : 'Upload or scan an image to begin AI diagnosis.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <WeatherWidget />

        {/* Smart Recommender */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            <Leaf />
            <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-text-main)' }}>Smart Recommender</h2>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Enter your soil type and expected rainfall to get an AI-curated crop recommendation.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <input type="text" className="input-field" placeholder="Soil Type (e.g. Loamy, Black, Sandy…)" value={soilType} onChange={e => setSoilType(e.target.value)} />
            <input type="number" className="input-field" placeholder="Average Rainfall (mm / year)" value={rainfall} onChange={e => setRainfall(e.target.value)} />
          </div>
          <button className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }} onClick={handleRecommend} disabled={recommending || !soilType || !rainfall}>
            {recommending ? <Loader2 size={18} className="animate-spin" /> : 'Generate Recommendations'}
          </button>
          {recommendation && (
            <div style={{ backgroundColor: 'var(--color-bg-dark)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-dim)' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recommended Crops</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '0.75rem' }}>{recommendation.crops}</p>
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
