# DigiTickets ChatBot

Un chatbot RAG (Retrieval-Augmented Generation) pour aider les utilisateurs avec l'application DigiTickets.

## 🚀 Installation et Configuration

### Prérequis
- Node.js (version 14 ou supérieure)
- npm ou yarn
- Clé API OpenRouter

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de l'API

Créez un fichier `.env` à la racine du projet :

```bash
OPENROUTER_API_KEY=votre_cle_api_openrouter_ici
```

**Comment obtenir une clé API OpenRouter :**
1. Allez sur [OpenRouter](https://openrouter.ai/)
2. Créez un compte et connectez-vous
3. Allez dans votre tableau de bord (Dashboard)
4. Cliquez sur "Keys" dans le menu
5. Créez une nouvelle clé API
6. Copiez la clé dans votre fichier `.env`

**Note :** Ce chatbot utilise OpenRouter avec DeepSeek V3.1 comme modèle principal (gratuit). DeepSeek V3.1 est un modèle de génération de texte performant et économique pour la génération de réponses et text-embedding-3-small pour les embeddings.

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