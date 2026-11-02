# Rowan's Website

Teaching resources and student portfolio hub for T Level Digital, live at **[ainsbury.art](https://ainsbury.art)**.

It's a plain static site: hand-written HTML, CSS and vanilla JavaScript, with no build step, framework or dependencies. The look is a 90s desktop: every section is a draggable-looking "window" with working `_ □ ×` buttons and a taskbar footer.

## What's on it

- **Homepage** (`index.html`): course guidelines, the student toolkit, T Level overview, class demos, lesson posts, useful links, and a sidebar with the question of the day, key dates, tip of the day and links to student portfolio sites.
- **Core Revision Guide** (`revision/`): interactive notes for content areas CA1–CA8, exam technique, two timed mock papers, the ESP, the occupational specialism, organisers and an A–Z glossary. Checklists, flashcards, answers, marks and notes are saved in the visitor's browser (`localStorage`) and nothing is sent anywhere.
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
css/style.css         Main site styles
js/
  windows.js          Makes the _ □ × window buttons work (load last)
  dates.js            Key dates for the sidebar, term planner and countdown
  countdown.js        Exam countdown + "this week's revision"
  tips.js             Tip of the day strings
  questions.js        Question bank (CSV pasted into a string)
  question-bank.js    Parses the CSV into question objects
pages/                Student toolkit pages
posts/                Lesson posts, posts.js index and template.html
revision/             Core Revision Guide pages, revision.css, revision.js
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

Add an entry to `keyDates` in `js/dates.js`. Dates must be `YYYY-MM-DD`. The homepage shows the next three upcoming dates and hides past ones automatically.

### Add a tip

Add a string to the `tips` array in `js/tips.js`.

### Update the question bank

Export the bank as CSV and paste it between the backticks in `js/questions.js`, keeping the header row (`id,topic,type,question,answer,options,correct,marks,source,needs_check`). It feeds the question of the day, `pages/question.html` and the "Quiz me" boxes in the revision guide.

### Add a student site

Add a link inside `.student-list` in the sidebar of `index.html`. The **Random site** button picks from these links automatically.

### Add a class demo

Put the page in the root folder and add a `.demo-item` to the `#demos` section of `index.html`.

## Cache busting

CSS and JS links carry a version query string, e.g. `css/style.css?v=2026-10-29`. After changing a stylesheet or script, update the date on every page that links it so browsers fetch the new copy instead of a cached one.

## Deploying

Upload the files to Neocities (or push to the GitHub Pages repository), keeping the folder structure the same. File names are case sensitive once they're online.

## Notes

The Core Revision Guide is an independent teaching resource, not produced, checked or endorsed by Pearson or JCQ. It's for students on the course and not for resale.

© 2026 Rowan Ainsbury.
