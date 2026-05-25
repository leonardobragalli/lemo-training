import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Lock, CheckCircle, ChevronDown, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Lesson from './Lesson';
import { useLang } from './LanguageContext';

const ChapterLine = ({ num, label }) => (
  <div className="flex items-center gap-2 mb-2">
    <span className="text-[10px] font-black tracking-[0.22em] uppercase text-white/30">{String(num).padStart(2, '0')}</span>
    <span className="h-px w-8 bg-white/[0.15]" />
    {label && <span className="text-[10px] font-black tracking-[0.22em] uppercase text-white/30">{label}</span>}
  </div>
);

const ProgressBar = ({ percent }) => (
  <div className="relative w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${percent}%` }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="absolute inset-y-0 left-0 rounded-full"
      style={{
        background: 'linear-gradient(90deg, #FFB07A 0%, #FF9E54 50%, #FF8731 100%)',
        boxShadow: '0 0 14px rgba(255,135,49,0.6), inset 0 1px 0 rgba(255,255,255,0.35)',
      }}
    />
  </div>
);

const ModuleCard = ({ index, lesson, state, isOpen, onToggle, isNext, m, cardRef, mode, autoplay, onComplete }) => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [1.2, -1.2]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-1, 1]);

  const locked    = state === 'locked';
  const completed = state === 'completed';

  const onMove = (e) => {
    if (locked) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  const tileBg = completed
    ? 'linear-gradient(135deg, rgba(16,185,129,0.30), rgba(16,185,129,0.10))'
    : locked
    ? 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))'
    : 'linear-gradient(135deg, rgba(135,86,250,0.30), rgba(135,86,250,0.08))';
  const tileBorder = completed
    ? '1px solid rgba(16,185,129,0.35)'
    : locked
    ? '1px solid rgba(255,255,255,0.08)'
    : '1px solid rgba(135,86,250,0.35)';
  const tileShadow = completed
    ? 'inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 20px -8px rgba(16,185,129,0.35)'
    : locked
    ? 'inset 0 1px 0 rgba(255,255,255,0.05)'
    : 'inset 0 1px 0 rgba(255,255,255,0.20), 0 8px 20px -8px rgba(135,86,250,0.40)';

  const setRefs = (el) => {
    ref.current = el;
    if (typeof cardRef === 'function') cardRef(el);
    else if (cardRef) cardRef.current = el;
  };

  return (
    <motion.div
      ref={setRefs}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1600, transformStyle: 'preserve-3d' }}
      className={`relative overflow-hidden rounded-[2rem] lg:rounded-[2.25rem] 2xl:rounded-[3rem] backdrop-blur-[40px] border transition-colors duration-300 ${
        locked
          ? 'bg-[#040F2A]/45 border-white/[0.06] opacity-60'
          : isOpen
          ? 'bg-[#03091B]/60 border-[#8756FA]/40'
          : 'bg-[#040F2A]/65 border-white/[0.10] hover:border-[#8756FA]/30'
      }`}
    >
      {/* Spine */}
      <div
        className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-colors duration-300"
        style={{
          background: completed
            ? 'linear-gradient(180deg, #10B981, #059669)'
            : locked
            ? 'rgba(255,255,255,0.06)'
            : isOpen
            ? 'linear-gradient(180deg, #8756FA, #6A35E8)'
            : 'linear-gradient(180deg, rgba(135,86,250,0.55), rgba(135,86,250,0.20))',
          boxShadow: !locked && (isOpen || completed)
            ? `0 0 18px ${completed ? 'rgba(16,185,129,0.5)' : 'rgba(135,86,250,0.55)'}`
            : 'none',
        }}
      />

      {/* Header */}
      <button
        onClick={() => !locked && onToggle()}
        disabled={locked}
        className={`relative z-10 w-full text-left p-5 md:p-6 lg:p-7 2xl:p-10 flex items-start gap-4 lg:gap-5 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.div
          className="shrink-0 w-14 h-14 lg:w-16 lg:h-16 2xl:w-20 2xl:h-20 rounded-2xl flex items-center justify-center"
          style={{ background: tileBg, border: tileBorder, boxShadow: tileShadow }}
          whileHover={!locked ? { rotate: completed ? 0 : -8, scale: 1.05 } : {}}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        >
          {completed ? (
            <CheckCircle className="w-7 h-7 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 text-emerald-400" strokeWidth={2.2} />
          ) : locked ? (
            <Lock className="w-6 h-6 lg:w-7 lg:h-7 2xl:w-9 2xl:h-9 text-slate-500" strokeWidth={2.2} />
          ) : (
            <Play className="w-7 h-7 lg:w-8 lg:h-8 2xl:w-10 2xl:h-10 text-white fill-white ml-0.5" />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] 2xl:text-xs font-black tracking-[0.18em] uppercase ${
              locked ? 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
                     : 'bg-[#8756FA]/[0.12] text-[#A379F9] border border-[#8756FA]/30'
            }`}>
              {m.module} {String(index + 1).padStart(2, '0')}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] 2xl:text-xs font-bold uppercase tracking-wider ${locked ? 'text-slate-500' : 'text-slate-400'}`}>
              <Clock className="w-3 h-3" /> {lesson.duration} min
            </span>
            {completed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] 2xl:text-xs font-black tracking-[0.16em] uppercase bg-emerald-400/[0.12] text-emerald-300 border border-emerald-400/25">
                <CheckCircle className="w-2.5 h-2.5" /> {m.completed}
              </span>
            )}
            {isNext && !completed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] 2xl:text-xs font-black tracking-[0.16em] uppercase bg-gradient-to-r from-[#FF8731]/15 to-[#FF8731]/5 text-[#FF9E54] border border-[#FF8731]/30">
                <Sparkles className="w-2.5 h-2.5" /> {m.nextBadge}
              </span>
            )}
          </div>

          <h3 className={`font-serif font-black tracking-[-0.025em] leading-[1.05] text-[22px] md:text-[26px] lg:text-[28px] 2xl:text-[34px] ${locked ? 'text-slate-500' : 'text-white'}`}>
            {lesson.title}
          </h3>
          <p className={`mt-1.5 text-[13px] md:text-[14px] 2xl:text-base leading-relaxed font-medium pr-4 ${locked ? 'text-slate-600' : 'text-slate-400'}`}>
            {lesson.description}
          </p>
        </div>

        {!locked && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="shrink-0 w-10 h-10 lg:w-11 lg:h-11 2xl:w-14 2xl:h-14 rounded-full flex items-center justify-center self-center"
            style={{
              background: isOpen ? 'linear-gradient(135deg, #8756FA, #6A35E8)' : 'rgba(255,255,255,0.05)',
              border: isOpen ? '1px solid rgba(255,255,255,0.20)' : '1px solid rgba(255,255,255,0.10)',
              boxShadow: isOpen ? '0 8px 20px -6px rgba(135,86,250,0.55), inset 0 1px 0 rgba(255,255,255,0.25)' : 'none',
            }}
          >
            <ChevronDown className="w-4 h-4 2xl:w-6 2xl:h-6 text-white" strokeWidth={2.8} />
          </motion.div>
        )}
      </button>

      {/* Accordion */}
      <AnimatePresence initial={false}>
        {isOpen && !locked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden relative z-10"
          >
            <div className="border-t border-white/[0.08]" />
            <Lesson
              lesson={lesson}
              mode={mode}
              autoplay={autoplay}
              onComplete={onComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Modules = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'guided';
  const autoopen = parseInt(searchParams.get('autoopen') || '0');
  const [completedLessons, setCompletedLessons] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [autoplayId, setAutoplayId] = useState(null);
  const cardRefs = useRef({});

  const [user, setUser] = useState(null);
  const patientType = user?.patientType || 'adulti';
  const { t } = useLang();
  const m = t.modules;
  const tl = m.lessons;
  const l2 = tl[2];
  const isPediatria = patientType === 'pediatria';

  const lessons = [
    { id: 1, type: "Video", videoUrl: "https://res.cloudinary.com/dzhtuyaq0/video/upload/v1778689579/ISTRUZIONI_GENERALI_compressed_gihswp.mp4", correct: 2,
      title: tl[0].title, duration: tl[0].duration, description: tl[0].description,
      question: tl[0].question, answers: tl[0].answers, slides: tl[0].slides },
    { id: 2, type: "Video", videoUrl: "https://res.cloudinary.com/dzhtuyaq0/video/upload/v1778688357/PULIZIA_gq4bhm.mp4", correct: 0,
      title: tl[1].title, duration: tl[1].duration, description: tl[1].description,
      question: tl[1].question, answers: tl[1].answers, slides: tl[1].slides },
    isPediatria
      ? { id: 3, type: "Video", videoUrl: "https://res.cloudinary.com/dzhtuyaq0/video/upload/v1778688378/Ricarica_LEMO_JR_fb3opv.mp4", correct: 1,
          title: l2.titlePediatria, duration: l2.durationPediatria, description: l2.descriptionPediatria,
          question: l2.questionPediatria, answers: l2.answersPediatria, slides: l2.slidesPediatria }
      : { id: 3, type: "Video", videoUrl: "https://res.cloudinary.com/dzhtuyaq0/video/upload/v1778688371/Ricarica_LEMO_hhcuix.mp4", correct: 2,
          title: l2.titleAdulti, duration: l2.duration, description: l2.descriptionAdulti,
          question: l2.questionAdulti, answers: l2.answersAdulti, slides: l2.slidesAdulti },
    { id: 4, type: "Tutorial", videoUrl: "https://res.cloudinary.com/dzhtuyaq0/video/upload/v1778689695/Simulazione_compressed_wuviqs.mp4", correct: 1,
      title: tl[3].title, duration: tl[3].duration, description: tl[3].description,
      question: tl[3].question, answers: tl[3].answers, slides: tl[3].slides },
  ];

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('lemo_user'));
    if (savedUser) {
      setUser(savedUser);
      setCompletedLessons(JSON.parse(localStorage.getItem(`lemo_progress_${savedUser.name}`)) || []);
    }
    if (autoopen >= 1 && autoopen <= 4) {
      setExpandedId(autoopen);
      setTimeout(() => {
        const el = cardRefs.current[autoopen];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 600);
      setTimeout(() => { setAutoplayId(autoopen); }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isUnlocked = (index) => mode === 'full' || index === 0 || completedLessons.includes(lessons[index - 1].id);

  const total = lessons.length;
  const completedCount = lessons.filter(l => completedLessons.includes(l.id)).length;
  const percent = Math.round((completedCount / total) * 100);

  const nextIndex = (() => {
    for (let i = 0; i < lessons.length; i++) {
      if (!completedLessons.includes(lessons[i].id)) return i;
    }
    return -1;
  })();

  const handleComplete = (id) => {
    if (!completedLessons.includes(id)) {
      setCompletedLessons(prev => [...prev, id]);
    }
  };

  const heroRef = useRef(null);
  const heroMx = useMotionValue(0);
  const heroMy = useMotionValue(0);
  const heroSx = useSpring(heroMx, { stiffness: 100, damping: 20 });
  const heroSy = useSpring(heroMy, { stiffness: 100, damping: 20 });
  const heroRotateY = useTransform(heroSx, [-0.5, 0.5], [2, -2]);
  const heroRotateX = useTransform(heroSy, [-0.5, 0.5], [-1.5, 1.5]);
  const onHeroMove = (e) => {
    const r = heroRef.current.getBoundingClientRect();
    heroMx.set((e.clientX - r.left) / r.width - 0.5);
    heroMy.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onHeroLeave = () => { heroMx.set(0); heroMy.set(0); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pt-12 pb-6 md:px-10 md:pt-12 lg:px-12 lg:pt-12 2xl:p-16 2xl:pt-20 max-w-[1200px] 2xl:max-w-7xl mx-auto mb-20 md:mb-0 relative z-10 min-h-[100dvh]">

      {/* Backgrounds */}
      <div className="fixed inset-0 bg-cover bg-center z-[-30] bg-[url('/images/bg-mobile-modules.png')] md:hidden opacity-30 dark:opacity-20 mix-blend-luminosity"></div>
      <div className="hidden md:block fixed inset-0 bg-cover bg-center z-[-30] bg-[url('/images/bg-modules.png')] opacity-100"></div>
      <div className="hidden md:block fixed inset-0 bg-[#03091B]/60 backdrop-blur-[2px] z-[-29]"></div>
      <div className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tr from-[#8756FA] to-transparent rounded-full blur-[120px] opacity-20 pointer-events-none -z-20"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-[#FF8731] to-transparent rounded-full blur-[100px] opacity-15 pointer-events-none -z-20"></div>

      {/* Hero Header */}
      <motion.div
        ref={heroRef}
        onMouseMove={onHeroMove}
        onMouseLeave={onHeroLeave}
        style={{ rotateX: heroRotateX, rotateY: heroRotateY, transformPerspective: 1400, transformStyle: 'preserve-3d' }}
        className="mb-4 lg:mb-5 2xl:mb-8 relative overflow-hidden bg-[#040F2A]/65 backdrop-blur-[40px] p-5 lg:p-6 2xl:p-12 rounded-[1.5rem] lg:rounded-[2rem] 2xl:rounded-[3.5rem] border border-white/[0.10] shadow-[0_30px_80px_-20px_rgba(3,9,27,0.7)] z-10"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        <div className="flex items-center gap-3 mb-3 2xl:mb-5 flex-wrap">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="inline-flex items-center gap-2 px-3 py-1.5 2xl:px-4 2xl:py-2 rounded-full bg-white/[0.22] backdrop-blur-md border border-white/[0.40] shadow-xl shadow-black/5">
            <img src="/images/logos/logo png.png" className="h-3.5 2xl:h-5 w-auto object-contain" alt="Lemons" />
            <span
              className="text-xs 2xl:text-sm font-bold tracking-widest uppercase bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #8756FA 0%, #B385FF 30%, #FF9E54 65%, #FF8731 100%)', backgroundSize: '200% 100%', animation: 'lemo-badge-shift 4s ease-in-out infinite alternate' }}
            >{m.badge}</span>
          </motion.div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold tracking-[0.12em] uppercase ${completedCount === total ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400' : 'bg-[#FF8731]/10 border border-[#FF8731]/20 text-[#FF9E54]'}`}
          >
            <span className="relative flex w-2 h-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${completedCount === total ? 'bg-emerald-400' : 'bg-[#FF8731]'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${completedCount === total ? 'bg-emerald-400' : 'bg-[#FF8731]'}`} />
            </span>
            {completedCount === total ? m.badgeOperativo : m.badgeInCorso}
          </motion.span>
          {mode === 'full' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.10] text-white/85 text-[10px] font-bold tracking-[0.12em] uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
              {m.freeMode}
            </motion.span>
          )}
        </div>

        <ChapterLine num={1} label={m.chapterTraining} />

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-8">
          <div className="flex-1 min-w-0">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.8 }} className="text-5xl md:text-[3rem] lg:text-[3.5rem] 2xl:text-[4.5rem] font-black font-serif text-white tracking-tighter mb-1 leading-[1.1] overflow-visible flex flex-wrap items-baseline gap-x-4">
              <span>{m.titleMain}</span>
              <span className="relative inline-block overflow-visible">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#8756FA] to-[#9C73FA] drop-shadow-sm pr-4">{m.titleAccent}</span>
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-slate-300 font-medium text-base lg:text-lg 2xl:text-2xl leading-relaxed mt-1">
              {mode === 'full' ? m.subtitleFull : m.subtitleGuided}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="w-full lg:w-[300px] 2xl:w-[360px] shrink-0"
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[10px] font-black tracking-[0.18em] uppercase text-slate-400">{m.progressLabel}</span>
              <span className="font-serif font-black text-white text-[26px] 2xl:text-[32px] leading-none">
                {completedCount}<span className="text-slate-500 text-[16px] font-sans font-bold"> / {total}</span>
              </span>
            </div>
            <ProgressBar percent={percent} />
            <p className="mt-2 text-slate-400 text-[12px] 2xl:text-sm font-medium">
              {percent === 100 ? m.progressDone : m.progressRemaining(total - completedCount)}
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="h-px bg-white/[0.08] mx-2 mb-4 lg:mb-5 2xl:mb-8" />

      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } } }}
        className="flex flex-col gap-4 lg:gap-5 2xl:gap-6 relative z-10"
      >
        {lessons.map((lesson, index) => {
          const unlocked = isUnlocked(index);
          const completed = completedLessons.includes(lesson.id);
          const state = completed ? 'completed' : unlocked ? 'available' : 'locked';
          const isOpen = expandedId === lesson.id;
          const isNext = index === nextIndex && !completed && unlocked;

          return (
            <motion.div
              key={lesson.id}
              variants={{
                hidden: { opacity: 0, y: 24, scale: 0.98 },
                show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 110, damping: 22 } },
              }}
            >
              <ModuleCard
                index={index}
                lesson={lesson}
                state={state}
                isOpen={isOpen}
                onToggle={() => setExpandedId(isOpen ? null : lesson.id)}
                isNext={isNext}
                m={m}
                cardRef={(el) => { cardRefs.current[lesson.id] = el; }}
                mode={mode}
                autoplay={autoplayId === lesson.id}
                onComplete={handleComplete}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Modules;
