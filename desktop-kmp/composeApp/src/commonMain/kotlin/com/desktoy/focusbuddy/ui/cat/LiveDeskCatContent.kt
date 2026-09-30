package com.desktoy.focusbuddy.ui.cat

import androidx.compose.foundation.Image
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.isSecondaryPressed
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.DpOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.desktoy.focusbuddy.model.CatBehavior
import com.desktoy.focusbuddy.model.DesktopTool
import com.desktoy.focusbuddy.state.DeskToyAppState
import com.desktoy.focusbuddy.ui.theme.DeskToyColors
import com.desktoy.focusbuddy.util.CatImageLoader
import kotlinx.coroutines.delay
import kotlin.math.PI
import kotlin.math.sin

/**
 * Cutout Live Low-Poly Cat view.
 * Completely clean without any intrusive bottom bars or buttons overlapping the cat.
 * Right-click opens desktop context menu; shortcuts 1-5 switch tools on the fly!
 */
@Composable
fun LiveDeskCatContent(
    state: DeskToyAppState,
    onCloseApp: () -> Unit,
    modifier: Modifier = Modifier,
    draggableModifier: Modifier = Modifier
) {
    var showContextMenu by remember { mutableStateOf(false) }
    var animFrame by remember { mutableStateOf(0f) }

    LaunchedEffect(state.catBehavior) {
        while (true) {
            delay(50)
            animFrame = (animFrame + 0.12f) % (2f * PI.toFloat())
        }
    }

    // Subtle gentle breathing bounce
    val breathOffset = if (state.catBehavior == CatBehavior.SLEEPING || state.catBehavior == CatBehavior.LOAFING) {
        sin(animFrame) * 1.5f
    } else {
        sin(animFrame * 1.5f) * 2.0f
    }

    val isFacingRight = state.catBehavior != CatBehavior.WALKING_LEFT
    val catBitmap = remember(isFacingRight) {
        CatImageLoader.getCatImage(isFacingRight)
    }

    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Bottom
    ) {
        // 1. Thought Bubble (Dynamic Dialogue & Tips)
        Surface(
            shape = RoundedCornerShape(12.dp),
            color = DeskToyColors.CardBackground,
            border = androidx.compose.foundation.BorderStroke(1.dp, DeskToyColors.CardBorder),
            shadowElevation = 6.dp,
            modifier = Modifier.padding(bottom = 4.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(5.dp)
            ) {
                Text(
                    text = when (state.catBehavior) {
                        CatBehavior.SLEEPING -> "💤 ${state.catThought}"
                        CatBehavior.PETTED -> "💖 ${state.catThought}"
                        CatBehavior.LOAFING -> "🍞 ${state.catThought}"
                        else -> "💭 ${state.catThought}"
                    },
                    color = DeskToyColors.TextAmber,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        // 2. Pure Low-Poly Cat Model
        // Click to pet, Drag to move anywhere, Right-click for quick menu
        Box(
            modifier = draggableModifier
                .size(130.dp, 105.dp)
                .offset(y = breathOffset.dp)
                .pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { state.petCat() },
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
            // Real-Time 3D Faceted Geometry Model (Poly Pizza 6dM1J6f6pm9)
            LowPoly3DCatMesh(
                behavior = state.catBehavior,
                isFacingRight = isFacingRight,
                modifier = Modifier.fillMaxSize()
            )

            // Desktop Context Menu (Opens on Right-Click or Long Press)
            DropdownMenu(
                expanded = showContextMenu,
                onDismissRequest = { showContextMenu = false },
                offset = DpOffset(0.dp, 10.dp)
            ) {
                DropdownMenuItem(
                    text = { Text("🐾 Pet Cat (P)") },
                    onClick = {
                        state.petCat()
                        showContextMenu = false
                    }
                )
                DropdownMenuItem(
                    text = { Text("🥊 Punch Screen (2)") },
                    onClick = {
                        state.selectTool(DesktopTool.BOXING_GLOVE)
                        showContextMenu = false
                    }
                )
                DropdownMenuItem(
                    text = { Text("🧹 Broom & Clean (3)") },
                    onClick = {
                        state.selectTool(DesktopTool.SAPU_BROOM)
                        showContextMenu = false
                    }
                )
                DropdownMenuItem(
                    text = { Text("🎨 Paint Cannon (4)") },
                    onClick = {
                        state.selectTool(DesktopTool.PAINT_CANNON)
                        showContextMenu = false
                    }
                )
                DropdownMenuItem(
                    text = { Text("💧 Water Gun (5)") },
                    onClick = {
                        state.selectTool(DesktopTool.WATER_GUN)
                        showContextMenu = false
                    }
                )
                DropdownMenuItem(
                    text = { Text("🔄 Change Cat Pose (C)") },
                    onClick = {
                        state.cycleCatPose()
                        showContextMenu = false
                    }
                )
                HorizontalDivider()
                DropdownMenuItem(
                    text = { Text("❌ Exit Companion (Q)", color = DeskToyColors.DangerRed) },
                    onClick = {
                        showContextMenu = false
                        onCloseApp()
                    }
                )
            }
        }
    }
}
