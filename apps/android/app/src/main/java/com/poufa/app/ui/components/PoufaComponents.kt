package com.poufa.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.LocalTextStyle
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.theme.*

// ── Dimensions (spec B4) ────────────────────────────────────────────────
val PoufaRadiusCard = 16.dp
val PoufaRadiusButton = 12.dp
val PoufaRadiusChip = 10.dp
val PoufaPagePadding = 20.dp
val PoufaButtonHeight = 56.dp
val PoufaInputHeight = 56.dp

@Composable
fun PoufaCard(
    modifier: Modifier = Modifier,
    containerColor: Color = MaterialTheme.colorScheme.surfaceContainerLowest,
    contentPadding: PaddingValues = PaddingValues(16.dp),
    content: @Composable ColumnScope.() -> Unit,
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(PoufaRadiusCard)),
        shape = RoundedCornerShape(PoufaRadiusCard),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(modifier = Modifier.padding(contentPadding), content = content)
    }
}

@Composable
fun PoufaPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector? = null,
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.fillMaxWidth().height(PoufaButtonHeight),
        shape = RoundedCornerShape(PoufaRadiusButton),
    ) {
        if (icon != null) Icon(icon, null, Modifier.size(18.dp))
        Spacer(Modifier.width(8.dp))
        Text(text, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun PoufaSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    icon: ImageVector? = null,
) {
    OutlinedButton(
        onClick = onClick,
        enabled = enabled,
        modifier = modifier.fillMaxWidth().height(PoufaButtonHeight),
        shape = RoundedCornerShape(PoufaRadiusButton),
    ) {
        if (icon != null) {
            Icon(icon, null, Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
        }
        Text(text, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
fun PoufaBrandHeader(subtitle: String? = null) {
    Column {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("POUFA", fontSize = 20.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            Spacer(Modifier.width(6.dp))
            Box(Modifier.size(8.dp).background(PoufaBrandGold, RoundedCornerShape(2.dp)))
        }
        if (subtitle != null) {
            Text(subtitle, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun PoufaTopBar(title: String, onBack: (() -> Unit)? = null, trailing: (@Composable () -> Unit)? = null) {
    Row(
        Modifier.fillMaxWidth().padding(horizontal = PoufaPagePadding, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (onBack != null) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour")
            }
        }
        Text(title, fontSize = 22.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
        trailing?.invoke()
    }
}

@Composable
fun PoufaStatusChip(text: String, color: Color = PoufaSuccess, bg: Color = PoufaSoftGreen) {
    Surface(shape = RoundedCornerShape(PoufaRadiusChip), color = bg) {
        Text(
            text,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = color,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
        )
    }
}

@Composable
fun PoufaInfoBanner(
    text: String,
    bg: Color = PoufaNeutralInfo,
    fg: Color = PoufaInk,
    icon: ImageVector? = null,
) {
    Row(
        Modifier.fillMaxWidth()
            .background(bg, RoundedCornerShape(PoufaRadiusCard))
            .padding(14.dp),
        verticalAlignment = Alignment.Top,
    ) {
        if (icon != null) {
            Icon(icon, null, Modifier.size(18.dp).padding(top = 1.dp), tint = fg)
            Spacer(Modifier.width(10.dp))
        }
        Text(text, fontSize = 13.sp, color = fg)
    }
}

@Composable
fun PoufaOfflineBanner() {
    PoufaInfoBanner(
        text = "Hors connexion — les saisies sont conservées sur l'appareil.",
        bg = PoufaNeutralSelected,
    )
}

@Composable
fun PoufaBottomActionBar(
    primaryText: String,
    onPrimary: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    hint: String? = null,
    secondary: (@Composable () -> Unit)? = null,
) {
    Surface(color = MaterialTheme.colorScheme.surface, tonalElevation = 2.dp) {
        Column(
            Modifier.fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = PoufaPagePadding, vertical = 12.dp),
        ) {
            if (hint != null) {
                Text(
                    hint,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(bottom = 8.dp),
                )
            }
            PoufaPrimaryButton(primaryText, onPrimary, enabled = enabled)
            secondary?.invoke()
        }
    }
}

@Composable
fun PoufaFormField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    helper: String? = null,
    error: String? = null,
    keyboardType: KeyboardType = KeyboardType.Text,
    singleLine: Boolean = true,
) {
    Column(modifier.fillMaxWidth()) {
        Text(label, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)) },
            isError = error != null,
            singleLine = singleLine,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            shape = RoundedCornerShape(PoufaRadiusButton),
            modifier = Modifier.fillMaxWidth().heightIn(min = PoufaInputHeight),
        )
        when {
            error != null -> Text(error, fontSize = 12.sp, color = PoufaCritical, modifier = Modifier.padding(top = 6.dp))
            helper != null -> Text(helper, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 6.dp))
        }
    }
}

@Composable
fun PoufaNumericField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    unit: String? = null,
    helper: String? = null,
    error: String? = null,
    decimal: Boolean = false,
) {
    Column(modifier.fillMaxWidth()) {
        Text(label, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
        if (unit == null) {
            OutlinedTextField(
                value = value,
                onValueChange = onValueChange,
                isError = error != null,
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = if (decimal) KeyboardType.Decimal else KeyboardType.Number),
                shape = RoundedCornerShape(PoufaRadiusButton),
                modifier = Modifier.fillMaxWidth().heightIn(min = PoufaInputHeight),
            )
        } else {
            // Champ numérique + cellule unité ombrée à droite (spec écrans 02/32)
            Row(
                Modifier.fillMaxWidth().heightIn(min = PoufaInputHeight)
                    .border(1.dp, if (error != null) PoufaCritical else MaterialTheme.colorScheme.outline, RoundedCornerShape(PoufaRadiusButton)),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(Modifier.weight(1f).padding(start = 16.dp)) {
                    BasicTextField(
                        value = value,
                        onValueChange = onValueChange,
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = if (decimal) KeyboardType.Decimal else KeyboardType.Number),
                        textStyle = LocalTextStyle.current.copy(fontSize = 16.sp),
                        modifier = Modifier.fillMaxWidth(),
                    )
                    if (value.isEmpty()) {
                        Text("0", color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f), fontSize = 16.sp)
                    }
                }
                Box(
                    Modifier.background(MaterialTheme.colorScheme.surfaceVariant)
                        .padding(horizontal = 14.dp, vertical = 18.dp),
                ) { Text(unit, fontSize = 14.sp, fontWeight = FontWeight.Medium) }
            }
        }
        when {
            error != null -> Text(error, fontSize = 12.sp, color = PoufaCritical, modifier = Modifier.padding(top = 6.dp))
            helper != null -> Text(helper, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 6.dp))
        }
    }
}

