/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { ProjectDetails, Algorithm, AVAILABLE_ALGORITHMS, SimulationResult, ValidationWarning } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
  async recommendAlgorithms(project: ProjectDetails): Promise<{ recommendations: string[]; reasoning: string }> {
    const cacheKey = this.getCacheKey('recommend', project);
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    if (!process.env.GEMINI_API_KEY) {
      return { recommendations: [], reasoning: "請先在設定中配置 GEMINI_API_KEY 以啟用 AI 建議功能。" };
    }

    const prompt = `
      身為一位資深醫學統計專家，請根據以下研究課題推薦適合的統計演算法：
      
      標題：${project.title}
      描述：${project.description}
      目標：${project.goal}
      研究設計：${project.studyDesign}
      數據類型：${project.dataType}
      樣本量：${project.sampleSize}
      
      請從以下候選名單中選擇最適合的 2-4 個，並說明理由：
      ${AVAILABLE_ALGORITHMS.map(a => `- ${a.name} (ID: ${a.id}): ${a.description}`).join('\n')}
      
      請以 JSON 格式回傳，包含 'recommendations' (ID 陣列) 與 'reasoning' (繁體中文說明)。
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
  async validateCombination(project: ProjectDetails, selectedIds: string[]): Promise<{ warnings: ValidationWarning[], overallScore: number, summary: string }> {
    if (selectedIds.length === 0) return { warnings: [], overallScore: 0, summary: "請選擇演算法以開始分析。" };
    
    const cacheKey = this.getCacheKey('validate-v2', project, selectedIds.sort());
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    if (!process.env.GEMINI_API_KEY) return { warnings: [], overallScore: 0, summary: "API Key Missing" };

    const selectedAlgs = AVAILABLE_ALGORITHMS.filter(a => selectedIds.includes(a.id));
    const prompt = `
      研究課題：${project.title}
      研究設計：${project.studyDesign}
      數據類型：${project.dataType}
      當前方案組合：${selectedAlgs.map(a => a.name).join(', ')}
      
      請針對這個「方案組合」進行深度診斷：
      1. 綜合推薦程度 (0-100 分)
      2. 潛在問題或衝突 (warnings/errors)
      3. 方案總結 (繁體中文，說明此組合的優劣勢)
      
      請以 JSON 格式回傳：
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
  async simulateResults(project: ProjectDetails, selectedIds: string[]): Promise<SimulationResult[]> {
    if (selectedIds.length === 0) return [];

    const cacheKey = this.getCacheKey('simulate', project, selectedIds.sort());
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    if (!process.env.GEMINI_API_KEY) return [];

    const selectedAlgs = AVAILABLE_ALGORITHMS.filter(a => selectedIds.includes(a.id));
    const prompt = `
      請為以下研究課題模擬這些演算法的表現數據：
      課題：${project.title}
      研究設計：${project.studyDesign}
      數據類型：${project.dataType}
      演算法：${selectedAlgs.map(a => a.name).join(', ')}
      
      請根據醫學統計常識，為每個演算法提供在該研究背景下的模擬表現：
      1. power (檢定力, 0-1)
      2. precision (精確度, 0-1)
      3. complexity (運算複雜度, 0-1)
      4. recommendationScore (推薦分數, 0-100)
      5. notes (簡短分析說明，請提及該演算法如何處理 ${project.dataType})
      
      請以 JSON 格式回傳陣列，每個物件包含 'algorithmId' 與上述五個欄位。
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
  async chat(history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "你是一位專業的醫學統計顧問，負責協助使用者選擇與理解統計演算法。請使用繁體中文回答，語氣專業且親切。",
      },
      history: history
    });

    return await chat.sendMessageStream({ message });
  }
};
