package com.desktoy.focusbuddy

import androidx.compose.foundation.window.WindowDraggableArea
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.type
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPosition
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import com.desktoy.focusbuddy.model.DesktopTool
import com.desktoy.focusbuddy.state.DeskToyAppState
import com.desktoy.focusbuddy.ui.cat.LiveDeskCatContent
import com.desktoy.focusbuddy.ui.overlay.FullScreenActionOverlayContent
import kotlinx.coroutines.delay
import java.awt.Toolkit

fun main() = application {
    val screenSize = Toolkit.getDefaultToolkit().screenSize
    val appState = remember {
        DeskToyAppState(
            initialWidth = screenSize.width.toFloat(),
            initialHeight = screenSize.height.toFloat()
        )
    }

    val catWindowWidth = 240.dp
    val catWindowHeight = 175.dp
    val catWindowState = rememberWindowState(
        position = WindowPosition(appState.catX.dp, appState.catY.dp),
        size = DpSize(catWindowWidth, catWindowHeight)
    )

    // Autonomous Cat life simulation loop
    LaunchedEffect(Unit) {
        var tick = 0
        while (true) {
            delay(120)
            tick++
            appState.updateAutonomousCat(screenSize.width.toFloat(), tick)
            catWindowState.position = WindowPosition(appState.catX.dp, appState.catY.dp)
        }
    }

    // -----------------------------------------------------------------------------------------
    // WINDOW 1: LIVE ON-SCREEN LOW-POLY CAT
    // Always visible, moves freely across the screen, NEVER blocks clicks on other apps.
    // -----------------------------------------------------------------------------------------
    Window(
        onCloseRequest = ::exitApplication,
        title = "Live Low-Poly Desk Cat Companion",
        state = catWindowState,
        alwaysOnTop = true,
        undecorated = true,
        transparent = true,
        onKeyEvent = { keyEvent ->
            if (keyEvent.type == KeyEventType.KeyDown) {
                when (keyEvent.key) {
                    Key.One -> {
                        appState.selectTool(null)
                        true
                    }
                    Key.Two -> {
                        appState.selectTool(DesktopTool.BOXING_GLOVE)
                        true
                    }
                    Key.Three -> {
                        appState.selectTool(DesktopTool.SAPU_BROOM)
                        true
                    }
                    Key.Four -> {
                        appState.selectTool(DesktopTool.PAINT_CANNON)
                        true
                    }
                    Key.Five -> {
                        appState.selectTool(DesktopTool.WATER_GUN)
                        true
                    }
                    Key.P -> {
                        appState.petCat()
                        true
                    }
                    Key.C -> {
                        appState.cycleCatPose()
                        true
                    }
                    Key.Q -> {
                        exitApplication()
                        true
                    }
                    else -> false
                }
            } else false
        }
    ) {
        WindowDraggableArea {
            LiveDeskCatContent(
                state = appState,
                onCloseApp = ::exitApplication
            )
        }
    }

    // -----------------------------------------------------------------------------------------
    // WINDOW 2: FULL-SCREEN INTERACTIVE ACTION OVERLAY
    // Rendered ONLY when a tool is selected (activeTool != null).
    // When activeTool == null, this window does not exist, so 100% of mouse clicks pass through!
    // -----------------------------------------------------------------------------------------
    if (appState.activeTool != null) {
        val fullscreenState = rememberWindowState(
            position = WindowPosition(0.dp, 0.dp),
            size = DpSize(screenSize.width.dp, screenSize.height.dp)
        )

        Window(
            onCloseRequest = { appState.selectTool(null) },
            title = "DeskToy Screen Action Overlay",
            state = fullscreenState,
            alwaysOnTop = true,
            undecorated = true,
            transparent = true,
            onKeyEvent = { keyEvent ->
                if (keyEvent.type == KeyEventType.KeyDown) {
                    when (keyEvent.key) {
                        Key.Escape, Key.One -> {
                            appState.selectTool(null)
                            true
                        }
                        Key.Two -> {
                            appState.selectTool(DesktopTool.BOXING_GLOVE)
                            true
                        }
                        Key.Three -> {
                            appState.selectTool(DesktopTool.SAPU_BROOM)
                            true
                        }
                        Key.Four -> {
                            appState.selectTool(DesktopTool.PAINT_CANNON)
                            true
                        }
                        Key.Five -> {
                            appState.selectTool(DesktopTool.WATER_GUN)
                            true
                        }
                        else -> false
                    }
                } else false
            }
        ) {
            FullScreenActionOverlayContent(
                state = appState,
                onReturnToWork = { appState.selectTool(null) }
            )
        }
    }
}
