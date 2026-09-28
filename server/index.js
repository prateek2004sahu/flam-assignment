import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "50kb" }));

app.post("/api/generate", async (req, res) => {
  const { input } = req.body;
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "Please enter some notes or a topic." });
  }
  if (!key || key === "your_key_here") {
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY." });
  }

  const prompt = `Return ONLY valid JSON matching this shape, no prose, no markdown:
{ "cards": [{ "question": string, "answer": string }] }
Make 5 to 10 flashcards from the following notes or topic:
${input}`;

  // Give up if the AI takes more than 30 seconds
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      return res.status(502).json({ error: `AI provider error (${response.status}).` });
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    // Send the raw text back; the frontend validates it
    res.json({ raw });
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "The AI took too long. Please retry." });
    }
    res.status(500).json({ error: "Could not reach the AI provider." });
  } finally {
    clearTimeout(timer);
  }
});

// Serve the built React app (created by "npm run build") in production
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));