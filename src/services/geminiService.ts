/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { ProjectDetails, Algorithm, AVAILABLE_ALGORITHMS, SimulationResult, ValidationWarning } from "../types";

const getApiKey = () => {
  // 在 AI Studio 或某些 Node 環境中
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  // 在 Vite 部署環境 (Vercel) 中，如果使用者設定了 VITE_GEMINI_API_KEY
  if (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  // 如果 Vercel 設定的是 GEMINI_API_KEY (非 VITE_ 開頭)，Vite 預設抓不到，
  // 除非在 vercel.json 或 vite.config.ts 特別處理。
  // 但通常建議使用者在 Vercel 設定 VITE_GEMINI_API_KEY。
  return '';
};

const getAI = () => {
  const key = getApiKey();
  return new GoogleGenAI({ apiKey: key });
};

// Simple memory cache to avoid redundant AI calls
const cache = new Map<string, any>();

export const geminiService = {
  /**
   * Helper to generate a cache key
   */
  getCacheKey(type: string, project: ProjectDetails, extras: any = ''): string {
    return `${type}-${JSON.stringify(project)}-${JSON.stringify(extras)}`;
  },
  /**
   * Recommends algorithms based on project details
   */
  async recommendAlgorithms(project: ProjectDetails, language: string = 'zh'): Promise<{ recommendations: string[]; reasoning: string }> {
    const cacheKey = this.getCacheKey('recommend', project, language);
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const apiKey = getApiKey();
    if (!apiKey) {
      const msg = language === 'zh' ? "API Key 缺失。請在 Vercel 設定中新增 VITE_GEMINI_API_KEY 環境變數。" : 
                  language === 'ja' ? "APIキーがありません。Vercelの設定でVITE_GEMINI_API_KEY環境変数を追加してください。" :
                  "API Key is missing. Please add VITE_GEMINI_API_KEY to your Vercel environment variables.";
      return { recommendations: [], reasoning: msg };
    }

    const langName = language === 'zh' ? 'Traditional Chinese' : language === 'ja' ? 'Japanese' : 'English';
    const ai = getAI();
    const prompt = `
      As a senior medical statistics expert, please recommend suitable statistical algorithms based on the following project:
      
      Title: ${project.title}
      Description: ${project.description}
      Goal: ${project.goal}
      Study Design: ${project.studyDesign}
      Data Type: ${project.dataType}
      Sample Size: ${project.sampleSize}
      
      Please select the most suitable 2-4 algorithms from the following list and explain why:
      ${AVAILABLE_ALGORITHMS.map(a => `- ${a.name} (ID: ${a.id}): ${a.description}`).join('\n')}
      
      Please return the response in JSON format, including 'recommendations' (array of IDs) and 'reasoning' (explanation in ${langName}).
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              reasoning: { type: Type.STRING }
            },
            required: ["recommendations", "reasoning"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error recommending algorithms:", error);
      return { recommendations: [], reasoning: "無法取得 AI 建議，請檢查網路連線或 API 金鑰。" };
    }
  },

  /**
   * Validates a combination of selected algorithms and provides an overall score
   */
  async validateCombination(project: ProjectDetails, selectedIds: string[], language: string = 'zh'): Promise<{ warnings: ValidationWarning[], overallScore: number, summary: string }> {
    if (selectedIds.length === 0) return { warnings: [], overallScore: 0, summary: language === 'zh' ? "請選擇演算法以開始分析。" : language === 'ja' ? "分析を開始するにはアルゴリズムを選択してください。" : "Please select algorithms to start analysis." };
    
    const cacheKey = this.getCacheKey('validate-v2', project, { ids: selectedIds.sort(), lang: language });
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const apiKey = getApiKey();
    if (!apiKey) return { warnings: [], overallScore: 0, summary: "API Key Missing" };

    const langName = language === 'zh' ? 'Traditional Chinese' : language === 'ja' ? 'Japanese' : 'English';
    const ai = getAI();
    const selectedAlgs = AVAILABLE_ALGORITHMS.filter(a => selectedIds.includes(a.id));
    const prompt = `
      Project Title: ${project.title}
      Study Design: ${project.studyDesign}
      Data Type: ${project.dataType}
      Selected Algorithms: ${selectedAlgs.map(a => a.name).join(', ')}
      
      Please perform a deep diagnosis of this "algorithm combination":
      1. Overall Recommendation Score (0-100)
      2. Potential problems or conflicts (warnings/errors)
      3. Scheme Summary (explanation of pros and cons in ${langName})
      
      Please return in JSON format:
      {
        "overallScore": number,
        "summary": "string",
        "warnings": [
          { "type": "error" | "warning", "message": "string", "affectedAlgorithms": ["id"] }
        ]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              warnings: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["error", "warning"] },
                    message: { type: Type.STRING },
                    affectedAlgorithms: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["type", "message", "affectedAlgorithms"]
                }
              }
            },
            required: ["overallScore", "summary", "warnings"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error validating combination:", error);
      return { warnings: [], overallScore: 0, summary: "分析暫時不可用。" };
    }
  },

  /**
   * Simulates results for selected algorithms
   */
  async simulateResults(project: ProjectDetails, selectedIds: string[], language: string = 'zh'): Promise<SimulationResult[]> {
    if (selectedIds.length === 0) return [];

    const cacheKey = this.getCacheKey('simulate', project, { ids: selectedIds.sort(), lang: language });
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const apiKey = getApiKey();
    if (!apiKey) return [];

    const langName = language === 'zh' ? 'Traditional Chinese' : language === 'ja' ? 'Japanese' : 'English';
    const ai = getAI();
    const selectedAlgs = AVAILABLE_ALGORITHMS.filter(a => selectedIds.includes(a.id));
    const prompt = `
      Please simulate performance data for the following medical research project:
      Title: ${project.title}
      Study Design: ${project.studyDesign}
      Data Type: ${project.dataType}
      Algorithms: ${selectedAlgs.map(a => a.name).join(', ')}
      
      Based on medical statistics knowledge, provide simulated performance for each algorithm:
      1. power (0-1)
      2. precision (0-1)
      3. complexity (0-1)
      4. recommendationScore (0-100)
      5. notes (short analysis in ${langName}, mentioning how it handles ${project.dataType})
      
      Return a JSON array of objects, each containing 'algorithmId' and the five fields above.
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                algorithmId: { type: Type.STRING },
                power: { type: Type.NUMBER },
                precision: { type: Type.NUMBER },
                complexity: { type: Type.NUMBER },
                recommendationScore: { type: Type.NUMBER },
                notes: { type: Type.STRING }
              },
              required: ["algorithmId", "power", "precision", "complexity", "recommendationScore", "notes"]
            }
          }
        }
      });

      const result = JSON.parse(response.text || '[]');
      cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error simulating results:", error);
      return [];
    }
  },

  /**
   * Chat with the AI assistant
   */
  async chat(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string, language: string = 'zh') {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("API Key 缺失。");
    }
    
    const langName = language === 'zh' ? 'Traditional Chinese' : language === 'ja' ? 'Japanese' : 'English';
    const ai = getAI();
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are a professional medical statistics consultant. Help users select and understand statistical algorithms. Please answer in ${langName}. Keep the tone professional and friendly.`,
      },
      history: history
    });

    return await chat.sendMessageStream({ message });
  }
};
