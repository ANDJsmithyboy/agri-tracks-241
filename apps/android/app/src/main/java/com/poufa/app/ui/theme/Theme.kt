package com.poufa.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = PoufaPrimary,
    onPrimary = PoufaCard,
    primaryContainer = PoufaSoftGreen,
    onPrimaryContainer = PoufaInk,
    secondary = PoufaNeutralSelected,
    onSecondary = PoufaInk,
    tertiary = PoufaWarningAccent,
    background = PoufaBg,
    onBackground = PoufaInk,
    surface = PoufaBg,
    onSurface = PoufaInk,
    surfaceVariant = PoufaNeutralInfo,
    onSurfaceVariant = PoufaSecondaryText,
    surfaceContainerLowest = PoufaCard,
    surfaceContainerLow = PoufaCard,
    surfaceContainer = PoufaCard,
    error = PoufaCritical,
    onError = PoufaCard,
    outline = PoufaBorder,
    outlineVariant = PoufaBorder,
)

private val DarkColors = darkColorScheme(
    primary = PoufaPrimaryDark,
    onPrimary = PoufaBgDark,
    primaryContainer = PoufaSoftGreenDark,
    onPrimaryContainer = PoufaInkDark,
    secondary = PoufaNeutralDark,
    onSecondary = PoufaInkDark,
    tertiary = PoufaWarningAccent,
    background = PoufaBgDark,
    onBackground = PoufaInkDark,
    surface = PoufaBgDark,
    onSurface = PoufaInkDark,
    surfaceVariant = PoufaNeutralDark,
    onSurfaceVariant = PoufaSecondaryTextDark,
    surfaceContainerLowest = PoufaCardDark,
    surfaceContainerLow = PoufaCardDark,
    surfaceContainer = PoufaCardDark,
    error = PoufaCritical,
    onError = PoufaCard,
    outline = PoufaBorderDark,
    outlineVariant = PoufaBorderDark,
)

@Composable
fun PoufaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content,
    )
}
