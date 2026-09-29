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
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.key.*
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

// Tool types for desktop fidget interactions
enum class DesktopTool {
    BOXING_GLOVE, SAPU_BROOM, WATER_GUN, PAINT_CANNON, LASER
}

// Cat living behavior states
enum class CatBehavior {
    WALKING_LEFT, WALKING_RIGHT, SITTING, LOAFING, SLEEPING, PETTED
}

// Procedural screen shatter fracture data structures
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

data class WaterSplash(
    val x: Float,
    val y: Float,
    val radius: Float,
    val alpha: Float = 0.8f
)

fun main() = application {
    val screenSize = Toolkit.getDefaultToolkit().screenSize

    // Active tool state:
    // When activeTool == null:
    // -> CAT MODE: Full screen is 100% UNBLOCKED.
    // -> The Cat window is a compact transparent cutout that walks/sits live on your screen over your apps.
    // When activeTool != null (Punch, Broom, Paint, Water):
    // -> ACTION OVERLAY MODE: Full-screen canvas allows punching fractures, spraying water/paint, sweeping.
    var activeTool by remember { mutableStateOf<DesktopTool?>(null) }
    var punchLevel by remember { mutableStateOf(2) }

    // Screen persistent effect lists
    val cracks = remember { mutableStateListOf<ScreenCrack>() }
    val splatters = remember { mutableStateListOf<PaintSplatter>() }
    val waterSplashes = remember { mutableStateListOf<WaterSplash>() }

    // Cat Position & Behavior State (Moves across user's screen)
    val catWindowWidth = 280.dp
    val catWindowHeight = 190.dp
    var catX by remember { mutableStateOf((screenSize.width - 340).toFloat().coerceAtLeast(40f)) }
    var catY by remember { mutableStateOf((screenSize.height - 250).toFloat().coerceAtLeast(40f)) }
    var catBehavior by remember { mutableStateOf(CatBehavior.SITTING) }
    var catPetCount by remember { mutableStateOf(0) }
    var catThought by remember { mutableStateOf("Meow! Focus buddy on duty! 🐾") }

    val catWindowState = rememberWindowState(
        position = WindowPosition(catX.dp, catY.dp),
        size = DpSize(catWindowWidth, catWindowHeight)
    )

    // Autonomous Cat life simulation: wandering, sitting, loafing, sleeping
    LaunchedEffect(Unit) {
        var tick = 0
        while (true) {
            delay(120)
            tick++

            // Change behavioral goals every ~10-15 seconds
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

            // Movement logic
            if (catBehavior == CatBehavior.WALKING_LEFT) {
                catX -= 2.5f
                if (catX <= 40f) {
                    catBehavior = CatBehavior.WALKING_RIGHT
                }
                catWindowState.position = WindowPosition(catX.dp, catY.dp)
            } else if (catBehavior == CatBehavior.WALKING_RIGHT) {
                catX += 2.5f
                if (catX >= screenSize.width - 320f) {
                    catBehavior = CatBehavior.WALKING_LEFT
                }
                catWindowState.position = WindowPosition(catX.dp, catY.dp)
            }
        }
    }

    // -----------------------------------------------------------------------------------------
    // WINDOW 1: LIVE ON-SCREEN CAT (Always visible, moves freely on screen, NEVER blocks clicks)
    // -----------------------------------------------------------------------------------------
    Window(
        onCloseRequest = ::exitApplication,
        title = "Live Desk Cat Companion",
        state = catWindowState,
        alwaysOnTop = true,
        undecorated = true,
        transparent = true
    ) {
        LiveDeskCatView(
            behavior = catBehavior,
            petCount = catPetCount,
            thought = catThought,
            activeTool = activeTool,
            onPetCat = {
                catPetCount++
                catBehavior = CatBehavior.PETTED
                catThought = "Purrrrrrr! 💖 Feels so good! (Pets: $catPetCount)"
            },
            onSelectTool = { tool ->
                activeTool = if (activeTool == tool) null else tool
            },
            onClose = ::exitApplication
        )
    }

    // -----------------------------------------------------------------------------------------
    // WINDOW 2: FULL-SCREEN INTERACTIVE ACTION OVERLAY (Only visible when a tool is selected!)
    // When activeTool == null, this window does not exist, so clicks pass directly to other apps!
    // -----------------------------------------------------------------------------------------
    if (activeTool != null) {
        val fullscreenState = rememberWindowState(
            position = WindowPosition(0.dp, 0.dp),
            size = DpSize(screenSize.width.dp, screenSize.height.dp)
        )

        Window(
            onCloseRequest = { activeTool = null },
            title = "DeskToy Screen Action Overlay",
            state = fullscreenState,
            alwaysOnTop = true,
            undecorated = true,
            transparent = true,
            onKeyEvent = { keyEvent ->
                if (keyEvent.type == KeyEventType.KeyDown) {
                    when (keyEvent.key) {
                        Key.Escape -> {
                            activeTool = null
                            true
                        }
                        Key.One -> {
                            activeTool = null
                            true
                        }
                        Key.Two -> {
                            activeTool = DesktopTool.BOXING_GLOVE
                            true
                        }
                        Key.Three -> {
                            activeTool = DesktopTool.SAPU_BROOM
                            true
                        }
                        Key.Four -> {
                            activeTool = DesktopTool.PAINT_CANNON
                            true
                        }
                        Key.Five -> {
                            activeTool = DesktopTool.WATER_GUN
                            true
                        }
                        else -> false
                    }
                } else false
            }
        ) {
            FullScreenActionOverlay(
                activeTool = activeTool!!,
                punchLevel = punchLevel,
                cracks = cracks,
                splatters = splatters,
                waterSplashes = waterSplashes,
                onPunchLevelChange = { punchLevel = if (punchLevel >= 3) 1 else punchLevel + 1 },
                onSelectTool = { tool -> activeTool = tool },
                onReturnToWork = { activeTool = null },
                onCleanScreen = {
                    cracks.clear()
                    splatters.clear()
                    waterSplashes.clear()
                    activeTool = null
                }
            )
        }
    }
}

