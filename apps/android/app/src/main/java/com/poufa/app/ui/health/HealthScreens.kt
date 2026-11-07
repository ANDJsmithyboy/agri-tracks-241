package com.poufa.app.ui.health

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.data.local.HealthDeclarationEntity
import com.poufa.app.data.local.InventoryProductEntity
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*

// ── Écran 35 — Stock vaccins & médicaments (expiry calculée) ────────────
@Composable
fun MedicalInventoryScreen(
    farmLabel: String,
    products: List<InventoryProductEntity>,
    onBack: () -> Unit,
    onNewReceipt: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Vaccins et médicaments", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("Stock · $farmLabel", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            products.forEachIndexed { i, p ->
                val now = System.currentTimeMillis()
                val daysLeft = p.expiryDate?.let { ((it - now) / 86_400_000).toInt() }
                val (chip, bg, fg) = when {
                    daysLeft == null -> Triple("—", PoufaNeutralSelected, PoufaSecondaryText)
                    daysLeft < 0 -> Triple("Expiré", PoufaWarningBg, PoufaCritical)
                    daysLeft <= 30 -> Triple("Expire bientôt", PoufaWarningBg, Color(0xFF8A6D1A))
                    else -> Triple("Valide", PoufaSoftGreen, PoufaSuccess)
                }
                PoufaListRow(
                    p.name, "${p.batchNumber ?: "—"} · ${p.unit}",
                    leading = {
                        Box(Modifier.size(36.dp).background(PoufaSoftGreen, androidx.compose.foundation.shape.RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) {
                            Icon(Icons.Filled.MedicalServices, null, Modifier.size(18.dp), tint = PoufaPrimary)
                        }
                    },
                    trailing = { PoufaStatusChip(chip, bg = bg, color = fg) },
                )
                if (i < products.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }
        Spacer(Modifier.height(20.dp))
        PoufaSecondaryButton("+ Nouvelle réception", onNewReceipt)
    }
}

// ── Écran 36 — Signalements sanitaires (liste Room) ─────────────────────
@Composable
fun HealthDeclarationsScreen(
    farmLabel: String,
    declarations: List<HealthDeclarationEntity>,
    bandLabel: (String) -> String,
    onBack: () -> Unit,
    onNew: () -> Unit,
    onOpen: (String) -> Unit = {},
) {
    val statusLabel = mapOf(
        "local" to "En attente d'envoi", "pending" to "En attente d'envoi",
        "submitted" to "Transmis", "review" to "En analyse",
        "confirmed" to "Confirmé", "closed" to "Clôturé",
    )
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Signalements sanitaires", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(farmLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        if (declarations.isEmpty()) {
            PoufaEmptyState("Aucun signalement", "Vos signalements sanitaires apparaîtront ici.")
        } else {
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                declarations.forEachIndexed { i, d ->
                    PoufaListRow(
                        d.problemType, bandLabel(d.bandId),
                        leading = {
                            Box(Modifier.size(36.dp).background(PoufaSoftGreen, androidx.compose.foundation.shape.RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) {
                                Icon(Icons.Filled.MedicalServices, null, Modifier.size(18.dp), tint = PoufaPrimary)
                            }
                        },
                        trailing = { PoufaStatusChip(statusLabel[d.status] ?: d.status, bg = PoufaWarningBg, color = Color(0xFF8A6D1A)) },
                        onClick = { onOpen(d.id) },
                    )
                    if (i < declarations.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }
        Spacer(Modifier.height(20.dp))
        PoufaPrimaryButton("Nouveau signalement", onNew)
    }
}

// ── Écran 37 — Bottom sheet type de problème ────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HealthProblemTypeSheet(
    visible: Boolean,
    selected: String?,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit,
    onValidate: () -> Unit,
) {
    if (!visible) return
    val types = listOf(
        "signes_inhabituels" to "Signes inhabituels",
        "mortalite_anormale" to "Mortalité annormale",
        "croissance_anormale" to "Croissance ou consommation annormale",
        "eau_alimentation" to "Problème d'eau ou d'alimentation",
        "autre" to "Autre",
    )
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(Modifier.fillMaxWidth().padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            Text("Type de problème", fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(16.dp))
            types.forEach { (v, l) ->
                PoufaSelectionChip(l, selected == v) { onSelect(v) }
                Spacer(Modifier.height(8.dp))
            }
            Spacer(Modifier.height(16.dp))
            PoufaPrimaryButton("Valider", onValidate, enabled = selected != null)
        }
    }
}

