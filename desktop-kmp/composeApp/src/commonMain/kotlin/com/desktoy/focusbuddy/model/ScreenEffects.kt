package com.desktoy.focusbuddy.model

import androidx.compose.ui.graphics.Color
import kotlin.math.PI
import kotlin.random.Random

/**
 * Screen shatter fracture data structure with ray-tracing glass cracks.
 */
data class ScreenCrack(
    val id: String,
    val x: Float,
    val y: Float,
    val severity: Int,
    val rays: List<CrackRay>,
    val rings: List<CrackRing>
)

data class CrackRay(
    val angle: Double,
    val length: Float,
    val branches: List<CrackBranch>
)

data class CrackBranch(
    val startRatio: Float,
    val angleOffset: Double,
    val length: Float
)

data class CrackRing(
    val radius: Float,
    val startAngle: Double,
    val endAngle: Double
)

/**
 * Acrylic paint splatter with physics-based gravity drips.
 */
data class PaintSplatter(
    val id: String,
    val x: Float,
    val y: Float,
    val color: Color,
    val radius: Float,
    val drips: List<SplatterDrip>
)

data class SplatterDrip(
    val length: Float,
    val width: Float,
    val offsetX: Float
)

/**
 * Translucent water splash ripple.
 */
data class WaterSplash(
    val id: String,
    val x: Float,
    val y: Float,
    val radius: Float
)

/**
 * Factory functions for generating procedural screen effects.
 */
object ScreenEffectFactory {
    private val PAINT_COLORS = listOf(
        Color(0xFFEF4444),
        Color(0xFF10B981),
        Color(0xFF3B82F6),
        Color(0xFFF59E0B),
        Color(0xFFEC4899),
        Color(0xFF8B5CF6)
    )

    fun createCrack(x: Float, y: Float, severity: Int): ScreenCrack {
        val numRays = 8 + severity * 4
        val maxRadius = 70f + severity * 50f
        val rays = (0 until numRays).map { i ->
            val baseAngle = (i.toDouble() / numRays) * (2 * PI) + (Random.nextDouble() - 0.5) * 0.4
            val length = maxRadius * (0.6f + Random.nextFloat() * 0.6f)
            val branches = (0..Random.nextInt(1, 3)).map {
                CrackBranch(
                    startRatio = 0.3f + Random.nextFloat() * 0.4f,
                    angleOffset = (Random.nextDouble() - 0.5) * 0.8,
                    length = length * (0.2f + Random.nextFloat() * 0.3f)
                )
            }
            CrackRay(baseAngle, length, branches)
        }
        val rings = (1..severity + 1).map { ringIdx ->
            CrackRing(
                radius = (ringIdx * 25f) + (Random.nextFloat() * 10f),
                startAngle = Random.nextDouble() * PI,
                endAngle = Random.nextDouble() * PI + PI
            )
        }
        return ScreenCrack(
            id = System.currentTimeMillis().toString() + "_" + Random.nextInt(1000),
            x = x,
            y = y,
            severity = severity,
            rays = rays,
            rings = rings
        )
    }

    fun createPaintSplatter(x: Float, y: Float): PaintSplatter {
        val drips = (1..4).map {
            SplatterDrip(
                length = 20f + Random.nextFloat() * 60f,
                width = 3f + Random.nextFloat() * 4f,
                offsetX = (Random.nextFloat() - 0.5f) * 20f
            )
        }
        return PaintSplatter(
            id = System.currentTimeMillis().toString() + "_" + Random.nextInt(1000),
            x = x,
            y = y,
            color = PAINT_COLORS.random(),
            radius = 18f + Random.nextFloat() * 16f,
            drips = drips
        )
    }

    fun createWaterSplash(x: Float, y: Float): WaterSplash {
        return WaterSplash(
            id = System.currentTimeMillis().toString() + "_" + Random.nextInt(1000),
            x = x,
            y = y,
            radius = 35f + Random.nextFloat() * 25f
        )
    }
}
