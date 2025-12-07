// This API route handles the redirect from Spotify after login

import cookie from 'cookie';

export default async function handler(req, res) {
  // Get the authorization code from the URL (Spotify sends this)
  const code = req.query.code;

  // If there's no code, something went wrong
  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    // Exchange the code for an access token
    // This is like trading a voucher for the actual key
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Basic auth: base64 encode "client_id:client_secret"
        'Authorization': 'Basic ' + Buffer.from(
          process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();

    // If Spotify returned an error
    if (!tokenResponse.ok) {
      console.error('Spotify token error:', tokenData);
      return res.redirect('/?error=token_exchange_failed');
    }

    // Store the access token in a secure cookie
    // HttpOnly means JavaScript can't read it (more secure)
    // Max-Age is in seconds (3600 = 1 hour)
    res.setHeader('Set-Cookie', cookie.serialize('spotify_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only use HTTPS in production
      maxAge: 3600, // 1 hour
      path: '/',
      sameSite: 'lax', // Prevents CSRF attacks
    }));

    // Redirect user back to homepage (now logged in)
    res.redirect('/');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}