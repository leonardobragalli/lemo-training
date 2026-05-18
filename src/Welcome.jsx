import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Stethoscope, ArrowRight, ShieldCheck, Sparkles, Type, SquareUser, Building2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from './LanguageContext';
import { audio } from './utils/audio';
import { supabase } from './utils/supabase';

const LANGUAGES = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
];

const WelcomeLangPicker = () => {
  const { lang, switchLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang);

  return (
    <div className="relative">
      <button
        onClick={() => { audio.playClick(); setOpen(o => !o); }}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 text-white font-bold text-sm transition-all hover:bg-black/30"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span>{current.label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#03091B]/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] overflow-hidden shadow-xl z-50 min-w-[140px]"
          >
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => { audio.playClick(); switchLang(l.code); setOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left font-bold text-sm transition-all duration-200 ${lang === l.code ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
              >
                <span className="text-base">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const capitalize = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const HospitalSearch = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = useCallback(async (q) => {
    if (!q || q.length < 3) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Italy bbox: 35.4,6.6,47.1,18.6 — Spain mainland+Balearics: 36,-9.3,43.8,4.3
      const oq = `[out:json][timeout:20];
(
  node["amenity"="hospital"]["name"~"${esc}",i](35.4,6.6,47.1,18.6);
  way["amenity"="hospital"]["name"~"${esc}",i](35.4,6.6,47.1,18.6);
  relation["amenity"="hospital"]["name"~"${esc}",i](35.4,6.6,47.1,18.6);
  node["amenity"="hospital"]["name"~"${esc}",i](36,-9.3,43.8,4.3);
  way["amenity"="hospital"]["name"~"${esc}",i](36,-9.3,43.8,4.3);
  relation["amenity"="hospital"]["name"~"${esc}",i](36,-9.3,43.8,4.3);
);
out center 8;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: oq });
      const data = await res.json();
      setResults(data.elements || []);
      setOpen((data.elements || []).length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const raw = e.target.value;
    const val = capitalize(raw);
    setQuery(val);
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(raw), 350);
  };

  const handleSelect = (item) => {
    const name = item.tags?.name || '';
    setQuery(name);
    onChange(name);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative group">
      <Building2 className="absolute left-5 2xl:left-6 top-1/2 -translate-y-1/2 h-4 w-4 2xl:h-5 2xl:w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300 z-10 pointer-events-none" />
      {loading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin z-10 pointer-events-none" />}
      <input
        type="text"
        required
        autoComplete="off"
        className="block w-full pl-12 2xl:pl-14 pr-12 py-4 2xl:py-5 bg-black/40 border border-white/10 focus:bg-[#FF8731]/10 rounded-[2rem] text-white focus:ring-2 focus:ring-[#FF8731]/50 focus:border-[#FF8731] transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(255,135,49,0.3),inset_0_2px_10px_rgba(0,0,0,0.5)] outline-none font-bold text-base 2xl:text-lg placeholder-slate-500"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#03091B]/95 backdrop-blur-xl border border-white/10 rounded-[1.5rem] overflow-hidden shadow-2xl z-50 max-h-[240px] overflow-y-auto"
          >
            {results.map((item, i) => {
              const name = item.tags?.name || '';
              const city = item.tags?.['addr:city'] || item.tags?.['addr:municipality'] || '';
              const province = item.tags?.['addr:province'] || '';
              const sub = [city, province].filter(Boolean).join(', ');
              return (
                <li key={item.id || i}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelect(item)}
                    className="flex flex-col px-5 py-3 w-full text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <span className="text-white font-bold text-sm truncate">{name}</span>
                    {sub && <span className="text-slate-400 text-xs truncate mt-0.5">{sub}</span>}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const Welcome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [hospital, setHospital] = useState('');
  const [department, setDepartment] = useState('');
  const [patientType, setPatientType] = useState('');
  const { t } = useLang();
  const w = t.welcome;

  const mode = searchParams.get('mode') || 'guided';

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('lemo_user'));
    
    // Auto-login: if a user is already in localStorage, skip to home immediately
    if (savedUser && mode !== 'full') {
      navigate(`/home?mode=${mode}`);
      return;
    }

    if (mode === 'full') navigate(`/home?mode=full`);
  }, [mode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !hospital.trim() || !department.trim() || !patientType) return;

    audio.playClick();
    const fullName = `${firstName} ${lastName}`;

    // --- DEMO CHEAT CODE ---
    const isDemoAccount = (firstName.toLowerCase().trim() === 'mario' && lastName.toLowerCase().trim() === 'rossi') || firstName.toLowerCase().trim() === 'demo';
    if (isDemoAccount) {
      localStorage.setItem(`lemo_progress_${fullName}`, JSON.stringify([1, 2, 3, 4]));
    }

    const userData = { name: fullName, firstName, lastName, hospital, department, patientType, mode };
    localStorage.setItem('lemo_user', JSON.stringify(userData));

    // Supabase upsert
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from('users')
      .select('id, login_count, first_login, completed_modules')
      .eq('name', fullName)
      .maybeSingle();

    if (existing) {
      await supabase.from('users').update({
        first_name: firstName,
        last_name: lastName,
        hospital,
        department,
        patient_type: patientType,
        mode,
        login_count: (existing.login_count || 1) + 1,
        last_login: now,
        completed_modules: isDemoAccount ? [1, 2, 3, 4] : (existing.completed_modules || []),
      }).eq('name', fullName);
    } else {
      await supabase.from('users').insert({
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        hospital,
        department,
        patient_type: patientType,
        mode,
        login_count: 1,
        first_login: now,
        last_login: now,
        completed_modules: isDemoAccount ? [1, 2, 3, 4] : [],
      });
    }

    // localStorage fallback (per compatibilità Admin locale)
    const allUsers = JSON.parse(localStorage.getItem('lemo_all_users')) || {};
    if (allUsers[fullName]) {
      allUsers[fullName].loginCount = (allUsers[fullName].loginCount || 1) + 1;
      allUsers[fullName].lastLogin = now;
      allUsers[fullName].hospital = hospital;
      allUsers[fullName].department = department;
      allUsers[fullName].patientType = patientType;
      if (isDemoAccount) allUsers[fullName].completedModulesList = [1, 2, 3, 4];
    } else {
      allUsers[fullName] = {
        ...userData,
        loginCount: 1,
        firstLogin: now,
        lastLogin: now,
        completedModulesList: isDemoAccount ? [1, 2, 3, 4] : []
      };
    }
    localStorage.setItem('lemo_all_users', JSON.stringify(allUsers));

    navigate(`/home?mode=${mode}`);
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } } };
  const itemVariants = { hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[100dvh] flex flex-col md:flex-row font-sans overflow-y-auto md:overflow-hidden relative">

      {/* Background Layer Fixed for Mobile/Safari */}
      <div className="fixed inset-0 bg-cover bg-center z-0 bg-[url('/images/bg-clouds.png')] pointer-events-none"></div>

      {/* Background Ambience - Removed dark overlay so clouds pop */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

      {/* Lato Sinistro - Lemons Brand Experience */}
      <div className="hidden md:flex md:w-[50%] lg:w-[55%] pl-12 lg:pl-16 2xl:pl-20 pr-20 lg:pr-28 2xl:pr-36 py-16 2xl:py-24 flex-col justify-center items-end relative z-10">

        <div className="relative z-10">
          {/* Logo nel banner */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="mb-8 inline-flex bg-black/15 backdrop-blur-[40px] rounded-[2rem] p-5 border-t border-l border-white/20 border-r border-b border-white/5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.25)]"
          >
            <img src="/images/logo-character-photoroom.png" alt="Lemons in the room" className="h-36 2xl:h-44 object-contain drop-shadow-2xl" />
          </motion.div>

          <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-5xl lg:text-[3.5rem] 2xl:text-[5rem] font-black font-serif text-[#03091B] mb-6 2xl:mb-8 leading-[1.1] tracking-tight drop-shadow-2xl pr-10 overflow-visible antialiased" style={{ WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>
            {w.tagline}<br/>
            <span className="relative inline-block mt-2 overflow-visible">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#FF8731] to-[#FF9E54] pr-4">{w.taglineAccent}</span>
            </span>
          </motion.h1>
          <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-[#03091B]/70 text-lg 2xl:text-2xl max-w-xl font-bold leading-relaxed whitespace-pre-line">
            {w.subtitle}
          </motion.p>
        </div>
      </div>

      {/* Lato Destro - Apple-like Floating Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 relative z-10">

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-[420px] 2xl:max-w-[480px] relative z-10 bg-black/20 backdrop-blur-[40px] p-8 pt-4 md:p-8 md:px-10 2xl:p-10 rounded-[3.5rem] shadow-xl border-t border-l border-white/20 border-r border-b border-white/5 my-8 md:my-0 group/glass">

          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[3.5rem] pointer-events-none opacity-50 z-0"></div>

          {/* MOBILE LOGO */}
          <div className="md:hidden flex justify-center mb-8 relative z-10">
            <img src="/images/logo-character-photoroom.png" alt="Lemons Logo" className="h-40 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]" />
          </div>

          {/* Language Picker */}
          <motion.div variants={itemVariants} className="mb-4 flex justify-center relative z-10">
            <WelcomeLangPicker />
          </motion.div>

          {/* Security Protocol Badge - Moved here for better visibility on all devices */}
          <motion.div variants={itemVariants} className="mb-6 2xl:mb-10 flex items-center justify-center gap-4 bg-white/10 backdrop-blur-3xl p-3 2xl:p-4 rounded-3xl border border-white/10 shadow-lg relative z-10 mx-auto w-fit">
            <div className="w-10 h-10 2xl:w-12 2xl:h-12 bg-gradient-to-br from-[#FF8731]/20 to-[#FF8731]/5 rounded-xl flex items-center justify-center border border-[#FF8731]/20 shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#FF8731]" />
            </div>
            <div className="text-left">
              <span className="block text-white text-xs 2xl:text-sm font-bold tracking-wide">{w.badge}</span>
              <span className="block text-slate-300 text-[9px] 2xl:text-[10px] font-medium mt-0.5 flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#FF8731]" /> {w.badgeSub}</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-4 2xl:mb-8 text-center relative z-10">
            <h2 
              className="text-5xl 2xl:text-[4rem] font-black font-serif text-[#FF8731] mb-2 2xl:mb-4 tracking-tighter"
              style={{ textShadow: '0 0 40px rgba(255, 135, 49, 0.8), 0 4px 10px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.4)' }}
            >
              {w.title}
            </h2>
            <p className="text-slate-300 font-medium text-base 2xl:text-lg leading-relaxed mt-2 2xl:mt-4">{w.description}</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4 2xl:space-y-6 relative z-10 text-left">
            <div className="grid grid-cols-2 gap-4 2xl:gap-5">
              <motion.div variants={itemVariants} className="space-y-1.5 2xl:space-y-2">
                <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md">{w.firstName}</label>
                <div className="relative group">
                  <Type className="absolute left-5 2xl:left-6 top-1/2 -translate-y-1/2 h-4 w-4 2xl:h-5 2xl:w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300 z-10" />
                  <input type="text" required className="block w-full pl-12 2xl:pl-14 pr-6 py-4 2xl:py-5 bg-black/40 border border-white/10 focus:bg-[#8756FA]/10 rounded-[2rem] text-white focus:ring-2 focus:ring-[#8756FA]/50 focus:border-[#8756FA] transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(135,86,250,0.4),inset_0_2px_10px_rgba(0,0,0,0.5)] outline-none font-bold text-base 2xl:text-lg placeholder-slate-500" placeholder={w.placeholderFirst} value={firstName} onChange={(e) => setFirstName(capitalize(e.target.value))} />
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-1.5 2xl:space-y-2">
                <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md">{w.lastName}</label>
                <div className="relative group">
                  <SquareUser className="absolute left-5 2xl:left-6 top-1/2 -translate-y-1/2 h-4 w-4 2xl:h-5 2xl:w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300 z-10" />
                  <input type="text" required className="block w-full pl-12 2xl:pl-14 pr-6 py-4 2xl:py-5 bg-black/40 border border-white/10 focus:bg-[#8756FA]/10 rounded-[2rem] text-white focus:ring-2 focus:ring-[#8756FA]/50 focus:border-[#8756FA] transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(135,86,250,0.4),inset_0_2px_10px_rgba(0,0,0,0.5)] outline-none font-bold text-base 2xl:text-lg placeholder-slate-500" placeholder={w.placeholderLast} value={lastName} onChange={(e) => setLastName(capitalize(e.target.value))} />
                </div>
              </motion.div>
            </div>
            
            <motion.div variants={itemVariants} className="space-y-1.5 2xl:space-y-2">
              <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md">{w.hospital}</label>
              <HospitalSearch value={hospital} onChange={setHospital} placeholder={w.placeholderHospital} />
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-1.5 2xl:space-y-2">
              <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md">{w.department}</label>
              <div className="relative group">
                <Stethoscope className="absolute left-5 2xl:left-6 top-1/2 -translate-y-1/2 h-4 w-4 2xl:h-5 2xl:w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300 z-10" />
                <input type="text" required className="block w-full pl-12 2xl:pl-14 pr-6 py-4 2xl:py-5 bg-black/40 border border-white/10 focus:bg-[#FF8731]/10 rounded-[2rem] text-white focus:ring-2 focus:ring-[#FF8731]/50 focus:border-[#FF8731] transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(255,135,49,0.3),inset_0_2px_10px_rgba(0,0,0,0.5)] outline-none font-bold text-base 2xl:text-lg placeholder-slate-500" placeholder={w.placeholderDept} value={department} onChange={(e) => setDepartment(capitalize(e.target.value))} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2 2xl:space-y-2 pt-2 2xl:pt-4">
              <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md block text-left">{w.patientProfile}</label>
              <div className="grid grid-cols-2 gap-4 2xl:gap-5">
                <label className={`relative overflow-hidden flex flex-col items-center justify-center pb-3 2xl:pb-4 aspect-square border rounded-full cursor-pointer transition-all duration-500 group ${patientType === 'pediatria' ? 'border-[#8756FA] ring-2 ring-[#8756FA] shadow-[0_0_30px_rgba(135,86,250,0.5)] scale-[1.03]' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                  <input type="radio" name="patientType" value="pediatria" className="hidden" onChange={(e) => setPatientType(e.target.value)} />
                  <img src="/images/profilo-pediatria.png" alt="Profilo Pediatria" className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${patientType === 'pediatria' ? 'opacity-100 scale-105' : 'opacity-40 grayscale group-hover:opacity-60 group-hover:grayscale-0'}`} />
                  <div className={`absolute inset-0 transition-colors duration-500 ${patientType === 'pediatria' ? 'bg-gradient-to-t from-[#03091B] via-[#8756FA]/60 to-transparent' : 'bg-gradient-to-t from-[#03091B] via-black/50 to-transparent group-hover:from-[#03091B]/90'}`}></div>
                  <span className={`relative z-10 font-black text-lg 2xl:text-xl tracking-tight transition-colors mt-auto ${patientType === 'pediatria' ? 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]' : 'text-slate-300 drop-shadow-md group-hover:text-white'}`}>{w.pediatria}</span>
                </label>
                
                <label className={`relative overflow-hidden flex flex-col items-center justify-center pb-3 2xl:pb-4 aspect-square border rounded-full cursor-pointer transition-all duration-500 group ${patientType === 'adulti' ? 'border-[#FF8731] ring-2 ring-[#FF8731] shadow-[0_0_30px_rgba(255,135,49,0.5)] scale-[1.03]' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                  <input type="radio" name="patientType" value="adulti" className="hidden" onChange={(e) => setPatientType(e.target.value)} />
                  <img src="/images/profilo-adulti.png" alt="Profilo Adulti" className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${patientType === 'adulti' ? 'opacity-100 scale-105' : 'opacity-40 grayscale group-hover:opacity-60 group-hover:grayscale-0'}`} />
                  <div className={`absolute inset-0 transition-colors duration-500 ${patientType === 'adulti' ? 'bg-gradient-to-t from-[#03091B] via-[#FF8731]/60 to-transparent' : 'bg-gradient-to-t from-[#03091B] via-black/50 to-transparent group-hover:from-[#03091B]/90'}`}></div>
                  <span className={`relative z-10 font-black text-lg 2xl:text-xl tracking-tight transition-colors mt-auto ${patientType === 'adulti' ? 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]' : 'text-slate-300 drop-shadow-md group-hover:text-white'}`}>{w.adulti}</span>
                </label>
              </div>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit" 
              className="w-full py-4 2xl:py-6 mt-6 2xl:mt-10 bg-gradient-to-r from-[#8756FA] to-[#FF8731] text-white font-black rounded-[2.5rem] shadow-[0_15px_40px_-10px_rgba(135,86,250,0.8)] hover:shadow-[0_20px_60px_-10px_rgba(255,135,49,1)] transition-all flex items-center justify-center overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12"></div>
              <span className="relative z-10 flex items-center gap-3 text-xl 2xl:text-2xl tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{w.submit} <ArrowRight className="w-6 h-6 2xl:w-7 2xl:h-7" /></span>
            </motion.button>
          </form>
          
        </motion.div>
      </div>
    </motion.div>
  );
};
export default Welcome;