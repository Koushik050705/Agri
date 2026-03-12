import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, ChevronDown, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳', short: 'HI' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳', short: 'TE' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳', short: 'TA' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳', short: 'BN' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳', short: 'MR' },
  { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳', short: 'KN' },
  { code: 'ml', label: 'മലയാളം', flag: '🇮🇳', short: 'ML' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳', short: 'PA' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳', short: 'GU' },
  { code: 'or', label: 'ଓଡ଼ିଆ', flag: '🇮🇳', short: 'OR' },
];

// Realistic knowledge base for the chatbot
const KB = {
  en: [
    { patterns: ['sell', 'upload crop', 'list crop', 'how to sell'], response: "To sell your crop: 1) Go to the **Marketplace** tab. 2) Click **'Sell Your Crop'**. 3) Fill in crop name, price per kg, quantity, and a description. 4) Submit — your crop goes live immediately for buyers to see!" },
    { patterns: ['buy', 'purchase', 'how to buy', 'contact farmer'], response: "To buy a crop: 1) Browse the **Marketplace**. 2) Click on any crop listing. 3) Hit **'Buy Now'** — this sends an instant notification to the farmer and reveals their direct contact number so you can arrange pickup/delivery yourself." },
    { patterns: ['disease', 'scan', 'scanner', 'leaf', 'plant sick', 'fungal', 'pest'], response: "Our **AI Disease Scanner** supports 50+ crop diseases. Go to **Scanner & AI** and upload a clear photo of a crop leaf or soil. The AI will:\n- Validate the image is agricultural\n- Identify the crop type\n- Detect any diseases with a confidence score\n- Recommend specific pesticides or treatments" },
    { patterns: ['weather', 'rain', 'temperature', 'forecast', 'humidity'], response: "The **Live Weather** section (under Scanner & AI) gives you real-time data including temperature, humidity, wind speed, UV index, and a 3-day forecast. It also auto-detects your location! High humidity alerts help you protect crops from fungal diseases." },
    { patterns: ['scheme', 'government', 'pm kisan', 'subsidy', 'yojana'], response: "Under **Services → Government Schemes**, you'll find schemes like:\n- **PM-Kisan**: ₹6,000/year direct income\n- **PM Fasal Bima**: Crop insurance\n- **eNAM**: Digital mandi access\n- **PKVY**: Organic farming support\n\nClick any scheme to visit the official portal." },
    { patterns: ['soil', 'test', 'lab', 'booking', 'sample'], response: "Book a **Lab Soil Test** from the Services page! Enter your preferred date and farm size. A certified collection agent will contact you to collect soil samples, then send back a detailed NPK report with fertilizer recommendations." },
    { patterns: ['notification', 'alert', 'message'], response: "Farmers receive instant notifications when a buyer expresses interest in their crop. Buyers also get a browser notification the moment they connect with a farmer. Check your **Dashboard** for the Notifications panel." },
    { patterns: ['profile', 'account', 'dashboard'], response: "Your **Dashboard** shows your role (Farmer/Buyer), recent marketplace listings, notifications, and quick action shortcuts based on your role. Access it from the top navbar." },
    { patterns: ['crop recommend', 'what to grow', 'suggest crop'], response: "The **Smart Recommender** (in Scanner & AI) helps you decide what to grow. Enter:\n- Your soil type (e.g. Loamy, Sandy, Clay)\n- Average rainfall (mm/year)\n\nAnd get a curated list of high-yield crop suggestions for your region." },
    { patterns: ['hello', 'hi', 'help', 'start'], response: null }, // Handled by chat_greeting
  ],
  hi: [
    { patterns: ['बेच', 'फसल बेचना', 'अपलोड'], response: "फसल बेचने के लिए: 1) **मार्केटप्लेस** टैब पर जाएं। 2) **'अपनी फसल बेचें'** पर क्लिक करें। 3) फसल का नाम, कीमत, मात्रा भरें। 4) सबमिट करें — आपकी फसल तुरंत खरीदारों को दिखेगी!" },
    { patterns: ['खरीद', 'संपर्क'], response: "फसल खरीदने के लिए: 1) **मार्केटप्लेस** में जाएं। 2) किसी भी लिस्टिंग पर क्लिक करें। 3) **'अभी खरीदें'** दबाएं — किसान को तुरंत सूचना जाएगी और उनका नंबर मिलेगा।" },
    { patterns: ['बीमारी', 'रोग', 'स्कैन'], response: "AI स्कैनर 50+ फसल रोग पहचानता है। **स्कैनर और एआई** में जाएं और पत्ते की फोटो अपलोड करें। AI रोग की पहचान करेगा और उपाय बताएगा।" },
    { patterns: ['मौसम', 'बारिश', 'तापमान'], response: "**लाइव मौसम** सेक्शन में आपके स्थान का मौसम, तापमान, नमी, और 3 दिन का पूर्वानुमान देखें।" },
    { patterns: ['योजना', 'सरकारी', 'पीएम किसान'], response: "**सेवाएं → सरकारी योजनाएं** में PM किसान जैसी योजनाओं की जानकारी पाएं। PM किसान से ₹6,000/वर्ष मिलता है!" },
  ],
  te: [
    { patterns: ['అమ్మ', 'పంట', 'అప్లోడ్'], response: "పంట అమ్మడానికి: 1) **మార్కెట్‌ప్లేస్**కు వెళ్ళండి. 2) **'పంటను అమ్మండి'** నొక్కండి. 3) పంట వివరాలు నమోదు చేయండి. అంతే — మీ పంట వెంటనే కొనుగోలుదారులకు కనిపిస్తుంది!" },
    { patterns: ['కొన', 'సంప్రదించ'], response: "పంట కొనడానికి: మార్కెట్‌ప్లేస్‌లో పంటలు చూసి **'ఇప్పుడే కొనండి'** నొక్కండి. రైతుకు నోటిఫికేషన్ వెంటనే వస్తుంది!" },
    { patterns: ['వ్యాధి', 'స్కాన్'], response: "AI స్కానర్ 50+ పంట వ్యాధులను గుర్తిస్తుంది. **స్కానర్ & AI** తాబులో ఆకు ఫోటో అప్లోడ్ చేయండి." },
    { patterns: ['వాతావరణం', 'వర్షం'], response: "**స్కానర్ & AI** పేజీలో ప్రత్యక్ష వాతావరణ సమాచారం — ఉష్ణోగ్రత, తేమ, మరియు 3-రోజుల అంచనా చూడండి." },
  ],
  ta: [
    { patterns: ['விற்', 'பயிர்', 'பதிவேற்'], response: "பயிரை விற்க: 1) **சந்தை** தாவலுக்கு சென்று 2) **'பயிரை விற்கவும்'** என்பதை கிளிக் செய்யுங்கள். 3) விவரங்களை பதிவு செய்யுங்கள் — உங்கள் பயிர் உடனடியாக காட்டப்படும்!" },
    { patterns: ['வாங்', 'தொடர்பு'], response: "பயிர் வாங்க: சந்தையில் உலாவி **'இப்போது வாங்கு'** என்பதை கிளிக் செய்யுங்கள். விவசாயிக்கு உடனே அறிவிப்பு வரும்!" },
    { patterns: ['நோய்', 'ஸ்கேன்'], response: "AI ஸ்கேனர் 50+ பயிர் நோய்களை கண்டறியும். **ஸ்கேனர் & AI** தாவலில் இலையின் புகைப்படம் பதிவேற்றுங்கள்." },
    { patterns: ['வானிலை', 'மழை'], response: "**ஸ்கேனர் & AI** பக்கத்தில் நேரடி வானிலை தகவல் — வெப்பநிலை, ஈரப்பதம் மற்றும் 3 நாள் முன்னறிவிப்பு பாருங்கள்." },
  ],
};

