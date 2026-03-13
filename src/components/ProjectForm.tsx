/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectDetails } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';
import { translations, Language } from '../i18n';

interface ProjectFormProps {
  onSubmit: (details: ProjectDetails) => void;
  initialData: ProjectDetails | null;
  isLoading: boolean;
  language: Language;
}

export default function ProjectForm({ onSubmit, initialData, isLoading, language }: ProjectFormProps) {
  const t = translations[language];
  const [formData, setFormData] = useState<ProjectDetails>(initialData || {
    title: '',
    description: '',
    goal: '',
    dataType: '連續性數據 (Continuous)',
    sampleSize: '',
    studyDesign: '隨機對照試驗 (RCT)'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[2rem] p-10 border border-[#D2D2D7] shadow-sm">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">{t.setupTitle}</h2>
        <p className="text-[#86868B]">{t.setupDesc}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1D1D1F] ml-1">{t.projectTitle}</label>
          <input
            required
            type="text"
            placeholder={language === 'zh' ? '例如：探討某新型藥物對二型糖尿病患者血糖控制之成效' : language === 'en' ? 'e.g., Efficacy of a new drug on glycemic control in type 2 diabetes' : '例：2型糖尿病患者の血糖コントロールに対する新薬の有効性'}
            className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border-none focus:ring-2 focus:ring-[#0071E3] transition-all"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#1D1D1F] ml-1">{t.projectDesc}</label>
          <textarea
            required
            rows={4}
            placeholder={language === 'zh' ? '請描述您的研究背景、受試者特徵等...' : language === 'en' ? 'Describe your research background, participant characteristics, etc...' : '研究の背景、参加者の特徴などを説明してください...'}
            className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border-none focus:ring-2 focus:ring-[#0071E3] transition-all resize-none"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1D1D1F] ml-1">{t.dataType}</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border-none focus:ring-2 focus:ring-[#0071E3] transition-all appearance-none"
              value={formData.dataType}
              onChange={e => setFormData({ ...formData, dataType: e.target.value })}
            >
              <option>連續性數據 (Continuous)</option>
              <option>類別性數據 (Categorical/Binary)</option>
              <option>離散型/計數數據 (Discrete/Count)</option>
              <option>序位數據 (Ordinal)</option>
              <option>存活時間數據 (Time-to-event)</option>
              <option>基因組/組學數據 (Genomics/Omics)</option>
              <option>醫學影像數據 (Imaging)</option>
              <option>電子病歷數據 (EHR/Structured)</option>
              <option>感測器/流數據 (Sensor/Streaming)</option>
              <option>多中心/層次數據 (Multi-center/Hierarchical)</option>
              <option>多組學整合數據 (Multi-omics Integration)</option>
              <option>穿戴式裝置數據 (Wearable Device Data)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1D1D1F] ml-1">{t.studyDesign}</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border-none focus:ring-2 focus:ring-[#0071E3] transition-all appearance-none"
              value={formData.studyDesign}
              onChange={e => setFormData({ ...formData, studyDesign: e.target.value })}
            >
              <option>隨機對照試驗 (RCT)</option>
              <option>非隨機臨床試驗 (Non-randomized Trial)</option>
              <option>交叉設計研究 (Crossover Design)</option>
              <option>析因設計研究 (Factorial Design)</option>
              <option>世代研究 (Cohort Study)</option>
              <option>病例對照研究 (Case-Control Study)</option>
              <option>橫斷面研究 (Cross-sectional Study)</option>
              <option>診斷性試驗 (Diagnostic Study)</option>
              <option>Meta 分析 / 系統回顧 (Meta-Analysis)</option>
              <option>孟德爾隨機化研究 (Mendelian Randomization)</option>
              <option>病例報告/系列 (Case Report/Series)</option>
              <option>適應性設計試驗 (Adaptive Design)</option>
              <option>實務性臨床試驗 (Pragmatic Clinical Trial)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1D1D1F] ml-1">{t.sampleSize}</label>
            <input
              required
              type="text"
              placeholder="e.g., 200"
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              value={formData.sampleSize}
              onChange={e => setFormData({ ...formData, sampleSize: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1D1D1F] ml-1">{t.analysisGoal}</label>
            <input
              required
              type="text"
              placeholder={language === 'zh' ? '例如：比較差異、預測風險' : language === 'en' ? 'e.g., Compare differences, Predict risk' : '例：差異の比較、リスク予測'}
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              value={formData.goal}
              onChange={e => setFormData({ ...formData, goal: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-[#0071E3] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#0077ED] transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t.aiAnalyzing}</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>{t.generateBtn}</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
