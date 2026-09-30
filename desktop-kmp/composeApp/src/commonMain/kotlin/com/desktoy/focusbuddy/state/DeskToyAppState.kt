package com.desktoy.focusbuddy.state

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.desktoy.focusbuddy.model.CatBehavior
import com.desktoy.focusbuddy.model.DesktopTool
import com.desktoy.focusbuddy.model.PaintSplatter
import com.desktoy.focusbuddy.model.ScreenCrack
import com.desktoy.focusbuddy.model.ScreenEffectFactory
import com.desktoy.focusbuddy.model.WaterSplash
import kotlin.random.Random

/**
 * Central State Holder for DeskToy & Focus Buddy.
 * Manages tool selection, cat life simulation, and screen fracture/paint states.
 */
class DeskToyAppState(
    initialWidth: Float = 1920f,
    initialHeight: Float = 1080f
) {
    var activeTool by mutableStateOf<DesktopTool?>(null)
    var punchLevel by mutableStateOf(2)

    val cracks = mutableStateListOf<ScreenCrack>()
    val splatters = mutableStateListOf<PaintSplatter>()
    val waterSplashes = mutableStateListOf<WaterSplash>()

    var catX by mutableStateOf((initialWidth - 320f).coerceAtLeast(40f))
    var catY by mutableStateOf((initialHeight - 230f).coerceAtLeast(40f))
    var catBehavior by mutableStateOf(CatBehavior.SITTING)
    var catPetCount by mutableStateOf(0)
    var catThought by mutableStateOf("Meow! Focus buddy on duty! 🐾")

    fun selectTool(tool: DesktopTool?) {
        activeTool = tool
    }

    fun cyclePunchLevel() {
        punchLevel = if (punchLevel >= 3) 1 else punchLevel + 1
    }

    fun petCat() {
        catPetCount++
        catBehavior = CatBehavior.PETTED
        catThought = "Purrrrrrr! 💖 Feels amazing! (Pets: $catPetCount)"
    }

    fun cycleCatPose() {
        catBehavior = when (catBehavior) {
            CatBehavior.SITTING -> CatBehavior.WALKING_RIGHT
            CatBehavior.WALKING_RIGHT -> CatBehavior.LOAFING
            CatBehavior.LOAFING -> CatBehavior.SLEEPING
            else -> CatBehavior.SITTING
        }
    }

    fun triggerToolTap(x: Float, y: Float) {
        when (activeTool) {
            DesktopTool.BOXING_GLOVE -> {
                cracks.add(ScreenEffectFactory.createCrack(x, y, punchLevel))
            }
            DesktopTool.WATER_GUN -> {
                waterSplashes.add(ScreenEffectFactory.createWaterSplash(x, y))
            }
            DesktopTool.PAINT_CANNON -> {
                splatters.add(ScreenEffectFactory.createPaintSplatter(x, y))
            }
            DesktopTool.SAPU_BROOM -> {
                sweepArea(x, y, 22000f)
            }
            null -> {}
        }
    }

    fun triggerToolDrag(x: Float, y: Float) {
        if (activeTool == DesktopTool.SAPU_BROOM) {
            sweepArea(x, y, 22000f)
        }
    }

    fun sweepArea(x: Float, y: Float, radiusSq: Float = 22000f) {
        cracks.removeAll {
            val dx = it.x - x
            val dy = it.y - y
            (dx * dx + dy * dy) < radiusSq
        }
        splatters.removeAll {
            val dx = it.x - x
            val dy = it.y - y
            (dx * dx + dy * dy) < radiusSq
        }
        waterSplashes.removeAll {
            val dx = it.x - x
            val dy = it.y - y
            (dx * dx + dy * dy) < radiusSq
        }
    }

    fun clearAllEffects() {
        cracks.clear()
        splatters.clear()
        waterSplashes.clear()
        activeTool = null
    }

    fun updateAutonomousCat(screenWidth: Float, tick: Int) {
        // Change behavioral goal every ~10-15 seconds
        if (tick % 90 == 0 && catBehavior != CatBehavior.PETTED) {
            val roll = Random.nextInt(100)
            catBehavior = when {
                roll < 30 -> CatBehavior.WALKING_LEFT
                roll < 60 -> CatBehavior.WALKING_RIGHT
                roll < 80 -> CatBehavior.SITTING
                roll < 92 -> CatBehavior.LOAFING
                else -> CatBehavior.SLEEPING
            }

            catThought = when (catBehavior) {
                CatBehavior.WALKING_LEFT, CatBehavior.WALKING_RIGHT -> listOf(
                    "Patrolling your desktop... 🐾",
                    "Checking your open tabs...",
                    "No YouTube allowed right now! 😼",
                    "Stretch those legs! 🐾"
                ).random()
                CatBehavior.SITTING -> listOf(
                    "Watching you write great code! ✨",
                    "Sitting by your side. You got this!",
                    "Purr... Don't forget to sip water!",
                    "Deep breath. Code looks clean! 💻"
                ).random()
                CatBehavior.LOAFING -> "Loaf mode activated 🍞 Cozy focus!"
                CatBehavior.SLEEPING -> "Zzz... Resting one eye while you code... 💤"
                else -> catThought
            }
        }

        // Move position if walking
        if (catBehavior == CatBehavior.WALKING_LEFT) {
            catX -= 2.5f
            if (catX <= 30f) {
                catBehavior = CatBehavior.WALKING_RIGHT
            }
        } else if (catBehavior == CatBehavior.WALKING_RIGHT) {
            catX += 2.5f
            if (catX >= screenWidth - 260f) {
                catBehavior = CatBehavior.WALKING_LEFT
            }
        }
    }
}
