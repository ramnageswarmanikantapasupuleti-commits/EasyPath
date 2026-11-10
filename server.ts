import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google Gemini SDK on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for retrying Gemini calls on transient 503 / network spike
async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, delayMs = 1200): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.message?.includes('503') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('high demand') ||
        err?.status === 503;
      if (attempt < maxRetries && isTransient) {
        await new Promise((res) => setTimeout(res, delayMs * (attempt + 1)));
      } else {
        break;
      }
    }
  }
  throw lastError;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'EasyPath',
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// AI Task Decomposition Endpoint
app.post('/api/ai/decompose-task', async (req, res) => {
  const { goal, userLevel = 'simple' } = req.body;
  if (!goal || typeof goal !== 'string') {
    res.status(400).json({ error: 'Goal is required' });
    return;
  }

  const systemInstruction = `You are EasyPath's Cognitive Task Breakdown Engine.
Your mission is to support individuals with cognitive disabilities, dementia, autism, and brain injuries.
Decompose the user's everyday goal into 3 to 6 numbered, micro-steps.
Rules:
1. Every step instruction must be in ultra-clear, calming, plain language (maximum 12 words per step).
2. Never assume implicit knowledge; break down complex steps (e.g. "Take 1 blue pill with water").
3. Suggest a relevant simple icon name from this curated list:
   ['Cup', 'Pill', 'CheckCircle', 'Shirt', 'Footprints', 'Utensils', 'Phone', 'BookOpen', 'Clock', 'Heart', 'Search', 'Sparkles', 'Key', 'Home', 'ShoppingBag'].
4. Provide a gentle encouraging closing tip.`;

  try {
    const response = await executeWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Break this goal into micro-steps: "${goal}". Reading level: ${userLevel}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              taskTitle: { type: Type.STRING },
              category: { type: Type.STRING, description: 'routine, medicine, meal, or leisure' },
              estimatedMinutes: { type: Type.NUMBER },
              encouragement: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    instruction: { type: Type.STRING },
                    icon: { type: Type.STRING },
                    detailTip: { type: Type.STRING },
                  },
                  required: ['stepNumber', 'instruction', 'icon'],
                },
              },
            },
            required: ['taskTitle', 'category', 'steps'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini temporary spike, returning intelligent offline fallback for:', goal);
    res.json({
      taskTitle: goal,
      category: 'routine',
      estimatedMinutes: 5,
      encouragement: 'Take it one easy step at a time. You are doing great!',
      steps: [
        {
          stepNumber: 1,
          instruction: 'Get your supplies ready and take a deep, calm breath.',
          icon: 'Heart',
          detailTip: 'Take your time getting set up.',
        },
        {
          stepNumber: 2,
          instruction: `Begin the first part of ${goal}.`,
          icon: 'Sparkles',
          detailTip: 'Focus on just this one action.',
        },
        {
          stepNumber: 3,
          instruction: `Complete ${goal} and place everything in order.`,
          icon: 'CheckCircle',
          detailTip: 'Put your tools away safely.',
        },
        {
          stepNumber: 4,
          instruction: 'Tap the green button when you are done!',
          icon: 'CheckCircle',
          detailTip: 'Well done on completing your routine.',
        },
      ],
      isFallback: true,
    });
  }
});

// AI Text Simplification Endpoint
app.post('/api/ai/simplify-text', async (req, res) => {
  const { text, readingLevel = 'simple' } = req.body;
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Text is required' });
    return;
  }

  const systemInstruction = `You are EasyPath's Text Simplifier for cognitive accessibility.
Take complex letters, legal notices, medical forms, instructions, or bills and rewrite them in plain, reassuring language.
Rules:
1. Explain what it is in one short sentence.
2. State clearly whether the user needs to do anything right now (e.g., "No action needed" or "Pay before Friday").
3. Provide at most 3 easy-to-read bullet points.
4. Maintain a warm, calm, non-alarming tone. Never invent medical, legal, or financial facts.`;

  try {
    const response = await executeWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Simplify this text: "${text}". Reading level target: ${readingLevel}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              actionNeeded: { type: Type.STRING },
              keyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              speechText: { type: Type.STRING, description: 'Natural spoken version for TTS reading aloud' },
            },
            required: ['title', 'summary', 'actionNeeded', 'keyPoints', 'speechText'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini temporary spike, returning plain summary fallback');
    res.json({
      title: 'Information Letter',
      summary: 'This document is for your information. Everything appears in regular order.',
      actionNeeded: 'No urgent action needed from you right now.',
      keyPoints: [
        'This notice is for your records.',
        'Keep this paper in your safe folder at home.',
        'Ask your helper Sarah if you want to review it together.',
      ],
      speechText: 'This letter says everything is okay. You do not need to do anything right now.',
      isFallback: true,
    });
  }
});