@Composable
fun PoufaSelectionChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val bg = if (selected) PoufaSoftGreen else MaterialTheme.colorScheme.surface
    val borderColor = if (selected) PoufaPrimary else MaterialTheme.colorScheme.outline
    Row(
        Modifier
            .heightIn(min = 48.dp)
            .background(bg, RoundedCornerShape(PoufaRadiusChip))
            .border(1.dp, borderColor, RoundedCornerShape(PoufaRadiusChip))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (selected) {
            Icon(Icons.Filled.Check, null, Modifier.size(16.dp), tint = PoufaPrimary)
            Spacer(Modifier.width(6.dp))
        }
        Text(label, fontSize = 14.sp, fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal)
    }
}

@Composable
fun PoufaEmptyState(title: String, description: String? = null, action: (@Composable () -> Unit)? = null) {
    Column(
        Modifier.fillMaxWidth().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(title, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
        if (description != null) {
            Text(description, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 8.dp))
        }
        action?.let { Spacer(Modifier.height(16.dp)); it() }
    }
}

@Composable
fun PoufaSyncStatus(lastSyncAt: Long?, pendingCount: Int) {
    val text = when {
        pendingCount > 0 -> "$pendingCount opération(s) en attente de synchronisation"
        lastSyncAt != null -> "Données synchronisées"
        else -> "Pas encore synchronisé"
    }
    Text(text, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
}

/** Onglets segmentés — spec écrans 03/04/22/24/30. */
@Composable
fun PoufaSegmentedTabs(
    tabs: List<String>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(PoufaRadiusChip))
            .padding(4.dp),
    ) {
        tabs.forEachIndexed { i, label ->
            val selected = i == selectedIndex
            Box(
                Modifier.weight(1f)
                    .heightIn(min = 40.dp)
                    .clip(RoundedCornerShape(PoufaRadiusChip - 2.dp))
                    .background(if (selected) MaterialTheme.colorScheme.surfaceContainerLowest else Color.Transparent)
                    .clickable { onSelect(i) },
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    label, fontSize = 14.sp,
                    fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                    color = if (selected) PoufaPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
fun PoufaListRow(
    title: String,
    subtitle: String? = null,
    leading: (@Composable () -> Unit)? = null,
    trailing: (@Composable () -> Unit)? = null,
    onClick: (() -> Unit)? = null,
) {
    Row(
        Modifier
            .fillMaxWidth()
            .heightIn(min = 56.dp)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        leading?.invoke()
        Column(Modifier.weight(1f).padding(horizontal = if (leading != null) 12.dp else 0.dp)) {
            Text(title, fontSize = 15.sp, fontWeight = FontWeight.Medium)
            if (subtitle != null) {
                Text(subtitle, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        trailing ?: if (onClick != null) {
            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
        } else null
    }
}
