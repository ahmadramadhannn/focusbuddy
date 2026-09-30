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
import com.desktoy.focusbuddy.util.Glb3DParser
import kotlinx.coroutines.delay
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/**
 * 3D GLB Model Renderer for Compose Multiplatform.
 * Renders the authentic Poly Pizza 3D Cat (.glb) model in real-time with
 * flat-shading normal lighting, depth sorting, dynamic animations, and 3D orbit controls.
 */
@Composable
fun GlbCat3DCanvas(
    behavior: CatBehavior,
    isFacingRight: Boolean,
    modifier: Modifier = Modifier
) {
    val mesh = remember { Glb3DParser.getOrLoadCatMesh() }
    var animTime by remember { mutableStateOf(0f) }
    var orbitYaw by remember { mutableStateOf(0f) }
    var orbitPitch by remember { mutableStateOf(0f) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(16) // 60 FPS
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
            val baseScale = size.minDimension * 0.045f * mesh.scaleFactor
            val centerX = size.width / 2f
            val centerY = size.height / 2f + 4f

            // Dynamic 3D Animations & Deformations
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

            // Rotation angles
            val targetYaw = (if (isFacingRight) 0.55f else -0.55f) + orbitYaw
            val targetPitch = (if (behavior == CatBehavior.SLEEPING) 0.3f else 0.12f) + orbitPitch
            val targetRoll = if (behavior == CatBehavior.SLEEPING) 0.4f else 0f

            val cosY = cos(targetYaw)
            val sinY = sin(targetYaw)
            val cosX = cos(targetPitch)
            val sinX = sin(targetPitch)
            val cosZ = cos(targetRoll)
            val sinZ = sin(targetRoll)

            // Directional Light Source (Top-Right-Front)
            val lightDir = Vec3(0.5f, 0.8f, 0.7f).normalize()

            // 1. Transform vertices
            val transformed = mesh.vertices.map { v ->
                // Apply dynamic mesh deformations
                val vx = v.x - mesh.center.x
                val vy = (v.y - mesh.center.y) + (if (v.y > mesh.center.y) earTwitch else breath) + walkBob
                val vz = v.z - mesh.center.z + (if (v.x < -3f) tailWag else 0f)

                // Yaw
                val x1 = vx * cosY + vz * sinY
                val y1 = vy
                val z1 = -vx * sinY + vz * cosY

                // Pitch
                val x2 = x1
                val y2 = y1 * cosX - z1 * sinX
                val z2 = y1 * sinX + z1 * cosX

                // Roll
                val x3 = x2 * cosZ - y2 * sinZ
                val y3 = x2 * sinZ + y2 * cosZ
                val z3 = z2

                val screenX = centerX + x3 * baseScale
                val screenY = centerY - y3 * baseScale
                Pair(Vec3(x3, y3, z3), Offset(screenX, screenY))
            }

            // 2. Sort faces by depth
            val sortedFaces = mesh.faces.mapNotNull { face ->
                if (face.i1 >= transformed.size || face.i2 >= transformed.size || face.i3 >= transformed.size) return@mapNotNull null
                val v1 = transformed[face.i1].first
                val v2 = transformed[face.i2].first
                val v3 = transformed[face.i3].first
                val v4 = face.i4?.let { if (it < transformed.size) transformed[it].first else null }
                val avgZ = (v1.z + v2.z + v3.z + (v4?.z ?: 0f)) / (if (v4 != null) 4f else 3f)

                // Surface normal
                val edge1 = v2 - v1
                val edge2 = v3 - v1
                val normal = edge1.cross(edge2).normalize()

                // Flat-shading lighting calculation
                val nDotL = max(0.2f, min(1.0f, normal.dot(lightDir) * 0.7f + 0.5f))

                Triple(face, avgZ, nDotL)
            }.sortedBy { it.second }

            // 3. Render 3D polygons
            for ((face, _, lightIntensity) in sortedFaces) {
                val p1 = transformed[face.i1].second
                val p2 = transformed[face.i2].second
                val p3 = transformed[face.i3].second
                val p4 = face.i4?.let { if (it < transformed.size) transformed[it].second else null }

                val path = Path().apply {
                    moveTo(p1.x, p1.y)
                    lineTo(p2.x, p2.y)
                    lineTo(p3.x, p3.y)
                    if (p4 != null) {
                        lineTo(p4.x, p4.y)
                    }
                    close()
                }

                val shadedColor = Color(
                    red = (face.baseColor.red * lightIntensity).coerceIn(0f, 1f),
                    green = (face.baseColor.green * lightIntensity).coerceIn(0f, 1f),
                    blue = (face.baseColor.blue * lightIntensity).coerceIn(0f, 1f),
                    alpha = 1.0f
                )

                drawPath(path, shadedColor)
            }

            // Draw eye highlights
            if (transformed.size > 19) {
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
}
