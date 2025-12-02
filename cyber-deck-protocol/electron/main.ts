import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";

const isDev = !!process.env.VITE_DEV_SERVER_URL;
const dist = path.join(__dirname, "../dist");
const preload = path.join(__dirname, "../dist-electron/preload.js");

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1500, height: 960,
    backgroundColor: "#050a0f",
    show: false,
    webPreferences: { preload, contextIsolation: true, nodeIntegration: false }
  });
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
      win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
      win.loadFile(path.join(dist, "index.html"));
  }
  win.once("ready-to-show", () => win?.show());
  if (isDev) win.webContents.openDevTools({ mode: "detach" });
}

app.whenReady().then(createWindow);

ipcMain.handle("protocol:read", async () => {
  const candidates = [
    path.join(process.cwd(), "GEMINI.md"),
    path.join(__dirname, "../../GEMINI.md")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return await fs.promises.readFile(p, "utf-8");
  }
  return "# PROTOCOL NOT FOUND";
});

ipcMain.handle("protocol:save", async (_, content) => {
  await fs.promises.writeFile(path.join(process.cwd(), "GEMINI.md"), content);
  return true;
});

// AI Integration Helpers

async function callOpenAI(messages: any[], apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7
    })
  });
  if (!response.ok) {
     const errorText = await response.text();
     throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGrok(messages: any[], apiKey: string) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "grok-beta",
      messages: messages,
      stream: false,
      temperature: 0.7
    })
  });
   if (!response.ok) {
     const errorText = await response.text();
     throw new Error(`Grok API Error: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(messages: any[], apiKey: string) {
  let systemPrompt = "";
  const anthropicMessages = messages.filter((m: any) => {
    if (m.role === 'system') {
      systemPrompt += m.content + "\n";
      return false;
    }
    return true;
  });

  const body: any = {
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4096,
    messages: anthropicMessages
  };

  if (systemPrompt.trim()) {
    body.system = systemPrompt.trim();
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(body)
  });
   if (!response.ok) {
     const errorText = await response.text();
     throw new Error(`Claude API Error: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.content[0].text;
}

ipcMain.handle("ai:ask", async (_, { provider, messages }) => {
    try {
        if (provider === 'openai') {
            const key = process.env.OPENAI_API_KEY;
            if (!key) throw new Error("Missing OPENAI_API_KEY");
            return await callOpenAI(messages, key);
        } else if (provider === 'grok') {
            const key = process.env.GROK_API_KEY;
            if (!key) throw new Error("Missing GROK_API_KEY");
            return await callGrok(messages, key);
        } else if (provider === 'claude') {
             const key = process.env.ANTHROPIC_API_KEY;
             if (!key) throw new Error("Missing ANTHROPIC_API_KEY");
             return await callClaude(messages, key);
        }
        throw new Error(`Unknown provider: ${provider}`);
    } catch (error: any) {
        console.error("AI Error:", error);
        return `Error: ${error.message}`;
    }
});
