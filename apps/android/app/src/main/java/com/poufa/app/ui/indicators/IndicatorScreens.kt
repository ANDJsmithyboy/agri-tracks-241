package com.poufa.app.ui.indicators

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Scale
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*
import java.util.Locale

/** Données d'entrée écran 21 — calculées par le repository/ViewModel. */
data class IndicatorsData(
    val bandLabel: String,
    val farmLabel: String,
    val initialChicks: Int,
    val cumulativeDeaths: Int,
    val population: Int?,
    val mortalityPct: Double,
    val latestAvgWeightKg: Double?,
    val latestWeighingDay: Int?,
    val lastDayFeedKg: Double?,
    val lastDayPopulation: Int?,
    val totalFeedKg: Double,
    val conversionRatio: Double?,
)

private fun fmtPct(v: Double) = String.format(Locale.FRANCE, "%.1f %%", v).replace(" ", " ")
private fun fmtKg(v: Double) = String.format(Locale.FRANCE, "%.2f kg", v)
private fun fmtInt(v: Int) = String.format(Locale.FRANCE, "%,d", v).replace(",", " ")

/** Écran 21 — Indicateurs techniques (toutes valeurs calculées, jamais codées en dur). */
@Composable
fun TechnicalIndicatorsScreen(data: IndicatorsData, onBack: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding),
    ) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Indicateurs techniques", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("${data.bandLabel} · ${data.farmLabel}", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))

        PoufaCard {
            IndicatorSection("Taux de mortalité", fmtPct(data.mortalityPct),
                "${fmtInt(data.cumulativeDeaths)} morts sur ${fmtInt(data.initialChicks)} poussins")
            HorizontalDivider(Modifier.padding(vertical = 16.dp), color = MaterialTheme.colorScheme.outlineVariant)

            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Poids moyen", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                PoufaStatusChip("Pesée à renseigner", bg = PoufaWarningBg, color = Color(0xFF8A6D1A))
            }
            Spacer(Modifier.height(8.dp))
            Text(data.latestAvgWeightKg?.let(::fmtKg) ?: "—", fontSize = 34.sp, fontWeight = FontWeight.Bold, color = PoufaPrimary)
            Text(data.latestWeighingDay?.let { "Dernière pesée : jour $it" } ?: "Aucune pesée enregistrée",
                fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            HorizontalDivider(Modifier.padding(vertical = 16.dp), color = MaterialTheme.colorScheme.outlineVariant)

            IndicatorSection("Consommation par animal",
                data.lastDayFeedKg?.let { feed ->
                    IndicatorsFeedText(feed, data.initialChicks, data.lastDayPopulation)
                } ?: "—",
                data.lastDayFeedKg?.let {
                    "Hier : ${fmtKg(it)} pour ${fmtInt(data.lastDayPopulation ?: data.population ?: 0)} animaux"
                } ?: "Aucune donnée")
            HorizontalDivider(Modifier.padding(vertical = 16.dp), color = MaterialTheme.colorScheme.outlineVariant)

            IndicatorSection("Aliment consommé", fmtKg(data.totalFeedKg), "Depuis la mise en place")
            HorizontalDivider(Modifier.padding(vertical = 16.dp), color = MaterialTheme.colorScheme.outlineVariant)

            IndicatorSection("Indice de consommation",
                data.conversionRatio?.let { String.format(Locale.FRANCE, "%.2f", it) } ?: "—",
                if (data.conversionRatio == null) "Calculé après la prochaine pesée" else "Aliment / biomasse produite")
        }
        Spacer(Modifier.height(16.dp))
        PoufaInfoBanner("Calculés à partir de vos saisies. Ils complètent l'avis de votre technicien.")
    }
}

