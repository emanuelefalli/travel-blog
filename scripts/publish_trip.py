#!/usr/bin/env python3
"""
Publish a new Wanderlines trip post from a folder of photos + a text file.

Usage:
    python3 scripts/publish_trip.py /path/to/trip-folder [--no-push] [--no-homepage]

The trip folder must contain:
  - exactly one .txt file with metadata + body (see scripts/trip-template.txt)
  - one or more photo files (.jpg, .jpeg, .png, .heic, .webp)

What it does:
  1. If a post with the same title (same slug) already exists, removes it
     first — old article file, old photo folder, old trips.html/index.html
     cards, old map.html entries — so re-running on an edited trip folder
     (e.g. one photo removed) replaces it instead of creating a duplicate.
  2. Resizes/compresses photos (sips, macOS built-in) into assets/images/<slug>/
  3. Generates post-<slug>.html from the article template
  4. Prepends a trip card to trips.html
  5. Adds/updates the country entry in map.html
  6. Promotes the new post to the homepage hero, demotes the old hero into
     the "Recent Journeys" grid, and trims the grid back to 5 cards
  7. Commits everything and pushes to origin/main (unless --no-push)
"""
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".heic", ".webp"}
MAX_HOMEPAGE_CARDS = 5


def slugify(title: str) -> str:
    s = title.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def parse_trip_file(txt_path: Path):
    text = txt_path.read_text(encoding="utf-8")
    if "---" not in text:
        sys.exit(f"Error: {txt_path.name} is missing the '---' separator between metadata and body.")
    meta_block, body = text.split("---", 1)
    meta = {}
    for line in meta_block.strip().splitlines():
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        meta[key.strip().lower()] = val.strip()

    required = ["title", "location", "date", "country_code", "country_name"]
    missing = [k for k in required if k not in meta or not meta[k]]
    if missing:
        sys.exit(f"Error: missing required metadata field(s) in {txt_path.name}: {', '.join(missing)}")

    meta.setdefault("subtitle", "")
    return meta, body.strip()


def parse_body(body: str):
    """Split body into sections. Each section is (heading_or_None, [paragraphs])."""
    sections = [(None, [])]
    for block in re.split(r"\n\s*\n", body):
        block = block.strip()
        if not block:
            continue
        if block.startswith("## "):
            sections.append((block[3:].strip(), []))
        else:
            sections[-1][1].append(block)
    return [s for s in sections if s[1]]


def process_images(photo_paths, slug):
    out_dir = REPO / "assets" / "images" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    web_paths = []
    for i, src in enumerate(photo_paths, start=1):
        dest_name = f"{i:02d}-{slugify(src.stem)}.jpg"
        dest = out_dir / dest_name
        subprocess.run(
            ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "80",
             "-Z", "2000", str(src), "--out", str(dest)],
            check=True, capture_output=True,
        )
        web_paths.append(f"assets/images/{slug}/{dest_name}")
    return web_paths


def build_article_html(meta, sections, images):
    hero_img = images[0]
    remaining = images[1:]

    blocks = []
    for idx, (heading, paragraphs) in enumerate(sections):
        inner = ""
        if heading:
            inner += f"    <h2>{heading}</h2>\n"
        for p_idx, para in enumerate(paragraphs):
            cls = ' class="lead"' if idx == 0 and p_idx == 0 else ""
            inner += f"    <p{cls}>\n      {para}\n    </p>\n"
        blocks.append(f'  <div class="prose">\n{inner}  </div>')

        if remaining:
            img = remaining.pop(0)
            blocks.append(
                f'  <figure class="image-full">\n'
                f'    <img loading="lazy" src="{img}" alt="{meta["title"]}">\n'
                f'  </figure>'
            )

    while remaining:
        chunk, remaining = remaining[:3], remaining[3:]
        if len(chunk) == 1:
            blocks.append(
                f'  <figure class="image-full">\n'
                f'    <img loading="lazy" src="{chunk[0]}" alt="{meta["title"]}">\n'
                f'  </figure>'
            )
        elif len(chunk) == 2:
            imgs = "\n".join(f'    <img loading="lazy" src="{i}" alt="{meta["title"]}">' for i in chunk)
            blocks.append(f'  <div class="image-pair">\n{imgs}\n  </div>')
        else:
            imgs = "\n".join(f'    <img loading="lazy" src="{i}" alt="{meta["title"]}">' for i in chunk)
            blocks.append(f'  <div class="image-triptych">\n{imgs}\n  </div>')

    body_html = "\n\n".join(blocks)

    return f"""<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{meta['title']} — Wanderlines</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>

<nav class="nav">
  <a href="index.html" class="nav-brand">Wanderlines</a>
  <ul class="nav-links">
    <li><a href="index.html">Home</a></li>
    <li><a href="trips.html">Trips</a></li>
    <li><a href="map.html">Map</a></li>
    <li><a href="about.html">About</a></li>
    <li><button class="theme-toggle" aria-label="Toggle theme">☾</button></li>
  </ul>
</nav>

<div class="article-hero">
  <img src="{hero_img}" alt="{meta['title']}">
</div>

<header class="article-header">
  <div class="article-eyebrow">Journal</div>
  <h1 class="article-title">{meta['title']}</h1>
  <div class="article-meta">
    <span>{meta['location']}</span>
    <span>{meta['date']}</span>
  </div>
</header>

<article class="article-body">

{body_html}

</article>

<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">Wanderlines</div>
    <ul class="footer-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="trips.html">Trips</a></li>
      <li><a href="map.html">Map</a></li>
      <li><a href="about.html">About</a></li>
    </ul>
    <div class="footer-copy">© 2026 Wanderlines</div>
  </div>
</footer>

<script src="script.js"></script>
</body>
</html>
"""


