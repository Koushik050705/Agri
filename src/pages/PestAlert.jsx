import React, { useState, useEffect } from 'react';
import { ShieldAlert, ThermometerSun, Droplets, Wind, Loader2, RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const PEST_RULES = [
  {
    id: 'rice_blast',
    name: 'Rice Blast',
    crops: ['Rice', 'Paddy'],
    emoji: '🍄',
    severity: 'high',
    check: (w) => w.humidity >= 80 && w.temp >= 24 && w.temp <= 30,
    description: 'Favorable conditions for Magnaporthe oryzae spore germination.',
    management: [
      'Apply Tricyclazole (75% WP) or Isoprothiolane.',
      'Avoid excessive nitrogen fertilization.',
      'Use resistant varieties like IR-64 or Pusa Basmati 1.'
    ]
  },
  {
    id: 'downy_mildew',
    name: 'Downy Mildew',
    crops: ['Wheat', 'Grape', 'Onion', 'Maize'],
    emoji: '🌿',
    severity: 'medium',
    check: (w) => w.humidity >= 75 && w.temp >= 15 && w.temp <= 22,
    description: 'Cool and humid conditions promote Peronospora spore production.',
    management: [
      'Spray Metalaxyl + Mancozeb (Ridomil) at 10-day intervals.',
      'Improve air circulation by wider row spacing.',
      'Remove and destroy infected leaves.'
    ]
  },
  {
    id: 'powdery_mildew',
    name: 'Powdery Mildew',
    crops: ['Wheat', 'Pea', 'Mango', 'Grape', 'Cucurbits'],
    emoji: '⬜',
    severity: 'medium',
    check: (w) => w.humidity >= 60 && w.humidity < 80 && w.temp >= 20 && w.temp <= 27,
    description: 'Moderate humidity with warm days creates ideal powdery mildew conditions.',
    management: [
      'Apply Sulphur WP 80% or Hexaconazole.',
      'Spray neem oil (3%) as an organic option.',
      'Avoid overhead irrigation.'
    ]
  },
  {
    id: 'aphids',
    name: 'Aphid Outbreak',
    crops: ['Wheat', 'Mustard', 'Potato', 'Cotton', 'Vegetables'],
    emoji: '🦟',
    severity: 'medium',
    check: (w) => w.temp >= 18 && w.temp <= 28 && w.humidity < 65 && w.windspeed < 20,
    description: 'Calm, warm, and dry conditions allow rapid aphid population buildup.',
    management: [
      'Spray Imidacloprid (17.8 SL) @0.5 ml/litre or Thiamethoxam.',
      'Conserve natural enemies (ladybird beetles, lacewings).',
      'Use yellow sticky traps to monitor infestation levels.'
    ]
  },
  {
    id: 'late_blight',
    name: 'Late Blight (Phytophthora)',
    crops: ['Potato', 'Tomato'],
    emoji: '🫠',
    severity: 'high',
    check: (w) => w.humidity >= 85 && w.temp >= 10 && w.temp <= 20,
    description: 'Cool-wet conditions are the most dangerous for Late Blight development.',
    management: [
      'Apply Chlorothalonil or Cymoxanil + Mancozeb preventively.',
      'Spray every 7 days during cool rainy periods.',
      'Hill up potatoes to reduce tuber exposure to spores.'
    ]
  },
  {
    id: 'whitefly',
    name: 'Whitefly & Leaf Curl Virus',
    crops: ['Cotton', 'Tomato', 'Chilli', 'Okra'],
    emoji: '🪲',
    severity: 'high',
    check: (w) => w.temp >= 28 && w.humidity < 60,
    description: 'Hot and dry conditions cause rapid whitefly multiplication. They spread Leaf Curl Virus (CLCV).',
    management: [
      'Spray Neonicotinoids (Acetamiprid, Imidacloprid) alternately to prevent resistance.',
      'Install UV-reflective mulch to disorient whiteflies.',
      'Use insect-proof nets (40-mesh) in nurseries.'
    ]
  },
  {
    id: 'thrips',
    name: 'Thrips Infestation',
    crops: ['Onion', 'Chilli', 'Cotton', 'Grape'],
    emoji: '🐛',
    severity: 'medium',
    check: (w) => w.temp >= 25 && w.humidity >= 50 && w.humidity < 70,
    description: 'Warm temperatures with moderate humidity accelerate thrips life cycles.',
    management: [
      'Spray Spinosad 45 SC @3ml/10L or Fipronil 5% SC.',
      'Blue sticky traps are highly effective for monitoring.',
      'Encourage predatory mites (Amblyseius spp.) as natural control.'
    ]
  },
];

const SEVERITY_CONFIG = {
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'High Risk', Icon: AlertTriangle },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Moderate Risk', Icon: Info },
  low: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Low Risk', Icon: CheckCircle },
};

