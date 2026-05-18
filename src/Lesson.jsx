import { useState, useRef, useEffect } from 'react';
import { CheckCircle, FileText, AlertTriangle, ChevronRight, X, ArrowLeft, Zap, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { audio } from './utils/audio';
import { useLang } from './LanguageContext';
import { supabase } from './utils/supabase';

const Lesson = ({ lesson, mode, onComplete, autoplay = false }) => {
  const { t } = useLang();
  const l = t.lesson;
  const [hasWatched, setHasWatched] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [maxTime, setMaxTime] = useState(0);
  const [progress, setProgress] = useState(0);

  // Stati per le Slide
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const playerRef = useRef(null);
  const videoContainerRef = useRef(null);

  const nextSlide = () => { 
    if (lesson && currentSlideIndex < lesson.slides.length - 1) { audio.playClick(); setCurrentSlideIndex(prev => prev + 1); } else audio.playError(); 
  };
  const prevSlide = () => { 
    if (currentSlideIndex > 0) { audio.playClick(); setCurrentSlideIndex(prev => prev - 1); } else audio.playError(); 
  };

  useEffect(() => {
    const fetchedUser = JSON.parse(localStorage.getItem('lemo_user'));
    if (fetchedUser) {
      const p = JSON.parse(localStorage.getItem(`lemo_progress_${fetchedUser.name}`)) || [];
      if (p.includes(parseInt(lesson.id))) {
        setHasWatched(true);
        setQuizPassed(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  useEffect(() => {
    if (!autoplay || !playerRef.current) return;
    const timer = setTimeout(() => {
      const video = playerRef.current;
      if (!video) return;
      video.play().catch(() => {});
      setTimeout(() => enterFullscreen(), 300);
    }, 2000);
    return () => clearTimeout(timer);
  }, [autoplay]); // eslint-disable-line react-hooks/exhaustive-deps

  const enterFullscreen = () => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };

  const handleTimeUpdate = () => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.currentTime;
    const duration = playerRef.current.duration;
    if (duration > 0) setProgress(currentTime / duration);
    if (hasWatched) return;
    if (currentTime > maxTime) setMaxTime(currentTime);
    if (currentTime > maxTime + 2) {
      playerRef.current.currentTime = maxTime;
      audio.playError();
    }
    if (duration > 0 && currentTime > duration * 0.95 && !showQuiz) {
      setShowQuiz(true);
    }
  };

  const handleEnded = () => {
    if (!hasWatched && mode === 'guided') {
      setShowQuiz(true);
    }
  };

  const handleAnswer = async (index) => {
    if (index === lesson.correct) {
      audio.playSuccess();
      setQuizPassed(true);
      setHasWatched(true);
      setShowQuiz(false);
      const currentUser = JSON.parse(localStorage.getItem('lemo_user'));
      if (currentUser) {
        const progressKey = `lemo_progress_${currentUser.name}`;
        const savedProgress = JSON.parse(localStorage.getItem(progressKey)) || [];
        if (!savedProgress.includes(lesson.id)) {
          const newProgress = [...savedProgress, lesson.id];
          localStorage.setItem(progressKey, JSON.stringify(newProgress));

          // Supabase sync
          const { data: existing } = await supabase
            .from('users')
            .select('completed_modules')
            .eq('name', currentUser.name)
            .maybeSingle();
          if (existing) {
            const updated = [...new Set([...(existing.completed_modules || []), lesson.id])];
            await supabase.from('users').update({ completed_modules: updated }).eq('name', currentUser.name);
          }

          if (onComplete) onComplete(lesson.id);
        }
      }
    } else {
      audio.playError();
      alert(l.wrongAnswer);
    }
  };

  const markAsCompleted = () => {
    if (!quizPassed && mode === 'guided') return;
    
    audio.playClick();
    const currentUser = JSON.parse(localStorage.getItem('lemo_user'));
    if (currentUser) {
      const progressKey = `lemo_progress_${currentUser.name}`;
      const savedProgress = JSON.parse(localStorage.getItem(progressKey)) || [];
      if (!savedProgress.includes(lesson.id)) {
        localStorage.setItem(progressKey, JSON.stringify([...savedProgress, lesson.id]));
        if (onComplete) onComplete(lesson.id);
      }
    }
  };

  if (!lesson) return null;

  return (
    <div className="w-full bg-white/20 dark:bg-[#03091B]/20 overflow-hidden border-t border-white/20 dark:border-white/5 transition-colors duration-500 rounded-b-[2rem] 2xl:rounded-b-[3rem]">
      
      <div className="flex flex-col lg:flex-row h-full">
        
        {/* Video Player Section - Spatial Glass Screen */}
        <div className="lg:w-[60%] xl:w-2/3 relative flex flex-col">
          <div ref={videoContainerRef} className="video-container w-full relative shadow-2xl shrink-0 bg-black overflow-hidden">
            <video
              ref={playerRef}
              src={lesson.videoUrl}
              controls={hasWatched || mode === 'full'}
              controlsList="nodownload noremoteplayback"
              onContextMenu={(e) => e.preventDefault()}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onRateChange={() => { if (!hasWatched && mode === 'guided' && playerRef.current) { playerRef.current.playbackRate = 1; } }}
              onClick={() => { if (!hasWatched && mode === 'guided') { playerRef.current?.paused ? playerRef.current.play() : playerRef.current?.pause(); } }}
              className="w-full h-auto block cursor-pointer"
            />
            {/* Mandatory view badge — solo se non completato */}
            {!hasWatched && mode === 'guided' && (
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-4 left-4 lg:top-5 lg:left-5 bg-black/60 backdrop-blur-xl border border-white/10 text-white text-[10px] lg:text-xs px-3 py-1.5 lg:px-4 lg:py-2 rounded-full font-bold flex items-center gap-2 lg:gap-3 pointer-events-none z-20 shadow-lg">
                <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-[#FF8731]" />
                <span className="tracking-wide uppercase">{l.mandatoryView}</span>
              </motion.div>
            )}
            {/* Custom bottom bar: progress + fullscreen — solo per video non completati */}
            {(!hasWatched && mode === 'guided') && (
              <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-3 pt-6 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#8756FA] to-[#FF8731] rounded-full transition-all duration-200" style={{ width: `${progress * 100}%` }} />
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); enterFullscreen(); }}
                  className="w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 shrink-0"
                >
                  <Maximize className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop: area below video, same bg as sidebar */}
          <div className="hidden lg:flex flex-1 bg-white/40 dark:bg-[#03091B]/40 backdrop-blur-md border-t border-white/30 dark:border-white/5 items-center justify-center p-8 2xl:p-10">
            <motion.button
              whileHover={quizPassed || mode === 'full' ? { scale: 1.02 } : {}}
              whileTap={quizPassed || mode === 'full' ? { scale: 0.98 } : {}}
              onClick={markAsCompleted}
              disabled={!quizPassed && mode === 'guided'}
              className={`w-full max-w-xs py-4 2xl:py-5 px-4 text-sm 2xl:text-lg font-black rounded-full flex items-center justify-center gap-2 2xl:gap-3 transition-all duration-500 relative overflow-hidden group ${
                quizPassed || mode === 'full' ? 'bg-[#03091B] dark:bg-white text-white dark:text-[#03091B] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] cursor-pointer' : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-black/10 dark:border-white/10 shadow-none'
              }`}
            >
              {(quizPassed || mode === 'full') && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>}
              <CheckCircle className={`w-5 h-5 2xl:w-6 2xl:h-6 relative z-10 ${quizPassed || mode === 'full' ? 'text-[#10B981]' : ''}`} />
              <span className="relative z-10 text-center">{quizPassed || mode === 'full' ? l.certify : l.waitingCompletion}</span>
            </motion.button>
          </div>
        </div>

        {/* Sidebar Controls & Quiz - Glassmorphism Console */}
        <div className="lg:w-[40%] xl:w-1/3 bg-white/40 dark:bg-[#03091B]/40 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-white/30 dark:border-white/5 p-6 lg:p-6 2xl:p-10 flex flex-col transition-colors relative">
          
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

          <div className="relative z-10 w-full flex-1">
            <AnimatePresence mode="wait">
              {showQuiz && !quizPassed ? (
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#03091B] p-6 lg:p-6 2xl:p-8 rounded-[1.5rem] 2xl:rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-[#8756FA]/30 mb-6 relative overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#8756FA] rounded-full blur-[60px] opacity-30 pointer-events-none"></div>
                  
                  <h4 className="text-[#8756FA] font-black text-[10px] lg:text-[11px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> {l.interactiveCheck}
                  </h4>
                  <p className="text-white font-bold text-lg lg:text-xl mb-6 leading-snug break-words">{lesson.question}</p>
                  <div className="space-y-3">
                    {lesson.answers.map((ans, i) => (
                      <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left p-4 lg:p-4 2xl:p-5 bg-white/5 hover:bg-[#8756FA] border border-white/10 hover:border-[#8756FA] text-slate-300 hover:text-white font-medium rounded-[1rem] 2xl:rounded-2xl transition-all duration-300 shadow-sm hover:shadow-[0_10px_30px_rgba(135,86,250,0.3)] hover:-translate-y-1 text-sm lg:text-base break-words">
                        {ans}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                  <h3 className="text-[10px] lg:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4 lg:mb-5">{l.additionalResources}</h3>
                  <div className="space-y-4 w-full">
                    <div onClick={() => { audio.playClick(); setIsSlideModalOpen(true); }} className="group bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 lg:p-4 2xl:p-6 rounded-[1.5rem] 2xl:rounded-[2rem] border border-white/50 dark:border-white/10 hover:border-[#FF8731] dark:hover:border-[#FF8731]/50 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-[0_20px_40px_-10px_rgba(255,135,49,0.2)] flex items-center gap-3 lg:gap-4 2xl:gap-6 relative overflow-hidden w-full">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF8731] rounded-full blur-[50px] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                      
                      <div className="w-12 h-12 lg:w-12 lg:h-12 2xl:w-16 2xl:h-16 bg-gradient-to-br from-[#FFF5EE] to-[#FFE8D6] dark:from-[#FF8731]/20 dark:to-[#FF8731]/5 text-[#FF8731] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 shadow-inner border border-[#FF8731]/20"><FileText className="w-6 h-6 lg:w-6 lg:h-6 2xl:w-7 2xl:h-7" /></div>
                      <div className="flex-1 relative z-10 px-1">
                        <h4 className="font-black text-[#03091B] dark:text-white text-base lg:text-lg 2xl:text-xl mb-0.5 group-hover:text-[#FF8731] transition-colors leading-tight break-words">{l.teachingMaterial}</h4>
                      </div>
                      <div className="w-8 h-8 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-[#FF8731] group-hover:text-white transition-all duration-300 relative z-10 shrink-0">
                        <ChevronRight className="w-4 h-4 lg:w-4 lg:h-4 2xl:w-5 2xl:h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!quizPassed && mode === 'guided' && (
              <div className="mt-6 lg:mt-6 2xl:mt-8 bg-[#8756FA]/10 border border-[#8756FA]/20 rounded-[1.5rem] 2xl:rounded-[2rem] p-5 lg:p-5 2xl:p-8 relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-1.5 lg:w-2 h-full bg-[#8756FA]"></div>
                <h4 className="font-bold text-[#8756FA] dark:text-[#9C73FA] mb-1 font-hand text-xl lg:text-xl 2xl:text-2xl">{l.technicalNote}</h4>
                <p className="text-sm lg:text-sm 2xl:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-hand">{l.technicalNoteText}</p>
              </div>
            )}
          </div>

          {/* Mobile only button */}
          <div className="lg:hidden mt-6 relative z-10 w-full">
            <motion.button
              whileHover={quizPassed || mode === 'full' ? { scale: 1.02 } : {}}
              whileTap={quizPassed || mode === 'full' ? { scale: 0.98 } : {}}
              onClick={markAsCompleted}
              disabled={!quizPassed && mode === 'guided'}
              className={`w-full py-4 px-4 text-sm font-black rounded-full flex items-center justify-center gap-2 transition-all duration-500 relative overflow-hidden group ${
                quizPassed || mode === 'full' ? 'bg-[#03091B] dark:bg-white text-white dark:text-[#03091B] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] cursor-pointer' : 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-black/10 dark:border-white/10 shadow-none'
              }`}
            >
              {(quizPassed || mode === 'full') && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>}
              <CheckCircle className={`w-5 h-5 relative z-10 ${quizPassed || mode === 'full' ? 'text-[#10B981]' : ''}`} />
              <span className="relative z-10 text-center">{quizPassed || mode === 'full' ? l.certify : l.waitingCompletion}</span>
            </motion.button>
          </div>
        </div>

      </div>
      
      {/* Slide Viewer Modal - Massive Spatial Overlay */}
      {createPortal(
        <AnimatePresence>
          {isSlideModalOpen && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} animate={{ opacity: 1, backdropFilter: 'blur(20px)' }} exit={{ opacity: 0, backdropFilter: 'blur(0px)' }} transition={{ duration: 0.4 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-8 bg-[#03091B]/95"
            >
              <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0"></div>

              <motion.div 
                initial={{ scale: 0.95, y: 40, rotateX: 10 }} animate={{ scale: 1, y: 0, rotateX: 0 }} exit={{ scale: 0.95, y: 40, rotateX: -10 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-white/10 dark:bg-[#03091B]/80 backdrop-blur-3xl w-full max-w-5xl rounded-[2.5rem] md:rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative border border-white/20 perspective-[1000px]"
                style={{ height: '100%', maxHeight: '85dvh' }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 md:p-8 border-b border-white/10 bg-white/5 shrink-0">
                  <div className="flex items-center gap-4 md:gap-6 min-w-0">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center shadow-inner border border-white/20 shrink-0">
                      <img src="/images/logos/logo bianco panna png.png" alt="Lemons Logo" className="w-6 h-6 md:w-8 md:h-8 object-contain drop-shadow-lg" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black font-serif text-white text-lg md:text-2xl leading-tight tracking-tight truncate">{l.teachingMaterial}</h3>
                      <p className="text-[10px] md:text-sm font-bold text-[#FF8731] tracking-widest uppercase mt-0.5 md:mt-1">Slide {currentSlideIndex + 1} {l.slideOf} {lesson.slides.length}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { audio.playClick(); setIsSlideModalOpen(false); }} className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 border border-transparent hover:border-white/30 transition-all duration-300 shadow-sm shrink-0">
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                </div>

                {/* Slide Content */}
                <div className="flex-1 p-6 md:p-16 overflow-y-auto flex flex-col justify-center relative">
                  
                  {/* Internal ambient glow */}
                  <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-b from-[#8756FA]/10 to-transparent pointer-events-none"></motion.div>

                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={currentSlideIndex}
                      initial={{ opacity: 0, x: 40, filter: 'blur(10px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: -40, filter: 'blur(10px)' }} transition={{ duration: 0.4, ease: "circOut" }}
                      className="w-full max-w-4xl mx-auto text-center relative z-10 px-4"
                    >
                      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black font-serif text-white mb-6 md:mb-10 leading-[1.1] drop-shadow-xl break-normal">
                        {lesson.slides[currentSlideIndex].title}
                      </h2>
                      <p className="text-lg md:text-2xl text-slate-300 leading-relaxed font-medium break-normal">
                        {lesson.slides[currentSlideIndex].content}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Modal Footer / Controls */}
                <div className="p-5 md:p-8 border-t border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-md shrink-0">
                  <button onClick={prevSlide} disabled={currentSlideIndex === 0} className={`px-4 py-3 md:px-6 md:py-4 rounded-full font-black text-sm md:text-lg flex items-center gap-2 md:gap-3 transition-all duration-300 border ${currentSlideIndex === 0 ? 'opacity-30 cursor-not-allowed text-slate-500 border-white/5 bg-transparent' : 'bg-white/10 text-white hover:bg-white/20 border-white/20 shadow-lg hover:shadow-white/10'}`}>
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">{l.prev}</span>
                  </button>
                  
                  <div className="flex gap-1.5 md:gap-3 bg-white/5 p-2 md:p-3 rounded-full border border-white/10 mx-2">
                    {lesson.slides.map((_, i) => (
                      <div key={i} className={`h-2 md:h-3 rounded-full transition-all duration-500 ${i === currentSlideIndex ? 'bg-gradient-to-r from-[#FF8731] to-[#FF9E54] w-6 md:w-10 shadow-[0_0_10px_rgba(255,135,49,0.8)]' : 'bg-white/20 w-2 md:w-3 cursor-pointer hover:bg-white/40'}`} onClick={() => { audio.playClick(); setCurrentSlideIndex(i); }}></div>
                    ))}
                  </div>

                  <button onClick={nextSlide} disabled={currentSlideIndex === lesson.slides.length - 1} className={`px-4 py-3 md:px-6 md:py-4 rounded-full font-black text-sm md:text-lg flex items-center gap-2 md:gap-3 transition-all duration-300 border border-transparent ${currentSlideIndex === lesson.slides.length - 1 ? 'opacity-30 cursor-not-allowed text-slate-500 border-white/5' : 'bg-gradient-to-r from-[#8756FA] to-[#9C73FA] text-white hover:scale-105 shadow-[0_15px_30px_-10px_rgba(135,86,250,0.6)]'}`}>
                    <span className="hidden sm:inline">{l.next}</span> <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default Lesson;