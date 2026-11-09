package com.poufa.app.ui.daily

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*

/**
 * Écrans 18–19 — Saisie quotidienne (remplie) + confirmation locale.
 * L'enregistrement effectif se fait via DailyRepository.saveDailyRecord
 * (transaction Room + outbox) — ce composable expose les callbacks.
 */

@Composable
fun DailyEntryScreen(
    bandLabel: String,
    farmLabel: String,
    currentPopulation: Int?,   // depuis Room — null si inconnu
    initialValue: Triple<Int?, Double?, String?>? = null, // édition/correction
    onBack: () -> Unit,
    onSave: (deaths: Int, feedKg: Double?, observations: String?) -> Unit,
    saving: Boolean = false,
) {
    var deathsText by remember { mutableStateOf(initialValue?.first?.toString() ?: "") }
    var feedText by remember { mutableStateOf(initialValue?.second?.toString() ?: "") }
    var observations by remember { mutableStateOf(initialValue?.third ?: "") }
    var deathsError by remember { mutableStateOf<String?>(null) }

    val deaths = deathsText.toIntOrNull()
    val feedKg = feedText.replace(',', '.').toDoubleOrNull()
    val feedError = if (feedText.isNotBlank() && (feedKg == null || feedKg < 0)) "Quantité invalide" else null

    // Aperçu live : effectif courant − mortalité saisie (règle métier, pas de constante)
    val preview = currentPopulation?.let { pop ->
        deaths?.let { pop - it }
    }

    val canSave = deaths != null && deaths >= 0 &&
        (currentPopulation == null || deaths <= currentPopulation) &&
        feedError == null && !saving

    Scaffold(
        bottomBar = {
            PoufaBottomActionBar(
                primaryText = if (saving) "Enregistrement…" else "Enregistrer la journée",
                onPrimary = {
                    if (deaths == null || deaths < 0) {
                        deathsError = "Renseignez un nombre ≥ 0"
                    } else {
                        onSave(deaths, feedKg, observations.ifBlank { null })
                    }
                },
                hint = "Enregistrement possible hors ligne",
            )
        },
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding),
        ) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Saisie de la journée", style = MaterialTheme.typography.displaySmall)
            Text("$bandLabel · $farmLabel", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))

            PoufaCard {
                PoufaListRow("Date", subtitle = "Aujourd'hui", leading = null)
            }
            Spacer(Modifier.height(16.dp))

            PoufaNumericField(
                "Nombre d'animaux morts", deathsText, { deathsText = it.filter(Char::isDigit); deathsError = null },
                unit = "animaux", helper = "Renseignez 0 si aucune mortalité", error = deathsError,
            )
            Spacer(Modifier.height(20.dp))

            PoufaNumericField(
                "Aliment consommé", feedText, { feedText = it },
                unit = "kg", decimal = true, error = feedError,
            )
            Spacer(Modifier.height(20.dp))

            PoufaFormField(
                "Observations (facultatif)", observations, { observations = it },
                singleLine = false,
            )
            Spacer(Modifier.height(20.dp))

            if (currentPopulation != null && deaths != null) {
                PoufaCard(containerColor = PoufaSoftGreen) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("Effectif après saisie", fontSize = 13.sp, color = PoufaSecondaryText)
                            Text("$currentPopulation animaux − $deaths morts", fontSize = 13.sp, color = PoufaSecondaryText)
                        }
                        Text("${preview ?: currentPopulation} animaux", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = PoufaPrimary)
                    }
                }
            }
            Spacer(Modifier.height(24.dp))
        }
    }
}

/** Écran 19 — Confirmation après sauvegarde Room (statut sync réel). */
@Composable
fun DailyEntrySuccessScreen(
    bandLabel: String,
    deaths: Int,
    feedKg: Double?,
    populationAfter: Int?,
    synced: Boolean,
    onHome: () -> Unit,
    onCorrect: () -> Unit,
) {
    Scaffold(
        bottomBar = {
            PoufaBottomActionBar(
                primaryText = "Retour à l'accueil",
                onPrimary = onHome,
                secondary = { PoufaSecondaryButton("Corriger la saisie", onCorrect) },
            )
        },
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Spacer(Modifier.height(40.dp))
            Box(
                Modifier.size(88.dp).clip(CircleShape).background(PoufaSoftGreen),
                contentAlignment = Alignment.Center,
            ) { Icon(Icons.Filled.Check, null, Modifier.size(44.dp), tint = PoufaPrimary) }
            Spacer(Modifier.height(20.dp))
            Text("Journée enregistrée", style = MaterialTheme.typography.displaySmall)
            Text(bandLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(28.dp))

            PoufaCard {
                PoufaListRow("Animaux morts", trailing = { Text("$deaths", fontWeight = FontWeight.SemiBold) })
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("Aliment consommé", trailing = { Text("${feedKg ?: "—"} kg", fontWeight = FontWeight.SemiBold) })
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("Effectif", trailing = { Text("${populationAfter ?: "—"} animaux", fontWeight = FontWeight.SemiBold) })
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("Envoi", trailing = {
                    Text(if (synced) "✓ Envoyée" else "En attente du réseau", fontWeight = FontWeight.SemiBold, color = if (synced) PoufaSuccess else PoufaWarningAccent)
                })
            }
            Spacer(Modifier.height(16.dp))
            PoufaInfoBanner("La saisie est conservée sur le téléphone et sera envoyée automatiquement.")
        }
    }
}
