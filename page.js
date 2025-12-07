'use client'; // This tells Next.js this component uses browser features (useState, fetch)

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HomePage() {
  // State variables (think of these as containers that hold data)
  const [loading, setLoading] = useState(true); // Is data being loaded?
  const [error, setError] = useState(null); // Any error messages?
  const [spotifyData, setSpotifyData] = useState(null); // The user's Spotify stats

  // useEffect runs when the page first loads
  useEffect(() => {
    // Try to fetch the user's data
    fetchSpotifyData();
  }, []); // Empty array means "only run once when page loads"

  // Function to fetch data from our API
  async function fetchSpotifyData() {
    try {
      setLoading(true);
      setError(null);

      // Call our API endpoint (we'll create this file next)
      const response = await fetch('/api/spotify/data');
      const data = await response.json();

      // If there's an error in the response
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      // If user isn't logged in, data will be null
      if (!data.topTracks) {
        setSpotifyData(null);
      } else {
        setSpotifyData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Done loading, whether success or failure
    }
  }

  // Function to handle logout
  function handleLogout() {
    // Delete the cookie by setting it to expire in the past
    document.cookie = 'spotify_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Refresh the page
    window.location.reload();
  }

  // Show loading message while fetching data
  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>WrappedOnDemand</h1>
          <p>Loading your stats...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, show login button
  if (!spotifyData) {
    return (
      <div className="container">
        <div className="header">
          <h1>WrappedOnDemand</h1>
          <p>View your Spotify listening stats anytime</p>
          <div style={{ marginTop: '30px' }}>
            <a href="/api/auth/login" className="login-button">
              Log in with Spotify
            </a>
          </div>
          {error && (
            <div className="error" style={{ marginTop: '20px' }}>
              Error: {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // User is logged in - show their stats!
  return (
    <div className="container">
      <div className="header">
        <h1>Your Wrapped Stats</h1>
        <p>Here's what you've been listening to</p>
        <button onClick={handleLogout} className="logout-button">
          Log out
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats-grid">
        {/* Top Tracks */}
        <div className="stat-card">
          <h2>Top Tracks</h2>
          <ul className="item-list">
            {spotifyData.topTracks.slice(0, 10).map((track, index) => (
              <li key={track.id}>
                <span className="item-rank">#{index + 1}</span>
                <div>
                  <div className="item-name">{track.name}</div>
                  <div className="item-artist">{track.artists[0].name}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Artists */}
        <div className="stat-card">
          <h2>Top Artists</h2>
          <ul className="item-list">
            {spotifyData.topArtists.slice(0, 10).map((artist, index) => (
              <li key={artist.id}>
                <span className="item-rank">#{index + 1}</span>
                <div>
                  <div className="item-name">{artist.name}</div>
                  <div className="item-artist">
                    {artist.genres.slice(0, 2).join(', ')}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Genres Chart */}
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <h2>Top Genres</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spotifyData.topGenres}>
              <XAxis dataKey="genre" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#1DB954" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Audio Features */}
        <div className="stat-card">
          <h2>Your Music Personality</h2>
          <ul className="item-list">
            <li>
              <div>
                <div className="item-name">Energy</div>
                <div className="item-artist">
                  {Math.round(spotifyData.audioFeatures.energy * 100)}% - 
                  {spotifyData.audioFeatures.energy > 0.6 ? ' High energy tracks' : ' Chill vibes'}
                </div>
              </div>
            </li>
            <li>
              <div>
                <div className="item-name">Danceability</div>
                <div className="item-artist">
                  {Math.round(spotifyData.audioFeatures.danceability * 100)}% - 
                  {spotifyData.audioFeatures.danceability > 0.6 ? ' Dance-worthy' : ' More relaxed'}
                </div>
              </div>
            </li>
            <li>
              <div>
                <div className="item-name">Valence</div>
                <div className="item-artist">
                  {Math.round(spotifyData.audioFeatures.valence * 100)}% - 
                  {spotifyData.audioFeatures.valence > 0.6 ? ' Positive mood' : ' Reflective mood'}
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}