/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  ChevronRight, 
  ChevronDown, 
  TrendingUp, 
  BarChart3, 
  History, 
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  Circle,
  MessageSquare,
  FileText,
  Calendar,
  Filter,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Exam, ExamType, QuestionEntry, QuestionStatus } from './types';
import { TYT_SECTIONS, AYT_SECTIONS } from './constants';

const STORAGE_KEY = 'yks_exam_tracker_data';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [exams, setExams] = useState<Exam[]>([]);
  const [view, setView] = useState<'dashboard' | 'add' | 'history' | 'analysis' | 'edit'>('dashboard');
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ExamType | 'ALL'>('ALL');
  const [analysisType, setAnalysisType] = useState<ExamType>('TYT');
  
  // Dark mode effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setExams(JSON.parse(saved));
      } catch (e) {
        console.error("Data load failed", e);
      }
    }
  }, []);

  // Save data
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  }, [exams]);

  // Stats
  const stats = useMemo(() => {
    const tytExams = exams.filter(e => e.type === 'TYT');
    const aytExams = exams.filter(e => e.type === 'AYT');

    const calculateAvg = (list: Exam[]) => {
      if (list.length === 0) return 0;
      return list.reduce((acc, curr) => acc + curr.net, 0) / list.length;
    };

    return {
      total: exams.length,
      tytCount: tytExams.length,
      aytCount: aytExams.length,
      tytAvg: calculateAvg(tytExams),
      aytAvg: calculateAvg(aytExams),
      recent: [...exams].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
    };
  }, [exams]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exams, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yks_denemeleri_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          setExams(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const newExams = data.filter(e => !existingIds.has(e.id));
            return [...prev, ...newExams];
          });
          alert("Veriler başarıyla içe aktarıldı!");
        }
      } catch (err) {
        alert("Geçersiz dosya formatı!");
      }
    };
    reader.readAsText(file);
  };

  const deleteExam = (id: string) => {
    if (confirm("Bu denemeyi silmek istediğinize emin misiniz?")) {
      setExams(exams.filter(e => e.id !== id));
    }
  };

  const startEdit = (id: string) => {
    setEditingExamId(id);
    setView('edit');
  };

  // Analysis Logic
  const analysisData = useMemo(() => {
    const filtered = exams.filter(e => e.type === analysisType);
    const subjectMap: Record<string, { wrong: number, empty: number }> = {};

    filtered.forEach(exam => {
      exam.questions.forEach(q => {
        if (q.status !== 'correct') {
          if (!subjectMap[q.subject]) {
            subjectMap[q.subject] = { wrong: 0, empty: 0 };
          }
          if (q.status === 'wrong') subjectMap[q.subject].wrong++;
          if (q.status === 'empty') subjectMap[q.subject].empty++;
        }
      });
    });

    return Object.entries(subjectMap)
      .map(([subject, stats]) => ({
        subject,
        ...stats,
        total: stats.wrong + stats.empty
      }))
      .sort((a, b) => b.total - a.total);
  }, [exams, analysisType]);

  return (
    <div className="flex h-screen overflow-hidden text-[#0F172A] dark:text-slate-100 font-sans bg-[#F8FAFC] dark:bg-slate-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r dark:border-slate-800 bg-white dark:bg-slate-950 flex-col p-6 space-y-8 shrink-0">
        <div className="text-3xl font-black tracking-tighter text-brand italic">YKS FOCUS</div>
        <nav className="flex-1 space-y-2">
          <SidebarBtn 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
            icon={<LayoutDashboard />} 
            label="Panel" 
          />
          <SidebarBtn 
            active={view === 'add'} 
            onClick={() => setView('add')} 
            icon={<Plus />} 
            label="Deneme Ekle" 
          />
          <SidebarBtn 
            active={view === 'analysis'} 
            onClick={() => setView('analysis')} 
            icon={<TrendingUp />} 
            label="Analiz" 
          />
          <SidebarBtn 
            active={view === 'history'} 
            onClick={() => setView('history')} 
            icon={<History />} 
            label="Geçmiş" 
          />
        </nav>
        <div className="pt-6 border-t dark:border-slate-800 space-y-3">
          <button 
            onClick={handleExport} 
            className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" /> <span>Dışa Aktar</span>
          </button>
          <label className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> <span>İçe Aktar</span>
            <input type="file" onChange={handleImport} className="hidden" accept=".json" />
          </label>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="p-6 md:p-8 flex justify-between items-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm sticky top-0 z-20 border-b dark:border-slate-800/50">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            {view === 'dashboard' ? 'Genel Bakış' : view === 'add' ? 'Deneme Ekle' : view === 'analysis' ? 'Konu Analizi' : view === 'edit' ? 'Deneme Düzenle' : 'Geçmiş Denemeler'}
          </h1>
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setIsDark(prev => !prev)}
              className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 transition-all hover:scale-110 active:scale-95"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <div className="text-right text-sm">
              <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Toplam Net</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{(stats.tytAvg + stats.aytAvg).toFixed(2)}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-900 dark:bg-brand flex items-center justify-center text-white font-black">
              {stats.total}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pb-32 md:pb-8">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-4">
            <AnimatePresence mode="wait">
              {view === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-4 bg-brand rounded-3xl p-6 text-white shadow-xl dark:shadow-none">
                      <div className="text-indigo-200 text-xs font-black uppercase tracking-widest">Girilen Deneme</div>
                      <div className="text-6xl font-black mt-2">{stats.total}</div>
                      <div className="mt-4 flex items-center space-x-2 text-indigo-100 font-bold">
                        <span className="bg-white/20 px-2 py-1 rounded text-xs">YKS Yolculuğu</span>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-6 border dark:border-slate-700 shadow-sm">
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest">TYT Ortalaması</div>
                      <div className="text-6xl font-black mt-2 text-slate-900 dark:text-white">{stats.tytAvg.toFixed(1)}</div>
                      <div className="mt-4 text-emerald-500 font-bold flex items-center text-sm">
                        {stats.tytCount} Deneme
                      </div>
                    </div>

                    <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-6 border dark:border-slate-700 shadow-sm">
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest">AYT Ortalaması</div>
                      <div className="text-6xl font-black mt-2 text-slate-900 dark:text-white">{stats.aytAvg.toFixed(1)}</div>
                      <div className="mt-4 text-slate-400 font-bold text-sm">
                        {stats.aytCount} Deneme
                      </div>
                    </div>
                  </div>

                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">SON DENEMELER</h3>
                      <button 
                        onClick={() => setView('history')}
                        className="text-xs font-black text-brand uppercase tracking-widest hover:underline"
                      >
                        Tüm Geçmiş
                      </button>
                    </div>
                    <div className="space-y-4">
                      {stats.recent.length > 0 ? (
                        stats.recent.map(exam => (
                          <ExamRow key={exam.id} exam={exam} onDelete={deleteExam} onEdit={startEdit} />
                        ))
                      ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                          <p className="text-slate-400 font-bold italic">Henüz bir deneme kaydı bulunamadı.</p>
                          <button 
                            onClick={() => setView('add')}
                            className="mt-6 px-8 py-4 bg-brand text-white rounded-2xl font-black uppercase tracking-widest shadow-lg"
                          >
                            Hemen Başla
                          </button>
                        </div>
                      )}
                    </div>
                  </section>
                </motion.div>
              )}

              {view === 'analysis' && (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tight uppercase italic text-slate-900 dark:text-white">Eksiklerim</h2>
                    <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl border dark:border-slate-700 shadow-sm">
                      {['TYT', 'AYT'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setAnalysisType(t as any)}
                          className={`px-8 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${analysisType === t ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm p-8">
                    {analysisData.length > 0 ? (
                      <div className="space-y-4">
                        {analysisData.map((item, idx) => (
                          <div key={item.subject} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                            <div className="flex items-center gap-4">
                              <span className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-black text-xs">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-slate-200">{item.subject}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-red-500" 
                                      style={{ width: `${Math.min(100, (item.total / stats.total) * 20)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-slate-900 dark:text-slate-100">
                              <div className="text-center w-12">
                                <p className="text-[8px] font-black text-red-500 uppercase">Yanlış</p>
                                <p className="text-lg font-black">{item.wrong}</p>
                              </div>
                              <div className="text-center w-12">
                                <p className="text-[8px] font-black text-slate-400 uppercase">Boş</p>
                                <p className="text-lg font-black">{item.empty}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20 grayscale opacity-40">
                        <TrendingUp className="w-16 h-16 mx-auto mb-4" />
                        <p className="font-black text-lg uppercase">Analiz için daha fazla veriye ihtiyaç var</p>
                        <p className="text-sm font-medium">Hatalı veya boş bıraktığınız sorular otomatik burada listelenir.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {(view === 'add' || view === 'edit') && (
                <motion.div 
                  key={view}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ExamForm 
                    initialData={view === 'edit' ? exams.find(e => e.id === editingExamId) : undefined}
                    onSave={(exam) => {
                      if (view === 'edit') {
                        setExams(exams.map(e => e.id === exam.id ? exam : e));
                      } else {
                        setExams([exam, ...exams]);
                      }
                      setView('dashboard');
                      setEditingExamId(null);
                    }} 
                    onCancel={() => {
                      setView('dashboard');
                      setEditingExamId(null);
                    }}
                  />
                </motion.div>
              )}

              {view === 'history' && (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-3xl font-black tracking-tight uppercase text-slate-900 dark:text-white">Tüm Liste</h2>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-2xl border dark:border-slate-700 shadow-sm self-start">
                      {['ALL', 'TYT', 'AYT'].map(t => (
                        <button 
                          key={t}
                          onClick={() => setFilterType(t as any)}
                          className={`px-6 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${filterType === t ? 'bg-slate-900 dark:bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                          {t === 'ALL' ? 'Hepsi' : t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {exams
                      .filter(e => filterType === 'ALL' || e.type === filterType)
                      .map(exam => (
                        <ExamRow key={exam.id} exam={exam} onDelete={deleteExam} onEdit={startEdit} showDetails />
                      ))}
                    {exams.length === 0 && (
                      <p className="text-center text-slate-400 py-20 font-bold italic">Liste henüz boş.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t dark:border-slate-800 px-6 py-3 z-50">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <NavButton 
              active={view === 'dashboard'} 
              onClick={() => setView('dashboard')} 
              icon={<LayoutDashboard />} 
              label="Panel" 
            />
            <NavButton 
              active={view === 'analysis'} 
              onClick={() => setView('analysis')} 
              icon={<TrendingUp />} 
              label="Analiz" 
            />
            <button 
              onClick={() => setView('add')}
              className={`-mt-12 w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl transition-transform active:scale-90 ${view === 'add' ? 'bg-brand text-white' : 'bg-slate-900 text-white'}`}
            >
              <Plus className="w-8 h-8" />
            </button>
            <NavButton 
              active={view === 'history'} 
              onClick={() => setView('history')} 
              icon={<History />} 
              label="Geçmiş" 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

interface SidebarBtnProps {
  key?: React.Key;
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement;
  label: string;
}

function SidebarBtn({ active, onClick, icon, label }: SidebarBtnProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all duration-300 ${active ? 'bg-brand-light dark:bg-brand/20 text-brand shadow-sm shadow-indigo-100 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5' } as any)}
      <span className="tracking-tight">{label}</span>
    </button>
  );
}

interface NavButtonProps {
  key?: React.Key;
  active: boolean;
  onClick: () => void;
  icon: React.ReactElement;
  label: string;
}

function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-brand' : 'text-slate-400'}`}
    >
      {React.cloneElement(icon, { className: 'w-6 h-6' } as any)}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

interface ExamRowProps {
  key?: React.Key;
  exam: Exam;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  showDetails?: boolean;
}

function ExamRow({ exam, onDelete, onEdit, showDetails = false }: ExamRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${exam.type === 'TYT' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-brand' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600'}`}>
            {exam.type}
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tight dark:text-white">{exam.title}</h3>
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest">
              <Calendar className="w-3 h-3" /> {new Date(exam.date).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-500 tracking-[0.2em]">Net Skoru</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{exam.net.toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(exam.id); }}
              className="p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-brand rounded-2xl transition-colors"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(exam.id); }}
              className="p-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-2xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {isExpanded ? <ChevronDown className="w-5 h-5 opacity-40 dark:text-white shrink-0" /> : <ChevronRight className="w-5 h-5 opacity-40 dark:text-white shrink-0" />}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30 p-6"
          >
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Doğru</span>
                <span className="text-2xl font-black dark:text-white">{exam.totalCorrect}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Yanlış</span>
                <span className="text-2xl font-black dark:text-white">{exam.totalWrong}</span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Boş</span>
                <span className="text-2xl font-black dark:text-white">{exam.totalEmpty}</span>
              </div>
            </div>
            
            {showDetails && (
              <div className="mt-6 space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Yanlış ve Boş Analizi</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {exam.questions.map((q, idx) => {
                    if (q.status === 'correct') return null;
                    return (
                      <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${q.status === 'wrong' ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{q.subject}</span>
                        </div>
                        {q.note && (
                          <div className="group-hover:block hidden absolute bg-black text-white p-2 rounded-lg text-[10px] -mt-12">
                            {q.note}
                          </div>
                        )}
                        <MessageSquare className={`w-3 h-3 ${q.note ? 'text-blue-500' : 'text-slate-200'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExamForm({ onSave, onCancel, initialData }: { onSave: (exam: Exam) => void, onCancel: () => void, initialData?: Exam }) {
  const [type, setType] = useState<ExamType | null>(initialData?.type || null);
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [questions, setQuestions] = useState<QuestionEntry[]>(initialData?.questions || []);
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  const sections = type === 'TYT' ? TYT_SECTIONS : AYT_SECTIONS;

  useEffect(() => {
    if (initialData) return; // Don't reset if we have initial data
    if (!type) {
      setQuestions([]);
      return;
    }
    const totalQuestions = sections.reduce((acc, s) => acc + s.count, 0);
    setQuestions(Array(totalQuestions).fill(null).map(() => {
      return {
        status: 'correct',
        subject: '', // Empty by default
        note: ''
      };
    }));
  }, [type, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !type) {
       alert("Lütfen deneme adı ve türü seçin.");
       return;
    }

    const correct = questions.filter(q => q.status === 'correct').length;
    const wrong = questions.filter(q => q.status === 'wrong').length;
    const empty = questions.filter(q => q.status === 'empty').length;
    const net = correct - (wrong * 0.25);

    onSave({
      id: initialData?.id || crypto.randomUUID(),
      title,
      date,
      type,
      questions,
      totalCorrect: correct,
      totalWrong: wrong,
      totalEmpty: empty,
      net
    });
  };

  const updateQuestion = (index: number, updates: Partial<QuestionEntry>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  // Helper to render questions for the active section
  const renderActiveSectionQuestions = () => {
    if (!type) return null;
    
    // Find global start index of active section
    let globalStartIdx = 0;
    for (let i = 0; i < activeSectionIdx; i++) {
      globalStartIdx += sections[i].count;
    }
    
    const section = sections[activeSectionIdx];
    const sectionElements = [];
    
    for (let i = 0; i < section.count; i++) {
      const currentGlobalIdx = globalStartIdx + i;
      sectionElements.push(
        <QuestionItem 
          key={currentGlobalIdx}
          index={i}
          globalIndex={currentGlobalIdx}
          entry={questions[currentGlobalIdx]}
          subjects={section.subjects}
          onChange={(updates) => updateQuestion(currentGlobalIdx, updates)}
        />
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {sectionElements}
        </div>
      </div>
    );
  };

  if (!type) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tight uppercase dark:text-white">DENEME TÜRÜ SEÇİN</h2>
          <p className="text-slate-400 font-medium">Hangi oturum için deneme girişi yapmak istiyorsunuz?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button 
            onClick={() => setType('TYT')}
            className="group relative bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-10 rounded-[2.5rem] shadow-sm hover:border-brand hover:shadow-xl hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 bg-brand text-white rounded-2xl flex items-center justify-center font-black text-xl">TYT</div>
              <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Temel Yeterlilik</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                40 Türkçe, 20 Sosyal, 40 Matematik, 20 Fen Bilimleri.<br />
                Toplam <span className="text-brand font-black">120 SORU</span>
              </p>
            </div>
          </button>
          <button 
            onClick={() => setType('AYT')}
            className="group relative bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-10 rounded-[2.5rem] shadow-sm hover:border-orange-500 hover:shadow-xl hover:shadow-orange-100 dark:hover:shadow-orange-900/20 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10 space-y-4">
              <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-black text-xl">AYT</div>
              <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Alan Yeterlilik</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                40 Matematik, 40 Fen Bilimleri.<br />
                Toplam <span className="text-orange-600 font-black">80 SORU</span>
              </p>
            </div>
          </button>
        </div>
        <div className="text-center pt-8">
          <button onClick={onCancel} className="text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-slate-600">Vazgeç ve Geri Dön</button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-brand rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm max-w-4xl mx-auto mb-10 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setType(null)}
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors">
              <Plus className="w-5 h-5 rotate-45" />
            </div>
          </button>
          <h2 className="text-3xl font-black tracking-tight uppercase italic dark:text-white">{type} Denemesi</h2>
        </div>
        <div className="hidden md:flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
          <div className={`px-8 py-3 text-sm font-black rounded-xl uppercase tracking-widest transition-all ${type === 'TYT' ? 'bg-white dark:bg-slate-800 shadow-md text-brand' : 'text-slate-400 opacity-50'}`}>
            TYT MODU
          </div>
          <div className={`px-8 py-3 text-sm font-black rounded-xl uppercase tracking-widest transition-all ${type === 'AYT' ? 'bg-white dark:bg-slate-800 shadow-md text-orange-600' : 'text-slate-400 opacity-50'}`}>
            AYT MODU
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Deneme Başlığı</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="DENEME ADI"
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand/20 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pl-1">Sınav Tarihi</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand/20 focus:bg-white dark:focus:bg-slate-800 transition-all rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none dark:text-white"
            />
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
          {sections.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSectionIdx(idx)}
              className={`whitespace-nowrap px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSectionIdx === idx ? 'bg-white dark:bg-slate-700 text-brand shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-[2rem] p-6 max-h-[600px] overflow-y-auto border border-slate-100 dark:border-slate-800 relative">
          <div className="mb-4">
            <h3 className="text-sm font-black text-brand uppercase tracking-[0.2em]">{sections[activeSectionIdx].name} <span className="text-slate-400 font-bold">({sections[activeSectionIdx].count} Soru)</span></h3>
          </div>
          {renderActiveSectionQuestions()}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
          <button 
            type="submit"
            className="w-full sm:flex-1 bg-brand text-white font-black py-5 rounded-[2rem] shadow-xl dark:shadow-none hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-widest"
          >
            Denemeyi Kaydet
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="w-full sm:w-auto px-10 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black py-5 rounded-[2rem] hover:bg-slate-200 dark:hover:bg-slate-600 transition-all uppercase tracking-widest text-xs"
          >
            Vazgeç
          </button>
        </div>
      </form>
    </div>
  );
}

interface QuestionItemProps {
  key?: React.Key;
  index: number;
  globalIndex: number;
  entry: QuestionEntry;
  subjects: string[];
  onChange: (u: Partial<QuestionEntry>) => void;
}

function QuestionItem({ index, globalIndex, entry, subjects, onChange }: QuestionItemProps) {
  const [showNote, setShowNote] = useState(false);

  if (!entry) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-sm hover:border-brand/20 transition-all">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Column 1: Index */}
        <div className="flex items-center gap-3 md:w-20 shrink-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">Soru</span>
          <span className="text-sm font-black text-slate-900 dark:text-white">{index + 1}</span>
        </div>

        {/* Column 2: Status Selector */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 p-1 rounded-xl shrink-0">
          <button 
            type="button"
            onClick={() => onChange({ status: 'correct' })}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center ${entry.status === 'correct' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-emerald-500'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => onChange({ status: 'wrong' })}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center ${entry.status === 'wrong' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-red-500'}`}
          >
            <XCircle className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => onChange({ status: 'empty' })}
            className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center ${entry.status === 'empty' ? 'bg-slate-400 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Circle className="w-4 h-4" />
          </button>
        </div>
        
        {/* Column 3: Subject Selector */}
        <div className="flex-1 min-w-0">
          <select 
            value={entry.subject}
            onChange={e => onChange({ subject: e.target.value })}
            className={`w-full bg-slate-50 dark:bg-slate-900 text-[11px] font-black uppercase tracking-widest border-2 transition-all rounded-xl py-2 px-3 cursor-pointer outline-none ${!entry.subject ? 'border-amber-200 dark:border-amber-900/50 text-amber-600' : 'border-transparent text-slate-700 dark:text-slate-300'}`}
          >
            <option value="">-- Konu Seçiniz --</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Column 4: Note Toggle */}
        <div className="shrink-0 flex justify-end">
          <button 
            type="button"
            onClick={() => setShowNote(!showNote)}
            className={`p-2 rounded-xl transition-all ${entry.note ? 'text-brand bg-brand-light dark:bg-brand/20 shadow-sm' : 'text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showNote && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <textarea 
              rows={2}
              value={entry.note}
              onChange={e => onChange({ note: e.target.value })}
              placeholder="Analiz notu (Neden yanlış yapıldı?)"
              className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand/10 rounded-xl p-3 text-xs font-bold focus:outline-none placeholder:text-slate-300 dark:text-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