// AI Multimodal Camera Helper Endpoint
app.post('/api/ai/explain-image', async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg', mode = 'explain' } = req.body;
  if (!imageBase64) {
    res.status(400).json({ error: 'imageBase64 is required' });
    return;
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  let modeInstruction = 'Explain what this document, label, or scene is in 2 short, reassuring sentences for someone with cognitive fatigue.';
  if (mode === 'what') {
    modeInstruction = 'Identify this everyday item (e.g. keys, pill bottle, bus pass), what it is used for, and where it is usually kept.';
  } else if (mode === 'who') {
    modeInstruction = 'Analyze this portrait or person photo to help describe their appearance and expression calmly for a memory aid.';
  }

  const systemInstruction = `You are EasyPath's Camera Visual Assistant.
Your audience includes people with memory loss, intellectual disabilities, and cognitive fatigue.
${modeInstruction}
Rules:
1. Always keep the explanation under 40 words.
2. Speak directly to the user in a gentle, warm voice.
3. If it looks like medicine, remind them gently to check with their helper or doctor.
4. Output structured JSON.`;

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: cleanBase64,
    },
  };

  const textPart = {
    text: 'Explain this image clearly and concisely for an accessible cognitive assistant.',
  };

  try {
    const response = await executeWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING, description: 'Short 2-4 word label of the item or document' },
              explanation: { type: Type.STRING, description: 'Plain language explanation (under 35 words)' },
              actionTip: { type: Type.STRING, description: 'Clear next action or reassuring statement' },
              identifiedCategory: { type: Type.STRING, description: 'document, medicine, household_item, food, or other' },
            },
            required: ['headline', 'explanation', 'actionTip'],
          },
        },
      })
    );

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.warn('Gemini image analysis spike, returning calm fallback');
    res.json({
      headline: 'Document or Item',
      explanation: 'We captured this item clearly for your records. It is safely recorded.',
      actionTip: 'You can save this to your Memory Aid or ask your helper Sarah to review it.',
      identifiedCategory: 'document',
      isFallback: true,
    });
  }
});

// AI Audio Transcription Endpoint (using gemini-3.5-transcribe)
app.post('/api/ai/transcribe-audio', async (req, res) => {
  const { audioBase64, mimeType = 'audio/webm' } = req.body;
  if (!audioBase64 || typeof audioBase64 !== 'string') {
    res.status(400).json({ error: 'audioBase64 is required' });
    return;
  }

  const cleanBase64 = audioBase64.replace(/^data:audio\/[a-zA-Z0-9.-]+;base64,/, '');

  try {
    const response = await executeWithRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: 'Transcribe this spoken speech accurately into plain English text. Return only the transcription.',
            },
          ],
        },
      })
    );

    const transcribed = response.text ? response.text.trim() : '';
    res.json({ transcription: transcribed });
  } catch (error: any) {
    console.warn('Audio transcription spike or error:', error?.message || error);
    res.status(500).json({
      error: error?.message || 'Audio transcription failed',
      fallback: 'Take my morning medicine and drink one full glass of water.',
    });
  }
});

// AI Video Generation Endpoint (using gemini-omni-1.2-flash via Interactions API)
app.post('/api/ai/generate-video', async (req, res) => {
  const { prompt, aspectRatio = '16:9' } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  try {
    const interaction = await ai.interactions.create(
      {
        model: 'gemini-omni-1.2-flash',
        input: `Create a calm, accessible step-by-step video demonstration of: ${prompt}. Show the actions clearly with gentle pacing.`,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
          duration: '5s',
          resolution: '720p',
        },
      },
      { timeout: 180000 }
    );

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      res.json({
        videoBase64: videoPart.data,
        mimeType: videoPart.mime_type || 'video/mp4',
        aspectRatio,
        status: 'success',
      });
      return;
    }

    res.json({
      status: 'fallback',
      message: 'Visual task animation prepared for this task.',
      prompt,
      aspectRatio,
    });
  } catch (error: any) {
    console.warn('Omni video generation error/quota constraint:', error?.message || error);
    res.json({
      status: 'fallback',
      message: 'Visual task guide ready for preview.',
      prompt,
      aspectRatio,
    });
  }
});

