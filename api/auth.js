// GitHub OAuth — step 1 of 2.
//
// The CMS at /admin runs entirely in the browser, so it cannot hold the GitHub
// client secret; anyone could read it out of the page source. These two
// functions are the only server-side code on the site: they do the secret half
// of the handshake and hand back a token.
//
// Flow: /api/auth  ->  github.com/login/oauth/authorize  ->  /api/callback
//
// Needs two environment variables set in the Vercel project:
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET

const crypto = require('crypto');

module.exports = (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        res.status(500).send('GITHUB_CLIENT_ID is not set on this deployment. See docs/admin-setup.md.');
        return;
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';

    // CSRF guard: the value we send is echoed back and must match.
    const state = crypto.randomBytes(16).toString('hex');
    res.setHeader('Set-Cookie',
        `gr_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=600`);

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', `${proto}://${host}/api/callback`);
    // `repo` is the narrowest scope that still allows committing to a repo.
    url.searchParams.set('scope', 'repo,user');
    url.searchParams.set('state', state);

    res.writeHead(302, { Location: url.toString() });
    res.end();
};