// ── Écrans 38–39 — Formulaire signalement + erreurs de validation ───────
@Composable
fun HealthDeclarationFormScreen(
    bandLabel: String,
    population: Int?,
    symptoms: List<String> = listOf("Baisse d'appétit", "Difficultés respiratoires", "Diarrhée", "Toux", "Plumes ébouriffées", "Autre"),
    onBack: () -> Unit,
    onSave: (problemType: String, selectedSigns: List<String>, affected: Int?, notes: String?, photoCount: Int) -> Unit,
    photoCount: Int = 0,
    onAddPhoto: () -> Unit = {},
) {
    var problemType by remember { mutableStateOf<String?>(null) }
    var signs by remember { mutableStateOf(setOf<String>()) }
    var affected by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var errors by remember { mutableStateOf(setOf<String>()) }
    var showTypeSheet by remember { mutableStateOf(false) }

    val typeLabels = mapOf(
        "signes_inhabituels" to "Signes inhabituels", "mortalite_anormale" to "Mortalité anormale",
        "croissance_anormale" to "Croissance anormale", "eau_alimentation" to "Eau/alimentation", "autre" to "Autre",
    )

    Scaffold(bottomBar = {
        PoufaBottomActionBar("Enregistrer le signalement", {
            val errs = mutableSetOf<String>()
            if (problemType == null) errs += "type"
            if (signs.isEmpty()) errs += "signs"
            if (affected.toIntOrNull() == null || (affected.toIntOrNull() ?: 0) <= 0) errs += "count"
            if (errs.isEmpty()) {
                onSave(problemType!!, signs.toList(), affected.toIntOrNull(), notes.ifBlank { null }, photoCount)
            } else errors = errs
        })
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Signalement sanitaire", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text(bandLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(16.dp))

            // Résumé erreurs (écran 39)
            if (errors.isNotEmpty()) {
                PoufaInfoBanner(
                    "${errors.size} information(s) à compléter — vérifiez les champs signalés.",
                    bg = Color(0xFFFDECEC), fg = PoufaCritical,
                )
                Spacer(Modifier.height(12.dp))
            }

            PoufaInfoBanner("Votre signalement sera transmis aux services vétérinaires lorsque la connexion sera rétablie.")
            Spacer(Modifier.height(16.dp))

            // Type de problème → bottom sheet (écran 37)
            PoufaFormField("Type de problème", typeLabels[problemType] ?: "", { },
                placeholder = "Choisir", error = if ("type" in errors) "Champ requis" else null)
            TextButton(onClick = { showTypeSheet = true }) { Text("Sélectionner…", color = PoufaPrimary) }
            Spacer(Modifier.height(12.dp))

            Text("Signes observés", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                symptoms.forEach { s ->
                    PoufaSelectionChip(s, s in signs) {
                        signs = if (s in signs) signs - s else signs + s
                    }
                }
            }
            if ("signs" in errors) Text("Sélectionnez au moins un signe", fontSize = 12.sp, color = PoufaCritical)
            Spacer(Modifier.height(16.dp))

            PoufaNumericField("Animaux touchés", affected, { affected = it.filter(Char::isDigit) },
                unit = "animaux",
                error = if ("count" in errors) "Nombre requis" else null)
            Spacer(Modifier.height(16.dp))

            PoufaFormField("Observations (facultatif)", notes, { notes = it }, singleLine = false)
            Spacer(Modifier.height(16.dp))

            OutlinedButton(onClick = onAddPhoto, modifier = Modifier.fillMaxWidth().height(48.dp)) {
                Text(if (photoCount > 0) "$photoCount photo(s) jointe(s)" else "Ajouter une photo")
            }
        }
    }

    HealthProblemTypeSheet(
        visible = showTypeSheet,
        selected = problemType,
        onSelect = { problemType = it },
        onDismiss = { showTypeSheet = false },
        onValidate = { showTypeSheet = false },
    )
}

