import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

const LANG_MAP = {
  en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN',
  bn: 'bn-IN', mr: 'mr-IN', kn: 'kn-IN', ml: 'ml-IN',
  pa: 'pa-IN', gu: 'gu-IN', or: 'or-IN'
};

const COMMANDS = {
  en: {
    marketplace: ['marketplace', 'market', 'shop', 'buy crop', 'buy crops'],
    sell_crop: ['sell crop', 'sell crops', 'post crop', 'list crop'],
    agritech: ['scanner', 'ai', 'diagnose', 'crop health', 'scan leaf', 'disease'],
    services: ['services', 'government schemes', 'schemes', 'soil test', 'lab'],
    dashboard: ['dashboard', 'my account', 'profile', 'my listings', 'account'],
    profile: ['profile', 'my profile', 'settings', 'personal info', 'account details'],
    home: ['home', 'main page', 'start', 'agrivision', 'front page'],
    chatbot: ['open chat', 'chatbot', 'ask bot', 'help bot', 'open agribot', 'chat'],
    calendar: ['calendar', 'crop calendar', 'what to grow', 'planting schedule'],
    pest_alert: ['pest alert', 'pest risk', 'disease warning', 'pests'],
    login: ['login', 'sign in'],
    signup: ['signup', 'register', 'create account'],
    language: ['change language to', 'switch to', 'set language to']
  },
  hi: {
    marketplace: ['मार्केटप्लेस', 'बाजार', 'मंडी', 'फसल खरीदें', 'खरीदें'],
    sell_crop: ['फसल बेचें', 'बेचें', 'बेचना'],
    agritech: ['स्कैनर', 'बीमारी', 'जांच', 'एआई', 'फसल स्वास्थ्य', 'लीफ स्कैन'],
    services: ['सेवाएं', 'सरकारी योजना', 'मदद', 'मिट्टी परीक्षण', 'लैब'],
    dashboard: ['डैशबोर्ड', 'मेरी प्रोफाइल', 'खाता', 'मेरी लिस्टिंग', 'प्रोफाइल'],
    profile: ['प्रोफ़ाइल', 'मेरी प्रोफ़ाइल', 'खाता विवरण'],
    home: ['होम', 'शुरुआत', 'मुख्य पेज', 'घर'],
    chatbot: ['चैटबॉट', 'मदद मांगें', 'बॉट खोलें', 'एग्रीबॉट', 'चैट'],
    calendar: ['कैलेंडर', 'खेती कैलेंडर', 'क्या उगाएं'],
    pest_alert: ['कीट चेतावनी', 'कीड़ा', 'बीमारी अलर्ट'],
    login: ['लॉगिन', 'साइन इन'],
    signup: ['साइन अप', 'नया खाता'],
    language: ['भाषा बदलें', 'स्विच करें']
  },
  te: { 
    marketplace: ['మార్కెట్', 'అంగడి', 'కొనుగోలు', 'పంటలు కొనండి'], 
    sell_crop: ['పంట అమ్మకం', 'అమ్మండి', 'అమ్మకం'],
    agritech: ['స్కానర్', 'పంట పరీక్ష', 'రోగ నిర్ధారణ', 'ఆకు స్కాన్'], 
    services: ['సేవలు', 'ప్రభుత్వ పథకాలు', 'మట్టి పరీక్ష', 'ల్యాబ్'], 
    dashboard: ['డాష్‌బోర్డ్', 'నా ఖాతా', 'ప్రొఫైల్'], 
    profile: ['ప్రొఫೈల్', 'నా ప్రొఫైల్', 'ఖాతా వివరాలు'],
    home: ['హోమ్', 'ప్రధాన పేజీ'], 
    chatbot: ['చాట్‌బాట్', 'సహాయం', 'అడగండి', 'చాట్'],
    calendar: ['క్యాలెಂಡర్', 'పంట క్యాలెండర్'],
    pest_alert: ['పంట తెగుళ్లు', 'తెగుళ్ల అలర్ట్'],
    login: ['లాగిన్'], signup: ['సైన్ అప్'], language: ['భాష మార్చు', 'భాష']
  },
  ta: { 
    marketplace: ['சந்தை', 'கடை', 'வாங்குதல்', 'பயிர் வாங்க'], 
    sell_crop: ['விற்பனை', 'பயிர் விற்க', 'விற்க'],
    agritech: ['ஸ்கேனர்', 'பயிர் சோதனை', 'நோய் கண்டறிதல்', 'இலை ஸ்கேன்'], 
    services: ['சேவைகள்', 'அரசு திட்டங்கள்', 'மண் பரிசோதனை', 'ஆய்வகம்'], 
    dashboard: ['டாஷ்போர்டு', 'என் கணக்கு', 'சுயவிவரம்'], 
    profile: ['சுயவிவரம்', 'எனது சுயவிவரம்'],
    home: ['முகப்பு', 'முதன்மை பக்கம்'], 
    chatbot: ['சாட்போட்', 'உதவி', 'கேளுங்கள்', 'சாட்'],
    calendar: ['காலண்டர்', 'பயிர் காலண்டர்'],
    pest_alert: ['பூச்சி எச்சரிக்கை', 'நோய் எச்சரிக்கை'],
    login: ['உள்நுழை'], signup: ['பதிவு செய்'], language: ['மொழியை மாற்றவும்', 'மொழி']
  },
  bn: { 
    marketplace: ['মার্কেটপ্লেস', 'বাজার', 'কেনাবেচা', 'শস্য কিনুন'], 
    sell_crop: ['শস্য বিক্রি', 'বিক্রি করুন', 'লিস্ট করুন'],
    agritech: ['স্ক্যানার', 'ফসল পরীক্ষা', 'রোগ নির্ণয়', 'পাতা স্ক্যান'], 
    services: ['পরিষেবা', 'সরকারি প্রকল্প', 'মাটি পরীক্ষা', 'ল্যাব'], 
    dashboard: ['ড্যাশবোর্ড', 'আমার অ্যাকাউন্ট', 'প্রোফাইল'], 
    profile: ['প্রোফাইল', 'আমার প্রোফাইল'],
    home: ['হোম', 'প্রধান পাতা'], 
    chatbot: ['চ্যাটবট', 'সাহায্য', 'জিজ্ঞাসা করুন', 'চ্যাট'],
    calendar: ['ক্যালেন্ডার', 'ফসল ক্যালেন্ডার'],
    pest_alert: ['পোকামাকড় সতর্কতা', 'রোগের ঝুঁকি'],
    login: ['লগইন'], signup: ['সাইন আপ'], language: ['ভাষা পরিবর্তন', 'ভাষা']
  },
  mr: { 
    marketplace: ['मार्केटप्लेस', 'बाजार', 'खरेदी', 'पीक खरेदी'], 
    sell_crop: ['पीक विक्री', 'विक्री', 'विकणे'],
    agritech: ['स्कॅनर', 'पीक तपासणी', 'रोग निदान', 'लीफ स्कॅन'], 
    services: ['सेवा', 'सरकारी योजना', 'माती परीक्षण', 'लॅब'], 
    dashboard: ['डॅशबोर्ड', 'माझे खाते', 'प्रोफाइल'], 
    profile: ['प्रोफाइल', 'माझी प्रोफाइल'],
    home: ['होम', 'मुख्य पान'], 
    chatbot: ['चॅटबॉट', 'मदत', 'विचारा', 'चॅट'],
    calendar: ['कॅलेंडर', 'पीक कॅलेंडर'],
    pest_alert: ['कीड इशारा', 'रोग सूचना'],
    login: ['लॉगिन'], signup: ['साइन अप'], language: ['भाषा बदला', 'भाषा']
  },
  kn: { 
    marketplace: ['ಮಾರುಕಟ್ಟೆ', 'ಖರೀದಿ', 'ಬೆಳೆ ಖರೀದಿ'], 
    sell_crop: ['ಬೆಳೆ ಮಾರಾಟ', 'ಮಾರಾಟ', 'ಮಾರುವುದು'],
    agritech: ['ಸ್ಕ್ಯಾನರ್', 'ಬೆಳೆ ಪರೀಕ್ಷೆ', 'ರೋಗ ಪತ್ತೆ', 'ಲೀಫ್ ಸ್ಕ್ಯಾನ್'], 
    services: ['ಸೇವೆಗಳು', 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು', 'ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ', 'ಲ್ಯಾಬ್'], 
    dashboard: ['ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ನನ್ನ ಖಾತೆ', 'ಪ್ರೊಫೈಲ್'], 
    profile: ['ಪ್ರೊಫೈಲ್', 'ನನ್ನ ಪ್ರೊಫೈಲ್'],
    home: ['ಹೋಮ್', 'ಮುಖ್ಯ ಪುಟ'], 
    chatbot: ['ಚಾಟ್‌ಬಾಟ್', 'ಸಹಾಯ', 'ಕೇಳಿ', 'ಚಾಟ್'],
    calendar: ['ಕ್ಯಾಲೆಂಡರ್', 'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್'],
    pest_alert: ['ಕೀಟ ಮುನ್ನೆಚ್ಚರಿಕೆ', 'ರೋಗ ಭೀತಿ'],
    login: ['ಲಾಗಿನ್'], signup: ['ಸೈನ್ ಅಪ್'], language: ['ಭಾಷೆ ಬದಲಿಸಿ', 'ಭಾಷೆ']
  },
  ml: { 
    marketplace: ['മാർക്കറ്റ്', 'വാങ്ങുക', 'വിളകൾ വാങ്ങുക'], 
    sell_crop: ['വിളകൾ വിൽക്കുക', 'വിൽക്കുക', 'വിൽപ്പന'],
    agritech: ['സ്കാനർ', 'രോഗ നിർണ്ണയം', 'വിള പരിശോധന', 'ലീഫ് സ്കാൻ'], 
    services: ['സേവനങ്ങൾ', 'സർക്കാർ പദ്ധതികൾ', 'മണ്ണ് പരിശോധന', 'ലാബ്'], 
    dashboard: ['ഡാഷ്‌ബോർഡ്', 'എന്റെ അക്കൗണ്ട്', 'പ്രൊഫൈൽ'], 
    profile: ['പ്രൊഫൈൽ', 'എന്റെ പ്രൊഫൈൽ'],
    home: ['ഹോം', 'പ്രധാന പേജ്'], 
    chatbot: ['ചാറ്റ്ബോട്ട്', 'സഹായം', 'ചോദിക്കുക', 'ചാറ്റ്'],
    calendar: ['കലണ്ടർ', 'വിള കലണ്ടർ'],
    pest_alert: ['കീട ഭീഷണി', 'രോഗ മുന്നറിയിപ്പ്'],
    login: ['ലോഗിൻ'], signup: ['സൈൻ അപ്പ്'], language: ['ഭാഷ മാറ്റുക', 'ഭാഷ']
  },
  pa: { 
    marketplace: ['ਮਾਰਕੀਟ', 'ਖਰੀਦੋ', 'ਫਸਲ ਖਰੀਦੋ'], 
    sell_crop: ['ਫਸਲ ਵੇਚੋ', 'ਵੇਚੋ', 'ਵੇਚਣਾ'],
    agritech: ['ਸਕੈਨਰ', 'ਫਸਲ ਦੀ ਜਾਂਚ', 'ਬਿਮਾਰੀ', 'ਲੀਫ ਸਕੈਨ'], 
    services: ['ਸੇਵਾਵਾਂ', 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ', 'ਮਿੱਟੀ ਦੀ ਜਾਂਚ', 'ਲੈਬ'], 
    dashboard: ['ਡੈਸ਼ਬੋਰਡ', 'ਮੇਰਾ ਖਾਤਾ', 'ਪ੍ਰੋਫਾਈਲ'], 
    profile: ['ਪ੍ਰੋਫਾਈਲ', 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ'],
    home: ['ਹੋਮ', 'ਮੁੱਖ ਪੰਨਾ'], 
    chatbot: ['ਚੈਟਬੋਟ', 'ਮਦਦ', 'ਪੁੱਛੋ', 'ਚੈਟ'],
    calendar: ['ਕੈਲੰਡਰ', 'ਫਸਲ ਕੈਲੰਡਰ'],
    pest_alert: ['ਕੀੜੇ ਦੀ ਚੇਤਾਵਨੀ', 'ਬਿਮਾਰੀ ਦਾ ਖਤਰਾ'],
    login: ['ਲੌਗਿਨ'], signup: ['ਸਾਈਨ ਅੱਪ'], language: ['ਭਾਸ਼ਾ ਬਦਲੋ', 'ਭਾਸ਼ਾ']
  },
  gu: { 
    marketplace: ['માર્કેટ', 'ખરીદી', 'પાક ખરીદી'], 
    sell_crop: ['પાક વેચાણ', 'વેચાણ', 'વેચવું'],
    agritech: ['સ્કેનર', 'પાક તપાસ', 'રોગ નિદાન', 'લીફ સ્કેન'], 
    services: ['સેવાઓ', 'સરકારી યોજનાઓ', 'માટી પરીક્ષણ', 'લેબ'], 
    dashboard: ['ડેશબોર્ਡ', 'મારું ખાતું', 'પ્રોફાઇલ'], 
    profile: ['પ્રોફાઇલ', 'મારી પ્રોફાઇલ'],
    home: ['હોಮ್', 'મુક્ય পেજ'], 
    chatbot: ['ચેટબોટ', 'મદદ', 'પૂછો', 'ચેટ'],
    calendar: ['કેલેન્ડર', 'પાક કેલેન્ડર'],
    pest_alert: ['જીવાત ચેતવણી', 'રોગ ભય'],
    login: ['લોગિન'], signup: ['સાઇન અપ'], language: ['ભાષા બદલો', 'ભાષા']
  },
  or: { 
    marketplace: ['ମାର୍କେଟ', 'କିଣନ୍ତୁ', 'ଫସଲ କିଣନ୍ତୁ'], 
    sell_crop: ['ଫସଲ ବିକ୍ରୟ', 'ବିକ୍ରୟ', 'ବିକିବା'],
    agritech: ['ସ୍କାନର', 'ଫସଲ ପରୀକ୍ଷା', 'ରୋଗ ଚିହ୍ନଟ', 'ଲିଫ୍ ସ୍କାନ୍'], 
    services: ['ସେବାସମୂହ', 'ସରକାରୀ ଯୋଜନା', 'ମାଟି ପରୀକ୍ଷା', 'ଲ୍ୟାବ୍'], 
    dashboard: ['ଡ୍ୟାସବୋର୍ଡ', 'ମୋର ଆକାଉଣ୍ଟ', 'ପ୍ରୋଫାଇଲ'], 
    profile: ['ପ୍ରୋଫାଇଲ୍', 'ମୋର ପ୍ରୋଫାଇଲ୍'],
    home: ['ହୋମ', 'ମୁଖ୍ୟ ପୃଷ୍ଠା'], 
    chatbot: ['ଚାଟବୋଟ', 'ସାହାଯ୍ୟ', 'ପଚାରନ୍ତୁ', 'ଚାଟ୍'],
    calendar: ['କ୍ୟାଲେଣ୍ଡର', 'ଫସଲ କ୍ୟାଲେଣ୍ଡର'],
    pest_alert: ['ପୋକ ଆଲର୍ଟ', 'ରୋଗ ସୂଚନା'],
    login: ['ଲଗ୍ ଇନ୍'], signup: ['ସାଇନ୍ ଅପ୍'], language: ['ଭାଷା ବଦଳାନ୍ତୁ', 'ଭାଷา']
  }
};

const NAV_MAP = {
  marketplace: '/marketplace',
  sell_crop: '/marketplace/sell',
  agritech: '/agritech',
  services: '/services',
  dashboard: '/dashboard',
  profile: '/profile',
  home: '/',
  calendar: '/calendar',
  pest_alert: '/pest-alert',
  login: '/auth/login',
  signup: '/auth/signup'
};

const LANG_CODE_MAP = {
  english: 'en', hindi: 'hi', telugu: 'te', tamil: 'ta', 
  bengali: 'bn', marathi: 'mr', kannada: 'kn', malayalam: 'ml', 
  punjabi: 'pa', gujarati: 'gu', odia: 'or'
};

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[i18n.language] || 'en-US';
    window.speechSynthesis.speak(utterance);
  }, [i18n.language]);

  const handleCommand = useCallback((transcript) => {
    const lower = transcript.toLowerCase();
    
    // 1. Language Switching logic (Highest priority)
    // PRO TIP: We check every language's "language" keywords to catch crossover commands
    const allLanguageKeywords = Object.values(COMMANDS).flatMap(c => c.language || []);
    const isGenericLangCommand = allLanguageKeywords.some(p => lower.includes(p)) || 
                                lower.includes('switch') || lower.includes('change') || lower.includes('set');

    if (isGenericLangCommand) {
      for (const [langName, code] of Object.entries(LANG_CODE_MAP)) {
        if (lower.includes(langName.toLowerCase()) || lower.includes(code)) {
          i18n.changeLanguage(code);
          const fbText = `${t('language') || 'Language'}: ${langName}`;
          setFeedback(fbText);
          speak(fbText);
          setTimeout(() => setIsVisible(false), 2000);
          return;
        }
      }
    }

    // 2. Search across ALL languages for commands
    // This makes the voice assistant truly global/multilingual
    const languagesToSearch = [i18n.language, ...Object.keys(COMMANDS).filter(l => l !== i18n.language)];
    
    for (const lang of languagesToSearch) {
      const cmd = COMMANDS[lang];
      if (!cmd) continue;

      // Chatbot logic
      if (cmd.chatbot?.some(p => lower.includes(p))) {
        window.dispatchEvent(new CustomEvent('open-chatbot'));
        setFeedback(t('dash_bot') + "...");
        speak(t('dash_bot'));
        setTimeout(() => setIsVisible(false), 1500);
        return;
      }

      // Navigation logic
      for (const [key, path] of Object.entries(NAV_MAP)) {
        if (cmd[key]?.some(p => lower.includes(p))) {
          const navText = t(key) || key;
          setFeedback(`${t('welcome')} ${navText}...`);
          speak(navText);
          navigate(path);
          setTimeout(() => setIsVisible(false), 1000);
          return;
        }
      }
    }

    setFeedback(t('error_signin')); // General fallback error "Command not recognized"
    speak("Command not recognized");
  }, [i18n.language, navigate, speak, i18n, t]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_MAP[i18n.language] || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback("Listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setLastTranscript(transcript);
      handleCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setFeedback("Error: " + event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      {/* Floating Trigger */}
      <button
        onClick={() => { setIsVisible(true); startListening(); }}
        style={{
          position: 'fixed', bottom: '2rem', left: '2rem',
          width: '56px', height: '56px', borderRadius: '50%',
          background: isListening ? 'rgba(239, 68, 68, 0.9)' : 'linear-gradient(135deg, #070908 0%, #00c853 100%)',
          backdropFilter: 'blur(10px)',
          color: '#fff', border: '1px solid rgba(0, 200, 83, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 1001, boxShadow: '0 8px 32px rgba(0, 200, 83, 0.25)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          animation: isListening ? 'pulseVoice 1.5s infinite' : 'none'
        }}
        title="Voice Assistant"
      >
        {isListening ? <Mic size={24} /> : <Volume2 size={24} />}
      </button>

      {/* Voice Assistant Overlay */}
      {isVisible && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '320px', padding: '2rem',
          background: 'rgba(15, 15, 20, 0.95)', backdropFilter: 'blur(20px)',
          borderRadius: '24px', border: '1px solid rgba(0, 200, 83, 0.3)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
          zIndex: 1002, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
          textAlign: 'center'
        }}>
          <button 
            onClick={() => setIsVisible(false)}
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>

          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 200, 83, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `2px solid ${isListening ? '#ef4444' : '#00c853'}`
          }}>
            {isListening ? 
              <Mic size={32} style={{ color: '#ef4444' }} className="animate-pulse" /> : 
              <MicOff size={32} style={{ color: '#666' }} />
            }
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#fff' }}>AgriVision Voice</h3>
            <p style={{ margin: 0, color: 'var(--color-primary)', minHeight: '1.5rem' }}>{feedback}</p>
          </div>

          {lastTranscript && (
            <div style={{ fontStyle: 'italic', color: '#888', fontSize: '0.9rem' }}>
              "{lastTranscript}"
            </div>
          )}

          {!isListening && (
            <button 
              onClick={startListening}
              className="btn-primary"
              style={{ padding: '0.6rem 2rem', borderRadius: '20px' }}
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </>
  );
}
