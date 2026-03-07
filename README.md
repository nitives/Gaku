# Gaku

**Gaku** is a modern SoundCloud client built with Next.js, TypeScript, and Tailwind CSS, providing an immersive and streamlined experience for discovering and listening to music.

## Features

- 🎵 **SoundCloud Integration**: Stream albums, artists, and playlists directly from SoundCloud and also view your liked tracks.
- 🔍 **Search**: Find tracks, albums, and artists with real-time query suggestions.
- ❤️ **Library Management**: Save and organize your favorite songs, albums, and artists.
- 🎶 **Animated Lyrics**: Display synchronized lyrics with support for both rich sync and line sync.
- 📺 **Animated Cover Support**: Animated video covers for an enhanced visual experience.
- 🔄 **User Preferences**: Customize theme colors, sidebar icons, and other UI settings.
- 🔐 **Authentication**: Sign in with Clerk authentication for a personalized experience.

## Tech Stack

- **Framework**: Next.js (App Router)
- **UI Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Authentication**: Clerk
- **Database**: LocalStorage (for user settings) and Clerk for syncing user data
- **Streaming**: HLS & React Player
- **Lyrics Integration**: Musixmatch and Apple Music API for lyrics fetching

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Environment variables for Clerk, Prisma, and SoundCloud API keys

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/nitives/Gaku.git
   cd gaku
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

   _or_

   ```sh
   yarn install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file and add the necessary API keys.

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
   DATABASE_URL=your-database-url
   SOUNDCLOUD_CLIENT_ID=your-soundcloud-client-id
   ```

4. **Run the development server:**

   ```sh
   npm run dev
   ```

   _or_

   ```sh
   yarn dev
   ```

   The app should now be running at `http://localhost:3000`.

## Deployment

Gaku is optimized for deployment on **Vercel**.

1. **Push your repository to GitHub.**
2. **Connect the repository to Vercel.**
3. **Set environment variables on Vercel.**
4. **Deploy and enjoy!**

## Contributing

Contributions are welcome! Please fork the repo and submit a pull request with your changes.

## License

MIT License © 2025 nite
