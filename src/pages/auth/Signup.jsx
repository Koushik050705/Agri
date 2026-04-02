import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, MapPin, Mail, Lock, Loader2, Phone } from 'lucide-react';

export default function Signup() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    address: '',
    email: '',
    password: '',
    role: 'farmer'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // 1. Create auth user
      const authData = await signUp(formData.email, formData.password);
      
      // 2. Insert public profile data
      if (authData?.session?.user || authData?.user) {
        const userId = authData?.session?.user?.id || authData?.user?.id;
        
        const { error: dbError } = await supabase
          .from('users')
          .upsert([{
            id: userId,
            name: formData.name,
            mobile: formData.mobile,
            address: formData.address,
            email: formData.email,
            role: formData.role
          }]);
          
        if (dbError) throw dbError;
        
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message || t('error_signup'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - var(--nav-height))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="glass-card" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="title-glow" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>
          {t('signup_title')}
        </h2>
        <p className="text-center mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {t('signup_desc')}
        </p>

        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-dim)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignupSubmit}>
          
          <div className="mb-4">
            <label className="input-label">{t('label_account_type')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button type="button" onClick={() => setFormData({...formData, role: 'farmer'})} 
                className={formData.role === 'farmer' ? 'btn-primary' : 'btn-secondary'}
                style={{ justifyContent: 'center', padding: '0.5rem', fontSize: '0.85rem' }}>
                {t('farmer')}
              </button>
              <button type="button" onClick={() => setFormData({...formData, role: 'buyer'})} 
                className={formData.role === 'buyer' ? 'btn-primary' : 'btn-secondary'}
                style={{ justifyContent: 'center', padding: '0.5rem', fontSize: '0.85rem' }}>
                {t('buyer')}
              </button>
              <button type="button" onClick={() => setFormData({...formData, role: 'driver'})} 
                className={formData.role === 'driver' ? 'btn-primary' : 'btn-secondary'}
                style={{ justifyContent: 'center', padding: '0.5rem', fontSize: '0.85rem' }}>
                Driver
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="input-label">{t('label_fullname')}</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" name="name" className="input-field" style={{ paddingLeft: '2.5rem' }} value={formData.name} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="input-label">{t('label_mobile')}</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="tel" name="mobile" className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="9876543210" value={formData.mobile} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="input-label">{t('label_address_primary')}</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="text" name="address" className="input-field" style={{ paddingLeft: '2.5rem' }} value={formData.address} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="mb-3">
            <label className="input-label">{t('label_email_login')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="email" name="email" className="input-field" style={{ paddingLeft: '2.5rem' }} value={formData.email} onChange={handleInputChange} required />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="input-label">{t('label_password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input type="password" name="password" className="input-field" style={{ paddingLeft: '2.5rem' }} value={formData.password} onChange={handleInputChange} required minLength={6} />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : t('btn_create_account')}
          </button>
        </form>

        <div className="mt-4 text-center" style={{ fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>{t('already_account')} </span>
          <Link to="/auth/login">{t('link_login')}</Link>
        </div>
      </div>
    </div>
  );
}
