package com.desktoy.focusbuddy.ui.cat

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.input.pointer.pointerInput
import com.desktoy.focusbuddy.model.CatBehavior
import com.desktoy.focusbuddy.ui.theme.DeskToyColors
import kotlinx.coroutines.delay
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin
import kotlin.math.sqrt

/**
 * 3D Vector for real-time vertex transformations and lighting.
 */
data class Vec3(val x: Float, val y: Float, val z: Float) {
    operator fun plus(o: Vec3) = Vec3(x + o.x, y + o.y, z + o.z)
    operator fun minus(o: Vec3) = Vec3(x - o.x, y - o.y, z - o.z)
    operator fun times(s: Float) = Vec3(x * s, y * s, z * s)

    fun cross(o: Vec3) = Vec3(
        y * o.z - z * o.y,
        z * o.x - x * o.z,
        x * o.y - y * o.x
    )

    fun dot(o: Vec3) = x * o.x + y * o.y + z * o.z

    fun normalize(): Vec3 {
        val len = sqrt(x * x + y * y + z * z)
        return if (len > 0.0001f) Vec3(x / len, y / len, z / len) else Vec3(0f, 1f, 0f)
    }
}

/**
 * Polygonal face with base color and vertex indices.
 */
data class Face3D(
    val i1: Int,
    val i2: Int,
    val i3: Int,
    val i4: Int? = null,
    val baseColor: Color
)

/**
 * Real-time 3D Low-Poly Mesh Renderer for the Google Poly Cat (6dM1J6f6pm9).
 * Computes 3D matrix rotations, dynamic vertex deformations (ear wiggle, tail wag, breathing),
 * depth sorting (Painter's algorithm), and directional flat-shading normal lighting.
 */
