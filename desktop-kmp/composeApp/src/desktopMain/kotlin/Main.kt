package com.desktoy.focusbuddy

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.window.WindowDraggableArea
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.key.*
import androidx.compose.ui.input.pointer.isSecondaryPressed
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.DpOffset
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
    BOXING_GLOVE, SAPU_BROOM, WATER_GUN, PAINT_CANNON
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
    val radius: Float
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
    val catWindowWidth = 240.dp
    val catWindowHeight = 175.dp
    var catX by remember { mutableStateOf((screenSize.width - 320).toFloat().coerceAtLeast(40f)) }
    var catY by remember { mutableStateOf((screenSize.height - 230).toFloat().coerceAtLeast(40f)) }
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
                if (catX <= 30f) {
                    catBehavior = CatBehavior.WALKING_RIGHT
                }
                catWindowState.position = WindowPosition(catX.dp, catY.dp)
            } else if (catBehavior == CatBehavior.WALKING_RIGHT) {
                catX += 2.5f
                if (catX >= screenSize.width - 260f) {
                    catBehavior = CatBehavior.WALKING_LEFT
                }
                catWindowState.position = WindowPosition(catX.dp, catY.dp)
            }
        }
    }

    // -----------------------------------------------------------------------------------------
    // WINDOW 1: LIVE ON-SCREEN LOW-POLY CAT (Poly Pizza 6dM1J6f6pm9)
    // Always visible, moves freely on screen, NEVER blocks clicks on other apps!
    // NO annoying bottom bar. Pure desktop companion.
    // -----------------------------------------------------------------------------------------
    Window(
        onCloseRequest = ::exitApplication,
        title = "Live Low-Poly Desk Cat Companion",
        state = catWindowState,
        alwaysOnTop = true,
        undecorated = true,
        transparent = true,
        onKeyEvent = { keyEvent ->
            if (keyEvent.type == KeyEventType.KeyDown) {
                when (keyEvent.key) {
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
                    Key.P -> {
                        catPetCount++
                        catBehavior = CatBehavior.PETTED
                        catThought = "Purrrrrrr! 💖 Feels amazing! (Pets: $catPetCount)"
                        true
                    }
                    Key.C -> {
                        // Cycle cat pose
                        catBehavior = when (catBehavior) {
                            CatBehavior.SITTING -> CatBehavior.WALKING_RIGHT
                            CatBehavior.WALKING_RIGHT -> CatBehavior.LOAFING
                            CatBehavior.LOAFING -> CatBehavior.SLEEPING
                            else -> CatBehavior.SITTING
                        }
                        true
                    }
                    Key.Q -> {
                        exitApplication()
                        true
                    }
                    else -> false
                }
            } else false
        }
    ) {
        LiveDeskCatView(
            behavior = catBehavior,
            thought = catThought,
            petCount = catPetCount,
            onPetCat = {
                catPetCount++
                catBehavior = CatBehavior.PETTED
                catThought = "Purrrrrrr! 💖 Feels amazing! (Pets: $catPetCount)"
            },
            onSelectTool = { tool ->
                activeTool = tool
            },
            onCyclePose = {
                catBehavior = when (catBehavior) {
                    CatBehavior.SITTING -> CatBehavior.WALKING_RIGHT
                    CatBehavior.WALKING_RIGHT -> CatBehavior.LOAFING
                    CatBehavior.LOAFING -> CatBehavior.SLEEPING
                    else -> CatBehavior.SITTING
                }
            },
            onClose = ::exitApplication
        )
    }

    // -----------------------------------------------------------------------------------------
    // WINDOW 2: FULL-SCREEN INTERACTIVE ACTION OVERLAY (Only visible when a tool is selected!)
    // When activeTool == null, this window does NOT exist, so clicks pass directly to other apps!
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
                        Key.Escape, Key.One -> {
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
 * Cutout Live Low-Poly Cat from Poly Pizza (6dM1J6f6pm9).
 * Completely clean without any annoying bottom bars or intrusive close buttons over the cat.
 * Right-click opens desktop context menu; shortcuts 1-5 switch tools on the fly!
 */
@Composable
fun androidx.compose.ui.window.WindowScope.LiveDeskCatView(
    behavior: CatBehavior,
    thought: String,
    petCount: Int,
    onPetCat: () -> Unit,
    onSelectTool: (DesktopTool) -> Unit,
    onCyclePose: () -> Unit,
    onClose: () -> Unit
) {
    var showContextMenu by remember { mutableStateOf(false) }
    var animFrame by remember { mutableStateOf(0f) }

    LaunchedEffect(behavior) {
        while (true) {
            delay(50)
            animFrame = (animFrame + 0.12f) % (2f * Math.PI.toFloat())
        }
    }

    // Subtle gentle breathing bounce
    val breathOffset = if (behavior == CatBehavior.SLEEPING || behavior == CatBehavior.LOAFING) {
        sin(animFrame) * 1.5f
    } else {
        sin(animFrame * 1.5f) * 2.0f
    }

    val isFacingRight = behavior != CatBehavior.WALKING_LEFT
    val catBitmap = remember(isFacingRight) {
        CatImageLoader.getCatImage(isFacingRight)
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Bottom
    ) {
        // 1. Thought Bubble (Dynamic Dialogue & Tips)
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = Color(0xF20F172A),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x60F59E0B)),
            shadowElevation = 6.dp,
            modifier = Modifier.padding(bottom = 4.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(5.dp)
            ) {
                Text(
                    text = when (behavior) {
                        CatBehavior.SLEEPING -> "💤 $thought"
                        CatBehavior.PETTED -> "💖 $thought"
                        CatBehavior.LOAFING -> "🍞 $thought"
                        else -> "💭 $thought"
                    },
                    color = Color(0xFFFEF3C7),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        // 2. Pure Low-Poly Cat Model (No intrusive borders, no close icons overlapping ears)
        // Click to pet, Drag to move anywhere, Right-click for quick menu
        WindowDraggableArea {
            Box(
                modifier = Modifier
                    .size(130.dp, 105.dp)
                    .offset(y = breathOffset.dp)
                    .pointerInput(Unit) {
                        detectTapGestures(
                            onTap = { onPetCat() },
                            onLongPress = { showContextMenu = true }
                        )
                    }
                    .pointerInput(Unit) {
                        // Right-click support
                        awaitPointerEventScope {
                            while (true) {
                                val event = awaitPointerEvent()
                                if (event.buttons.isSecondaryPressed) {
                                    showContextMenu = true
                                }
                            }
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                if (catBitmap != null) {
                    Image(
                        bitmap = catBitmap,
                        contentDescription = "Poly Pizza Low-Poly Cat",
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    // Fallback to geometric stylized low-poly cat canvas if image loading fails
                    LowPolyCatGeometricCanvas(behavior = behavior, animFrame = animFrame)
                }

                // Desktop Context Menu (Opens on Right-Click or Long Press)
                DropdownMenu(
                    expanded = showContextMenu,
                    onDismissRequest = { showContextMenu = false },
                    offset = DpOffset(0.dp, 10.dp)
                ) {
                    DropdownMenuItem(
                        text = { Text("🐾 Pet Cat (P)") },
                        onClick = {
                            onPetCat()
                            showContextMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("🥊 Punch Screen (2)") },
                        onClick = {
                            onSelectTool(DesktopTool.BOXING_GLOVE)
                            showContextMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("🧹 Broom & Clean (3)") },
                        onClick = {
                            onSelectTool(DesktopTool.SAPU_BROOM)
                            showContextMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("🎨 Paint Cannon (4)") },
                        onClick = {
                            onSelectTool(DesktopTool.PAINT_CANNON)
                            showContextMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("💧 Water Gun (5)") },
                        onClick = {
                            onSelectTool(DesktopTool.WATER_GUN)
                            showContextMenu = false
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("🔄 Change Cat Pose (C)") },
                        onClick = {
                            onCyclePose()
                            showContextMenu = false
                        }
                    )
                    HorizontalDivider()
                    DropdownMenuItem(
                        text = { Text("❌ Exit Companion (Q)", color = Color(0xFFEF4444)) },
                        onClick = {
                            onClose()
                            showContextMenu = false
                        }
                    )
                }
            }
        }
    }
}

/**
 * Low-Poly Vector Fallback if PNG is ever missing.
 */
@Composable
fun LowPolyCatGeometricCanvas(behavior: CatBehavior, animFrame: Float) {
    Canvas(modifier = Modifier.fillMaxSize()) {
        val catOrange = Color(0xFFEA580C)
        val catLightOrange = Color(0xFFF97316)
        val catCream = Color(0xFFFEF3C7)
        val catPink = Color(0xFFF472B6)

        // Low-poly body facet
        val bodyPath = androidx.compose.ui.graphics.Path().apply {
            moveTo(size.width * 0.25f, size.height * 0.75f)
            lineTo(size.width * 0.45f, size.height * 0.40f)
            lineTo(size.width * 0.75f, size.height * 0.45f)
            lineTo(size.width * 0.85f, size.height * 0.80f)
            lineTo(size.width * 0.55f, size.height * 0.85f)
            close()
        }
        drawPath(bodyPath, catOrange)

        // Low-poly belly highlight facet
        val bellyPath = androidx.compose.ui.graphics.Path().apply {
            moveTo(size.width * 0.45f, size.height * 0.55f)
            lineTo(size.width * 0.65f, size.height * 0.52f)
            lineTo(size.width * 0.70f, size.height * 0.80f)
            lineTo(size.width * 0.48f, size.height * 0.82f)
            close()
        }
        drawPath(bellyPath, catCream)

        // Low-poly Head facet
        val headPath = androidx.compose.ui.graphics.Path().apply {
            moveTo(size.width * 0.65f, size.height * 0.22f)
            lineTo(size.width * 0.82f, size.height * 0.26f)
            lineTo(size.width * 0.88f, size.height * 0.50f)
            lineTo(size.width * 0.72f, size.height * 0.58f)
            lineTo(size.width * 0.58f, size.height * 0.42f)
            close()
        }
        drawPath(headPath, catLightOrange)

        // Low-poly Ears
        val ear1 = androidx.compose.ui.graphics.Path().apply {
            moveTo(size.width * 0.65f, size.height * 0.22f)
            lineTo(size.width * 0.62f, size.height * 0.08f)
            lineTo(size.width * 0.73f, size.height * 0.18f)
            close()
        }
        val ear2 = androidx.compose.ui.graphics.Path().apply {
            moveTo(size.width * 0.78f, size.height * 0.20f)
            lineTo(size.width * 0.88f, size.height * 0.08f)
            lineTo(size.width * 0.84f, size.height * 0.26f)
            close()
        }
        drawPath(ear1, catOrange)
        drawPath(ear2, catOrange)
        drawPath(ear1, catPink, style = Stroke(1.5f))
        drawPath(ear2, catPink, style = Stroke(1.5f))

        // Eyes
        drawCircle(Color(0xFF1E293B), radius = 3.5f, center = Offset(size.width * 0.70f, size.height * 0.36f))
        drawCircle(Color(0xFF1E293B), radius = 3.5f, center = Offset(size.width * 0.81f, size.height * 0.38f))

        // Low-poly Tail
        val tailWag = sin(animFrame * 2f) * 8f
        val tailPath = androidx.compose.ui.graphics.Path().apply {
            moveTo(size.width * 0.25f, size.height * 0.70f)
            lineTo(size.width * 0.12f + tailWag, size.height * 0.50f)
            lineTo(size.width * 0.16f + tailWag, size.height * 0.36f)
        }
        drawPath(tailPath, catOrange, style = Stroke(7f))
    }
}

/**
 * Full-Screen Interaction Canvas.
 * Activated ONLY when user chooses Punch, Broom, Paint, or Water Gun via hotkeys (2, 3, 4, 5) or right-click menu.
 * Press [1] or [Esc] to exit and return to normal unblocked screen!
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

        // Sleek Minimal Top Bar for Active Tool Mode
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
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 9.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = when (activeTool) {
                        DesktopTool.BOXING_GLOVE -> "🥊 Punch Active (Click to shatter)"
                        DesktopTool.SAPU_BROOM -> "🧹 Broom Active (Drag to clean)"
                        DesktopTool.PAINT_CANNON -> "🎨 Paint Active (Click to spray)"
                        DesktopTool.WATER_GUN -> "💧 Water Gun Active (Click to splash)"
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
                    Text("🐾 Back to Work [1 / Esc]", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.5.sp)
                }

                // Clean & Resume Work
                Button(
                    onClick = onCleanScreen,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF334155)),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text("🧹 Clean All", color = Color(0xFFE2E8F0), fontSize = 11.5.sp)
                }
            }
        }
    }
}
