# AnimFolio — Free Animated Portfolio Templates

**15 professionally designed, fully animated portfolio websites. Free. Open source. Pure HTML/CSS/JS — no build step, no framework, works offline.**

Pick a design, drop in your details, and host it **free forever** on GitHub Pages. Perfect for students, developers, designers, and anyone who wants a stunning portfolio in an afternoon.

🔴 **Live demos:** https://rahulmahadik.github.io/animfolio-html/
🧩 **Prefer a no-code admin panel?** Get the [WordPress plugin](https://wordpress.org/plugins/animfolio/) — same 15 designs, editable from a dashboard.

![15 templates · 100% free](https://img.shields.io/badge/templates-15-7F77DD) ![license](https://img.shields.io/badge/license-GPL--2.0--or--later-1D9E75) ![no build](https://img.shields.io/badge/build_step-none-blue)

---

## ✨ What you get

- **15 formats × 3 color schemes = 45 ready-to-use pages**
- **Zero dependencies** — no npm, no build, no CDN. Just open `index.html`.
- **Works fully offline** — every font, script, and image is bundled locally.
- **Dark / light toggle**, scroll animations, animated counters, typed text
- **Scannable QR vCard** + **Download vCard** button
- **Working contact form** (via free [FormSubmit.co](https://formsubmit.co) — no server needed)
- **Fully responsive** and accessibility-friendly (respects reduced-motion)

---

## 🎨 The 15 templates

| # | Template | Best for | Live demo |
|---|----------|----------|-----------|
| 01 | **Developer Classic** | Software developers, engineers | [demo](https://rahulmahadik.github.io/animfolio-html/format-01-developer/) |
| 02 | **Designer Showcase** | UI/UX & graphic designers | [demo](https://rahulmahadik.github.io/animfolio-html/format-02-designer/) |
| 03 | **Freelancer Pro** | Freelancers, consultants | [demo](https://rahulmahadik.github.io/animfolio-html/format-03-freelancer/) |
| 04 | **Agency Bold** | Small agencies, studios | [demo](https://rahulmahadik.github.io/animfolio-html/format-04-agency/) |
| 05 | **Photographer Minimal** | Photographers, videographers | [demo](https://rahulmahadik.github.io/animfolio-html/format-05-photographer/) |
| 06 | **Writer Elegant** | Writers, journalists | [demo](https://rahulmahadik.github.io/animfolio-html/format-06-writer/) |
| 07 | **Data Scientist** | Data scientists, researchers | [demo](https://rahulmahadik.github.io/animfolio-html/format-07-data-scientist/) |
| 08 | **Product Manager** | Product & program managers | [demo](https://rahulmahadik.github.io/animfolio-html/format-08-product-manager/) |
| 09 | **Startup Founder** | Founders, entrepreneurs | [demo](https://rahulmahadik.github.io/animfolio-html/format-09-startup-founder/) |
| 10 | **Consultant Executive** | Consultants, advisors | [demo](https://rahulmahadik.github.io/animfolio-html/format-10-consultant/) |
| 11 | **Student Fresh** | Students, recent graduates | [demo](https://rahulmahadik.github.io/animfolio-html/format-11-student/) |
| 12 | **Creative Portfolio** | Creative & art directors | [demo](https://rahulmahadik.github.io/animfolio-html/format-12-creative/) |
| 13 | **Minimalist Zen** | Anyone who loves simplicity | [demo](https://rahulmahadik.github.io/animfolio-html/format-13-minimalist/) |
| 14 | **Gamified Quest** | Game devs, creative technologists | [demo](https://rahulmahadik.github.io/animfolio-html/format-14-gamified/) |
| 15 | **CLI Terminal** | Backend / DevOps / hackers | [demo](https://rahulmahadik.github.io/animfolio-html/format-15-cli-terminal/) |

Each folder contains three color variants: `index.html` (v1), `v2.html`, `v3.html`. Use the **Colors** switcher at the bottom of any demo to preview them.

---

## 🚀 Deploy your own: free in 5 minutes

No servers, no cost, no credit card. Your portfolio will be live at `https://YOUR-USERNAME.github.io/my-portfolio/`.

### Step 1 — Get the template
Download this repo (green **Code** button → **Download ZIP**) and unzip it. Open the folder for the format you like, e.g. `format-01-developer/`.

### Step 2 — Make it yours
Open that folder's `index.html` in any editor (VS Code, Notepad, TextEdit) and change the text to your own — your name, role, projects, etc. See [Editing your content](#-editing-your-content) below. Double-click `index.html` anytime to preview it in your browser.

### Step 3 — Create a GitHub repo
1. On [github.com](https://github.com), click **+** → **New repository**.
2. Name it (e.g. `my-portfolio`), keep it **Public**, click **Create repository**.
3. On the new repo page, click **uploading an existing file** and drag in **the contents** of your format folder (`index.html`, `v2.html`, `v3.html`, and the `assets/` folder). Commit.

> Tip: for a clean address, upload just one format's files to the repo root. If you upload the whole project, your site lives under a subpath instead.

### Step 4 — Turn on GitHub Pages
1. In your repo: **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)**. Click **Save**.
4. Wait ~1 minute, refresh. GitHub shows: *"Your site is live at https://YOUR-USERNAME.github.io/my-portfolio/"*.

**That's it — your portfolio is live and free forever.** 🎉 Edit `index.html`, commit again, and the live site updates automatically.

---

## ✏️ Editing your content

Everything is plain HTML inside `index.html`. No coding experience needed — just find the demo text and replace it with yours. Common things to change:

- **Your name & title** — search for the demo name (e.g. `Daniel Mercer`) and the role under it; replace both.
- **Hero intro / typed text** — the sentence under your title.
- **About** — your bio paragraph and the "fun facts" list.
- **Experience / Education** — each job or school is a block; edit the company, role, dates, and description.
- **Projects** — title, description, tech tags, and the **Live / Source** links. To change a project image, drop your image into `assets/images/` and update the `<img src="...">`.
- **Skills** — the skill names and percentages.
- **Social links** — the hero icons point to `https://github.com/yourusername`, `https://linkedin.com/in/yourusername`, etc. Replace `yourusername` with your handles.
- **Contact email** — see [Contact form setup](#-contact-form-setup) below.

**Workflow:** edit → save → double-click `index.html` to preview → happy? commit/push. If something looks off, undo your last change; the layout is driven by CSS classes, so keep the tags and classes intact and only change the text between them.

---

## 🌈 Changing colors

Each template ships with **3 curated color schemes**. Two ways to use them:

**A) Just pick a variant.** Open `index.html`, `v2.html`, or `v3.html` — each is the same portfolio in a different scheme. Use whichever you like as your main page.

**B) Set your own accent.** Near the top of `<head>` there's a block like:

```html
<style id="animfolio-theme-vars">
.animfolio-container {
  --animfolio-accent: #7F77DD !important;      /* main brand color  */
  --animfolio-secondary: #1D9E75 !important;   /* second accent     */
  ...
}
</style>
```

Change `--animfolio-accent` and `--animfolio-secondary` to any hex colors you want — buttons, links, highlights, and hovers all follow those two variables. Prefer light or dark? Click the **sun/moon toggle** in the top-right of any page; it remembers your choice.

> The floating **Colors** bar at the bottom of each demo is just a preview aid. To remove it from your final site, delete the `<div aria-label="Color scheme preview ...">…</div>` block near the end of `index.html`.

---

## 📬 Contact form setup

The contact form sends messages straight to your inbox using the free [FormSubmit.co](https://formsubmit.co) service — **no backend, no signup.**

1. In `index.html`, find this line near the top of `<body>` and set your email:
   ```html
   <script>window.ANIMFOLIO_CONTACT_EMAIL = "you@example.com";</script>
   ```
2. Open the page and **send one test message**. FormSubmit emails you a one-time **confirmation link**.
3. **Click that link once.** After that, every message from your form lands in your inbox. Done.

Until you set your email, the form politely shows a "set your email" note instead of sending.

---

## 📁 Folder structure

```
animfolio-html/
├── index.html                 ← the gallery (links all 15)
├── format-01-developer/
│   ├── index.html             ← color scheme 1 (edit this one)
│   ├── v2.html                ← color scheme 2
│   ├── v3.html                ← color scheme 3
│   └── assets/                ← css, js, fonts, images, contact.vcf (self-contained)
├── format-02-designer/
│   └── ... (same layout)
└── ... 15 formats total
```

Every format folder is **fully self-contained** — you can copy just one folder and it works on its own.

---

## 🧩 Want a no-code admin panel instead?

If you'd rather manage your portfolio from a dashboard (drag-and-drop sections, 1-click demo import, fill it with AI) install the free **[AnimFolio WordPress plugin](https://wordpress.org/plugins/animfolio/)** — it powers these exact 15 designs.

---

## 🙏 Credits & license

- **License:** GPL-2.0-or-later — free to use, modify, and share (personal or commercial).
- Bundled fonts: [Inter](https://rsms.me/inter/) & [JetBrains Mono](https://www.jetbrains.com/lp/mono/) (SIL OFL 1.1). QR generation: [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT).
- Built by **[Rahul Mahadik](https://rahulmahadik.com)**. Demo names, photos, and projects are fictional — replace them with your own.

⭐ If this helped you ship a portfolio, star the repo and share it with a friend who needs one.