def trip_card_html(meta, filename, card_image):
    return (
        f'    <a href="{filename}" class="trip-card">\n'
        f'      <div class="trip-card-image">\n'
        f'        <img loading="lazy" src="{card_image}" alt="{meta["title"]}">\n'
        f'      </div>\n'
        f'      <div class="trip-card-meta">{meta["country_name"]} · {meta["date"]}</div>\n'
        f'      <h3 class="trip-card-title">{meta["title"]}</h3>\n'
        f'      <p class="trip-card-subtitle">{meta["subtitle"]}</p>\n'
        f'    </a>'
    )


def remove_trip_card(path, filename):
    """Remove a <a ... class="trip-card"> block linking to filename, if present."""
    html = path.read_text(encoding="utf-8")
    pattern = re.compile(
        rf'\s*<a href="{re.escape(filename)}" class="trip-card">.*?</a>', re.DOTALL
    )
    new_html, n = pattern.subn("", html, count=1)
    if n:
        path.write_text(new_html, encoding="utf-8")
    return bool(n)


def remove_from_map(filename):
    """Remove any visitedCountries entry pointing at filename, dropping the
    country key entirely if it has no entries left."""
    path = REPO / "map.html"
    html = path.read_text(encoding="utf-8")
    original = html

    entry_pattern = re.compile(
        r'\s*\{\s*title:\s*"(?:[^"\\]|\\.)*",\s*meta:\s*"(?:[^"\\]|\\.)*",\s*'
        rf'url:\s*"{re.escape(filename)}"\s*\}}\s*,?'
    )
    html = entry_pattern.sub("", html)

    empty_block_pattern = re.compile(r'\s*"[A-Z]{3}":\s*\[\s*\],?')
    html = empty_block_pattern.sub("", html)

    # Guard against a dangling comma if the removed entry was the last one.
    html = re.sub(r",(\s*)\};", r"\1};", html)

    if html != original:
        path.write_text(html, encoding="utf-8")
        return True
    return False


def remove_existing_post(filename, slug):
    """Undo a previous publish of this same trip (same slug) before
    republishing, so re-running the script never duplicates a post."""
    found = False

    post_path = REPO / filename
    if post_path.exists():
        post_path.unlink()
        found = True

    img_dir = REPO / "assets" / "images" / slug
    if img_dir.exists():
        shutil.rmtree(img_dir)
        found = True

    found |= remove_trip_card(REPO / "trips.html", filename)
    found |= remove_trip_card(REPO / "index.html", filename)
    found |= remove_from_map(filename)

    return found


def update_trips_html(meta, filename, card_image):
    path = REPO / "trips.html"
    html = path.read_text(encoding="utf-8")
    card = trip_card_html(meta, filename, card_image)
    marker = '<div class="trip-grid">\n'
    idx = html.index(marker) + len(marker)
    html = html[:idx] + card + "\n\n" + html[idx:]
    path.write_text(html, encoding="utf-8")


def update_map_html(meta, filename):
    path = REPO / "map.html"
    html = path.read_text(encoding="utf-8")
    code = meta["country_code"].upper()
    entry = f'      {{ title: "{meta["title"]}", meta: "{meta["date"]}", url: "{filename}" }}'

    key_pattern = re.compile(rf'"{code}"\s*:\s*\[(.*?)\]', re.DOTALL)
    m = key_pattern.search(html)
    if m:
        inner = m.group(1).rstrip()
        new_inner = inner + ",\n" + entry + "\n    "
        html = html[:m.start(1)] + new_inner + html[m.end(1):]
    else:
        close_pattern = re.compile(r"\n(\s*)\};\s*\n\s*const STYLE_VISITED")
        cm = close_pattern.search(html)
        if not cm:
            sys.exit("Error: could not find visitedCountries block in map.html")
        key_indent = cm.group(1) + "  "
        insertion = f',\n{key_indent}"{code}": [\n{entry}\n{key_indent}]'
        pos = cm.start(1) - 1
        html = html[:pos] + insertion + html[pos:]

    path.write_text(html, encoding="utf-8")


