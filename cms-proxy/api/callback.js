const { AuthorizationCode } = require('simple-oauth2');

module.exports = async (req, res) => {
    const { host } = req.headers;
    const { code } = req.query; // Get parameter from the redirected URL

    if (!code) {
        return res.status(400).send('Missing code parameter');
    }

    const client = new AuthorizationCode({
        client: {
            id: process.env.OAUTH_CLIENT_ID,
            secret: process.env.OAUTH_CLIENT_SECRET,
        },
        auth: {
            tokenHost: 'https://github.com',
            tokenPath: '/login/oauth/access_token',
            authorizePath: '/login/oauth/authorize',
        },
    });

    try {
        const accessToken = await client.getToken({
            code,
            redirect_uri: `https://${host}/api/callback`,
        });

        const token = accessToken.token.access_token;
        const provider = 'github';

        const origin = process.env.ORIGIN || '*';

        // Post message to the opener (CMS window)
        const script = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            
            // Allow matching against any origin if origin is *
            if ("${origin}" !== "*" && e.origin !== "${origin}") {
              console.log("Origin mismatch: expected ${origin}, got " + e.origin);
              return;
            }
            
            // Send the token
            window.opener.postMessage(
              'authorization:${provider}:success:${JSON.stringify({ token })}',
              e.origin
            );
          }
          window.addEventListener("message", receiveMessage, false);
          
          // Fallback: send message immediately if opener is ready
          window.opener.postMessage(
            'authorization:${provider}:success:${JSON.stringify({ token })}',
            "${origin}"
          );
        })()
      </script>
    `;

        res.send(script);
    } catch (error) {
        console.error('Access Token Error', error.message);
        res.status(500).json('Authentication failed');
    }
};
