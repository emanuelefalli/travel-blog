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

## How to put it online with GitHub Pages (free)

GitHub Pages hosts static sites like this one for free, directly from a repository. Here is the exact sequence, assuming you've never used GitHub before.

### Step 1 — Create a GitHub account
Go to https://github.com and sign up (free). Skip this if you already have one.

### Step 2 — Create a new repository
1. Click the **+** icon top-right → **New repository**
2. Name it something like `travel-blog` (no spaces)
3. Set it to **Public** (required for free GitHub Pages)
4. Do **not** check "Add a README" — you already have one
5. Click **Create repository**

### Step 3 — Upload your files
On the empty repository page, click **uploading an existing file** (a blue link in the middle of the page).

Drag your entire `travel-blog` folder **contents** into the upload box — not the folder itself, its *contents*: `index.html`, `trips.html`, `about.html`, `map.html`, `post-patagonia.html`, `style.css`, `script.js`, `README.md`, `.nojekyll`, `.gitignore`, and the `assets` folder.

GitHub's drag-and-drop upload preserves folder structure, so dragging the `assets/images` folder in keeps it as `assets/images/...` in the repo.

Scroll down, write a commit message like "Initial site", and click **Commit changes**.

### Step 4 — Turn on GitHub Pages
1. In your repository, click **Settings** (top tab)
2. In the left sidebar, click **Pages**
3. Under "Build and deployment" → **Source**, choose **Deploy from a branch**
4. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**
5. Wait about 1 minute. Refresh the page — a green box appears with your live URL:
   `https://yourusername.github.io/travel-blog/`

That's it. The site is live and free, and stays free indefinitely for public repositories.

### Updating the site after the first upload
Any time you want to change something:
1. Open the file on GitHub (click it in the repo)
2. Click the pencil icon (**Edit this file**)
3. Make your change, scroll down, **Commit changes**
4. The live site updates automatically within about a minute

For anything bigger than a one-line edit, it's easier to use GitHub Desktop (https://desktop.github.com) — a free app that lets you edit files normally on your computer and "sync" changes with a button click, instead of editing in the browser.

---

## Handling photos in the repository

Photos are the one part of this workflow that needs a bit of care, because GitHub is built for code, not media libraries. Follow these rules and you won't hit problems.

### 1. Compress before uploading
GitHub works fine with images, but it's not a photo host — large files make the repo slow to load and slow to clone. Before uploading any photo:
- Resize to about **2000px on the longest side** (plenty for full-width web display, no phone or laptop screen needs more)
- Compress with a free tool: **https://squoosh.app** (drag photo in, export as WebP or JPEG at ~80% quality)
- Aim for **under 500KB per photo**. A resized, compressed photo rarely needs more than that.

A full-resolution 20MB RAW-derived JPEG straight off a camera will work, but it will make your site slow for visitors and slow to manage in the repo. Always downsize first.

### 2. Where photos go
Everything lives in `assets/images/`. Keep it organized by trip so it stays manageable as the site grows:

```
assets/images/
├── patagonia/
│   ├── hero.jpg
│   ├── towers-sunrise.jpg
│   └── glacier-detail.jpg
├── iceland/
│   ├── hero.jpg
│   └── ring-road.jpg
└── kyoto/
    └── ...
```

This is just a convention — GitHub Pages serves any folder structure. Subfolders per trip keep things from turning into one giant folder of 200 similarly-named files.

### 3. Uploading photos to an existing repo
Two ways:

**Small batches (a few photos):** On GitHub, navigate into `assets/images/`, click **Add file → Upload files**, drag your photos in, commit.

**Larger batches or ongoing use:** Install **GitHub Desktop** (https://desktop.github.com):
1. Clone your repository to your computer through the app
2. Drop new photos straight into the local `assets/images/...` folder using Finder/Explorer, like any normal folder
3. Open GitHub Desktop — it shows the new files as changes
4. Write a commit message ("Add Iceland photos"), click **Commit to main**, then **Push origin**
5. Live in about a minute

This second method is much less tedious once you're regularly adding trips, since you're just working with a normal folder on your computer.

### 4. Referencing photos in your HTML
Once a photo is in the repo, reference it with a **relative path** from the HTML file — not an absolute URL:

```html
<img loading="lazy" src="assets/images/patagonia/towers-sunrise.jpg" alt="Granite towers at sunrise">
```

This works identically whether you're viewing the site locally by double-clicking `index.html`, or live on GitHub Pages — no path changes needed between the two.

### 5. A note on repo size
GitHub is comfortable with repositories up to a few hundred MB, and individual files up to 100MB (files over 50MB trigger a warning, over 100MB are rejected). A travel blog with a few hundred compressed photos will typically stay in the tens-of-MB range — nowhere near the limit. If you ever plan to host thousands of full-resolution images, that's a job for a dedicated image host (like Cloudinary) rather than the git repo itself, but for a personal travel journal this setup is exactly right.

---

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
