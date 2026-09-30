package com.desktoy.focusbuddy.ui.overlay

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.desktoy.focusbuddy.model.DesktopTool
import com.desktoy.focusbuddy.state.DeskToyAppState
import com.desktoy.focusbuddy.ui.overlay.EffectRenderers.drawPaintSplatters
import com.desktoy.focusbuddy.ui.overlay.EffectRenderers.drawScreenCracks
import com.desktoy.focusbuddy.ui.overlay.EffectRenderers.drawWaterSplashes
import com.desktoy.focusbuddy.ui.theme.DeskToyColors

/**
 * Full-Screen Interaction Canvas.
 * Activated ONLY when user chooses Punch, Broom, Paint, or Water Gun via hotkeys (2, 3, 4, 5) or context menu.
 * Press [1] or [Esc] to exit and return to normal unblocked screen!
 */
@Composable
fun FullScreenActionOverlayContent(
    state: DeskToyAppState,
    onReturnToWork: () -> Unit,
    modifier: Modifier = Modifier
) {
    val activeTool = state.activeTool ?: return

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Transparent)
            .pointerInput(activeTool, state.punchLevel) {
                detectTapGestures { tapPos ->
                    state.triggerToolTap(tapPos.x, tapPos.y)
                }
            }
            .pointerInput(activeTool) {
                detectDragGestures { change, _ ->
                    state.triggerToolDrag(change.position.x, change.position.y)
                }
            }
    ) {
        // Canvas Rendering Layer
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawWaterSplashes(state.waterSplashes)
            drawScreenCracks(state.cracks)
            drawPaintSplatters(state.splatters)
        }

        // Sleek Minimal Top Bar for Active Tool Mode
        Surface(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 16.dp),
            shape = RoundedCornerShape(20.dp),
            color = DeskToyColors.CardBackground,
            border = androidx.compose.foundation.BorderStroke(1.dp, DeskToyColors.DangerBorder),
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
                    colors = ButtonDefaults.buttonColors(containerColor = DeskToyColors.SuccessGreen),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text("🐾 Back to Work [1 / Esc]", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.5.sp)
                }

                // Clean & Resume Work
                Button(
                    onClick = { state.clearAllEffects() },
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
