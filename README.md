# QR-Gen

A clean, modern QR code generator built with vanilla HTML, CSS, and JavaScript. Generate QR codes for any URL or UPI payment — no frameworks, no dependencies, no bloat.

![Dark Theme](https://img.shields.io/badge/theme-dark-0c0c10?style=flat-square)
![Vanilla JS](https://img.shields.io/badge/vanilla-JS-f7df1e?style=flat-square)
![Deploy](https://img.shields.io/badge/deploy-Vercel-000?style=flat-square)

## Features

### 🔗 Link → QR
- Paste **any URL** — websites, Google Drive, YouTube, social media links
- Add an optional label for context
- Download as PNG or copy the link

### 💳 UPI QR
- Generate payment QR codes with UPI ID and payee name
- **Fixed or any amount** toggle
- **Expiration date** with no-expiry option
- Transaction note support
- Download QR or copy the `upi://pay` deep link

### 🎨 Design
- Premium dark theme with glassmorphism and ambient glow effects
- Smooth micro-animations and transitions
- Fully responsive — works on mobile and desktop
- Custom toggle switches, styled inputs, toast notifications

## Tech Stack

| Layer | Tech |
|-------|------|
| Structure | HTML5 |
| Styling | Vanilla CSS (custom properties, animations) |
| Logic | Vanilla JavaScript (ES6+) |
| QR Engine | [qrcode.js](https://github.com/davidshimjs/qrcodejs) via CDN |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/kacf/qr-generator.git
cd qr-gen

# Open in browser
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

No build step. No `npm install`. Just open the file.

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The included `vercel.json` handles static file serving automatically.

## Project Structure

```
qr-gen/
├── index.html      # Page structure and layout
├── style.css       # Dark theme, animations, responsive design
├── app.js          # QR generation, validation, UI logic
├── vercel.json     # Vercel deployment config
├── package.json    # Project metadata
└── README.md
```

## License

MIT