function PestCard({ pest, open, onToggle }) {
  const sev = SEVERITY_CONFIG[pest.severity];
  const SevIcon = sev.Icon;

  return (
    <div style={{
      borderRadius: '12px',
      border: `1px solid ${sev.color}33`,
      backgroundColor: 'var(--color-bg-card)',
      overflow: 'hidden',
      transition: 'transform 0.2s'
    }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.25rem', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left'
        }}
      >
        <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{pest.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-main)' }}>{pest.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
            Affects: {pest.crops.join(', ')}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.3rem 0.75rem', borderRadius: '20px',
          backgroundColor: sev.bg, color: sev.color, fontSize: '0.8rem', fontWeight: 600, flexShrink: 0
        }}>
          <SevIcon size={14} /> {sev.label}
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 1.25rem 1.25rem 1.25rem', borderTop: `1px solid ${sev.color}22` }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
            ℹ️ {pest.description}
          </p>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: sev.color, marginBottom: '0.5rem' }}>🛡️ Management Steps:</p>
          <ul style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {pest.management.map((m, i) => (
              <li key={i} style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-main)' }}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PestAlert() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [openCard, setOpenCard] = useState(null);

  const fetchWeather = async (location = '') => {
    setLoading(true);
    try {
      const query = location || 'auto';
      const res = await fetch(`https://wttr.in/${encodeURIComponent(query)}?format=j1`);
      const data = await res.json();
      const c = data.current_condition?.[0];
      setCity(data.nearest_area?.[0]?.areaName?.[0]?.value || location || 'Your Location');
      setWeather({
        temp: parseFloat(c.temp_C),
        humidity: parseInt(c.humidity),
        windspeed: parseInt(c.windspeedKmph),
        desc: c.weatherDesc?.[0]?.value
      });
    } catch {
      // Fallback to typical summer conditions
      setWeather({ temp: 30, humidity: 65, windspeed: 15, desc: 'Partly Cloudy' });
      setCity('Default (Hyderabad)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => fetchWeather(d.city || ''))
      .catch(() => fetchWeather(''));
  }, []);

  const activeThreats = weather
    ? PEST_RULES.filter(p => p.check(weather)).sort((a, b) =>
        (b.severity === 'high' ? 2 : 1) - (a.severity === 'high' ? 2 : 1)
      )
    : [];

  const safePests = weather ? PEST_RULES.filter(p => !p.check(weather)) : [];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#ef4444' }}>
          <ShieldAlert size={28} />
          <h1 className="title-glow" style={{ fontSize: '2.25rem', margin: 0 }}>Pest Risk Alerts</h1>
        </div>
        <p className="subtitle">AI-driven pest risk assessment based on your real-time local weather conditions.</p>
      </div>

      {/* Weather Context Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', margin: '0 0 0.25rem 0' }}>ANALYZING CONDITIONS FOR</p>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📍 {city}</h3>
          </div>
          {loading ? (
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          ) : weather && (
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { icon: <ThermometerSun size={18} />, label: 'Temp', value: `${weather.temp}°C` },
                { icon: <Droplets size={18} />, label: 'Humidity', value: `${weather.humidity}%` },
                { icon: <Wind size={18} />, label: 'Wind', value: `${weather.windspeed} km/h` },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: 'var(--color-primary)' }}>{s.icon}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{s.label}:</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => fetchWeather(city)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', color: 'var(--color-text-muted)', gap: '1rem' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          <p>Analyzing weather conditions for pest risk...</p>
        </div>
      ) : (
        <>
          {/* Active Threats */}
          {activeThreats.length > 0 ? (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.25rem', color: '#ef4444' }}>
                <AlertTriangle size={20} /> Active Threats ({activeThreats.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeThreats.map(pest => (
                  <PestCard
                    key={pest.id}
                    pest={pest}
                    open={openCard === pest.id}
                    onToggle={() => setOpenCard(openCard === pest.id ? null : pest.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', marginBottom: '2rem', backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle size={48} style={{ color: '#22c55e', marginBottom: '1rem' }} />
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#22c55e' }}>All Clear!</h3>
              <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Current weather conditions show no major pest threats.</p>
            </div>
          )}

          {/* Low-Risk Section */}
          {safePests.length > 0 && (
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
                <CheckCircle size={18} /> Currently Low Risk
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
                {safePests.map(pest => (
                  <div key={pest.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg-card)', borderRadius: '10px', border: '1px solid var(--color-bg-elevated)', opacity: 0.6 }}>
                    <span style={{ fontSize: '1.25rem' }}>{pest.emoji}</span>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{pest.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{pest.crops[0]}, {pest.crops[1]}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#22c55e' }}>✓ Safe</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
