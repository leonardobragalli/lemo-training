import React, { useContext } from 'react';
import { NavLink, Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { Home, BookOpen, LifeBuoy, LogOut, Moon, Sun, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeContext } from './ThemeContext';
import { audio } from './utils/audio';

const Layout = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'guided';
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const navItems = [
    { icon: Home, label: 'Home', path: `/home?mode=${mode}` },
    { icon: BookOpen, label: 'Moduli', path: `/modules?mode=${mode}` },
    { icon: LifeBuoy, label: 'Supporto', path: `/support?mode=${mode}` },
  ];

  const handleLogout = () => {
    audio.playClick();
    localStorage.removeItem('lemo_user');
    navigate('/');
  };

  const handleNavClick = () => audio.playClick();

  return (
    <div className={`flex h-[100dvh] overflow-hidden font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#020617]' : 'bg-[#FFF5EE]'}`}>
      
      {/* Sidebar Desktop - Extreme Floating Glass */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`hidden md:flex flex-col w-80 m-6 rounded-[3rem] shadow-[0_30px_100px_-10px_rgba(0,0,0,0.3)] relative z-50 transition-colors duration-500 overflow-hidden border ${isDarkMode ? 'bg-[#03091B]/60 border-white/10 backdrop-blur-3xl' : 'bg-white/40 border-white/60 backdrop-blur-3xl'}`}
      >
        {/* Sidebar Inner Glow */}
        <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] bg-[#FF8731] rounded-full blur-[80px] opacity-30 pointer-events-none"></div>

        <div className={`p-10 flex items-center justify-center border-b ${isDarkMode ? 'border-white/5' : 'border-[#03091B]/5'}`}>
          <img src={isDarkMode ? "/images/logos/logo esteso bianco panna png.png" : "/images/logos/logo esteso nero png.png"} alt="Lemons in the room Logo" className="h-16 w-auto object-contain drop-shadow-md" />
        </div>

        <nav className="flex-1 px-6 py-6 overflow-y-auto space-y-2 lg:space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) => 
                `flex items-center gap-4 px-5 py-4 lg:gap-5 lg:px-6 lg:py-5 rounded-[2rem] font-bold transition-all duration-300 relative group overflow-hidden ${
                  isActive ? 'text-white shadow-[0_20px_40px_-10px_rgba(255,135,49,0.5)] scale-[1.02]' : 
                  (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-[#03091B]')
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <motion.div layoutId="activeNav" className="absolute inset-0 bg-gradient-to-r from-[#FF8731] to-[#FF9E54] z-0" />}
                  {!isActive && <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>}
                  <item.icon className={`w-6 h-6 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="relative z-10 text-lg tracking-wide">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-8 space-y-4 border-t border-black/5 dark:border-white/5">
          <a href="https://www.lemonsintheroom.com/" target="_blank" rel="noopener noreferrer" onClick={() => audio.playClick()} className={`flex items-center gap-4 px-6 py-5 w-full rounded-[2rem] transition-all duration-300 text-left font-bold group border border-transparent ${isDarkMode ? 'text-slate-300 hover:text-white hover:border-white/10 hover:bg-white/5' : 'text-slate-600 hover:text-[#03091B] hover:border-black/5 hover:bg-black/5'}`}>
            <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform duration-500" />
            <span className="text-lg">Visita il Sito</span>
          </a>

          <button onClick={handleLogout} className={`flex items-center gap-4 px-6 py-5 w-full rounded-[2rem] transition-all duration-300 text-left font-bold group border border-transparent ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:border-red-500/20 hover:bg-red-50'}`}>
            <LogOut className="w-6 h-6 group-hover:-translate-x-2 transition-transform duration-300" />
            <span className="text-lg">Chiudi Sessione</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Top Actions (Site, Logout) */}
      <div className="md:hidden fixed top-6 right-6 z-50 flex flex-col items-end gap-3">
        <a href="https://www.lemonsintheroom.com/" target="_blank" rel="noopener noreferrer" onClick={() => audio.playClick()} className={`w-12 h-12 rounded-full backdrop-blur-2xl border flex items-center justify-center shadow-lg transition-all ${isDarkMode ? 'bg-white/10 border-white/20 text-slate-300' : 'bg-white/80 border-slate-200 text-slate-600'}`}>
          <Globe className="w-5 h-5" />
        </a>
        <button onClick={handleLogout} className={`w-12 h-12 rounded-full backdrop-blur-2xl border flex items-center justify-center shadow-lg transition-all ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-500'}`}>
          <LogOut className="w-5 h-5 ml-0.5" />
        </button>
      </div>

      {/* Main Content - Performance Optimized Background */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth bg-transparent pb-28 md:pb-0">
        
        {/* Static Spatial Gradients (Removed heavy animations) */}
        <div className="fixed top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#FF8731] rounded-full blur-[150px] opacity-20 pointer-events-none -z-10"></div>
        <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#8756FA] rounded-full blur-[120px] opacity-20 pointer-events-none -z-10"></div>
        
        <Outlet />
      </main>

      {/* Bottom Nav Mobile - Floating Glassmorphism */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className={`backdrop-blur-[40px] border flex justify-around items-center p-2 rounded-[2.5rem] transition-colors duration-500 ${isDarkMode ? 'bg-[#03091B]/60 border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.1)]' : 'bg-white/70 border-black/10 shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_2px_10px_rgba(255,255,255,0.4)]'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) => 
                `flex flex-col items-center justify-center w-[4.5rem] h-[4.5rem] rounded-full transition-all duration-500 relative group overflow-hidden ${
                  isActive ? 'text-white bg-gradient-to-br from-[#8756FA] to-[#FF8731] shadow-[0_10px_20px_rgba(255,135,49,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] z-10' : 
                  (isDarkMode ? 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent' : 'text-slate-600 font-bold hover:text-black hover:bg-black/5 border border-transparent')
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-6 h-6 mb-1 relative z-10 transition-transform duration-300 ${isActive ? 'drop-shadow-md scale-105' : 'group-hover:scale-110'}`} />
                  <span className="text-[9px] font-black leading-none uppercase tracking-widest relative z-10 drop-shadow-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      
    </div>
  );
};
export default Layout;