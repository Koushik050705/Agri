import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronDown, ChevronUp, Wheat, Leaf, Sun } from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CROPS = [
  {
    name: 'Rice (Kharif)',
    icon: '🌾',
    color: '#FFD700',
    activities: {
      sow:     [5, 6],
      grow:    [6, 7, 8],
      harvest: [9, 10],
      rest:    [0, 1, 2, 3, 4, 11]
    },
    tips: [
      'Needs 100–200 mm rainfall per week during growth.',
      'Flood or drain irrigation every 3 days reduces methane and saves water.',
      'Apply urea split — at tillering, panicle initiation, and heading.',
    ]
  },
  {
    name: 'Wheat (Rabi)',
    icon: '🌿',
    color: '#90EE90',
    activities: {
      sow:     [10, 11],
      grow:    [11, 0, 1],
      harvest: [2, 3],
      rest:    [4, 5, 6, 7, 8, 9]
    },
    tips: [
      'Sow at 20–25°C for best germination. Avoid late sowing after Dec 15.',
      'First irrigation is critical at crown root initiation (21 days after sowing).',
      'Use certified seed treated with Bavistin to prevent smut and bunt.',
    ]
  },
  {
    name: 'Cotton',
    icon: '🫧',
    color: '#87CEEB',
    activities: {
      sow:     [4, 5],
      grow:    [6, 7, 8, 9],
      harvest: [10, 11],
      rest:    [0, 1, 2, 3]
    },
    tips: [
      'High boll weevil / bollworm risk in Jul–Sep — spray neem-based biopesticide.',
      'Pink bollworm is a major threat. Use pheromone traps for early detection.',
      'Stop irrigation 30 days before harvest to improve boll quality.',
    ]
  },
  {
    name: 'Sugarcane',
    icon: '🎋',
    color: '#98FB98',
    activities: {
      sow:     [1, 2, 3],
      grow:    [4, 5, 6, 7, 8, 9, 10],
      harvest: [11, 0],
      rest:    []
    },
    tips: [
      'Trash mulching conserves soil moisture and controls weeds.',
      'Shoots should be earthed up twice — 45 and 90 days after planting.',
      'Watch for early shoot borer and pyrilla — spray Chlorpyrifos if above threshold.',
    ]
  },
  {
    name: 'Tomato',
    icon: '🍅',
    color: '#FF6347',
    activities: {
      sow:     [11, 0, 6, 7],
      grow:    [1, 2, 7, 8],
      harvest: [3, 4, 9, 10],
      rest:    [5]
    },
    tips: [
      'Stake plants at 30 cm height to avoid soil contact and fruit rot.',
      'High humidity causes Early/Late Blight. Apply Mancozeb every 10 days.',
      'Fruit borer is the #1 pest. Use Spinosad or Bacillus thuringiensis (Bt) spray.',
    ]
  },
  {
    name: 'Onion',
    icon: '🧅',
    color: '#DDA0DD',
    activities: {
      sow:     [9, 10, 11],
      grow:    [11, 0, 1],
      harvest: [2, 3, 4],
      rest:    [5, 6, 7, 8]
    },
    tips: [
      'Purple blotch and Stemphylium blight are the major diseases.',
      'Stop irrigation 15 days before harvest to improve curing and shelf life.',
      'Thrips can cause major losses — use blue/yellow sticky traps for monitoring.',
    ]
  },
];

const ACTIVITY_STYLES = {
  sow:     { bg: '#22c55e', key: 'activity_sow', emoji: '🌱' },
  grow:    { bg: '#3b82f6', key: 'activity_growing', emoji: '☀️' },
  harvest: { bg: '#f59e0b', key: 'activity_harvest', emoji: '🌾' },
  rest:    { bg: 'var(--color-bg-elevated)', key: 'activity_offseason', emoji: '' },
};

function CropRow({ crop }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const getActivity = (monthIdx) => {
    for (const [key, months] of Object.entries(crop.activities)) {
      if (months.includes(monthIdx)) return key;
    }
    return 'rest';
  };

  return (
    <div style={{ marginBottom: '0.75rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-bg-elevated)', backgroundColor: 'var(--color-bg-card)' }}>
      
      {/* Header Row */}
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1.25rem', cursor: 'pointer', backgroundColor: open ? 'rgba(0,200,83,0.05)' : 'transparent' }}
      >
        <span style={{ fontSize: '1.5rem' }}>{crop.icon}</span>
        <span style={{ fontWeight: 600, flex: 1 }}>{crop.name}</span>
        
        {/* Month Bar */}
        <div style={{ display: 'flex', gap: '2px', flex: 2, minWidth: 0 }}>
          {MONTHS.map((m, i) => {
            const act = getActivity(i);
            const style = ACTIVITY_STYLES[act];
            return (
              <div
                key={i}
                title={`${m}: ${t(style.key)}`}
                style={{
                  flex: 1, height: '28px', borderRadius: '4px',
                  backgroundColor: style.bg,
                  opacity: act === 'rest' ? 0.3 : 0.9,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.6rem', color: act === 'rest' ? 'transparent' : '#000',
                  fontWeight: 700, transition: 'opacity 0.2s'
                }}
              >
                {style.emoji}
              </div>
            );
          })}
        </div>

        {open ? <ChevronUp size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />}
      </div>

      {/* Expanded Details */}
      {open && (
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-bg-elevated)', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Month Labels */}
          <div style={{ flex: '2 1 300px' }}>
            <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
              {MONTHS.map((m, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{m}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {Object.entries(ACTIVITY_STYLES).filter(([k]) => k !== 'rest').map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '3px', backgroundColor: val.bg }} />
                  {t(val.key)}
                </div>
              ))}
            </div>
          </div>
          
          {/* Tips */}
          <div style={{ flex: '1 1 250px' }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>💡 {t('expert_tips')}</p>
            <ul style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {crop.tips.map((tip, i) => (
                <li key={i} style={{ fontSize: '0.825rem', lineHeight: 1.5, color: 'var(--color-text-muted)' }}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CropCalendar() {
  const { t } = useTranslation();
  const currentMonth = new Date().getMonth();

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
          <CalendarDays size={28} />
          <h1 className="title-glow" style={{ fontSize: '2.25rem', margin: 0 }}>{t('calendar_title')}</h1>
        </div>
        <p className="subtitle">{t('calendar_subtitle')}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-primary-dim)', color: 'var(--color-primary)', padding: '0.35rem 1rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Sun size={14} /> {t('current_month')}: {MONTHS[currentMonth]}
        </div>
      </div>

      {/* Month Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', paddingLeft: '3.5rem', paddingRight: '2.5rem' }}>
        <div style={{ flex: 1, color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('calendar_crop_label')}</div>
        <div style={{ flex: 2, display: 'flex' }}>
          {MONTHS.map((m, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center', fontSize: '0.7rem', fontWeight: i === currentMonth ? 700 : 400,
              color: i === currentMonth ? 'var(--color-primary)' : 'var(--color-text-muted)',
              position: 'relative'
            }}>
              {m}
              {i === currentMonth && (
                <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Crop Rows */}
      <div style={{ marginTop: '1rem' }}>
        {CROPS.map(crop => <CropRow key={crop.name} crop={crop} />)}
      </div>

      <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        {t('calendar_footer')}
      </p>
    </div>
  );
}
