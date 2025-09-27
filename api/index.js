const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Config
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY env var is required');
}

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// OpenRouter client configuration
const openRouterHeaders = {
  'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'http://localhost:3000', // Required for OpenRouter
  'X-Title': 'DigiTickets ChatBot' // Optional but recommended
};

const KB_CHUNKS_PATH = path.join(__dirname, '..', 'kb_chunks.json');
const KB_VECTORS_PATH = path.join(__dirname, '..', 'kb_vectors.json');
const TOP_K = 5;

// Load precomputed data
let chunks = [];
let vectors = [];

try {
  if (fs.existsSync(KB_CHUNKS_PATH) && fs.existsSync(KB_VECTORS_PATH)) {
    chunks = JSON.parse(fs.readFileSync(KB_CHUNKS_PATH, 'utf8'));
    vectors = JSON.parse(fs.readFileSync(KB_VECTORS_PATH, 'utf8'));
    console.log(`Loaded ${chunks.length} chunks and ${vectors.length} vectors`);
  } else {
    throw new Error('Precomputed files missing. Run build script first.');
  }
} catch (error) {
  console.error('Error loading precomputed data:', error);
  throw error;
}

// Helper functions
function normalizeVector(vec) {
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return vec.map(val => val / magnitude);
}

function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  return dotProduct;
}

async function embedText(text) {
  try {
    // Using OpenAI's embedding model via OpenRouter
    const response = await axios.post(`${OPENROUTER_BASE_URL}/embeddings`, {
      model: 'text-embedding-3-small',
      input: text
    }, {
      headers: openRouterHeaders
    });

    if (response.data && response.data.data && response.data.data[0]) {
      return response.data.data[0].embedding;
    }
    throw new Error('Invalid embedding response');
  } catch (error) {
    console.error('Embedding error:', error.response?.data || error.message);
    throw error;
  }
}

async function generateText(prompt) {
  try {
    const response = await axios.post(`${OPENROUTER_BASE_URL}/chat/completions`, {
      model: 'deepseek/deepseek-chat-v3.1:free',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant utile qui aide avec l\'application DigiTickets. Réponds en français.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: openRouterHeaders
    });

    if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
      return response.data.choices[0].message.content.trim();
    }
    throw new Error('Invalid generation response');
  } catch (error) {
    console.error('Generation error:', error.response?.data || error.message);
    throw error;
  }
}

function topK(query, k = TOP_K) {
  // For now, return random chunks (you'll need to implement proper embedding search)
  const results = [];
  for (let i = 0; i < Math.min(k, chunks.length); i++) {
    results.push({
      text: chunks[i],
      score: Math.random() // Placeholder - implement proper similarity
    });
  }
  return results;
}

async function answerWithRAG(question) {
  const hits = topK(question, TOP_K);
  const contextBlocks = hits.map((hit, i) => 
    `[Extrait ${i + 1}] (score=${hit.score.toFixed(3)})\n${hit.text}`
  ).join('\n\n---\n\n');

  const prompt = `
Question utilisateur:
${question}

Contexte pertinent:
${contextBlocks}

Consignes:
- Réponds directement et clairement à la question.
- Si une étape est nécessaire dans l'app, explique-la pas à pas.
- Ne mentionne pas les sources ou la documentation.
- Sois concis et utile.
- Si l'info n'est pas dans le contexte, dis-le simplement.
`;

  try {
    const text = await generateText(prompt);
    
    return {
      answer: text,
      sources: []
    };
  } catch (error) {
    console.error('Generation error:', error);
    return {
      answer: 'Désolé, une erreur est survenue.',
      sources: []
    };
  }
}

// Routes
app.get('/', (req, res) => {
  res.send(`
<!doctype html><html lang="fr"><meta charset="utf-8">
<title>DigiTickets – Chat RAG</title>
<style>
body{font-family:system-ui,Arial,sans-serif;background:#0f172a;color:#e2e8f0;margin:0}
.wrap{max-width:820px;margin:0 auto;padding:24px}
h1{font-size:20px;margin:0 0 12px}
.chat{height:65vh;overflow:auto;background:#0b1020;padding:12px;border:1px solid #1f2937;border-radius:12px}
.row{display:flex;margin:10px 0}
.row.user{justify-content:flex-end}
.bubble{max-width:70%;padding:10px 14px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}
.user .bubble{background:#22c55e;color:#0b1020;border-bottom-right-radius:4px}
.bot .bubble{background:#111827;border:1px solid #1f2937;color:#e5e7eb;border-bottom-left-radius:4px}
.src{font-size:12px;opacity:.8;margin-top:4px}
.input{display:flex;gap:8px;margin-top:12px}
input,button{font-size:16px;padding:10px 12px;border-radius:10px;border:1px solid #1f2937;background:#0b1020;color:#e5e7eb}
button{cursor:pointer}
</style>
<div class="wrap">
  <h1>Assistant DigiTickets (RAG)</h1>
  <div id="chat" class="chat"></div>
  <div class="input">
    <input id="msg" placeholder="Posez une question…" autofocus />
    <button id="send">Envoyer</button>
  </div>
</div>
<script>
const chat = document.getElementById('chat');
const msg  = document.getElementById('msg');
const send = document.getElementById('send');

function addBubble(text, who){
  const row = document.createElement('div');
  row.className = 'row '+who;
  const b = document.createElement('div');
  b.className = 'bubble';
  b.textContent = text;
  row.appendChild(b);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
  return row;
}

async function ask(){
  const q = msg.value.trim();
  if(!q) return;
  addBubble(q, 'user');
  msg.value = '';
  const typing = addBubble('…', 'bot');

  let res = await fetch('/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ message:q })
  }).then(r=>r.json()).catch(e=>({answer:'[Erreur réseau] '+e, sources:[]}));

  typing.remove();
  addBubble(res.answer || '—', 'bot');
}

send.onclick = ask;
msg.addEventListener('keydown', e=>{ if(e.key==='Enter') ask(); });
</script>
</html>
  `);
});

app.post('/chat', async (req, res) => {
  const question = (req.body.message || '').trim();
  
  if (!question) {
    return res.json({ answer: 'Écris-moi une question 🙂', sources: [] });
  }

  // Simple greetings and acknowledgments
  const qlower = question.toLowerCase().trim();
  
  // Greeting patterns
  const greetingPatterns = [
    'salut', 'bonjour', 'hello', 'coucou', 'hey', 'hi'
  ];
  
  // Acknowledgment patterns
  const ackPatterns = [
    'ok', 'okay', 'd\'accord', 'dac', 'dacc', 'c\'est bon', 'cest bon',
    'merci', 'parfait', 'super', 'top', 'ça marche', 'ca marche'
  ];
  
  // Handle simple greetings
  if (greetingPatterns.some(p => qlower === p || qlower.startsWith(p + ' ') || qlower.endsWith(' ' + p))) {
    return res.json({ 
      answer: 'Salut ! Je suis là pour t\'aider avec DigiTickets. Que veux-tu faire ?', 
      sources: [] 
    });
  }
  
  // Handle acknowledgments
  if (ackPatterns.some(p => qlower.includes(p)) && qlower.length <= 40) {
    return res.json({ 
      answer: '👍 C\'est noté. Dites-moi si vous voulez faire une action (créer un ticket, le résoudre, voir vos tickets, etc.).', 
      sources: [] 
    });
  }

  try {
    const result = await answerWithRAG(question);
    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.json({ 
      answer: 'Désolé, une erreur est survenue.', 
      sources: [] 
    });
  }
});

// For local testing
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
