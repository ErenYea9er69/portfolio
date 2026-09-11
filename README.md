RAYEN BEN AISSA PORTFOLIO

OVERVIEW

I built this portfolio to present my projects, skills, and experience. The site runs on Next.js 15, React 19, TypeScript, and Tailwind CSS. It tracks visits through Neon PostgreSQL and pulls live data from external services.

LIVE DEMO

Website: https://erenyea9er-portfolio.vercel.app

FEATURE HIGHLIGHTS

1. Live Visitor Counter: Neon PostgreSQL records unique visits through an HTTP cookie.
2. Command Palette: Press Ctrl+K or Cmd+K to jump between sections and links.
3. Interactive CLI: The /cli route gives visitors a working terminal interface.
4. Social Hover Cards: Hovering on social links shows profile previews and account details.
5. GitHub Activity: The page renders my live GitHub contribution graph.

FEATURED PROJECTS

1. Game of Chance: Casino web app with probability mini-games and a PostgreSQL leaderboard.
2. MyNet: Windows network analyzer in C# and .NET 8 that discovers local devices and controls bandwidth.
3. ScopyAI: AI research tool that searches the web and produces PDF summaries.
4. anime-site (Tsune): Video streaming platform with Vidstack HLS playback and a Prisma backend.
5. 3D-portfolio-winxp: Windows XP desktop simulation with draggable windows and retro games.
6. AnyBook: Book summary app with structured chapter takeaways and clean search.

TECH STACK

Frontend: Next.js 15, React 19, TypeScript 5, Tailwind CSS, Framer Motion
Backend and Database: Node.js, Neon PostgreSQL, Prisma, SQL
Infrastructure: Vercel, Docker

ENVIRONMENT VARIABLES

Create a file named .env.local in the project root. Add these variables:

DATABASE_URL=your_neon_postgresql_url
GITHUB_TOKEN=your_github_personal_access_token

NEON DATABASE SETUP

1. Create a serverless PostgreSQL database at neon.tech.
2. Copy your connection string from the Neon console.
3. Save the connection string into DATABASE_URL in .env.local.
4. The application creates the site_stats table on first launch.

GITHUB TOKEN SETUP

1. Open GitHub Developer Settings and create a personal access token.
2. Select the read:user scope.
3. Generate the token.
4. Copy the token into GITHUB_TOKEN in .env.local.

LOCAL SETUP

1. Clone the repository:
git clone https://github.com/ErenYea9er69/portfolio.git

2. Open the project folder:
cd portfolio

3. Install project dependencies:
npm install

4. Run the development server:
npm run dev

5. Open http://localhost:3000 in your browser.

PRODUCTION COMMANDS

Build the application:
npm run build

Start the production server:
npm start

Run the linter:
npm run lint

Check TypeScript types:
npx tsc --noEmit

PROJECT STRUCTURE

src/app: Next.js routes, layouts, and API handlers
src/components: UI elements, cards, and modal components
src/data: Resume details, project lists, and social metadata
src/lib: Shared utility functions
public: Static assets and screenshots

CONTACT

Name: Rayen Ben Aissa
GitHub: https://github.com/ErenYea9er69
X: https://x.com/ErenYea9er
Location: Tunisia

LICENSE

This project uses the MIT License.