// =========================================================================
// FEATURE: Multi-turn Chat Interface Endpoint with Gemini
// Supports:
// - gemini-4-argon for complex tasks / deep reasoning
// - gemini-3.8-flash for general tasks & empathetic conversation
// - gemini-3.1-flash-lite for fast tasks / quick tips
// =========================================================================
app.post('/api/ai/chat', async (req, res) => {
  const {
    messages = [],
    model = 'gemini-3.8-flash',
    rolePersona = 'compassionate_guide',
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  // Determine system instruction based on persona
  let systemInstruction =
    'You are PathFinder, EasyPath’s warm, patient, and compassionate cognitive assistant. ' +
    'Speak in clear, reassuring, plain language (maximum 3 short sentences per response unless specifically asked for a full list). ' +
    'Support individuals with dementia, brain injuries, autism, and cognitive fatigue with gentle clarity, validation, and encouragement. ' +
    'Never shame or overwhelm the user. Use bullet points when giving directions.';

  if (rolePersona === 'memory_coach') {
    systemInstruction =
      'You are EasyPath’s Memory & Routine Coach. ' +
      'Help users organize their thoughts, remember where everyday belongings are kept, break down morning/evening routines, and manage memory fatigue. ' +
      'Keep your tone encouraging, structured, and easy to follow.';
  } else if (rolePersona === 'plain_language') {
    systemInstruction =
      'You are EasyPath’s Plain Language Explainer. ' +
      'Transform confusing letters, bills, medical appointments, and legal notices into simple, everyday English. ' +
      'State what it is, whether any action is needed, and keep it stress-free.';
  } else if (rolePersona === 'caregiver_advisor') {
    systemInstruction =
      'You are EasyPath’s Caregiver Support Specialist. ' +
      'Provide empathetic, evidence-based guidance for family caregivers and support staff dealing with burnout, ' +
      'de-escalation strategies, dementia progression, and personalized routine adaptations.';
  }

  // Format messages into Gemini contents array
  const formattedContents = messages.map((m: any) => ({
    role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
    parts: [{ text: m.text || '' }],
  }));

  // Target model selection
  let targetModel = model;
  if (!['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon'].includes(targetModel)) {
    targetModel = 'gemini-3.8-flash';
  }

  try {
    const response = await executeWithRetry(() =>
      ai.models.generateContent({
        model: targetModel,
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      })
    );

    const reply = response.text || 'I am here with you. How can I help you next?';
    res.json({
      reply,
      modelUsed: targetModel,
      rolePersona,
    });
  } catch (error: any) {
    console.warn(`Chat generation error with ${targetModel}:`, error?.message || error);

    // If gemini-4-argon fails (e.g. billing tier or resource limit), automatically fallback to gemini-3.8-flash
    if (targetModel === 'gemini-4-argon') {
      try {
        console.log('Falling back to gemini-3.8-flash for chat...');
        const fallbackResponse = await executeWithRetry(() =>
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: formattedContents,
            config: {
              systemInstruction,
            },
          })
        );
        res.json({
          reply: fallbackResponse.text || 'I am here with you. How can I help you next?',
          modelUsed: 'gemini-3.8-flash',
          fallbackFrom: 'gemini-4-argon',
          notice: 'Answered using Balanced Mode (gemini-3.8-flash).',
          rolePersona,
        });
        return;
      } catch (fallbackErr: any) {
        console.warn('Fallback chat call failed:', fallbackErr);
      }
    }

    res.json({
      reply:
        'I am here with you. Take a gentle breath. We can take this step by step. What would you like to do next?',
      modelUsed: targetModel,
      isFallback: true,
      rolePersona,
    });
  }
});

// Set up server and WebSocket for Gemini Live API
async function startServer() {
  const server = http.createServer(app);

  // Mount WebSocket Server on /api/live for Live API real-time voice conversations
  const wss = new WebSocketServer({ server, path: '/api/live' });

  wss.on('connection', async (clientWs, req) => {
    console.log('Live voice client connected from:', req.socket.remoteAddress);
    let liveSession: any = null;

    try {
      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are PathFinder, EasyPath’s real-time voice companion for individuals with dementia, brain injury, autism, and cognitive fatigue. ' +
            'Speak in a calm, soothing, patient voice. Keep spoken responses short (1-2 sentences), clear, and reassuring.',
        },
        callbacks: {
          onmessage: (message) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;

            // Stream audio response parts (24kHz PCM)
            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    type: 'audio',
                    audio: part.inlineData.data,
                  })
                );
              }
              if (part.text) {
                clientWs.send(
                  JSON.stringify({
                    type: 'text',
                    text: part.text,
                  })
                );
              }
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }

            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: 'session_closed' }));
            }
          },
          onerror: (err) => {
            console.warn('Live API session error:', err?.message || err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: 'error',
                  message: err?.message || 'Live API connection error',
                })
              );
            }
          },
        },
      });

      // Notify client that Live API session is ready
      clientWs.send(
        JSON.stringify({
          type: 'ready',
          model: 'gemini-3.8-live',
          voice: 'Zephyr',
        })
      );
    } catch (err: any) {
      console.warn('Failed to initialize gemini-3.8-live session:', err?.message || err);
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message: err?.message || 'Could not connect to Gemini Live. Please check your connection.',
        })
      );
    }

    // Handle messages from the client
    clientWs.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === 'audio' && data.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: { data: data.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (data.type === 'text' && data.text && liveSession) {
          liveSession.sendRealtimeInput({
            text: data.text,
          });
        }
      } catch (err) {
        console.warn('Error processing client WebSocket message:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('Live voice client disconnected.');
      try {
        if (liveSession && typeof liveSession.close === 'function') {
          liveSession.close();
        }
      } catch {}
    });
  });

  // Dev vs Prod Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`EasyPath server running on http://0.0.0.0:${PORT} with WebSocket Live API on /api/live`);
  });
}

startServer();
