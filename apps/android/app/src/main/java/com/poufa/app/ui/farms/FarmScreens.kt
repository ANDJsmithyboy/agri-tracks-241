package com.poufa.app.ui.farms

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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

/** Écran 09 — Choix de la ferme (données Room via repository). */
@Composable
fun FarmSelectionScreen(
    farms: List<Pair<String, String>>, // id → label « Nom — Localité »
    selectedId: String?,
    onSelect: (String) -> Unit,
    onContinue: () -> Unit,
    onAddFarm: () -> Unit,
    canCreateFarm: Boolean = true,
    loading: Boolean = false,
) {
    Scaffold(
        bottomBar = { PoufaBottomActionBar("Continuer", onContinue) },
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding),
        ) {
            Spacer(Modifier.height(24.dp))
            PoufaBrandHeader()
            Spacer(Modifier.height(28.dp))
            Text("Vos fermes", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text("Choisissez la ferme à suivre.", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(24.dp))

            if (loading) {
                PoufaCard { CircularProgressIndicator(Modifier.size(20.dp)) }
            } else if (farms.isEmpty()) {
                PoufaEmptyState(
                    title = "Aucune ferme assignée",
                    description = "Votre compte n'est rattaché à aucune ferme. Contactez l'administrateur POUFA.",
                )
            } else {
                PoufaCard(contentPadding = PaddingValues(0.dp)) {
                    farms.forEachIndexed { i, (id, label) ->
                        val selected = id == selectedId
                        Row(
                            Modifier.fillMaxWidth()
                                .background(if (selected) PoufaSoftGreen else MaterialTheme.colorScheme.surface)
                                .clickable { onSelect(id) }
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(
                                Modifier.size(22.dp).clip(CircleShape)
                                    .border(2.dp, if (selected) PoufaPrimary else MaterialTheme.colorScheme.outline, CircleShape),
                                contentAlignment = Alignment.Center,
                            ) {
                                if (selected) Box(Modifier.size(10.dp).clip(CircleShape).background(PoufaPrimary))
                            }
                            Spacer(Modifier.width(14.dp))
                            Text(label, fontSize = 15.sp, fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal)
                        }
                        if (i < farms.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
            if (canCreateFarm) PoufaSecondaryButton("Ajouter une ferme", onAddFarm)
        }
    }
}

/** Écran 10 — Création de ferme (spec champs + chips type d'élevage). */
@Composable
fun CreateFarmScreen(
    onBack: () -> Unit,
    onSubmit: (name: String, province: String, locality: String, type: String, buildings: Int?) -> Unit,
    submitting: Boolean = false,
    error: String? = null,
) {
    var name by remember { mutableStateOf("") }
    var province by remember { mutableStateOf("") }
    var locality by remember { mutableStateOf("") }
    var farmingType by remember { mutableStateOf<String?>(null) }
    var buildings by remember { mutableStateOf("") }

    val provinces = listOf(
        "Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga",
        "Ogooué-Ivindo", "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem",
    )
    val types = listOf("Poulets de chair" to "chair", "Pondeuses" to "pondeuses", "Mixte" to "mixte")

    val valid = name.isNotBlank() && province.isNotBlank() && locality.isNotBlank() &&
        farmingType != null && buildings.toIntOrNull()?.let { it > 0 } == true

    Scaffold(
        bottomBar = {
            PoufaBottomActionBar(
                primaryText = if (submitting) "Création…" else "Créer la ferme",
                onPrimary = {
                    if (valid) onSubmit(name.trim(), province, locality.trim(), farmingType!!, buildings.toIntOrNull())
                },
                hint = error,
            )
        },
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)
                .verticalScroll(rememberScrollState()),
        ) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Nouvelle ferme", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text("Ces informations servent à identifier vos lots.", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(24.dp))

            PoufaFormField("Nom de la ferme", name, { name = it }, placeholder = "Ex. Ferme Les Palmiers")
            Spacer(Modifier.height(20.dp))

            Text("Province", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                provinces.forEach { p -> PoufaSelectionChip(p, province == p) { province = p } }
            }
            Spacer(Modifier.height(20.dp))

            PoufaFormField("Commune ou village", locality, { locality = it }, placeholder = "Ex. Ntoum")
            Spacer(Modifier.height(20.dp))

            Text("Type d'élevage", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                types.forEach { (label, value) -> PoufaSelectionChip(label, farmingType == value) { farmingType = value } }
            }
            Spacer(Modifier.height(20.dp))

            PoufaNumericField("Nombre de bâtiments", buildings, { buildings = it.filter(Char::isDigit) })
            Spacer(Modifier.height(32.dp))
        }
    }
}
