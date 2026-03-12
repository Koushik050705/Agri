import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, Filter, ShoppingCart, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Marketplace() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fallback mock data if Supabase isn't seeded yet
  const mockCrops = [
    { id: '1', crop_name: 'Organic Tomatoes', price: 45, quantity: '500 kg', description: 'Fresh, pesticide-free tomatoes ready for transit.', status: 'available', users: { name: 'Ramesh Singh', address: 'Punjab, India' } },
    { id: '2', crop_name: 'Premium Basmati Rice', price: 120, quantity: '2000 kg', description: 'Aged basmati rice, excellent aroma.', status: 'available', users: { name: 'Kartik V.', address: 'Haryana, India' } },
    { id: '3', crop_name: 'Kashmiri Apples', price: 150, quantity: '300 kg', description: 'Freshly harvested apples from the valley.', status: 'available', users: { name: 'Abdul Rasheed', address: 'Srinagar, J&K' } }
  ];

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const { data, error } = await supabase
          .from('crops')
          .select(`*, users(name, address)`)
          .eq('status', 'available');
          
        if (error) throw error;
        
        setCrops(data && data.length > 0 ? data : mockCrops);
      } catch (err) {
        console.error('Error fetching crops:', err);
        setCrops(mockCrops); // Fallback on error
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  const filteredCrops = crops.filter(c => c.crop_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      
      {/* Header Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        <div>
          <h1 className="title-glow" style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{t('market_title')}</h1>
          <p className="subtitle" style={{ fontSize: '1.2rem' }}>{t('market_subtitle')}</p>
        </div>
        
        {/* Controls */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flex: '1 1 100%', minWidth: '200px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ paddingLeft: '2.75rem' }} 
                placeholder={t('search_placeholder')} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-secondary" style={{ padding: '0 1rem', width: 'auto' }}>
              <Filter size={18} /> {t('filters')}
            </button>
          </div>
          
          <Link to="/marketplace/sell" className="btn-primary" style={{ flex: '1 1 auto', justifyContent: 'center' }}>
            <Leaf size={18} /> {t('sell_crop')}
          </Link>
          
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {filteredCrops.map(crop => (
            <div key={crop.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {/* Image Placeholder */}
              <div style={{ height: '200px', backgroundColor: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Leaf size={48} style={{ color: 'var(--color-primary-dim)' }} />
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'var(--color-primary)', color: '#000', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-pill)', fontSize: '0.875rem', fontWeight: 600 }}>
                  {t('status_available')}
                </div>
              </div>
              
              {/* Content */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{crop.crop_name}</h3>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{crop.price}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>per kg</div>
                  </div>
                </div>
                
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1 }}>
                  {crop.description}
                </p>
                
                <div style={{ borderTop: '1px solid var(--color-bg-elevated)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('quantity')}:</span>
                    <span style={{ fontWeight: 500 }}>{crop.quantity}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{t('farmer')}:</span>
                    <span style={{ fontWeight: 500 }}>{crop.users?.name || 'Unknown'} ({crop.users?.address || 'N/A'})</span>
                  </div>
                </div>
                
                <Link to={`/marketplace/buy/${crop.id}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <ShoppingCart size={18} /> {t('contact_buy')}
                </Link>
              </div>
            </div>
          ))}

          {filteredCrops.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
              {t('no_crops')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
