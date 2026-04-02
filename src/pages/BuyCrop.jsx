import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, ArrowLeft, ShieldCheck, MapPin, ShoppingBag, CheckCircle, Tag, TrendingUp, Gavel, Truck, Clock } from 'lucide-react';

export default function BuyCrop() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const [bidPrice, setBidPrice] = useState('');
  const [bidQuantity, setBidQuantity] = useState('');
  const [placingBid, setPlacingBid] = useState(false);

  const isOwner = user && (user.id === crop?.farmer_id || user.id === crop?.users?.id);
  const hasWon = bids.some(b => b.buyer_id === user?.id && b.status === 'accepted');
  const cropSoldOut = crop?.status === 'sold';
  
  const localAssignments = JSON.parse(localStorage.getItem('agri_driver_assignments') || '{}');
  const assignedDriverId = localAssignments[id] || crop?.driver_id;

  // Request notification permission on component mount


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
          throw new Error("Crop not found in DB");
        }
      } catch (err) {
        // Try local storage first
        const localCrops = JSON.parse(localStorage.getItem('agri_local_crops') || '[]');
        const found = localCrops.find(c => c.id === id);
        
        if (found) {
          setCrop({ ...found, status: found.status || 'available' });
        } else {
          // Fallback mock
          setCrop({ 
            id, 
            crop_name: 'Premium Basmati Rice', 
            price: 120, 
            quantity: '2000 kg', 
            description: 'Aged basmati rice, excellent aroma.', 
            status: 'available', 
            farmer_id: 'mock-farmer',
            users: { name: 'Kartik V.', address: 'Haryana, India', mobile: '+91 9876543210' } 
          });
        }
      } finally {
        // Fetch Mock/DB Bids
        try {
          const { data: bidsData, error } = await supabase.from('bids').select('*').eq('crop_id', id).order('created_at', { ascending: false });
          if (error) throw error;
          if (bidsData) setBids(bidsData);
        } catch(e) {
          // Fallback reading from localstorage for instant testing
          const localBids = JSON.parse(localStorage.getItem(`agri_bids_${id}`) || '[]');
          setBids(localBids);
        }
        setLoading(false);
      }
    };

    fetchCrop();
  }, [id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/auth/login'); return; }
    if (!bidPrice || !bidQuantity) return;
    
    setPlacingBid(true);
    try {
      const newBid = { 
        crop_id: id, 
        buyer_id: user.id, 
        buyer_name: user?.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous Buyer',
        price_offered: Number(bidPrice), 
        quantity_requested: bidQuantity, 
        status: 'pending' 
      };
      
      const { data, error } = await supabase.from('bids').insert([newBid]).select().single();
      if (error) throw error;
      
      const savedBid = data || { ...newBid, id: Date.now(), created_at: new Date().toISOString() };
      const updatedBids = [savedBid, ...bids];
      setBids(updatedBids);
      localStorage.setItem(`agri_bids_${id}`, JSON.stringify(updatedBids));
      
      setBidPrice('');
      setBidQuantity('');
      
      // Notify Farmer
      if (crop.farmer_id) {
         await supabase.from('notifications').insert([{
            user_id: crop.farmer_id,
            message: `New public bid of ₹${bidPrice}/kg on your crop ${crop.crop_name}.`,
            type: 'bid'
         }]);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setPlacingBid(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm("Accept this offer and mark the crop as SOLD? The winning buyer will receive your contact details.")) return;
    try {
      // Opt UI
      const updatedBids = bids.map(b => b.id === bidId ? { ...b, status: 'accepted' } : b);
      setBids(updatedBids);
      setCrop({ ...crop, status: 'sold' });
      
      try {
        await supabase.from('bids').update({ status: 'accepted' }).eq('id', bidId);
        await supabase.from('crops').update({ status: 'sold' }).eq('id', id);
      } catch(e) {
        // Fallback local storage
        localStorage.setItem(`agri_bids_${id}`, JSON.stringify(updatedBids));
        // Mocking sold status for grid tests
        const globalSold = JSON.parse(localStorage.getItem('agri_sold_crops') || '[]');
        localStorage.setItem('agri_sold_crops', JSON.stringify([...globalSold, id]));
      }
      
      alert("Offer Accepted! Your crop is now marked as sold and hidden from the public marketplace grid.");
    } catch(err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}><Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-primary)' }} /></div>;
  if (!crop) return <div className="container mt-4"><h2 className="title-glow">Crop not found</h2></div>;

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
            {cropSoldOut && (
              <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: 600, textAlign: 'center', border: '1px solid rgba(239,68,68,0.3)' }}>
                This crop has been SOLD.
              </div>
            )}
            
            <h3 style={{ margin: '0 0 1.5rem 0', paddingBottom: '1rem', borderBottom: '1px solid var(--color-bg-elevated)' }}>Seller Information</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>
                {crop.users?.name?.[0] || 'F'}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{crop.users?.name}</div>
                {isOwner || hasWon ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>
                      {crop.users?.mobile}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      <MapPin size={14} /> {crop.users?.address}
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} /> 
                    {crop.users?.address?.split(',')[crop.users?.address?.split(',').length - 1] || 'Location Hidden'}
                    <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-warning)' }}>Contact revealed upon accepted bid</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Conditional Rendering: Public Board OR Logistics Tracker */}
      {cropSoldOut && (isOwner || hasWon) ? (
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={24} style={{ color: 'var(--color-primary)' }} /> Transport & Logistics Tracker
          </h2>
          
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-bg-elevated)' }}>
            
            {/* Logistics Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Order Confirmed & Payment Verified</h3>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Transport Fee (Paid by Buyer): <strong>₹850.00</strong> <br/>
                Status: {assignedDriverId ? <span style={{ color: 'var(--color-primary)' }}>Vehicle Assigned</span> : <span style={{ color: 'var(--color-warning)' }}>Awaiting Driver Assignment</span>}
              </p>
            </div>

            {/* Visual Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', margin: '0 1rem 2rem 1rem' }}>
              {/* Connecting Line */}
              <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '4px', backgroundColor: 'var(--color-bg-elevated)', zIndex: 0 }}>
                <div style={{ height: '100%', backgroundColor: 'var(--color-primary)', width: assignedDriverId ? '50%' : '15%', transition: 'width 1s ease' }}></div>
              </div>

              {/* Step 1: Accepted */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={18} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Offer Accepted</div>
              </div>

              {/* Step 2: Vehicle */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: assignedDriverId ? 'var(--color-primary)' : 'var(--color-bg-elevated)', border: assignedDriverId ? 'none' : '2px solid var(--color-primary)', color: assignedDriverId ? '#000' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {assignedDriverId ? <CheckCircle size={18} /> : <Clock size={16} />}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: assignedDriverId ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>Vehicle Assigned</div>
              </div>

              {/* Step 3: Transit */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--color-bg-elevated)', border: '2px dashed var(--color-text-muted)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={16} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>In Transit</div>
              </div>

              {/* Step 4: Delivered */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--color-bg-elevated)', border: '2px solid var(--color-text-muted)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={16} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Delivered</div>
              </div>
            </div>

            {/* Driver Details Card */}
            {assignedDriverId ? (
               <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
                 <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, fontSize: '0.95rem' }}>Transport Details</p>
                 <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                   <div>Driver: <span style={{ color: 'var(--color-text-main)' }}>AgriVision Fleet ({assignedDriverId.substring(0,4)})</span></div>
                   <div>Vehicle: <span style={{ color: 'var(--color-text-main)' }}>Tata Ace (HR 26)</span></div>
                   <div>Phone: <span style={{ color: 'var(--color-primary)' }}>+91 99999 88888</span></div>
                 </div>
               </div>
            ) : (
               <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-warning)' }}>
                 <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Our platform is automatically finding the nearest logistics partner. You will be notified the moment a driver accepts the load.</p>
               </div>
            )}

          </div>
        </div>
      ) : !cropSoldOut ? (
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Gavel size={24} style={{ color: 'var(--color-primary)' }} /> Public Offers Board</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            
            {/* Bid List */}
            <div style={{ flex: '1 1 400px' }}>
              {bids.length > 0 ? bids.map(bid => (
                <div key={bid.id} style={{ 
                  padding: '1.25rem', marginBottom: '1rem', borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-bg-dark)', border: '1px solid var(--color-bg-elevated)',
                  borderLeft: bid.status === 'accepted' ? '3px solid var(--color-primary)' : '1px solid var(--color-bg-elevated)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{bid.buyer_name}</span>
                    <div style={{ textAlign: 'right' }}>
                       <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₹{bid.price_offered}/kg</span>
                       <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>for {bid.quantity_requested}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: bid.status === 'accepted' ? 'rgba(0,200,83,0.1)' : 'rgba(255,255,255,0.05)', color: bid.status === 'accepted' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                      {bid.status === 'accepted' ? "Winning Bid" : "Pending"}
                    </span>
                    
                    {isOwner && bid.status !== 'accepted' && !cropSoldOut && (
                      <button onClick={() => handleAcceptBid(bid.id)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                        Accept Offer
                      </button>
                    )}
                    {hasWon && bid.buyer_id === user?.id && bid.status === 'accepted' && (
                      <span style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600 }}>Your offer won! Contact the seller above.</span>
                    )}
                  </div>
                </div>
              )) : (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem', backgroundColor: 'var(--color-bg-dark)', borderRadius: 'var(--radius-md)' }}>
                  No offers yet. Be the first to bid!
                </p>
              )}
            </div>
            
            {/* Place Bid Form */}
            {!isOwner && !cropSoldOut && (
              <div style={{ flex: '1 1 300px', backgroundColor: 'var(--color-bg-dark)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Place an Offer</h3>
                <form onSubmit={handlePlaceBid}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Your Price (₹/kg)</label>
                    <input type="number" required placeholder={`e.g. ${crop.price}`} className="input-field" value={bidPrice} onChange={e => setBidPrice(e.target.value)} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Quantity Needed</label>
                    <input type="text" required placeholder={`e.g. 50 kg`} className="input-field" value={bidQuantity} onChange={e => setBidQuantity(e.target.value)} />
                  </div>
                  <button type="submit" disabled={placingBid} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    {placingBid ? <Loader2 size={18} className="animate-spin" /> : <Tag size={18} />}
                    Submit Offer
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
