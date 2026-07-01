# Wanderlines — Photography Travel Blog

A minimalist, photography-first travel blog built with plain HTML, CSS, and a tiny bit of JavaScript. No frameworks, no build tools, no npm. Just files you can edit and open in a browser.

---

## How to view it on your computer

1. Unzip the folder anywhere you like (Desktop is fine).
2. Open the folder.
3. Double-click `index.html`. It opens in your browser. Done.

That's it. No installation needed.

---

## The files explained

```
travel-blog/
├── index.html              <- Homepage (hero + recent trips)
├── trips.html              <- Archive of all trips
├── about.html              <- About page
├── post-patagonia.html     <- Sample article (template for new posts)
├── style.css               <- All visual styling
├── script.js               <- Theme toggle + image fade-in
└── README.md               <- This file
```

You do not need to touch `style.css` or `script.js` unless you want to change colors or layout.

---

## How to change the text

1. Open any `.html` file in a text editor. Free options: **VS Code**, **Sublime Text**, or even the Notepad/TextEdit that came with your computer.
2. Find the words you want to change.
3. Type new words. Save the file.
4. Refresh the browser.

That's the entire workflow.

---

## How to use your own photos

Right now the site uses sample photos hosted on Unsplash (a free photo site). To use your own photos:

### Step 1 — Put your photos in the `assets/images` folder
Create a folder named `assets/images` inside your `travel-blog` folder. Drop your `.jpg` or `.webp` files in there.

### Step 2 — Change the image links in the HTML
Find a line like this in any HTML file:

```html
<img src="https://images.unsplash.com/photo-1531168556467-80aace0d0144?w=2400&q=90" alt="...">
```

Change it to point to your local file:

```html
<img src="assets/images/my-photo.jpg" alt="A description of my photo">
```

That's it. Save. Refresh.

**Tip for image quality:** Resize photos to about 2000px wide before adding them. Use a free tool like [Squoosh](https://squoosh.app/) to compress them — this keeps the site fast.

---

## How to add a new trip / blog post

### Step 1 — Copy the sample article
Duplicate `post-patagonia.html` and rename it (no spaces). Example: `post-iceland.html`.

### Step 2 — Edit the new file
Open it and change:
- The `<title>` at the top
- The hero image `src`
- The article title, location, and date
- The text inside each `<p>` paragraph
- Each image `src`

### Step 3 — Add it to the trips page
Open `trips.html`. Find an existing trip card (the `<a class="trip-card">...</a>` block) and copy it. Paste it at the top of the grid. Change:
- `href="post-patagonia.html"` → `href="post-iceland.html"`
- The image
- The trip title, location, date, subtitle

### Step 4 — Add it to the homepage
Same process in `index.html`.

### Step 5 — Add a country to the world map
Open `map.html`. Near the bottom you'll see a block called `visitedCountries`. It looks like this:

```javascript
const visitedCountries = {
  "CHL": [
    { title: "Among the Quiet Peaks of Patagonia", meta: "March 2026", url: "post-patagonia.html" }
  ],
  ...
};
```

Each key is a **three-letter country code** (ISO 3166-1 alpha-3). Some examples:
- `USA` United States · `ESP` Spain · `ITA` Italy · `GRC` Greece
- `BRA` Brazil · `ARG` Argentina · `CAN` Canada · `MEX` Mexico
- `IND` India · `THA` Thailand · `IDN` Indonesia · `AUS` Australia
- `DEU` Germany · `PRT` Portugal · `NLD` Netherlands · `TUR` Turkey

Full list: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-3

To add a country, drop a new entry in. **If you visit the same country twice, just add a second article inside the same array** — the popup will show both:

```javascript
"ITA": [
  { title: "Tuscan Hill Towns", meta: "May 2026", url: "post-tuscany.html" },
  { title: "A Sicilian Spring", meta: "April 2024", url: "post-sicily.html" }
]
```

The country turns light green automatically. Click it on the map → popup lists every article for that country.

---

## The available layout blocks for articles

Inside any `<article class="article-body">`, you can mix and match these blocks:

### Full-width image
```html
<figure class="image-full">
  <img loading="lazy" src="assets/images/photo.jpg" alt="...">
  <figcaption class="image-caption">Optional caption here</figcaption>
</figure>
```

### Side-by-side image pair (good for portraits)
```html
<div class="image-pair">
  <img loading="lazy" src="assets/images/a.jpg" alt="...">
  <img loading="lazy" src="assets/images/b.jpg" alt="...">
</div>
```

### Three-image row
```html
<div class="image-triptych">
  <img loading="lazy" src="assets/images/1.jpg" alt="...">
  <img loading="lazy" src="assets/images/2.jpg" alt="...">
  <img loading="lazy" src="assets/images/3.jpg" alt="...">
</div>
```

### Text block
```html
<div class="prose">
  <h2>A heading</h2>
  <p>Your paragraph here.</p>
  <p>Another paragraph.</p>
</div>
```

### Lead paragraph (the slightly larger intro paragraph)
```html
<div class="prose">
  <p class="lead">The big opening line of your story.</p>
</div>
```

---

## The lightbox

Any image inside an article (anything in `<article class="article-body">`) is automatically clickable — it opens fullscreen with prev/next arrows. You don't need to add anything to make this work. Keyboard shortcuts: `Esc` closes, `←` and `→` navigate.

---

## How to change the site name

Search across all `.html` files for `Wanderlines` and replace it with your name. In VS Code: press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+F` (Windows).

---

## How to put it online (free)

The easiest free option: **Netlify Drop**.

1. Go to https://app.netlify.com/drop
2. Drag the whole `travel-blog` folder into the page.
3. Wait 10 seconds. You get a free URL like `dreamy-cake-12345.netlify.app`.
4. Sign up (free) to keep the site permanently and get a custom domain.

Other free options: **GitHub Pages**, **Cloudflare Pages**, **Vercel**. All work the same way — drag-and-drop a folder, get a URL.

---

## Customization quick-reference

| What | Where | What to change |
|---|---|---|
| Site name | All HTML files | Search "Wanderlines" |
| Colors | `style.css`, top of file | The `--bg`, `--text`, `--accent` values |
| Fonts | `style.css`, top + `<link>` in HTML | `--font-serif`, `--font-sans` |
| Hero photo | `index.html` | The first `<img class="hero-image">` |
| Nav links | All HTML files, `<nav>` block | The `<li><a>` items |

---

## Why this stack?

You said you're a beginner, so I picked the simplest possible setup:
- **HTML** describes content
- **CSS** describes appearance
- **JavaScript** adds tiny interactions (theme toggle, image fade-in)

No build step. No package manager. No deploy pipeline. Open the file, see the result. When you're ready for more (a CMS, an automatic publishing flow, etc.), the content is plain enough to migrate to anything later.
