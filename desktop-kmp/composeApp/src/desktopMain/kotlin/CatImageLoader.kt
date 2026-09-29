package com.desktoy.focusbuddy

import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.res.loadImageBitmap
import androidx.compose.ui.res.useResource
import java.io.File

object CatImageLoader {
    private var cachedRight: ImageBitmap? = null
    private var cachedLeft: ImageBitmap? = null

    fun getCatImage(facingRight: Boolean): ImageBitmap? {
        return if (facingRight) {
            if (cachedRight == null) {
                cachedRight = loadBitmap(
                    "images/cat_lowpoly_right.png",
                    "desktop-kmp/composeApp/src/desktopMain/resources/images/cat_lowpoly_right.png",
                    "src/desktopMain/resources/images/cat_lowpoly_right.png"
                )
            }
            cachedRight
        } else {
            if (cachedLeft == null) {
                cachedLeft = loadBitmap(
                    "images/cat_lowpoly_left.png",
                    "desktop-kmp/composeApp/src/desktopMain/resources/images/cat_lowpoly_left.png",
                    "src/desktopMain/resources/images/cat_lowpoly_left.png"
                )
            }
            cachedLeft
        }
    }

    private fun loadBitmap(resourcePath: String, vararg fallbackPaths: String): ImageBitmap? {
        try {
            return useResource(resourcePath) { stream -> loadImageBitmap(stream) }
        } catch (e: Exception) {}

        for (path in fallbackPaths) {
            try {
                val file = File(path)
                if (file.exists()) {
                    return file.inputStream().use { stream -> loadImageBitmap(stream) }
                }
            } catch (e: Exception) {}
        }
        return null
    }
}
