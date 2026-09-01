# Content admin — one-time setup

The editor lives at **`/admin`** on the deployed site. It reads and writes two
files in this repository:

| File | What it controls |
|---|---|
| `content/impact.json` | Youth trained, water conserved, jobs placed, the 2026 target, and the trend chart series |
| `content/milestones.json` | The milestones timeline on the Impact Hub |

Saving in the editor makes a **commit to the `content` branch** — never straight
to the live site. Publishing is a second, deliberate step:

1. Someone edits at `/admin` and saves. That commits to `content`.
2. Vercel builds a **preview deployment** of `content`, so the change can be
   looked at on a real page before anyone sees it.
3. Someone opens a pull request from `content` into `Update` and merges it.
4. Vercel redeploys `Update` and the change is live.

Every edit keeps an author, a timestamp and a revert button, and now nothing
reaches the public site without a second pair of eyes.

**This costs you a step.** Saving is no longer publishing. If that turns out to
be friction you do not want, point `branch:` in `admin/config.yml` back at
`Update` and drop the protection rule — but then any save goes live immediately.

---

## Why there are two steps you have to do yourself

The editor runs in the browser, so it cannot hold the GitHub client secret —
anyone could read it out of the page. The secret half of the sign-in happens in
`api/auth.js` and `api/callback.js`, which need credentials that only you can
create. **I can't create these for you: it means signing into your GitHub and
Vercel accounts, which is yours to do.**

### Step 1 — Create a GitHub OAuth app

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** `Green Rising Content Admin`
   - **Homepage URL:** `https://my-antigravity-app-delta.vercel.app`
   - **Authorization callback URL:** `https://my-antigravity-app-delta.vercel.app/api/callback`
3. Click **Register application**
4. Copy the **Client ID**
5. Click **Generate a new client secret** and copy it — GitHub shows it once

### Step 2 — Add them to Vercel

In the Vercel project → **Settings → Environment Variables**, add both for
Production (and Preview if you want the editor on preview URLs):

| Name | Value |
|---|---|
| `GITHUB_CLIENT_ID` | the Client ID from step 1 |
| `GITHUB_CLIENT_SECRET` | the client secret from step 1 |

Redeploy once so the functions pick them up.

---

## Protecting the live branch

The review gate only exists once `Update` refuses direct pushes. **This needs
repo admin and has to be done by hand:**

1. Repository **Settings > Branches > Add branch ruleset** (or *Add rule* on
   older repos)
2. Target the **`Update`** branch
3. Enable **Require a pull request before merging**
4. Optionally set **Required approvals** to 1 — with a single maintainer, leave
   it at 0 or you will not be able to merge your own PRs
5. Leave **Do not allow bypassing** unticked unless you want the rule to apply
   to admins too

Order matters: create the `content` branch and deploy the updated
`admin/config.yml` **before** turning the rule on. If `Update` is protected
while the CMS still commits to it, every save fails.

## Check the domain

`admin/config.yml` and the OAuth app both assume the site is at
`https://my-antigravity-app-delta.vercel.app`. If the real domain is different, change it in
three places: `base_url` and `site_url` in `admin/config.yml`, and the two URLs
in the GitHub OAuth app.

## Who can change the site

There are two layers, and the first one is the one that matters.

**1. GitHub repository write access — this is the real gate.**

The editor commits using the signed-in person's own GitHub token. Someone
without write access to `apalonehere/my-antigravity-app` is refused by GitHub
the moment they try to save. This is enforced on GitHub's servers, not in our
code, so it cannot be bypassed by fiddling with the browser.

Manage it under **Settings > Collaborators** on the repository. Adding someone
there gives them editing access; removing them takes it away. There is no
separate password to issue or revoke.

Note that this cuts both ways: anyone with write access can also commit with
plain `git` and skip the editor entirely. Repo write access *is* permission to
change the site.

**2. `CMS_ALLOWED_USERS` — an optional narrower list for the editor.**

Set this Vercel environment variable to a comma-separated list of GitHub
usernames to restrict who can use `/admin` specifically:

```
CMS_ALLOWED_USERS = apalonehere, some-colleague
```

Anyone signing in who is not on the list is refused at sign-in with a clear
message, instead of being handed an editor that looks usable and then fails on
first save. Leave the variable unset to allow anyone with repo write access.

This is defence in depth, not the gate. It controls the editor; repo
permissions control the site.

**What signing in actually grants.** The OAuth app requests the `public_repo`
scope — access to the signer-in's public repositories only. It deliberately does
not request `repo`, which would have handed the token access to every private
repository they own. If this repository is ever switched to private, the scope
in `api/auth.js` must change to `repo` or the editor will stop finding it.

---

## What is *not* editable here yet

Deliberately out of scope for this first pass, and still developer-only:

- The resources library (`js/resources.js`)
- Programme story pages — the reef and Eco-Leaders photo beats and captions
- Team members, hero slides, and landing-page copy
- Cohorts and sensor logs in the legacy in-site portal, which still write to
  `localStorage` and therefore still change nothing for visitors

Extending the CMS to any of these is the same shape of work: move the content
into a JSON file, point the page at it, and add a collection to
`admin/config.yml`.

## Known gap

The trend series in `content/impact.json` is still the interpolated placeholder
described in `js/impact-chart.js` — only the final point is real. It is now
editable in the admin, so replacing it with the true monthly intake no longer
needs a developer.
