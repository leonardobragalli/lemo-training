import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Lock, CheckCircle, ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Lesson from './Lesson';

const Modules = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'guided';
  const [completedLessons, setCompletedLessons] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [user, setUser] = useState(null);
  const patientType = user?.patientType || 'adulti';

  const lessons = [
    { 
      id: 1, 
      title: "Istruzioni Generali", 
      duration: "2", 
      type: "Video",
      videoUrl: "/videos/ISTRUZIONI GENERALI.mp4", 
      description: "Come accendere il visore, regolarlo sul viso e gestire il volume in pochi passaggi.", 
      question: "Dove si trova il pulsante di accensione del visore?", 
      answers: ["Sotto la rotella posteriore.", "Sulla parte destra, accanto al volume.", "Sotto la parte sinistra del cinturino."], 
      correct: 2,
      slides: [
        { title: "Accensione", content: "Per accendere il visore, tenere premuto per 3 secondi il pulsante sotto la parte sinistra del cinturino." },
        { title: "Regolazione Volume", content: "Il volume si regola dai tasti + e - posti sulla parte inferiore destra del visore." },
        { title: "Indossare il Visore", content: "Allargare il cinturino posteriore, appoggiare il visore sugli occhi in modo confortevole e stringere la rotella per fissarlo." },
        { title: "Hand Tracking", content: "La selezione avviene usando le mani: puntare con indice e pollice (appare un puntino) e unire velocemente indice e pollice per fare 'Click'." }
      ]
    },
    { 
      id: 2, 
      title: "Pulizia e Igienizzazione", 
      duration: "2", 
      type: "Video",
      videoUrl: "/videos/PULIZIA.mp4", 
      description: "Procedura corretta per l'igienizzazione del visore tra un paziente e l'altro.", 
      question: "Cosa bisogna usare per pulire le lenti all'interno del visore?", 
      answers: ["Un panno in microfibra senza soluzione alcolica.", "Una soluzione alcolica e carta assorbente.", "Acqua corrente e sapone."], 
      correct: 0,
      slides: [
        { title: "Igienizzazione Esterne", content: "Tutte le parti a contatto con la pelle sono in materiale plastico e possono essere pulite con un panno in microfibra imbevuto di soluzione alcolica." },
        { title: "Attenzione alle Lenti", content: "IMPORTANTE: Per le lenti interne utilizzare ESCLUSIVAMENTE un panno in microfibra asciutto. Non applicare MAI alcuna soluzione alcolica o liquida sulle lenti." }
      ]
    },
    patientType === 'pediatria'
      ? { 
          id: 3, 
          title: "Ricarica Lemo JR", 
          duration: "1", 
          type: "Video",
          videoUrl: "/videos/Ricarica LEMO JR.mp4", 
          description: "Come rimettere in carica il dispositivo Lemo JR e i controller.", 
          question: "Come capisco che il visore Lemo JR è posizionato correttamente in ricarica?", 
          answers: ["Si illumina il display all'interno.", "Emette un suono e si accendono due spie.", "Vibra tre volte."], 
          correct: 1,
          slides: [
            { title: "Posizionamento in Teca", content: "Per ricaricare il visore Lemo JR, appoggiarlo con cura sui dentini della basetta magnetica situata all'interno della teca di ricarica." },
            { title: "Conferma Ricarica", content: "L'avvio della ricarica è confermato da un suono e dall'accensione di due spie: una sulla basetta e una posta sul lato sinistro del visore." }
          ]
        }
      : { 
          id: 3, 
          title: "Ricarica Lemo", 
          duration: "2", 
          type: "Video",
          videoUrl: "/videos/Ricarica LEMO.mp4", 
          description: "Come rimettere in carica il dispositivo Lemo standard e i controller.", 
          question: "Dove vanno posizionati i controller nella basetta di ricarica?", 
          answers: ["Sopra il visore.", "All'interno del visore.", "Nell'apposito spazio incastrandoli tramite i bottoni magnetici."], 
          correct: 2,
          slides: [
            { title: "Ricarica Visore", content: "La basetta di ricarica per la versione adulti ricarica contemporaneamente visore e controller. Il visore si aggancia magneticamente nella parte centrale della base." },
            { title: "Ricarica Controller", content: "I due controller si incastrano negli appositi spazi laterali della basetta tramite i bottoni magnetici. Le spie si illumineranno per indicare lo stato di carica di ciascun dispositivo." }
          ]
        },
    { 
      id: 4, 
      title: "Simulazione Paziente", 
      duration: "2", 
      type: "Tutorial",
      videoUrl: "/videos/Simulazione.mp4", 
      description: "Simulazione pratica dell'esperienza lato paziente.", 
      question: "Cosa deve fare il paziente se compaiono avvisi di sistema?", 
      answers: ["Togliere immediatamente il visore.", "Premere 'Continua Sessione'.", "Chiamare l'assistenza tecnica."], 
      correct: 1,
      slides: [
        { title: "Fase Iniziale", content: "Il paziente preleva il visore (che viene sempre tenuto in carica), lo posiziona sul viso stringendo la rotella posteriore per trovare la regolazione più comoda." },
        { title: "Avvio e Gestione", content: "Se all'avvio compaiono avvisi di sistema (es. chiedere di continuare la sessione), l'operatore preme 'Continua'. L'esperienza partirà in automatico. Al termine, il visore viene tolto, pulito accuratamente e rimesso in ricarica." }
      ]
    },
  ];

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('lemo_user'));
    if (savedUser) {
      setUser(savedUser);
      setCompletedLessons(JSON.parse(localStorage.getItem(`lemo_progress_${savedUser.name}`)) || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isUnlocked = (index) => mode === 'full' || index === 0 || completedLessons.includes(lessons[index - 1].id);

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 30, scale: 0.98 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } } };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pt-12 pb-6 md:px-10 md:pt-12 lg:px-12 lg:pt-12 2xl:p-16 2xl:pt-20 max-w-[1200px] 2xl:max-w-7xl mx-auto mb-20 md:mb-0 relative z-10 min-h-screen">
      
      {/* Backgrounds */}
      <div className="fixed inset-0 bg-cover bg-center z-[-30] bg-[url('/images/bg-mobile-modules.png')] md:hidden opacity-30 dark:opacity-20 mix-blend-luminosity"></div>
      
      <div className="hidden md:block fixed inset-0 bg-cover bg-center z-[-30] bg-[url('/images/bg-modules.png')] opacity-100"></div>
      {/* Semi-transparent overlay to improve text legibility on PC */}
      <div className="hidden md:block fixed inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[2px] z-[-29]"></div>

      {/* Immersive Background Elements - Performance Optimized */}
      <div className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#8756FA] to-transparent rounded-full blur-[120px] opacity-20 pointer-events-none -z-20"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-[#FF8731] to-transparent rounded-full blur-[100px] opacity-15 pointer-events-none -z-20"></div>

      {/* Hero Header */}
      <div className="mb-8 lg:mb-10 2xl:mb-20 relative z-10">
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="inline-flex items-center gap-2 px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 mb-4 2xl:mb-6 shadow-xl shadow-black/5">
          <Sparkles className="w-3 h-3 2xl:w-4 2xl:h-4 text-[#8756FA]" />
          <span className="text-xs 2xl:text-sm font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#8756FA] to-[#FF8731]">Training Center</span>
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="text-4xl md:text-[3rem] lg:text-[3.5rem] 2xl:text-[4.5rem] font-black font-serif text-[#03091B] dark:text-white tracking-tighter mb-1 leading-[1.1] pr-10 overflow-visible flex flex-wrap items-baseline gap-x-4">
          <span>Libreria</span>
          <span className="relative inline-block overflow-visible">
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#8756FA] to-[#9C73FA] drop-shadow-sm pr-4">Moduli</span>
          </span>
        </motion.h1>
        
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-slate-700 dark:text-slate-400 font-medium text-base lg:text-lg 2xl:text-2xl max-w-2xl leading-relaxed">
          {mode === 'full' ? "Accesso libero a tutti i contenuti formativi." : "Completa le lezioni in sequenza per abilitare la certificazione."}
        </motion.p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6 2xl:gap-8 relative z-10">
        
        {lessons.map((lesson, index) => {
          const unlocked = isUnlocked(index);
          const isCompleted = completedLessons.includes(lesson.id);
          const isExpanded = expandedId === lesson.id;

          return (
            <motion.div 
              variants={item} key={lesson.id}
              className={`group relative overflow-hidden bg-white/40 dark:bg-[#03091B]/40 backdrop-blur-3xl transition-all duration-700 rounded-[2rem] 2xl:rounded-[3rem] border ${
                unlocked ? 'border-white/50 dark:border-white/10 hover:border-[#8756FA]/30 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_80px_-15px_rgba(135,86,250,0.15)] z-10' : 'border-white/20 dark:border-white/5 opacity-60 shadow-none z-0'
              }`}
            >
              {/* Cinematic Background Noise */}
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

              {unlocked && (
                <>
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#8756FA] rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none z-0"></div>
                  <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#FF8731] rounded-full blur-[100px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none z-0"></div>
                </>
              )}
              
              {/* Header (Clickable for toggle) */}
              <div 
                className={`p-6 lg:p-8 2xl:p-10 flex flex-col gap-4 2xl:gap-5 relative z-10 ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                onClick={() => unlocked && setExpandedId(isExpanded ? null : lesson.id)}
              >
                {/* Top Row: Icon + Badges */}
                <div className="flex items-center gap-3 2xl:gap-5">
                  <div className={`w-12 h-12 2xl:w-16 2xl:h-16 rounded-[1rem] 2xl:rounded-[1.2rem] flex items-center justify-center shrink-0 transition-all duration-700 shadow-md border border-white/50 dark:border-white/10 ${
                    isCompleted ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-[#10B981]/30' : unlocked ? 'bg-gradient-to-br from-white to-slate-50 dark:from-[#03091B] dark:to-slate-900 text-[#8756FA] group-hover:scale-105 group-hover:-rotate-3' : 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-6 h-6 2xl:w-8 2xl:h-8" /> : unlocked ? <Play className="w-6 h-6 2xl:w-8 2xl:h-8 ml-1 fill-current" /> : <Lock className="w-6 h-6 2xl:w-8 2xl:h-8" />}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 flex-1">
                    <span className="inline-flex items-center justify-center px-2 py-1 2xl:px-3 2xl:py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-[9px] 2xl:text-[10px] md:text-xs font-black text-[#8756FA] uppercase tracking-widest">Modulo {index + 1}</span>
                    {isCompleted && <span className="inline-flex items-center justify-center px-2 py-1 2xl:px-3 2xl:py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] 2xl:text-[10px] md:text-xs font-black uppercase tracking-widest border border-emerald-500/20 shadow-inner">Completato</span>}
                    <span className="text-[11px] 2xl:text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Clock className="w-3 h-3 2xl:w-3.5 2xl:h-3.5 md:w-4 md:h-4"/> {lesson.duration} min</span>
                  </div>
                </div>

                {/* Bottom Row: Text + Arrow */}
                <div className="flex items-center justify-between gap-4 md:gap-8">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl md:text-2xl 2xl:text-4xl font-black font-serif text-[#03091B] dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#03091B] group-hover:to-[#8756FA] dark:group-hover:from-white dark:group-hover:to-[#9C73FA] transition-all duration-500 mb-1.5 2xl:mb-2 leading-tight drop-shadow-sm break-words">{lesson.title}</h3>
                    <p className="text-xs md:text-sm 2xl:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-4xl break-words pr-2">{lesson.description}</p>
                  </div>
                  
                  <div className={`w-10 h-10 2xl:w-14 2xl:h-14 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${unlocked ? 'bg-white/50 dark:bg-black/20 backdrop-blur-md group-hover:bg-[#8756FA] text-[#8756FA] group-hover:text-white group-hover:scale-110 shadow-lg group-hover:shadow-xl group-hover:shadow-[#8756FA]/40 border border-white/50 dark:border-white/10' : 'hidden'}`}>
                    {isExpanded ? <ChevronUp className="w-5 h-5 2xl:w-6 2xl:h-6" /> : <ChevronDown className="w-5 h-5 2xl:w-6 2xl:h-6" />}
                  </div>
                </div>
              </div>

              {/* Accordion Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-[#FFF5EE]/30 dark:bg-black/30"
                  >
                    <div className="relative z-10 w-full border-t border-white/30 dark:border-white/5">
                      <Lesson 
                        lesson={lesson} 
                        mode={mode} 
                        onComplete={(id) => {
                          if (!completedLessons.includes(id)) {
                            setCompletedLessons([...completedLessons, id]);
                          }
                        }} 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Modules;