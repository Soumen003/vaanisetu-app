import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, CloudOff, Cloud, Bell, Settings, Mic, Square, Play, Copy,
  FileText, Layers, Home, LayoutDashboard, BookOpen, User,
  ArrowRight, RefreshCw, Volume2, FileDown, CheckCircle2,
  BookOpenCheck, AlertCircle, Lock, IdCard, Eye, EyeOff, LogOut,
  Printer, X, Sparkles, Smartphone, Monitor, Download
} from 'lucide-react';

// Bhashini credentials supplied via .env or localStorage
const ENV_USER_ID = typeof import.meta !== 'undefined'
  ? ((import.meta.env?.VITE_BHASHINI_USER_ID || import.meta.env?.VITE_UDYAT_KEY || "") + "").trim()
  : "";

const ENV_INFERENCE_KEY = typeof import.meta !== 'undefined'
  ? ((import.meta.env?.VITE_BHASHINI_INFERENCE_KEY || import.meta.env?.VITE_INFERENCE_KEY || "") + "").trim()
  : "";

// Ol Chiki script to Latin pronunciation transliterator for teacher read-aloud & TTS
const OL_CHIKI_MAP = {
  'ᱚ': 'o', 'ᱛ': 't', 'ᱜ': 'g', 'ᱝ': 'ng', 'ᱞ': 'l',
  'ᱟ': 'a', 'ᱠ': 'k', 'ᱡ': 'j', 'ᱢ': 'm', 'ᱣ': 'w',
  'ᱤ': 'i', 'ᱥ': 's', 'ᱦ': 'h', 'ᱧ': 'ny', 'ᱨ': 'r',
  'ᱩ': 'u', 'ᱪ': 'c', 'ᱫ': 'd', 'ᱬ': 'n', 'ᱭ': 'y',
  'ᱮ': 'e', 'ᱯ': 'p', 'ᱰ': 'd', 'ᱱ': 'n', 'ᱲ': 'r',
  'ᱳ': 'o', 'ᱴ': 't', 'ᱵ': 'b', 'ᱶ': 'v', 'ᱷ': 'h',
  'ᱸ': 'n', 'ᱹ': '', 'ᱺ': '', 'ᱻ': '', 'ᱼ': '-', 'ᱽ': '', '᱾': '.', '᱿': '|'
};

const transliterateOlChiki = (text) => {
  if (!text) return "";
  let out = "";
  for (const char of text) {
    out += OL_CHIKI_MAP[char] !== undefined ? OL_CHIKI_MAP[char] : char;
  }
  return out.trim();
};

// Real FLN Classroom Phrases Dictionary for fast offline matching
const OFFLINE_DICTIONARY = {
  "आज हम कितनी सीढ़ियाँ चढ़ेंगे।": {
    "Santali - Ol Chiki": { text: "ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱛᱤᱱᱟᱹᱜ ᱫᱷᱟᱯ ᱵᱚ ᱫᱮᱡᱚᱜᱼᱟ᱾", phonetic: "Tehen abo tinag dhap bo dejog-a." },
    "Ho - Warang Citi": { text: "𑢹𑣁𑣚𑣈 𑣗𑣜𑣊 𑣎𑣂𑣕𑣂 𑢾𑣂𑣜𑣂", phonetic: "Hale barang jiti siri." },
    "Mundari - Bani": { text: "तिसिंग अबु चिमिन सीढ़ी देज आबु।", phonetic: "Tising abu chimin seedhi dej aabu." }
  },
  "हमारा स्कूल बहुत अच्छा है।": {
    "Santali - Ol Chiki": { text: "ᱟᱵᱚᱣᱟᱜ ᱤᱥᱠᱩᱞ ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱜᱮᱭᱟ᱾", phonetic: "Abowag iskul adi napay geya." },
    "Ho - Warang Citi": { text: "𑢹𑣁𑣚𑣈 𑣁𑣞𑣂𑣕𑣂 𑣈𑣕𑣈𑣄", phonetic: "Hale asiti eteh." },
    "Mundari - Bani": { text: "अबूआः इतुन आसड़ा इसु बुगिना।", phonetic: "Abuah itun aasda isu bugina." }
  },
  "पानी बचाओ, जीवन बचाओ।": {
    "Santali - Ol Chiki": { text: "ᱫᱟᱜ ᱵᱟᱸᱪᱟᱣ ᱢᱮ, ᱡᱤᱣᱤ ᱵᱟᱸᱪᱟᱣ ᱢᱮ᱾", phonetic: "Dag banchaw me, jiwi banchaw me." },
    "Ho - Warang Citi": { text: "𑣉𑣞𑣉𑣚 𑣗𑣜𑣊, 𑣎𑣂𑣕𑣂 𑣗𑣜𑣊", phonetic: "Osol barang, jiti barang." },
    "Mundari - Bani": { text: "दाः बंचाओ, जीबन बंचाओ।", phonetic: "Daah banchao, jeeban banchao." }
  },
  "नमस्ते बच्चों!": {
    "Santali - Ol Chiki": { text: "ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ!", phonetic: "Johar gidra ko!" },
    "Ho - Warang Citi": { text: "𑢹𑣉𑣚𑣉 𑣎𑣉𑣁𑣜 𑣎𑣉𑣉!", phonetic: "Holo johar joo!" },
    "Mundari - Bani": { text: "जोहार होना को!", phonetic: "Johar hona ko!" }
  },
  "अपनी किताब खोलिए।": {
    "Santali - Ol Chiki": { text: "ᱟᱢᱟᱜ ᱯᱩᱛᱷᱤ ᱠᱷᱩᱞᱟᱹᱭ ᱢᱮ᱾", phonetic: "Amag puthi khulay me." },
    "Ho - Warang Citi": { text: "𑣁𑣚𑣉𑣚𑣉 𑣉𑣚𑣉𑣚 𑣉𑣚", phonetic: "Amag potoi kulai me." },
    "Mundari - Bani": { text: "अमाः पुथी उढ़ियायेम।", phonetic: "Amah puthi udhiyayem." }
  },
  "बैठ जाइए।": {
    "Santali - Ol Chiki": { text: "ᱫᱩᱲᱩᱵ ᱢᱮ᱾", phonetic: "Durub me." },
    "Ho - Warang Citi": { text: "𑣔𑣚𑣉𑣈 𑣉𑣚", phonetic: "Dubome." },
    "Mundari - Bani": { text: "दुबुमे।", phonetic: "Dubume." }
  },
  "हाथ ऊपर कीजिए।": {
    "Santali - Ol Chiki": { text: "ᱛᱤ ᱪᱮᱛᱟᱱ ᱢᱮ᱾", phonetic: "Ti chetan me." },
    "Ho - Warang Citi": { text: "𑣕𑣂 𑣈𑣕𑣈𑣄", phonetic: "Ti cetan." },
    "Mundari - Bani": { text: "ती चेटान एपे।", phonetic: "Tee chetan epe." }
  },
  "लाइन में चलिए।": {
    "Santali - Ol Chiki": { text: "ᱛᱷᱟᱨ ᱨᱮ ᱛᱟᱲᱟᱢ ᱢᱮ᱾", phonetic: "Thar re tadam me." },
    "Ho - Warang Citi": { text: "𑢹𑣁𑣚𑣈 𑣎𑣂𑣕𑣂", phonetic: "Hale jiti siri." },
    "Mundari - Bani": { text: "साड़ी ते सेनपे।", phonetic: "Sadi te senpe." }
  },
  "शांत रहिए।": {
    "Santali - Ol Chiki": { text: "ᱛᱷᱤᱨ ᱠᱚᱜ ᱢᱮ᱾", phonetic: "Thir kog me." },
    "Ho - Warang Citi": { text: "𑣉𑣞𑣉𑣚 𑣗𑣜𑣊", phonetic: "Osol barang." },
    "Mundari - Bani": { text: "थिर ताएनपे।", phonetic: "Thir taenpe." }
  },
  "बहुत अच्छा काम किया।": {
    "Santali - Ol Chiki": { text: "ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱠᱟᱹᱢᱤ ᱠᱮᱫᱟᱢ᱾", phonetic: "Adi napay kami kedam." },
    "Ho - Warang Citi": { text: "𑢹𑣁𑣚𑣈 𑣁𑣞𑣂𑣕𑣂", phonetic: "Hale asiti." },
    "Mundari - Bani": { text: "इसु बुगिन कामी केदाम।", phonetic: "Isu bugin kami kedam." }
  }
};

