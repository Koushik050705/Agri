import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, MapPin, Phone, Mail, Award, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) {
    return (
      <div className="container mt-4 text-center">
        <h2 className="title-glow">Access Denied</h2>
        <p className="subtitle" style={{ margin: '0 auto' }}>Please log in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 1.5rem' }}>
      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid var(--color-bg-elevated)', paddingBottom: '2rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--color-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-primary)' }}>
            <User size={48} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>{profile?.name || 'User Profile'}</h1>
              <span style={{ padding: '0.25rem 1rem', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-primary-dim)', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                {profile?.role || 'Guest'}
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', marginTop: '0.5rem' }}>View and manage your account details.</p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          
          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
              <Phone size={18} /> <span style={{ fontWeight: 500 }}>Mobile Number</span>
            </div>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{profile?.mobile || user.phone || 'Not set'}</p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
              <MapPin size={18} /> <span style={{ fontWeight: 500 }}>Primary Address</span>
            </div>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{profile?.address || 'Not set'}</p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
              <Mail size={18} /> <span style={{ fontWeight: 500 }}>Email Address</span>
            </div>
            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{profile?.email || 'No email provided'}</p>
          </div>

          {profile?.role === 'farmer' && (
            <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-primary-dim)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>
                <Award size={18} /> <span style={{ fontWeight: 500 }}>Farmer Stats</span>
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>Verified Seller</p>
            </div>
          )}
          
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn-secondary" onClick={signOut} style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger-dim)' }}>
            Log Out Account
          </button>
        </div>

      </div>
    </div>
  );
}
