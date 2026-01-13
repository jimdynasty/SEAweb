const { AuthorizationCode } = require('simple-oauth2');

module.exports = async (req, res) => {
    const { host } = req.headers;
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

    // Authorization uri definition
    const authorizationUri = client.authorizeURL({
        redirect_uri: `https://${host}/api/callback`,
        scope: process.env.SCOPES || 'repo,user',
        state: Math.random().toString(36).substring(2),
    });

    res.redirect(authorizationUri);
};
