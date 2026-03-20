# GameKit

A full-stack **Game Discovery Platform** featuring an **AI chatbot** for each game's detail page and **AI-powered natural language search**, built with React + TypeScript, OpenAI GPT-4o-mini and Vercel serverless functions. Seamless integration with the [RAWG Video Games Database API](https://rawg.io/apidocs).

<a href="https://gamekit-six.vercel.app/" target="_blank">🚀 Live Demo: GameKit</a>

### Ask AI Chatbot (history + follow-ups)

<img src="./public/ask-ai-2.png" alt="Ask AI modal with chat history and composer"/>

### Home Page

<img src="./public/gamekit.png" alt="GameKit Homepage Preview, dark theme"/>

### Game Detail Page

<img src="./public/ask-ai-1.png" alt="Game detail page Preview"/>

### AI Search

<img src="./public/ai-search.png" alt="GameKit AI Search"/>

### Game Detail Page - Alternative Theme

<img src="./public/gamekit-2.png" alt="GameKit game detail page Preview, sunset theme"/>

### Home Page - Alternative Theme

<img src="./public/gamekit-3.png" alt="GameKit Homepage Preview, light theme"/>

## 🚀 Features

- ✨ **Ask AI Chatbot** – Multi-turn game Q&A modal with session history, follow-ups and a ChatGPT-style composer. Powered by OpenAI Responses API with chained turns.
- 🤖 **AI-Powered Search** – Natural-language queries like "cozy RPG games on Game Boy" interpreted by GPT-4o-mini, validated against RAWG with a custom hybrid scoring algorithm.
- 🎮 **Game Discovery** – Browse an extensive library of games from the RAWG API.
- 🔍 **Traditional Search** – Fast, debounced search by game title with real-time results.
- ℹ️ **Game Details** – Descriptions, ratings, screenshots and trailers for every game.
- 🔐 **Auth & Settings** – Supabase-based account creation, login and personal preferences.
- 📱 **Responsive Design** – Mobile-first layout across all pages.
- 💅🏻 **Custom Themes** – Light, dark and sunset modes.
- 💰 **Rate Limiting** – Upstash Redis (6 req/24h per IP); visual coin indicator shows remaining requests.

### Ask AI Chatbot Architecture

- **Chat UI & session history**: Message thread in a modal with scrollable area above a fixed composer; auto-scroll to latest message; accessible live region for new content.
- **Multi-turn context**: OpenAI **Responses API** with `store: true` and `previous_response_id`. Follow-ups stay in one conversation without the client storing full transcripts server-side.
- **Token-efficient prompting**: System instructions sent only on the first turn; continuations send the user message alone and rely on the stored chain.
- **Game-scoped behavior**: System prompt ties answers to the current game (similar-game recommendations, story, mechanics, tips) with clear refusal for off-topic non-gaming asks.
- **Strict wire contracts**: Zod schemas validate request bodies server-side and parse responses client-side with `safeParse`. Malformed data falls back to a safe message.
- **Serverless API**: `POST /api/ask-ai` keeps `OPENAI_API_KEY` server-side; rate limiting runs before the model call.

### AI-Powered Search Architecture

- **LLM-First Design**: GPT-4o-mini interprets natural language into structured search parameters via Function Calling with strict JSON schema enforcement.
- **Hybrid Validation**: AI suggestions scored against RAWG. AI confidence (40%) + Dice-coefficient name similarity (40%) + genre match (20%). Smart batching validates top 5 first, early-stops if ≥3 pass (40% fewer API calls).
- **Intelligent Fallback**: Falls back to structured RAWG search when AI validation yields <3 results.
- **Dynamic Platform/Genre Resolution**: Runtime caching maps platform/genre IDs from RAWG, preventing hardcoded mismatches.
- **Fuzzy Name Matching**: Custom normalizer strips edition suffixes ("HD", "Remastered") and calculates similarity with substring/year bonuses.
- **Controlled Vocabulary**: 50+ platforms prevents hallucination; graceful degradation for obscure platforms (WonderSwan, Neo Geo Pocket).

