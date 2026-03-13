/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ProjectDetails, SimulationResult, AVAILABLE_ALGORITHMS } from '../types';
import { translations, Language } from '../i18n';
import { Download, Share2, Printer, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

interface AlgorithmMapProps {
  project: ProjectDetails;
  selectedIds: string[];
  results: SimulationResult[];
  language: Language;
}

export default function AlgorithmMap({ project, selectedIds, results, language }: AlgorithmMapProps) {
  const t = translations[language];
  const mapRef = useRef<HTMLDivElement>(null);

  const selectedAlgs = AVAILABLE_ALGORITHMS.filter(a => selectedIds.includes(a.id));

  const handleDownload = () => {
    // In a real app, we might use html2canvas or similar
    alert(language === 'zh' ? '演算法地圖已生成並準備匯出 (PDF/PNG)。' : language === 'en' ? 'Algorithm map generated and ready for export (PDF/PNG).' : 'アルゴリズムマップが生成され、エクスポートの準備ができました (PDF/PNG)。');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.finalMapTitle}</h2>
          <p className="text-[#86868B]">{t.finalMapDesc}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D2D2D7] rounded-xl text-sm font-semibold hover:bg-[#F5F5F7] transition-all">
            <Download size={18} />
            <span>{t.exportMap}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0071E3] text-white rounded-xl text-sm font-semibold hover:bg-[#0077ED] transition-all shadow-lg shadow-blue-500/20">
            <Share2 size={18} />
            <span>{t.shareReport}</span>
          </button>
        </div>
      </div>

      <div ref={mapRef} className="bg-white rounded-[3rem] p-12 border border-[#D2D2D7] shadow-xl relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0071E3]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#34C759]/5 rounded-full -ml-32 -mb-32 blur-3xl" />

        <div className="relative z-10 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F7] rounded-full text-[#0071E3] text-xs font-bold uppercase tracking-widest">
              Final Decision Report
            </div>
            <h3 className="text-4xl font-black text-[#1D1D1F]">{project.title}</h3>
            <div className="flex justify-center gap-8 text-sm text-[#86868B]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1D1D1F]">{t.dataType}:</span> {project.dataType}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#1D1D1F]">{t.sampleSize}:</span> {project.sampleSize}
              </div>
            </div>
          </div>

          {/* The Map Visualization */}
          <div className="flex flex-col items-center gap-8 py-8">
            {/* Start Node */}
            <div className="w-64 p-6 bg-[#F5F5F7] rounded-2xl border-2 border-[#D2D2D7] text-center">
              <p className="text-xs font-bold text-[#86868B] uppercase mb-1">{language === 'zh' ? '研究起點' : language === 'en' ? 'Research Start' : '研究の起点'}</p>
              <p className="font-bold text-sm">{project.goal}</p>
            </div>

            <div className="w-0.5 h-12 bg-gradient-to-b from-[#D2D2D7] to-[#0071E3]" />

            {/* Algorithm Nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {selectedAlgs.map((alg, index) => {
                // Find result by ID, ensuring we handle potential missing results
                const result = results.find(r => r.algorithmId === alg.id);
                const score = result?.recommendationScore || (result as any)?.score || 0;
                
                return (
                  <motion.div 
                    key={alg.id} 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white p-6 rounded-3xl border-2 border-[#0071E3] shadow-lg hover:scale-105 transition-all"
                  >
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#0071E3] text-white rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-[#0071E3] uppercase tracking-widest mb-1">
                          {(t.categories as any)[alg.type] || alg.type}
                        </p>
                        <h4 className="text-xl font-black">{alg.name}</h4>
                      </div>
                      <p className="text-sm text-[#424245] leading-relaxed">{alg.description}</p>
                      
                      <div className="pt-4 border-t border-[#F5F5F7] flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-[#86868B] font-bold uppercase">{language === 'zh' ? '推薦度' : language === 'en' ? 'Rec. Score' : '推奨度'}</span>
                          <span className="text-lg font-black text-[#0071E3]">{score > 0 ? `${score}%` : '--'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-[#86868B] font-bold uppercase">{language === 'zh' ? '優先級' : language === 'en' ? 'Priority' : '優先順位'}</span>
                          <span className="text-lg font-black text-[#1D1D1F]">#{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="w-0.5 h-12 bg-gradient-to-b from-[#0071E3] to-[#34C759]" />

            {/* Conclusion Node */}
            <div className="w-full max-w-2xl p-8 bg-[#34C759]/10 rounded-[2rem] border-2 border-[#34C759] text-center">
              <div className="flex items-center justify-center gap-2 text-[#34C759] mb-4">
                <CheckCircle2 size={24} />
                <h4 className="text-xl font-bold">{language === 'zh' ? '統計分析結論' : language === 'en' ? 'Statistical Conclusion' : '統計分析の結論'}</h4>
              </div>
              <p className="text-[#1D1D1F] leading-relaxed">
                {language === 'zh' ? (
                  <>基於 AI 模擬與醫學統計邏輯，建議優先執行 <span className="font-bold underline">{selectedAlgs[0]?.name}</span> 作為主要分析手段，並輔以 <span className="font-bold">{selectedAlgs.slice(1).map(a => a.name).join(' 與 ')}</span> 進行驗證與多變項調整。此組合能最大化檢定力 ({Math.round((results.reduce((acc, r) => acc + r.power, 0) / results.length) * 100)}%) 並確保結果的臨床解釋性。</>
                ) : language === 'en' ? (
                  <>Based on AI simulation and medical statistics logic, it is recommended to prioritize <span className="font-bold underline">{selectedAlgs[0]?.name}</span> as the primary analysis method, supplemented by <span className="font-bold">{selectedAlgs.slice(1).map(a => a.name).join(' and ')}</span> for verification and multivariable adjustment. This combination maximizes power ({Math.round((results.reduce((acc, r) => acc + r.power, 0) / results.length) * 100)}%) and ensures clinical interpretability.</>
                ) : (
                  <>AIシミュレーションと医学統計ロジックに基づき、<span className="font-bold underline">{selectedAlgs[0]?.name}</span>を主要な分析手法として優先し、検証と多変量調整のために<span className="font-bold">{selectedAlgs.slice(1).map(a => a.name).join(' と ')}</span>で補完することをお勧めします。この組み合わせにより、検出力({Math.round((results.reduce((acc, r) => acc + r.power, 0) / results.length) * 100)}%)を最大化し、結果の臨床的解釈可能性を確保できます。</>
                )}
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-12 border-t border-[#D2D2D7] flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-[#86868B] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#0071E3] rounded-full" />
              Generated by MedStats AI Decision Engine
            </div>
            <div>Timestamp: {new Date().toLocaleString()}</div>
            <div className="flex items-center gap-1">
              <ShieldAlert size={12} />
              For Research Use Only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
