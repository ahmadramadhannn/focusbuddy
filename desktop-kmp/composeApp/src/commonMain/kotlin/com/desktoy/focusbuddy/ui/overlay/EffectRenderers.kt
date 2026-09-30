package com.desktoy.focusbuddy.ui.overlay

import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import com.desktoy.focusbuddy.model.PaintSplatter
import com.desktoy.focusbuddy.model.ScreenCrack
import com.desktoy.focusbuddy.model.WaterSplash
import com.desktoy.focusbuddy.ui.theme.DeskToyColors
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

/**
 * Procedural draw routines for screen cracks, water ripples, and acrylic splatters.
 */
object EffectRenderers {

    fun DrawScope.drawWaterSplashes(splashes: List<WaterSplash>) {
        for (splash in splashes) {
            drawCircle(
                color = DeskToyColors.WaterSplashDark,
                radius = splash.radius,
                center = Offset(splash.x, splash.y)
            )
            drawCircle(
                color = DeskToyColors.WaterSplashLight,
                radius = splash.radius * 0.6f,
                center = Offset(splash.x, splash.y)
            )
            drawCircle(
                color = Color.White.copy(alpha = 0.8f),
                radius = splash.radius * 0.2f,
                center = Offset(splash.x - splash.radius * 0.2f, splash.y - splash.radius * 0.2f)
            )
        }
    }

    fun DrawScope.drawScreenCracks(cracks: List<ScreenCrack>) {
        for (crack in cracks) {
            drawCircle(
                color = Color.White.copy(alpha = 0.9f),
                radius = 8f + crack.severity * 3f,
                center = Offset(crack.x, crack.y)
            )
            drawCircle(
                color = DeskToyColors.GlassCrackGlow.copy(alpha = 0.4f),
                radius = 16f + crack.severity * 6f,
                center = Offset(crack.x, crack.y)
            )

            for (ray in crack.rays) {
                val endX = crack.x + (cos(ray.angle) * ray.length).toFloat()
                val endY = crack.y + (sin(ray.angle) * ray.length).toFloat()

                drawLine(
                    color = DeskToyColors.GlassCrackBlue.copy(alpha = 0.45f),
                    start = Offset(crack.x, crack.y),
                    end = Offset(endX, endY),
                    strokeWidth = (crack.severity * 1.5f) + 2f
                )
                drawLine(
                    color = Color.White.copy(alpha = 0.95f),
                    start = Offset(crack.x, crack.y),
                    end = Offset(endX, endY),
                    strokeWidth = 1.2f
                )

                for (branch in ray.branches) {
                    val branchStartX = crack.x + (cos(ray.angle) * (ray.length * branch.startRatio)).toFloat()
                    val branchStartY = crack.y + (sin(ray.angle) * (ray.length * branch.startRatio)).toFloat()
                    val bAngle = ray.angle + branch.angleOffset
                    val branchEndX = branchStartX + (cos(bAngle) * branch.length).toFloat()
                    val branchEndY = branchStartY + (sin(bAngle) * branch.length).toFloat()

                    drawLine(
                        color = Color.White.copy(alpha = 0.8f),
                        start = Offset(branchStartX, branchStartY),
                        end = Offset(branchEndX, branchEndY),
                        strokeWidth = 1.0f
                    )
                }
            }

            for (ring in crack.rings) {
                drawArc(
                    color = Color.White.copy(alpha = 0.75f),
                    startAngle = (ring.startAngle * 180 / PI).toFloat(),
                    sweepAngle = ((ring.endAngle - ring.startAngle) * 180 / PI).toFloat(),
                    useCenter = false,
                    topLeft = Offset(crack.x - ring.radius, crack.y - ring.radius),
                    size = Size(ring.radius * 2, ring.radius * 2),
                    style = Stroke(width = 1.2f)
                )
            }
        }
    }

    fun DrawScope.drawPaintSplatters(splatters: List<PaintSplatter>) {
        for (splatter in splatters) {
            drawCircle(
                color = splatter.color,
                radius = splatter.radius,
                center = Offset(splatter.x, splatter.y)
            )
            for (drip in splatter.drips) {
                drawLine(
                    color = splatter.color,
                    start = Offset(splatter.x + drip.offsetX, splatter.y),
                    end = Offset(splatter.x + drip.offsetX, splatter.y + drip.length),
                    strokeWidth = drip.width
                )
            }
        }
    }
}
