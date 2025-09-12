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

#### Option A : Utiliser le fichier PDF existant
Si vous avez un fichier `rag.pdf` :
```bash
node build_kb.js
```

#### Option B : Utiliser le fichier texte
Si vous voulez utiliser `kb_digitickets.txt` :
1. Renommez `kb_digitickets.txt` en `rag.pdf` (ou modifiez `build_kb.js`)
2. Exécutez : `node build_kb.js`

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

## 🔧 Fonctionnalités

### Réponses intelligentes
- **Salutations simples** : "salut", "bonjour", "hello" → Réponse directe
- **Questions techniques** : Utilise RAG pour répondre avec précision
- **Reconnaissance** : "ok", "merci", "d'accord" → Confirmation simple

### Interface web
- Interface de chat moderne et responsive
- Support des messages en temps réel
- Design sombre et professionnel

## 🛠️ Développement

### Modifier la base de connaissances
1. Éditez `kb_digitickets.txt`
2. Exécutez `node build_kb.js` pour régénérer les embeddings
3. Redémarrez le serveur

### Personnaliser les réponses
Modifiez les patterns de reconnaissance dans `api/index.js` :
```javascript
const greetingPatterns = [
  'salut', 'bonjour', 'hello', 'coucou', 'hey', 'hi'
];
```

## 🚀 Déploiement

### Vercel (recommandé)
1. Connectez votre repository GitHub à Vercel
2. Ajoutez la variable d'environnement `GEMINI_API_KEY`
3. Déployez automatiquement

### Autres plateformes
Le projet est compatible avec :
- Heroku
- Railway
- DigitalOcean App Platform
- Tout hébergeur Node.js

## 🐛 Dépannage

### Erreur "GEMINI_API_KEY env var is required"
- Vérifiez que votre fichier `.env` existe
- Vérifiez que la clé API est correcte
- Redémarrez le serveur

### Erreur "Precomputed files missing"
- Exécutez `node build_kb.js` d'abord
- Vérifiez que `kb_chunks.json` et `kb_vectors.json` existent

### Erreur 503 "Model is overloaded"
- L'API Google Gemini est temporairement surchargée
- Attendez quelques minutes et réessayez
- C'est normal, pas une erreur de votre code

## 📝 Exemples d'utilisation

### Questions courantes
- "Comment créer un ticket ?"
- "Quels sont les rôles dans DigiTickets ?"
- "Comment résoudre un ticket ?"
- "Où voir mes tickets ?"

### Salutations
- "Salut" → "Salut ! Je suis là pour t'aider avec DigiTickets. Que veux-tu faire ?"
- "Bonjour" → Même réponse
- "Hello" → Même réponse

## 🔒 Sécurité

- Ne commitez jamais votre fichier `.env`
- Gardez votre clé API Google Gemini privée
- Utilisez des variables d'environnement en production

## 📞 Support

Pour toute question ou problème :
1. Vérifiez ce README
2. Consultez les logs du serveur
3. Vérifiez la configuration de votre clé API

---

**Note** : Ce chatbot est conçu pour être intégré dans l'application DigiTickets. Il peut être utilisé de manière autonome pour des tests et du développement.
