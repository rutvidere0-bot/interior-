# MAISON ÉLAN — website

Static 5-page site (no build step). Open `index.html` via any static host.

## 1. Before going live (required)
Edit **`js/config.js`** only:
- `phoneNumber` — your 10-digit mobile (digits only). Drives every Call Now / WhatsApp / footer / floating button.
- `formEndpoint` — URL of a real form service (e.g. Formspree `https://formspree.io/f/xxxx`; for Web3Forms add `formExtraFields: { access_key: "…" }`). Until set, the form validates but honestly reports it did NOT send.
- `email` — replace the placeholder `hello@maisonelan.example`.
- `social.instagram` / `social.facebook` — real profile URLs (icons are inactive until set).
- `sitemap.xml` and `robots.txt` — replace `https://example.com/maison-elan` with your real URL.

## 2. Deploy
All paths are relative, so it works at a domain root or in a subfolder (e.g. GitHub Pages `user.github.io/repo/`).
Upload the whole folder (≈53 MB, mostly the 300 animation frames) to Netlify, Vercel, Cloudflare Pages, GitHub Pages, etc.

## 3. Animation
`assets/animation/frame_0001.jpg … frame_0300.jpg` (from your two ZIPs, unchanged). Desktop loads all 300; phones/tablets load every 2nd frame (150) to save data. Reduced-motion, Save-Data and ≤2 GB-RAM devices get a static frame (frame_0001) instead.