const FLASHCARD_DATA = {
  Animals: [
    { hi: 'कुत्ता', tri: 'ᱥᱮᱛᱟ (Seta)', phonetic: 'Seta', img: '🐕' },
    { hi: 'बिल्ली', tri: 'ᱯᱩᱥᱤ (Pusi)', phonetic: 'Pusi', img: '🐈' },
    { hi: 'हाथी', tri: 'ᱦᱟᱹᱛᱤ (Hati)', phonetic: 'Hati', img: '🐘' },
    { hi: 'पक्षी', tri: 'ᱪᱮᱬᱮ (Chene)', phonetic: 'Chene', img: '🐦' },
    { hi: 'गाय', tri: 'ᱜᱟᱹᱭ (Gay)', phonetic: 'Gay', img: '🐄' },
    { hi: 'मछली', tri: 'ᱦᱟᱹᱠᱩ (Haku)', phonetic: 'Haku', img: '🐟' }
  ],
  Numbers: [
    { hi: 'एक (1)', tri: 'ᱢᱤᱫ (Mit)', phonetic: 'Mit', img: '1️⃣' },
    { hi: 'दो (2)', tri: 'ᱵᱟᱨ (Bar)', phonetic: 'Bar', img: '2️⃣' },
    { hi: 'तीन (3)', tri: 'ᱯᱮ (Pe)', phonetic: 'Pe', img: '3️⃣' },
    { hi: 'चार (4)', tri: 'ᱯᱩᱱ (Pun)', phonetic: 'Pun', img: '4️⃣' },
    { hi: 'पाँच (5)', tri: 'ᱢᱚᱬᱮ (Mone)', phonetic: 'Mone', img: '5️⃣' },
    { hi: 'दस (10)', tri: 'ᱜᱮᱞ (Gel)', phonetic: 'Gel', img: '🔟' }
  ],
  Colors: [
    { hi: 'लाल (Red)', tri: 'ᱟᱨᱟᱜ (Arag)', phonetic: 'Arag', img: '🔴' },
    { hi: 'हरा (Green)', tri: 'ᱦᱟᱹᱨᱤᱭᱟᱹᱲ (Hariyar)', phonetic: 'Hariyar', img: '🟢' },
    { hi: 'नीला (Blue)', tri: 'ᱞᱤᱞ (Lil)', phonetic: 'Lil', img: '🔵' },
    { hi: 'सफ़ेद (White)', tri: 'ᱯᱩᱸᱰ (Pund)', phonetic: 'Pund', img: '⚪' },
    { hi: 'पीला (Yellow)', tri: 'ᱥᱟᱥᱟᱝ (Sasang)', phonetic: 'Sasang', img: '🟡' },
    { hi: 'काला (Black)', tri: 'ᱦᱮᱸᱫᱮ (Hende)', phonetic: 'Hende', img: '⚫' }
  ]
};