/**
 * Cutout Live Cat that walks, loafs, sits, and reacts directly on your desktop.
 * Sized tightly to the cat so 99% of your screen is completely free and clickable!
 */
@Composable
fun androidx.compose.ui.window.WindowScope.LiveDeskCatView(
    behavior: CatBehavior,
    petCount: Int,
    thought: String,
    activeTool: DesktopTool?,
    onPetCat: () -> Unit,
    onSelectTool: (DesktopTool) -> Unit,
    onClose: () -> Unit
) {
    var isHovered by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Bottom
    ) {
        // 1. Thought Bubble (Dynamic Dialogue)
        Surface(
            shape = RoundedCornerShape(14.dp),
            color = Color(0xF00F172A),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x60F59E0B)),
            shadowElevation = 8.dp,
            modifier = Modifier.padding(bottom = 6.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = when (behavior) {
                        CatBehavior.SLEEPING -> "💤 $thought"
                        CatBehavior.PETTED -> "💖 $thought"
                        CatBehavior.LOAFING -> "🍞 $thought"
                        else -> "💭 $thought"
                    },
                    color = Color(0xFFFEF3C7),
                    fontSize = 10.5.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        // 2. Animated Cutout Cat Body (Draggable + Click to Pet)
        WindowDraggableArea {
            Box(
                modifier = Modifier
                    .size(110.dp, 82.dp)
                    .pointerInput(Unit) {
                        detectTapGestures(onTap = { onPetCat() })
                    },
                contentAlignment = Alignment.Center
            ) {
                // Procedural Illustrated Animated Cat
                ProceduralCatCanvas(behavior = behavior)

                // Close Button on hover
                IconButton(
                    onClick = onClose,
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .size(18.dp)
                        .background(Color(0x99000000), CircleShape)
                ) {
                    Text("✕", color = Color.White, fontSize = 9.sp)
                }
            }
        }

        Spacer(Modifier.height(4.dp))

        // 3. Mini Floating Tool Switcher Bar
        Surface(
            shape = RoundedCornerShape(16.dp),
            color = Color(0xEE0F172A),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x4038BDF8)),
            shadowElevation = 6.dp
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Pet / Cat Mode Indicator (Active when no tools are intercepting screen)
                Surface(
                    onClick = onPetCat,
                    shape = RoundedCornerShape(10.dp),
                    color = if (activeTool == null) Color(0xFF10B981) else Color(0xFF334155),
                    modifier = Modifier.height(24.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        Text("🐾", fontSize = 11.sp)
                        Text(
                            text = if (petCount > 0) "$petCount" else "Pet",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Punch Tool
                MiniToolButton(
                    emoji = "🥊",
                    title = "Punch",
                    isSelected = activeTool == DesktopTool.BOXING_GLOVE,
                    activeColor = Color(0xFFEF4444),
                    onClick = { onSelectTool(DesktopTool.BOXING_GLOVE) }
                )

                // Broom Tool
                MiniToolButton(
                    emoji = "🧹",
                    title = "Broom",
                    isSelected = activeTool == DesktopTool.SAPU_BROOM,
                    activeColor = Color(0xFF10B981),
                    onClick = { onSelectTool(DesktopTool.SAPU_BROOM) }
                )

                // Paint Tool
                MiniToolButton(
                    emoji = "🎨",
                    title = "Paint",
                    isSelected = activeTool == DesktopTool.PAINT_CANNON,
                    activeColor = Color(0xFF8B5CF6),
                    onClick = { onSelectTool(DesktopTool.PAINT_CANNON) }
                )

                // Water Gun Tool
                MiniToolButton(
                    emoji = "💧",
                    title = "Water",
                    isSelected = activeTool == DesktopTool.WATER_GUN,
                    activeColor = Color(0xFF0EA5E9),
                    onClick = { onSelectTool(DesktopTool.WATER_GUN) }
                )
            }
        }
    }
}

