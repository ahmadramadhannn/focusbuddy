# DeskToy & Focus Buddy — Kotlin Multiplatform Desktop Companion

A transparent, always-on-top desktop overlay fidget and focus accountability companion built with **Kotlin Multiplatform** and **Compose Multiplatform for Desktop**.

## 🚀 Live On-Screen Desktop Companion Architecture
- **🐾 Live Cutout Cat (Zero Screen Blocking)**:
  - The cat lives **directly on your screen** (not inside a window/box/widget), smoothly roaming across the bottom of your desktop, sitting, loafing, and sleeping directly on top of your wallpaper and windows.
  - Sized strictly to the cat silhouette with 100% transparency. **The rest of your entire screen has NO window over it**, so you can click, type, and code in VS Code, terminal, and browser without interruption.
  - **Petting**: Click directly on the cat to pet it! Emits hearts (`💖`), purrs, and increments the pet counter.
  - **Draggable**: Drag the cat to place it anywhere on any monitor.
- **⌨️ Intuitive Shortcuts & Right-Click Context Menu**:
  - `[1]` / `[Esc]`: Return to unblocked Cat/Work mode
  - `[2]`: 🥊 Punch screen
  - `[3]`: 🧹 Broom clean
  - `[4]`: 🎨 Paint cannon
  - `[5]`: 💧 Water gun
  - `[P]`: 🐾 Pet cat
  - `[C]`: 🔄 Cycle cat pose
  - `[Q]`: ❌ Quit companion
  - *Right-Click on the cat*: opens quick desktop context menu.

## 📁 Recommended Kotlin Multiplatform Project Structure
Following the [official JetBrains Kotlin Multiplatform Project Structure](https://kotlinlang.org/docs/multiplatform/multiplatform-project-recommended-structure.html):

```
desktop-kmp/composeApp/src/
├── commonMain/kotlin/com/desktoy/focusbuddy/
│   ├── model/
│   │   ├── CatBehavior.kt       # Enum for cat poses & states
│   │   ├── DesktopTool.kt       # Enum for fidget tools
│   │   └── ScreenEffects.kt     # Fracture, paint & water data models and factory
│   ├── state/
│   │   └── DeskToyAppState.kt   # Observable state holder & simulation loop
│   ├── ui/
│   │   ├── cat/
│   │   │   ├── LiveDeskCatContent.kt       # On-screen cat, thought bubble & context menu
│   │   │   └── LowPolyCatGeometricCanvas.kt # Geometric fallback renderer
│   │   ├── overlay/
│   │   │   ├── EffectRenderers.kt          # Canvas draw routines for cracks, drips, splashes
│   │   │   └── FullScreenActionOverlayContent.kt # Full-screen interaction canvas & top bar
│   │   └── theme/
│   │       └── DeskToyColors.kt  # Palette constants
│   └── util/
│       └── CatImageLoader.kt     # Multi-path resource & texture loader with caching
└── desktopMain/
    ├── kotlin/com/desktoy/focusbuddy/
    │   └── Main.kt               # Desktop window lifecycle & global key dispatch
    └── resources/images/
        ├── cat_lowpoly_left.png  # Poly Pizza 3D model asset (facing left)
        └── cat_lowpoly_right.png # Poly Pizza 3D model asset (facing right)
```

## 🛠️ How to Build and Run

### Prerequisites
- JDK 17 or higher (Oracle JDK, Eclipse Temurin, or Amazon Corretto)
- Gradle Wrapper included (`gradlew` / `gradlew.bat`)

### Running in Development
```bash
# macOS / Linux
./gradlew :composeApp:run

# Windows (Command Prompt or PowerShell)
.\gradlew.bat :composeApp:run
```

### Packaging Native Installers
- **macOS DMG**:
  ```bash
  ./gradlew :composeApp:packageDmg
  ```
- **Windows MSI / EXE**:
  ```bash
  ./gradlew :composeApp:packageMsi
  ```
- **Linux Deb / RPM**:
  ```bash
  ./gradlew :composeApp:packageDeb
  ```
The generated installers will be located in `composeApp/build/compose/binaries/main/`.
