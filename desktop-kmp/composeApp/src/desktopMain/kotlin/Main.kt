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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.PointerEventType
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

// Data classes for full-screen effects
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

fun main() = application {
    // 100% Full-Screen Transparent Overlay Window across primary display
    val screenSize = Toolkit.getDefaultToolkit().screenSize
    val windowState = remember {
        WindowState(
            placement = WindowPlacement.Floating,
            width = screenSize.width.dp,
            height = screenSize.height.dp
        )
    }

    Window(
        onCloseRequest = ::exitApplication,
        title = "DeskToy Full-Screen Companion",
        state = windowState,
        alwaysOnTop = true,
        undecorated = true,
        transparent = true
    ) {
        DeskToyFullScreenOverlay()
    }
}

@Composable
fun DeskToyFullScreenOverlay() {
    var activeTool by remember { mutableStateOf(DesktopTool.BOXING_GLOVE) }
    var punchLevel by remember { mutableStateOf(2) }
    val cracks = remember { mutableStateListOf<ScreenCrack>() }
    val splatters = remember { mutableStateListOf<PaintSplatter>() }
    var mousePos by remember { mutableStateOf(Offset(200f, 200f)) }
    var laserPos by remember { mutableStateOf<Offset?>(null) }
    var isPunchingAnim by remember { mutableStateOf(false) }

    // Cat roaming state
    var catPos by remember { mutableStateOf(Offset(250f, 600f)) }
    var catHappiness by remember { mutableStateOf(100) }
    var catThought by remember { mutableStateOf("Meow! Don't switch to YouTube! 🐾") }

    // Floating Coach Drone state
    var coachMessage by remember { mutableStateOf("Hey! Stop getting distracted and finish that code! 🎯") }
    var showCoachBubble by remember { mutableStateOf(true) }

    // Periodic reminder check-ins
    LaunchedEffect(Unit) {
        val quotes = listOf(
            "Oi! Did that YouTube video solve your bug yet?",
            "Punch the monitor with the boxing glove if stressed!",
            "Take 3 deep breaths, pet the cat, then back to work!",
            "Dopamine is cheap, shipping production code is priceless.",
            "I saw you open Reddit. Don't test me!"
        )
        while (true) {
            delay(30000)
            coachMessage = quotes.random()
            showCoachBubble = true
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent)
            .pointerInput(activeTool, punchPowerLevel = punchLevel) {
                detectTapGestures { offset ->
                    mousePos = offset
                    when (activeTool) {
                        DesktopTool.BOXING_GLOVE -> {
                            isPunchingAnim = true
                            // Generate procedural shatter fracture across screen
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
                                    x = offset.x,
                                    y = offset.y,
                                    color = colors.random(),
                                    radius = 18f + Random.nextFloat() * 16f,
                                    drips = drips
                                )
                            )
                        }
                        DesktopTool.SAPU_BROOM -> {
                            cracks.removeAll { (it.x - offset.x) * (it.x - offset.x) + (it.y - offset.y) * (it.y - offset.y) < 18000 }
                            splatters.removeAll { (it.x - offset.x) * (it.x - offset.x) + (it.y - offset.y) * (it.y - offset.y) < 18000 }
                        }
                        DesktopTool.LASER -> {
                            laserPos = offset
                            // Cat follows laser
                            catPos = Offset(
                                (catPos.x + (offset.x - catPos.x) * 0.3f).coerceIn(40f, 1600f),
                                (catPos.y + (offset.y - catPos.y) * 0.3f).coerceIn(40f, 900f)
                            )
                        }
                        else -> {}
                    }
                }
            }
            .pointerInput(activeTool) {
                detectDragGestures { change, _ ->
                    mousePos = change.position
                    if (activeTool == DesktopTool.SAPU_BROOM) {
                        val pos = change.position
                        cracks.removeAll { (it.x - pos.x) * (it.x - pos.x) + (it.y - pos.y) * (it.y - pos.y) < 18000 }
                        splatters.removeAll { (it.x - pos.x) * (it.x - pos.x) + (it.y - pos.y) * (it.y - pos.y) < 18000 }
                    } else if (activeTool == DesktopTool.LASER) {
                        laserPos = change.position
                        catPos = Offset(
                            (catPos.x + (change.position.x - catPos.x) * 0.15f).coerceIn(40f, 1600f),
                            (catPos.y + (change.position.y - catPos.y) * 0.15f).coerceIn(40f, 900f)
                        )
                    }
                }
            }
    ) {
        // 1. Full-Screen Canvas (Procedural Cracks, Glass Shards, Splatters)
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Render Cracks
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

            // Render Splatters
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

            // Laser Dot
            laserPos?.let { pos ->
                drawCircle(color = Color.Red.copy(alpha = 0.3f), radius = 20f, center = pos)
                drawCircle(color = Color.Red, radius = 6f, center = pos)
                drawCircle(color = Color.White, radius = 2.5f, center = pos)
            }
        }

        // 2. Floating Cat Sitting / Roaming anywhere on screen with Pet function
        Box(
            modifier = Modifier
                .offset(x = catPos.x.dp, y = catPos.y.dp)
                .pointerInput(Unit) {
                    detectTapGestures {
                        catHappiness = (catHappiness + 15).coerceAtMost(100)
                        catThought = "Purrrrrr! 💖 That feels amazing! +10 Focus Power!"
                    }
                }
        ) {
            Column(horizontalAlignment = Alignment.CenterVertically) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF0F172A).copy(alpha = 0.95f),
                    modifier = Modifier.padding(bottom = 4.dp)
                ) {
                    Text(
                        text = catThought,
                        color = Color(0xFFFDE68A),
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFFF59E0B),
                    modifier = Modifier.size(64.dp, 44.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("🐱", fontSize = 26.sp)
                    }
                }
                Text("Click to pet 🐾", color = Color(0xFFE2E8F0), fontSize = 9.sp)
            }
        }

        // 3. Floating Coach Drone (Telling you to come back to work)
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 40.dp, end = 40.dp)
        ) {
            Column(horizontalAlignment = Alignment.End) {
                AnimatedVisibility(
                    visible = showCoachBubble,
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
                                onClick = { showCoachBubble = false },
                                modifier = Modifier.align(Alignment.End),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3B82F6))
                            ) {
                                Text("I'm Working!", fontSize = 12.sp)
                            }
                        }
                    }
                }
                Surface(
                    shape = CircleShape,
                    color = Color(0xFF4F46E5),
                    modifier = Modifier
                        .size(54.dp)
                        .pointerInput(Unit) {
                            detectTapGestures { showCoachBubble = !showCoachBubble }
                        }
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("👔", fontSize = 26.sp)
                    }
                }
            }
        }

        // 4. Floating Minimal Bottom Dock for Tools
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 24.dp)
                .background(Color(0xE60F172A), RoundedCornerShape(24.dp))
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
                    Text("✨ Clean All")
                }
            }
        }
    }
}
