package com.desktoy.focusbuddy

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Window
import androidx.compose.ui.window.WindowPlacement
import androidx.compose.ui.window.WindowState
import androidx.compose.ui.window.application
import kotlinx.coroutines.delay
import java.awt.Toolkit
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

// Data classes for screen effects
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
    PUNCH, SAPU_MOP, WATER_GUN, PAINT, LASER
}

fun main() = application {
    // Window state spanning the primary screen with transparency
    val screenSize = Toolkit.getDefaultToolkit().screenSize
    val windowState = remember {
        WindowState(
            placement = WindowPlacement.Floating,
            width = screenSize.width.dp,
            height = screenSize.height.dp
        )
    }

    // Transparent Always-On-Top Desktop Window
    Window(
        onCloseRequest = ::exitApplication,
        title = "DeskToy Screen Overlay",
        state = windowState,
        alwaysOnTop = true,
        undecorated = true,
        transparent = true
    ) {
        DeskToyOverlayApp()
    }
}

@Composable
fun DeskToyOverlayApp() {
    var activeTool by remember { mutableStateOf(DesktopTool.PUNCH) }
    var punchLevel by remember { mutableStateOf(2) }
    val cracks = remember { mutableStateListOf<ScreenCrack>() }
    val splatters = remember { mutableStateListOf<PaintSplatter>() }
    var laserPos by remember { mutableStateOf<Offset?>(null) }
    var coachMessage by remember { mutableStateOf("Hey! Stop getting distracted and write that code!") }
    var showCoachDialog by remember { mutableStateOf(true) }
    var catHappiness by remember { mutableStateOf(100) }

    // Periodic coach reminders if user is idle
    LaunchedEffect(Unit) {
        val quotes = listOf(
            "Oi! Did that YouTube video solve your bug yet?",
            "Focus buddy is watching you... close those 47 tabs!",
            "Take 3 deep breaths, smash the monitor once, then back to work!",
            "Dopamine is cheap, shipping production code is priceless.",
            "I saw you open Reddit. Don't test me."
        )
        while (true) {
            delay(45000)
            coachMessage = quotes.random()
            showCoachDialog = true
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent)
            .pointerInput(activeTool, punchPowerLevel = punchLevel) {
                detectTapGestures { offset ->
                    when (activeTool) {
                        DesktopTool.PUNCH -> {
                            // Generate procedural shatter fracture
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
                                    x = offset.x,
                                    y = offset.y,
                                    severity = punchLevel,
                                    rays = rays,
                                    rings = rings
                                )
                            )
                        }
                        DesktopTool.PAINT -> {
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
                                    x = offset.x,
                                    y = offset.y,
                                    color = colors.random(),
                                    radius = 18f + Random.nextFloat() * 16f,
                                    drips = drips
                                )
                            )
                        }
                        DesktopTool.SAPU_MOP -> {
                            // Clean nearby cracks/splatters
                            cracks.removeAll { (it.x - offset.x) * (it.x - offset.x) + (it.y - offset.y) * (it.y - offset.y) < 15000 }
                            splatters.removeAll { (it.x - offset.x) * (it.x - offset.x) + (it.y - offset.y) * (it.y - offset.y) < 15000 }
                        }
                        DesktopTool.LASER -> {
                            laserPos = offset
                        }
                        else -> {}
                    }
                }
            }
            .pointerInput(activeTool) {
                detectDragGestures { change, _ ->
                    if (activeTool == DesktopTool.SAPU_MOP) {
                        val pos = change.position
                        cracks.removeAll { (it.x - pos.x) * (it.x - pos.x) + (it.y - pos.y) * (it.y - pos.y) < 15000 }
                        splatters.removeAll { (it.x - pos.x) * (it.x - pos.x) + (it.y - pos.y) * (it.y - pos.y) < 15000 }
                    } else if (activeTool == DesktopTool.LASER) {
                        laserPos = change.position
                    }
                }
            }
    ) {
        // Draw Screen Fractures & Splatters
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Render cracks
            for (crack in cracks) {
                // Radial impact point
                drawCircle(
                    color = Color.White.copy(alpha = 0.85f),
                    radius = 8f + crack.severity * 3f,
                    center = Offset(crack.x, crack.y)
                )
                drawCircle(
                    color = Color(0xFF38BDF8).copy(alpha = 0.35f),
                    radius = 16f + crack.severity * 6f,
                    center = Offset(crack.x, crack.y)
                )

                // Render spiderweb rays
                for (ray in crack.rays) {
                    val endX = crack.x + (cos(ray.angle) * ray.length).toFloat()
                    val endY = crack.y + (sin(ray.angle) * ray.length).toFloat()

                    // Glow line
                    drawLine(
                        color = Color(0xFFBAE6FD).copy(alpha = 0.4f),
                        start = Offset(crack.x, crack.y),
                        end = Offset(endX, endY),
                        strokeWidth = (crack.severity * 1.5f) + 2f
                    )
                    // Sharp glass line
                    drawLine(
                        color = Color.White.copy(alpha = 0.9f),
                        start = Offset(crack.x, crack.y),
                        end = Offset(endX, endY),
                        strokeWidth = 1.2f
                    )

                    // Branches
                    for (branch in ray.branches) {
                        val branchStartX = crack.x + (cos(ray.angle) * (ray.length * branch.startRatio)).toFloat()
                        val branchStartY = crack.y + (sin(ray.angle) * (ray.length * branch.startRatio)).toFloat()
                        val bAngle = ray.angle + branch.angleOffset
                        val branchEndX = branchStartX + (cos(bAngle) * branch.length).toFloat()
                        val branchEndY = branchStartY + (sin(bAngle) * branch.length).toFloat()

                        drawLine(
                            color = Color.White.copy(alpha = 0.75f),
                            start = Offset(branchStartX, branchStartY),
                            end = Offset(branchEndX, branchEndY),
                            strokeWidth = 1.0f
                        )
                    }
                }

                // Render fracture rings
                for (ring in crack.rings) {
                    drawArc(
                        color = Color.White.copy(alpha = 0.7f),
                        startAngle = (ring.startAngle * 180 / Math.PI).toFloat(),
                        sweepAngle = ((ring.endAngle - ring.startAngle) * 180 / Math.PI).toFloat(),
                        useCenter = false,
                        topLeft = Offset(crack.x - ring.radius, crack.y - ring.radius),
                        size = androidx.compose.ui.geometry.Size(ring.radius * 2, ring.radius * 2),
                        style = Stroke(width = 1.2f)
                    )
                }
            }

            // Render Splatters
            for (splatter in splatters) {
                drawCircle(
                    color = splatter.color,
                    radius = splatter.radius,
                    center = Offset(splatter.x, splatter.y)
                )
                // Drips running down
                for (drip in splatter.drips) {
                    drawLine(
                        color = splatter.color,
                        start = Offset(splatter.x + drip.offsetX, splatter.y),
                        end = Offset(splatter.x + drip.offsetX, splatter.y + drip.length),
                        strokeWidth = drip.width
                    )
                    drawCircle(
                        color = splatter.color,
                        radius = drip.width * 1.2f,
                        center = Offset(splatter.x + drip.offsetX, splatter.y + drip.length)
                    )
                }
            }

            // Laser Pointer Dot
            laserPos?.let { pos ->
                drawCircle(
                    color = Color.Red.copy(alpha = 0.3f),
                    radius = 18f,
                    center = pos
                )
                drawCircle(
                    color = Color.Red,
                    radius = 6f,
                    center = pos
                )
                drawCircle(
                    color = Color.White,
                    radius = 2.5f,
                    center = pos
                )
            }
        }

        // Floating Overlay Toolbar
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp)
                .background(Color(0xE61E293B), RoundedCornerShape(20.dp))
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Punch
                Button(
                    onClick = { activeTool = DesktopTool.PUNCH },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.PUNCH) Color(0xFFEF4444) else Color(0xFF334155)
                    )
                ) {
                    Text("👊 Punch (${when (punchLevel) { 1 -> "Light"; 2 -> "Heavy"; else -> "SLEDGE" }})")
                }

                // Cycle punch power
                IconButton(
                    onClick = { punchLevel = if (punchLevel >= 3) 1 else punchLevel + 1 }
                ) {
                    Text("⚡", fontSize = 18.sp)
                }

                // Sapu / Mop
                Button(
                    onClick = { activeTool = DesktopTool.SAPU_MOP },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.SAPU_MOP) Color(0xFF10B981) else Color(0xFF334155)
                    )
                ) {
                    Text("🧹 Sapu / Mop")
                }

                // Paint
                Button(
                    onClick = { activeTool = DesktopTool.PAINT },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.PAINT) Color(0xFF8B5CF6) else Color(0xFF334155)
                    )
                ) {
                    Text("🎨 Paint")
                }

                // Laser
                Button(
                    onClick = { activeTool = DesktopTool.LASER },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.LASER) Color(0xFFEC4899) else Color(0xFF334155)
                    )
                ) {
                    Text("🔴 Laser")
                }

                // Clear
                Button(
                    onClick = {
                        cracks.clear()
                        splatters.clear()
                        laserPos = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF475569))
                ) {
                    Text("✨ Clean All")
                }
            }
        }

        // Floating Coach Object (Bottom Right)
        Box(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 32.dp, bottom = 120.dp)
        ) {
            Column(horizontalAlignment = Alignment.End) {
                AnimatedVisibility(
                    visible = showCoachDialog,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    Card(
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A).copy(alpha = 0.95f)),
                        modifier = Modifier.widthIn(max = 280.dp).padding(bottom = 8.dp)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "🚨 Focus Coach Alert",
                                color = Color(0xFFFBBF24),
                                style = MaterialTheme.typography.labelSmall
                            )
                            Spacer(Modifier.height(4.dp))
                            Text(
                                text = coachMessage,
                                color = Color.White,
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Spacer(Modifier.height(8.dp))
                            Button(
                                onClick = { showCoachDialog = false },
                                modifier = Modifier.align(Alignment.End),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6))
                            ) {
                                Text("I'm Working!", fontSize = 12.sp)
                            }
                        }
                    }
                }

                // Interactive Cat Loaf Mascot (Bottom Right Corner)
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = Color(0xFF1E293B).copy(alpha = 0.9f),
                    modifier = Modifier
                        .pointerInput(Unit) {
                            detectTapGestures {
                                catHappiness = (catHappiness + 15).coerceAtMost(100)
                                coachMessage = "🐱 *Purrrrrr* Cat is happy! Now get back to coding!"
                                showCoachDialog = true
                            }
                        }
                        .padding(4.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text("🐱", fontSize = 28.sp)
                        Spacer(Modifier.width(8.dp))
                        Column {
                            Text("Desk Loaf Cat", color = Color.White, style = MaterialTheme.typography.labelMedium)
                            Text("Happy: $catHappiness%", color = Color(0xFF34D399), style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }
        }
    }
}
