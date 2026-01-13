const { AuthorizationCode } = require('simple-oauth2');

module.exports = async (req, res) => {
  const { host } = req.headers;
  const { code } = req.query;

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

    res.setHeader('Content-Type', 'text/html');

    // Post message to the opener
    const script = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; text-align: center; padding: 40px; color: #333;">
        <h3 style="color: #2da44e;">Authentication Successful!</h3>
        <p>You have successfully logged in with GitHub.</p>
        <p style="font-size: 14px; color: #666;">This window should close automatically...</p>
        <script>
          window.onload = function() {
            try {
                // Safe Injection
                const token = ${JSON.stringify(token)};
                const provider = ${JSON.stringify(provider)};
                
                // Construct payload
                const payload = {
                    token: token,
                    provider: provider
                };
                
                const mess = 'authorization:' + provider + ':success:' + JSON.stringify(payload);

                function sendMessage() {
                    if (window.opener) {
                        window.opener.postMessage(mess, "*"); 
                    }
                }
                
                // Send immediately
                sendMessage();
                
                // Retry every 1.5s in case the parent wasn't ready
                setInterval(sendMessage, 1500);
            } catch (err) {
                console.error("Auth Error:", err);
            }
          };
        </script>
      </body>
      </html>
    `;

    res.send(script);
  } catch (error) {
    console.error('Access Token Error', error.message);
    res.status(500).json('Authentication failed');
  }
};
