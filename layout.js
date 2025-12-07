import './globals.css';

// Metadata for your app (shows in browser tab and social media previews)
export const metadata = {
  title: 'WrappedOnDemand - Your Spotify Stats Anytime',
  description: 'View your Spotify listening stats on demand. See your top songs, artists, and genres.',
  icons: {
    icon: '/favicon.ico', // You'll add this file later
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}