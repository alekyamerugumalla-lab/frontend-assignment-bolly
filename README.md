Live Demo:
https://alekyamerugumalla-lab.github.io/frontend-assignment-bolly/
# bolly — Frontend Development Assignment

A recreation of the "Bolly" shampoo landing page with a genuine interactive
3D product (built with Three.js, not a flip/carousel trick) that rotates on
mouse drag (desktop) and touch drag (mobile).

## What's in here

```
index.html        structure
css/style.css     all styling, responsive down to 320px
js/bottle.js      the 3D bottle — Three.js scene, lighting, drag-to-rotate
js/main.js        small nav/cart interactions
```

Open `index.html` directly in a browser to preview (it loads Three.js and
Google Fonts from CDN, so you need an internet connection).

## Why this approach for the 3D part

There's no source 3D model of the bottle, so instead of faking rotation with
a sprite-swap, the bottle is modeled procedurally in Three.js (cylinder body,
tapered shoulder, pump head, nozzle) with a canvas-drawn label texture
("bolly" / "Clarify shampoo") wrapped onto it. That means the rotation is
real 3D geometry with lighting that changes as you turn it — closer to what
the brief is asking for than a pre-rendered image trick, and it's honest
about being a stand-in for a proper scanned/sculpted asset if the team has
one later.

Drag behavior:
- **Desktop:** mousedown + drag rotates the bottle; releases keep a gentle
  idle spin.
- **Mobile:** one-finger touch + drag does the same; `touch-action: none`
  and `preventDefault` on touchmove stop the page from scrolling while you're
  mid-rotation.

## Integrating into WordPress + Elementor

1. **Pages → Add New**, or edit the page you're building the landing page on.
2. Add an **Elementor "HTML" widget** for the hero section (drag it into a
   full-width section with no padding).
3. Paste the contents of `index.html`'s `<body>` (from `<div class="hero">`
   down through the `</footer>`) into the HTML widget.
4. Go to **Elementor → Site Settings → Custom CSS** (or the page's Advanced →
   Custom CSS panel) and paste in `css/style.css`.
5. For the JS: **Elementor → Custom Code** (Elementor Pro) or a lightweight
   plugin like *Insert Headers and Footers*, and add, in this order:
   - the Three.js CDN `<script>` tag from `index.html`'s `<head>`
   - `js/bottle.js`
   - `js/main.js`
   Load these in the footer so the canvas element exists before the script
   runs.
6. Preview at desktop, tablet, and 320px mobile widths in Elementor's
   responsive preview to confirm no overlap or horizontal scroll.

If your plan doesn't have Elementor Pro's Custom Code panel, the HTML widget
alone can hold inline `<style>` and `<script>` tags too — just wrap the CSS
in `<style>...</style>` and the JS in `<script>...</script>` inside the same
widget instead of using Site Settings.

