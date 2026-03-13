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
  const dataTypes = [
    { zh: '連續性數據 (Continuous)', en: 'Continuous Data', ja: '連続データ' },
    { zh: '類別性數據 (Categorical/Binary)', en: 'Categorical/Binary Data', ja: 'カテゴリ/バイナリデータ' },
    { zh: '離散型/計數數據 (Discrete/Count)', en: 'Discrete/Count Data', ja: '離散/カウントデータ' },
    { zh: '序位數據 (Ordinal)', en: 'Ordinal Data', ja: '順序データ' },
    { zh: '存活時間數據 (Time-to-event)', en: 'Time-to-event Data', ja: '生存時間データ' },
    { zh: '基因組/組學數據 (Genomics/Omics)', en: 'Genomics/Omics Data', ja: 'ゲノミクス/オミクスデータ' },
    { zh: '醫學影像數據 (Imaging)', en: 'Imaging Data', ja: '画像データ' },
    { zh: '電子病歷數據 (EHR/Structured)', en: 'EHR/Structured Data', ja: '電子カルテデータ' },
    { zh: '感測器/流數據 (Sensor/Streaming)', en: 'Sensor/Streaming Data', ja: 'センサー/ストリーミングデータ' },
    { zh: '多中心/層次數據 (Multi-center/Hierarchical)', en: 'Multi-center/Hierarchical Data', ja: '多施設/階層データ' },
    { zh: '多組學整合數據 (Multi-omics Integration)', en: 'Multi-omics Integration', ja: 'マルチオミクス統合データ' },
    { zh: '穿戴式裝置數據 (Wearable Device Data)', en: 'Wearable Device Data', ja: 'ウェアラブルデバイスデータ' }
  ];

  const studyDesigns = [
    { zh: '隨機對照試驗 (RCT)', en: 'Randomized Controlled Trial (RCT)', ja: 'ランダム化比較試験 (RCT)' },
    { zh: '非隨機臨床試驗 (Non-randomized Trial)', en: 'Non-randomized Trial', ja: '非ランダム化臨床試験' },
    { zh: '交叉設計研究 (Crossover Design)', en: 'Crossover Design', ja: 'クロスオーバーデザイン' },
    { zh: '析因設計研究 (Factorial Design)', en: 'Factorial Design', ja: '要因デザイン' },
    { zh: '世代研究 (Cohort Study)', en: 'Cohort Study', ja: 'コホート研究' },
    { zh: '病例對照研究 (Case-Control Study)', en: 'Case-Control Study', ja: '症例対照研究' },
    { zh: '橫斷面研究 (Cross-sectional Study)', en: 'Cross-sectional Study', ja: '横断的研究' },
    { zh: '診斷性試驗 (Diagnostic Study)', en: 'Diagnostic Study', ja: '診断精度管理研究' },
    { zh: 'Meta 分析 / 系統回顧 (Meta-Analysis)', en: 'Meta-Analysis / Systematic Review', ja: 'メタ分析 / システマティックレビュー' },
    { zh: '孟德爾隨機化研究 (Mendelian Randomization)', en: 'Mendelian Randomization', ja: 'メンデルランダム化研究' },
    { zh: '病例報告/系列 (Case Report/Series)', en: 'Case Report / Series', ja: '症例報告 / シリーズ' },
    { zh: '適應性設計試驗 (Adaptive Design)', en: 'Adaptive Design', ja: '適応的デザイン試験' },
    { zh: '實務性臨床試驗 (Pragmatic Clinical Trial)', en: 'Pragmatic Clinical Trial', ja: '実用的臨床試験' }
  ];

  const [formData, setFormData] = useState<ProjectDetails>(initialData || {
    title: '',
    description: '',
    goal: '',
    dataType: dataTypes[0][language],
    sampleSize: '',
    studyDesign: studyDesigns[0][language]
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
              {dataTypes.map(dt => (
                <option key={dt.en} value={dt[language]}>{dt[language]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#1D1D1F] ml-1">{t.studyDesign}</label>
            <select
              className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border-none focus:ring-2 focus:ring-[#0071E3] transition-all appearance-none"
              value={formData.studyDesign}
              onChange={e => setFormData({ ...formData, studyDesign: e.target.value })}
            >
              {studyDesigns.map(sd => (
                <option key={sd.en} value={sd[language]}>{sd[language]}</option>
              ))}
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
