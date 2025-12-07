// This API route fetches the user's Spotify data

import cookie from 'cookie';

export default async function handler(req, res) {
  // Parse cookies from the request
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.spotify_token;

  // If no token, user isn't logged in
  if (!token) {
    return res.status(200).json({ topTracks: null });
  }

  try {
    // Fetch user's top tracks (medium_term = last 6 months)
    const tracksResponse = await fetch(
      'https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=medium_term',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Fetch user's top artists
    const artistsResponse = await fetch(
      'https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Check if requests succeeded
    if (!tracksResponse.ok || !artistsResponse.ok) {
      // Token might be expired
      return res.status(401).json({ error: 'Token expired or invalid' });
    }

    const tracksData = await tracksResponse.json();
    const artistsData = await artistsResponse.json();

    // Calculate genre distribution from top artists
    const genreCounts = {};
    artistsData.items.forEach(artist => {
      artist.genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    });

    // Sort genres by count and get top 10
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([genre, count]) => ({ genre, count }));

    // Get IDs of top tracks to fetch audio features
    const trackIds = tracksData.items.slice(0, 20).map(t => t.id).join(',');
    
    // Fetch audio features for top tracks
    const featuresResponse = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${trackIds}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const featuresData = await featuresResponse.json();

    // Calculate average audio features
    const avgFeatures = {
      energy: 0,
      danceability: 0,
      valence: 0, // Musical positiveness (happy vs sad)
    };

    if (featuresData.audio_features) {
      const validFeatures = featuresData.audio_features.filter(f => f !== null);
      const count = validFeatures.length;

      validFeatures.forEach(feature => {
        avgFeatures.energy += feature.energy;
        avgFeatures.danceability += feature.danceability;
        avgFeatures.valence += feature.valence;
      });

      avgFeatures.energy /= count;
      avgFeatures.danceability /= count;
      avgFeatures.valence /= count;
    }

    // Return all the data
    res.status(200).json({
      topTracks: tracksData.items,
      topArtists: artistsData.items,
      topGenres: topGenres,
      audioFeatures: avgFeatures,
    });
  } catch (error) {
    console.error('Spotify data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch Spotify data' });
  }
}