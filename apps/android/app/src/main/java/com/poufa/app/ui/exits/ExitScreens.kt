package com.poufa.app.ui.exits

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.LocalShipping
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

/** Données écran 24 — onglet Sorties de la fiche bande. */
data class ExitRowData(
    val id: String,
    val title: String,          // « Cession · 300 animaux »
    val subtitle: String,       // « Aujourd'hui · Abattoir partenaire »
    val lotCode: String?,       // code lot officiel ou provisoire
    val isProvisional: Boolean,
)

/** Écran 24 — onglet Sorties (liste Room). */
@Composable
fun BandExitsTab(exits: List<ExitRowData>, onAddExit: () -> Unit, onOpenExit: (String) -> Unit = {}) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        if (exits.isEmpty()) {
            PoufaEmptyState("Aucune sortie enregistrée", "Les cessions et sorties apparaîtront ici.")
        } else {
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                exits.forEachIndexed { i, e ->
                    PoufaListRow(
                        title = e.title, subtitle = e.subtitle,
                        leading = {
                            Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp))
                                .background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                                Icon(Icons.Filled.LocalShipping, null, Modifier.size(18.dp), tint = PoufaPrimary)
                            }
                        },
                        trailing = {
                            if (e.lotCode != null) {
                                PoufaStatusChip(e.lotCode, bg = if (e.isProvisional) PoufaWarningBg else PoufaSoftGreen,
                                    color = if (e.isProvisional) Color(0xFF8A6D1A) else PoufaSuccess)
                            }
                        },
                        onClick = { onOpenExit(e.id) },
                    )
                    if (i < exits.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }
        PoufaInfoBanner("Chaque cession crée un lot avec un QR code pour la traçabilité.")
        PoufaSecondaryButton("+ Enregistrer une sortie", onAddExit)
    }
}

/** Écran 25 — Enregistrer une sortie (cession / autoconsommation / autre). */
@Composable
fun RegisterExitScreen(
    bandLabel: String,
    population: Int?,
    onBack: () -> Unit,
    onSave: (type: String, quantity: Int, recipient: String?) -> Unit,
    saving: Boolean = false,
) {
    val types = listOf("cession" to "Cession", "autoconsommation" to "Autoconsommation", "autre" to "Autre")
    var exitType by remember { mutableStateOf("cession") }
    var qtyText by remember { mutableStateOf("") }
    var recipient by remember { mutableStateOf("") }
    var qtyError by remember { mutableStateOf<String?>(null) }

    val qty = qtyText.toIntOrNull()
    val needsRecipient = exitType == "cession"
    val canSave = qty != null && qty > 0 &&
        (population == null || qty <= population) &&
        (!needsRecipient || recipient.isNotBlank()) && !saving

    Scaffold(
        bottomBar = {
            PoufaBottomActionBar(
                primaryText = if (saving) "Enregistrement…" else "Enregistrer la sortie",
                onPrimary = {
                    if (qty == null || qty <= 0) qtyError = "Nombre invalide"
                    else if (population != null && qty > population) qtyError = "Dépasse l'effectif disponible"
                    else if (needsRecipient && recipient.isBlank()) qtyError = "Destinataire requis pour une cession"
                    else onSave(exitType, qty, recipient.ifBlank { null })
                },
                hint = "Enregistrement possible hors ligne",
            )
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Enregistrer une sortie", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text("$bandLabel" + (population?.let { " · $it animaux présents" } ?: ""),
                fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))

            Text("Type de sortie", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                types.forEach { (value, label) ->
                    PoufaSelectionChip(label, exitType == value) { exitType = value }
                }
            }
            Spacer(Modifier.height(20.dp))

            PoufaNumericField("Nombre d'animaux", qtyText, { qtyText = it.filter(Char::isDigit); qtyError = null },
                unit = "animaux", error = qtyError)
            Spacer(Modifier.height(20.dp))

            if (needsRecipient) {
                PoufaFormField("Destinataire", recipient, { recipient = it }, placeholder = "Ex. Abattoir partenaire")
                Spacer(Modifier.height(20.dp))
            }

            PoufaCard {
                PoufaListRow("Date de sortie", subtitle = "Aujourd'hui")
            }
            Spacer(Modifier.height(16.dp))

            PoufaInfoBanner("Un lot avec QR code sera créé pour cette cession.")
        }
    }
}
