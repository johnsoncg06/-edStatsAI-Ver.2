/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Algorithm, AVAILABLE_ALGORITHMS, AlgorithmType } from '../types';
import { Check, Plus, Info, Sparkles } from 'lucide-react';
import { translations, Language } from '../i18n';

interface AlgorithmSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  recommendations: { ids: string[], reasoning: string };
  language: Language;
}

const AlgorithmSelector = memo(({ selectedIds, onChange, recommendations, language }: AlgorithmSelectorProps) => {
  const t = translations[language];
  const toggleAlgorithm = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const groupedAlgorithms = AVAILABLE_ALGORITHMS.reduce((acc, alg) => {
    if (!acc[alg.type]) acc[alg.type] = [];
    acc[alg.type].push(alg);
    return acc;
  }, {} as Record<AlgorithmType, Algorithm[]>);

  return (
    <div className="space-y-6">
      {/* AI Recommendations Section */}
      {recommendations.ids.length > 0 && (
        <div className="bg-gradient-to-br from-[#0071E3] to-[#40A9FF] rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} />
            <h3 className="font-bold">{t.aiRec}</h3>
          </div>
          <p className="text-sm text-white/90 mb-4 leading-relaxed">{recommendations.reasoning}</p>
          <div className="flex flex-wrap gap-2">
            {recommendations.ids.map(id => {
              const alg = AVAILABLE_ALGORITHMS.find(a => a.id === id);
              if (!alg) return null;
              const isSelected = selectedIds.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleAlgorithm(id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${isSelected ? 'bg-white text-[#0071E3]' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                  {isSelected ? <Check size={14} /> : <Plus size={14} />}
                  {alg.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="bg-white rounded-3xl border border-[#D2D2D7] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#D2D2D7]">
          <h3 className="font-bold text-lg">{t.labTitle}</h3>
          <p className="text-sm text-[#86868B]">{language === 'zh' ? '點擊以添加至您的決策組合' : language === 'en' ? 'Click to add to your decision set' : 'クリックして決定セットに追加'}</p>
        </div>
        
        <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
          {Object.entries(groupedAlgorithms).map(([type, algs]) => (
            <div key={type} className="space-y-3">
              <h4 className="text-xs font-bold text-[#86868B] uppercase tracking-wider px-2">
                {(t.categories as any)[type] || type}
              </h4>
              <div className="space-y-2">
                {algs.map(alg => {
                  const isSelected = selectedIds.includes(alg.id);
                  const isRecommended = recommendations.ids.includes(alg.id);
                  
                  return (
                    <div 
                      key={alg.id}
                      onClick={() => toggleAlgorithm(alg.id)}
                      className={`group p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-[#F5F5F7] border-[#0071E3]' : 'bg-white border-transparent hover:bg-[#F5F5F7]'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-[#0071E3] text-white' : 'bg-[#F5F5F7] text-[#86868B] group-hover:bg-white'}`}>
                          {isSelected ? <Check size={20} /> : <Plus size={20} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{alg.name}</span>
                            {isRecommended && <Sparkles size={12} className="text-[#0071E3]" />}
                          </div>
                          <p className="text-xs text-[#86868B] line-clamp-1">{alg.description}</p>
                        </div>
                      </div>
                      <button className="p-2 text-[#86868B] hover:text-[#1D1D1F] transition-colors">
                        <Info size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default AlgorithmSelector;
