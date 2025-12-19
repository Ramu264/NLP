
import { GoogleGenAI } from "@google/genai";
import { SummarizationConfig } from "../types";

export const summarizeText = async (text: string, config: SummarizationConfig): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  
  const lengthInstruction = {
    brief: "extremely concise (1-2 sentences)",
    medium: "moderately detailed (1-2 paragraphs)",
    detailed: "comprehensive and thorough"
  }[config.length];

  const toneInstruction = {
    professional: "professional and business-like",
    casual: "conversational and easy-going",
    academic: "formal and rigorous",
    simple: "easy to understand for a general audience"
  }[config.tone];

  const formatInstruction = {
    paragraph: "as a cohesive paragraph",
    bullets: "as a structured bulleted list"
  }[config.format];

  const systemInstruction = `You are an expert NLP summarization assistant. 
  Your goal is to provide a ${lengthInstruction} summary of the provided text.
  The tone should be ${toneInstruction}.
  The format should be ${formatInstruction}.
  Ensure the core meaning is preserved while eliminating unnecessary fluff.
  Do not include any introductory remarks like "Here is the summary:". Just provide the content.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      throw new Error("Failed to generate summary text");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
