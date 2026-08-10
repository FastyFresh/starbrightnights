# Starbright Chat Integration Guide

## Overview
Starbright Chat is an AI-powered chat widget featuring Starbright Monroe, a 19-year-old persona. This document provides everything needed to integrate the chat into starbrightnights.com.

---

## Production URLs

| URL | Purpose |
|-----|---------|
| `https://starbright-live.replit.app/dm` | Main chat interface |
| `https://starbright-live.replit.app` | Root (redirects to /dm) |
| `https://starbright-live.replit.app/admin` | Admin dashboard (password: starbright2026) |

---

## Integration Methods

### Option 1: Iframe Embed (Recommended)

Embed the chat directly into a page:

```html
<iframe 
  src="https://starbright-live.replit.app/dm" 
  width="100%" 
  height="600" 
  frameborder="0"
  allow="clipboard-write"
  style="border-radius: 12px; min-height: 500px;">
</iframe>
```

For a fixed-size container:
```html
<div style="width: 400px; height: 700px; margin: 0 auto;">
  <iframe 
    src="https://starbright-live.replit.app/dm" 
    width="100%" 
    height="100%" 
    frameborder="0"
    style="border-radius: 12px;">
  </iframe>
</div>
```

### Option 2: Popup Window

Open chat in a popup window:

```javascript
function openStarbrightChat() {
  window.open(
    'https://starbright-live.replit.app/dm', 
    'Starbright Chat', 
    'width=420,height=700,scrollbars=no,resizable=yes'
  );
}
```

```html
<button onclick="openStarbrightChat()">Chat with Starbright</button>
```

### Option 3: Floating Chat Button

A floating button that opens the chat:

```html
<style>
.starbright-chat-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff69b4, #ff1493);
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.4);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.starbright-chat-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(255, 105, 180, 0.6);
}
</style>

<button class="starbright-chat-btn" onclick="openStarbrightChat()">
  💬
</button>

<script>
function openStarbrightChat() {
  window.open(
    'https://starbright-live.replit.app/dm', 
    'Starbright Chat', 
    'width=420,height=700'
  );
}
</script>
```

### Option 4: Slide-in Panel

A chat panel that slides in from the side:

```html
<style>
.chat-overlay {
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  z-index: 10000;
  box-shadow: -5px 0 25px rgba(0,0,0,0.3);
}
.chat-overlay.open {
  display: block;
  animation: slideIn 0.3s ease;
}
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
.chat-close-btn {
  position: absolute;
  top: 10px;
  left: -40px;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #333;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 20px;
}
</style>

<div id="chatOverlay" class="chat-overlay">
  <button class="chat-close-btn" onclick="toggleChat()">×</button>
  <iframe 
    src="https://starbright-live.replit.app/dm" 
    width="100%" 
    height="100%" 
    frameborder="0">
  </iframe>
</div>

<button onclick="toggleChat()">Chat with Starbright</button>

<script>
function toggleChat() {
  document.getElementById('chatOverlay').classList.toggle('open');
}
</script>
```

---

## Styling Information

The chat uses a dark theme that works well with dark websites:

| Property | Value |
|----------|-------|
| Background | #0a0a0a (near black) |
| Accent Color | #ff69b4 (hot pink) |
| Text Color | #ffffff (white) |
| Border Radius | 12px |

### Recommended Container Sizes
- **Minimum width:** 320px
- **Recommended width:** 380-420px
- **Minimum height:** 500px
- **Recommended height:** 600-700px

---

## Features

- **Age Verification:** Users must confirm 18+ before chatting
- **Free Tier:** 20 messages per session
- **Subscription Tiers:** Companion (500 msgs) and VIP (unlimited)
- **Session Persistence:** Conversations persist via cookies
- **Mobile Responsive:** Works on all screen sizes
- **Stripe Integration:** Built-in payment for upgrades

---

## CORS & Embedding

The chat server is configured to allow embedding from:
- `https://starbrightnights.com`
- `https://www.starbrightnights.com`
- `https://*.replit.app`
- `https://*.replit.dev`

If you need to embed from a different domain, contact the Starbright Chat admin.

---

## Testing

1. Open `https://starbright-live.replit.app/dm` directly to verify it's working
2. Test the embed on your staging environment
3. Verify age gate appears on first visit
4. Send a test message to confirm AI responses work

---

## Admin Dashboard

Access analytics and user data:
- **URL:** `https://starbright-live.replit.app/admin`
- **Password:** `starbright2026`

---

## Troubleshooting

**Chat not loading in iframe:**
- Check browser console for Content-Security-Policy errors
- Ensure your domain is in the allowed list

**Chat appears but no responses:**
- The AI API may be temporarily down
- Check the admin dashboard for error logs

**Styling conflicts:**
- The iframe is self-contained and shouldn't conflict with parent styles
- Use a wrapper div to control sizing

---

## Contact

For technical issues with the chat system, update this Replit project or contact the developer.
