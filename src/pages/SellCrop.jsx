import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Leaf, Upload, Loader2 } from 'lucide-react';

export default function SellCrop() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    crop_name: '',
    price: '',
    quantity: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to sell crops.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error: dbError } = await supabase
        .from('crops')
        .insert([{
          farmer_id: user.id,
          ...formData,
          status: 'available'
        }]);
        
      if (dbError) throw dbError;
      
      // Navigate back to marketplace on success
      navigate('/marketplace');
    } catch (err) {
      console.error('Upload error:', err);
      // For demo purposes, fallback to local storage
      const newCrop = { 
        id: 'mock-' + Date.now(), 
        farmer_id: user.id, 
        ...formData, 
        status: 'available', 
        users: { name: user?.user_metadata?.name || user.email?.split('@')[0] || 'Local Farmer' } 
      };
      const localCrops = JSON.parse(localStorage.getItem('agri_local_crops') || '[]');
      localStorage.setItem('agri_local_crops', JSON.stringify([newCrop, ...localCrops]));

      setTimeout(() => {
        navigate('/marketplace');
      }, 1000);
    } finally {
      if (!error) setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '600px' }}>
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-dim)', borderRadius: 'var(--radius-md)' }}>
            <Leaf size={32} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h1 className="title-glow" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>List Your Crop</h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Add details about your produce for buyers to see.</p>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--color-danger-dim)', color: 'var(--color-danger)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label className="input-label">Crop Name</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Organic Wheat" 
              value={formData.crop_name}
              onChange={(e) => setFormData({...formData, crop_name: e.target.value})}
              required 
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="input-label">Price (per kg)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>₹</span>
                <input 
                  type="number" 
                  className="input-field" 
                  style={{ paddingLeft: '2rem' }} 
                  placeholder="0.00" 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="input-label">Total Quantity</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. 500 kg" 
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="input-label">Description</label>
            <textarea 
              className="input-field" 
              rows="4" 
              placeholder="Describe the quality, harvest date, and any other details..." 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required 
            />
          </div>
          
          <div>
            <label className="input-label">Upload Images (Optional)</label>
            <div style={{ border: '2px dashed var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s ease' }}
                 onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                 onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--color-bg-elevated)'}>
              <Upload size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem auto' }} />
              <p style={{ color: 'var(--color-text-main)', fontWeight: 500, margin: '0 0 0.25rem 0' }}>Click or drag images to upload</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0 }}>SVG, PNG, JPG or GIF (max. 800x400px)</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/marketplace')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'List on Marketplace'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
