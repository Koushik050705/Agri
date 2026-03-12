import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Leaf, Shield, TrendingUp, CloudRain } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-primary-dim)', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '2rem' }}>
          <Leaf size={16} /> {t('home_hero_badge')}
        </div>
        
        <h1 className="title-glow" style={{ fontSize: '4rem', maxWidth: '900px', margin: '0 auto 1.5rem auto' }}>
          {t('greeting')}
        </h1>
        
        <p className="subtitle" style={{ margin: '0 auto 3.5rem auto', fontSize: '1.25rem', fontWeight: 500 }}>
          {t('home_hero_subtitle')}
        </p>

        <div className="flex items-center gap-4" style={{ justifyContent: 'center' }}>
          <Link to="/auth/signup" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            {t('get_started')} <ArrowRight size={20} />
          </Link>
          <Link to="/marketplace" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            {t('view_marketplace')}
          </Link>
        </div>
      </section>

      {/* Features Navigation Hub */}
      <section className="container" style={{ padding: '4rem 1.5rem 8rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          
          <Link to="/marketplace" className="glass-card nav-portal" style={{ textDecoration: 'none', padding: '2.5rem' }}>
            <div className="portal-icon"><TrendingUp size={40} /></div>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text-main)' }}>{t('portal_market_title')}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>{t('portal_market_desc')}</p>
            <div className="portal-cta">{t('portal_cta_market')} <ArrowRight size={18} /></div>
          </Link>

          <Link to="/agritech" className="glass-card nav-portal" style={{ textDecoration: 'none', padding: '2.5rem' }}>
            <div className="portal-icon"><Shield size={40} /></div>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text-main)' }}>{t('portal_scanner_title')}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>{t('portal_scanner_desc')}</p>
            <div className="portal-cta">{t('portal_cta_scanner')} <ArrowRight size={18} /></div>
          </Link>

          <Link to="/services" className="glass-card nav-portal" style={{ textDecoration: 'none', padding: '2.5rem' }}>
            <div className="portal-icon"><CloudRain size={40} /></div>
            <h3 style={{ fontSize: '1.65rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--color-text-main)' }}>{t('portal_weather_title')}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>{t('portal_weather_desc')}</p>
            <div className="portal-cta">{t('portal_cta_weather')} <ArrowRight size={18} /></div>
          </Link>

        </div>
      </section>
    </div>
  );
}
