import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Leaf, User, LogOut, ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'hi', flag: '🇮🇳', label: 'हिंदी' },
  { code: 'te', flag: '🇮🇳', label: 'తెలుగు' },
  { code: 'ta', flag: '🇮🇳', label: 'தமிழ்' },
  { code: 'bn', flag: '🇮🇳', label: 'বাংলা' },
  { code: 'mr', flag: '🇮🇳', label: 'मराठी' },
  { code: 'kn', flag: '🇮🇳', label: 'ಕನ್ನಡ' },
  { code: 'ml', flag: '🇮🇳', label: 'മലയാളം' },
  { code: 'pa', flag: '🇮🇳', label: 'ਪੰਜਾਬੀ' },
  { code: 'gu', flag: '🇮🇳', label: 'ગુજરાતી' },
  { code: 'or', flag: '🇮🇳', label: 'ଓଡ଼ିଆ' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <nav style={{
      height: 'var(--nav-height)',
      background: 'linear-gradient(to bottom, rgba(7, 9, 8, 0.98) 0%, rgba(7, 9, 8, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0, 200, 83, 0.2)',
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      fontFamily: 'var(--font-heading)'
    }}>
      <div className="container flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
          <Leaf size={30} />
          <span style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px' }}>AgriVision</span>
        </Link>
        
        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/marketplace" style={{ fontWeight: 600, fontSize: '1.05rem' }}>{t('marketplace')}</Link>
          <Link to="/agritech" style={{ fontWeight: 600, fontSize: '1.05rem' }}>{t('scanner')}</Link>
          <Link to="/calendar" style={{ fontWeight: 600, fontSize: '1.05rem' }}>🌱 Calendar</Link>
          <Link to="/services" style={{ fontWeight: 600, fontSize: '1.05rem' }}>{t('services')}</Link>
          
          {/* Beautiful Language Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                background: 'rgba(0, 200, 83, 0.08)',
                border: '1px solid rgba(0, 200, 83, 0.25)',
                borderRadius: '20px',
                color: 'var(--color-text-main)',
                cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(0,200,83,0.15)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(0,200,83,0.08)'}
            >
              <span style={{ fontSize: '1rem' }}>{currentLang.flag}</span>
              <span>{currentLang.label.split(' ')[0]}</span>
              <ChevronDown size={13} style={{ opacity: 0.7 }} />
            </button>

            {langOpen && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 0.6rem)', right: 0,
                  background: 'rgba(14, 14, 20, 0.97)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0,200,83,0.2)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                  minWidth: '155px',
                  zIndex: 100,
                  animation: 'fadeIn 0.15s ease'
                }}
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.7rem',
                      width: '100%', padding: '0.65rem 1rem',
                      background: i18n.language === lang.code ? 'rgba(0,200,83,0.12)' : 'transparent',
                      border: 'none',
                      borderLeft: i18n.language === lang.code ? '2px solid var(--color-primary)' : '2px solid transparent',
                      color: i18n.language === lang.code ? 'var(--color-primary)' : 'var(--color-text-main)',
                      cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, textAlign: 'left',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={e => { if (i18n.language !== lang.code) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseOut={e => { if (i18n.language !== lang.code) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {i18n.language === lang.code && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--color-primary)' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/dashboard" className="btn-secondary" style={{ padding: '0.4rem 1.1rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <User size={16} />
                {t('dashboard')}
              </Link>
              <button onClick={handleSignOut} className="btn-secondary" style={{ padding: '0.4rem', borderColor: 'var(--color-danger-dim)', color: 'var(--color-danger)' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/auth/login" className="btn-secondary" style={{ padding: '0.45rem 1.1rem' }}>{t('login')}</Link>
              <Link to="/auth/signup" className="btn-primary" style={{ padding: '0.45rem 1.1rem' }}>{t('signup')}</Link>
            </div>
          )}
        </div>
        
      </div>
    </nav>
  );
}
