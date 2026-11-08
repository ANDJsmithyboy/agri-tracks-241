package com.poufa.app.ui.closure

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*

/** Écran 28 — Clôturer la bande. Checks dérivés des données réelles. */
data class ClosureCheck(
    val label: String,
    val detail: String,
    val blocking: Boolean,      // true = bloquant, false = avertissement
    val resolved: Boolean,
    val warningText: String?,
)

@Composable
fun CloseBandScreen(
    bandLabel: String,
    dayCount: Int,
    checks: List<ClosureCheck>,
    canClose: Boolean,
    onBack: () -> Unit,
    onClose: () -> Unit,
    closing: Boolean = false,
) {
    val allResolved = checks.all { it.resolved || !it.blocking }
    Scaffold(
        bottomBar = {
            PoufaBottomActionBar(
                primaryText = if (closing) "Clôture…" else "Clôturer la bande",
                onPrimary = onClose,
                hint = if (allResolved) "Vérifications terminées" else "Complétez les vérifications pour clôturer la bande.",
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Clôturer la bande", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text("$bandLabel · Jour $dayCount", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))

            PoufaInfoBanner("Avant de clôturer — une bande clôturée ne peut plus être modifiée.", bg = PoufaWarningBg)
            Spacer(Modifier.height(16.dp))

            Text("Vérifications", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(12.dp))
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                checks.forEachIndexed { i, c ->
                    Row(
                        Modifier.fillMaxWidth().padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(
                            if (c.resolved) Icons.Filled.CheckCircle else Icons.Filled.ErrorOutline,
                            null, Modifier.size(22.dp),
                            tint = if (c.resolved) PoufaSuccess else if (c.blocking) PoufaCritical else Color(0xFF8A6D1A),
                        )
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(c.label, fontSize = 15.sp, fontWeight = FontWeight.Medium)
                            Text(c.detail, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            c.warningText?.let {
                                Text(it, fontSize = 12.sp, color = Color(0xFF8A6D1A))
                            }
                        }
                        PoufaStatusChip(
                            if (c.resolved) "✓ Complet" else (c.warningText ?: "À renseigner"),
                            bg = if (c.resolved) PoufaSoftGreen else PoufaWarningBg,
                            color = if (c.resolved) PoufaSuccess else Color(0xFF8A6D1A),
                        )
                    }
                    if (i < checks.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }
    }
}

/** Écran 29 — Bilan d'une bande clôturée (lecture seule). */
@Composable
fun ClosedBandSummaryScreen(
    bandLabel: String,
    farmLabel: String,
    durationDays: Int,
    animalsTransferred: Int,
    initialChicks: Int,
    cumulativeDeaths: Int,
    mortalityPct: Double,
    avgExitWeightKg: Double?,
    totalFeedKg: Double,
    conversionRatio: Double?,
    buildingLabel: String?,
    lotCodes: List<String>,
    onBack: () -> Unit,
    onDownloadPdf: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text(bandLabel, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("$farmLabel · Clôturée · $durationDays jours", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))

        PoufaCard(containerColor = PoufaSoftGreen) {
            Text("ANIMAUX CÉDÉS", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = PoufaPrimary)
            Text("$animalsTransferred", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = PoufaPrimary)
            Spacer(Modifier.height(12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                SummaryKpi("$initialChicks", "poussins mis en place", Modifier.weight(1f))
                SummaryKpi("$cumulativeDeaths", "morts · ${String.format("%.1f", mortalityPct)} %", Modifier.weight(1f))
            }
        }
        Spacer(Modifier.height(16.dp))

        PoufaCard {
            SummaryRow("Poids moyen à la sortie", avgExitWeightKg?.let { "%.2f kg".format(it) } ?: "—")
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            SummaryRow("Aliment consommé", "%.0f kg".format(totalFeedKg))
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            SummaryRow("Indice de consommation", conversionRatio?.let { "%.2f".format(it) } ?: "—")
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            SummaryRow("Bâtiment", buildingLabel ?: "—")
        }
        Spacer(Modifier.height(16.dp))

        if (lotCodes.isNotEmpty()) {
            PoufaCard {
                PoufaListRow("${lotCodes.size} lots créés", subtitle = lotCodes.joinToString(", "))
            }
            Spacer(Modifier.height(16.dp))
        }

        PoufaSecondaryButton("Télécharger le bilan (PDF)", onDownloadPdf)
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun SummaryKpi(value: String, label: String, modifier: Modifier = Modifier) {
    Column(modifier.background(MaterialTheme.colorScheme.surfaceContainerLowest, RoundedCornerShape(12.dp)).padding(12.dp)) {
        Text(value, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = PoufaPrimary)
        Text(label, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun SummaryRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth().padding(vertical = 10.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
    }
}
