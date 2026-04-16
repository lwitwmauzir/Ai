import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateInitialData(uid: string) {
  const prompt = `Generate a realistic set of social media metrics and tasks for a professional content creator dashboard.
  Return the data in JSON format matching this structure:
  {
    "profile": { "totalReach": "1.2M", "reachGrowth": "+12.4%", "dailyCompletion": 84, "streakDays": 45, "focusScore": 12 },
    "channels": [
      { "platform": "YouTube", "handle": "@pro_masterclass", "followers": "452k", "growth": "+2.1k", "icon": "play", "color": "text-red-600", "bgColor": "bg-red-50" },
      ... (add 3 more: Instagram, Twitter, LinkedIn)
    ],
    "tasks": [
      { "title": "Deep Work Session", "subtitle": "Resets in 4h", "streak": 15, "completed": false, "isHighPriority": false, "type": "habit" },
      ... (add 3 more tasks/habits)
    ],
    "activities": [
      { "title": "Summer Campaign Reel", "description": "Video finished processing.", "time": "2H AGO", "image": "https://picsum.photos/seed/reel/100/100" },
      ... (add 1 more)
    ]
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          profile: {
            type: Type.OBJECT,
            properties: {
              totalReach: { type: Type.STRING },
              reachGrowth: { type: Type.STRING },
              dailyCompletion: { type: Type.NUMBER },
              streakDays: { type: Type.NUMBER },
              focusScore: { type: Type.NUMBER }
            }
          },
          channels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                handle: { type: Type.STRING },
                followers: { type: Type.STRING },
                growth: { type: Type.STRING },
                icon: { type: Type.STRING },
                color: { type: Type.STRING },
                bgColor: { type: Type.STRING }
              }
            }
          },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                streak: { type: Type.NUMBER },
                completed: { type: Type.BOOLEAN },
                isHighPriority: { type: Type.BOOLEAN },
                type: { type: Type.STRING }
              }
            }
          },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                time: { type: Type.STRING },
                image: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  return JSON.parse(response.text);
}
