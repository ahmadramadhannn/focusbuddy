package com.desktoy.focusbuddy.ui.cat

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import com.desktoy.focusbuddy.model.CatBehavior
import com.desktoy.focusbuddy.ui.theme.DeskToyColors
import kotlin.math.sin

/**
 * Geometric Low-Poly Canvas fallback renderer if PNG textures cannot be loaded.
 */
@Composable
fun LowPolyCatGeometricCanvas(
    behavior: CatBehavior,
    animFrame: Float,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier.fillMaxSize()) {
        // Low-poly body facet
        val bodyPath = Path().apply {
            moveTo(size.width * 0.25f, size.height * 0.75f)
            lineTo(size.width * 0.45f, size.height * 0.40f)
            lineTo(size.width * 0.75f, size.height * 0.45f)
            lineTo(size.width * 0.85f, size.height * 0.80f)
            lineTo(size.width * 0.55f, size.height * 0.85f)
            close()
        }
        drawPath(bodyPath, DeskToyColors.CatOrange)

        // Low-poly belly highlight facet
        val bellyPath = Path().apply {
            moveTo(size.width * 0.45f, size.height * 0.55f)
            lineTo(size.width * 0.65f, size.height * 0.52f)
            lineTo(size.width * 0.70f, size.height * 0.80f)
            lineTo(size.width * 0.48f, size.height * 0.82f)
            close()
        }
        drawPath(bellyPath, DeskToyColors.CatCream)

        // Low-poly Head facet
        val headPath = Path().apply {
            moveTo(size.width * 0.65f, size.height * 0.22f)
            lineTo(size.width * 0.82f, size.height * 0.26f)
            lineTo(size.width * 0.88f, size.height * 0.50f)
            lineTo(size.width * 0.72f, size.height * 0.58f)
            lineTo(size.width * 0.58f, size.height * 0.42f)
            close()
        }
        drawPath(headPath, DeskToyColors.CatLightOrange)

        // Low-poly Ears
        val ear1 = Path().apply {
            moveTo(size.width * 0.65f, size.height * 0.22f)
            lineTo(size.width * 0.62f, size.height * 0.08f)
            lineTo(size.width * 0.73f, size.height * 0.18f)
            close()
        }
        val ear2 = Path().apply {
            moveTo(size.width * 0.78f, size.height * 0.20f)
            lineTo(size.width * 0.88f, size.height * 0.08f)
            lineTo(size.width * 0.84f, size.height * 0.26f)
            close()
        }
        drawPath(ear1, DeskToyColors.CatOrange)
        drawPath(ear2, DeskToyColors.CatOrange)
        drawPath(ear1, DeskToyColors.CatPink, style = Stroke(1.5f))
        drawPath(ear2, DeskToyColors.CatPink, style = Stroke(1.5f))

        // Eyes
        drawCircle(Color(0xFF1E293B), radius = 3.5f, center = Offset(size.width * 0.70f, size.height * 0.36f))
        drawCircle(Color(0xFF1E293B), radius = 3.5f, center = Offset(size.width * 0.81f, size.height * 0.38f))

        // Low-poly Tail
        val tailWag = sin(animFrame * 2f) * 8f
        val tailPath = Path().apply {
            moveTo(size.width * 0.25f, size.height * 0.70f)
            lineTo(size.width * 0.12f + tailWag, size.height * 0.50f)
            lineTo(size.width * 0.16f + tailWag, size.height * 0.36f)
        }
        drawPath(tailPath, DeskToyColors.CatOrange, style = Stroke(7f))
    }
}
