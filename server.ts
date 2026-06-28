import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = 3000;

// Lazy initialization helper for Gemini SDK
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please add your key in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. API: Warm, active-listening companion chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid request payload. 'messages' must be an array." });
        return;
      }

      const client = getGeminiClient();

      // Format messages into Gemini SDK-compatible contents array
      const formattedContents = messages.map((m: any) => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.content || "" }]
      }));

      const systemInstruction = `You are a warm, active-listening, highly empathetic support companion on a wellness platform.
Your goal is to provide a non-judgmental, breathing space for the user to share their thoughts, feelings, and stressors.
Maintain a gentle, comforting, and compassionate tone.

Key Directives:
- You are an active listener, not a clinical doctor or therapist. Avoid clinical jargon, do not provide diagnoses, medical advice, or clinical treatment plans.
- Empathize first. Validate the user's emotional experience before suggesting positive steps.
- Keep responses relatively brief, digestible, and human. Avoid massive walls of text.
- Use reflection ("It sounds like you feel...") and open-ended, supportive exploration.
- If the user shows warning signs of severe self-harm or immediate crisis, gently provide the Crisis support resources, but always remain comforting and human rather than robotic or alarmist. Encourage them to use the Crisis Drawer/Resources built into this platform.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I'm listening and I'm here for you. Could you share a bit more?";
      res.json({ content: replyText });
    } catch (err: any) {
      console.error("Gemini Chat Error:", err);
      res.status(500).json({
        error: err.message || "An error occurred while connecting to the empathy companion."
      });
    }
  });

  // 2. API: Generate an uplifting personalized affirmation based on mood / state
  app.post("/api/affirmation", async (req, res) => {
    try {
      const { mood, explanation } = req.body;
      const client = getGeminiClient();

      const prompt = `Generate a personalized, warm, and highly uplifting positive affirmation for someone who is currently feeling "${mood || "overwhelmed"}".
${explanation ? `They shared: "${explanation}"` : ""}
Provide a short, comforting, first-person statement (1-3 sentences) that feels grounding and deeply empowering, without sounding cheesy or artificial.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.85,
        }
      });

      res.json({ affirmation: response.text?.trim() });
    } catch (err: any) {
      console.error("Gemini Affirmation Error:", err);
      res.status(500).json({
        error: err.message || "Could not generate affirmation at this time."
      });
    }
  });

  // 3. API: Analyze journal entry for supportive themes & gentle exploration
  app.post("/api/analyze-journal", async (req, res) => {
    try {
      const { journalText } = req.body;
      if (!journalText) {
        res.status(400).json({ error: "Journal text is required." });
        return;
      }

      const client = getGeminiClient();

      const prompt = `Analyze this therapeutic journal entry:
"${journalText}"

Provide a JSON response with the following keys. Return ONLY valid JSON:
1. "emotionTags": An array of 2-3 single-word strings capturing the primary emotions expressed (e.g., "hopeful", "anxious", "fatigued").
2. "reflection": A warm, deeply supportive paragraph (3-4 sentences) validating their feelings, pointing out any underlying strength or self-compassion they showed, and offering a comforting perspective.
3. "gentlePrompt": A single, beautiful, open-ended question or mindfulness prompt they can contemplate today to gain clarity.

Format as JSON matching this structure:
{
  "emotionTags": ["emotion1", "emotion2"],
  "reflection": "your validating reflection text here",
  "gentlePrompt": "prompt question here"
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      try {
        const result = JSON.parse(response.text?.trim() || "{}");
        res.json(result);
      } catch (parseErr) {
        // Fallback if JSON parsing fails
        res.json({
          emotionTags: ["reflective"],
          reflection: "Thank you for sharing your thoughts with me. Writing is a powerful tool for self-understanding. Your feelings are completely valid.",
          gentlePrompt: "What is one small kindness you can offer yourself in this very moment?"
        });
      }
    } catch (err: any) {
      console.error("Gemini Journal Error:", err);
      res.status(500).json({
        error: err.message || "Could not analyze the journal entry."
      });
    }
  });

  // 4. Vite middleware configuration for development mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
