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
    const clientId = (process.env.GITHUB_CLIENT_ID || '').trim();

    if (!clientId) {
        res.status(500).send('GITHUB_CLIENT_ID is not set on this deployment. See docs/admin-setup.md.');
        return;
    }

    // A real GitHub client ID has no spaces — newer ones look like Ov23li...,
    // older ones are 20 hex characters. Without this check, placeholder text
    // pasted into the env var sails through to GitHub, which answers with a
    // bare 404 that says nothing about the cause. Fail here, legibly, instead.
    if (/\s/.test(clientId) || clientId.length < 10) {
        res.status(500).send(
            'GITHUB_CLIENT_ID does not look like a GitHub client ID. It is currently ' +
            JSON.stringify(clientId) + ' — which is placeholder text, not an ID. ' +
            'Set it to the Client ID shown on your OAuth app page ' +
            '(GitHub > Settings > Developer settings > OAuth Apps), then redeploy. ' +
            'See docs/admin-setup.md.'
        );
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
    // public_repo, not repo. `repo` would hand this token access to every
    // private repository the signer-in owns, which is far more than a content
    // editor needs. apalonehere/my-antigravity-app is public, so public_repo is
    // enough to commit to it. If the repo is ever made private, this has to
    // become `repo` — the CMS will 404 on the repo until it does.
    url.searchParams.set('scope', 'public_repo');
    url.searchParams.set('state', state);

    res.writeHead(302, { Location: url.toString() });
    res.end();
};
