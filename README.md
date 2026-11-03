# Rowan's Website

Teaching resources and student portfolio hub for T Level Digital, live at **[ainsbury.art](https://ainsbury.art)**.

It's a plain static site: hand-written HTML, CSS and vanilla JavaScript, with no build step, framework or dependencies. The look is a 90s desktop: every section is a draggable-looking "window" with working `_ □ ×` buttons and a taskbar footer.

## What's on it

- **Homepage** (`index.html`): a landing page with one big button per revision guide (T Level Digital Software Development and OCR GCSE Computer Science are live; T Level Digital Support & Security and V Level Digital are marked *coming soon*), the core exam countdown, class demos and student portfolio sites. Below those is a compact row with the guidelines, student toolkit, question of the day, key dates, lesson posts and useful links.
- **Core Revision Guide** (`revision/`): T Level Digital Software Development. It has interactive notes for content areas CA1–CA8, exam technique, two timed mock papers, the ESP, the occupational specialism, organisers and an A–Z glossary. Checklists, flashcards, answers, marks and notes are saved in the visitor's browser (`localStorage`) and are never sent anywhere.
- **GCSE Computer Science Revision Guide** (`gcse/`): OCR J277, built the same way as the T Level guide and using the same engine. It has a page for each spec topic (1.1–1.6, 2.1–2.5), exam technique with an Exam Reference Language reference, practical programming tasks, two timed 80-mark mock papers, printable organisers and an A–Z glossary. Its progress is saved separately from the T Level guide's.
- **Student toolkit** (`pages/`): starter template, submission checklist, HTML & CSS cheat sheet, common mistakes, glossary, term planner, placement prep and a random question page.
- **Starter site** (`starter/`): a heavily commented `index.html` + `style.css` that students can copy as the base for their own portfolio.
- **Posts** (`posts/`): lesson resources and notes.
- **Demos**: class demo pages such as `cargopulse.html`.

## Project structure

```
index.html            Homepage
404.html              Error page (GitHub Pages)
not_found.html        Error page (Neocities)
CNAME                 Custom domain: ainsbury.art
.nojekyll             Serve files as-is on GitHub Pages
robots.txt            Crawler rules
favicon.svg/.ico      Site icon (pixel-art window), plus apple-touch-icon.png
css/style.css         Main site styles
js/
  analytics.js        GoatCounter visit counting (set your code at the top)
  demos.js            Class demos list for the homepage
  windows.js          Makes the _ □ × window buttons work (load last)
  dates.js            Key dates and exam dates for both courses
  countdown.js        Exam countdown + "this week's revision"
  tips.js             Tip of the day strings (not currently shown)
  questions.js        Question bank (CSV pasted into a string)
  question-bank.js    Parses the CSV into question objects
pages/                Student toolkit pages
posts/                Lesson posts, posts.js index and template.html
revision/             Core Revision Guide pages, plus the shared guide engine:
  revision.css        Styles for every revision guide
  revision.js         Checklists, flashcards, mark schemes, mocks, search...
gcse/                 GCSE Computer Science Revision Guide
  guide.js            Settings for the engine: pages, timers, summary form (load first)
  gcse.css            Topic colours, on top of ../revision/revision.css
  questions.js        GCSE question bank for the "Quiz me" boxes
  topic1-1.html ...   One page per spec topic, plus exams, programming, mocks
starter/              Student starter site
```

## Running locally

Open `index.html` in a browser. Everything works from the file system except the error pages, which use root-relative paths (`/css/style.css`). To test those too, serve the folder:

```
python -m http.server 8000
```

then visit [http://localhost:8000](http://localhost:8000).

## Common updates

### Add a post

1. Copy `posts/template.html` to `posts/YYYY_MM_DD_Title.html` and fill it in.
2. Add an entry to `posts/posts.js`:
   ```js
   {
     title: "Post title",
     filename: "posts/YYYY_MM_DD_Title.html",
     date: "YYYY-MM-DD"
   },
   ```

   The homepage sorts posts newest first and tags the latest one **NEW!**.

### Add a key date

Add an entry to `keyDates` (T Level) or `gcseDates` (GCSE) in `js/dates.js`. Dates must be `YYYY-MM-DD`. The homepage's key dates window has a T Level / GCSE switch, shows the next three upcoming dates for the chosen course and hides past ones automatically. It remembers which course each visitor picked. The exam countdowns on the homepage and the guide home pages also come from these lists.

### Add a tip

Add a string to the `tips` array in `js/tips.js`.

### Update the question bank

Export the bank as CSV and paste it between the backticks in `js/questions.js`, keeping the header row (`id,topic,type,question,answer,options,correct,marks,source,needs_check`). It feeds the question of the day, `pages/question.html` and the "Quiz me" boxes in the revision guide.

### Add a student site

Add a link inside `.student-list` in the `#students` section of `index.html`. The **Random site** button picks from these links automatically.

### Add a class demo

Put the page in the root folder (or a `demos/` folder) and add an entry to `js/demos.js`:

```js
{
  title: "Demo name",
  file: "my-demo.html",
  date: "YYYY-MM-DD",
  description: "Optional one-liner"
},
```

The homepage sorts demos newest first and tags the latest one **NEW!**. Add `<script src="js/analytics.js"></script>` to the demo's `<head>` so its visits are counted.

### Update the GCSE guide

- **Exam dates:** edit `gcseDates` in `js/dates.js`. The countdowns and "this week's revision" use them. The 2027 dates there are **provisional placeholders**: replace them when OCR publishes the final timetable.
- **Summary form:** set `summaryForm` in `gcse/guide.js` (see [Progress summaries](#progress-summaries)).
- **Question bank:** `gcse/questions.js` works exactly like `js/questions.js`. Each topic must start with its spec number (e.g. `1.2 Memory and storage`), because each topic page's Quiz me box picks questions by number (`<div class="quiz-me" data-topic="1.2">`).
- **Glossary:** `gcse/glossary.html` was built from the Quick recall definitions on the topic pages. If you add a definition to a topic page, add it to the glossary too, with `data-ca` set to the topic (e.g. `data-ca="1-2"`).
- **Code:** a `<pre class="code">` gets a ▶ Run button; Exam Reference Language blocks use `<pre class="code no-run">` so they don't. Put the expected output in a `<pre class="out">` straight after the code.

### Launch a new revision guide

The homepage's `#guides` section has a big button per course. Planned guides are a `<div class="course-button is-soon" aria-disabled="true">`. To build one (e.g. `dss/` or `vlevel/`), copy the GCSE guide's approach:

1. Make a folder with its own `guide.js` (copy `gcse/guide.js` and change the name, `storagePrefix`, `backupId`, the page list, timers and dates) and its own colour CSS (like `gcse/gcse.css`).
2. Each page loads `../css/style.css`, `../revision/revision.css`, the guide's CSS and `../js/analytics.js` in its `<head>`. At the end of `<body>` it loads `guide.js`, then `../revision/revision.js`, then `../js/windows.js`. Copy a GCSE page as a starting point.
3. In `index.html`, change that guide's `<div …>` to `<a class="course-button" href="dss/index.html" style="--course: …">`, change the closing `</div>` to `</a>`, and change **Coming soon** to **Open guide &rarr;**.

Anything a guide's `guide.js` leaves out falls back to the T Level settings, so the T Level guide needs no config file.

## Analytics

Visits are counted with [GoatCounter](https://www.goatcounter.com), which is free for non-commercial sites. It sets no cookies and stores no personal data, so no cookie banner is needed. Every page (except the student `starter/` template) loads `js/analytics.js`.

**Setup (one time):**

1. Sign up at goatcounter.com and choose a code, e.g. `ainsbury`.
2. Open `js/analytics.js` and replace `YOUR-CODE` with that code.
3. Upload the site. Your dashboard is at `https://YOUR-CODE.goatcounter.com`.

The dashboard shows views per page, referrers, browsers, screen sizes and countries. Clicks on links to other sites (such as student portfolios and the **Random site** button) appear as events named `outbound: …`. Visits from `file://` and `localhost` aren't counted, so local testing doesn't skew the numbers. If you'd rather not count your own visits online, use GoatCounter's *Settings → Ignore IPs*.

Every new page needs the script in its `<head>` (`posts/template.html` already has it):

```html
<script src="../js/analytics.js"></script>
```

Use `js/analytics.js` from the root folder and `/js/analytics.js` on the error pages.

### What students do in the revision guides

The guides also count a few anonymous actions, which show up in the dashboard as events named `guide/page: action`, e.g. `gcse/mock1: finished mock` or `tlevel/ca3: flashcards`. Each action is counted at most once per page visit, and nothing about the student (no name, answers or scores) is sent.

| Action | Counted when a student... |
|---|---|
| `rated checklist` | rates a spec checklist point |
| `flashcards` | marks a flashcard Got it / Not yet |
| `quiz me` | answers a Quiz me question |
| `opened mark scheme` / `marked an answer` | opens a mark scheme / gives themselves a mark |
| `started mock` / `finished mock` / `printed paper` | starts a mock timer / unlocks the mark schemes / prints a mock |
| `ran code` | runs Python with ▶ Run |
| `searched` | searches the guide (the search words aren't sent) |
| `downloaded progress` / `made summary` / `opened summary form` | uses the backup and summary tools |

Comparing `started mock` with `finished mock`, or the `flashcards` counts across topics, shows what students are actually using.

## Progress summaries

On each guide's home page, **backup_progress.exe** makes a progress summary and copies it to the clipboard. To collect them in one place:

1. Make a Microsoft Form with a long-answer question, e.g. "Paste your progress summary here".
2. Copy the form's share link and paste it in as `summaryForm`: in `revision/revision.js` (near the top) for the T Level guide, and in `gcse/guide.js` for the GCSE guide.

An **Open the form and paste it in** button then appears after a student makes their summary. With no link set, the button stays hidden.

## Printing mock papers

The timer bar on each mock has **Print paper**, which prints the questions with ruled answer lines (more lines for higher-mark questions) and no mark schemes. **Print mark scheme** appears once the paper has been finished on that computer, so to print one for marking, open the mock and press **I've finished: show mark schemes** first.

The same buttons are on each guide's **Print** page (`organisers.html`), under **Mock papers**. They open the mock with `#print-paper` or `#print-ms` on the end of the address (e.g. `mock1.html#print-paper`), and the mock page opens the print dialog by itself.

## Link previews

Every page has Open Graph tags (`og:title`, `og:image` etc.) under its `<title>`, so links pasted into Teams, email or social media show a card. The cards are `images/og/site.png`, `tlevel.png` and `gcse.png`. When you make a new page, copy these tags from a similar page and change the title, description and `og:url`. The post template has them already, apart from `og:url`.

## Search engines and AI crawlers

`robots.txt` lets search engines index the site but blocks the main AI crawlers (GPTBot, ClaudeBot, Google-Extended and others), so the revision guides aren't collected to train AI models. This also stops some AI assistants opening a page when someone pastes the link into them. Bots don't have to obey robots.txt, but the big companies' crawlers do. To allow them again, put a `#` back in front of the AI crawler lines.

## Cache busting

CSS and JS links carry a version query string, e.g. `css/style.css?v=2026-10-29`. After changing a stylesheet or script, update the date on every page that links it so browsers fetch the new copy instead of a cached one.

## Deploying

Upload the files to Neocities (or push to the GitHub Pages repository), keeping the folder structure the same. File names are case sensitive once they're online.

## Notes

The Core Revision Guide is an independent teaching resource, not produced, checked or endorsed by Pearson or JCQ. The GCSE Computer Science Revision Guide is likewise not produced, checked or endorsed by OCR or JCQ. Both are for students on the course and not for resale.

Every new page should also link the favicon in its `<head>` (with `../` in front from a subfolder):

```html
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
```

© 2026 Rowan Ainsbury.
