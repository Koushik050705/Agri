import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import {
  Leaf, ShoppingBag, FlaskConical, Landmark, Bot, CloudRain,
  LogOut, User, Bell, TrendingUp, ArrowRight, ShieldCheck, Package
} from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [recentCrops, setRecentCrops] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [newNotif, setNewNotif] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth/login'); return; }

    const fetchData = async () => {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('users').select('*').eq('id', user.id).single();
      if (profileData) setProfile(profileData);

      // Fetch recent crops (for buyers) or own crops (for farmers)
      const { data: cropsData } = await supabase
        .from('crops').select('*')
        .order('created_at', { ascending: false }).limit(3);
      if (cropsData) setRecentCrops(cropsData);

      try {
        const { data: myCropsData, error } = await supabase
          .from('crops').select('*').eq('farmer_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        if (myCropsData && myCropsData.length > 0) {
           setMyListings(myCropsData);
        } else {
           throw new Error("Empty DB");
        }
      } catch (err) {
        const localCrops = JSON.parse(localStorage.getItem('agri_local_crops') || '[]');
        setMyListings(localCrops.filter(c => c.farmer_id === user.id));
      }

      // Fetch notifications
      const { data: notifData } = await supabase
        .from('notifications').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(5);
      if (notifData) setNotifications(notifData);
    };

    fetchData();

    // Supabase Realtime: listen for new notifications for this user (farmer)
    const channel = supabase
      .channel('notifications-' + user.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          // Prepend new notification to the list
          setNotifications(prev => [payload.new, ...prev]);
          setNewNotif(true);
          // Optional: browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🌾 AgriVision — New Alert', {
              body: payload.new.message,
              icon: '/favicon.ico'
            });
          }
          // Auto-clear the badge flash after 5s
          setTimeout(() => setNewNotif(false), 5000);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, navigate]);

  const displayName = profile?.name || 'Valued Member';
  const role = profile?.role || 'farmer';
  const quickLinks = role === 'farmer' ? farmerCards : buyerCards;

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: '2rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 500 }}>{t('welcome')},</p>
          <h1 className="title-glow" style={{ 
            fontSize: '3.5rem', 
            margin: 0, 
            background: 'linear-gradient(45deg, var(--color-primary), #fff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 10px 30px rgba(74, 222, 128, 0.3)'
          }}>{displayName}</h1>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-primary-dim)', color: 'var(--color-primary)', padding: '0.35rem 1rem', borderRadius: 'var(--radius-pill)', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.75rem', border: '1px solid rgba(74, 222, 128, 0.2)', textTransform: 'capitalize' }}>
            <ShieldCheck size={16} /> {role}
          </span>
        </div>
        <button onClick={async () => { await signOut(); navigate('/'); }} className="btn-secondary" style={{ display: 'flex', gap: '0.5rem' }}>
          <LogOut size={18} /> {t('logout')}
        </button>
      </div>

      {/* Quick Actions Grid */}
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{t('dashboard_quick_actions')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {quickLinks.map((card, index) => (
          <Link 
            key={index} 
            to={card.link} 
            className="glass-card nav-portal" 
            style={{ 
              textDecoration: 'none',
              padding: '2rem'
            }}
          >
            <div className="portal-icon" style={{ marginBottom: '1.25rem' }}>{card.icon}</div>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{card.label}</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{card.desc}</p>
            <div className="portal-cta" style={{ fontSize: '0.95rem' }}>Go to {card.label} <ArrowRight size={16} /></div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>

        {/* Main Panel Content via Role */}
        {role === 'buyer' && (
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={20} style={{ color: 'var(--color-primary)' }} /> {t('dash_recent_listings')}</h2>
              <Link to="/marketplace" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                {t('view_all')} <ArrowRight size={16} />
              </Link>
            </div>
            {recentCrops.length > 0 ? recentCrops.map(c => (
              <Link key={c.id} to={`/marketplace/buy/${c.id}`} style={{ textDecoration: 'none', display: 'block', padding: '0.75rem', marginBottom: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-elevated)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{c.crop_name}</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{c.price}/kg</span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{c.quantity} available</div>
              </Link>
            )) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>No listings available.</p>
            )}
          </div>
        )}

        {role === 'farmer' && (
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={20} style={{ color: 'var(--color-primary)' }} /> My Active Listings</h2>
              <Link to="/marketplace/sell" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                Add New <ArrowRight size={16} />
              </Link>
            </div>
            {myListings.length > 0 ? myListings.map(c => (
              <Link key={c.id} to={`/marketplace/buy/${c.id}`} style={{ textDecoration: 'none', display: 'block', padding: '1rem', marginBottom: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-elevated)', borderLeft: c.status === 'sold' ? '3px solid var(--color-danger)' : '3px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{c.crop_name}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '12px', backgroundColor: c.status === 'sold' ? 'rgba(239,68,68,0.2)' : 'rgba(0,200,83,0.1)', color: c.status === 'sold' ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                    {c.status === 'sold' ? 'Sold' : 'Active'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <span>{c.quantity}</span>
                  <span style={{ fontWeight: 600 }}>₹{c.price}/kg</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Click to view bids <ArrowRight size={12} />
                </div>
              </Link>
            )) : (
              <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem 0' }}>You haven't listed any crops yet. <Link to="/marketplace/sell">Start selling.</Link></p>
            )}
          </div>
        )}

        {/* Notifications Panel */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Bell size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{t('notifications')}</h2>
            {notifications.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                backgroundColor: newNotif ? 'var(--color-danger)' : 'var(--color-primary)',
                color: '#000', fontSize: '0.75rem', fontWeight: 700,
                borderRadius: '50%', width: '22px', height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: newNotif ? 'pulse 1s infinite' : 'none'
              }}>
                {notifications.length}
              </span>
            )}
          </div>
          {notifications.length > 0 ? notifications.map((n, i) => (
            <div key={i} style={{ padding: '0.75rem', marginBottom: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-elevated)', borderLeft: '3px solid var(--color-primary)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>{n.message}</p>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
              <Bell size={36} style={{ marginBottom: '1rem', opacity: 0.4 }} />
              <p style={{ margin: 0 }}>{t('no_notifs')}</p>
            </div>
          )}
        </div>

      </div>

      {/* Profile Details Footer */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} style={{ color: 'var(--color-primary)' }} /> {t('account_details')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: t('label_name'), value: profile?.name || '—' },
            { label: t('label_mobile'), value: profile?.mobile || '—' },
            { label: t('label_email'), value: profile?.email || user?.email || '—' },
            { label: t('label_address'), value: profile?.address || '—' },
          ].map((item, i) => (
            <div key={i}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
