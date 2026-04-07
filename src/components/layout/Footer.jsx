import React from 'react';
import { Leaf, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-bg-card)',
      borderTop: '1px solid var(--color-bg-elevated)',
      padding: '4rem 0 2rem 0',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          <div>
            <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--color-primary)' }}>
              <Leaf size={24} />
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>AgriVision</span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Empowering farmers with AI-driven insights and a direct marketplace.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-text-main)', marginBottom: '1rem', fontWeight: 600 }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><a href="/marketplace" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Marketplace</a></li>
              <li><a href="/agritech" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>AI Scanner</a></li>
              <li><a href="/services" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Soil Testing</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-text-main)', marginBottom: '1rem', fontWeight: 600 }}>Connect</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <a href="tel:+918688607489" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📞 +91 86886 07489
              </a>
              <a href="mailto:adamakoushikreddy@gmail.com" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✉️ adamakoushikreddy@gmail.com
              </a>
            </div>
          </div>
          
        </div>
        
        <div style={{ borderTop: '1px solid var(--color-bg-elevated)', paddingTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} AgriVision Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
