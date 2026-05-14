import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Users, CheckCircle, Activity, Building2, Search, History, Download, TrendingUp, ChevronDown, ChevronUp, Lock, Target, Trash2, RefreshCw, Baby, UserRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { QRCodeCanvas } from 'qrcode.react';
import { audio } from './utils/audio';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [allUsersList, setAllUsersList] = useState([]);
  const [searchTerm, setSearchParams] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [expandedUser, setExpandedUser] = useState(null);
  const navigate = useNavigate();

  const totalLessons = 4;

  const loadStats = () => {
    const globalUsers = JSON.parse(localStorage.getItem('lemo_all_users')) || {};
    
    let usersArray = [];
    let hospitalsMap = {};
    let dropOffMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    let completedCount = 0;
    let activeTodayCount = 0;
    let totalLogins = 0;
    
    const todayStr = new Date().toISOString().split('T')[0];

    Object.values(globalUsers).forEach(user => {
      const progressKey = `lemo_progress_${user.name}`;
      const userProgress = JSON.parse(localStorage.getItem(progressKey)) || [];
      const completedModules = userProgress.length;

      if (completedModules === totalLessons) completedCount++;
      if (user.lastLogin && user.lastLogin.startsWith(todayStr)) activeTodayCount++;
      totalLogins += (user.loginCount || 1);

      const hosp = user.hospital || 'Sconosciuto';
      hospitalsMap[hosp] = (hospitalsMap[hosp] || 0) + 1;
      dropOffMap[completedModules]++;

      usersArray.push({
        ...user,
        progressCount: completedModules,
        percentage: Math.round((completedModules / totalLessons) * 100),
        completedModulesList: userProgress
      });
    });

    usersArray.sort((a, b) => new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0));
    setAllUsersList(usersArray);

    const hospitalsData = Object.keys(hospitalsMap).map(k => ({ name: k, value: hospitalsMap[k] }));
    const completionRatesData = [
      { name: '0 Mod.', utenti: dropOffMap[0] },
      { name: '1 Mod.', utenti: dropOffMap[1] },
      { name: '2 Mod.', utenti: dropOffMap[2] },
      { name: '3 Mod.', utenti: dropOffMap[3] },
      { name: 'Completati', utenti: dropOffMap[4] },
    ];

    const loginsByDay = {};
    Object.values(globalUsers).forEach(user => {
      if (user.lastLogin) {
        const day = user.lastLogin.split('T')[0];
        loginsByDay[day] = (loginsByDay[day] || 0) + 1;
      }
    });
    const activityData = Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayKey = d.toISOString().split('T')[0];
      return {
        name: d.toLocaleDateString('it-IT', { weekday: 'short' }),
        accessi: loginsByDay[dayKey] || 0
      };
    });

    setStats({
      totalUsers: usersArray.length,
      completed: completedCount,
      activeToday: activeTodayCount,
      totalLogins: totalLogins,
      completionRate: usersArray.length > 0 ? Math.round((completedCount / usersArray.length) * 100) : 0,
      hospitals: hospitalsData,
      completionRates: completionRatesData,
      activityData: activityData
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'lemons2026') {
      audio.playSuccess();
      setIsAuthenticated(true);
      loadStats();
    } else {
      audio.playError();
      alert('Password errata!');
    }
  };

  const deleteUser = (userName) => {
    if (!window.confirm(`Eliminare definitivamente la sessione di "${userName}"? L'operazione non è reversibile.`)) return;
    audio.playClick();
    const globalUsers = JSON.parse(localStorage.getItem('lemo_all_users')) || {};
    delete globalUsers[userName];
    localStorage.setItem('lemo_all_users', JSON.stringify(globalUsers));
    localStorage.removeItem(`lemo_progress_${userName}`);
    setExpandedUser(null);
    loadStats();
  };

  const exportCSV = () => {
    audio.playClick();
    const headers = ['Operatore', 'Ospedale', 'Reparto', 'Modalità', 'Progresso %', 'Moduli Completati', 'Login Totali', 'Primo Accesso', 'Ultimo Accesso'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(u => [
        `"${u.name || ''}"`, `"${u.hospital || ''}"`, `"${u.department || ''}"`, `"${u.mode || ''}"`,
        `"${u.percentage || 0}%"`, `"${u.progressCount || 0}/${totalLessons}"`, `"${u.loginCount || 1}"`,
        `"${new Date(u.firstLogin || u.lastLogin || Date.now()).toLocaleDateString('it-IT')}"`,
        `"${new Date(u.lastLogin || Date.now()).toLocaleString('it-IT')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Lemons_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const uniqueHospitals = [...new Set(allUsersList.map(u => u.hospital).filter(Boolean))].sort();

  const filteredUsers = allUsersList.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.hospital || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'completed') matchesStatus = u.percentage === 100;
    if (statusFilter === 'in_progress') matchesStatus = u.percentage < 100 && u.percentage > 0;
    if (statusFilter === 'not_started') matchesStatus = u.percentage === 0;

    const matchesHospital = hospitalFilter === 'all' || u.hospital === hospitalFilter;

    return matchesSearch && matchesStatus && matchesHospital;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#03091B] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[100px]"></div>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 p-10 rounded-[2rem] shadow-2xl relative z-10 w-full max-w-md text-center">
          <img src="/images/logos/logo bianco panna png.png" alt="Lemons Logo" className="w-16 h-16 mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-black font-serif text-white mb-2">Area Riservata</h1>
          <p className="text-slate-400 mb-8">Accesso esclusivo al team Lemons in the Room.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Password Direzionale" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white px-6 py-4 rounded-xl text-center tracking-widest font-mono focus:border-red-500 focus:outline-none transition-colors" />
            <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 transition-colors">Sblocca God Mode</button>
          </form>
          <button onClick={() => navigate('/')} className="mt-6 text-slate-500 hover:text-slate-300 text-sm font-bold">Torna alla piattaforma</button>
        </motion.div>
      </div>
    );
  }

  const COLORS = ['#FF8731', '#10B981', '#3B82F6', '#8B5CF6', '#F43F5E', '#0ea5e9'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-10 font-sans overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header Principale */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6 bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative">
              <img src="/images/logos/logo bianco panna png.png" alt="Lemons Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-4xl font-black font-serif text-white tracking-tight flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-[#FF8731]" />
                Lemons in the Room God Mode
              </h1>
              <p className="text-slate-400 mt-1 font-medium text-sm">Monitoraggio in tempo reale dei dati operativi globali.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button onClick={() => { audio.playClick(); loadStats(); }} className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-700">
              <RefreshCw className="w-4 h-4" /> Aggiorna
            </button>
            <button onClick={exportCSV} className="flex-1 md:flex-none px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
              <Download className="w-4 h-4" /> Esporta CSV
            </button>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors border border-slate-700">
              Esci
            </button>
          </div>
        </header>

        {/* Top KPIs - Espansi */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
            <Users className="w-6 h-6 text-blue-400 mb-4" />
            <div>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Operatori Totali</p>
              <p className="text-3xl font-black font-serif text-white">{stats?.totalUsers || 0}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <CheckCircle className="w-6 h-6 text-emerald-400 mb-4 relative z-10" />
            <div className="relative z-10">
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Certificati Rilasciati</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-black font-serif text-white">{stats?.completed || 0}</p>
                <p className="text-emerald-400 text-sm font-bold mb-1">({stats?.completionRate || 0} %)</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
            <Activity className="w-6 h-6 text-yellow-400 mb-4" />
            <div>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Attivi Oggi</p>
              <p className="text-3xl font-black font-serif text-white">{stats?.activeToday || 0}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
            <TrendingUp className="w-6 h-6 text-indigo-400 mb-4" />
            <div>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Sessioni Totali</p>
              <p className="text-3xl font-black font-serif text-white">{stats?.totalLogins || 0}</p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between col-span-2 md:col-span-4 lg:col-span-1">
            <Building2 className="w-6 h-6 text-rose-400 mb-4" />
            <div>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Strutture Attive</p>
              <p className="text-3xl font-black font-serif text-white">{(stats?.hospitals || []).length}</p>
            </div>
          </div>
        </div>

        {/* QR Code Accesso Globale */}
        <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl mb-10 flex flex-col lg:flex-row items-center gap-10 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#8756FA] rounded-full blur-[120px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700"></div>
          
          <div className="flex-1 relative z-10 text-center lg:text-left">
            <h3 className="text-3xl font-black font-serif text-white mb-4">Codice di Accesso Universale</h3>
            <p className="text-slate-400 font-medium text-lg mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Stampa o mostra questo QR Code. Permette agli operatori di accedere immediatamente alla piattaforma dal proprio smartphone. 
              <span className="block mt-2 text-emerald-400 font-bold">Il sistema riconoscerà in automatico i dispositivi già registrati, saltando il form di login.</span>
            </p>
            <button
              onClick={() => {
                audio.playClick();
                const canvas = document.querySelector('#qr-canvas canvas') || document.querySelector('canvas');
                const dataUrl = canvas?.toDataURL('image/png') || '';
                const win = window.open('', '_blank', 'width=400,height=500');
                win.document.write(`<!DOCTYPE html><html><head><title>QR Code - Lemons in the Room</title><style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#fff;font-family:sans-serif;}img{width:280px;height:280px;}p{margin-top:16px;font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:#888;}</style></head><body><img src="${dataUrl}" /><p>Scan to Enter</p><script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script></body></html>`);
                win.document.close();
              }}
              className="px-8 py-4 bg-gradient-to-r from-[#8756FA] to-[#6A35E8] hover:from-[#9C73FA] hover:to-[#8756FA] text-white font-black rounded-2xl transition-all shadow-[0_15px_30px_-10px_rgba(135,86,250,0.5)] hover:scale-105 active:scale-95"
            >
              Stampa QR Code
            </button>
          </div>
          
          <div id="qr-canvas" className="bg-white p-6 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,0,0,0.3)] shrink-0 relative z-10 border border-slate-200 group-hover:rotate-3 transition-transform duration-500">
            <QRCodeCanvas value={window.location.origin} size={220} level="H" includeMargin={false} />
            <div className="mt-4 text-center">
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Scan to Enter</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Trend Accessi */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" /> Trend Accessi (Ultimi 7 gg)
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.activityData || []}>
                  <defs>
                    <linearGradient id="colorAccessi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#131A33" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#03091B', borderColor: '#131A33', borderRadius: '1rem', color: '#fff' }} />
                  <Area type="monotone" dataKey="accessi" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAccessi)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribuzione Ospedali */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FF8731]" /> Quote per Struttura
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats?.hospitals || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {(stats?.hospitals || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#03091B', borderColor: '#131A33', borderRadius: '1rem', color: '#fff', fontWeight: 'bold' }} itemStyle={{color: '#fff'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {(stats?.hospitals || []).map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-xs font-bold text-slate-300">{h.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Imbuto Conversioni */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl mb-10">
          <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" /> Imbuto di Completamento (Drop-off)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.completionRates || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#131A33" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{fill: '#94a3b8', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#131A33'}} contentStyle={{ backgroundColor: '#03091B', borderColor: '#131A33', borderRadius: '1rem', color: '#fff', fontWeight:'bold' }} />
                <Bar dataKey="utenti" fill="#10B981" radius={[8, 8, 0, 0]}>
                  {(stats?.completionRates || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#FF8731' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabella Dettagliata Operatori - Super Potenziata */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden mb-20">
          <div className="p-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-black text-white">Anagrafica Operatori</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  {filteredUsers.length === allUsersList.length
                    ? `${allUsersList.length} operatori totali`
                    : `${filteredUsers.length} di ${allUsersList.length} operatori`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-wrap">
                <select
                  value={hospitalFilter}
                  onChange={(e) => setHospitalFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 px-5 py-3.5 rounded-2xl focus:border-[#FF8731] focus:ring-1 focus:ring-[#FF8731] outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                >
                  <option value="all">Tutte le strutture</option>
                  {uniqueHospitals.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 px-5 py-3.5 rounded-2xl focus:border-[#FF8731] focus:ring-1 focus:ring-[#FF8731] outline-none transition-all font-bold text-sm appearance-none cursor-pointer"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="completed">Solo Certificati (100%)</option>
                  <option value="in_progress">In Corso (1-99%)</option>
                  <option value="not_started">Non Iniziato (0%)</option>
                </select>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cerca nome, reparto..."
                    value={searchTerm}
                    onChange={(e) => setSearchParams(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:border-[#FF8731] focus:ring-1 focus:ring-[#FF8731] outline-none transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-widest font-black border-b border-slate-800">
                  <th className="px-8 py-5">Operatore</th>
                  <th className="px-8 py-5">Dettagli Struttura</th>
                  <th className="px-8 py-5">Profilo</th>
                  <th className="px-8 py-5">Stato Formazione</th>
                  <th className="px-8 py-5 text-center">Attività</th>
                  <th className="px-8 py-5 text-right">Dettagli</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                  <React.Fragment key={i}>
                    <tr className={`transition-colors cursor-pointer hover:bg-slate-800/30 ${expandedUser === i ? 'bg-slate-800/50' : ''}`} onClick={() => setExpandedUser(expandedUser === i ? null : i)}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-[#FF8731] shadow-inner text-lg">
                            {u.firstName?.[0]}{u.lastName?.[0] || u.name?.[0]}
                          </div>
                          <div>
                            <div className="font-bold text-white text-base">{u.name}</div>
                            <div className="text-xs font-bold px-2 py-0.5 mt-1 rounded-md inline-block bg-slate-800 text-slate-400">
                              {u.mode === 'full' ? 'Modalità Libera' : 'Percorso Guidato'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-200 text-sm">{u.hospital}</div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1"><Building2 className="w-3 h-3"/> {u.department}</div>
                      </td>
                      <td className="px-8 py-6">
                        {u.patientType === 'pediatria'
                          ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold"><Baby className="w-3 h-3"/>Pediatria</span>
                          : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold"><UserRound className="w-3 h-3"/>Adulti</span>
                        }
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className={u.percentage === 100 ? 'text-emerald-400' : 'text-slate-300'}>{u.progressCount || 0} / {totalLessons} Moduli</span>
                            <span className={u.percentage === 100 ? 'text-emerald-400' : 'text-[#FF8731]'}>{u.percentage || 0} %</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden w-full max-w-[150px]">
                            <div className={`h-full rounded-full transition-all duration-1000 ${u.percentage === 100 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-[#FF8731]'}`} style={{ width: `${u.percentage || 0}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-white border border-slate-700">
                            <History className="w-3.5 h-3.5 text-slate-400" />
                            {u.loginCount || 1} Accessi
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         {expandedUser === i ? <ChevronUp className="w-6 h-6 text-slate-400 inline-block" /> : <ChevronDown className="w-6 h-6 text-slate-400 inline-block" />}
                      </td>
                    </tr>
                    
                    {/* Riga Espansa Dettagli */}
                    <AnimatePresence>
                      {expandedUser === i && (
                        <tr className="bg-slate-900/80 border-b-0">
                          <td colSpan="5" className="p-0">
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-8 py-6 border-l-4 border-[#FF8731] ml-4 my-2 rounded-r-2xl bg-slate-800/30 overflow-hidden">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Cronologia Accessi</p>
                                  <div className="space-y-2 text-sm font-medium text-slate-300">
                                    <div className="flex justify-between"><span className="text-slate-500">Primo Login:</span> <span>{new Date(u.firstLogin || u.lastLogin || Date.now()).toLocaleDateString('it-IT')}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Ultimo Login:</span> <span className="text-white font-bold">{new Date(u.lastLogin || Date.now()).toLocaleString('it-IT')}</span></div>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteUser(u.name); }}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold transition-all duration-200"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Elimina sessione
                                  </button>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Moduli Completati</p>
                                  <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4].map(mod => {
                                      const done = (u.completedModulesList || []).includes(mod);
                                      return (
                                        <div key={mod} className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 ${done ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
                                          {done ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />} Modulo {mod}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-16 text-center">
                      <div className="inline-flex flex-col items-center">
                        <Search className="w-12 h-12 text-slate-700 mb-4" />
                        <p className="text-slate-400 font-bold text-lg">Nessun operatore trovato.</p>
                        <p className="text-slate-600 text-sm mt-1">Prova a cambiare i filtri di ricerca.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;