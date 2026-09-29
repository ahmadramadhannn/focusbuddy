# DeskToy & Focus Buddy — Kotlin Multiplatform Desktop Companion

A transparent, always-on-top desktop overlay fidget and focus accountability companion built with **Kotlin Multiplatform** and **Compose Multiplatform for Desktop**.

## 🚀 Key Desktop Features & Modes
- **Dual Display Modes (Work vs Break)**:
  - 🟢 **Work Mode (Compact Desk Pet)**: Runs as a compact, draggable floating widget (`330x390dp`) in the bottom-right corner of your screen. **Your entire screen, IDE, browser, and terminal remain 100% clickable and unblocked!**
  - 💥 **Stress Relief Mode (Full-Screen Break)**: Need to vent stress? Click *"💥 Stress Relief"* to expand full-screen. Punch the screen, spray paint, or sweep with the broom. Press `Esc` or click *"💻 Back to Work"* at any time to return to your work!
- **Interactive Desk Cat**: Roams and sits by your side, displays focus thoughts, and has a dedicated "🐾 Pet Cat" action with live pet counter.
- **Focus Coach Drone**: Periodic non-judgmental reminders to stay off YouTube and keep shipping code.
- **Procedural Screen Puncher & Shatter**: Shatter your screen with realistic procedural glass fractures.
- **Sapu (Broom) Wiper**: Clean up cracks and paint splatters.
- **Paint Cannon & Laser Pointer**: Interactive splatter physics and laser dot for the cat to chase.

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
