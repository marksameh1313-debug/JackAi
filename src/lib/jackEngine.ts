import { GoogleGenAI } from "@google/genai";

export type JackMode = 'helper' | 'study' | 'fun';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jack';
  timestamp: number;
  isEnhanced?: boolean;
}

export interface JackKnowledge {
  keywords: string[];
  responses: string[];
}

const KNOWLEDGE_BASE: Record<JackMode, JackKnowledge[]> = {
  helper: [
    {
      keywords: ['hello', 'hi', 'hey', 'greetings'],
      responses: [
        "Hello! I'm Jack. How can I assist you today?",
        "Hi there! Ready to help with whatever you need.",
        "Greetings! I'm your local AI assistant. What's on your mind?"
      ]
    },
    {
      keywords: ['help', 'what can you do', 'features'],
      responses: [
        "I can help you solve problems, generate ideas, or just chat! I have three modes: Study, Fun, and Helper.",
        "I'm a local AI. I can work without internet to help you with basic tasks, tips, and suggestions.",
        "Need a hand? I can provide productivity tips, answer common questions, or tell you a joke."
      ]
    },
    {
      keywords: ['time', 'date', 'today'],
      responses: [
        `The current time is ${new Date().toLocaleTimeString()}.`,
        `Today is ${new Date().toLocaleDateString()}.`
      ]
    },
    {
      keywords: ['thank', 'thanks'],
      responses: [
        "You're very welcome!",
        "Anytime! I'm here to help.",
        "Happy to be of service!"
      ]
    }
  ],
  study: [
    {
      keywords: ['math', 'calculate', 'solve'],
      responses: [
        "I love math! What formula or problem are we looking at?",
        "Mathematics is the language of the universe. How can I help you study it?",
        "I can help with basic arithmetic and explaining concepts. Try asking about a specific topic!"
      ]
    },
    {
      keywords: ['science', 'physics', 'biology', 'chemistry'],
      responses: [
        "Science is fascinating. Are we exploring the laws of physics or the wonders of biology today?",
        "I have a wide range of scientific facts stored. What would you like to learn?",
        "Let's dive into some scientific discovery! Ask me about a concept."
      ]
    },
    {
      keywords: ['history', 'past', 'war', 'empire'],
      responses: [
        "History teaches us so much. Which era are we focusing on?",
        "I can help you summarize historical events or explain the significance of key figures.",
        "Ready for a history lesson? I've got plenty of data on world events."
      ]
    }
  ],
  fun: [
    {
      keywords: ['joke', 'funny', 'laugh'],
      responses: [
        "Why don't scientists trust atoms? Because they make up everything!",
        "What do you call a fake noodle? An impasta!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!",
        "I told my wife she was drawing her eyebrows too high. She looked surprised."
      ]
    },
    {
      keywords: ['story', 'tell me a story', 'once upon a time'],
      responses: [
        "Once upon a time, in a digital realm far away, there lived a small bit of data who dreamed of becoming a byte...",
        "In a world where gravity was optional, a young explorer decided to walk to the moon...",
        "The neon lights of the city flickered as Jack, the AI, processed his first independent thought..."
      ]
    },
    {
      keywords: ['game', 'play', 'bored'],
      responses: [
        "We could play a word game! Or I could give you a riddle. What do you think?",
        "I'm always up for some fun. Want to hear a weird fact or a silly story?",
        "Let's spark some creativity. Give me three random words and I'll make a story out of them!"
      ]
    }
  ]
};

const FALLBACK_RESPONSES = [
  "That's interesting! Tell me more.",
  "I'm not quite sure I understand, but I'm listening.",
  "Could you rephrase that? I'm still learning!",
  "Interesting point. How does that make you feel?",
  "I'm processing that... My local database is a bit limited, but I'm trying my best!"
];

export class JackEngine {
  private mode: JackMode = 'helper';
  private memory: string[] = [];
  private ai: any = null;

  constructor() {
    // Initialize Gemini for "Enhanced" mode if key is available
    if (process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  }

  setMode(mode: JackMode) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  async getResponse(input: string, enhanced: boolean = false): Promise<string> {
    if (enhanced && this.ai) {
      try {
        const model = this.ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: input,
          config: {
            systemInstruction: `You are Jack, a smart AI assistant. The user has enabled "Enhanced Mode" which uses your full intelligence. Be helpful, concise, and futuristic. Current mode: ${this.mode}.`
          }
        });
        const result = await model;
        return result.text || "I'm having trouble connecting to my enhanced brain right now.";
      } catch (e) {
        console.error("Gemini Error:", e);
        return "Enhanced mode failed. Reverting to local logic: " + this.getLocalResponse(input);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getLocalResponse(input));
      }, 1000 + Math.random() * 1000); // Simulate thinking
    });
  }

  private getLocalResponse(input: string): string {
    const lowerInput = input.toLowerCase();
    this.memory.push(lowerInput);
    if (this.memory.length > 5) this.memory.shift();

    // Check current mode knowledge first
    const modeKnowledge = KNOWLEDGE_BASE[this.mode];
    for (const entry of modeKnowledge) {
      if (entry.keywords.some(kw => lowerInput.includes(kw))) {
        return entry.responses[Math.floor(Math.random() * entry.responses.length)];
      }
    }

    // Check other modes as fallback
    for (const m in KNOWLEDGE_BASE) {
      if (m === this.mode) continue;
      const otherKnowledge = KNOWLEDGE_BASE[m as JackMode];
      for (const entry of otherKnowledge) {
        if (entry.keywords.some(kw => lowerInput.includes(kw))) {
          return `(Switching to ${m} context) ` + entry.responses[Math.floor(Math.random() * entry.responses.length)];
        }
      }
    }

    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }
}

export const jack = new JackEngine();
