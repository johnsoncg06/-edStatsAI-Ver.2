/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  ChevronRight, 
  Database, 
  FileText, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  TrendingUp,
  Map as MapIcon,
  Download,
  Plus,
  X,
  Sparkles
} from 'lucide-react';
import { ProjectDetails, Algorithm, AVAILABLE_ALGORITHMS, SimulationResult, ValidationWarning } from './types';
import { geminiService } from './services/geminiService';
import ProjectForm from './components/ProjectForm';
import AlgorithmSelector from './components/AlgorithmSelector';
import SimulationDashboard from './components/SimulationDashboard';
import AIChat from './components/AIChat';
import AlgorithmMap from './components/AlgorithmMap';
import { translations, Language } from './i18n';

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const t = useMemo(() => translations[language], [language]);
  const [activeTab, setActiveTab] = useState<'project' | 'simulation' | 'map'>('project');
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<{ ids: string[], reasoning: string }>({ ids: [], reasoning: '' });
  const [overallScore, setOverallScore] = useState<number>(0);
  const [schemeSummary, setSchemeSummary] = useState<string>('');
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Handle project submission
  const handleProjectSubmit = useCallback(async (details: ProjectDetails) => {
    setProject(details);
    setIsLoading(true);
    try {
      const recs = await geminiService.recommendAlgorithms(details, language);
      setRecommendations({ ids: recs.recommendations, reasoning: recs.reasoning });
      // Auto-populate the lab with AI's recommended scheme
      setSelectedAlgorithms(recs.recommendations);
      setActiveTab('simulation');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  const handleAlgorithmChange = useCallback((ids: string[]) => {
    setSelectedAlgorithms(ids);
  }, []);

  // Handle algorithm selection change with debounce
  useEffect(() => {
    if (!project || selectedAlgorithms.length === 0) {
      setWarnings([]);
      setSimulationResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSimulating(true);
      try {
        const [validation, newResults] = await Promise.all([
          geminiService.validateCombination(project, selectedAlgorithms, language),
          geminiService.simulateResults(project, selectedAlgorithms, language)
        ]);
        setWarnings(validation.warnings);
        setOverallScore(validation.overallScore);
        setSchemeSummary(validation.summary);
        setSimulationResults(newResults);
      } finally {
        setIsSimulating(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [selectedAlgorithms, project, language]);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D2D2D7] flex flex-col z-20">
        <div className="p-6 border-b border-[#D2D2D7] flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0071E3] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity size={24} />
            </div>
            <h1 className="font-bold text-lg tracking-tight leading-tight">{t.title}</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-[#F5F5F7] p-1 rounded-lg">
            {(['zh', 'en', 'ja'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 text-[10px] font-bold py-1 rounded-md transition-all ${language === lang ? 'bg-white text-[#0071E3] shadow-sm' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
              >
                {lang === 'zh' ? '繁中' : lang === 'en' ? 'EN' : '日本語'}
              </button>
            ))}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('project')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'project' ? 'bg-[#F5F5F7] text-[#0071E3] font-semibold' : 'text-[#86868B] hover:bg-[#F5F5F7]'}`}
          >
            <FileText size={20} />
            <span>{t.projectTab}</span>
          </button>
          <button 
            disabled={!project}
            onClick={() => setActiveTab('simulation')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!project ? 'opacity-50 cursor-not-allowed' : activeTab === 'simulation' ? 'bg-[#F5F5F7] text-[#0071E3] font-semibold' : 'text-[#86868B] hover:bg-[#F5F5F7]'}`}
          >
            <LayoutDashboard size={20} />
            <span>{t.labTab}</span>
          </button>
          <button 
            disabled={!project || selectedAlgorithms.length === 0}
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${(!project || selectedAlgorithms.length === 0) ? 'opacity-50 cursor-not-allowed' : activeTab === 'map' ? 'bg-[#F5F5F7] text-[#0071E3] font-semibold' : 'text-[#86868B] hover:bg-[#F5F5F7]'}`}
          >
            <MapIcon size={20} />
            <span>{t.mapTab}</span>
          </button>
        </nav>

        <div className="p-4 border-t border-[#D2D2D7]">
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] transition-all"
          >
            <div className="flex items-center gap-3">
              <MessageSquare size={20} className="text-[#0071E3]" />
              <span className="font-medium">{t.aiAdvisor}</span>
            </div>
            {isChatOpen && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto bg-[#F5F5F7]">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-[#D2D2D7] px-8 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-sm text-[#86868B]">
            <span>MedStats AI</span>
            <ChevronRight size={14} />
            <span className="text-[#1D1D1F] font-medium">
              {activeTab === 'project' ? t.setupTitle : activeTab === 'simulation' ? t.labTitle : t.mapTab}
            </span>
          </div>
          
          {project && (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs text-[#86868B]">{t.currentProject}</span>
                <span className="text-sm font-semibold text-[#1D1D1F]">{project.title}</span>
              </div>
            </div>
          )}
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'project' && (
              <motion.div
                key="project"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectForm onSubmit={handleProjectSubmit} initialData={project} isLoading={isLoading} language={language} />
              </motion.div>
            )}

            {activeTab === 'simulation' && project && (
              <motion.div
                key="simulation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <AlgorithmSelector 
                      selectedIds={selectedAlgorithms}
                      onChange={handleAlgorithmChange}
                      recommendations={recommendations}
                      language={language}
                    />
                    
                    {warnings.length > 0 && (
                      <div className="bg-white rounded-3xl p-6 border border-[#D2D2D7] shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-[#FF3B30]">
                          <ShieldAlert size={20} />
                          <h3 className="font-bold">{t.conflictDetect}</h3>
                        </div>
                        <div className="space-y-3">
                          {warnings.map((w, i) => (
                            <div key={i} className={`p-3 rounded-xl text-sm ${w.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                              {w.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    {isSimulating && simulationResults.length === 0 ? (
                      <div className="bg-white rounded-3xl p-12 border border-[#D2D2D7] shadow-sm flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
                        <p className="text-[#86868B] font-medium">{t.simulating}</p>
                      </div>
                    ) : (
                      <SimulationDashboard 
                        results={simulationResults}
                        selectedIds={selectedAlgorithms}
                        overallScore={overallScore}
                        summary={schemeSummary}
                        language={language}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'map' && project && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AlgorithmMap 
                  project={project}
                  selectedIds={selectedAlgorithms}
                  results={simulationResults}
                  language={language}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* AI Chat Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-[#D2D2D7] shadow-2xl z-30 flex flex-col"
          >
            <div className="p-6 border-b border-[#D2D2D7] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#0071E3] rounded-lg flex items-center justify-center text-white">
                  <Sparkles size={18} />
                </div>
                <h3 className="font-bold">{t.aiAdvisor}</h3>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-[#F5F5F7] rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <AIChat project={project} selectedAlgorithms={selectedAlgorithms} language={language} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