@Composable
private fun IndicatorSection(label: String, value: String, support: String) {
    Column {
        Text(label, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(6.dp))
        Text(value, fontSize = 34.sp, fontWeight = FontWeight.Bold, color = PoufaPrimary)
        Text(support, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun IndicatorsFeedText(feedKg: Double, placed: Int, pop: Int?): String {
    if (pop == null || pop <= 0) return "—"
    val grams = com.poufa.app.data.IndicatorsCalculator.feedPerAnimalGrams(feedKg, placed, pop)
    return grams?.let { "${String.format(Locale.FRANCE, "%.0f", it)} g par jour" } ?: "—"
}

/** Écran 22 — onglet Pesées de la fiche bande (historique Room). */
data class WeighingRowData(
    val id: String,
    val dayLabel: String,       // « Jour 16 »
    val summary: String,        // « 0,62 kg en moyenne · 30 animaux pesés »
)

@Composable
fun BandWeighingsTab(
    weighings: List<WeighingRowData>,
    overdueWarning: String?,    // « Dernière pesée : il y a 8 jours »
    onAddWeighing: () -> Unit,
    onOpenWeighing: (String) -> Unit = {},
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (overdueWarning != null) {
            PoufaInfoBanner("Pesée à renseigner — $overdueWarning", bg = PoufaWarningBg)
        }
        if (weighings.isEmpty()) {
            PoufaEmptyState("Aucune pesée enregistrée", "Les pesées apparaîtront ici.")
        } else {
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                weighings.forEachIndexed { i, w ->
                    PoufaListRow(
                        title = w.dayLabel, subtitle = w.summary,
                        leading = {
                            Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp))
                                .background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                                Icon(Icons.Filled.Scale, null, Modifier.size(18.dp), tint = PoufaPrimary)
                            }
                        },
                        onClick = { onOpenWeighing(w.id) },
                    )
                    if (i < weighings.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }
        PoufaPrimaryButton("Ajouter une pesée", onAddWeighing, icon = Icons.Filled.Scale)
    }
}

/** Écran 23 — Ajouter une pesée (calcul live poids moyen). */
@Composable
fun AddWeighingScreen(
    bandLabel: String,
    population: Int?,
    initialSample: Int? = null,
    initialTotal: Double? = null,
    onBack: () -> Unit,
    onSave: (sampleCount: Int, totalWeightKg: Double) -> Unit,
    saving: Boolean = false,
) {
    var sample by remember { mutableStateOf(initialSample?.toString() ?: "") }
    var total by remember { mutableStateOf(initialTotal?.toString() ?: "") }
    var sampleError by remember { mutableStateOf<String?>(null) }
    var totalError by remember { mutableStateOf<String?>(null) }

    val n = sample.toIntOrNull()
    val w = total.replace(',', '.').toDoubleOrNull()
    val avg = if (n != null && w != null) com.poufa.app.data.IndicatorsCalculator.averageWeightKg(w, n) else null

    val canSave = n != null && n > 0 && w != null && w > 0 &&
        (population == null || n <= population) && !saving

    Scaffold(
        bottomBar = {
            PoufaBottomActionBar(
                primaryText = if (saving) "Enregistrement…" else "Enregistrer la pesée",
                onPrimary = {
                    var ok = true
                    if (n == null || n <= 0) { sampleError = "Nombre invalide"; ok = false }
                    if (w == null || w <= 0) { totalError = "Poids invalide"; ok = false }
                    if (population != null && n != null && n > population) { sampleError = "Dépasse l'effectif"; ok = false }
                    if (ok && n != null && w != null) onSave(n, w)
                },
                hint = "Enregistrement possible hors ligne",
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Ajouter une pesée", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text(bandLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))

            PoufaCard {
                PoufaListRow("Date", subtitle = "Aujourd'hui")
            }
            Spacer(Modifier.height(16.dp))

            PoufaNumericField(
                "Nombre d'animaux pesés", sample, { sample = it.filter(Char::isDigit); sampleError = null },
                unit = "animaux",
                helper = "Pesez au moins 30 animaux pris à différents endroits du bâtiment.",
                error = sampleError,
            )
            if (n != null && n < 30) {
                PoufaInfoBanner("Échantillon inférieur à 30 — l'indicateur peut être moins représentatif.", bg = PoufaWarningBg)
                Spacer(Modifier.height(12.dp))
            } else Spacer(Modifier.height(12.dp))

            PoufaNumericField(
                "Poids total", total, { total = it; totalError = null },
                unit = "kg", decimal = true,
                error = totalError,
            )
            Spacer(Modifier.height(20.dp))

            PoufaCard(containerColor = PoufaNeutralInfo) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("Poids moyen", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Text("Calculé à partir des deux champs", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Text(avg?.let { fmtKg(it) } ?: "—", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = PoufaPrimary)
                }
            }
        }
    }
}
