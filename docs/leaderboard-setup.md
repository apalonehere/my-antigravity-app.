# Leaderboard - turning on the shared board

The Eco Arcade at **`/play`** keeps a leaderboard for each game. Out of the box
it is a **local** board: the table lives in the visitor's own browser, so every
visitor sees only their own runs. The page says so, in as many words, under the
heading: *"Your own table, kept in this browser."*

Adding two environment variables promotes every board to a **shared** one:
everyone who plays writes to the same table, and the line changes to *"Everyone
who plays, best run per nickname."* Nothing in the site's code changes.

---

## What you need

A Redis database reachable over HTTP. The endpoint in `api/leaderboard.js`
speaks Upstash's REST protocol, which is what Vercel provisions, and it needs
no npm package: it is one `fetch` with a bearer token.

### Step 1 - Create the database

In the Vercel project → **Storage** → **Create Database** → choose the
**Upstash for Redis** marketplace integration, and connect it to this project.
There is a free tier, and a leaderboard of six boards at twenty rows each will
not leave it.

(If you would rather go direct: sign up at upstash.com, create a Redis
database, and copy the REST URL and REST token from its dashboard.)

### Step 2 - Check the environment variables

Connecting the integration sets them for you. In **Settings → Environment
Variables** you should see one of these pairs:

| Name | Set by |
|---|---|
| `KV_REST_API_URL` and `KV_REST_API_TOKEN` | Vercel's own storage integration |
| `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` | Upstash directly |

Either pair works. The function checks for both.

### Step 3 - Redeploy

Functions pick up environment variables at deploy time, so redeploy once. Then
open `/play`, finish a game, and add a score. The line under **Leaderboard**
should now read *"Everyone who plays, best run per nickname."*

To check without playing:

```bash
curl https://YOUR-SITE.vercel.app/api/leaderboard?game=sort
```

`"configured": true` means the board is shared. `"configured": false` means the
variables are missing or the deploy predates them.

---

## Before you turn it on: two things to decide

**1. Anyone can post a name.** There is no sign-in. The endpoint strips markup,
caps a nickname at 14 characters, refuses a short blocklist of obvious
profanity, and rate-limits each IP to 20 scores per 10 minutes. That is a
floor, not a moderation policy. On a site aimed at children, someone has to be
willing to look at the board and remove things. If nobody can do that, the
local board is the safer setting, and it is the default for that reason.

The form asks for a nickname or first name and says the name is public. Please
leave that wording in.

**2. Anyone can post a score they did not earn.** The games are scored in the
browser, which means the browser is what reports the number, which means the
number can be forged by anyone who opens the developer console. `js/boards.js`
bounds each board to what a human could plausibly reach (six correct answers,
ninety sorted items, at least six moves), so the damage is capped at "plausible
but untrue". Fixing this properly means moving scoring to the server, which is
a different and much larger piece of work. **Do not attach a prize to these
boards.**

---

## Removing a row

Set one more environment variable, `LEADERBOARD_ADMIN_TOKEN`, to a long random
string. Then:

```bash
curl -X DELETE -H "Authorization: Bearer YOUR-TOKEN" "https://YOUR-SITE.vercel.app/api/leaderboard?game=sort&name=Kai"
```

`game` must be one of the ids in `js/boards.js`; `name` must match the row
exactly, including case. The response says how many rows were removed.

Without the token set, `DELETE` answers 401 to everyone, including you.

---

## The boards

Defined once in `js/boards.js` and read by both the browser and the function,
so they cannot drift apart.

| id | Game | Sorted by |
|---|---|---|
| `trivia-kids` | Climate Trivia, ages 10 to 13 | most correct |
| `trivia-teens` | Climate Trivia, ages 14 to 17 | most correct |
| `trivia-youth` | Climate Trivia, ages 18 to 29 | most correct |
| `sort` | Sort It | most items sorted |
| `memory-easy` | Reef Memory, 6 pairs | fewest moves |
| `memory-standard` | Reef Memory, 8 pairs | fewest moves |

Each board keeps 20 rows and one row per nickname, holding that nickname's best
run. Adding a board means adding an entry to that table; nothing else needs to
know about it.

---

## Sound

Unrelated to storage, but it lands on the same page. `js/sound.js` synthesises
every click and game sound with the Web Audio API, so there are no audio files
to host. **Sound is off until a visitor turns it on** with the speaker button
in the header, and the choice is remembered per browser.

To make it on by default for new visitors, set `SOUND_DEFAULT_ON` to `true` at
the top of `js/sound.js`. Anyone who has already used the toggle keeps their
own setting either way. Consider that a page that makes noise unprompted is
the kind of thing people close tabs over, and that browsers suppress audio
before the first interaction regardless.
