import { GoogleGenAI, Type, Modality } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const ai = new GoogleGenAI({ apiKey });

export async function analyzeClinicalNotes(notes: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze the following clinical notes and extract key findings, potential diagnosis, and recommended follow-up: \n\n ${notes}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          findings: { type: Type.ARRAY, items: { type: Type.STRING } },
          potentialDiagnosis: { type: Type.STRING },
          followUp: { type: Type.STRING }
        },
        required: ["findings", "potentialDiagnosis", "followUp"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function transcribeAudio(base64Audio: string, mimeType: string = "audio/wav") {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: { data: base64Audio, mimeType } },
      { text: "Transcribe the following audio precisely." }
    ]
  });
  return response.text;
}

export async function textToSpeech(text: string, voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Kore') {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const binary = atob(base64Audio);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "audio/pcm;rate=24000" });
    return URL.createObjectURL(blob);
  }
  return null;
}

export async function searchLensInfo(query: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sources = chunks?.map(c => c.web?.uri).filter(Boolean) || [];
  
  return {
    text: response.text,
    sources
  };
}
