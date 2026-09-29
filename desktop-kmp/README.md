# DeskToy & Focus Buddy — Kotlin Multiplatform Desktop Companion

A transparent, always-on-top desktop overlay fidget and focus accountability companion built with **Kotlin Multiplatform** and **Compose Multiplatform for Desktop**.

## 🚀 Live On-Screen Desktop Companion Architecture
- **🐾 Live Cutout Cat (Zero Screen Blocking)**:
  - The cat lives **directly on your screen** (not inside a window/box/widget), smoothly roaming across the bottom of your desktop, sitting, loafing, and sleeping directly on top of your wallpaper and windows.
  - Sized strictly to the cat silhouette with 100% transparency. **The rest of your entire screen has NO window over it**, so you can click, type, and code in VS Code, terminal, and browser without interruption.
  - **Petting**: Click directly on the cat to pet it! Emits hearts (`💖`), purrs, and increments the pet counter.
  - **Draggable**: Drag the cat to place it anywhere on any monitor.
- **⚡ On-Demand Full-Screen Action Tools (Punch, Broom, Paint, Water)**:
  - Whenever you want to fidget or smash the screen, press a shortcut key or click the tool button on the cat's mini toolbar:
    - **`[1]` or `[Esc]`**: **Cat / Work Mode** (closes action overlay; whole screen unblocked)
    - **`[2]`**: **🥊 Punch / Shatter Screen** (procedural glass fracture physics)
    - **`[3]`**: **🧹 Sapu (Broom)** (click and drag to clean cracks and paint)
    - **`[4]`**: **🎨 Paint Cannon** (acrylic paint splatters with gravity drips)
    - **`[5]`**: **💧 Water Gun** (water splash ripples)
  - Pressing `Esc` or `1` immediately returns you to normal work with the Cat continuing its live roaming!

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
