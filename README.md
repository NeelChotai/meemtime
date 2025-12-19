# meemtime

A PWA interval timer for dog training. Helps build duration on "stay" commands with progressive intervals and randomized variance.

## Features

- **Progressive intervals**: Each round adds time to the previous target
- **Upward variance**: 0-20% random variance keeps training unpredictable
- **Fail recovery**: Resets to last successful duration, then continues
- **Pause support**: Pause mid-round and resume from the same point
- **Session tracking**: Round history, session timer, next target preview
- **Offline support**: Works without internet after first load
- **Mobile-first**: Designed for use during training sessions

## Usage

1. Set your baseline duration (starting stay time)
2. Set your interval increment (how much to add each round)
3. Press "Start Training"
4. Timer counts down - when it hits zero, the next round starts automatically
5. Press "Pause" to temporarily stop (resumes from same point)
6. Press "Fail" if the dog breaks, then "Resume" to restart at the last successful duration

## Development

```bash
npm install
npm test
```

## Deployment

Static files - deploy to any static host. For GitHub Pages, enable Pages in repo settings and point to the root directory.

Files needed for production:
- `index.html`
- `css/styles.css`
- `js/app.js`
- `js/timer-logic.js`
- `manifest.json`
- `sw.js`
- `icons/icon-192.png`
- `icons/icon-512.png`
