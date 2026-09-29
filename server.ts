import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

import {
  getFallbackChatResponse,
  getFallbackPipeline,
  getFallbackDiagnosis,
  getFallbackQuiz,
} from './src/utils/fallbackGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with required headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Flag to track whether Gemini API is active or restricted (e.g. 403 permission denied)
let geminiAvailable = Boolean(process.env.GEMINI_API_KEY);

// System prompt for the Compiler Explanation Assistant
const COMPILER_SYSTEM_INSTRUCTION = `
You are the "Compiler Explanation Assistant" — an expert computer science professor and compiler engineer (like dragon book authors, LLVM/GCC maintainers, and rustc engineers combined).
Your mission is to make compiler design, compiler theory, language execution, and compiler diagnostics crystal clear, intuitive, and fascinating.

Key guidelines:
1. Explain with crystal clarity, whether the user is a university student learning compiler theory or a seasoned developer debugging tricky assembly/IR.
2. Structure your explanations cleanly using Markdown:
   - Use bold headers, bullet points, clean ASCII trees or formatted code blocks for ASTs and grammars.
   - When explaining code compilation, trace the exact phases: Lexing (tokens), Parsing (CST/AST), Semantic Analysis (symbol table, types), Intermediate Representation (IR / 3AC / SSA), Optimization (dead code, constant folding, inlining), and Code Generation (assembly).
3. If the user presents a compiler error (GCC, Clang, rustc, javac, etc.):
   - Explain what phase caught it.
   - Explain in human terms what the compiler expected vs what it found.
   - Provide the concrete fix with code diff.
4. Keep the tone engaging, helpful, rigorous, and supportive. Use analogies where helpful.
`;

// Helper to stream text smoothly over SSE
function streamFallbackText(res: Response, text: string) {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i += 4) {
    const chunk = words.slice(i, i + 4).join(' ') + ' ';
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

// 1. Streaming Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, depth = 'intermediate', contextCode = '' } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';

  if (!geminiAvailable) {
    const fallbackText = getFallbackChatResponse(lastUserMsg, depth, contextCode);
    return streamFallbackText(res, fallbackText);
  }

  try {
    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let systemInstruction = COMPILER_SYSTEM_INSTRUCTION;
    if (depth === 'beginner') {
      systemInstruction += '\nTarget depth: Beginner/Student. Use intuitive real-world analogies, explain jargon like "lexemes", "CFG", "lexing", and avoid overly dense mathematical formalism unless requested.';
    } else if (depth === 'advanced') {
      systemInstruction += '\nTarget depth: Advanced/Compiler Engineer. Discuss low-level nuances, register allocation (graph coloring / linear scan), SSA invariants, LLVM IR dialect, calling conventions, cache locality, and pipelining where relevant.';
    }

    if (contextCode) {
      systemInstruction += `\nCurrent active code snippet in workspace:\n\`\`\`\n${contextCode}\n\`\`\``;
    }

    const streamResponse = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    for await (const chunk of streamResponse) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    // If upstream returns 403 or permission denied, disable external calls for future requests
    if (error?.status === 403 || error?.code === 403 || String(error).includes('PERMISSION_DENIED')) {
      geminiAvailable = false;
    }

    const fallbackText = getFallbackChatResponse(lastUserMsg, depth, contextCode);
    return streamFallbackText(res, fallbackText);
  }
});

