package com.poufa.app.ui.buildings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*

// ── Écran 11 — Bâtiments ────────────────────────────────────────────────
data class BuildingRowData(val id: String, val name: String, val capacity: Int, val occupiedBy: String?, val emptySinceDays: Int?)

@Composable
fun BuildingsScreen(farmLabel: String, buildings: List<BuildingRowData>, onBack: () -> Unit, onAdd: () -> Unit, onOpen: (String) -> Unit = {}) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Bâtiments", style = MaterialTheme.typography.displaySmall)
        Text(farmLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            buildings.forEachIndexed { i, b ->
                PoufaListRow(
                    b.name, "Capacité : ${b.capacity} animaux",
                    leading = {
                        Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(if (b.occupiedBy != null) PoufaSoftGreen else PoufaNeutralSelected), contentAlignment = Alignment.Center) {
                            Icon(Icons.Filled.Domain, null, Modifier.size(18.dp), tint = if (b.occupiedBy != null) PoufaPrimary else PoufaSecondaryText)
                        }
                    },
                    trailing = {
                        PoufaStatusChip(
                            b.occupiedBy?.let { "● Occupé · $it" } ?: b.emptySinceDays?.let { "● Vide depuis $it jours" } ?: "● Vide",
                            bg = if (b.occupiedBy != null) PoufaSoftGreen else PoufaNeutralSelected,
                            color = if (b.occupiedBy != null) PoufaPrimary else PoufaSecondaryText,
                        )
                    },
                    onClick = { onOpen(b.id) },
                )
                if (i < buildings.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }
        Spacer(Modifier.height(16.dp))
        PoufaInfoBanner("Après le départ d'une bande, nettoyez et désinfectez le bâtiment avant la mise en place suivante.")
        Spacer(Modifier.height(20.dp))
        PoufaSecondaryButton("+ Ajouter un bâtiment", onAdd)
    }
}

// ── Écrans 15–17 — Wizard nouvelle bande ────────────────────────────────
@Composable
fun CreateBandStepOneScreen(
    farmLabel: String, chickCount: String, onChickCount: (String) -> Unit,
    strains: List<Pair<String, String>>, strainId: String?, onStrain: (String) -> Unit,
    ageDays: Int?, onAge: (Int?) -> Unit,
    onBack: () -> Unit, onContinue: () -> Unit,
) {
    Scaffold(bottomBar = { PoufaBottomActionBar("Continuer", onContinue, enabled = chickCount.toIntOrNull()?.let { it > 0 } == true && strainId != null) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            com.poufa.app.ui.traceability.ProgressHeader("Étape 1 sur 2", "Poussins", 0.5f)
            Spacer(Modifier.height(20.dp))
            Text("Nouvelle bande", style = MaterialTheme.typography.displaySmall)
            Text(farmLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))
            PoufaCard { PoufaListRow("Date de mise en place", subtitle = "Aujourd'hui") }
            Spacer(Modifier.height(16.dp))
            PoufaNumericField("Nombre de poussins reçus", chickCount, onChickCount, unit = "animaux",
                helper = "Comptez les poussins vivants à la livraison.")
            Spacer(Modifier.height(16.dp))
            Text("Souche", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
            strains.forEach { (id, label) -> PoufaSelectionChip(label, strainId == id) { onStrain(id) } }
            Spacer(Modifier.height(16.dp))
            Text("Âge à la réception", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                PoufaSelectionChip("✓ 1 jour", ageDays == 1) { onAge(1) }
                PoufaSelectionChip("Autre", ageDays != null && ageDays != 1) { onAge(7) }
            }
        }
    }
}