@Composable
fun MiniToolButton(
    emoji: String,
    title: String,
    isSelected: Boolean,
    activeColor: Color,
    onClick: () -> Unit
) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(10.dp),
        color = if (isSelected) activeColor else Color.Transparent,
        modifier = Modifier.size(24.dp)
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(emoji, fontSize = 12.sp)
        }
    }
}

/**
 * Procedural Vector Cat with animated tail, ears, and responsive facial expressions.
 */
@Composable
fun ProceduralCatCanvas(behavior: CatBehavior) {
    var animFrame by remember { mutableStateOf(0f) }

    LaunchedEffect(behavior) {
        while (true) {
            delay(50)
            animFrame = (animFrame + 0.15f) % (2f * Math.PI.toFloat())
        }
    }

    Canvas(modifier = Modifier.fillMaxSize()) {
        val catOrange = Color(0xFFF59E0B)
        val catShadow = Color(0xFFD97706)
        val catWhite = Color(0xFFFFFBEB)
        val catPink = Color(0xFFF472B6)

        val tailWag = sin(animFrame * 2f) * 12f
        val breath = sin(animFrame) * 1.5f

        // Tail
        val tailPath = Path().apply {
            moveTo(size.width * 0.22f, size.height * 0.72f)
            quadraticTo(
                size.width * 0.08f + tailWag,
                size.height * 0.5f,
                size.width * 0.14f + tailWag * 1.2f,
                size.height * 0.35f
            )
        }
        drawPath(
            path = tailPath,
            color = catShadow,
            style = Stroke(width = 8f)
        )

        // Cat Body
        drawRoundRect(
            color = catOrange,
            topLeft = Offset(size.width * 0.18f, size.height * 0.40f - breath),
            size = Size(size.width * 0.62f, size.height * 0.46f + breath),
            cornerRadius = CornerRadius(28f, 28f)
        )

        // White belly patch
        drawRoundRect(
            color = catWhite,
            topLeft = Offset(size.width * 0.32f, size.height * 0.52f),
            size = Size(size.width * 0.36f, size.height * 0.32f),
            cornerRadius = CornerRadius(20f, 20f)
        )

        // Cat Head
        val headY = size.height * 0.28f - breath * 0.5f
        drawCircle(
            color = catOrange,
            radius = 28f,
            center = Offset(size.width * 0.68f, headY)
        )

        // Ears
        val leftEar = Path().apply {
            moveTo(size.width * 0.60f, headY - 18f)
            lineTo(size.width * 0.56f, headY - 38f)
            lineTo(size.width * 0.66f, headY - 26f)
            close()
        }
        val rightEar = Path().apply {
            moveTo(size.width * 0.72f, headY - 26f)
            lineTo(size.width * 0.82f, headY - 38f)
            lineTo(size.width * 0.78f, headY - 18f)
            close()
        }
        drawPath(leftEar, catOrange)
        drawPath(rightEar, catOrange)
        drawPath(leftEar, catPink, style = Stroke(width = 2f))
        drawPath(rightEar, catPink, style = Stroke(width = 2f))

        // Eyes based on behavior
        when (behavior) {
            CatBehavior.SLEEPING -> {
                // Sleeping closed curved eyes "- -"
                drawLine(Color(0xFF78350F), Offset(size.width * 0.64f, headY - 4f), Offset(size.width * 0.68f, headY - 4f), 2.5f)
                drawLine(Color(0xFF78350F), Offset(size.width * 0.74f, headY - 4f), Offset(size.width * 0.78f, headY - 4f), 2.5f)
            }
            CatBehavior.PETTED -> {
                // Happy closed curved eyes "^ ^"
                drawLine(Color(0xFFB45309), Offset(size.width * 0.64f, headY - 3f), Offset(size.width * 0.66f, headY - 7f), 2.5f)
                drawLine(Color(0xFFB45309), Offset(size.width * 0.66f, headY - 7f), Offset(size.width * 0.68f, headY - 3f), 2.5f)
                drawLine(Color(0xFFB45309), Offset(size.width * 0.74f, headY - 3f), Offset(size.width * 0.76f, headY - 7f), 2.5f)
                drawLine(Color(0xFFB45309), Offset(size.width * 0.76f, headY - 7f), Offset(size.width * 0.78f, headY - 3f), 2.5f)
            }
            else -> {
                // Big shiny eyes "• •"
                drawCircle(Color(0xFF1E293B), radius = 4f, center = Offset(size.width * 0.66f, headY - 4f))
                drawCircle(Color(0xFF1E293B), radius = 4f, center = Offset(size.width * 0.76f, headY - 4f))
                // Glint
                drawCircle(Color.White, radius = 1.5f, center = Offset(size.width * 0.65f, headY - 5f))
                drawCircle(Color.White, radius = 1.5f, center = Offset(size.width * 0.75f, headY - 5f))
            }
        }

        // Cute Pink Nose & Mouth
        drawCircle(catPink, radius = 2f, center = Offset(size.width * 0.71f, headY + 3f))

        // Whiskers
        drawLine(Color(0xFF78350F), Offset(size.width * 0.58f, headY + 1f), Offset(size.width * 0.50f, headY - 2f), 1.2f)
        drawLine(Color(0xFF78350F), Offset(size.width * 0.58f, headY + 4f), Offset(size.width * 0.50f, headY + 5f), 1.2f)
        drawLine(Color(0xFF78350F), Offset(size.width * 0.82f, headY + 1f), Offset(size.width * 0.90f, headY - 2f), 1.2f)
        drawLine(Color(0xFF78350F), Offset(size.width * 0.82f, headY + 4f), Offset(size.width * 0.90f, headY + 5f), 1.2f)

        // Paws
        drawCircle(catWhite, radius = 8f, center = Offset(size.width * 0.36f, size.height * 0.84f))
        drawCircle(catWhite, radius = 8f, center = Offset(size.width * 0.64f, size.height * 0.84f))
    }
}

