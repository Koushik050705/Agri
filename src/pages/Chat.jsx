import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Send, ArrowLeft, User, Bot, Loader2 } from 'lucide-react';

export default function Chat() {
  const { farmerId, cropId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [cropName, setCropName] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    if (!user) { navigate('/auth/login'); return; }

    // Fetch partner profile and crop info
    const init = async () => {
      const { data: partner } = await supabase
        .from('users').select('name, mobile').eq('id', farmerId).single();
      if (partner) setPartnerProfile(partner);

      if (cropId) {
        const { data: crop } = await supabase
          .from('crops').select('crop_name').eq('id', cropId).single();
        if (crop) setCropName(crop.crop_name);
      }

      // Load existing messages between the two users for this crop
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('crop_id', cropId || null)
        .order('created_at', { ascending: true });
      if (msgs) setMessages(msgs);
      setLoading(false);
    };

    init();

    // Realtime subscription for new messages
    const channel = supabase
      .channel(`chat-${cropId}-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          if (
            (msg.sender_id === user.id || msg.receiver_id === user.id) &&
            msg.crop_id === cropId
          ) {
            setMessages(prev => {
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user, farmerId, cropId, navigate]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const content = input.trim();
    setInput('');

    // Optimistically add to list
    const tempMsg = {
      id: 'temp-' + Date.now(),
      sender_id: user.id,
      receiver_id: farmerId,
      crop_id: cropId,
      content,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await supabase.from('messages').insert([{
        sender_id: user.id,
        receiver_id: farmerId,
        crop_id: cropId,
        content
      }]);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const groupMessages = () => {
    const groups = [];
    messages.forEach((msg, i) => {
      const prev = messages[i - 1];
      const sameDay = prev && new Date(prev.created_at).toDateString() === new Date(msg.created_at).toDateString();
      if (!sameDay) {
        groups.push({ type: 'date', date: msg.created_at });
      }
      groups.push({ type: 'msg', ...msg });
    });
    return groups;
  };

  return (
    <div style={{ height: 'calc(100vh - var(--nav-height))', display: 'flex', flexDirection: 'column', maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem' }}>
      
      {/* Chat Header */}
      <div style={{
        padding: '1rem 0', borderBottom: '1px solid var(--color-bg-elevated)',
        display: 'flex', alignItems: 'center', gap: '1rem'
      }}>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '0.4rem' }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary-dim), rgba(0,200,83,0.3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <User size={22} style={{ color: 'var(--color-primary)' }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{partnerProfile?.name || 'Loading...'}</div>
          {cropName && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Re: {cropName} 🌾</div>}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block' }}></span>
          Direct Line
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
            <Bot size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>No messages yet. Say hello to start negotiating!</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              {['Hi! Is this still available?', 'Can you reduce the price?', 'How can I arrange pickup?'].map(s => (
                <button key={s} onClick={() => setInput(s)} style={{
                  padding: '0.4rem 0.8rem', fontSize: '0.8rem',
                  background: 'rgba(0,200,83,0.08)', border: '1px solid rgba(0,200,83,0.25)',
                  borderRadius: '20px', color: 'var(--color-primary)', cursor: 'pointer'
                }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          groupMessages().map((item, idx) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${idx}`} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0.75rem 0' }}>
                  {new Date(item.date).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              );
            }
            const isMe = item.sender_id === user?.id;
            return (
              <div key={item.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%', padding: '0.75rem 1.1rem',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe
                    ? 'linear-gradient(135deg, var(--color-primary), #00c853)'
                    : 'rgba(255,255,255,0.07)',
                  color: isMe ? '#000' : 'var(--color-text-main)',
                  fontSize: '0.9rem', lineHeight: 1.5,
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div>{item.content}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.3rem', textAlign: 'right' }}>
                    {new Date(item.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} style={{ padding: '1rem 0', borderTop: '1px solid var(--color-bg-elevated)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, borderRadius: '24px', padding: '0.75rem 1.25rem' }}
        />
        <button type="submit" disabled={sending || !input.trim()} style={{
          width: '46px', height: '46px', borderRadius: '50%',
          background: input.trim() ? 'linear-gradient(135deg, var(--color-primary), #00c853)' : 'rgba(255,255,255,0.1)',
          border: 'none', color: input.trim() ? '#000' : 'var(--color-text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: input.trim() ? 'pointer' : 'default', transition: 'all 0.2s', flexShrink: 0
        }}>
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
