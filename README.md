# DigiTickets ChatBot

Un chatbot RAG (Retrieval-Augmented Generation) pour aider les utilisateurs avec l'application DigiTickets.

## 🚀 Installation et Configuration

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn
- Clé API Google Gemini

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de l'API

Créez un fichier `.env` à la racine du projet :

```bash
GEMINI_API_KEY=votre_cle_api_google_gemini_ici
```

**Comment obtenir une clé API Google Gemini :**
1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Créez une nouvelle clé API
4. Copiez la clé dans votre fichier `.env`

### 3. Préparation de la base de connaissances

```bash
node build_kb.js
```

### 4. Lancement du serveur

```bash
node api/index.js
```

Le serveur démarrera sur `http://localhost:3000`

## 📁 Structure du projet

```
DigiTickets-ChatBot/
├── api/
│   └── index.js          # Serveur Express et logique du chatbot
├── build_kb.js           # Script pour construire la base de connaissances
├── kb_digitickets.txt    # Base de connaissances en texte
├── kb_chunks.json        # Chunks de texte générés (auto-généré)
├── kb_vectors.json       # Vecteurs d'embedding (auto-généré)
├── rag.pdf              # PDF source pour la base de connaissances
├── package.json         # Dépendances Node.js
├── vercel.json          # Configuration Vercel
└── README.md            # Ce fichier
```