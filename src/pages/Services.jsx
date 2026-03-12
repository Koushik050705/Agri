import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Landmark, FlaskConical, Calendar, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function Services() {
  const { t } = useTranslation();
  const [bookingState, setBookingState] = useState('idle'); // idle, submitting, success
  const [bookingDate, setBookingDate] = useState('');

  const handleBooking = (e) => {
    e.preventDefault();
    setBookingState('submitting');
    setTimeout(() => {
      setBookingState('success');
    }, 1500);
  };

  const schemes = [
    {
      title: "PM-Kisan Samman Nidhi",
      description: "Direct income support of ₹6,000 per year to all landholding farmer families.",
      link: "https://pmkisan.gov.in/"
    },
    {
      title: "Pradhan Mantri Fasal Bima Yojana",
      description: "Crop insurance scheme integrating multiple stakeholders on a single platform.",
      link: "https://pmfby.gov.in/"
    },
    {
      title: "National Agriculture Market (eNAM)",
      description: "Pan-India electronic trading portal networking existing APMC mandis.",
      link: "https://www.enam.gov.in/web/"
    },
    {
      title: "Paramparagat Krishi Vikas Yojana (PKVY)",
      description: "Promotes organic farming through a cluster approach and PGS certification.",
      link: "https://pgsindia-ncof.gov.in/pkvy"
    }
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ marginBottom: '4rem' }}>
        <h1 className="title-glow" style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{t('services_title')}</h1>
        <p className="subtitle" style={{ fontSize: '1.2rem' }}>{t('services_subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Lab Soil Test Booking */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            <FlaskConical size={28} />
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-text-main)' }}>{t('lab_test_title')}</h2>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            {t('lab_test_desc')}
          </p>

          <div style={{ marginTop: 'auto', backgroundColor: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)', padding: '1.5rem', border: '1px solid var(--color-bg-elevated)' }}>
            {bookingState === 'success' ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('booking_confirmed')}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{t('booking_desc', { date: bookingDate || 'the selected date' })}</p>
                <button className="btn-secondary mt-4" onClick={() => { setBookingState('idle'); setBookingDate(''); }}>{t('book_another')}</button>
              </div>
            ) : (
              <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="input-label">{t('label_date')}</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input 
                      type="date" 
                      className="input-field" 
                      style={{ paddingLeft: '2.5rem' }} 
                      required 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">{t('label_farm_size')}</label>
                  <input type="number" className="input-field" placeholder="e.g. 5" required />
                </div>
                <button type="submit" className="btn-primary mt-2" disabled={bookingState === 'submitting'}>
                  {bookingState === 'submitting' ? <Loader2 className="animate-spin" size={20} /> : t('btn_book_agent')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Government Schemes */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            <Landmark size={28} />
            <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--color-text-main)' }}>{t('govt_schemes_title')}</h2>
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
            {t('govt_schemes_desc')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem', maxHeight: '400px' }}>
            {schemes.map((scheme, index) => (
              <a 
                key={index}
                href={scheme.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  display: 'block', 
                  padding: '1.25rem', 
                  backgroundColor: 'var(--color-bg-dark)', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--color-bg-elevated)',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary-dim)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-bg-elevated)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', margin: 0, color: 'var(--color-text-main)', fontWeight: 600 }}>{scheme.title}</h3>
                  <ArrowRight size={16} style={{ color: 'var(--color-primary)' }} />
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {scheme.description}
                </p>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
