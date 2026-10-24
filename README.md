# Somil Jain — Portfolio

A responsive, explorable WebGL portfolio inspired by the interactive 3D world in the supplied Facebook reference. Visitors can rotate and zoom the town, move Somil's character between buildings, and open portfolio content at each destination.

## Run locally

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:4173`. The port is fixed so this project cannot silently move to another address.

## Verify

```sh
npm test
npm run lint
npm run build
```

The production-ready static output is written to `dist/`. Three.js powers the procedural 3D world and Vite creates the optimized browser bundle.
