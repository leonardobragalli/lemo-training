import { useState } from 'react';
import { HelpCircle, MessageSquareHeart, Phone, Send, ChevronDown, ChevronUp, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from './utils/audio';
import { useLang } from './LanguageContext';

const Support = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketType, setTicketType] = useState('Tecnico');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useLang();
  const s = t.support;

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    
    audio.playClick();
    setIsSubmitting(true);
    setErrorMessage('');
    
    const savedUser = JSON.parse(localStorage.getItem('lemo_user')) || {};
    
    const payload = {
      subject: `[${ticketType}] Ticket Supporto: ${ticketSubject}`,
      ticketType: ticketType,
      message: ticketMessage,
      user_name: savedUser.name || 'Sconosciuto',
      hospital: savedUser.hospital || 'Non specificato',
      department: savedUser.department || 'Non specificato',
      patientType: savedUser.patientType || 'Non specificato'
    };

    try {
      const [r1, r2] = await Promise.all([
        fetch('https://formspree.io/f/mjglzlqo', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
        fetch('https://formspree.io/f/mqenjjnb', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
      ]);

      if (r1.ok && r2.ok) {
        setTicketSent(true);
        setTicketSubject('');
        setTicketMessage('');
        setTimeout(() => setTicketSent(false), 5000);
      } else {
        setErrorMessage(s.errorSend);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(s.errorConnection);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = s.faqs;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pt-12 pb-6 md:px-10 md:pt-12 lg:px-12 lg:pt-12 2xl:p-16 2xl:pt-20 max-w-[1200px] 2xl:max-w-[1600px] mx-auto mb-20 md:mb-0 relative z-10 min-h-screen">
      
      {/* Backgrounds */}
      <div className="fixed inset-0 bg-cover bg-center z-[-30] bg-[url('/images/bg-mobile-support.png')] md:hidden opacity-30 dark:opacity-20 mix-blend-luminosity"></div>
      
      <div className="hidden md:block fixed inset-0 bg-cover bg-center z-[-30] bg-[url('/images/bg-support.png')] opacity-100"></div>
      {/* Semi-transparent overlay to improve text legibility on PC */}
      <div className="hidden md:block fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[2px] z-[-29]"></div>

      {/* Immersive Background Elements - Performance Optimized */}
      <div className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#FF8731] to-transparent rounded-full blur-[120px] opacity-20 pointer-events-none -z-20"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-[#8756FA] to-transparent rounded-full blur-[100px] opacity-15 pointer-events-none -z-20"></div>

      {/* Hero Header */}
      <div className="mb-8 lg:mb-10 2xl:mb-20 relative z-10">
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="inline-flex items-center gap-2 px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 mb-4 2xl:mb-6 shadow-xl shadow-black/5">
          <Sparkles className="w-3 h-3 2xl:w-4 2xl:h-4 text-[#8756FA]" />
          <span className="text-xs 2xl:text-sm font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#8756FA] to-[#FF8731]">{s.badge}</span>
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="text-5xl md:text-[3rem] lg:text-[3.5rem] 2xl:text-[4.5rem] font-black font-serif text-[#03091B] dark:text-white tracking-tighter mb-1 leading-[1.1] pr-10 overflow-visible flex flex-wrap items-baseline gap-x-4">
          <span>{s.titleMain}</span>
          <span className="relative inline-block overflow-visible">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#FF8731] to-[#FF9E54] drop-shadow-sm pr-4">{s.titleAccent}</span>
          </span>
        </motion.h1>
        
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-slate-700 dark:text-slate-400 font-medium text-base lg:text-lg 2xl:text-2xl max-w-2xl leading-relaxed">
          {s.subtitle}
        </motion.p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6 2xl:gap-8 relative z-10">
        
        {/* Accordion FAQ (Glassmorphism Extreme) */}
        <motion.div variants={item} className="space-y-4 2xl:space-y-6 relative">
          <h2 className="text-2xl lg:text-[1.75rem] 2xl:text-4xl font-black font-serif text-[#03091B] dark:text-white mb-4 2xl:mb-5 flex items-center gap-3 2xl:gap-4 drop-shadow-sm">
            <HelpCircle className="w-7 h-7 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 text-[#8756FA]" />
            {s.faqTitle}
          </h2>
          
          <div className="space-y-3 2xl:space-y-5">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/40 dark:bg-[#03091B]/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[1.5rem] 2xl:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(135,86,250,0.15)] hover:border-[#8756FA]/30 group relative">
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>
                
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-5 py-4 lg:px-6 lg:py-5 2xl:px-8 2xl:py-7 flex items-center justify-between font-black text-sm lg:text-base 2xl:text-xl text-[#03091B] dark:text-white text-left group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#8756FA] group-hover:to-[#9C73FA] transition-all relative z-10"
                >
                  <span className="pr-4 leading-tight">{faq.q}</span>
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 2xl:w-12 2xl:h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner ${openFaq === index ? 'bg-gradient-to-br from-[#8756FA] to-[#6A35E8] text-white shadow-[#8756FA]/30' : 'bg-white/50 dark:bg-black/20 text-slate-400 border border-white/50 dark:border-white/5 group-hover:bg-[#8756FA]/10 group-hover:text-[#8756FA] group-hover:border-[#8756FA]/20'}`}>
                    {openFaq === index ? <ChevronUp className="w-4 h-4 lg:w-5 lg:h-5 2xl:w-6 2xl:h-6" /> : <ChevronDown className="w-4 h-4 lg:w-5 lg:h-5 2xl:w-6 2xl:h-6" />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="px-5 pb-5 lg:px-6 lg:pb-6 2xl:px-8 2xl:pb-8 text-slate-600 dark:text-slate-300 font-medium text-sm lg:text-base 2xl:text-lg leading-relaxed relative z-10"
                    >
                      <div className="pt-3 lg:pt-4 2xl:pt-6 border-t border-slate-300 dark:border-slate-800/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contatti Diretti & Form */}
        <motion.div variants={item} className="space-y-4 2xl:space-y-8">
          <h2 className="text-2xl lg:text-[1.75rem] 2xl:text-4xl font-black font-serif text-[#03091B] dark:text-white mb-4 2xl:mb-5 flex items-center gap-3 2xl:gap-4 drop-shadow-sm">
            <div className="w-3 h-6 2xl:w-4 2xl:h-12 bg-gradient-to-b from-[#FF8731] to-[#FF9E54] rounded-full shadow-[0_0_20px_rgba(255,135,49,0.6)]"></div>
            {s.directTitle}
          </h2>

          <div className="flex flex-col gap-3 2xl:gap-6">
            {/* Tech Support */}
            <div className="bg-gradient-to-br from-[#03091B]/95 to-[#131A33]/90 dark:from-[#03091B]/80 dark:to-[#03091B]/60 backdrop-blur-3xl rounded-[1.5rem] 2xl:rounded-[2.5rem] p-5 2xl:p-8 text-white relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border border-white/10 group">
              <div className="absolute top-[-50%] right-[-20%] w-[200px] h-[200px] 2xl:w-[300px] 2xl:h-[300px] bg-[#FF8731] rounded-full blur-[60px] 2xl:blur-[80px] opacity-20 pointer-events-none"></div>
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
              
              <div className="relative z-10">
                <div className="flex flex-row items-center gap-3 2xl:gap-6 mb-3 2xl:mb-5">
                  <div className="w-12 h-12 2xl:w-16 2xl:h-16 bg-gradient-to-br from-[#FF8731]/20 to-[#FF8731]/5 rounded-[1rem] 2xl:rounded-[1.2rem] flex items-center justify-center shrink-0 border border-white/10 shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">
                    <Phone className="w-5 h-5 2xl:w-8 2xl:h-8 text-[#FF8731] drop-shadow-md" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/50 font-bold text-[9px] 2xl:text-xs mb-0.5 tracking-[0.2em] uppercase flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5 2xl:w-3 2xl:h-3 text-[#FF8731] shrink-0" /> {s.techSupport}
                    </p>
                    <p className="text-[11px] 2xl:text-sm text-slate-300 leading-tight">{s.techDesc}</p>
                  </div>
                </div>

                <div className="space-y-2.5 2xl:space-y-4 pl-[3.5rem] 2xl:pl-[4.5rem]">
                  <div className="relative">
                    <div className="absolute left-[-1.25rem] 2xl:left-[-1.5rem] top-1.5 2xl:top-2 w-1.5 h-1.5 rounded-full bg-[#FF8731]"></div>
                    <h3 className="text-base 2xl:text-xl font-black font-serif tracking-tight truncate text-white">Leonardo Bragalli</h3>
                    <a href="tel:+393487589509" className="inline-block text-sm 2xl:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 hover:from-[#FF8731] hover:to-[#FF9E54] transition-all drop-shadow-md">+39 348 758 9509</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Care */}
            <div className="bg-gradient-to-br from-[#03091B]/95 to-[#131A33]/90 dark:from-[#03091B]/80 dark:to-[#03091B]/60 backdrop-blur-3xl rounded-[1.5rem] 2xl:rounded-[2.5rem] p-5 2xl:p-8 text-white relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border border-white/10 group">
              <div className="absolute top-[-50%] right-[-20%] w-[200px] h-[200px] 2xl:w-[300px] 2xl:h-[300px] bg-[#8756FA] rounded-full blur-[60px] 2xl:blur-[80px] opacity-20 pointer-events-none"></div>
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
              
              <div className="relative z-10">
                <div className="flex flex-row items-center gap-3 2xl:gap-6 mb-3 2xl:mb-5">
                  <div className="w-12 h-12 2xl:w-16 2xl:h-16 bg-gradient-to-br from-[#8756FA]/20 to-[#8756FA]/5 rounded-[1rem] 2xl:rounded-[1.2rem] flex items-center justify-center shrink-0 border border-white/10 shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">
                    <Phone className="w-5 h-5 2xl:w-8 2xl:h-8 text-[#8756FA] drop-shadow-md" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white/50 font-bold text-[9px] 2xl:text-xs mb-0.5 tracking-[0.2em] uppercase flex items-center gap-1.5">
                      <Sparkles className="w-2.5 h-2.5 2xl:w-3 2xl:h-3 text-[#8756FA] shrink-0" /> {s.opSupport}
                    </p>
                    <p className="text-[11px] 2xl:text-sm text-slate-300 leading-tight">{s.opDesc}</p>
                  </div>
                </div>

                <div className="space-y-2.5 2xl:space-y-4 pl-[3.5rem] 2xl:pl-[4.5rem]">
                  <div className="relative">
                    <div className="absolute left-[-1.25rem] 2xl:left-[-1.5rem] top-1.5 2xl:top-2 w-1.5 h-1.5 rounded-full bg-[#8756FA]"></div>
                    <h3 className="text-base 2xl:text-xl font-black font-serif tracking-tight truncate text-white">Emma Di Gangi</h3>
                    <a href="tel:+393391725182" className="inline-block text-sm 2xl:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 hover:from-[#8756FA] hover:to-[#9C73FA] transition-all drop-shadow-md">+39 339 172 5182</a>
                  </div>
                  <div className="relative">
                    <div className="absolute left-[-1.25rem] 2xl:left-[-1.5rem] top-1.5 2xl:top-2 w-1.5 h-1.5 rounded-full bg-[#8756FA]"></div>
                    <h3 className="text-base 2xl:text-xl font-black font-serif tracking-tight truncate text-white">Alessandro Romagnosi</h3>
                    <a href="tel:+393395658074" className="inline-block text-sm 2xl:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 hover:from-[#8756FA] hover:to-[#9C73FA] transition-all drop-shadow-md">+39 339 565 8074</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/40 dark:bg-[#03091B]/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[2rem] 2xl:rounded-[3rem] p-6 2xl:p-12 relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] mt-6 2xl:mt-8">
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>
            <div className="absolute top-0 right-0 w-40 h-40 2xl:w-64 2xl:h-64 bg-[#8756FA] rounded-full blur-[80px] 2xl:blur-[120px] opacity-20 pointer-events-none"></div>
            
            <h3 className="text-xl 2xl:text-3xl font-black font-serif text-[#03091B] dark:text-white mb-1 2xl:mb-2 flex items-center gap-2 2xl:gap-4 relative z-10 tracking-tight">
              <Send className="w-5 h-5 2xl:w-8 2xl:h-8 text-[#8756FA]" /> {s.ticketTitle}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm 2xl:text-lg mb-4 2xl:mb-8 relative z-10 leading-relaxed">{s.ticketDesc}</p>
            
            <AnimatePresence mode="wait">
              {ticketSent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-gradient-to-b from-[#8756FA]/10 to-[#8756FA]/5 border border-[#8756FA]/30 p-8 2xl:p-10 rounded-[1.5rem] 2xl:rounded-[2.5rem] flex flex-col items-center justify-center text-center py-10 2xl:py-16 relative z-10 shadow-inner">
                  <CheckCircle className="w-12 h-12 2xl:w-20 2xl:h-20 text-[#8756FA] mb-4 2xl:mb-6 drop-shadow-lg" />
                  <h4 className="font-black font-serif text-2xl 2xl:text-3xl text-[#03091B] dark:text-white mb-2 2xl:mb-3">{s.sentTitle}</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-base 2xl:text-xl font-medium">{s.sentDesc}</p>
                </motion.div>
              ) : (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleTicketSubmit} className="space-y-3 2xl:space-y-5 relative z-10">
                  <div className="space-y-1">
                    <label className="text-[9px] 2xl:text-[11px] font-black text-[#8756FA] uppercase ml-2 tracking-[0.2em]">{s.ticketType}</label>
                    <div className="relative">
                      <select
                        value={ticketType} onChange={(e) => setTicketType(e.target.value)}
                        className="block w-full pl-4 pr-8 2xl:pr-10 py-3 2xl:py-5 bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 focus:bg-white dark:focus:bg-[#03091B]/80 rounded-[1rem] 2xl:rounded-[2rem] text-[#03091B] dark:text-white focus:ring-0 focus:border-[#8756FA] transition-all shadow-inner outline-none font-bold text-sm 2xl:text-lg appearance-none cursor-pointer truncate"
                      >
                        <option value="Tecnico" className="text-black">{s.optionTech}</option>
                        <option value="Operativo" className="text-black">{s.optionOp}</option>
                      </select>
                      <ChevronDown className="absolute right-3 2xl:right-6 top-1/2 -translate-y-1/2 w-4 h-4 2xl:w-5 2xl:h-5 text-[#8756FA] pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] 2xl:text-[11px] font-black text-[#8756FA] uppercase ml-2 tracking-[0.2em]">{s.ticketSubject}</label>
                    <input
                      type="text" required
                      value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)}
                      className="block w-full px-4 2xl:px-6 py-3 2xl:py-5 bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 focus:bg-white dark:focus:bg-[#03091B]/80 rounded-[1rem] 2xl:rounded-[2rem] text-[#03091B] dark:text-white focus:ring-0 focus:border-[#8756FA] transition-all shadow-inner outline-none font-bold text-sm 2xl:text-lg placeholder-slate-400 dark:placeholder-slate-600 truncate"
                      placeholder={s.placeholderSubject}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] 2xl:text-[11px] font-black text-[#8756FA] uppercase ml-2 tracking-[0.2em]">{s.ticketDetails}</label>
                    <textarea
                      required rows="3"
                      value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)}
                      className="block w-full px-4 2xl:px-6 py-3 2xl:py-5 bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 focus:bg-white dark:focus:bg-[#03091B]/80 rounded-[1rem] 2xl:rounded-[2rem] text-[#03091B] dark:text-white focus:ring-0 focus:border-[#8756FA] transition-all shadow-inner outline-none font-medium text-sm 2xl:text-lg placeholder-slate-400 dark:placeholder-slate-600 resize-none"
                      placeholder={s.placeholderDetails}
                    ></textarea>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.95 }}
                    type="submit" disabled={isSubmitting} 
                    className={`w-full py-4 2xl:py-6 mt-2 2xl:mt-4 text-base 2xl:text-xl font-black rounded-[1.5rem] 2xl:rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-2 2xl:gap-4 transition-all relative overflow-hidden group ${isSubmitting ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#8756FA] to-[#9C73FA] text-white shadow-[0_20px_40px_-10px_rgba(135,86,250,0.5)]'}`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                    <span className="relative z-10 tracking-wide drop-shadow-sm">{isSubmitting ? s.submitting : s.submitBtn}</span> {!isSubmitting && <Send className="w-4 h-4 2xl:w-6 2xl:h-6 relative z-10 drop-shadow-sm" />}
                  </motion.button>
                  {errorMessage && <p className="text-red-500 text-xs 2xl:text-sm font-bold text-center mt-2 2xl:mt-4 bg-red-50 dark:bg-red-500/10 py-2 2xl:py-3 rounded-lg 2xl:rounded-xl border border-red-200 dark:border-red-500/20">{errorMessage}</p>}
                </motion.form>
              )}
            </AnimatePresence>
          </div>

        </motion.div>

      </motion.div>
    </motion.div>
  );
};

export default Support;