import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, ShoppingBag, CheckCircle } from 'lucide-react';

export default function BuyCrop() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Mock fetch or real DB fetch based on initial setup state
    const fetchCrop = async () => {
      try {
        const { data, error } = await supabase
          .from('crops')
          .select('*, users(name, address, mobile)')
          .eq('id', id)
          .single();
          
        if (data) {
          setCrop(data);
        } else {
          // Fallback mock
          setCrop({ 
            id, 
            crop_name: 'Premium Basmati Rice', 
            price: 120, 
            quantity: '2000 kg', 
            description: 'Aged basmati rice, excellent aroma.', 
            status: 'available', 
            users: { name: 'Kartik V.', address: 'Haryana, India', mobile: '+91 9876543210' } 
          });
        }
      } catch (err) {
        setCrop({ 
          id, 
          crop_name: 'Premium Basmati Rice', 
          price: 120, 
          quantity: '2000 kg', 
          description: 'Aged basmati rice, excellent aroma.', 
          status: 'available', 
          users: { name: 'Kartik V.', address: 'Haryana, India', mobile: '+91 9876543210' } 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCrop();
  }, [id]);

  const handleInterest = async () => {
    if (!user) {
      navigate('/auth/login');
      return;
    }
    
    setPurchasing(true);
    
    try {
      // 1. Insert notification for the Farmer
      if (crop.farmer_id) {
         await supabase
          .from('notifications')
          .insert([{
            user_id: crop.farmer_id,
            message: `Your crop ${crop.crop_name} has a new buyer interest from ${user.phone || 'a user'}. They will contact you shortly.`,
            type: 'purchase'
          }]);
      }
      
      // Simulate network delay for effect
      setTimeout(() => {
        setPurchasing(false);
        setSuccess(true);
        // Fire push notification to the buyer's browser/mobile
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🌾 AgriVision', {
            body: `You've connected with the farmer for ${crop.crop_name}! Check the contact details below.`,
            icon: '/favicon.ico'
          });
        }
      }, 1500);
      
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setPurchasing(false);
        setSuccess(true);
      }, 1500);
    }
  };

  if (loading) return <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-primary)' }} /></div>;
  if (!crop) return <div className="container mt-4"><h2 className="title-glow">Crop not found</h2></div>;

  if (success) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '600px', textAlign: 'center' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CheckCircle size={64} style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }} />
          <h2 className="title-glow" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Farmer Notified!</h2>
          <p className="subtitle" style={{ marginBottom: '2rem' }}>
            The farmer has been alerted of your interest. You can now contact them directly using the details below to arrange payment and delivery.
          </p>
          
          <div style={{ backgroundColor: 'var(--color-bg-elevated)', padding: '1.5rem', borderRadius: 'var(--radius-md)', width: '100%', marginBottom: '2rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-text-main)' }}>Farmer Contact Details</h4>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 600 }}>{crop.users?.name}</p>
            <p style={{ margin: '0', color: 'var(--color-primary)', fontSize: '1.25rem' }}>{crop.users?.mobile}</p>
          </div>
          
          <button className="btn-primary" onClick={() => navigate('/marketplace')} style={{ width: '100%' }}>
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <button onClick={() => navigate('/marketplace')} className="btn-secondary" style={{ padding: '0.5rem 1rem', marginBottom: '2rem' }}>
        <ArrowLeft size={18} /> Back to Market
      </button>

      <div className="glass-card">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
          
          {/* Left Col - Details */}
          <div style={{ flex: '1 1 400px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', marginBottom: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>
              <ShieldCheck size={18} /> Verified Listing
            </div>
            
            <h1 className="title-glow" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{crop.crop_name}</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>{crop.description}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Price</p>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{crop.price}<span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>/kg</span></div>
              </div>
              <div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Available Quantity</p>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{crop.quantity}</div>
              </div>
            </div>
          </div>
          
          {/* Right Col - Action Box */}
          <div style={{ flex: '1 1 250px', backgroundColor: 'var(--color-bg-dark)', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-elevated)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', paddingBottom: '1rem', borderBottom: '1px solid var(--color-bg-elevated)' }}>Seller Information</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>
                {crop.users?.name?.[0] || 'F'}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{crop.users?.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {crop.users?.mobile}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  <MapPin size={14} /> {crop.users?.address}
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }} onClick={handleInterest} disabled={purchasing || success}>
                {purchasing ? <Loader2 size={20} className="animate-spin" /> : (
                  <>
                    <ShoppingBag size={20} />
                    {success ? 'Farmer Notified' : 'Notify Farmer of Interest'}
                  </>
                )}
              </button>
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '1rem' }}>
                Expressing interest will notify the farmer instantly and reveal their contact details.
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
