package com.poufa.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val RoyalCreamColors = lightColorScheme(
    primary = RoyalBrandGreen,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE9F1EC),
    onPrimaryContainer = RoyalBrandGreen,
    secondary = RoyalSecondary,
    onSecondary = RoyalText,
    secondaryContainer = Color(0xFFEFE9DF),
    onSecondaryContainer = RoyalText,
    tertiary = RoyalAntiqueGold,
    onTertiary = Color.White,
    background = RoyalCanvas,
    onBackground = RoyalText,
    surface = RoyalSurface,
    onSurface = RoyalText,
    surfaceVariant = RoyalSecondary,
    onSurfaceVariant = RoyalMuted,
    surfaceContainerLowest = RoyalSurface,
    surfaceContainerLow = RoyalSurface,
    surfaceContainer = RoyalSecondary,
    surfaceContainerHigh = Color(0xFFE8DFD0),
    surfaceContainerHighest = Color(0xFFE2D6C4),
    error = PoufaCritical,
    onError = Color.White,
    outline = RoyalBorder,
    outlineVariant = Color(0xFFE8E0D2),
)

private val ObsidianNeonColors = darkColorScheme(
    primary = ObsidianSoftGreen,
    onPrimary = ObsidianCanvas,
    primaryContainer = Color(0xFF1E2822),
    onPrimaryContainer = ObsidianNeon,
    secondary = ObsidianElevated,
    onSecondary = ObsidianText,
    secondaryContainer = Color(0xFF272A31),
    onSecondaryContainer = ObsidianText,
    tertiary = ObsidianNeon,
    onTertiary = ObsidianCanvas,
    background = ObsidianCanvas,
    onBackground = ObsidianText,
    surface = ObsidianSurface,
    onSurface = ObsidianText,
    surfaceVariant = ObsidianElevated,
    onSurfaceVariant = ObsidianMuted,
    surfaceContainerLowest = ObsidianCanvas,
    surfaceContainerLow = ObsidianSurface,
    surfaceContainer = ObsidianElevated,
    surfaceContainerHigh = Color(0xFF272A31),
    surfaceContainerHighest = Color(0xFF30343D),
    error = PoufaCritical,
    onError = Color.White,
    outline = ObsidianBorder,
    outlineVariant = Color(0xFF25282F),
)

@Composable
fun PoufaTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) ObsidianNeonColors else RoyalCreamColors,
        typography = PoufaTypography,
        content = content,
    )
}
