import org.jetbrains.compose.desktop.application.dsl.TargetFormat

plugins {
    id("org.jetbrains.kotlin.multiplatform")
    id("org.jetbrains.compose")
    id("org.jetbrains.kotlin.plugin.compose")
}

kotlin {
    jvm("desktop")
    
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation(compose.runtime)
                implementation(compose.foundation)
                implementation(compose.material3)
                implementation(compose.ui)
                implementation(compose.components.resources)
                implementation(compose.components.uiToolingPreview)
                // Coroutines
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
                // Serialization for 3D glTF/GLB binary parsing & scene graph
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
                // 3D and Math utilities for Compose Multiplatform
                implementation("com.soywiz.korlibs.korge2:korge-3d:4.0.10") {
                    isTransitive = false
                }
            }
        }
        
        val desktopMain by getting {
            dependencies {
                implementation(compose.desktop.currentOs)
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-swing:1.9.0")
            }
        }
    }
}

compose.desktop {
    application {
        mainClass = "com.desktoy.focusbuddy.MainKt"

        nativeDistributions {
            targetFormats(TargetFormat.Dmg, TargetFormat.Msi, TargetFormat.Deb)
            packageName = "DeskToyFocusBuddy"
            packageVersion = "1.0.0"
            description = "DeskToy & Focus Buddy: Screen Fidget and Anti-Distraction Desktop Companion"
            copyright = "© 2026 DeskToy"
            vendor = "DeskToy"

            macOS {
                bundleID = "com.desktoy.focusbuddy"
            }
            windows {
                menuGroup = "DeskToy"
                upgradeUuid = "6f8c471b-a5d6-4444-a55d-357199182bb1"
            }
        }
    }
}
