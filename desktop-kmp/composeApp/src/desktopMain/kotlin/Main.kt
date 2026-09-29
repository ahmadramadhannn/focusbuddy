package com.desktoy.focusbuddy

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.window.WindowDraggableArea
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPosition
import androidx.compose.ui.window.application
import androidx.compose.ui.window.rememberWindowState
import kotlinx.coroutines.delay
import java.awt.Toolkit
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

// Data classes for visual effects
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

data class PaintSplatter(
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

enum class DesktopTool {
    BOXING_GLOVE, SAPU_BROOM, WATER_GUN, PAINT_CANNON, LASER
}

enum class WindowMode {
    COMPACT_PET, // Small floating widget in the corner — other apps remain 100% clickable!
    FULLSCREEN_STRESS_RELIEF // Full-screen overlay to punch, paint, and fidget
}

fun main() = application {
    val screenSize = Toolkit.getDefaultToolkit().screenSize
    val petWidth = 330.dp
    val petHeight = 390.dp

    var windowMode by remember { mutableStateOf(WindowMode.COMPACT_PET) }

    // Start as a compact floating widget near bottom-right so the user can freely work
    val initialX = ((screenSize.width - 360).coerceAtLeast(50)).dp
    val initialY = ((screenSize.height - 460).coerceAtLeast(50)).dp

    val windowState = rememberWindowState(
        position = WindowPosition(initialX, initialY),
        size = DpSize(petWidth, petHeight)
    )

    // Sync window size & position when toggling between Compact Desk Pet and Full-Screen Mode
    LaunchedEffect(windowMode) {
        if (windowMode == WindowMode.FULLSCREEN_STRESS_RELIEF) {
            windowState.position = WindowPosition(0.dp, 0.dp)
            windowState.size = DpSize(screenSize.width.dp, screenSize.height.dp)
        } else {
            windowState.position = WindowPosition(initialX, initialY)
            windowState.size = DpSize(petWidth, petHeight)
        }
    }

    Window(
        onCloseRequest = ::exitApplication,
        title = "DeskToy & Focus Buddy",
        state = windowState,
        alwaysOnTop = true,
        undecorated = true,
        transparent = true,
        onKeyEvent = { keyEvent ->
            if (keyEvent.key == Key.Escape && windowMode == WindowMode.FULLSCREEN_STRESS_RELIEF) {
                windowMode = WindowMode.COMPACT_PET
                true
            } else {
                false
            }
        }
    ) {
        if (windowMode == WindowMode.FULLSCREEN_STRESS_RELIEF) {
            // Full-Screen Stress Relief Mode
            FullScreenStressReliefOverlay(
                onBackToWork = { windowMode = WindowMode.COMPACT_PET }
            )
        } else {
            // Compact Floating Desk Companion Widget (Non-obstructive)
            CompactDeskPetWidget(
                onOpenStressRelief = { windowMode = WindowMode.FULLSCREEN_STRESS_RELIEF },
                onClose = ::exitApplication
            )
        }
    }
}

/**
 * Compact Floating Desk Pet Widget.
 * Only occupies a small corner of the screen so all other desktop apps remain completely clickable!
 */
@Composable
fun androidx.compose.ui.window.WindowScope.CompactDeskPetWidget(
    onOpenStressRelief: () -> Unit,
    onClose: () -> Unit
) {
    var catHappiness by remember { mutableStateOf(100) }
    var petCount by remember { mutableStateOf(0) }
    var catThought by remember { mutableStateOf("Ready to focus together! 🐾") }
    var coachMessage by remember { mutableStateOf("Keep going! You're crushing it today 🚀") }

    LaunchedEffect(Unit) {
        val quotes = listOf(
            "Take 3 deep breaths, pet the cat, then back to work!",
            "Did that tab solve your problem yet? Stay in the zone!",
            "Dopamine is cheap, shipping working software is priceless.",
            "Punch the screen in Stress Mode if you hit a wall!",
            "You are making steady progress! Keep focusing 🎯"
        )
        while (true) {
            delay(35000)
            coachMessage = quotes.random()
        }
    }

    Surface(
        modifier = Modifier
            .fillMaxSize()
            .padding(8.dp),
        shape = RoundedCornerShape(20.dp),
        color = Color(0xF20F172A),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x4038BDF8)),
        shadowElevation = 12.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Draggable Window Title Header
            WindowDraggableArea {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text("🐾", fontSize = 16.sp)
                        Text(
                            text = "Focus Buddy",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Color(0xFF10B981).copy(alpha = 0.25f)
                        ) {
                            Text(
                                "WORK MODE",
                                color = Color(0xFF34D399),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }

                    IconButton(
                        onClick = onClose,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Text("✕", color = Color(0xFF94A3B8), fontSize = 12.sp)
                    }
                }
            }

            // Cat Mascot & Dialogue
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Cat Speech Bubble
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF1E293B),
                    modifier = Modifier.padding(bottom = 6.dp)
                ) {
                    Text(
                        text = catThought,
                        color = Color(0xFFFDE68A),
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                    )
                }

                // Interactive Cat Avatar (Click to Pet)
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = Color(0xFFF59E0B),
                    modifier = Modifier
                        .size(80.dp, 56.dp)
                        .pointerInput(Unit) {
                            detectTapGestures {
                                petCount++
                                catHappiness = (catHappiness + 10).coerceAtMost(100)
                                catThought = "Purrrrr! 💖 (Pets: $petCount)"
                            }
                        }
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("🐱", fontSize = 32.sp)
                    }
                }

                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Click cat to pet ($petCount)",
                    color = Color(0xFF94A3B8),
                    fontSize = 10.sp
                )
            }

            // Focus Coach Reminder Card
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0xFF1E293B).copy(alpha = 0.85f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("👔", fontSize = 18.sp)
                    Text(
                        text = coachMessage,
                        color = Color(0xFFE2E8F0),
                        fontSize = 10.5.sp,
                        lineHeight = 14.sp
                    )
                }
            }

            // Action Buttons
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                // Stress Relief Full-Screen Mode Button
                Button(
                    onClick = onOpenStressRelief,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth().height(36.dp),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text("💥 Stress Relief (Punch Screen)", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Quick Pet Action Button
                    Button(
                        onClick = {
                            petCount++
                            catHappiness = (catHappiness + 10).coerceAtMost(100)
                            catThought = "Purrrrr! 🐾 Feeling great!"
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155)),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f).height(32.dp),
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Text("🐾 Pet Cat", fontSize = 10.5.sp, color = Color.White)
                    }

                    // Tip Label
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFF1E293B),
                        modifier = Modifier.weight(1f).height(32.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text("Drag to move", fontSize = 10.sp, color = Color(0xFF64748B))
                        }
                    }
                }
            }
        }
    }
}