## 🛠️ Tech Stack

### Backend

- **Vercel Serverless Functions** – Scalable, stateless API endpoints
- **OpenAI SDK** (`openai`) – GPT-4o-mini integration for natural language processing
- **Upstash Redis** (`@upstash/redis`, `@upstash/ratelimit`) – Distributed rate limiting
- **Supabase** (`@supabase/supabase-js`) – Authentication + PostgreSQL database
- **RAWG API** – Comprehensive game database

### Shared

- **Zod** – Shared schemas in `src/schemas/` for inferred types and runtime validation on both serverless routes and the client

### Frontend

- **Vite** – Lightning-fast build tool with HMR
- **React + TypeScript** – Type-safe, component-based architecture
- **TanStack Query** (`@tanstack/react-query`) – Server state management with intelligent caching
- **React Router** (`react-router`) – Client-side routing with data loaders
- **Tailwind CSS** – Utility-first styling with custom theme system
- **Lucide React** (`lucide-react`) – Consistent iconography

### Deployment

The GitHub repository is connected to the Vercel project, which is deployed every time a push to `main` occurs.

## 📦 Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/paologhidoni/gamekit.git
    ```

2.  Navigate into the project directory and install dependencies:

    ```bash
    cd gamekit
    npm install
    ```

3.  Set up environment variables:

    The project uses **two separate `.env` files**:
    - **Frontend (`.env`)** – for Vite variables used in the client-side code:

      ```
      VITE_SUPABASE_URL=your_supabase_url_here
      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
      ```

    - **Backend (`.env.backend`)** – for server-side secrets used by Vercel serverless functions:

      ```
      SUPABASE_URL=your_supabase_url_here
      SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
      RAWG_API_KEY=your_rawg_api_key_here
      OPENAI_API_KEY=your_openai_api_key_here
      UPSTASH_REDIS_REST_URL=your_upstash_redis_url_here
      UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token_here
      ```

    See `.env.backend.example` for a complete template.

    ⚠️ Important: Make sure both `.env` and `.env.backend` are added to `.gitignore` to prevent secrets from being committed.

4.  Run the development server (both frontend and backend):

    ```bash
    npm run local
    ```

## 🔥 Future Enhancements

- [ ] **Persist Ask AI history** – Save or restore chat across modal close / page reload (today history is per open session only)
- [ ] **Game Favourites** – Persistent user collections with Supabase storage
- [ ] **Advanced Filtering** – Multi-criteria filtering (genre, platform, year, rating)
- [ ] **Recommendation Engine** – Collaborative filtering based on user preferences
- [ ] **End-to-End Testing** – Playwright test suite with CI/CD integration

---

## 🚶🏻 Development Journey

### Frontend Foundation

1. **Initialize Vite + React + TypeScript**

   ```bash
   npm create vite@latest gamekit --template react-ts
   ```

2. **Setup React Router** (Data mode)

   ```bash
   npm i react-router
   ```

   [Docs](https://reactrouter.com/start/data/installation)

3. **Configure Tailwind CSS**

   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

   [Docs](https://tailwindcss.com/docs/installation/framework-guides/react-router)

4. **Add TanStack Query** for server state management

   ```bash
   npm i @tanstack/react-query
   ```

   [Docs](https://tanstack.com/query/latest/docs/framework/react/overview)

5. **Install Lucide React** for icons
   ```bash
   npm install lucide-react
   ```
   [Docs](https://lucide.dev/guide/installation)

### Backend & AI Integration

6. **Setup Supabase** for authentication and database

   ```bash
   npm install @supabase/supabase-js
   ```

7. **Integrate OpenAI SDK** for natural language processing

   ```bash
   npm install openai
   ```

8. **Add Upstash Redis** for distributed rate limiting

   ```bash
   npm install @upstash/redis @upstash/ratelimit
   ```

9. **Configure Vercel Serverless Functions** for backend API endpoints

10. **Add Zod** for type safety and runtime validation
    ```bash
    npm install zod
    ```