// Map i18n codes to Speech API lang tags
const LANG_MAP = {
  en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN',
  bn: 'bn-IN', mr: 'mr-IN', kn: 'kn-IN', ml: 'ml-IN',
  pa: 'pa-IN', gu: 'gu-IN', or: 'or-IN'
};

function getBotResponse(text, lang) {
  const lower = text.toLowerCase();
  const langKB = KB[lang] || KB.en;
  
  for (const entry of langKB) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return entry.response;
    }
  }
  // Fallback to English knowledge base
  for (const entry of KB.en) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return entry.response;
    }
  }
  return null; // Will use i18n chat_default
}

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: null, sender: 'bot', key: 'chat_greeting' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, ''));
    utterance.lang = LANG_MAP[i18n.language] || 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[i18n.language] || 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    recognition.start();
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    const rawResponse = getBotResponse(currentInput, i18n.language);
    
    setTimeout(() => {
      const botText = rawResponse || t('chat_default');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: rawResponse || null,
        sender: 'bot',
        key: rawResponse ? null : 'chat_default'
      }]);
      speak(botText);
    }, 700);
  };

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('toggle-chatbot', handleToggle);
    window.addEventListener('open-chatbot', handleOpen);
    return () => {
      window.removeEventListener('toggle-chatbot', handleToggle);
      window.removeEventListener('open-chatbot', handleOpen);
    };
  }, []);

  const switchLanguage = (code) => {
    i18n.changeLanguage(code);
    setLangMenuOpen(false);
    setMessages([{ id: Date.now(), text: null, sender: 'bot', key: 'chat_greeting' }]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), #22c55e)',
          color: '#000', display: isOpen ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)',
          zIndex: 1000, transition: 'transform 0.2s, box-shadow 0.2s',
          border: 'none', cursor: 'pointer'
        }}
        onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 0 45px rgba(0,200,83,0.6)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 200, 83, 0.4)'; }}
        title="AgriVision Assistant"
      >
        <MessageSquare size={26} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: '370px', height: '540px',
          background: 'rgba(16, 16, 20, 0.97)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,200,83,0.15)',
          border: '1px solid rgba(0,200,83,0.2)',
          display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden'
        }}>
          
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(74, 222, 128, 0.05))',
            borderBottom: '1px solid rgba(74, 222, 128, 0.15)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} style={{ color: '#000' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>AgriBot</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'inline-block' }}></span>
                  Online
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Language Switcher */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '20px', padding: '0.3rem 0.7rem',
                    color: 'var(--color-text-main)', cursor: 'pointer', fontSize: '0.8rem'
                  }}
                >
                  <span>{currentLang.flag}</span>
                  <span>{currentLang.short}</span>
                  <ChevronDown size={12} />
                </button>
                {langMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
                    background: 'rgba(20,20,28,0.98)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px', overflow: 'hidden', zIndex: 10,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    minWidth: '140px'
                  }}>
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                          width: '100%', padding: '0.6rem 1rem',
                          background: i18n.language === lang.code ? 'rgba(0,200,83,0.15)' : 'transparent',
                          border: 'none', color: i18n.language === lang.code ? 'var(--color-primary)' : 'var(--color-text-main)',
                          cursor: 'pointer', fontSize: '0.875rem', textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Suggestion Chips */}
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['How to sell?', 'Disease scan', 'Check weather', 'Govt schemes'].map(chip => (
              <button
                key={chip}
                onClick={() => {
                  const fakeEvent = { preventDefault: () => {} };
                  setInput(chip);
                  setTimeout(() => {
                    const userMsg = { id: Date.now(), text: chip, sender: 'user' };
                    setMessages(prev => [...prev, userMsg]);
                    const rawResponse = getBotResponse(chip, i18n.language);
                    setTimeout(() => {
                      setMessages(prev => [...prev, { id: Date.now() + 1, text: rawResponse || null, sender: 'bot', key: rawResponse ? null : 'chat_default' }]);
                    }, 600);
                    setInput('');
                  }, 0);
                }}
                style={{
                  padding: '0.3rem 0.75rem', fontSize: '0.75rem',
                  background: 'rgba(0,200,83,0.08)',
                  border: '1px solid rgba(0,200,83,0.2)',
                  borderRadius: '20px', color: 'var(--color-primary)',
                  cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(0,200,83,0.18)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(0,200,83,0.08)'}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: '0.5rem', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                {msg.sender === 'bot' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,200,83,0.4), rgba(0,200,83,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,200,83,0.3)' }}>
                    <Bot size={14} style={{ color: 'var(--color-primary)' }} />
                  </div>
                )}
                <div style={{
                  padding: '0.7rem 1rem',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, var(--color-primary), #22c55e)'
                    : 'rgba(255,255,255,0.06)',
                  color: msg.sender === 'user' ? '#000' : 'var(--color-text-main)',
                  fontSize: '1rem', lineHeight: 1.6,
                  border: msg.sender === 'bot' ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.key ? t(msg.key) : msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={startListening}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                border: '1px solid',
                borderColor: isListening ? '#ef4444' : 'rgba(255,255,255,0.1)',
                color: isListening ? '#ef4444' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                animation: isListening ? 'pulse 1.5s infinite' : 'none'
              }}
              title="Voice Input"
            >
              <Mic size={18} />
            </button>
            <input
              type="text" className="input-field"
              placeholder={isListening ? "Listening..." : t('chat_placeholder')}
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <button type="submit" style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), #00e676)',
              border: 'none', color: '#000', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