@Composable
fun LowPoly3DCatMesh(
    behavior: CatBehavior,
    isFacingRight: Boolean,
    modifier: Modifier = Modifier
) {
    var animTime by remember { mutableStateOf(0f) }
    var orbitYaw by remember { mutableStateOf(0f) }
    var orbitPitch by remember { mutableStateOf(0f) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(16) // ~60 FPS animation loop
            animTime += 0.05f
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectDragGestures { _, dragAmount ->
                    orbitYaw += dragAmount.x * 0.015f
                    orbitPitch = (orbitPitch - dragAmount.y * 0.015f).coerceIn(-0.4f, 0.4f)
                }
            }
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val baseScale = size.minDimension * 0.045f
            val centerX = size.width / 2f
            val centerY = size.height / 2f + 4f

            // Dynamic Animation Deformations
            val breath = when (behavior) {
                CatBehavior.SLEEPING -> sin(animTime * 2f) * 0.08f
                CatBehavior.LOAFING -> sin(animTime * 2.5f) * 0.04f
                CatBehavior.PETTED -> sin(animTime * 15f) * 0.12f
                else -> sin(animTime * 4f) * 0.05f
            }

            val tailWag = when (behavior) {
                CatBehavior.PETTED -> sin(animTime * 18f) * 1.8f
                CatBehavior.SLEEPING -> sin(animTime * 1.5f) * 0.3f
                else -> sin(animTime * 6f) * 0.8f
            }

            val earTwitch = if (behavior == CatBehavior.PETTED) sin(animTime * 20f) * 0.3f else 0f
            val walkBob = if (behavior == CatBehavior.WALKING_LEFT || behavior == CatBehavior.WALKING_RIGHT) {
                sin(animTime * 10f) * 0.6f
            } else 0f

            // Orientation angles
            val targetYaw = (if (isFacingRight) 0.55f else -0.55f) + orbitYaw
            val targetPitch = (if (behavior == CatBehavior.SLEEPING) 0.3f else 0.12f) + orbitPitch
            val targetRoll = if (behavior == CatBehavior.SLEEPING) 0.4f else 0f

            // 1. Define 3D Geometric Vertices of Low-Poly Cat
            val baseVertices = mutableListOf(
                // Body Main Facets (0..7)
                Vec3(-4.5f, -1.0f + breath, -3.5f), // 0: Back-Bottom-Left
                Vec3(4.0f, -1.0f + breath, -3.5f),  // 1: Back-Bottom-Right
                Vec3(4.0f, 4.5f + breath, -3.5f),   // 2: Back-Top-Right
                Vec3(-4.5f, 4.5f + breath, -3.5f),  // 3: Back-Top-Left
                Vec3(-3.8f, -1.5f, 4.0f),           // 4: Front-Bottom-Left
                Vec3(3.5f, -1.5f, 4.0f),            // 5: Front-Bottom-Right
                Vec3(3.5f, 4.0f, 3.5f),             // 6: Front-Top-Right
                Vec3(-3.8f, 4.0f, 3.5f),            // 7: Front-Top-Left

                // Belly / Chest highlight (8..11)
                Vec3(-2.5f, -1.6f, 4.2f),           // 8: Chest BL
                Vec3(2.5f, -1.6f, 4.2f),            // 9: Chest BR
                Vec3(2.5f, 3.2f, 3.8f),             // 10: Chest TR
                Vec3(-2.5f, 3.2f, 3.8f),            // 11: Chest TL

                // Head Facets (12..19)
                Vec3(1.5f, 2.8f + walkBob, 3.8f),   // 12: Head Base BL
                Vec3(6.2f, 2.8f + walkBob, 3.8f),   // 13: Head Base BR
                Vec3(6.5f, 7.5f + walkBob, 3.2f),   // 14: Head Top BR
                Vec3(1.2f, 7.5f + walkBob, 3.2f),   // 15: Head Top BL
                Vec3(1.8f, 2.5f + walkBob, 6.8f),   // 16: Snout BL
                Vec3(5.8f, 2.5f + walkBob, 6.8f),   // 17: Snout BR
                Vec3(5.8f, 6.2f + walkBob, 6.2f),   // 18: Snout TR
                Vec3(1.8f, 6.2f + walkBob, 6.2f),   // 19: Snout TL

                // Left Ear (20..22)
                Vec3(1.8f, 7.5f, 3.2f),             // 20
                Vec3(3.2f, 7.5f, 3.2f),             // 21
                Vec3(2.2f + earTwitch, 10.8f, 3.5f), // 22: Ear Tip Left

                // Right Ear (23..25)
                Vec3(4.5f, 7.5f, 3.2f),             // 23
                Vec3(6.2f, 7.5f, 3.2f),             // 24
                Vec3(5.8f - earTwitch, 10.8f, 3.5f), // 25: Ear Tip Right

                // Tail (26..29)
                Vec3(-4.5f, 3.5f, -3.2f),           // 26: Tail Base
                Vec3(-6.8f + tailWag, 5.5f, -3.6f), // 27: Tail Mid
                Vec3(-8.2f + tailWag * 1.5f, 8.2f, -3.4f), // 28: Tail Tip
                Vec3(-7.2f + tailWag * 1.2f, 8.0f, -2.8f)  // 29
            )

            // 2. Define 3D Polygonal Faces
            val faces = listOf(
                // Body
                Face3D(0, 1, 2, 3, DeskToyColors.CatOrange),
                Face3D(4, 5, 6, 7, DeskToyColors.CatLightOrange),
                Face3D(0, 4, 7, 3, DeskToyColors.CatOrange),
                Face3D(1, 5, 6, 2, DeskToyColors.CatLightOrange),
                Face3D(3, 7, 6, 2, DeskToyColors.CatLightOrange),
                Face3D(0, 1, 5, 4, Color(0xFFC2410C)),

                // Chest cream facet
                Face3D(8, 9, 10, 11, DeskToyColors.CatCream),

                // Head
                Face3D(12, 13, 14, 15, DeskToyColors.CatOrange),
                Face3D(16, 17, 18, 19, DeskToyColors.CatCream),
                Face3D(12, 16, 19, 15, DeskToyColors.CatLightOrange),
                Face3D(13, 17, 18, 14, DeskToyColors.CatLightOrange),
                Face3D(15, 19, 18, 14, DeskToyColors.CatLightOrange),
                Face3D(12, 13, 17, 16, Color(0xFFC2410C)),

                // Ears
                Face3D(20, 21, 22, null, DeskToyColors.CatOrange),
                Face3D(23, 24, 25, null, DeskToyColors.CatOrange),

                // Tail
                Face3D(26, 27, 28, 29, DeskToyColors.CatOrange)
            )

            // 3. 3D Rotation Matrix Calculation
            val cosY = cos(targetYaw)
            val sinY = sin(targetYaw)
            val cosX = cos(targetPitch)
            val sinX = sin(targetPitch)
            val cosZ = cos(targetRoll)
            val sinZ = sin(targetRoll)

            // Directional Light Source (Top-Right-Front)
            val lightDir = Vec3(0.5f, 0.8f, 0.7f).normalize()

            // Transform all vertices in 3D
            val transformed = baseVertices.map { v ->
                // Yaw (Y)
                val x1 = v.x * cosY + v.z * sinY
                val y1 = v.y
                val z1 = -v.x * sinY + v.z * cosY

                // Pitch (X)
                val x2 = x1
                val y2 = y1 * cosX - z1 * sinX
                val z2 = y1 * sinX + z1 * cosX

                // Roll (Z)
                val x3 = x2 * cosZ - y2 * sinZ
                val y3 = x2 * sinZ + y2 * cosZ
                val z3 = z2

                // Project to 2D Screen
                val screenX = centerX + x3 * baseScale
                val screenY = centerY - y3 * baseScale
                Pair(Vec3(x3, y3, z3), Offset(screenX, screenY))
            }

            // 4. Painter's Algorithm: Sort faces by average Z-depth (back-to-front)
            val sortedFaces = faces.map { face ->
                val v1 = transformed[face.i1].first
                val v2 = transformed[face.i2].first
                val v3 = transformed[face.i3].first
                val v4 = face.i4?.let { transformed[it].first }
                val avgZ = (v1.z + v2.z + v3.z + (v4?.z ?: 0f)) / (if (face.i4 != null) 4f else 3f)

                // Compute Surface Normal
                val edge1 = v2 - v1
                val edge2 = v3 - v1
                val normal = edge1.cross(edge2).normalize()

                // Calculate Flat Shading Light Intensity
                val nDotL = max(0.2f, min(1.0f, normal.dot(lightDir) * 0.7f + 0.5f))

                Triple(face, avgZ, nDotL)
            }.sortedBy { it.second }

            // 5. Draw 3D Polygons
            for ((face, _, lightIntensity) in sortedFaces) {
                val p1 = transformed[face.i1].second
                val p2 = transformed[face.i2].second
                val p3 = transformed[face.i3].second
                val p4 = face.i4?.let { transformed[it].second }

                val path = Path().apply {
                    moveTo(p1.x, p1.y)
                    lineTo(p2.x, p2.y)
                    lineTo(p3.x, p3.y)
                    if (p4 != null) {
                        lineTo(p4.x, p4.y)
                    }
                    close()
                }

                // Apply shading to base color
                val shadedColor = Color(
                    red = (face.baseColor.red * lightIntensity).coerceIn(0f, 1f),
                    green = (face.baseColor.green * lightIntensity).coerceIn(0f, 1f),
                    blue = (face.baseColor.blue * lightIntensity).coerceIn(0f, 1f),
                    alpha = 1.0f
                )

                drawPath(path, shadedColor)
            }

            // Draw Eyes in 3D projected space
            val eyeLeft = transformed[18].second
            val eyeRight = transformed[19].second
            val eyeColor = Color(0xFF0F172A)
            drawCircle(eyeColor, radius = baseScale * 0.28f, center = eyeLeft)
            drawCircle(eyeColor, radius = baseScale * 0.28f, center = eyeRight)
            drawCircle(Color.White, radius = baseScale * 0.09f, center = eyeLeft + Offset(1f, -1f))
            drawCircle(Color.White, radius = baseScale * 0.09f, center = eyeRight + Offset(1f, -1f))
        }
    }
}
