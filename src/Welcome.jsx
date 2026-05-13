import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Stethoscope, ArrowRight, ShieldCheck, UserCheck, Building2, CheckCircle2, Sparkles, Type, SquareUser } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { audio } from './utils/audio';

const capitalize = (str) => {
  if (!str) return '';
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const Welcome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [hospital, setHospital] = useState('');
  const [department, setDepartment] = useState('');
  const [patientType, setPatientType] = useState(''); // 'adulti' o 'pediatria'

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

  const handleSubmit = (e) => {
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

    const allUsers = JSON.parse(localStorage.getItem('lemo_all_users')) || {};
    if (allUsers[fullName]) {
      allUsers[fullName].loginCount = (allUsers[fullName].loginCount || 1) + 1;
      allUsers[fullName].lastLogin = new Date().toISOString();
      allUsers[fullName].hospital = hospital;
      allUsers[fullName].department = department;
      allUsers[fullName].patientType = patientType;
      if (isDemoAccount) allUsers[fullName].completedModulesList = [1, 2, 3, 4];
    } else {
      allUsers[fullName] = {
        ...userData,
        loginCount: 1,
        firstLogin: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        completedModulesList: isDemoAccount ? [1,2,3,4] : []
      };
    }
    localStorage.setItem('lemo_all_users', JSON.stringify(allUsers));

    navigate(`/home?mode=${mode}`);
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } } };
  const itemVariants = { hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[100dvh] flex flex-col md:flex-row font-sans overflow-y-auto md:overflow-hidden relative bg-[#03091B]">
      
      {/* Background Layer Fixed for Mobile/Safari */}
      <div className="fixed inset-0 bg-cover bg-center z-0 bg-[url('/images/bg-clouds.png')]"></div>

      {/* Background Ambience - Removed dark overlay so clouds pop */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

      {/* Lato Sinistro - Lemons Brand Experience */}
      <div className="hidden md:flex md:w-[50%] lg:w-[55%] px-12 lg:px-16 2xl:px-20 py-16 2xl:py-24 flex-col justify-center items-end relative z-10">

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
            Il training <span className="relative inline-block overflow-visible">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#FF8731] to-[#FF9E54] pr-4">che accoglie.</span>
            </span>
          </motion.h1>
          <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-[#03091B]/70 text-lg 2xl:text-2xl max-w-xl font-bold leading-relaxed">
            Preparati a vivere la realtà virtuale in reparto. Un percorso formativo semplice, intuitivo e sicuro.
          </motion.p>
        </div>
      </div>

      {/* Lato Destro - Apple-like Floating Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 relative z-10">

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-[420px] 2xl:max-w-[480px] relative z-10 bg-black/20 backdrop-blur-[40px] p-8 pt-4 md:p-8 md:px-10 2xl:p-10 rounded-[3.5rem] shadow-xl border-t border-l border-white/20 border-r border-b border-white/5 my-8 md:my-0 group/glass max-h-[90vh] overflow-y-auto">

          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[3.5rem] pointer-events-none opacity-50 z-0"></div>

          {/* MOBILE LOGO */}
          <div className="md:hidden flex justify-center mb-8 relative z-10">
            <img src="/images/logo-character-photoroom.png" alt="Lemons Logo" className="h-40 object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]" />
          </div>

          {/* Security Protocol Badge - Moved here for better visibility on all devices */}
          <motion.div variants={itemVariants} className="mb-6 2xl:mb-10 flex items-center justify-center gap-4 bg-white/10 backdrop-blur-3xl p-3 2xl:p-4 rounded-3xl border border-white/10 shadow-lg relative z-10 mx-auto w-fit">
            <div className="w-10 h-10 2xl:w-12 2xl:h-12 bg-gradient-to-br from-[#FF8731]/20 to-[#FF8731]/5 rounded-xl flex items-center justify-center border border-[#FF8731]/20 shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 2xl:w-6 2xl:h-6 text-[#FF8731]" />
            </div>
            <div className="text-left">
              <span className="block text-white text-xs 2xl:text-sm font-bold tracking-wide">Protocollo Sicurezza Ospedaliera</span>
              <span className="block text-slate-300 text-[9px] 2xl:text-[10px] font-medium mt-0.5 flex items-center gap-1"><Sparkles className="w-3 h-3 text-[#FF8731]" /> Lemons in the Room Certified</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-4 2xl:mb-8 text-center relative z-10">
            <h2 
              className="text-5xl 2xl:text-[4rem] font-black font-serif text-[#FF8731] mb-2 2xl:mb-4 tracking-tighter"
              style={{ textShadow: '0 0 40px rgba(255, 135, 49, 0.8), 0 4px 10px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.4)' }}
            >
              Accedi
            </h2>
            <p className="text-slate-300 font-medium text-base 2xl:text-lg leading-relaxed mt-2 2xl:mt-4">Inserisci le tue credenziali operative per sbloccare un'esperienza di training immersiva.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4 2xl:space-y-6 relative z-10 text-left">
            <div className="grid grid-cols-2 gap-4 2xl:gap-5">
              <motion.div variants={itemVariants} className="space-y-1.5 2xl:space-y-2">
                <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md">Nome</label>
                <div className="relative group">
                  <Type className="absolute left-5 2xl:left-6 top-1/2 -translate-y-1/2 h-4 w-4 2xl:h-5 2xl:w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300 z-10" />
                  <input type="text" required className="block w-full pl-12 2xl:pl-14 pr-6 py-4 2xl:py-5 bg-black/40 border border-white/10 focus:bg-[#8756FA]/10 rounded-[2rem] text-white focus:ring-2 focus:ring-[#8756FA]/50 focus:border-[#8756FA] transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(135,86,250,0.4),inset_0_2px_10px_rgba(0,0,0,0.5)] outline-none font-bold text-base 2xl:text-lg placeholder-slate-500" placeholder="Mario" value={firstName} onChange={(e) => setFirstName(capitalize(e.target.value))} />
                </div>
              </motion.div>
              <motion.div variants={itemVariants} className="space-y-1.5 2xl:space-y-2">
                <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md">Cognome</label>
                <div className="relative group">
                  <SquareUser className="absolute left-5 2xl:left-6 top-1/2 -translate-y-1/2 h-4 w-4 2xl:h-5 2xl:w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300 z-10" />
                  <input type="text" required className="block w-full pl-12 2xl:pl-14 pr-6 py-4 2xl:py-5 bg-black/40 border border-white/10 focus:bg-[#8756FA]/10 rounded-[2rem] text-white focus:ring-2 focus:ring-[#8756FA]/50 focus:border-[#8756FA] transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(135,86,250,0.4),inset_0_2px_10px_rgba(0,0,0,0.5)] outline-none font-bold text-base 2xl:text-lg placeholder-slate-500" placeholder="Rossi" value={lastName} onChange={(e) => setLastName(capitalize(e.target.value))} />
                </div>
              </motion.div>
            </div>
            
            <motion.div variants={itemVariants} className="space-y-1.5 2xl:space-y-2">
              <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md">Ospedale</label>
              <div className="relative group">
                <Building2 className="absolute left-5 2xl:left-6 top-1/2 -translate-y-1/2 h-4 w-4 2xl:h-5 2xl:w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300 z-10" />
                <input type="text" required className="block w-full pl-12 2xl:pl-14 pr-6 py-4 2xl:py-5 bg-black/40 border border-white/10 focus:bg-[#FF8731]/10 rounded-[2rem] text-white focus:ring-2 focus:ring-[#FF8731]/50 focus:border-[#FF8731] transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(255,135,49,0.3),inset_0_2px_10px_rgba(0,0,0,0.5)] outline-none font-bold text-base 2xl:text-lg placeholder-slate-500" placeholder="Es. Careggi" value={hospital} onChange={(e) => setHospital(capitalize(e.target.value))} />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-1.5 2xl:space-y-2">
              <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md">Reparto</label>
              <div className="relative group">
                <Stethoscope className="absolute left-5 2xl:left-6 top-1/2 -translate-y-1/2 h-4 w-4 2xl:h-5 2xl:w-5 text-slate-400 group-focus-within:text-white transition-colors duration-300 z-10" />
                <input type="text" required className="block w-full pl-12 2xl:pl-14 pr-6 py-4 2xl:py-5 bg-black/40 border border-white/10 focus:bg-[#FF8731]/10 rounded-[2rem] text-white focus:ring-2 focus:ring-[#FF8731]/50 focus:border-[#FF8731] transition-all duration-300 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] focus:shadow-[0_0_25px_rgba(255,135,49,0.3),inset_0_2px_10px_rgba(0,0,0,0.5)] outline-none font-bold text-base 2xl:text-lg placeholder-slate-500" placeholder="Es. Oncologia" value={department} onChange={(e) => setDepartment(capitalize(e.target.value))} />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2 2xl:space-y-2 pt-2 2xl:pt-4">
              <label className="text-[11px] 2xl:text-[13px] font-bold text-white uppercase ml-2 tracking-widest drop-shadow-md block text-left">Profilo Paziente</label>
              <div className="grid grid-cols-2 gap-4 2xl:gap-5">
                <label className={`relative overflow-hidden flex flex-col items-center justify-center pb-3 2xl:pb-4 aspect-square border rounded-full cursor-pointer transition-all duration-500 group ${patientType === 'pediatria' ? 'border-[#8756FA] ring-2 ring-[#8756FA] shadow-[0_0_30px_rgba(135,86,250,0.5)] scale-[1.03]' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                  <input type="radio" name="patientType" value="pediatria" className="hidden" onChange={(e) => setPatientType(e.target.value)} />
                  <img src="/images/profilo-pediatria.png" alt="Profilo Pediatria" className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${patientType === 'pediatria' ? 'opacity-100 scale-105' : 'opacity-40 grayscale group-hover:opacity-60 group-hover:grayscale-0'}`} />
                  <div className={`absolute inset-0 transition-colors duration-500 ${patientType === 'pediatria' ? 'bg-gradient-to-t from-[#03091B] via-[#8756FA]/60 to-transparent' : 'bg-gradient-to-t from-[#03091B] via-black/50 to-transparent group-hover:from-[#03091B]/90'}`}></div>
                  <span className={`relative z-10 font-black text-lg 2xl:text-xl tracking-tight transition-colors mt-auto ${patientType === 'pediatria' ? 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]' : 'text-slate-300 drop-shadow-md group-hover:text-white'}`}>Pediatria</span>
                </label>
                
                <label className={`relative overflow-hidden flex flex-col items-center justify-center pb-3 2xl:pb-4 aspect-square border rounded-full cursor-pointer transition-all duration-500 group ${patientType === 'adulti' ? 'border-[#FF8731] ring-2 ring-[#FF8731] shadow-[0_0_30px_rgba(255,135,49,0.5)] scale-[1.03]' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}>
                  <input type="radio" name="patientType" value="adulti" className="hidden" onChange={(e) => setPatientType(e.target.value)} />
                  <img src="/images/profilo-adulti.png" alt="Profilo Adulti" className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${patientType === 'adulti' ? 'opacity-100 scale-105' : 'opacity-40 grayscale group-hover:opacity-60 group-hover:grayscale-0'}`} />
                  <div className={`absolute inset-0 transition-colors duration-500 ${patientType === 'adulti' ? 'bg-gradient-to-t from-[#03091B] via-[#FF8731]/60 to-transparent' : 'bg-gradient-to-t from-[#03091B] via-black/50 to-transparent group-hover:from-[#03091B]/90'}`}></div>
                  <span className={`relative z-10 font-black text-lg 2xl:text-xl tracking-tight transition-colors mt-auto ${patientType === 'adulti' ? 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,1)]' : 'text-slate-300 drop-shadow-md group-hover:text-white'}`}>Adulti</span>
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
              <span className="relative z-10 flex items-center gap-3 text-xl 2xl:text-2xl tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Accedi al Training <ArrowRight className="w-6 h-6 2xl:w-7 2xl:h-7" /></span>
            </motion.button>
          </form>
          
        </motion.div>
      </div>
    </motion.div>
  );
};
export default Welcome;