/**
 * Full-Screen Stress Relief Overlay.
 * Allows punching the monitor with procedural glass cracks, spraying paint, sweeping, and laser pointer.
 * Includes prominent "Back to Work" controls and Esc key escape.
 */
@Composable
fun FullScreenStressReliefOverlay(
    onBackToWork: () -> Unit
) {
    var activeTool by remember { mutableStateOf(DesktopTool.BOXING_GLOVE) }
    var punchLevel by remember { mutableStateOf(2) }
    val cracks = remember { mutableStateListOf<ScreenCrack>() }
    val splatters = remember { mutableStateListOf<PaintSplatter>() }
    var mousePos by remember { mutableStateOf(Offset(200f, 200f)) }
    var laserPos by remember { mutableStateOf<Offset?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent)
            .pointerInput(activeTool, punchLevel) {
                detectTapGestures { tapPos ->
                    mousePos = tapPos
                    when (activeTool) {
                        DesktopTool.BOXING_GLOVE -> {
                            val numRays = 8 + punchLevel * 4
                            val maxRadius = 70f + punchLevel * 50f
                            val rays = (0 until numRays).map { i ->
                                val baseAngle = (i.toDouble() / numRays) * (2 * Math.PI) + (Random.nextDouble() - 0.5) * 0.4
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
                            val rings = (1..punchLevel + 1).map { ringIdx ->
                                CrackRing(
                                    radius = (ringIdx * 25f) + (Random.nextFloat() * 10f),
                                    startAngle = Random.nextDouble() * Math.PI,
                                    endAngle = Random.nextDouble() * Math.PI + Math.PI
                                )
                            }
                            cracks.add(
                                ScreenCrack(
                                    id = System.currentTimeMillis().toString(),
                                    x = tapPos.x,
                                    y = tapPos.y,
                                    severity = punchLevel,
                                    rays = rays,
                                    rings = rings
                                )
                            )
                        }
                        DesktopTool.PAINT_CANNON -> {
                            val colors = listOf(Color(0xFFEF4444), Color(0xFF10B981), Color(0xFF3B82F6), Color(0xFFF59E0B), Color(0xFFEC4899))
                            val drips = (1..4).map {
                                SplatterDrip(
                                    length = 20f + Random.nextFloat() * 60f,
                                    width = 3f + Random.nextFloat() * 4f,
                                    offsetX = (Random.nextFloat() - 0.5f) * 20f
                                )
                            }
                            splatters.add(
                                PaintSplatter(
                                    x = tapPos.x,
                                    y = tapPos.y,
                                    color = colors.random(),
                                    radius = 18f + Random.nextFloat() * 16f,
                                    drips = drips
                                )
                            )
                        }
                        DesktopTool.SAPU_BROOM -> {
                            cracks.removeAll {
                                val dx = it.x - tapPos.x
                                val dy = it.y - tapPos.y
                                (dx * dx + dy * dy) < 18000f
                            }
                            splatters.removeAll {
                                val dx = it.x - tapPos.x
                                val dy = it.y - tapPos.y
                                (dx * dx + dy * dy) < 18000f
                            }
                        }
                        DesktopTool.LASER -> {
                            laserPos = tapPos
                        }
                        else -> {}
                    }
                }
            }
            .pointerInput(activeTool) {
                detectDragGestures { change, _ ->
                    mousePos = change.position
                    val dragPos = change.position
                    if (activeTool == DesktopTool.SAPU_BROOM) {
                        cracks.removeAll {
                            val dx = it.x - dragPos.x
                            val dy = it.y - dragPos.y
                            (dx * dx + dy * dy) < 18000f
                        }
                        splatters.removeAll {
                            val dx = it.x - dragPos.x
                            val dy = it.y - dragPos.y
                            (dx * dx + dy * dy) < 18000f
                        }
                    } else if (activeTool == DesktopTool.LASER) {
                        laserPos = dragPos
                    }
                }
            }
    ) {
        // Procedural Crack & Paint Canvas
        Canvas(modifier = Modifier.fillMaxSize()) {
            for (crack in cracks) {
                drawCircle(
                    color = Color.White.copy(alpha = 0.9f),
                    radius = 8f + crack.severity * 3f,
                    center = Offset(crack.x, crack.y)
                )
                drawCircle(
                    color = Color(0xFF38BDF8).copy(alpha = 0.4f),
                    radius = 16f + crack.severity * 6f,
                    center = Offset(crack.x, crack.y)
                )

                for (ray in crack.rays) {
                    val endX = crack.x + (cos(ray.angle) * ray.length).toFloat()
                    val endY = crack.y + (sin(ray.angle) * ray.length).toFloat()

                    drawLine(
                        color = Color(0xFFBAE6FD).copy(alpha = 0.45f),
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
                        startAngle = (ring.startAngle * 180 / Math.PI).toFloat(),
                        sweepAngle = ((ring.endAngle - ring.startAngle) * 180 / Math.PI).toFloat(),
                        useCenter = false,
                        topLeft = Offset(crack.x - ring.radius, crack.y - ring.radius),
                        size = androidx.compose.ui.geometry.Size(ring.radius * 2, ring.radius * 2),
                        style = Stroke(width = 1.2f)
                    )
                }
            }

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

            laserPos?.let { pos ->
                drawCircle(color = Color.Red.copy(alpha = 0.3f), radius = 20f, center = pos)
                drawCircle(color = Color.Red, radius = 6f, center = pos)
                drawCircle(color = Color.White, radius = 2.5f, center = pos)
            }
        }

        // Top Status & "Back to Work" Navigation Bar
        Surface(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 16.dp),
            shape = RoundedCornerShape(20.dp),
            color = Color(0xF20F172A),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x33EF4444)),
            shadowElevation = 8.dp
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("💥", fontSize = 16.sp)
                    Text(
                        text = "Stress Relief Active (Click anywhere to punch / paint)",
                        color = Color(0xFFFCA5A5),
                        fontWeight = FontWeight.Medium,
                        fontSize = 12.sp
                    )
                }

                Button(
                    onClick = onBackToWork,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text("💻 Back to Work (Esc)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                Button(
                    onClick = {
                        cracks.clear()
                        splatters.clear()
                        laserPos = null
                        onBackToWork()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155)),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("🧹 Clean & Resume", color = Color(0xFFE2E8F0), fontSize = 12.sp)
                }
            }
        }

        // Bottom Tool Dock
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 24.dp)
                .background(Color(0xE60F172A), RoundedCornerShape(24.dp))
                .border(1.dp, Color(0x3338BDF8), RoundedCornerShape(24.dp))
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Button(
                    onClick = { activeTool = DesktopTool.BOXING_GLOVE },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.BOXING_GLOVE) Color(0xFFEF4444) else Color(0xFF334155)
                    )
                ) {
                    Text("🥊 Boxing Glove (${when (punchLevel) { 1 -> "1x"; 2 -> "2x"; else -> "MAX" }})")
                }

                IconButton(
                    onClick = { punchLevel = if (punchLevel >= 3) 1 else punchLevel + 1 }
                ) {
                    Text("⚡", fontSize = 16.sp)
                }

                Button(
                    onClick = { activeTool = DesktopTool.SAPU_BROOM },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.SAPU_BROOM) Color(0xFF10B981) else Color(0xFF334155)
                    )
                ) {
                    Text("🧹 Sapu / Broom")
                }

                Button(
                    onClick = { activeTool = DesktopTool.PAINT_CANNON },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.PAINT_CANNON) Color(0xFF8B5CF6) else Color(0xFF334155)
                    )
                ) {
                    Text("🎨 Paint")
                }

                Button(
                    onClick = { activeTool = DesktopTool.LASER },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.LASER) Color(0xFFEC4899) else Color(0xFF334155)
                    )
                ) {
                    Text("🔴 Laser")
                }

                Button(
                    onClick = {
                        cracks.clear()
                        splatters.clear()
                        laserPos = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF475569))
                ) {
                    Text("✨ Clear Effects")
                }
            }
        }
    }
}
