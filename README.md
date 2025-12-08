# GameKit

An interactive **Game Discovery Platform** built with **React + TypeScript**, allowing users to browse, search, and discover games using the [RAWG Video Games Database API](https://rawg.io/apidocs).

<a href="https://gamekit-7h67h9ioc-paologhidonis-projects.vercel.app/" target="_blank">🚀 Live Demo: GameKit</a>

<img src="./public/gamekit.png" alt="GameKit Homepage Preview, dark theme"/>

<img src="./public/gamekit-2.png" alt="GameKit game detail page Preview, sunset theme"/>

<img src="./public/gamekit-3.png" alt="GameKit Homepage Preview, light theme"/>

## 🚀 Features

- 🎮 **Game Discovery** – Browse an extensive library of games from the RAWG API.
- 🔍 **Fuzzy Search** – Find games by name, search functionality to be expanded soon.
- ℹ️ **Detailed Game Information** – View game details including descriptions, ratings, screenshots, and trailers.
- 📱 **Responsive Design** – A seamless experience across desktop and mobile devices.
- 💅🏻 **Custom Themes** – Switch between light, dark and sunset modes.

## 🛠️ Tech Stack

- **Vite** – As the build tool for a faster and leaner development experience.
- **React + TypeScript** – For a strongly typed, component-based and scalable frontend.
- **RAWG API** – For sourcing comprehensive game data.
- **Tailwind CSS** – For utility-first styling and responsive layouts.
- **TanStack Query** For data fetching, caching and sync.
- **React Router** For client-side routing and navigation.
- **Lucide Icons** For sleek iconography.

### Deployment

- **GitHub Actions** – For continuous integration and deployment.
- **GitHub Pages** – For hosting the live application.

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

3.  Create a `.env` file in the root of the project and add your RAWG API key:

    ```
    VITE_RAWG_API_KEY=your_api_key_here
    ```

    ⚠️ Important: Make sure to add `.env` to your `.gitignore` file to prevent your key from being committed to the repository.

4.  Run the development server:
    ```bash
    npm run dev
    ```

## 🎯 Project Goals

- [x] Build a responsive and interactive interface for game discovery.
- [x] Integrate with the RAWG API to fetch and display game data.
- [x] Implement robust search and filtering functionalities.
- [x] Deploy the application to GitHub Pages using GitHub Actions.

## 🔥 Future Enhancements

- [ ] **User Authentication** – Allow users to create accounts to save favorite games and create personal lists.
- [ ] **Advanced Filtering Options** – Add more granular filtering, such as by genre, platform, release date, popularity, ratings, developers, or publishers.
- [ ] **Game Favourites** – Implement a feature for users to save games as favourites.
- [ ] **State Management Improvement** – Integrate a state management library like Zustand or Redux Toolkit for more complex state.
- [ ] **End-to-End Testing** – Add end-to-end tests using Playwright.

---

## 🚶🏻 Steps I followed to create this project

1. Initialise project with **React Typescript Template**:

   `npm create vite@latest gamekit --template react-ts`

2. Setup **React Router** in Data mode:

   `npm i react-router`

   [Docs](https://reactrouter.com/start/data/installation)

3. Setup **Tailwind**:

   `npm install tailwindcss @tailwindcss/vite`

   [Docs](https://tailwindcss.com/docs/installation/framework-guides/react-router)

4. Setup **TanStack Query**, formerly known as React Query:

   [Docs](https://tanstack.com/query/latest/docs/framework/react/overview)

5. Install **Lucide** for icons:

   `npm install lucide`

   [Docs](https://lucide.dev/guide/installation)
