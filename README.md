# GameKit

A full-stack **Game Discovery Platform** featuring **AI-powered natural language search** built with **React + TypeScript, OpenAI GPT-4o-mini and Vercel serverless functions**. Discover games through conversational queries like "cozy RPG games on Game Boy" with intelligent validation and seamless integration with the [RAWG Video Games Database API](https://rawg.io/apidocs).

<a href="https://gamekit-six.vercel.app/" target="_blank">🚀 Live Demo: GameKit</a>

### Home Page

<img src="./public/gamekit.png" alt="GameKit Homepage Preview, dark theme"/>

### Game Detail Page

<img src="./public/ask-ai-1.png" alt="Ask Ai functionality"/>

### Ask Ai Modal

<img src="./public/ask-ai-2.png" alt="Ask Ai functionality modal"/>

### Ai Search Functionality

<img src="./public/ai-search.png" alt="GameKit Ai Search functionality"/>

### Game Detail Page - Alternative Theme

<img src="./public/gamekit-2.png" alt="GameKit game detail page Preview, sunset theme"/>

### Home Page - Alternative Theme

<img src="./public/gamekit-3.png" alt="GameKit Homepage Preview, light theme"/>

## 🚀 Features

### Core Features

- ✨ **Ask AI (Game Detail)** – Open a modal on any game detail page and ask questions specific to that game (story, mechanics, tips). Powered by OpenAI, with IP-based rate limiting and remaining-requests indicator on the UI.
- 🤖 **AI-Powered Natural Language Search** – Discover games through conversational queries like "cozy RPG games on Game Boy" using OpenAI GPT-4o-mini with intelligent validation and rate limiting.
- 🎮 **Game Discovery** – Browse an extensive library of games from the RAWG API.
- 🔍 **Traditional Search** – Fast, debounced search by game title with real-time results.
- ℹ️ **Detailed Game Information** – View game details including descriptions, ratings, screenshots and trailers.
- 🔐 **Authentication & User Settings** – Account creation and Login via Supabase to access your personal settings.
- 💾 **User Data Storage** – Preferences stored securely in Supabase.
- 📱 **Responsive Design** – A seamless experience across desktop and mobile devices.
- 💅🏻 **Custom Themes** – Switch between light, dark and sunset modes.

### 🤖 AI Features

GameKit includes two AI-powered experiences:

- **AI-Powered Search**: Turn natural language queries (e.g. "cozy RPG games on Game Boy") into validated results from RAWG.
- **Ask AI (Game Detail)**: Open a modal on a specific game and ask contextual questions (story, mechanics, tips).

**AI-Powered Search Architecture Highlights:**

- **LLM-First Design**: Uses OpenAI GPT-4o-mini to interpret natural language queries into structured search parameters
- **Hybrid Validation System**: AI suggestions validated against RAWG API using custom scoring algorithm:
  - AI confidence (40%) + Name similarity via Dice coefficient (40%) + Genre matching (20%)
  - Smart batching: Validates top 5 candidates first, early-stops if ≥3 pass (40% API call reduction)
- **Intelligent Fallback**: Automatically falls back to structured RAWG search if AI validation yields <3 results
- **Dynamic Platform/Genre Resolution**: Runtime caching system fetches and maps platform/genre IDs from RAWG, preventing hardcoded ID mismatches
- **Fuzzy Name Matching**: Custom normalizer strips edition suffixes ("HD", "Remastered") and calculates similarity scores with substring/year bonuses

**Ask AI (Game Detail) Architecture Highlights:**

- **Contextual Q&A**: The Game Detail page opens a modal where users ask questions scoped to the current game (name + question)
- **System-Level Priming**: The backend prompt is primed with a system message instructing the AI to act as a helpful game expert and only answer questions related to the provided game, reducing off-topic responses.
- **Serverless API Endpoint**: Uses `POST /api/ask-ai` so the `OPENAI_API_KEY` stays server-side
- **UI/UX**: Viewport-capped modal with scrollable content for long answers to avoid overflow

**Rate Limiting & Security:**

- **Distributed Rate Limiting**: Upstash Redis with fixed-window algorithm (6 requests/24h per IP)
- **Real-time UI Feedback**: Visual coin indicator shows remaining requests (used by both AI Search and Ask AI), persists across page refreshes
- **Graceful Degradation**: Handles obscure platforms (WonderSwan, Neo Geo Pocket) with user-friendly fallback messages

**Technical Implementation:**

- OpenAI Function Calling with strict JSON schema enforcement
- Controlled vocabulary (50+ platforms) prevents hallucination
- Temperature 0.2 for factual accuracy
- Serverless-first architecture with stateless Redis for rate limit persistence

## 🛠️ Tech Stack

### Backend:

- **Vercel Serverless Functions** - Scalable, stateless API endpoints
- **OpenAI SDK** (`openai`) - GPT-4o-mini integration for natural language processing
- **Upstash Redis** (`@upstash/redis`, `@upstash/ratelimit`) - Distributed rate limiting with sub-10ms latency
- **Supabase** (`@supabase/supabase-js`) - Authentication + PostgreSQL database
- **RAWG API** - Comprehensive game database
- **dotenv** - Environment variable management

### Frontend

- **Vite** – Lightning-fast build tool with HMR
- **React + TypeScript** – Type-safe, component-based architecture
- **TanStack Query** (`@tanstack/react-query`) - Server state management with intelligent caching
- **React Router** (`react-router`) - Client-side routing with data loaders
- **Tailwind CSS** – Utility-first styling with custom theme system
- **Lucide React** (`lucide-react`) - Consistent iconography

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

## 🎯 Key Technical Achievements

- ✅ **AI-Powered Natural Language Search** - LLM integration with validation pipeline
- ✅ **Ask AI Integration** - Context-aware game Q&A with shared rate limiting
- ✅ **Distributed Rate Limiting** - Redis-backed, IP-based request throttling
- ✅ **Hybrid Scoring Algorithm** - Multi-factor validation system for AI suggestions
- ✅ **Dynamic API Mapping** - Runtime platform/genre ID resolution with caching
- ✅ **Fuzzy String Matching** - Custom Dice coefficient implementation
- ✅ **Serverless Architecture** - Stateless functions with external state management
- ✅ **Type-Safe Full Stack** - End-to-end TypeScript with strict mode
- ✅ **Production Security** - Environment-based feature flags and secret management

## 🔥 Future Enhancements

- [x] **AI-Powered Search** – Natural language game discovery with LLM validation
- [x] **Ask AI (Game Detail)** – Context-aware chatbot for game-specific queries
- [x] **Rate Limiting** – Distributed request throttling with visual feedback
- [x] **User Authentication** – Supabase-based auth with protected routes
- [x] **Profile & Settings Pages** – Personalized user preferences
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