// ── Écran 41 — Détail signalement + timeline de suivi ───────────────────
@Composable
fun HealthDeclarationDetailScreen(
    problemLabel: String,
    bandLabel: String,
    statusLabel: String,
    statusIsPending: Boolean,
    eventDate: String,
    affected: Int?,
    signs: String,
    photoCount: Int,
    timeline: List<Triple<String, String, Boolean>>, // label, date, done
    onBack: () -> Unit,
    onAddInfo: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text(problemLabel, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(bandLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(12.dp))
        PoufaStatusChip(statusLabel, bg = if (statusIsPending) PoufaWarningBg else PoufaSoftGreen,
            color = if (statusIsPending) Color(0xFF8A6D1A) else PoufaSuccess)
        Spacer(Modifier.height(20.dp))
        Text("Suivi", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(12.dp))
        PoufaCard {
            timeline.forEachIndexed { i, (label, date, done) ->
                Row(verticalAlignment = Alignment.Top) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(Modifier.size(24.dp).background(if (done) PoufaSoftGreen else PoufaNeutralSelected, androidx.compose.foundation.shape.CircleShape), contentAlignment = Alignment.Center) {
                            Text(if (done) "✓" else "…", fontSize = 12.sp, fontWeight = FontWeight.Bold,
                                color = if (done) PoufaSuccess else MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        if (i < timeline.lastIndex) Box(Modifier.width(2.dp).height(28.dp).background(MaterialTheme.colorScheme.outlineVariant))
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.padding(bottom = if (i < timeline.lastIndex) 16.dp else 0.dp)) {
                        Text(label, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                        Text(date, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
        Spacer(Modifier.height(16.dp))
        PoufaCard {
            PoufaListRow("Date de l'événement", trailing = { Text(eventDate, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Animaux concernés", trailing = { Text("${affected ?: "—"}", fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Signes observés", trailing = { Text(signs, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Photos", trailing = { Text("$photoCount", fontWeight = FontWeight.SemiBold) })
        }
        Spacer(Modifier.height(16.dp))
        PoufaInfoBanner("Le statut est mis à jour lorsque les services vétérinaires répondent.")
        Spacer(Modifier.height(16.dp))
        PoufaSecondaryButton("+ Ajouter une information", onAddInfo)
    }
}

// ── Écran 40 — Signalement enregistré (local, en attente d'envoi) ───────
@Composable
fun HealthDeclarationSuccessScreen(
    problemLabel: String,
    signs: String,
    affected: Int?,
    photoCount: Int,
    bandLabel: String,
    onHome: () -> Unit,
    onViewReports: () -> Unit,
) {
    Column(
        Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Spacer(Modifier.height(48.dp))
        Box(Modifier.size(88.dp).background(PoufaSoftGreen, androidx.compose.foundation.shape.CircleShape), contentAlignment = Alignment.Center) {
            Icon(Icons.Filled.MedicalServices, null, Modifier.size(44.dp), tint = PoufaPrimary)
        }
        Spacer(Modifier.height(20.dp))
        Text("Signalement enregistré", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("Il sera transmis aux services vétérinaires au retour du réseau.", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(12.dp))
        PoufaStatusChip("En attente d'envoi", bg = PoufaWarningBg, color = Color(0xFF8A6D1A))
        Spacer(Modifier.height(24.dp))
        PoufaCard {
            PoufaListRow("Bande", trailing = { Text(bandLabel, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Problème", trailing = { Text(problemLabel, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Signes", trailing = { Text(signs, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Animaux touchés", trailing = { Text("${affected ?: "—"}", fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Photos", trailing = { Text("$photoCount", fontWeight = FontWeight.SemiBold) })
        }
        Spacer(Modifier.height(32.dp))
        PoufaPrimaryButton("Retour à l'accueil", onHome)
        Spacer(Modifier.height(12.dp))
        PoufaSecondaryButton("Voir mes signalements", onViewReports)
    }
}