def update_index_html(meta, filename, hero_image, card_image):
    path = REPO / "index.html"
    html = path.read_text(encoding="utf-8")

    hero_pattern = re.compile(
        r'<a href="[^"]+" class="hero-link">\s*'
        r'<section class="hero">.*?</section>\s*</a>',
        re.DOTALL,
    )
    hero_match = hero_pattern.search(html)
    if not hero_match:
        print("Warning: could not find homepage hero block, skipping index.html update.")
        return

    new_hero = (
        f'<a href="{filename}" class="hero-link">\n'
        f'<section class="hero">\n'
        f'  <img class="hero-image" src="{hero_image}" alt="{meta["title"]}">\n'
        f'  <div class="hero-overlay"></div>\n'
        f'  <div class="hero-content">\n'
        f'    <div class="hero-eyebrow">Latest Story</div>\n'
        f'    <h1 class="hero-title">{meta["title"]}</h1>\n'
        f'    <p class="hero-subtitle">{meta["subtitle"]}</p>\n'
        f'  </div>\n'
        f'</section>\n'
        f'</a>'
    )
    html = html[:hero_match.start()] + new_hero + html[hero_match.end():]

    # The featured grid's closing </div> is immediately followed by </section> —
    # a unique anchor, unlike a bare </div> which would match a nested card div.
    grid_pattern = re.compile(
        r'(<div class="trip-grid featured">\n)(.*?)(\n\s*</div>\n</section>)',
        re.DOTALL,
    )
    grid_match = grid_pattern.search(html)
    if not grid_match:
        print("Warning: could not find featured trip grid, skipping card update.")
        path.write_text(html, encoding="utf-8")
        return

    new_card = "    " + trip_card_html(meta, filename, card_image)
    grid_body = new_card + "\n\n" + grid_match.group(2)

    card_pattern = re.compile(r'\s*<a href="[^"]+" class="trip-card">.*?</a>', re.DOTALL)
    cards = card_pattern.findall(grid_body)
    if len(cards) > MAX_HOMEPAGE_CARDS:
        grid_body = "".join(cards[:MAX_HOMEPAGE_CARDS])

    new_grid = grid_match.group(1) + grid_body + grid_match.group(3)
    html = html[:grid_match.start()] + new_grid + html[grid_match.end():]
    path.write_text(html, encoding="utf-8")


def git_commit_and_push(meta, push=True):
    subprocess.run(["git", "add", "-A"], cwd=REPO, check=True)
    status = subprocess.run(["git", "status", "--porcelain"], cwd=REPO, capture_output=True, text=True)
    if not status.stdout.strip():
        print("Nothing to commit.")
        return
    msg = f"Add trip: {meta['title']}"
    subprocess.run(["git", "commit", "-m", msg], cwd=REPO, check=True)
    print(f"Committed: {msg}")
    if push:
        subprocess.run(["git", "push", "origin", "main"], cwd=REPO, check=True)
        print("Pushed to origin/main.")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    flags = {a for a in sys.argv[1:] if a.startswith("--")}
    if not args:
        sys.exit("Usage: python3 scripts/publish_trip.py /path/to/trip-folder [--no-push] [--no-homepage]")

    trip_folder = Path(args[0]).expanduser().resolve()
    if not trip_folder.is_dir():
        sys.exit(f"Error: {trip_folder} is not a folder.")

    txt_files = list(trip_folder.glob("*.txt"))
    if len(txt_files) != 1:
        sys.exit(f"Error: expected exactly one .txt file in {trip_folder}, found {len(txt_files)}.")

    photo_paths = sorted(
        p for p in trip_folder.iterdir() if p.suffix.lower() in IMAGE_EXTS
    )
    if not photo_paths:
        sys.exit(f"Error: no photos found in {trip_folder}.")

    meta, body = parse_trip_file(txt_files[0])
    sections = parse_body(body)
    slug = slugify(meta["title"])
    filename = f"post-{slug}.html"

    if remove_existing_post(filename, slug):
        print(f"Existing publish of '{meta['title']}' found — replacing it.")

    print(f"Processing {len(photo_paths)} photo(s) for '{meta['title']}'...")
    images = process_images(photo_paths, slug)

    print("Generating article page...")
    article_html = build_article_html(meta, sections, list(images))
    (REPO / filename).write_text(article_html, encoding="utf-8")

    print("Updating trips.html...")
    card_image = images[1] if len(images) > 1 else images[0]
    update_trips_html(meta, filename, card_image)

    print("Updating map.html...")
    update_map_html(meta, filename)

    if "--no-homepage" not in flags:
        print("Updating index.html...")
        update_index_html(meta, filename, images[0], card_image)

    git_commit_and_push(meta, push="--no-push" not in flags)

    print(f"\nDone: {filename}")


if __name__ == "__main__":
    main()
