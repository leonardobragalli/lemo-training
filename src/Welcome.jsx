import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Stethoscope, ArrowRight, ShieldCheck, Sparkles, Type, SquareUser, Building2, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useLang } from './LanguageContext';
import { audio } from './utils/audio';
import { supabase } from './utils/supabase';

const LANGUAGES = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
];

const LangPicker = () => {
  const { lang, switchLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === lang);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => { audio.playClick(); setOpen(o => !o); }}
        className="flex items-center gap-2 pl-3 pr-3 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-2xl border border-white/30 text-white text-[13px] font-semibold transition-all duration-200 shadow-[0_4px_16px_-4px_rgba(3,9,27,0.25)]"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-[#03091B]/80 font-bold">{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#03091B]/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full right-0 mt-2 min-w-[180px] bg-[#03091B]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] z-50"
          >
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => { audio.playClick(); switchLang(l.code); setOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-semibold transition-colors ${lang === l.code ? 'text-white bg-white/[0.06]' : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'}`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {lang === l.code && <Check className="w-3.5 h-3.5 text-[#FF8731]" />}
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
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

let hospitalsCache = null;
const loadHospitals = async () => {
  if (hospitalsCache) return hospitalsCache;
  const res = await fetch('/hospitals.json');
  hospitalsCache = await res.json();
  return hospitalsCache;
};

const Field = ({ icon: Icon, label, placeholder, value, onChange, accent = '#8756FA', type = 'text' }) => (
  <div className="space-y-2">
    <label className="block text-[10.5px] font-bold text-slate-400 uppercase ml-1 tracking-[0.18em]">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-white transition-colors duration-300 z-10" />
      <input
        type={type}
        required
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(capitalize(e.target.value))}
        placeholder={placeholder}
        style={{ '--accent': accent }}
        className="block w-full pl-11 pr-4 h-12 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/[0.08] focus:border-[var(--accent)]/60 rounded-2xl text-white text-[15px] font-semibold placeholder-slate-600 outline-none transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] focus:shadow-[0_0_0_3px_var(--accent)/0.15,inset_0_1px_2px_rgba(0,0,0,0.4)]"
      />
    </div>
  </div>
);

const HospitalSearch = ({ value, onChange, placeholder }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    loadHospitals();
    const onClick = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const search = useCallback(async (q) => {
    if (!q || q.length < 2) { setResults([]); setOpen(false); return; }
    const list = await loadHospitals();
    const lower = q.toLowerCase();
    const matches = list.filter(h => h.name.toLowerCase().includes(lower)).slice(0, 7);
    setResults(matches);
    setOpen(matches.length > 0);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 150);
  };

  const handleSelect = (item) => {
    setQuery(item.name);
    onChange(item.name);
    setOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} className="relative group">
      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-white transition-colors duration-300 z-10 pointer-events-none" />
      <input
        type="text"
        required
        autoComplete="off"
        className="block w-full pl-11 pr-4 h-12 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06] border border-white/[0.08] focus:border-[#FF8731]/60 rounded-2xl text-white text-[15px] font-semibold placeholder-slate-600 outline-none transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] focus:shadow-[0_0_0_3px_rgba(255,135,49,0.15),inset_0_1px_2px_rgba(0,0,0,0.4)]"
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
            className="absolute top-full left-0 right-0 mt-2 bg-[#03091B]/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] z-50 max-h-[240px] overflow-y-auto"
          >
            {results.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(item)}
                  className="flex flex-col px-4 py-3 w-full text-left hover:bg-white/[0.04] transition-colors border-b border-white/5 last:border-0"
                >
                  <span className="text-white font-semibold text-[13px] truncate">{item.name}</span>
                  {item.city && <span className="text-slate-500 text-[11px] truncate mt-0.5 font-medium">{item.city}</span>}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const BrandPanel = () => (
  <div className="relative flex flex-col justify-center items-center lg:items-start text-center lg:text-left lg:pr-8 xl:pr-12 py-2">
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="inline-flex items-center gap-2 mb-4 lg:mb-6 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_24px_-12px_rgba(3,9,27,0.15)]"
    >
      <Sparkles className="w-3.5 h-3.5 text-[#FF8731]" />
      <span className="text-[10.5px] font-black tracking-[0.22em] uppercase text-[#03091B]/80">Lemons Training Hub</span>
    </motion.div>

    <motion.h1
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="font-serif font-black text-[#03091B] leading-[1.02] tracking-[-0.035em] text-[44px] sm:text-[56px] lg:text-[64px] xl:text-[76px]"
      style={{ WebkitFontSmoothing: 'antialiased', textWrap: 'balance', textShadow: '0 2px 24px rgba(255,255,255,0.45)' }}
    >
      Il training<br/>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF8731] to-[#FF9E54]">che accoglie</span>
    </motion.h1>

    <motion.p
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="mt-4 lg:mt-6 text-[#03091B]/70 text-[15px] lg:text-[17px] leading-relaxed max-w-[440px] font-bold"
    >
      Preparati a vivere la realtà virtuale in reparto.<br/>Un percorso formativo semplice, intuitivo e sicuro.
    </motion.p>
  </div>
);

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

    const isDemoAccount = (firstName.toLowerCase().trim() === 'mario' && lastName.toLowerCase().trim() === 'rossi') || firstName.toLowerCase().trim() === 'demo';
    if (isDemoAccount) {
      localStorage.setItem(`lemo_progress_${fullName}`, JSON.stringify([1, 2, 3, 4]));
    }

    const userData = { name: fullName, firstName, lastName, hospital, department, patientType, mode };
    localStorage.setItem('lemo_user', JSON.stringify(userData));

    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from('users')
      .select('id, login_count, first_login, completed_modules')
      .eq('name', fullName)
      .maybeSingle();

    if (existing) {
      await supabase.from('users').update({
        first_name: firstName, last_name: lastName, hospital, department,
        patient_type: patientType, mode,
        login_count: (existing.login_count || 1) + 1,
        last_login: now,
        completed_modules: isDemoAccount ? [1, 2, 3, 4] : (existing.completed_modules || []),
      }).eq('name', fullName);
    } else {
      await supabase.from('users').insert({
        name: fullName, first_name: firstName, last_name: lastName,
        hospital, department, patient_type: patientType, mode,
        login_count: 1, first_login: now, last_login: now,
        completed_modules: isDemoAccount ? [1, 2, 3, 4] : [],
      });
    }

    const allUsers = JSON.parse(localStorage.getItem('lemo_all_users')) || {};
    if (allUsers[fullName]) {
      allUsers[fullName].loginCount = (allUsers[fullName].loginCount || 1) + 1;
      allUsers[fullName].lastLogin = now;
      allUsers[fullName].hospital = hospital;
      allUsers[fullName].department = department;
      allUsers[fullName].patientType = patientType;
      if (isDemoAccount) allUsers[fullName].completedModulesList = [1, 2, 3, 4];
    } else {
      allUsers[fullName] = { ...userData, loginCount: 1, firstLogin: now, lastLogin: now, completedModulesList: isDemoAccount ? [1, 2, 3, 4] : [] };
    }
    localStorage.setItem('lemo_all_users', JSON.stringify(allUsers));

    navigate(`/home?mode=${mode}`);
  };

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.25 } } };
  const item = { hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 110, damping: 20 } } };

  const canSubmit = firstName.trim() && lastName.trim() && hospital.trim() && department.trim() && patientType;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[100dvh] w-full font-sans text-white overflow-x-hidden"
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/bg-clouds.png')" }} />
        <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }} />
      </div>

      <header className="relative z-20 grid grid-cols-3 items-center px-5 sm:px-8 lg:px-12 pt-5 sm:pt-8">
        <div />
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="justify-self-center"
        >
          <img
            src="/images/logos/logo esteso bianco png.png"
            alt="Lemons in the room"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_2px_12px_rgba(3,9,27,0.35)] drop-shadow-[0_8px_32px_rgba(3,9,27,0.20)]"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="justify-self-end"
        >
          <LangPicker />
        </motion.div>
      </header>

      <main className="relative z-10 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 sm:py-10 lg:py-14 min-h-[calc(100dvh-80px)]">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[1180px] grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-8 items-stretch"
        >
          <BrandPanel />

          <motion.section
            variants={item}
            className="relative overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] bg-[#03091B]/55 backdrop-blur-[40px] border border-white/[0.12] shadow-[0_30px_80px_-20px_rgba(3,9,27,0.6)] p-6 sm:p-8 lg:p-10"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-[#FF8731] opacity-[0.10] blur-[80px] pointer-events-none" />

            <motion.div variants={item} className="relative z-10 mb-6 lg:mb-8 flex flex-col items-center">
              <span className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#FF8731]/12 border border-[#FF8731]/30 mb-4">
                <img
                  src="/images/logos/logo png.png"
                  alt=""
                  aria-hidden="true"
                  className="w-4 h-4 object-contain drop-shadow-[0_0_6px_rgba(255,135,49,0.5)]"
                />
                <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#FF9E54]">{w.badge}</span>
              </span>
              <h2 className="font-serif font-black text-white text-[42px] sm:text-[52px] leading-[1] tracking-[-0.035em] text-center">
                {w.title}
              </h2>
              <p className="mt-3 text-slate-300 text-[14px] sm:text-[15px] font-medium leading-relaxed max-w-[360px] text-center">
                {w.description}
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              <motion.div variants={item} className="grid grid-cols-2 gap-3">
                <Field icon={Type} label={w.firstName} placeholder={w.placeholderFirst} value={firstName} onChange={setFirstName} accent="#8756FA" />
                <Field icon={SquareUser} label={w.lastName} placeholder={w.placeholderLast} value={lastName} onChange={setLastName} accent="#8756FA" />
              </motion.div>

              <motion.div variants={item} className="space-y-2">
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase ml-1 tracking-[0.18em]">{w.hospital}</label>
                <HospitalSearch value={hospital} onChange={setHospital} placeholder={w.placeholderHospital} />
              </motion.div>

              <motion.div variants={item}>
                <Field icon={Stethoscope} label={w.department} placeholder={w.placeholderDept} value={department} onChange={setDepartment} accent="#FF8731" />
              </motion.div>

              <motion.div variants={item} className="pt-1">
                <label className="block text-[10.5px] font-bold text-slate-400 uppercase ml-1 tracking-[0.18em] mb-3">{w.patientProfile}</label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { id: 'pediatria', label: w.pediatria, accent: '#8756FA', img: '/images/profilo-pediatria.png' },
                    { id: 'adulti',    label: w.adulti,    accent: '#FF8731', img: '/images/profilo-adulti.png'    },
                  ].map(p => {
                    const sel = patientType === p.id;
                    return (
                      <motion.label
                        key={p.id}
                        whileHover={{ scale: sel ? 1.03 : 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative aspect-square rounded-full overflow-hidden cursor-pointer transition-shadow duration-300 ${sel ? '' : ''}`}
                        style={{
                          border: sel ? `2px solid ${p.accent}` : '1px solid rgba(255,255,255,0.10)',
                          boxShadow: sel ? `0 0 0 4px ${p.accent}25, 0 12px 40px -10px ${p.accent}99` : '0 8px 24px -10px rgba(0,0,0,0.6)',
                        }}
                      >
                        <input
                          type="radio"
                          name="patientType"
                          value={p.id}
                          className="hidden"
                          onChange={(e) => { audio.playClick(); setPatientType(e.target.value); }}
                        />
                        <img
                          src={p.img}
                          alt={p.label}
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${sel ? 'opacity-100 scale-105' : 'opacity-40 grayscale'}`}
                        />
                        <div
                          className="absolute inset-0 transition-opacity duration-500"
                          style={{
                            background: sel
                              ? `linear-gradient(to top, #03091B 5%, ${p.accent}aa 55%, transparent 100%)`
                              : 'linear-gradient(to top, #03091B 5%, rgba(3,9,27,0.55) 55%, transparent 100%)',
                          }}
                        />
                        <span
                          className={`absolute left-0 right-0 bottom-4 sm:bottom-5 text-center font-serif font-black tracking-tight transition-colors duration-300 ${sel ? 'text-white' : 'text-slate-200'}`}
                          style={{ fontSize: 'clamp(15px, 4vw, 19px)', textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
                        >
                          {p.label}
                        </span>
                      </motion.label>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={item} className="pt-3">
                <motion.button
                  type="submit"
                  whileHover={canSubmit ? { scale: 1.015, y: -1 } : {}}
                  whileTap={canSubmit ? { scale: 0.98 } : {}}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                  disabled={!canSubmit}
                  className="group relative w-full h-14 rounded-2xl overflow-hidden font-bold text-[16px] tracking-tight text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: canSubmit
                      ? 'linear-gradient(90deg, #8756FA 0%, #B385FF 50%, #FF8731 100%)'
                      : 'rgba(255,255,255,0.06)',
                    boxShadow: canSubmit
                      ? '0 15px 40px -10px rgba(255,135,49,0.5), 0 8px 24px -8px rgba(135,86,250,0.5), inset 0 1px 0 rgba(255,255,255,0.3)'
                      : 'none',
                  }}
                >
                  {canSubmit && (
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    {w.submit}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
                  </span>
                </motion.button>
                <p className="text-center text-slate-400 text-[11px] mt-3 font-medium">
                  Procedendo accetti il protocollo di sicurezza ospedaliera
                </p>
              </motion.div>
            </form>
          </motion.section>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default Welcome;
