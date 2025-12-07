// This API route redirects users to Spotify's login page

export default function handler(req, res) {
  // What permissions (scopes) we're asking for from Spotify
  const scopes = [
    'user-top-read',      // Read user's top artists and tracks
    'user-read-recently-played', // Read recently played tracks
  ];

  // Build the URL to Spotify's authorization page
  const spotifyAuthUrl = new URL('https://accounts.spotify.com/authorize');
  
  // Add parameters to the URL (like ?client_id=xxx&redirect_uri=yyy)
  spotifyAuthUrl.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID);
  spotifyAuthUrl.searchParams.append('response_type', 'code');
  spotifyAuthUrl.searchParams.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI);
  spotifyAuthUrl.searchParams.append('scope', scopes.join(' '));

  // Redirect the user to Spotify's login page
  res.redirect(spotifyAuthUrl.toString());
}