// 2. Comprehensive Pipeline Breakdown for arbitrary code
app.post('/api/pipeline', async (req: Request, res: Response) => {
  const { code, language = 'c', targetArch = 'x86-64' } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Source code is required' });
  }

  if (!geminiAvailable) {
    return res.json(getFallbackPipeline(code, language, targetArch));
  }

  const prompt = `Analyze this ${language} code snippet through all six canonical phases of a modern compiler targeting ${targetArch}:
Source Code:
\`\`\`${language}
${code}
\`\`\`

Provide an in-depth, precise, pedagogical JSON response strictly conforming to the requested schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an authority on compiler design. Always output valid JSON strictly adhering to schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            summary: { type: Type.STRING },
            lexicalAnalysis: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                tokens: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      lexeme: { type: Type.STRING },
                      type: { type: Type.STRING },
                      line: { type: Type.INTEGER },
                      description: { type: Type.STRING },
                    },
                    required: ['lexeme', 'type', 'line', 'description'],
                  },
                },
              },
              required: ['summary', 'tokens'],
            },
            syntaxAnalysis: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                asciiAst: { type: Type.STRING },
                astNodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      nodeType: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['nodeType', 'description'],
                  },
                },
              },
              required: ['summary', 'asciiAst', 'astNodes'],
            },
            semanticAnalysis: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                symbolTable: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      identifier: { type: Type.STRING },
                      dataType: { type: Type.STRING },
                      scope: { type: Type.STRING },
                      attributes: { type: Type.STRING },
                    },
                    required: ['identifier', 'dataType', 'scope', 'attributes'],
                  },
                },
                checks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['summary', 'symbolTable', 'checks'],
            },
            intermediateRepresentation: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                irFormat: { type: Type.STRING },
                irCode: { type: Type.STRING },
                explanation: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['summary', 'irFormat', 'irCode', 'explanation'],
            },
            optimization: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                passesApplied: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      passName: { type: Type.STRING },
                      before: { type: Type.STRING },
                      after: { type: Type.STRING },
                      benefit: { type: Type.STRING },
                    },
                    required: ['passName', 'before', 'after', 'benefit'],
                  },
                },
              },
              required: ['summary', 'passesApplied'],
            },
            codeGeneration: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                architecture: { type: Type.STRING },
                assemblyCode: { type: Type.STRING },
                registerUsage: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      register: { type: Type.STRING },
                      purpose: { type: Type.STRING },
                    },
                    required: ['register', 'purpose'],
                  },
                },
              },
              required: ['summary', 'architecture', 'assemblyCode', 'registerUsage'],
            },
          },
          required: [
            'language',
            'summary',
            'lexicalAnalysis',
            'syntaxAnalysis',
            'semanticAnalysis',
            'intermediateRepresentation',
            'optimization',
            'codeGeneration',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    if (error?.status === 403 || error?.code === 403 || String(error).includes('PERMISSION_DENIED')) {
      geminiAvailable = false;
    }
    return res.json(getFallbackPipeline(code, language, targetArch));
  }
});

// 3. Compiler Error Diagnosis
app.post('/api/diagnose', async (req: Request, res: Response) => {
  const { errorLog, codeSnippet = '', compiler = 'Auto-detect' } = req.body;

  if (!errorLog || typeof errorLog !== 'string') {
    return res.status(400).json({ error: 'Error log is required' });
  }

  if (!geminiAvailable) {
    return res.json(getFallbackDiagnosis(errorLog, codeSnippet, compiler));
  }

  const prompt = `Diagnose and explain this compiler error/diagnostic message:
Compiler / Tool: ${compiler}
Error Output:
\`\`\`
${errorLog}
\`\`\`
${codeSnippet ? `Source Code:\n\`\`\`\n${codeSnippet}\n\`\`\`` : ''}

Provide a deep, constructive diagnostic breakdown strictly in JSON according to the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a master compiler diagnostician. Make compiler errors transparent and easy to resolve.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            compilerPhase: { type: Type.STRING },
            severity: { type: Type.STRING },
            plainEnglishExplanation: { type: Type.STRING },
            whyCompilerComplained: { type: Type.STRING },
            culpritLocation: {
              type: Type.OBJECT,
              properties: {
                file: { type: Type.STRING },
                line: { type: Type.STRING },
                column: { type: Type.STRING },
                tokenOrSymbol: { type: Type.STRING },
              },
              required: ['file', 'line', 'column', 'tokenOrSymbol'],
            },
            suggestedFix: {
              type: Type.OBJECT,
              properties: {
                explanation: { type: Type.STRING },
                originalSnippet: { type: Type.STRING },
                fixedSnippet: { type: Type.STRING },
              },
              required: ['explanation', 'originalSnippet', 'fixedSnippet'],
            },
            pitfallsAndTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'title',
            'category',
            'compilerPhase',
            'severity',
            'plainEnglishExplanation',
            'whyCompilerComplained',
            'culpritLocation',
            'suggestedFix',
            'pitfallsAndTips',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    if (error?.status === 403 || error?.code === 403 || String(error).includes('PERMISSION_DENIED')) {
      geminiAvailable = false;
    }
    return res.json(getFallbackDiagnosis(errorLog, codeSnippet, compiler));
  }
});

// 4. Interactive Quiz / Concept Flashcards
app.post('/api/quiz', async (req: Request, res: Response) => {
  const { topic = 'General Compiler Theory', difficulty = 'Intermediate' } = req.body;

  if (!geminiAvailable) {
    return res.json({ questions: getFallbackQuiz(topic, difficulty) });
  }

  const prompt = `Generate 4 high-quality, practical multiple-choice compiler concept questions on "${topic}" with difficulty "${difficulty}".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  question: { type: Type.STRING },
                  codeExample: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  keyConcept: { type: Type.STRING },
                },
                required: ['id', 'topic', 'question', 'options', 'correctIndex', 'explanation', 'keyConcept'],
              },
            },
          },
          required: ['questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    if (error?.status === 403 || error?.code === 403 || String(error).includes('PERMISSION_DENIED')) {
      geminiAvailable = false;
    }
    return res.json({ questions: getFallbackQuiz(topic, difficulty) });
  }
});

// Setup Vite dev server or static files
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.log('Failed to start server:', err?.message || err);
});
