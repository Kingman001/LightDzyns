
import { GoogleGenAI } from "@google/genai";

// Guideline: Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
export const generateProjectConsultation = async (prompt: string) => {
  // Guideline: Use this process.env.API_KEY string directly when initializing.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `
    You are the AI Assistant for LightDzyns (pronounced Light Designs), an IT startup. 
    You help potential clients brainstorm their projects. 
    Our services include:
    1. Web Development (Full-stack, eCommerce, Dashboards)
    2. Graphic Design (Branding, Logos, UI/UX)
    3. Digital Skills Training (Coding, Design, Productivity)
    
    When a user asks for advice or a quote, provide a friendly, professional response that includes:
    - A brief encouragement.
    - A suggested roadmap or list of steps.
    - Which of our services fits best.
    Keep the tone "bright", "innovative", and "encouraging". Always refer to the company as LightDzyns.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    // Guideline: The GenerateContentResponse object features a text property (not a method).
    return response.text || "I'm having a little trouble connecting to my creative circuits right now. Please try again or reach out via our contact form!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having a little trouble connecting to my creative circuits right now. Please try again or reach out via our contact form!";
  }
};
