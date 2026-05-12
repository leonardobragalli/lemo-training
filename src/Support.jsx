import { useState } from 'react';
import { HelpCircle, MessageSquareHeart, Phone, Send, ChevronDown, ChevronUp, CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from './utils/audio';

const Support = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketType, setTicketType] = useState('Tecnico');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      const response = await fetch('https://formspree.io/f/YOUR_ENDPOINT_ID', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setTicketSent(true);
        setTicketSubject('');
        setTicketMessage('');
        setTimeout(() => setTicketSent(false), 5000);
      } else {
        setErrorMessage("Errore durante l'invio del ticket. Riprova più tardi.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Errore di connessione. Verifica di essere connesso a internet.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    { q: "Quanto tempo serve?", a: "Per completare l'intero percorso formativo di base sono sufficienti circa 15-20 minuti. Potrai comunque mettere in pausa e riprendere in qualsiasi momento." },
    { q: "È sicuro per tutti?", a: "Sì, l'ecosistema Lemons in the Room è progettato per essere utilizzato in totale sicurezza dai pazienti. Segui sempre le linee guida cliniche del tuo reparto." },
    { q: "La luce della basetta lampeggia", a: "Se la luce della basetta di ricarica lampeggia, verifica che il visore sia posizionato correttamente sui pin magnetici e che il cavo di alimentazione sia ben collegato alla presa." },
    { q: "Il visore non si carica", a: "Controlla che i contatti metallici sul visore e sulla basetta siano puliti. Assicurati inoltre che l'alimentatore sia inserito in una presa di corrente funzionante." },
    { q: "Come si igienizza il visore?", a: "Usa esclusivamente salviette disinfettanti senza alcol o prodotti approvati dalla tua struttura. Pulisci delicatamente le lenti con un panno in microfibra asciutto per evitare graffi." },
    { q: "Vedo lo scenario spostato", a: "Tieni premuto a lungo (circa 2-3 secondi) il tasto 'Oculus' (quello con il logo) sul controller destro, oppure unisci pollice e indice della mano destra e tieni premuto per ricentrare la visuale." },
    { q: "Sento la voce ma non vedo nulla", a: "Il sensore di prossimità potrebbe non rilevare la testa. Assicurati che il visore sia indossato correttamente e che non ci siano ostacoli davanti al sensore interno tra le due lenti." }
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pt-12 pb-6 md:px-10 md:pt-16 lg:px-16 lg:pt-20 max-w-7xl mx-auto mb-20 md:mb-0 relative z-10 min-h-screen">
      
      {/* Mobile Custom Background */}
      <div className="fixed inset-0 bg-cover bg-center z-[-30] bg-[url('/images/bg-mobile-support.png')] md:hidden opacity-30 dark:opacity-20 mix-blend-luminosity"></div>

      {/* Immersive Background Elements - Performance Optimized */}
      <div className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#FF8731] to-transparent rounded-full blur-[120px] opacity-20 pointer-events-none -z-20"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-[#8756FA] to-transparent rounded-full blur-[100px] opacity-15 pointer-events-none -z-20"></div>

      {/* Hero Header */}
      <div className="mb-10 text-center relative z-10">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="text-5xl md:text-6xl lg:text-[5.5rem] font-black font-serif text-[#03091B] dark:text-white tracking-tighter mb-3 drop-shadow-sm leading-[1.1] pb-2 pr-10 overflow-visible">
          Supporto <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8731] to-[#FF9E54] overflow-visible pr-4">Operativo</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-slate-500 dark:text-slate-400 font-medium text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
          Assistenza immediata e risoluzione problemi per il personale medico.
        </motion.p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Accordion FAQ (Glassmorphism Extreme) */}
        <motion.div variants={item} className="space-y-6 relative">
          <h2 className="text-3xl md:text-4xl font-black font-serif text-[#03091B] dark:text-white mb-5 flex items-center gap-4 drop-shadow-sm">
            <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-[#8756FA]" />
            Domande Frequenti
          </h2>
          
          <div className="space-y-5">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/40 dark:bg-[#03091B]/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(135,86,250,0.15)] hover:border-[#8756FA]/30 group relative">
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>
                
                <button 
                  onClick={() => { audio.playClick(); setOpenFaq(openFaq === index ? null : index); }}
                  className="w-full px-8 py-7 flex items-center justify-between font-black text-lg md:text-xl text-[#03091B] dark:text-white text-left group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#8756FA] group-hover:to-[#9C73FA] transition-all relative z-10"
                >
                  <span className="pr-4 leading-tight">{faq.q}</span>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 shadow-inner ${openFaq === index ? 'bg-gradient-to-br from-[#8756FA] to-[#6A35E8] text-white shadow-[#8756FA]/30' : 'bg-white/50 dark:bg-black/20 text-slate-400 border border-white/50 dark:border-white/5 group-hover:bg-[#8756FA]/10 group-hover:text-[#8756FA] group-hover:border-[#8756FA]/20'}`}>
                    {openFaq === index ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="px-8 pb-8 text-slate-600 dark:text-slate-300 font-medium text-lg leading-relaxed relative z-10"
                    >
                      <div className="pt-6 border-t border-slate-300 dark:border-slate-800/50">
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
        <motion.div variants={item} className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-black font-serif text-[#03091B] dark:text-white mb-5 flex items-center gap-4 drop-shadow-sm">
            <div className="w-4 h-10 md:h-12 bg-gradient-to-b from-[#FF8731] to-[#FF9E54] rounded-full shadow-[0_0_20px_rgba(255,135,49,0.6)]"></div>
            Assistenza Diretta
          </h2>

          <div className="flex flex-col gap-6">
            {/* Tech Support */}
            <div className="bg-gradient-to-br from-[#03091B]/95 to-[#131A33]/90 dark:from-[#03091B]/80 dark:to-[#03091B]/60 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border border-white/10 group">
              <div className="absolute top-[-50%] right-[-20%] w-[300px] h-[300px] bg-[#FF8731] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
              <div className="relative z-10 flex flex-row items-center gap-4 md:gap-6">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#FF8731]/20 to-[#FF8731]/5 rounded-[1.2rem] flex items-center justify-center shrink-0 border border-white/10 shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">
                  <Phone className="w-7 h-7 md:w-8 md:h-8 text-[#FF8731] drop-shadow-md" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/50 font-bold text-[10px] md:text-xs mb-0.5 tracking-[0.2em] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#FF8731] shrink-0" /> Supporto Tecnico
                  </p>
                  <h3 className="text-lg md:text-2xl font-black font-serif mb-0.5 tracking-tight truncate">Alessandro Romagnosi</h3>
                  <p className="text-xs text-slate-400 mb-1 leading-tight">Problemi hardware, sistema o accensione.</p>
                  <a href="tel:+393395658074" className="inline-block text-base md:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 hover:from-[#FF8731] hover:to-[#FF9E54] transition-all drop-shadow-md">+39 339 565 8074</a>
                </div>
              </div>
            </div>

            {/* Customer Care */}
            <div className="bg-gradient-to-br from-[#03091B]/95 to-[#131A33]/90 dark:from-[#03091B]/80 dark:to-[#03091B]/60 backdrop-blur-3xl rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] border border-white/10 group">
              <div className="absolute top-[-50%] right-[-20%] w-[300px] h-[300px] bg-[#8756FA] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
              <div className="relative z-10 flex flex-row items-center gap-4 md:gap-6">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#8756FA]/20 to-[#8756FA]/5 rounded-[1.2rem] flex items-center justify-center shrink-0 border border-white/10 shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">
                  <Phone className="w-7 h-7 md:w-8 md:h-8 text-[#8756FA] drop-shadow-md" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/50 font-bold text-[10px] md:text-xs mb-0.5 tracking-[0.2em] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#8756FA] shrink-0" /> Assistenza Operativa
                  </p>
                  <h3 className="text-lg md:text-2xl font-black font-serif mb-0.5 tracking-tight truncate">Customer Care</h3>
                  <p className="text-xs text-slate-400 mb-1 leading-tight">Dubbi sull'utilizzo, info generali, app.</p>
                  <a href="tel:+393395658074" className="inline-block text-base md:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 hover:from-[#8756FA] hover:to-[#9C73FA] transition-all drop-shadow-md">+39 339 565 8074</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/40 dark:bg-[#03091B]/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] mt-8">
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8756FA] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            
            <h3 className="text-2xl md:text-3xl font-black font-serif text-[#03091B] dark:text-white mb-2 flex items-center gap-3 md:gap-4 relative z-10 tracking-tight">
              <Send className="w-7 h-7 md:w-8 md:h-8 text-[#8756FA]" /> Ticket Immediato
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base md:text-lg mb-8 relative z-10 leading-relaxed">Invia una segnalazione per ricevere assistenza tecnica o operativa prioritaria.</p>
            
            <AnimatePresence mode="wait">
              {ticketSent ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-gradient-to-b from-[#8756FA]/10 to-[#8756FA]/5 border border-[#8756FA]/30 p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center py-16 relative z-10 shadow-inner">
                  <CheckCircle className="w-20 h-20 text-[#8756FA] mb-6 drop-shadow-lg" />
                  <h4 className="font-black font-serif text-3xl text-[#03091B] dark:text-white mb-3">Ticket Inviato!</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xl font-medium">Il team ti assisterà a breve.</p>
                </motion.div>
              ) : (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleTicketSubmit} className="space-y-5 relative z-10">
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-[11px] font-black text-[#8756FA] uppercase ml-2 tracking-[0.2em]">Tipo Assistenza</label>
                    <div className="relative">
                      <select
                        value={ticketType} onChange={(e) => setTicketType(e.target.value)}
                        className="block w-full pl-5 pr-10 py-4 md:py-5 bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 focus:bg-white dark:focus:bg-[#03091B]/80 rounded-[1.5rem] md:rounded-[2rem] text-[#03091B] dark:text-white focus:ring-0 focus:border-[#8756FA] transition-all shadow-inner outline-none font-bold text-sm md:text-lg appearance-none cursor-pointer truncate"
                      >
                        <option value="Tecnico" className="text-black">Guasto Hardware / Sistema</option>
                        <option value="Operativo" className="text-black">Aiuto App / Formazione</option>
                      </select>
                      <ChevronDown className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8756FA] pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] md:text-[11px] font-black text-[#8756FA] uppercase ml-2 tracking-[0.2em]">Oggetto Richiesta</label>
                    <input 
                      type="text" required
                      value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)}
                      className="block w-full px-5 md:px-6 py-4 md:py-5 bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 focus:bg-white dark:focus:bg-[#03091B]/80 rounded-[1.5rem] md:rounded-[2rem] text-[#03091B] dark:text-white focus:ring-0 focus:border-[#8756FA] transition-all shadow-inner outline-none font-bold text-sm md:text-lg placeholder-slate-400 dark:placeholder-slate-600 truncate"
                      placeholder="Es. Visore bloccato..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[#8756FA] uppercase ml-2 tracking-[0.2em]">Dettagli Tecnici</label>
                    <textarea 
                      required rows="4"
                      value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)}
                      className="block w-full px-6 py-5 bg-white/60 dark:bg-black/20 border border-white/50 dark:border-white/10 focus:bg-white dark:focus:bg-[#03091B]/80 rounded-[2rem] text-[#03091B] dark:text-white focus:ring-0 focus:border-[#8756FA] transition-all shadow-inner outline-none font-medium text-lg placeholder-slate-400 dark:placeholder-slate-600 resize-none"
                      placeholder="Descrivi cosa sta succedendo..."
                    ></textarea>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.95 }}
                    type="submit" disabled={isSubmitting} 
                    className={`w-full py-5 md:py-6 mt-4 text-lg md:text-xl font-black rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-3 md:gap-4 transition-all relative overflow-hidden group ${isSubmitting ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#8756FA] to-[#9C73FA] text-white shadow-[0_20px_40px_-10px_rgba(135,86,250,0.5)]'}`}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                    <span className="relative z-10 tracking-wide drop-shadow-sm">{isSubmitting ? 'Invio in corso...' : 'Invia Segnalazione'}</span> {!isSubmitting && <Send className="w-5 h-5 md:w-6 md:h-6 relative z-10 drop-shadow-sm" />}
                  </motion.button>
                  {errorMessage && <p className="text-red-500 text-sm font-bold text-center mt-4 bg-red-50 dark:bg-red-500/10 py-3 rounded-xl border border-red-200 dark:border-red-500/20">{errorMessage}</p>}
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