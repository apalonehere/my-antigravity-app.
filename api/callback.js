// GitHub OAuth — step 2 of 2.
//
// GitHub redirects here with a short-lived code. We exchange it for a token
// using the client secret, then post the result back to the CMS window that
// opened this one. The token never touches a query string or a log line.

module.exports = async (req, res) => {
    const clientId = (process.env.GITHUB_CLIENT_ID || '').trim();
    const clientSecret = (process.env.GITHUB_CLIENT_SECRET || '').trim();

    if (!clientId || !clientSecret) {
        res.status(500).send('GitHub OAuth is not configured on this deployment. See docs/admin-setup.md.');
        return;
    }

    const url = new URL(req.url, 'https://placeholder.local');
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    const cookies = Object.fromEntries(
        (req.headers.cookie || '').split(';').map(c => {
            const [k, ...v] = c.trim().split('=');
            return [k, v.join('=')];
        })
    );

    if (!code || !state || state !== cookies.gr_oauth_state) {
        res.status(400).send('OAuth state mismatch — start again from /admin.');
        return;
    }

    // Burn the state cookie so a code cannot be replayed.
    res.setHeader('Set-Cookie', 'gr_oauth_state=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0');

    let payload;
    try {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
        });
        payload = await tokenRes.json();
    } catch (err) {
        res.status(502).send('Could not reach GitHub to exchange the code.');
        return;
    }

    const ok = !payload.error && payload.access_token;
    const message = ok
        ? `authorization:github:success:${JSON.stringify({ token: payload.access_token, provider: 'github' })}`
        : `authorization:github:error:${JSON.stringify({ message: payload.error_description || 'Authorization failed' })}`;

    // postMessage back to the opener. Origin is pinned to this deployment so
    // the token is not broadcast to any other page listening.
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = `https://${host}`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(ok ? 200 : 401).send(`<!doctype html><meta charset="utf-8"><title>Signing in…</title>
<body style="font-family:system-ui;padding:2rem">
<p>${ok ? 'Signed in. You can close this window.' : 'Sign-in failed. Close this window and try again.'}</p>
<script>
  (function () {
    var msg = ${JSON.stringify(message)};
    function send(e) { window.opener && window.opener.postMessage(msg, ${JSON.stringify(origin)}); }
    window.addEventListener('message', send, { once: true });
    send();
    setTimeout(function () { window.close(); }, ${ok ? 800 : 4000});
  })();
</script></body>`);
};
