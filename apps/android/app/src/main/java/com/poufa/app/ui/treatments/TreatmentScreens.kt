package com.poufa.app.ui.treatments

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*
import com.poufa.app.data.local.TreatmentEventEntity

/** Écran 26 — Vaccins et traitements (historique Room). */
@Composable
fun VaccinationTreatmentScreen(
    bandLabel: String,
    events: List<TreatmentEventEntity>,
    onBack: () -> Unit,
    onAddTreatment: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Vaccins et traitements", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(bandLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))

        if (events.isEmpty()) {
            PoufaEmptyState("Aucun traitement enregistré", "Les vaccinations et traitements apparaîtront ici.")
        } else {
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                events.forEachIndexed { i, t ->
                    PoufaListRow(
                        title = t.productName,
                        subtitle = "${t.treatmentType} · ${t.method ?: "—"}",
                        trailing = {
                            PoufaStatusChip(
                                if (t.status == "done") "✓ Fait" else "En attente",
                                bg = if (t.status == "done") PoufaSoftGreen else PoufaWarningBg,
                                color = if (t.status == "done") PoufaSuccess else Color(0xFF8A6D1A),
                            )
                        },
                    )
                    if (i < events.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }
        Spacer(Modifier.height(16.dp))
        PoufaInfoBanner("Plan établi avec votre vétérinaire ou votre technicien d'encadrement.")
        Spacer(Modifier.height(16.dp))
        PoufaPrimaryButton("+ Enregistrer un traitement", onAddTreatment)
    }
}

/** Écran 27 — Enregistrer un traitement. */
@Composable
fun RegisterTreatmentScreen(
    bandLabel: String,
    population: Int?,
    products: List<String> = emptyList(),
    onBack: () -> Unit,
    onSave: (type: String, product: String, batch: String?, method: String?, animals: Int?) -> Unit,
    saving: Boolean = false,
) {
    val types = listOf("vaccine" to "Vaccin", "medicine" to "Médicament", "vitamins" to "Vitamines")
    val methods = listOf("eau_de_boisson" to "Eau de boisson", "injection" to "Injection", "pulverisation" to "Pulvérisation")

    var type by remember { mutableStateOf("vaccine") }
    var product by remember { mutableStateOf("") }
    var batch by remember { mutableStateOf("") }
    var method by remember { mutableStateOf("eau_de_boisson") }
    var animalsText by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }

    val animals = animalsText.toIntOrNull()
    val canSave = product.isNotBlank() && method.isNotBlank() &&
        (animals == null || animals > 0) && (population == null || (animals ?: 0) <= population) && !saving

    Scaffold(
        bottomBar = {
            PoufaBottomActionBar(
                primaryText = if (saving) "Enregistrement…" else "Enregistrer le traitement",
                onPrimary = {
                    if (product.isBlank()) error = "Produit requis"
                    else if (animals != null && animals <= 0) error = "Nombre d'animaux invalide"
                    else onSave(type, product, batch.ifBlank { null }, method, animals)
                },
                hint = "Enregistrement possible hors ligne",
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Enregistrer un traitement", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text(bandLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))

            Text("Type", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                types.forEach { (v, l) -> PoufaSelectionChip(l, type == v) { type = v } }
            }
            Spacer(Modifier.height(20.dp))

            PoufaFormField("Produit", product, { product = it }, placeholder = "Choisir un produit")
            Spacer(Modifier.height(20.dp))

            PoufaFormField("Numéro de lot du produit (facultatif)", batch, { batch = it })
            Spacer(Modifier.height(20.dp))

            Text("Mode d'administration", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                methods.forEach { (v, l) -> PoufaSelectionChip(l, method == v) { method = v } }
            }
            Spacer(Modifier.height(20.dp))

            PoufaNumericField("Animaux traités", animalsText, { animalsText = it.filter(Char::isDigit) },
                unit = "animaux", error = error)
        }
    }
}
