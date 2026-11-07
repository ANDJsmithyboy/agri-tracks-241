package com.poufa.app.ui.inventory

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*

/** Écran 31 — Confirmer une réception (quantité réelle + état livraison). */
@Composable
fun ConfirmReceiptScreen(
    productName: String,
    announcedQty: Double,
    unit: String,
    onBack: () -> Unit,
    onConfirm: (receivedQty: Double, condition: String, notes: String?) -> Unit,
) {
    var qtyText by remember { mutableStateOf(announcedQty.toString()) }
    var condition by remember { mutableStateOf("Bon état") }
    var notes by remember { mutableStateOf("") }
    val conditions = listOf("Bon état", "Sacs abîmés", "Aliment humide")

    Scaffold(bottomBar = {
        PoufaBottomActionBar("Confirmer la réception", {
            qtyText.toDoubleOrNull()?.let { if (it > 0) onConfirm(it, condition, notes.ifBlank { null }) }
        })
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Confirmer la réception", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text(productName, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))
            PoufaCard {
                PoufaListRow("Quantité annoncée", trailing = { Text("$announcedQty $unit", fontWeight = FontWeight.SemiBold) })
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("État de livraison", trailing = { Text(condition, fontWeight = FontWeight.SemiBold) })
            }
            Spacer(Modifier.height(16.dp))
            PoufaNumericField("Quantité reçue", qtyText, { qtyText = it }, unit = unit, decimal = true)
            Spacer(Modifier.height(16.dp))
            Text("État de livraison", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                conditions.forEach { c -> PoufaSelectionChip(c, condition == c) { condition = c } }
            }
            Spacer(Modifier.height(16.dp))
            PoufaFormField("Remarques (facultatif)", notes, { notes = it })
        }
    }
}

/** Écran 32 — Enregistrer une utilisation d'intrant. */
@Composable
fun RecordUsageScreen(
    productName: String,
    availableStock: String,
    bandLabel: String,
    onBack: () -> Unit,
    onSave: (quantity: Double) -> Unit,
) {
    var qty by remember { mutableStateOf("") }
    Scaffold(bottomBar = {
        PoufaBottomActionBar("Enregistrer l'utilisation", {
            qty.toDoubleOrNull()?.let { if (it > 0) onSave(it) }
        })
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Enregistrer une utilisation", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(20.dp))
            PoufaCard {
                PoufaListRow("Intrant", subtitle = productName, trailing = { Text(availableStock, fontWeight = FontWeight.SemiBold) })
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("Bande", subtitle = bandLabel)
            }
            Spacer(Modifier.height(16.dp))
            PoufaNumericField("Quantité utilisée", qty, { qty = it }, unit = "kg", decimal = true)
            Spacer(Modifier.height(16.dp))
            PoufaInfoBanner("L'aliment déclaré dans la saisie de la journée est déjà déduit du stock.")
        }
    }
}

/** Écran 33 — Détail stock aliment. */
@Composable
fun FeedStockDetailScreen(
    productName: String,
    farmLabel: String,
    availableQty: Double,
    unit: String,
    daysLeft: Int?,
    movements: List<Triple<String, Double, String>>, // label, qty signée, date
    onBack: () -> Unit,
    onRecordUsage: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text(productName, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("Stock · $farmLabel", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        PoufaCard(containerColor = PoufaSoftGreen) {
            Text("DISPONIBLE", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = PoufaPrimary)
            Text("$availableQty $unit", fontSize = 40.sp, fontWeight = FontWeight.Bold, color = PoufaPrimary)
            Text(daysLeft?.let { "≈ $it jours au rythme actuel" } ?: "Autonomie non calculable", fontSize = 13.sp, color = PoufaSecondaryText)
        }
        Spacer(Modifier.height(20.dp))
        Text("Mouvements", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(12.dp))
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            if (movements.isEmpty()) {
                PoufaEmptyState("Aucun mouvement", null)
            } else movements.forEachIndexed { i, (label, q, date) ->
                PoufaListRow(label, subtitle = date,
                    trailing = { Text("${if (q > 0) "+" else ""}$q", fontWeight = FontWeight.SemiBold, color = if (q > 0) PoufaSuccess else PoufaCritical) })
                if (i < movements.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }
        Spacer(Modifier.height(20.dp))
        PoufaSecondaryButton("Enregistrer une utilisation", onRecordUsage)
    }
}

/** Écran 34 — Nouvelle réception. */
@Composable
fun CreateReceiptScreen(
    types: List<Pair<String, String>> = listOf("aliment" to "Aliment", "vaccine" to "Vaccin", "medicine" to "Médicament", "litter" to "Litière", "other" to "Autre"),
    units: List<String> = listOf("kg", "g", "L", "flacon", "dose"),
    onBack: () -> Unit,
    onSave: (type: String, product: String, qty: Double, unit: String, supplier: String?, date: Long) -> Unit,
) {
    var type by remember { mutableStateOf("aliment") }
    var product by remember { mutableStateOf("") }
    var qty by remember { mutableStateOf("") }
    var unit by remember { mutableStateOf("kg") }
    var supplier by remember { mutableStateOf("") }

    Scaffold(bottomBar = {
        PoufaBottomActionBar("Enregistrer la réception", {
            val q = qty.replace(',', '.').toDoubleOrNull()
            if (product.isNotBlank() && q != null && q > 0) {
                onSave(type, product.trim(), q, unit, supplier.ifBlank { null }, System.currentTimeMillis())
            }
        })
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Nouvelle réception", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(20.dp))
            Text("Type d'intrant", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                types.forEach { (v, l) -> PoufaSelectionChip(l, type == v) { type = v; unit = if (v == "aliment") "kg" else "flacon" } }
            }
            Spacer(Modifier.height(20.dp))
            PoufaFormField("Produit", product, { product = it })
            Spacer(Modifier.height(16.dp))
            PoufaNumericField("Quantité reçue", qty, { qty = it }, unit = unit, decimal = true)
            Spacer(Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                units.forEach { u -> PoufaSelectionChip(u, unit == u) { unit = u } }
            }
            Spacer(Modifier.height(16.dp))
            PoufaFormField("Fournisseur (facultatif)", supplier, { supplier = it })
        }
    }
}