/**
 * Full-Screen Interaction Canvas.
 * Activated ONLY when user chooses Punch, Broom, Paint, or Water Gun.
 * Intercepts clicks to render realistic procedural cracks, splashes, and broom cleanup.
 */
@Composable
fun FullScreenActionOverlay(
    activeTool: DesktopTool,
    punchLevel: Int,
    cracks: MutableList<ScreenCrack>,
    splatters: MutableList<PaintSplatter>,
    waterSplashes: MutableList<WaterSplash>,
    onPunchLevelChange: () -> Unit,
    onSelectTool: (DesktopTool) -> Unit,
    onReturnToWork: () -> Unit,
    onCleanScreen: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent)
            .pointerInput(activeTool, punchLevel) {
                detectTapGestures { tapPos ->
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
                        DesktopTool.WATER_GUN -> {
                            waterSplashes.add(
                                WaterSplash(
                                    x = tapPos.x,
                                    y = tapPos.y,
                                    radius = 35f + Random.nextFloat() * 25f
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
                                (dx * dx + dy * dy) < 22000f
                            }
                            splatters.removeAll {
                                val dx = it.x - tapPos.x
                                val dy = it.y - tapPos.y
                                (dx * dx + dy * dy) < 22000f
                            }
                            waterSplashes.removeAll {
                                val dx = it.x - tapPos.x
                                val dy = it.y - tapPos.y
                                (dx * dx + dy * dy) < 22000f
                            }
                        }
                        else -> {}
                    }
                }
            }
            .pointerInput(activeTool) {
                detectDragGestures { change, _ ->
                    val dragPos = change.position
                    if (activeTool == DesktopTool.SAPU_BROOM) {
                        cracks.removeAll {
                            val dx = it.x - dragPos.x
                            val dy = it.y - dragPos.y
                            (dx * dx + dy * dy) < 22000f
                        }
                        splatters.removeAll {
                            val dx = it.x - dragPos.x
                            val dy = it.y - dragPos.y
                            (dx * dx + dy * dy) < 22000f
                        }
                        waterSplashes.removeAll {
                            val dx = it.x - dragPos.x
                            val dy = it.y - dragPos.y
                            (dx * dx + dy * dy) < 22000f
                        }
                    }
                }
            }
    ) {
        // Canvas Rendering Layer
        Canvas(modifier = Modifier.fillMaxSize()) {
            // 1. Water Splashes
            for (splash in waterSplashes) {
                drawCircle(
                    color = Color(0x6638BDF8),
                    radius = splash.radius,
                    center = Offset(splash.x, splash.y)
                )
                drawCircle(
                    color = Color(0x99BAE6FD),
                    radius = splash.radius * 0.6f,
                    center = Offset(splash.x, splash.y)
                )
                drawCircle(
                    color = Color.White.copy(alpha = 0.8f),
                    radius = splash.radius * 0.2f,
                    center = Offset(splash.x - splash.radius * 0.2f, splash.y - splash.radius * 0.2f)
                )
            }

            // 2. Procedural Cracks
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
                        size = Size(ring.radius * 2, ring.radius * 2),
                        style = Stroke(width = 1.2f)
                    )
                }
            }

            // 3. Paint Splatters
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

        // Top Navigation Control Bar
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
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = when (activeTool) {
                        DesktopTool.BOXING_GLOVE -> "🥊 Screen Punch Active (Click anywhere to shatter)"
                        DesktopTool.SAPU_BROOM -> "🧹 Broom Active (Drag to sweep & clean cracks)"
                        DesktopTool.PAINT_CANNON -> "🎨 Paint Cannon Active (Click to spray acrylics)"
                        DesktopTool.WATER_GUN -> "💧 Water Gun Active (Click to splash water)"
                        else -> "Screen Tool Active"
                    },
                    color = Color(0xFFFDE68A),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )

                // Back to Work / Cat Mode
                Button(
                    onClick = onReturnToWork,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text("🐾 Back to Work (Esc)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                // Clean & Resume Work
                Button(
                    onClick = onCleanScreen,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155)),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("🧹 Clean All", color = Color(0xFFE2E8F0), fontSize = 12.sp)
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
                    onClick = onReturnToWork,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155))
                ) {
                    Text("🐾 [1] Cat Mode")
                }

                Button(
                    onClick = { onSelectTool(DesktopTool.BOXING_GLOVE) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.BOXING_GLOVE) Color(0xFFEF4444) else Color(0xFF334155)
                    )
                ) {
                    Text("🥊 [2] Punch (${when (punchLevel) { 1 -> "1x"; 2 -> "2x"; else -> "MAX" }})")
                }

                IconButton(onClick = onPunchLevelChange) {
                    Text("⚡", fontSize = 16.sp)
                }

                Button(
                    onClick = { onSelectTool(DesktopTool.SAPU_BROOM) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.SAPU_BROOM) Color(0xFF10B981) else Color(0xFF334155)
                    )
                ) {
                    Text("🧹 [3] Broom")
                }

                Button(
                    onClick = { onSelectTool(DesktopTool.PAINT_CANNON) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.PAINT_CANNON) Color(0xFF8B5CF6) else Color(0xFF334155)
                    )
                ) {
                    Text("🎨 [4] Paint")
                }

                Button(
                    onClick = { onSelectTool(DesktopTool.WATER_GUN) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (activeTool == DesktopTool.WATER_GUN) Color(0xFF0EA5E9) else Color(0xFF334155)
                    )
                ) {
                    Text("💧 [5] Water")
                }
            }
        }
    }
}
