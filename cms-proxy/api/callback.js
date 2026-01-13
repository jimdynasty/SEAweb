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

    let origin = process.env.ORIGIN || '*';
    if (origin !== '*' && !origin.startsWith('http')) {
      origin = `https://${origin}`;
    }

    // Post message to the opener (CMS window)
    const script = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; text-align: center; padding: 20px;">
        <h3>Authentication Successful!</h3>
        <p>Sending credentials to CMS...</p>
        <div id="status">Connecting...</div>
        <script>
          (function() {
            function log(msg) {
                console.log(msg);
                document.getElementById('status').innerText = msg;
            }
            
            const token = ${JSON.stringify({ token, provider: 'github' })};
            const provider = '${provider}';
            const origin = "${origin}";

            function receiveMessage(e) {
              log("Received message from: " + e.origin);
              
              if (origin !== "*" && e.origin !== origin) {
                log("Origin mismatch: expected " + origin + ", got " + e.origin);
                return;
              }
              
              // Send the token
              window.opener.postMessage(
                'authorization:' + provider + ':success:' + JSON.stringify(token),
                e.origin
              );
              log("Credentials sent to " + e.origin + ". Closing...");
              setTimeout(() => window.close(), 1000);
            }
            window.addEventListener("message", receiveMessage, false);
            
            // Verify opener
            if (!window.opener) {
                log("CRITICAL ERROR: window.opener is null. The popup lost connection to the CMS.");
                document.body.innerHTML += "<p style='color:red'>Cannot send token: Browser severed link to CMS.</p>";
            } else {
                log("window.opener is VALID.");
            }

            // Inject RAW values (Fixing the double-JSON bug)
            const token = "${token}"; 
            const provider = "${provider}";
            const origin = "${origin}";

            // Construct standard payload
            const payload = {
                token: token,
                provider: provider
            };
            const mess = 'authorization:' + provider + ':success:' + JSON.stringify(payload);
            
            // Visual Debug
            document.body.innerHTML += "<p style='font-size:10px; color:gray'>Final Payload: " + mess + "</p>";

            function sendMessage() {
                try {
                    window.opener.postMessage(mess, "*"); 
                    log("Sent message to *");
                } catch (err) {
                    log("Error sending: " + err);
                }
            }
            
            // Send immediately
            sendMessage();
            
            // Send interval
            setInterval(sendMessage, 1500);
          })()
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
