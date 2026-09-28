# DeskToy & Focus Buddy — Kotlin Multiplatform Desktop Companion

A transparent, always-on-top desktop overlay fidget and focus accountability companion built with **Kotlin Multiplatform** and **Compose Multiplatform for Desktop**.

## 🚀 Key Desktop Features
- **Transparent Desktop Overlay**: Runs on top of all native windows (VS Code, Chrome, YouTube, Games, Discord).
- **Procedural Screen Puncher & Shatter**: Click anywhere to shatter your monitor with ray-tracing glass fractures.
- **Sapu (Broom) & Mop Wiper**: Clean up cracks, water droplets, and paint splatters.
- **Paint & Water Gun**: Acrylic splatter with physics drips.
- **Loafing Desk Cat**: Click to pet, stalk laser pointer, purr animations.
- **Focus Coach Object**: Periodically checks in when you get distracted and prompts you to return to work.

## 🛠️ How to Build and Run

### Prerequisites
- JDK 17 or higher
- Gradle 8+

### Running in Development
```bash
./gradlew :composeApp:run
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
