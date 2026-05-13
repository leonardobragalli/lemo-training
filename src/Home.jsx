import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Award, ArrowRight, Zap, Target, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import html2pdf from 'html2pdf.js';

import { audio } from './utils/audio';
import { useLang } from './LanguageContext';

const Home = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);
  const mode = searchParams.get('mode') || 'guided';
  
  const totalLessons = 4;

  const { t } = useLang();
  const h = t.home;

  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const rotateParallax = useTransform(scrollYProgress, [0, 1], [0, 20]);

  // Generate certificate data once per mount using useState initializer for purity
  const [certificateCode] = useState(() => `LMR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`);
  const [certificateDate] = useState(() => new Date().toLocaleDateString('it-IT'));

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('lemo_user'));
    if (!savedUser && mode !== 'full') {
      navigate('/');
    } else if (savedUser) {
      setUser(savedUser);
      const savedProgress = JSON.parse(localStorage.getItem(`lemo_progress_${savedUser?.name}`)) || [];
      setCompletedCount(savedProgress.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, mode]);

  const progressPercentage = Math.round((completedCount / totalLessons) * 100);
  const hasFinishedAll = completedCount === totalLessons;

  const downloadCertificate = () => {
    audio.playSuccess();
    const element = document.getElementById('certificate-template');
    element.style.display = 'block';
    html2pdf().set({
      margin: 0, filename: `Certificato_Lemons_${user?.lastName || 'Utente'}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    }).from(element).save().then(() => element.style.display = 'none');
  };

  const handleNav = (path) => {
    audio.playClick();
    navigate(path);
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
  const item = { hidden: { opacity: 0, y: 40, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pt-8 pb-6 md:px-8 md:pt-12 lg:px-12 lg:pt-16 min-h-screen transition-colors duration-500 relative bg-[#03091B]">
      
      {/* Background Layer Fixed for Mobile/Safari */}
      <div className="fixed inset-0 bg-cover bg-center z-0 bg-[url('/images/bg-mobile-nature.png')] md:bg-[url('/images/bg-pc.png')]"></div>

      {/* Immersive 3D-like Background Elements */}
      <motion.div style={{ y: yParallax, rotate: rotateParallax }} className="fixed top-[10%] right-[5%] w-[40vw] h-[40vw] bg-gradient-to-tr from-[#FF8731]/30 to-transparent rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0"></motion.div>
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, 150]) }} className="fixed bottom-[10%] left-[5%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#8756FA]/20 to-transparent rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0"></motion.div>

      <div className="max-w-[1200px] 2xl:max-w-7xl mx-auto relative z-10 mb-20 md:mb-0">
        {/* Hero Header */}
        <div className="mb-6 lg:mb-8 2xl:mb-12 relative z-10 bg-[#03091B]/20 dark:bg-[#03091B]/40 backdrop-blur-[40px] p-5 lg:p-6 2xl:p-12 rounded-[1.5rem] lg:rounded-[2rem] 2xl:rounded-[3.5rem] border-t border-l border-white/20 border-r border-b border-white/5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] w-full flex flex-col justify-center">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="inline-flex items-center gap-2 px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-2 2xl:mb-4 shadow-xl shadow-black/5 w-fit">
            <Sparkles className="w-3 h-3 2xl:w-4 2xl:h-4 text-[#FF8731]" />
            <span className="text-[9px] lg:text-[10px] 2xl:text-sm font-bold tracking-widest uppercase text-white drop-shadow-md">{h.badge}</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="text-5xl lg:text-[2rem] 2xl:text-[4.5rem] font-black font-serif text-white tracking-tighter mb-1.5 2xl:mb-4 leading-[1.1] pb-1 2xl:pb-2 overflow-visible flex flex-wrap items-baseline gap-x-2 2xl:gap-x-4 drop-shadow-sm">
            <span>{h.greeting}</span>
            <span className="relative inline-block overflow-visible">
              <span className="relative z-10 text-[#A379F9]" style={{ textShadow: '0 0 40px rgba(135, 86, 250, 0.8), 0 4px 10px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.4)' }}>{user?.firstName || h.guest}</span>
            </span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-slate-200 font-medium text-xs lg:text-sm 2xl:text-xl leading-relaxed drop-shadow-md">
            {h.subtitle}
          </motion.p>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8 relative z-10">
          
          {/* Main Progress Dashboard - Epic Glassmorphism */}
          <motion.div
            variants={item}
            className="lg:col-span-8 group relative h-full bg-[#03091B]/20 dark:bg-[#03091B]/40 backdrop-blur-[40px] rounded-[2rem] 2xl:rounded-[3.5rem] p-8 lg:p-10 2xl:p-14 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.3)] border-t border-l border-white/20 border-r border-b border-white/5 flex flex-col md:flex-row items-center gap-8 lg:gap-10 2xl:gap-12"
          >

            <div className="contents">
              
              {/* Solid Matte 3D Skeuomorphic Progress Ring */}
              <div className="relative w-48 h-48 lg:w-56 lg:h-56 2xl:w-64 2xl:h-64 shrink-0 flex items-center justify-center z-10">
                <motion.div 
                  animate={{ rotateY: [0, 5, -5, 0], rotateX: [0, 5, -5, 0] }} 
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-full h-full flex items-center justify-center drop-shadow-[0_15px_25px_rgba(3,9,27,0.5)]"
                >
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 256 256">
                    <defs>
                      <linearGradient id="lemonsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF9E54" /> {/* Lemons Light Orange */}
                        <stop offset="100%" stopColor="#FF8731" /> {/* Lemons Orange */}
                      </linearGradient>
                      
                      {/* Filter for the raised 3D progress bar (clean drop shadow without inner artifacts) */}
                      <filter id="raised3D" x="-20%" y="-20%" width="140%" height="140%">
                        {/* Drop shadow behind the tube */}
                        <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" result="dropShadow" />
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" result="dropShadow2" />
                        
                        {/* Merge shadow with graphic */}
                        <feMerge>
                          <feMergeNode in="dropShadow" />
                          <feMergeNode in="dropShadow2" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      
                      {/* Filter for the recessed track (inner shadow) */}
                      <filter id="recessedTrack" x="-20%" y="-20%" width="140%" height="140%">
                        <feOffset dx="0" dy="4"/>
                        <feGaussianBlur stdDeviation="3" result="offset-blur"/>
                        <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
                        <feFlood floodColor="black" floodOpacity="0.6" result="color"/>
                        <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
                        <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
                      </filter>
                    </defs>

                    {/* Recessed Track */}
                    <circle 
                      cx="128" cy="128" r="110" 
                      fill="none" 
                      stroke="#0d1428" 
                      strokeWidth="18" 
                      filter="url(#recessedTrack)"
                    />

                    {/* Raised 3D Progress Ring */}
                    <circle 
                      cx="128" cy="128" r="110" 
                      fill="none" 
                      stroke="url(#lemonsGradient)" 
                      strokeWidth="18" 
                      strokeLinecap="round" 
                      strokeDasharray="691" 
                      strokeDashoffset={691 - (691 * progressPercentage) / 100} 
                      className="transition-all duration-[2s] ease-out" 
                      filter="url(#raised3D)"
                    />
                  </svg>

                  {/* Center Content with Glass Plate (Matching Hero Panel) */}
                  <div className="absolute inset-[15px] lg:inset-[20px] rounded-full bg-[#03091B]/5 backdrop-blur-[40px] border-t border-l border-white/20 border-r border-b border-white/5 shadow-[0_40px_100px_-10px_rgba(3,9,27,0.8)] flex flex-col items-center justify-center z-10">
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      transition={{ delay: 0.2, type: "spring", stiffness: 120 }} 
                      className="text-4xl lg:text-5xl 2xl:text-6xl font-black font-serif text-white tracking-normal flex items-baseline"
                      style={{ textShadow: '0 8px 16px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.6)' }}
                    >
                      {progressPercentage}
                      <span className="text-2xl 2xl:text-3xl text-white ml-1 font-sans tracking-normal opacity-90">%</span>
                    </motion.span>
                  </div>
                </motion.div>
              </div>
              
              <div className="flex-1 text-center md:text-left relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs 2xl:text-sm font-bold text-white mb-3 2xl:mb-4 border border-white/10 backdrop-blur-md shadow-inner">
                  <Target className="w-3 h-3 2xl:w-4 2xl:h-4 text-[#FF8731]" />
                  {completedCount} {h.modulesOf} {totalLessons} {h.modulesCompleted}
                </div>
                <h2 className="text-3xl lg:text-4xl 2xl:text-5xl font-black font-serif text-white mb-4 2xl:mb-6 leading-tight drop-shadow-sm">
                  {hasFinishedAll ? h.statusDone : h.statusProgress}
                </h2>
                <p className="text-slate-300 text-base 2xl:text-lg mb-6 2xl:mb-8 leading-relaxed font-medium">
                  {hasFinishedAll ? h.descDone : h.descProgress}
                </p>
                
                {!hasFinishedAll ? (
                  <motion.button 
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleNav(`/modules?mode=${mode}`)} 
                    className="w-full md:w-auto px-8 2xl:px-10 py-5 2xl:py-6 bg-gradient-to-r from-[#8756FA] to-[#FF8731] text-white rounded-[2rem] 2xl:rounded-[2.5rem] font-black text-lg 2xl:text-xl flex items-center justify-center gap-3 2xl:gap-4 transition-all shadow-[0_15px_40px_-10px_rgba(135,86,250,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:shadow-[0_20px_60px_-10px_rgba(255,135,49,1),inset_0_2px_4px_rgba(255,255,255,0.5)]"
                  >
                    <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{h.goModules}</span>
                    <div className="w-6 h-6 2xl:w-8 2xl:h-8 rounded-full bg-white/20 flex items-center justify-center relative z-10 transition-colors duration-300 border border-white/30 shadow-inner">
                      <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5" />
                    </div>
                  </motion.button>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={downloadCertificate} 
                    className="w-full md:w-auto px-8 2xl:px-10 py-5 2xl:py-6 bg-gradient-to-r from-[#FF8731] to-[#FF9E54] text-white rounded-[2rem] 2xl:rounded-[2.5rem] font-black text-lg 2xl:text-xl flex items-center justify-center gap-3 2xl:gap-4 transition-all shadow-[0_15px_30px_rgba(255,135,49,0.5),inset_0_2px_10px_rgba(255,255,255,0.4)] hover:shadow-[0_20px_40px_rgba(255,135,49,0.8),inset_0_2px_10px_rgba(255,255,255,0.6)] border border-[#FF8731]/50"
                  >
                    <Award className="w-6 h-6 2xl:w-7 2xl:h-7 relative z-10 drop-shadow-md" /> 
                    <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] tracking-wide">{h.getCert}</span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Action Cards Grid */}
          <motion.div variants={container} className="lg:col-span-4 flex flex-col gap-6 2xl:gap-6">
            
            {/* Card 1 */}
            <motion.div 
              variants={item}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => handleNav(`/modules?mode=${mode}`)} 
              className="flex-1 bg-gradient-to-br from-[#8756FA] to-[#6A35E8] rounded-[2rem] 2xl:rounded-[2.5rem] p-6 lg:p-8 2xl:p-10 cursor-pointer relative overflow-hidden group shadow-[0_20px_40px_-10px_rgba(135,86,250,0.6)] hover:shadow-[0_30px_60px_-10px_rgba(135,86,250,0.8)] border-t border-l border-white/30 border-r border-b border-white/10"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay"></div>
              <div className="absolute -right-10 -top-10 w-32 h-32 2xl:w-40 2xl:h-40 bg-white/20 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="w-12 h-12 2xl:w-16 2xl:h-16 bg-white/20 backdrop-blur-md rounded-[1rem] 2xl:rounded-2xl flex items-center justify-center mb-4 2xl:mb-6 border border-white/30 text-white shadow-inner group-hover:rotate-12 transition-transform duration-500">
                <Play className="w-6 h-6 2xl:w-8 2xl:h-8 fill-current drop-shadow-md" />
              </div>
              <h3 className="text-2xl lg:text-[1.75rem] 2xl:text-3xl font-black font-serif text-white mb-2 relative z-10 tracking-tight drop-shadow-sm leading-tight whitespace-pre-line">{h.exploreTitle}</h3>
              <div className="absolute bottom-6 right-6 2xl:bottom-8 2xl:right-8 w-10 h-10 2xl:w-12 2xl:h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:text-[#8756FA] text-white transition-all duration-300">
                <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </motion.div>
            
            {/* Card 2 - Aggiornata con gradiente colorato */}
            <motion.div 
              variants={item}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => handleNav(`/support?mode=${mode}`)} 
              className="flex-1 bg-gradient-to-br from-[#FF8731] to-[#E65C00] rounded-[2rem] 2xl:rounded-[2.5rem] p-6 lg:p-8 2xl:p-10 cursor-pointer relative overflow-hidden group shadow-[0_20px_40px_-10px_rgba(255,135,49,0.6)] hover:shadow-[0_30px_60px_-10px_rgba(255,135,49,0.8)] border-t border-l border-white/30 border-r border-b border-white/10"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay"></div>
              <div className="absolute -right-10 -bottom-10 w-32 h-32 2xl:w-40 2xl:h-40 bg-white/20 rounded-full blur-[40px] group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="w-12 h-12 2xl:w-16 2xl:h-16 bg-white/20 backdrop-blur-md rounded-[1rem] 2xl:rounded-2xl flex items-center justify-center mb-4 2xl:mb-6 border border-white/30 text-white shadow-inner group-hover:-rotate-12 transition-transform duration-500">
                <Zap className="w-6 h-6 2xl:w-8 2xl:h-8 drop-shadow-md fill-current" />
              </div>
              <h3 className="text-2xl lg:text-[1.75rem] 2xl:text-3xl font-black font-serif text-white mb-2 relative z-10 tracking-tight drop-shadow-md leading-tight whitespace-pre-line">{h.supportTitle}</h3>
              <div className="absolute bottom-6 right-6 2xl:bottom-8 2xl:right-8 w-10 h-10 2xl:w-12 2xl:h-12 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-md border border-white/20 group-hover:bg-white group-hover:text-[#FF8731] transition-all duration-300 shadow-inner">
                <ArrowRight className="w-4 h-4 2xl:w-5 2xl:h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
              </div>
            </motion.div>

          </motion.div>

        </motion.div>
      </div>

      {/* Certificato Invisibile */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div id="certificate-template" style={{ width: '1123px', height: '794px', backgroundColor: '#ffffff', position: 'relative', overflow: 'hidden', fontFamily: "'Nunito', sans-serif" }}>
          
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, border: '25px solid #03091B', boxSizing: 'border-box' }}></div>
          <div style={{ position: 'absolute', top: '35px', left: '35px', right: '35px', bottom: '35px', border: '2px solid #e2e8f0', boxSizing: 'border-box' }}></div>
          <div style={{ position: 'absolute', top: '40px', left: '40px', right: '40px', bottom: '40px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}></div>

          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', backgroundColor: '#FF8731', borderRadius: '50%', opacity: '0.2' }}></div>
          <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '500px', height: '500px', backgroundColor: '#03091B', borderRadius: '50%', opacity: '0.05' }}></div>

          <div style={{ position: 'relative', zIndex: 10, height: '100%', padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img src="/images/logos/logo esteso nero png.png" alt="Lemons in the Room" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} />
              </div>
              <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>Codice Attestato</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#03091B', letterSpacing: '4px', fontWeight: 'bold', fontFamily: 'monospace' }}>{certificateCode}</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '-20px' }}>
              <div style={{ marginBottom: '30px' }}>
                <div style={{ display: 'inline-block' }}>
                  <h1 style={{ margin: 0, fontSize: '56px', fontWeight: '900', color: '#03091B', letterSpacing: '4px', textTransform: 'uppercase', fontFamily: "'Recoleta Alt', serif" }}>
                    Attestato di Qualifica
                  </h1>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#FF8731', margin: '15px auto 0 auto' }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase' }}>Conferito con merito a:</p>
                <h2 style={{ margin: 0, fontSize: '48px', fontWeight: 'bold', color: '#03091B', textTransform: 'capitalize' }}>
                  {user?.name || 'Mario Rossi'}
                </h2>
              </div>

              <div>
                <p style={{ margin: '0 auto', fontSize: '18px', color: '#475569', lineHeight: '1.5', maxWidth: '800px' }}>
                  Per aver completato con successo l'intero percorso formativo e aver dimostrato piena competenza tecnica, operativa e procedurale nell'utilizzo dell'ecosistema <strong>Lemons in the Room</strong> presso la struttura <strong>{user?.hospital || 'Struttura Ospedaliera'}</strong> ({user?.department || 'Reparto'}).
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 20px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ margin: '0 auto 8px auto', fontSize: '20px', fontWeight: 'bold', color: '#03091B', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', maxWidth: '180px' }}>{certificateDate}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>Data di Rilascio</p>
              </div>

              <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '900', color: '#03091B', textAlign: 'center', lineHeight: '1.2', marginBottom: '8px', letterSpacing: '1px' }}>LEMONS<br/>CERTIFIED</span>
                <img src="/images/logos/Logo nero png.png" alt="Lemons Certified" style={{ width: '40px', height: 'auto', objectFit: 'contain' }} />
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ margin: '0 auto 8px auto', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', maxWidth: '220px', display: 'flex', justifyContent: 'center' }}>
                  <img src="/images/firma-ceo.png" alt="Firma CEO Lemons" style={{ height: '50px', objectFit: 'contain' }} />
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>Firma Autorizzata</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

    </motion.div>
  );
};
export default Home;