/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { SimulationResult, AVAILABLE_ALGORITHMS } from '../types';
import { translations, Language } from '../i18n';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Legend,
  Cell
} from 'recharts';
import { TrendingUp, Zap, Target, Cpu } from 'lucide-react';

interface SimulationDashboardProps {
  results: SimulationResult[];
  selectedIds: string[];
  overallScore: number;
  summary: string;
  language: Language;
}

const SimulationDashboard = memo(({ results, selectedIds, overallScore, summary, language }: SimulationDashboardProps) => {
  const t = translations[language];
  if (selectedIds.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2rem] border border-dashed border-[#D2D2D7]">
        <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center text-[#86868B] mb-4">
          <Zap size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">{language === 'zh' ? '等待實驗室指令' : language === 'en' ? 'Waiting for lab instructions' : 'ラボの指示を待っています'}</h3>
        <p className="text-[#86868B] max-w-xs">{language === 'zh' ? '請選擇統計演算法，AI 將即時模擬並生成方案診斷數據。' : language === 'en' ? 'Please select statistical algorithms, AI will simulate and generate diagnostic data in real-time.' : '統計アルゴリズムを選択してください。AIがリアルタイムでシミュレーションし、診断データを生成します。'}</p>
      </div>
    );
  }

  const chartData = results.map(r => {
    const alg = AVAILABLE_ALGORITHMS.find(a => a.id === r.algorithmId);
    return {
      name: alg?.name || r.algorithmId,
      power: Math.round(r.power * 100),
      precision: Math.round(r.precision * 100),
      complexity: Math.round(r.complexity * 100),
      score: r.recommendationScore
    };
  });

  const COLORS = ['#0071E3', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#5856D6'];

  return (
    <div className="space-y-8">
      {/* Overall Recommendation Score & Summary */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-[#D2D2D7] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0071E3]/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#F5F5F7"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#0071E3"
                strokeWidth="12"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * overallScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-[#1D1D1F]">{overallScore}</span>
              <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-widest">{t.overallScore}</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-[#FF9500]" />
              <h3 className="text-xl font-bold text-[#1D1D1F]">{t.schemeDiag}</h3>
            </div>
            <p className="text-[#424245] leading-relaxed text-lg">
              {summary || (language === 'zh' ? "正在生成方案診斷..." : language === 'en' ? "Generating diagnosis..." : "診断を生成中...")}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-[#D2D2D7] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-[#0071E3]" />
            <h3 className="font-bold">{language === 'zh' ? '推薦分數對比' : language === 'en' ? 'Score Comparison' : 'スコア比較'}</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#F5F5F7' }}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#D2D2D7] shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Target size={18} className="text-[#34C759]" />
            <h3 className="font-bold">{language === 'zh' ? '多維度性能分析' : language === 'en' ? 'Multi-dimensional Analysis' : '多次元分析'}</h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#D2D2D7" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                {chartData.map((entry, index) => (
                  <Radar
                    key={entry.name}
                    name={entry.name}
                    dataKey="power"
                    stroke={COLORS[index % COLORS.length]}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.3}
                  />
                ))}
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Cards */}
      <div className="bg-white rounded-[2rem] border border-[#D2D2D7] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#D2D2D7] bg-[#F5F5F7]/50">
          <h3 className="font-bold">{language === 'zh' ? '模擬詳細分析' : language === 'en' ? 'Detailed Simulation Analysis' : 'シミュレーション詳細分析'}</h3>
        </div>
        <div className="divide-y divide-[#D2D2D7]">
          {results.map(r => {
            const alg = AVAILABLE_ALGORITHMS.find(a => a.id === r.algorithmId);
            const displayName = alg ? alg.name : r.algorithmId;
            return (
              <div key={r.algorithmId} className="p-6 hover:bg-[#F5F5F7]/30 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F5F5F7] rounded-xl flex items-center justify-center font-bold text-[#0071E3]">
                      {r.recommendationScore}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1D1D1F]">{displayName}</h4>
                      <p className="text-xs text-[#86868B]">{alg?.type || '統計方法'}</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center w-20">
                      <p className="text-[10px] text-[#86868B] uppercase font-bold tracking-wider mb-1">Power</p>
                      <p className="font-mono font-bold text-[#0071E3] mb-1">{Math.round(r.power * 100)}%</p>
                      <div className="w-full h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#0071E3]" style={{ width: `${r.power * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-center w-20">
                      <p className="text-[10px] text-[#86868B] uppercase font-bold tracking-wider mb-1">Precision</p>
                      <p className="font-mono font-bold text-[#34C759] mb-1">{Math.round(r.precision * 100)}%</p>
                      <div className="w-full h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#34C759]" style={{ width: `${r.precision * 100}%` }} />
                      </div>
                    </div>
                    <div className="text-center w-20">
                      <p className="text-[10px] text-[#86868B] uppercase font-bold tracking-wider mb-1">Complexity</p>
                      <p className="font-mono font-bold text-[#FF9500] mb-1">{Math.round(r.complexity * 100)}%</p>
                      <div className="w-full h-1 bg-[#F5F5F7] rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF9500]" style={{ width: `${r.complexity * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F5F5F7] p-4 rounded-2xl text-sm text-[#424245] leading-relaxed">
                  <span className="font-bold text-[#1D1D1F] mr-2">AI 點評:</span>
                  {r.notes}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default SimulationDashboard;