// ---------------------------------------------------------------------------
// LOGIN PAGE
// ---------------------------------------------------------------------------
const LoginPage = ({ onLogin }) => {
  const [teacherId, setTeacherId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!teacherId.trim() || !password.trim()) {
      setError('Please enter both your Teacher ID and password.');
      return;
    }

    setIsSubmitting(true);
    // Simulated auth — replace with a real backend call when available.
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin({ 
        teacherId: teacherId.trim(),
        name: teacherId.trim() === 'TCH-88392' ? 'Shri Ramesh Soren' : 'Teacher ' + teacherId.trim(),
        school: 'GPS Dumka (Jharkhand)',
        assignedLang: 'Santali - Ol Chiki'
      });
    }, 450);
  };

  const handleFillDemo = () => {
    setTeacherId('TCH-88392');
    setPassword('teacher@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="bg-[#0b3b8c] px-8 pt-8 pb-10 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="w-16 h-16 bg-white/15 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-inner border border-white/20">
            <BookOpenCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">VaaniSetu (वाणीसेतु)</h1>
          <p className="text-blue-100 text-xs mt-1">AI-Powered Vernacular Pedagogy Bridge</p>
          <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-900/60 border border-blue-400/30 text-[10px] text-blue-200">
            <span>NIPUN Jharkhand • FLN Early Childhood</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5 -mt-5 bg-white rounded-t-3xl relative shadow-lg">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Teacher Login</h2>
            <p className="text-xs text-gray-500 mt-1">Sign in to access translation, worksheets and flashcards.</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Teacher ID / Mobile</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-[#0b3b8c] focus-within:border-[#0b3b8c] transition-all bg-gray-50/50">
              <IdCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="e.g. TCH-88392"
                className="w-full px-2.5 py-2.5 text-sm outline-none bg-transparent"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Password</label>
            <div className="flex items-center border border-gray-300 rounded-xl px-3 focus-within:ring-2 focus-within:ring-[#0b3b8c] focus-within:border-[#0b3b8c] transition-all bg-gray-50/50">
              <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-2.5 py-2.5 text-sm outline-none bg-transparent"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0b3b8c] hover:bg-blue-900 text-white font-bold text-sm py-3 rounded-xl shadow-md transition disabled:opacity-60 flex items-center justify-center space-x-2 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Classroom</span>
            )}
          </button>

          {/* Quick Demo Fill Helper */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#0b3b8c] text-xs font-semibold rounded-lg border border-blue-200/80 transition flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Use Demo Teacher Account (TCH-88392)</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
            <span className="flex items-center space-x-1.5 text-gray-400">
              <CloudOff className="w-3.5 h-3.5 text-amber-500" />
              <span>Works 100% offline</span>
            </span>
            <button 
              type="button" 
              onClick={() => alert("For password assistance, contact your Block Education Officer (BEO) or use the demo login.")}
              className="text-[#0b3b8c] font-semibold hover:underline"
            >
              Need help?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// SHELL COMPONENTS
// ---------------------------------------------------------------------------
const Header = ({ onLogout, isSimulatorMode, onToggleSimulator }) => (
  <header className="bg-[#0b3b8c] text-white p-3.5 flex justify-between items-center shadow-md select-none">
    <div className="flex items-center space-x-2.5">
      <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-bold text-sm border border-white/20">
        VS
      </div>
      <div>
        <h1 className="font-bold text-sm tracking-wide leading-none">वाणीसेतु (VaaniSetu)</h1>
        <p className="text-[10px] text-blue-200 mt-0.5">Vernacular Pedagogy Bridge</p>
      </div>
    </div>

    <div className="flex items-center space-x-3">
      {/* Device Viewport Toggle on Desktop */}
      <button 
        onClick={onToggleSimulator}
        title={isSimulatorMode ? "Switch to Wide Fullscreen View" : "Switch to Mobile Phone View"}
        className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 rounded-md text-xs font-semibold transition"
      >
        {isSimulatorMode ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
        <span>{isSimulatorMode ? "Desktop" : "Mobile"}</span>
      </button>

      <div className="flex items-center space-x-1.5 text-xs font-medium px-2 py-1 bg-black/20 rounded-full">
        <CloudOff className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden sm:inline text-[11px]">Offline Sync Ready</span>
      </div>

      <div className="relative p-1 hover:bg-white/10 rounded-full transition cursor-pointer" title="Notifications">
        <Bell className="w-4 h-4" />
        <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-emerald-400 rounded-full"></span>
      </div>

      <button 
        onClick={onLogout} 
        title="Log out" 
        className="p-1 hover:bg-red-600/80 rounded-lg transition cursor-pointer flex items-center space-x-1 text-xs"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline text-[11px]">Logout</span>
      </button>
    </div>
  </header>
);

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'resources', icon: BookOpen, label: 'Resources' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="bg-white border-t border-gray-200 flex justify-around p-2.5 pb-3 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center space-y-1 px-3 py-1 rounded-xl transition-all ${
              isActive ? 'text-[#0b3b8c] font-bold bg-blue-50' : 'text-gray-500 hover:text-[#0b3b8c]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const TopNav = ({ activeTopTab, setActiveTopTab }) => {
  const tabs = [
    { id: 'translate', label: 'Translate', icon: RefreshCw },
    { id: 'worksheet', label: 'Worksheet', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="flex justify-between items-center border-b border-gray-200 bg-white">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTopTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTopTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-3 text-xs font-semibold transition-all border-b-2
              ${isActive 
                ? 'text-[#0b3b8c] border-[#0b3b8c] bg-blue-50/40 font-bold' 
                : 'text-gray-600 border-transparent hover:bg-gray-50'}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const Waveform = ({ isRecording }) => (
  <div className="flex items-center justify-center space-x-1 h-9 w-full my-2">
    {[...Array(28)].map((_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full transition-all duration-150 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-[#0b3b8c]'}`}
        style={{
          height: isRecording ? `${Math.max(6, Math.random() * 32)}px` : `${Math.sin(i * 0.5) * 10 + 14}px`,
          opacity: isRecording ? 0.95 : 0.3
        }}
      ></div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// TRANSLATE SECTION (Audio playback fixed & offline robust)
// ---------------------------------------------------------------------------
const TranslateSection = ({ onNavigateTab, userApiKey }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isInterimSpeech, setIsInterimSpeech] = useState(false);
  const [targetLang, setTargetLang] = useState('Santali - Ol Chiki');
  const [inputText, setInputText] = useState("आज हम कितनी सीढ़ियाँ चढ़ेंगे।");
  const [translationResult, setTranslationResult] = useState({ text: "", phonetic: "" });
  const [isTranslating, setIsTranslating] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [audioError, setAudioError] = useState("");
  const [isUsingOnlineAi, setIsUsingOnlineAi] = useState(false);

  const recognitionRef = useRef(null);
  const shouldKeepRecognizingRef = useRef(false);
  const translationAbortRef = useRef(null);
  const voicesRef = useRef([]);
  const resumeIntervalRef = useRef(null);

  const udyatUserId = (localStorage.getItem('vaanisetu_user_id') || ENV_USER_ID || userApiKey || "").trim();
  const inferenceKey = (localStorage.getItem('vaanisetu_inference_key') || ENV_INFERENCE_KEY || userApiKey || "").trim();
  const hasBhashiniKeys = Boolean(udyatUserId && inferenceKey);

  const recentTranslations = [
    { hindi: "आज हम कितनी सीढ़ियाँ चढ़ेंगे।", tribal: "ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱛᱤᱱᱟᱹᱜ ᱫᱷᱟᱯ ᱵᱚ ᱫᱮᱡᱚᱜᱼᱟ᱾", time: "10:30 AM" },
    { hindi: "हमारा स्कूल बहुत अच्छा है।", tribal: "ᱟᱵᱚᱣᱟᱜ ᱤᱥᱠᱩᱞ ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱜᱮᱭᱟ᱾", time: "10:25 AM" },
    { hindi: "पानी बचाओ, जीवन बचाओ।", tribal: "ᱫᱟᱜ ᱵᱟᱸᱪᱟᱣ ᱢᱮ, ᱡᱤᱣᱤ ᱵᱟᱸᱪᱟᱣ ᱢᱮ᱾", time: "10:20 AM" },
    { hindi: "नमस्ते बच्चों!", tribal: "ᱡᱚᱦᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ!", time: "10:15 AM" },
    { hindi: "अपनी किताब खोलिए।", tribal: "ᱟᱢᱟᱜ ᱯᱩᱛᱷᱤ ᱠᱷᱩᱞᱟᱹᱭ ᱢᱮ᱾", time: "10:10 AM" }
  ];

  // Perform translation using Bhashini live API or offline dictionary
  useEffect(() => {
    const trimmedInput = inputText.trim();
    const normalizedInput = trimmedInput.toLowerCase();
    if (!trimmedInput) {
      setTranslationResult({ text: "", phonetic: "" });
      setIsUsingOnlineAi(false);
      return;
    }

    let isMounted = true;
    if (translationAbortRef.current) translationAbortRef.current.abort();
    const abortController = new AbortController();
    translationAbortRef.current = abortController;
    setIsTranslating(true);

    const performTranslation = async () => {
      // 1. Check Offline Dictionary First (exact or normalized match)
      let dictMatch = null;
      if (OFFLINE_DICTIONARY[trimmedInput] && OFFLINE_DICTIONARY[trimmedInput][targetLang]) {
        dictMatch = OFFLINE_DICTIONARY[trimmedInput];
      } else {
        for (const [key, val] of Object.entries(OFFLINE_DICTIONARY)) {
          const lowerKey = key.toLowerCase();
          if (lowerKey === normalizedInput || lowerKey.includes(normalizedInput) || normalizedInput.includes(lowerKey)) {
            if (val[targetLang]) {
              dictMatch = val;
              break;
            }
          }
        }
      }

      if (dictMatch && dictMatch[targetLang]) {
        if (isMounted) {
          setTranslationResult(dictMatch[targetLang]);
          setIsUsingOnlineAi(false);
          setIsTranslating(false);
        }
        return;
      }

      // 2. If no Bhashini keys are configured, provide offline placeholder
      if (!hasBhashiniKeys) {
        if (isMounted) {
          setIsUsingOnlineAi(false);
          setTranslationResult({
            text: `[${targetLang.split(' - ')[0]}] ${trimmedInput}`,
            phonetic: `Pronunciation for "${trimmedInput}" (${targetLang.split(' - ')[0]})`
          });
          setIsTranslating(false);
        }
        return;
      }

      // 3. Call Bhasini Dhruva NMT Pipeline API for real-time live translation
      try {
        setIsUsingOnlineAi(true);

        const BHASINI_LANG_MAP = {
          'Santali - Ol Chiki': 'sat', // Santali (NMT active)
          'Ho - Warang Citi':   'hoc', // Ho (NMT active)
          'Mundari - Bani':     'sat', // Fallback to Santali root or devanagari if Mundari model is unassigned
        };
        const targetLangCode = BHASINI_LANG_MAP[targetLang] || 'sat';

        const bhasiniPayload = {
          pipelineTasks: [
            {
              taskType: "translation",
              config: {
                language: {
                  sourceLanguage: "hi",
                  targetLanguage: targetLangCode
                }
              }
            }
          ],
          inputData: {
            input: [{ source: trimmedInput }]
          }
        };

        let delay = 600;
        let response = null;

        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await fetch('https://dhruva-api.bhashini.gov.in/services/inference/pipeline', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': inferenceKey,
                'userID': udyatUserId,
                'ulcaApiKey': inferenceKey
              },
              body: JSON.stringify(bhasiniPayload),
              signal: abortController.signal
            });
            if (res.ok) {
              response = await res.json();
              break;
            } else {
              console.warn('Bhashini API error:', res.status, await res.text());
            }
          } catch (err) {
            if (err.name === 'AbortError') return;
          }
          await new Promise(r => setTimeout(r, delay));
          delay *= 1.5;
        }

        const translatedText =
          response?.pipelineResponse?.[0]?.output?.[0]?.target ||
          response?.pipelineResponse?.[0]?.output?.[0]?.source ||
          '';

        if (translatedText && isMounted) {
          // Generate phonetic pronunciation for audio playback & classroom guide
          let phoneticText = translatedText;
          if (targetLang.includes('Ol Chiki') || /[\u1C50-\u1C7F]/.test(translatedText)) {
            const romanized = transliterateOlChiki(translatedText);
            if (romanized) phoneticText = romanized;
          }

          setTranslationResult({
            text: translatedText,
            phonetic: phoneticText
          });
        } else {
          if (isMounted) {
            setTranslationResult({
              text: `[${targetLang.split(' - ')[0]}] ${trimmedInput}`,
              phonetic: trimmedInput
            });
          }
        }
      } catch (err) {
        console.error("Bhasini Translation Error:", err);
        if (isMounted) {
          setTranslationResult({
            text: `[${targetLang.split(' - ')[0]}] ${trimmedInput}`,
            phonetic: trimmedInput
          });
        }
      } finally {
        if (isMounted) setIsTranslating(false);
      }
    };

    const timer = setTimeout(performTranslation, 350); // 350ms Live Debounce
    return () => {
      isMounted = false;
      clearTimeout(timer);
      abortController.abort();
    };
  }, [inputText, targetLang, udyatUserId, inferenceKey, hasBhashiniKeys]);

  // Load voices for Web Speech Synthesis
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      if (list && list.length) {
        voicesRef.current = list;
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      window.speechSynthesis.cancel();
      if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
    };
  }, []);

  const pickVoice = (langPrefixes) => {
    const list = voicesRef.current;
    if (!list || !list.length) return null;
    for (const prefix of langPrefixes) {
      const match = list.find(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
      if (match) return match;
    }
    return list[0] || null;
  };

  // Speech Recognition Handler
  const toggleSpeechRecognition = async () => {
    setSpeechError("");
    if (isRecording) {
      shouldKeepRecognizingRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsRecording(false);
      setIsInterimSpeech(false);
      return;
    }

    const SpeechRecognition = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
    if (!SpeechRecognition) {
      setSpeechError("Browser speech recognition not supported. Please type in Hindi.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError("");
        setInputText("");
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += transcript;
          else interimTranscript += transcript;
        }
        if (finalTranscript) {
          setInputText(previous => `${previous} ${finalTranscript}`.trim());
        }
        setIsInterimSpeech(Boolean(interimTranscript));
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsRecording(false);
        setIsInterimSpeech(false);
        shouldKeepRecognizingRef.current = false;
        if (event.error !== 'no-speech') {
          setSpeechError("Microphone access error. Please type text directly or allow mic permission.");
        }
      };

      recognition.onend = () => {
        if (shouldKeepRecognizingRef.current) {
          try { recognition.start(); } catch (e) {}
        } else {
          setIsRecording(false);
          setIsInterimSpeech(false);
        }
      };

      recognitionRef.current = recognition;
      shouldKeepRecognizingRef.current = true;
      recognition.start();
    } catch (err) {
      setIsRecording(false);
      setSpeechError("Failed to access microphone.");
    }
  };

  // Audio Playback Handler with Indian Accent Fallback & Chrome Interval Fix
  const handlePlayAudio = () => {
    setAudioError("");

    if (!translationResult.text && !translationResult.phonetic) return;

    if (!('speechSynthesis' in window)) {
      setAudioError("Audio playback isn't supported in this browser.");
      return;
    }

    const textToSpeak = translationResult.phonetic || translationResult.text;
    if (!textToSpeak) return;

    window.speechSynthesis.cancel();
    if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      const voice = pickVoice(['en-in', 'hi-in', 'en-gb', 'en-us', 'en']);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'en-IN';
      }

      utterance.rate = 0.82;
      utterance.pitch = 1.0;

      utterance.onstart = () => setAudioPlaying(true);
      utterance.onend = () => {
        setAudioPlaying(false);
        if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
      };
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error);
        setAudioPlaying(false);
        if (resumeIntervalRef.current) clearInterval(resumeIntervalRef.current);
        setAudioError("Couldn't play the audio. Please try again.");
      };

      window.speechSynthesis.speak(utterance);

      resumeIntervalRef.current = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(resumeIntervalRef.current);
          return;
        }
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }, 7000);
    }, 100);
  };

  const handleCopy = () => {
    if (translationResult.text) {
      navigator.clipboard.writeText(translationResult.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const dialects = [
    'Santali - Ol Chiki',
    'Ho - Warang Citi',
    'Mundari - Bani'
  ];

  const cycleDialect = () => {
    const nextIdx = (dialects.indexOf(targetLang) + 1) % dialects.length;
    setTargetLang(dialects[nextIdx]);
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto pb-20">
      {/* Translation Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">Voice Translation</h2>
            <p className="text-[11px] text-gray-500">Realtime Hindi → vernacular translation</p>
          </div>
          <button 
            onClick={cycleDialect}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#0b3b8c] text-[#0b3b8c] rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch Dialect</span>
          </button>
        </div>

        {speechError && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
        )}

        {audioError && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{audioError}</span>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 px-2.5 py-2 text-[11px] text-blue-800">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            {isRecording ? (isInterimSpeech ? 'Hearing speech… translating as you speak' : 'Live microphone connected') : 'Ready for live translation'}
          </span>
          <span className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${isUsingOnlineAi ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
            {isUsingOnlineAi ? '🇮🇳 Bhashini NMT (Live)' : '⚡ FLN Offline Engine'}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-stretch gap-3">
          {/* Input Box */}
          <div className="flex-1 border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="font-semibold text-xs text-gray-700">Input (Hindi / शिक्षक बोली)</span>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-gray-500">
                  {isRecording ? "LISTENING..." : "READY"}
                </span>
              </div>

              <Waveform isRecording={isRecording} />

              <textarea
                className={`w-full bg-white border border-gray-200 p-2.5 rounded-xl text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-[#0b3b8c] transition-all ${isRecording ? 'border-red-300 ring-2 ring-red-100' : ''}`}
                rows="3"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="यहाँ हिंदी में बोलें या टाइप करें..."
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#0b3b8c] text-white hover:bg-blue-900'
                }`}
              >
                {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Stop Mic' : 'Speak Hindi'}</span>
              </button>
              <span className="text-[11px] text-gray-400 font-medium">
                {isRecording ? "Listening..." : "Click mic to speak"}
              </span>
            </div>
          </div>

          {/* Center Indicator */}
          <div className="hidden md:flex items-center justify-center -mx-1">
            <div className="bg-white rounded-full border border-gray-200 p-1.5 shadow-sm">
              <ArrowRight className="text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* Output Box */}
          <div className="flex-1 border border-gray-200 rounded-xl p-3.5 bg-white flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <select
                    className="font-semibold text-xs bg-transparent outline-none cursor-pointer focus:ring-1 focus:ring-[#0b3b8c] rounded text-gray-800"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                  >
                    <option value="Santali - Ol Chiki">Output (Santali - Ol Chiki)</option>
                    <option value="Ho - Warang Citi">Output (Ho - Warang Citi)</option>
                    <option value="Mundari - Bani">Output (Mundari - Bani)</option>
                  </select>
                </div>
                <button 
                  onClick={handlePlayAudio} 
                  title="Listen Audio"
                  className="p-1 text-[#0b3b8c] hover:bg-blue-50 rounded-lg transition"
                >
                  <Volume2 className={`w-5 h-5 ${audioPlaying ? 'text-green-600 animate-bounce' : ''}`} />
                </button>
              </div>

              <div className="bg-blue-50/40 rounded-xl p-3.5 my-1.5 text-center flex flex-col items-center justify-center min-h-[110px] border border-blue-100/60">
                {isTranslating ? (
                  <div className="text-[#0b3b8c] text-xs font-semibold animate-pulse flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI Vernacular Engine Translating...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-xl md:text-2xl font-bold tracking-wide text-gray-900 leading-relaxed break-words max-w-full">
                      {translationResult.text || <span className="text-gray-400 text-xs font-normal">अनुवाद यहाँ दिखाई देगा</span>}
                    </div>
                    {translationResult.phonetic && (
                      <div className="text-xs text-blue-700 font-medium italic mt-2 bg-white/80 px-2.5 py-1 rounded-md border border-blue-100">
                        Phonetic: &quot;{translationResult.phonetic}&quot;
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={handlePlayAudio}
                disabled={!translationResult.text || isTranslating}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{audioPlaying ? 'Playing Audio...' : 'Play Audio'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!translationResult.text}
                className="flex items-center justify-center space-x-1.5 border border-gray-300 bg-white hover:bg-gray-50 px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition"
              >
                {copySuccess ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                <span>{copySuccess ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { icon: Mic, title: 'Speak Hindi', sub: 'Start Recording', color: 'text-[#0b3b8c]', action: toggleSpeechRecognition },
            { icon: Volume2, title: 'Play Tribal Audio', sub: 'Listen Output', color: 'text-green-700', action: handlePlayAudio },
            { icon: FileText, title: 'Worksheet', sub: 'Generate PDF', color: 'text-purple-700', action: () => onNavigateTab && onNavigateTab('worksheet') },
            { icon: Layers, title: 'Flashcards', sub: 'View Cards', color: 'text-amber-700', action: () => onNavigateTab && onNavigateTab('flashcards') }
          ].map((act, idx) => {
            const Icon = act.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={act.action}
                className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center text-center shadow-sm hover:shadow-md transition active:scale-95 hover:border-blue-300"
              >
                <Icon className={`w-6 h-6 ${act.color} mb-1.5`} />
                <span className="text-xs font-bold text-gray-800 leading-tight">{act.title}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{act.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset / Recent FLN Lessons */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">FLN Lesson Examples</h3>
          <span className="text-xs text-blue-700 font-semibold cursor-default">Click phrase to test</span>
        </div>
        <div className="space-y-2">
          {recentTranslations.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="w-full text-left flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/70 cursor-pointer transition-colors"
              onClick={() => { setInputText(item.hindi); setTargetLang('Santali - Ol Chiki'); }}
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 truncate">
                  <span className="text-xs font-bold text-gray-800 truncate">{item.hindi}</span>
                  <ArrowRight className="hidden sm:block w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-blue-900 truncate">{item.tribal}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-gray-400 ml-2">{item.time}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// WORKSHEET SECTION
// ---------------------------------------------------------------------------
const WorksheetSection = () => {
  const [selectedSheet, setSelectedSheet] = useState(null);

  const worksheets = [
    {
      id: 1,
      title: 'Class 1 - Math (Addition)',
      desc: 'Count & Write numbers with Santali Ol Chiki numerals',
      lang: 'Hindi + Santali',
      items: [
        { q: '🍎 + 🍎 = ?', ansHindi: '२ (दो)', ansTribal: '᱒ (ᱵᱟᱨ - Bar)' },
        { q: '⭐ + ⭐ + ⭐ = ?', ansHindi: '३ (तीन)', ansTribal: '᱓ (ᱯᱮ - Pe)' },
        { q: '✏️ + ✏️ + ✏️ + ✏️ = ?', ansHindi: '४ (चार)', ansTribal: '᱔ (ᱯᱩᱱ - Pun)' }
      ]
    },
    {
      id: 2,
      title: 'Class 2 - Story Comprehension',
      desc: 'Bilingual illustrated folklore: "चालाक लोमड़ी और कौवा"',
      lang: 'Hindi + Ho (Warang Citi)',
      items: [
        { q: 'लोमड़ी ने क्या देखा?', ansHindi: 'पेड़ पर कौवा', ansTribal: '𑣉𑣚𑣉𑣚 𑣎𑣉𑣉' },
        { q: 'कौवे के मुँह में क्या था?', ansHindi: 'रोटी का टुकड़ा', ansTribal: '𑢹𑣁𑣚𑣈 𑣗𑣜𑣊' }
      ]
    },
    {
      id: 3,
      title: 'Class 1 - Alphabet Tracing',
      desc: 'Trace foundational characters in Ol Chiki and Devanagari',
      lang: 'Santali (Ol Chiki)',
      items: [
        { q: 'ᱚ (La) Tracing Box', ansHindi: 'ध्वनि: ला', ansTribal: 'ᱚ ᱚ ᱚ ᱚ' },
        { q: 'ᱛ (At) Tracing Box', ansHindi: 'ध्वनि: अत', ansTribal: 'ᱛ ᱛ ᱛ ᱛ' }
      ]
    }
  ];

  return (
    <div className="p-4 space-y-4 overflow-y-auto pb-20">
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
        <h2 className="text-base font-bold text-[#0b3b8c] flex items-center gap-2">
          <FileDown className="w-5 h-5 text-[#0b3b8c]" /> Bilingual Worksheet Generator
        </h2>
        <p className="text-xs text-gray-600 mt-1">Generate NIPUN Bharat aligned FLN worksheets instantly for offline printing.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {worksheets.map((sheet) => (
          <div key={sheet.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-blue-300 transition">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">{sheet.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{sheet.desc}</p>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                {sheet.lang} • PDF Ready
              </div>
            </div>
            <button
              onClick={() => setSelectedSheet(sheet)}
              className="w-full sm:w-auto px-4 py-2 bg-[#0b3b8c] hover:bg-blue-900 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Preview & Print</span>
            </button>
          </div>
        ))}
      </div>

      {/* Printable Sheet Modal */}
      {selectedSheet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <h3 className="font-bold text-base text-gray-900">{selectedSheet.title}</h3>
                <p className="text-xs text-gray-500">{selectedSheet.lang} Worksheet</p>
              </div>
              <button 
                onClick={() => setSelectedSheet(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 my-2 border border-dashed border-gray-300 rounded-xl bg-slate-50 overflow-y-auto space-y-4">
              <div className="text-center pb-2 border-b border-gray-200">
                <div className="text-xs font-bold text-[#0b3b8c]">GOVERNMENT PRIMARY SCHOOL • FLN WORKSHEET</div>
                <div className="text-xs text-gray-500 mt-0.5">Name: _______________________ Date: ________ Class: 1</div>
              </div>

              {selectedSheet.items.map((item, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-gray-200 space-y-1">
                  <div className="text-xs font-bold text-gray-800">प्रश्न {i + 1}: {item.q}</div>
                  <div className="text-xs text-gray-600">हिंदी उत्तर: {item.ansHindi}</div>
                  <div className="text-xs font-bold text-blue-900">जनजातीय भाषा (Tribal): {item.ansTribal}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex space-x-2 border-t border-gray-100">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-[#0b3b8c] hover:bg-blue-900 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Worksheet</span>
              </button>
              <button
                onClick={() => setSelectedSheet(null)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// FLASHCARDS SECTION
// ---------------------------------------------------------------------------
const FlashcardsSection = () => {
  const [category, setCategory] = useState('Animals');
  const [activeVoicePlaying, setActiveVoicePlaying] = useState(null);

  const cards = FLASHCARD_DATA[category] || FLASHCARD_DATA['Animals'];

  const playCardAudio = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN';
    utterance.rate = 0.85;
    setActiveVoicePlaying(text);
    utterance.onend = () => setActiveVoicePlaying(null);
    utterance.onerror = () => setActiveVoicePlaying(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-gray-800">Visual Flashcards</h2>
          <p className="text-xs text-gray-500">Tap any card to hear pronunciation</p>
        </div>
        <select 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-1.5 text-xs font-semibold bg-white outline-none focus:ring-2 focus:ring-[#0b3b8c]"
        >
          <option value="Animals">🐾 Animals</option>
          <option value="Numbers">🔢 Numbers</option>
          <option value="Colors">🎨 Colors</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => playCardAudio(card.phonetic || card.tri)}
            className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:border-blue-300 transition cursor-pointer active:scale-95 relative"
          >
            <div className="text-4xl mb-2" role="img" aria-label={card.hi}>{card.img}</div>
            <div className="text-sm font-bold text-gray-800">{card.hi}</div>
            <div className="text-xs font-semibold text-[#0b3b8c] mt-1 border-t border-gray-100 pt-1.5 w-full">
              {card.tri}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5 flex items-center space-x-1">
              <Volume2 className={`w-3 h-3 ${activeVoicePlaying === (card.phonetic || card.tri) ? 'text-green-600 animate-bounce' : 'text-gray-400'}`} />
              <span>Tap to listen</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// SETTINGS SECTION
// ---------------------------------------------------------------------------
const SettingsSection = () => {
  const [userIdInput, setUserIdInput] = useState(() => {
    return localStorage.getItem('vaanisetu_user_id') || ENV_USER_ID || '';
  });
  const [inferenceKeyInput, setInferenceKeyInput] = useState(() => {
    return localStorage.getItem('vaanisetu_inference_key') || ENV_INFERENCE_KEY || '';
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('vaanisetu_user_id', userIdInput.trim());
    localStorage.setItem('vaanisetu_inference_key', inferenceKeyInput.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTestSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert("Speech synthesis not supported in your browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance("Johar gidra ko. VaaniSetu is ready.");
    utterance.lang = 'en-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto pb-20">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">System & Bhashini API Settings</h2>
          <p className="text-xs text-gray-500">Bhashini (National Language Translation Mission) credentials for live vernacular inference.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Bhashini Udyat Key / User ID
            </label>
            <input
              type="text"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="e.g. 342379460c-c40b-4f54-ab73-c69af6064f72"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0b3b8c]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Bhashini Inference API Key
            </label>
            <input
              type="password"
              value={inferenceKeyInput}
              onChange={(e) => setInferenceKeyInput(e.target.value)}
              placeholder="8Ul-qzP..."
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0b3b8c]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Configured credentials in <code className="text-blue-700">.env</code> will be used by default.
            </p>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#0b3b8c] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition flex items-center space-x-1.5"
          >
            {saved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Settings className="w-4 h-4" />}
            <span>{saved ? 'Saved Successfully!' : 'Save Bhashini Keys'}</span>
          </button>
        </form>

        <div className="border-t border-gray-100 pt-3 space-y-3">
          <h3 className="text-xs font-bold text-gray-700">Diagnostics & Audio</h3>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <div className="text-xs font-semibold text-gray-800">Audio Speech Engine</div>
              <div className="text-[11px] text-gray-500">Test Indian Romanized Vernacular Voice</div>
            </div>
            <button
              onClick={handleTestSpeech}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#0b3b8c] hover:bg-blue-50 transition flex items-center space-x-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Audio</span>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-400">
          VaaniSetu Build 1.3 • Aligned with NEP 2020 & NIPUN Bharat FLN
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// DASHBOARD SECTION
// ---------------------------------------------------------------------------
const DashboardSection = () => (
  <div className="p-4 space-y-4 overflow-y-auto pb-20">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-base font-bold text-gray-800">Teacher Dashboard</h2>
        <p className="text-xs text-gray-500">NIPUN Bharat FLN classroom engagement metrics</p>
      </div>
      <span className="px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full">
        Active Session
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
        <div className="text-2xl font-bold text-[#0b3b8c]">142</div>
        <div className="text-xs text-gray-600 font-medium mt-1">Translations Today</div>
      </div>
      <div className="bg-green-50/70 p-4 rounded-2xl border border-green-100">
        <div className="text-2xl font-bold text-green-700">12</div>
        <div className="text-xs text-gray-600 font-medium mt-1">Worksheets Generated</div>
      </div>
      <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100">
        <div className="text-2xl font-bold text-purple-700">45 mins</div>
        <div className="text-xs text-gray-600 font-medium mt-1">Audio Synthesized</div>
      </div>
      <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-100">
        <div className="text-2xl font-bold text-orange-700">98%</div>
        <div className="text-xs text-gray-600 font-medium mt-1">NIPUN Alignment</div>
      </div>
    </div>

    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Classroom Dialect Usage</h3>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Santali (Ol Chiki)</span>
            <span>68%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#0b3b8c] rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Ho (Warang Citi)</span>
            <span>22%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: '22%' }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span>Mundari (Bani)</span>
            <span>10%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: '10%' }}></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// MAIN APP COMPONENT
// ---------------------------------------------------------------------------
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vaanisetu_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeBottomTab, setActiveBottomTab] = useState('home');
  const [activeTopTab, setActiveTopTab] = useState('translate');
  const [isSimulatorMode, setIsSimulatorMode] = useState(true);
  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem('vaanisetu_api_key') || "";
  });

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('vaanisetu_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vaanisetu_current_user');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-sans p-0 sm:p-4">
      <div 
        className={`w-full bg-gray-50 flex flex-col relative transition-all duration-300 overflow-hidden ${
          isSimulatorMode
            ? 'max-w-2xl h-screen sm:h-[92vh] sm:rounded-3xl sm:shadow-2xl border-0 sm:border-8 border-gray-800'
            : 'max-w-5xl h-screen sm:h-[95vh] sm:rounded-2xl sm:shadow-xl border-0 sm:border border-gray-300'
        }`}
      >
        {/* Top Status Bar */}
        <div className="bg-white text-center py-1.5 text-[#0b3b8c] font-bold text-[11px] tracking-wider border-b border-gray-200 select-none flex items-center justify-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>AI-POWERED VERNACULAR PEDAGOGY • VAANISETU APP</span>
        </div>

        <Header 
          onLogout={handleLogout} 
          isSimulatorMode={isSimulatorMode}
          onToggleSimulator={() => setIsSimulatorMode(v => !v)}
        />

        {activeBottomTab === 'home' && (
          <TopNav activeTopTab={activeTopTab} setActiveTopTab={setActiveTopTab} />
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50">
          {activeBottomTab === 'home' && activeTopTab === 'translate' && (
            <TranslateSection 
              onNavigateTab={(tab) => setActiveTopTab(tab)} 
              userApiKey={userApiKey}
            />
          )}
          {activeBottomTab === 'home' && activeTopTab === 'worksheet' && <WorksheetSection />}
          {activeBottomTab === 'home' && activeTopTab === 'flashcards' && <FlashcardsSection />}
          {activeBottomTab === 'home' && activeTopTab === 'settings' && (
            <SettingsSection />
          )}

          {activeBottomTab === 'dashboard' && <DashboardSection />}

          {activeBottomTab === 'resources' && (
            <div className="p-6 text-center text-gray-500 space-y-4">
              <BookOpenCheck className="w-16 h-16 mx-auto text-[#0b3b8c]/40" />
              <h2 className="text-xl font-bold text-gray-800">Curriculum Resources</h2>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Offline FLN scripts, tribal phoneme dictionaries, and Jharkhand state curriculum guides are cached and ready for offline classroom teaching.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left mt-4">
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
                  <div className="text-xs font-bold text-gray-800">Santali Ol Chiki Guide</div>
                  <div className="text-[10px] text-gray-500">30 Foundational Glyphs & Vowels</div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
                  <div className="text-xs font-bold text-gray-800">NIPUN Bharat Target Goals</div>
                  <div className="text-[10px] text-gray-500">Grade 1 & 2 Learning Outcomes</div>
                </div>
              </div>
            </div>
          )}

          {activeBottomTab === 'profile' && (
            <div className="p-6 text-center text-gray-500 space-y-4">
              <div className="w-20 h-20 bg-blue-100 text-[#0b3b8c] rounded-full mx-auto flex items-center justify-center text-2xl font-bold shadow-inner border border-blue-200">
                {currentUser.teacherId ? currentUser.teacherId.charAt(0) : 'T'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">{currentUser.name || 'Primary School Teacher'}</h2>
                <p className="text-xs text-gray-600 mt-0.5">ID: {currentUser.teacherId} • Assigned Lang: Santali</p>
                <p className="text-xs text-gray-400">{currentUser.school || 'Govt Primary School'}</p>
              </div>

              <div className="max-w-xs mx-auto pt-4 space-y-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition flex items-center justify-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          )}
        </main>

        <BottomNav activeTab={activeBottomTab} setActiveTab={setActiveBottomTab} />
      </div>
    </div>
  );
}
