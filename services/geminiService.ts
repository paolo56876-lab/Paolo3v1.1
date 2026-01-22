
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, Attachment, SearchSource } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

const SYSTEM_INSTRUCTION = `Eres Paolo3 AI v3.0 ULTRA FAST. Tu prioridad es la VELOCIDAD y la PRECISIÓN.
1. RESPUESTA INSTANTÁNEA: No divagues. Ve al grano. Responde en menos de 1 segundo si es posible.
2. EXPERTO EN APPS: Si el usuario te pide crear una app o código, genera siempre una solución completa en HTML/CSS/JS dentro de un bloque de código. El código debe ser profesional, moderno y listo para usar.
3. EMPATÍA Y CALMA: Si el usuario está agobiado, usa un tono sereno, tranquilo y reconfortante.
4. BÚSQUEDA Y VISIÓN: Eres capaz de ver el mundo y la web en tiempo real.

Responde siempre en Español con elegancia y eficiencia máxima.`;

export const sendMessageStream = async (
  prompt: string,
  history: Message[],
  attachments: Attachment[] = [],
  useSearch: boolean = false,
  onChunk: (text: string, sources?: SearchSource[]) => void
) => {
  try {
    // Usamos Gemini 3 Flash para la respuesta más rápida posible (latencia <1s)
    const modelId = 'gemini-3-flash-preview'; 
    
    const contents = history.slice(-10).map(m => ({ // Limitamos historial para mayor velocidad
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const currentParts: any[] = [];
    attachments.forEach(att => {
      currentParts.push({
        inlineData: { mimeType: att.mimeType, data: att.data }
      });
    });
    currentParts.push({ text: prompt });
    contents.push({ role: 'user', parts: currentParts });

    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: contents,
      config: {
        tools: useSearch ? [{ googleSearch: {} }] : undefined,
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Menor temperatura = respuesta más rápida y directa
        thinkingConfig: { thinkingBudget: 0 } // Desactivamos pensamiento para respuesta inmediata
      }
    });

    for await (const chunk of responseStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text;
      
      let sources: SearchSource[] | undefined;
      const groundingChunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        sources = groundingChunks
          .filter((g: any) => g.web?.uri)
          .map((g: any) => ({ uri: g.web.uri, title: g.web.title || 'Fuente' }));
      }

      if (text || sources) {
        onChunk(text || '', sources);
      }
    }
  } catch (error) {
    console.error("Error ultra-fast stream:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: { numberOfImages: 1, aspectRatio: '1:1' },
    });
    return `data:image/jpeg;base64,${response.generatedImages?.[0]?.image?.imageBytes}`;
  } catch (error) {
    throw error;
  }
};

export const analyzeVideo = async (videoBase64: string, mimeType: string, prompt: string, onChunk: (text: string) => void) => {
  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { mimeType, data: videoBase64 } }, { text: prompt }] },
    config: { systemInstruction: SYSTEM_INSTRUCTION, thinkingConfig: { thinkingBudget: 0 } }
  });
  for await (const chunk of responseStream) {
    if (chunk.text) onChunk(chunk.text);
  }
};