@Composable
fun CreateBandStepTwoScreen(
    farmLabel: String,
    buildings: List<BuildingRowData>, buildingId: String?, onBuilding: (String) -> Unit,
    chickCount: Int, origin: String, onOrigin: (String) -> Unit,
    hatcheryLot: String, onHatcheryLot: (String) -> Unit,
    feeds: List<String>, feedId: String?, onFeed: (String) -> Unit,
    onBack: () -> Unit, onVerify: () -> Unit,
) {
    Scaffold(bottomBar = { PoufaBottomActionBar("Vérifier", onVerify, enabled = buildingId != null) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            com.poufa.app.ui.traceability.ProgressHeader("Étape 2 sur 2", "Bâtiment et origine", 1f)
            Spacer(Modifier.height(20.dp))
            Text("Nouvelle bande", style = MaterialTheme.typography.displaySmall)
            Text(farmLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))
            Text("Bâtiment", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
            buildings.forEach { b ->
                val available = b.occupiedBy == null && chickCount <= b.capacity
                PoufaCard(containerColor = if (buildingId == b.id) PoufaSoftGreen else Color.White) {
                    PoufaListRow(
                        b.name, if (b.occupiedBy != null) "Occupé · ${b.occupiedBy}" else "Disponible · ${b.capacity} maximum",
                        trailing = {
                            if (buildingId == b.id) Text("✓", color = PoufaPrimary, fontWeight = FontWeight.Bold)
                            else if (!available) Text("—", color = PoufaSecondaryText)
                        },
                        onClick = { if (available) onBuilding(b.id) },
                    )
                }
                Spacer(Modifier.height(8.dp))
                // TODO: BuildingRowData.occupiedBy non câblé — passé null par la route
            }
            Spacer(Modifier.height(8.dp))
            PoufaFormField("Origine des poussins", origin, onOrigin, placeholder = "Couvoir partenaire")
            Spacer(Modifier.height(16.dp))
            PoufaFormField("Numéro de lot du couvoir (facultatif)", hatcheryLot, onHatcheryLot)
            Spacer(Modifier.height(16.dp))
            Text("Aliment de démarrage", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
            feeds.forEach { f -> PoufaSelectionChip(f, feedId == f) { onFeed(f) } }
        }
    }
}

@Composable
fun CreateBandReviewScreen(
    farmLabel: String,
    rows: List<Pair<String, String>>, provisionalCode: String?,
    onBack: () -> Unit, onConfirm: () -> Unit, onModify: () -> Unit,
) {
    Scaffold(bottomBar = {
        Column {
            PoufaPrimaryButton("Démarrer la bande", onConfirm)
            TextButton(onClick = onModify, modifier = Modifier.fillMaxWidth()) { Text("Modifier", color = PoufaPrimary) }
            Spacer(Modifier.height(8.dp))
        }
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Vérifiez la bande", style = MaterialTheme.typography.displaySmall)
            Text(farmLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))
            PoufaCard {
                rows.forEachIndexed { i, (k, v) ->
                    PoufaListRow(k, trailing = { Text(v, fontWeight = FontWeight.SemiBold) })
                    if (i < rows.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("Numéro attribué", trailing = {
                    PoufaStatusChip(provisionalCode ?: "Attribution serveur", bg = PoufaWarningBg, color = Color(0xFF8A6D1A))
                })
            }
            Spacer(Modifier.height(16.dp))
            PoufaInfoBanner("Le numéro de bande est attribué automatiquement par le serveur.")
        }
    }
}

// ── Écran 20 — Détail d'une journée (historique + correction) ───────────
data class DailyRecordRowData(val id: String, val dateLabel: String, val deaths: Int?, val feedKg: Double?, val population: Int?, val author: String?, val synced: Boolean, val observations: String?)

@Composable
fun DailyRecordDetailScreen(
    record: DailyRecordRowData,
    onBack: () -> Unit,
    onCorrect: () -> Unit,
    readOnly: Boolean = false,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text(record.dateLabel, style = MaterialTheme.typography.displaySmall)
        Spacer(Modifier.height(20.dp))
        PoufaCard {
            PoufaListRow("Animaux morts", trailing = { Text("${record.deaths ?: 0}", fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Aliment consommé", trailing = { Text(record.feedKg?.let { "%.1f kg".format(it) } ?: "—", fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Effectif en fin de journée", trailing = { Text("${record.population ?: "—"} animaux", fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Saisi par", trailing = { Text(record.author ?: "—", fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Envoi", trailing = {
                PoufaStatusChip(if (record.synced) "✓ Envoyée" else "En attente", bg = if (record.synced) PoufaSoftGreen else PoufaWarningBg,
                    color = if (record.synced) PoufaSuccess else Color(0xFF8A6D1A))
            })
        }
        record.observations?.let {
            Spacer(Modifier.height(16.dp))
            Text("Observations", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            PoufaCard { Text(it, fontSize = 14.sp) }
        }
        Spacer(Modifier.height(20.dp))
        if (!readOnly) PoufaSecondaryButton("Corriger la journée", onCorrect, icon = Icons.Filled.Edit)
    }
}
