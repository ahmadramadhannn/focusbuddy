package com.desktoy.focusbuddy

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.*
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
    val screenSize = Toolkit.getDefaultToolkit().screenSize
    
    // Compact side companion window state (floats bottom right alongside open apps)
    val windowWidth = 380.dp
    val windowHeight = 620.dp
    val windowState = rememberWindowState(
        width = windowWidth,
        height = windowHeight,
        position = WindowPosition(
            x = (screenSize.width - 420).dp,
            y = (screenSize.height - 700).dp
        )
    )

    // Transparent Always-On-Top Floating Companion Window
    Window(
        onCloseRequest = ::exitApplication,
        title = "DeskToy Side Companion",
        state = windowState,
        alwaysOnTop = true,
        undecorated = true,
        transparent = true,
        resizable = false
    ) {
        DeskToySideWidget(onClose = ::exitApplication, windowScope = this)
    }
}

@Composable
fun DeskToySideWidget(onClose: () -> Unit, windowScope: FrameWindowScope) {
    var activeTool by remember { mutableStateOf(DesktopTool.PUNCH) }
    var punchLevel by remember { mutableStateOf(2) }
    val cracks = remember { mutableStateListOf<ScreenCrack>() }
    val splatters = remember { mutableStateListOf<PaintSplatter>() }
    var laserPos by remember { mutableStateOf<Offset?>(null) }
    var coachMessage by remember { mutableStateOf("Stay in this tab and write that code! 🚀") }
    var catHappiness by remember { mutableStateOf(90) }
    var catThought by remember { mutableStateOf("Purrrr... I'm resting right here beside you! 🐾") }

    // Periodic coach check-in
    LaunchedEffect(Unit) {
        val quotes = listOf(
            "Oi! Did YouTube write that code? Back to work!",
            "I'm keeping an eye on your mouse clicks! Keep going!",
            "Take 3 deep breaths, smash the glass once, then focus!",
            "Dopamine from shipping is 10x better than scrolling.",
            "Close the distraction tab. You've got this!"
        )
        while (true) {
            delay(30000)
            coachMessage = quotes.random()
        }
    }

    // Sleek floating glass card that sits alongside user's desktop windows
    Surface(
        shape = RoundedCornerShape(24.dp),
        color = Color(0xFA0F172A),
        border = androidx.compose.foundation.BorderStroke(1.5.dp, Color(0xFF334155)),
        shadowElevation = 16.dp,
        modifier = Modifier.fillMaxSize().padding(8.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Draggable Header Bar
            windowScope.WindowDraggableArea {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0x334F46E5)
                        ) {
                            Text("🎯", modifier = Modifier.padding(4.dp), fontSize = 14.sp)
                        }
                        Spacer(Modifier.width(8.dp))
                        Column {
                            Text(
                                "DeskToy Companion",
                                color = Color.White,
                                style = MaterialTheme.typography.labelMedium,
                                fontSize = 12.sp
                            )
                            Text(
                                "Always on Top • Side Widget",
                                color = Color(0xFF34D399),
                                style = MaterialTheme.typography.labelSmall,
                                fontSize = 9.sp
                            )
                        }
                    }

                    // Close Button
                    IconButton(onClick = onClose, modifier = Modifier.size(24.dp)) {
                        Text("✕", color = Color(0xFF94A3B8), fontSize = 12.sp)
                    }
                }
            }

            Spacer(Modifier.height(8.dp))

            // Coach Quote Banner
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = Color(0x33312E81),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x554338CA)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("👔", fontSize = 16.sp)
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = coachMessage,
                        color = Color(0xFFE2E8F0),
                        fontSize = 11.sp,
                        lineHeight = 14.sp
                    )
                }
            }

            Spacer(Modifier.height(8.dp))

            // Interactive Punch Target Screen Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .background(Color(0xFF020617), RoundedCornerShape(16.dp))
                    .pointerInput(activeTool, punchLevel) {
                        detectTapGestures { offset ->
                            when (activeTool) {
                                DesktopTool.PUNCH -> {
                                    val numRays = 6 + punchLevel * 3
                                    val maxRadius = 35f + punchLevel * 25f
                                    val rays = (0 until numRays).map { i ->
                                        val baseAngle = (i.toDouble() / numRays) * (2 * Math.PI) + (Random.nextDouble() - 0.5) * 0.4
                                        val length = maxRadius * (0.6f + Random.nextFloat() * 0.6f)
                                        CrackRay(baseAngle, length, emptyList())
                                    }
                                    val rings = (1..punchLevel + 1).map { ringIdx ->
                                        CrackRing(
                                            radius = (ringIdx * 14f) + (Random.nextFloat() * 6f),
                                            startAngle = 0.0,
                                            endAngle = 2 * Math.PI
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
                                DesktopTool.SAPU_MOP -> {
                                    cracks.removeAll { (it.x - offset.x) * (it.x - offset.x) + (it.y - offset.y) * (it.y - offset.y) < 4000 }
                                    splatters.removeAll { (it.x - offset.x) * (it.x - offset.x) + (it.y - offset.y) * (it.y - offset.y) < 4000 }
                                }
                                DesktopTool.PAINT -> {
                                    val colors = listOf(Color(0xFFEF4444), Color(0xFF10B981), Color(0xFF8B5CF6), Color(0xFFF59E0B))
                                    splatters.add(
                                        PaintSplatter(
                                            x = offset.x,
                                            y = offset.y,
                                            color = colors.random(),
                                            radius = 12f + Random.nextFloat() * 10f,
                                            drips = listOf(SplatterDrip(20f + Random.nextFloat() * 30f, 3f, 0f))
                                        )
                                    )
                                }
                                else -> {}
                            }
                        }
                    }
            ) {
                // Background screen hints
                Column(
                    modifier = Modifier.padding(10.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("● IDE: DeepWorkSession.kt", color = Color(0xFF475569), fontSize = 9.sp)
                    Text("👊 Click box to Punch & Shatter Glass", color = Color(0xFF64748B), fontSize = 10.sp)
                }

                // Canvas for cracks and splatters
                Canvas(modifier = Modifier.fillMaxSize()) {
                    for (crack in cracks) {
                        drawCircle(Color.White, radius = 5f, center = Offset(crack.x, crack.y))
                        for (ray in crack.rays) {
                            val endX = crack.x + (cos(ray.angle) * ray.length).toFloat()
                            val endY = crack.y + (sin(ray.angle) * ray.length).toFloat()
                            drawLine(Color.White.copy(alpha = 0.85f), Offset(crack.x, crack.y), Offset(endX, endY), strokeWidth = 1.2f)
                        }
                        for (ring in crack.rings) {
                            drawArc(
                                color = Color.White.copy(alpha = 0.5f),
                                startAngle = 0f,
                                sweepAngle = 360f,
                                useCenter = false,
                                topLeft = Offset(crack.x - ring.radius, crack.y - ring.radius),
                                size = androidx.compose.ui.geometry.Size(ring.radius * 2, ring.radius * 2),
                                style = Stroke(width = 1f)
                            )
                        }
                    }
                    for (splatter in splatters) {
                        drawCircle(splatter.color, radius = splatter.radius, center = Offset(splatter.x, splatter.y))
                    }
                }
            }

            Spacer(Modifier.height(8.dp))

            // Tool Switcher Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Button(
                    onClick = { activeTool = DesktopTool.PUNCH },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.PUNCH) Color(0xFFEF4444) else Color(0xFF1E293B)
                    ),
                    modifier = Modifier.weight(1f).height(36.dp),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text("👊 Punch", fontSize = 11.sp)
                }

                Button(
                    onClick = { punchLevel = if (punchLevel >= 3) 1 else punchLevel + 1 },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155)),
                    modifier = Modifier.height(36.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    Text(if (punchLevel == 1) "1x" else if (punchLevel == 2) "2x" else "MAX", fontSize = 10.sp, color = Color(0xFFFBBF24))
                }

                Button(
                    onClick = { activeTool = DesktopTool.SAPU_MOP },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.SAPU_MOP) Color(0xFF10B981) else Color(0xFF1E293B)
                    ),
                    modifier = Modifier.weight(1f).height(36.dp),
                    contentPadding = PaddingValues(0.dp)
                ) {
                    Text("🧹 Sapu", fontSize = 11.sp)
                }

                Button(
                    onClick = { activeTool = DesktopTool.PAINT },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.PAINT) Color(0xFF8B5CF6) else Color(0xFF1E293B)
                    ),
                    modifier = Modifier.height(36.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    Text("🎨", fontSize = 12.sp)
                }

                Button(
                    onClick = {
                        cracks.clear()
                        splatters.clear()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155)),
                    modifier = Modifier.height(36.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp)
                ) {
                    Text("✨", fontSize = 12.sp)
                }
            }

            Spacer(Modifier.height(8.dp))

            // Interactive Loaf Cat Area
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF1E293B),
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        catHappiness = (catHappiness + 10).coerceAtMost(100)
                        catThought = "❤️ *Purrrrrr* Cat is super happy! Now keep coding!"
                    }
                    .padding(2.dp)
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🐱", fontSize = 26.sp)
                        Spacer(Modifier.width(8.dp))
                        Column {
                            Text("Desk Loaf Cat", color = Color.White, fontSize = 11.sp)
                            Text(catThought, color = Color(0xFF94A3B8), fontSize = 9.sp, maxLines = 1)
                        }
                    }
                    Text("Pet Me", color = Color(0xFF818CF8), fontSize = 10.sp)
                }
            }

            Spacer(Modifier.height(4.dp))
            Text(
                "Floats alongside VS Code & Chrome • Click-through ready",
                color = Color(0xFF475569),
                fontSize = 8.sp,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )
        }
    }
}
