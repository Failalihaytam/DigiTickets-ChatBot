const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdf = require('pdf-parse');

// Config
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY env var is required');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

const KB_PDF_PATH = 'rag.pdf';
const KB_CHUNKS_PATH = 'kb_chunks.json';
const KB_VECTORS_PATH = 'kb_vectors.json';

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 150;

// Helper functions
async function readPdfAsText(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const text = data.text || '';
  return text.replace(/\s+/g, ' ').trim();
}

function chunkText(text, maxChars = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let i = 0;
  
  while (i < text.length) {
    const j = Math.min(i + maxChars, text.length);
    chunks.push(text.substring(i, j));
    if (j === text.length) break;
    i = Math.max(0, j - overlap);
  }
  
  return chunks;
}

async function embedText(text) {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding error:', error);
    throw error;
  }
}

async function embedBatch(texts) {
  const vectors = [];
  
  for (let i = 0; i < texts.length; i++) {
    try {
      console.log(`Embedding chunk ${i + 1}/${texts.length}...`);
      const vector = await embedText(texts[i]);
      vectors.push(vector);
      
      // Small delay to avoid rate limits
      if (i < texts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Failed to embed chunk ${i + 1}:`, error);
      // Retry once
      await new Promise(resolve => setTimeout(resolve, 1000));
      const vector = await embedText(texts[i]);
      vectors.push(vector);
    }
  }
  
  return vectors;
}

async function main() {
  try {
    if (!fs.existsSync(KB_PDF_PATH)) {
      throw new Error(`Missing ${KB_PDF_PATH}`);
    }

    console.log('Reading PDF...');
    const kbText = await readPdfAsText(KB_PDF_PATH);
    const chunks = chunkText(kbText);
    
    if (chunks.length === 0) {
      throw new Error('PDF is empty or unreadable');
    }

    console.log(`Embedding ${chunks.length} chunks...`);
    const vectors = await embedBatch(chunks);

    console.log('Saving artifacts...');
    fs.writeFileSync(KB_CHUNKS_PATH, JSON.stringify(chunks, null, 2));
    fs.writeFileSync(KB_VECTORS_PATH, JSON.stringify(vectors, null, 2));
    
    console.log(`Done. Wrote ${KB_CHUNKS_PATH} and ${KB_VECTORS_PATH}`);
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
