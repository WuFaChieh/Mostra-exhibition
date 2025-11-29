import { GoogleGenAI } from "@google/genai";
import { Exhibition } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * 生成策展人觀點 (短評)
 */
export const generateCuratorInsight = async (exhibition: Exhibition): Promise<string> => {
  if (!apiKey) return "缺少 API 金鑰，無法提供 AI 觀點。";

  try {
    const prompt = `
      作為一位專業的藝術策展人，請用繁體中文 (Traditional Chinese) 寫一段適合手機閱讀的短評 (約 60 字)。
      請針對以下展覽解釋為什麼值得一看，語氣要優雅且具吸引力：
      
      展覽名稱: ${exhibition.title}
      藝術家/單位: ${exhibition.artist}
      描述: ${exhibition.description}
      標籤: ${exhibition.tags.join(', ')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "探索這件傑作，尋找屬於你的意義。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 策展人目前休息中，請稍後再試。";
  }
};

/**
 * 優化展覽草稿 (標題與描述)
 */
export const enhanceExhibitionDraft = async (rawIdea: string): Promise<{ title: string, description: string }> => {
  if (!apiKey) return { title: "未命名展覽", description: rawIdea };

  try {
    const prompt = `
      使用者輸入了一個關於藝術展覽的初步想法："${rawIdea}"。
      請用繁體中文 (Traditional Chinese) 幫忙優化內容，回傳 JSON 格式：
      1. title: 一個吸引人的展覽標題 (20字內)。
      2. description: 一段流暢的展覽介紹 (80字內)。
      
      請嚴格回傳 JSON 格式。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No text returned");
    
    const json = JSON.parse(text);
    return {
      title: json.title || "新視野：藝術探索",
      description: json.description || rawIdea
    };
  } catch (error) {
    console.error("Gemini Enhancement Error:", error);
    return { title: "新展覽草稿", description: rawIdea };
  }
};