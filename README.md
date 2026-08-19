# 🌌 space

A lightweight, high-performance JavaScript/TypeScript toolkit designed to bring space exploration, high-precision astrophysics solvers, and real-time celestial telemetry directly to the web.

---

## ⭐ Support the Universe

If you find this open-source cosmic toolkit useful or if it inspires your projects, please take a moment to **give us a Star (⭐) on GitHub!** It keeps the celestial development alive and helps others discover this codebase.

---

## 🏗️ System Architecture

The engine is built on top of a highly decoupled, modular **Monorepo (Workspace) Architecture**. This ensures a strict **"Pay-as-you-go"** execution lifecycle: computing or loading heavy celestial elements doesn't impact your bundle footprint unless explicitly imported (Full Tree-Shaking capabilities).

```text
                               +-----------------------+

                               |     @space/core       |  <--- Main Orchestrator
                               +-----------+-----------+
                                           |
                    +----------------------+----------------------+

                    |                      |                      |
          +---------+---------+  +---------+---------+  +---------+---------+

          |  @space/database  |  |   @space/physics  |  |   @space/render   |
          +-------------------+  +-------------------+  +-------------------+

          | Static Cosmos     |  | Kepler Equations  |  | Logarithmic Cam   |
          | Micro to Macro    |  | Einstein Relativity| | 60+ FPS Starfield |
          +-------------------+  +-------------------+  +-------------------+
                                           ^
                                           |
                                 +---------+---------+

                                 |  @space/telemetry |  <--- Live NASA JPL Data
                                 +-------------------+
```

---

## 🚀 Key Features

* **🔬 Subatomic to Cosmic Scales:** Native architecture designed using custom logarithmic scaling engines to seamlessly visualize elements spanning from quarks (10⁻¹⁸m) up to the observable universe boundaries (10²⁶m) without screen-space precision jittering.
* **🧮 High-Precision Physics Solvers:** Built-in core computations executing Kepler's orbital parameters utilizing Newton-Raphson iteration methods alongside Schwarzschild gravitational time dilation equations based on Einstein's General Relativity.
* **🎨 60+ FPS Rendering Pipeline:** Pure hardware-accelerated Canvas layer optimization delivering smooth background starfields without the memory overhead of bulky third-party 3D engine wrappers.
* **📡 Real-Time NASA Streams:** Integrated clients syncing dynamic, immediate close-approach telemetry data directly from NASA's JPL neo-object servers.

---

## 📦 Repository Structure

```text
space/
├── packages/
│   ├── core/       # Global manager orchestration & scaling engines
│   ├── database/   # Universal static archives (Subatomic scales up to Galaxies)
│   ├── physics/    # Core astrodynamics equations and relativistic time solvers
│   ├── render/     # Hardware-accelerated canvas backdrops & cameras
│   └── telemetry/  # Real-time remote data synchronization pipelines (NASA JPL)
├── index.html      # Local interactive sandbox application
└── vite.config.ts  # Micro-bundle builds & path mappings
```

---

## 🛠️ Getting Started in GitHub Codespaces

Since the project uses automated environment containers, boot pipelines are completely synchronized:

1. Click on the green **"<> Code"** button on GitHub, switch to the **Codespaces** tab, and select **"Create codespace on main"**.
2. Once inside the cloud terminal, boot the pipeline via:
   ```bash
   pnpm dev
   ```
3. Open the forwarded port or your browser at `http://localhost:3000` to interact with the universe.

To bundle production distribution files, execute:
```bash
pnpm build
```

---

## 🕹️ Quick Usage Example

```typescript
import { SpaceEngine } from '@space/core';

// Initialize the universal simulation sandbox on a standard canvas
const engine = new SpaceEngine({
  canvasElement: document.getElementById('space-viewport'),
  enableLiveTelemetry: true // Streams actual NASA asteroid telemetry feeds automatically
});

// Trigger the rendering and astrophysics core loops at 60Hz natively
engine.start();

// Effortlessly drop the logarithmic view tracking down to atomic scales instantly
engine.getCamera().zoomTo(-15); // Zooms directly to Proton scale (10^-15 meters)
```

---

## 👤 Author

Developed and maintained with absolute cosmic precision by **Yağız Yağlı/[@yagizyagli](https://github.com/yagizyagli)**.
**Live Demo** [@space](https://yagizyagli.github.io/space/)
---

## 🤝 Contributing

We welcome cosmic developers! Feel free to review the layout structure, open issues regarding physical anomalies, or submit pull requests containing missing deep-space catalogs.

## 📝 License
MIT License
