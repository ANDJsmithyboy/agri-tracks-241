package com.poufa.app.ui.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
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

/** Écran 51 — Ma ferme. */
@Composable
fun MyFarmScreen(
    farmName: String, locality: String, farmType: String, ownerName: String,
    lotPrefix: String, activeBandLabel: String?, buildingsSummary: String, teamCount: Int,
    onBack: () -> Unit, onBuildings: () -> Unit, onTeam: () -> Unit, onEdit: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text(farmName, fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("$locality · $farmType", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        PoufaCard {
            PoufaListRow("Type d'élevage", trailing = { Text(farmType, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Responsable", trailing = { Text(ownerName, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Préfixe des lots", trailing = { Text(lotPrefix, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Bande en cours", trailing = { Text(activeBandLabel ?: "Aucune", fontWeight = FontWeight.SemiBold) })
        }
        Spacer(Modifier.height(16.dp))
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            PoufaListRow("Bâtiments", subtitle = buildingsSummary, onClick = onBuildings)
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Équipe", subtitle = "$teamCount personnes", onClick = onTeam)
        }
        Spacer(Modifier.height(16.dp))
        PoufaInfoBanner("Le préfixe $lotPrefix sert à numéroter les lots de cette ferme.")
        Spacer(Modifier.height(20.dp))
        PoufaSecondaryButton("Modifier les informations", onEdit)
    }
}

/** Écran 52 — Équipe. */
data class TeamMember(val name: String, val role: String, val permissions: String, val status: String)

@Composable
fun FarmTeamScreen(farmName: String, members: List<TeamMember>, onBack: () -> Unit, onInvite: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Équipe", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(farmName, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            members.forEachIndexed { i, m ->
                PoufaListRow(
                    m.name, m.permissions,
                    trailing = {
                        PoufaStatusChip(m.status,
                            bg = if (m.status == "Responsable") PoufaSoftGreen else if (m.status == "En attente") PoufaWarningBg else PoufaNeutralSelected,
                            color = if (m.status == "Responsable") PoufaSuccess else if (m.status == "En attente") Color(0xFF8A6D1A) else PoufaSecondaryText)
                    },
                )
                if (i < members.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }
        Spacer(Modifier.height(16.dp))
        PoufaInfoBanner("Les ouvriers saisissent les journées et les pesées. Seul le responsable peut clôturer une bande.")
        Spacer(Modifier.height(20.dp))
        PoufaSecondaryButton("+ Inviter une personne", onInvite)
    }
}

/** Écran 53 — Rappels (DataStore + WorkManager scheduling). */
@Composable
fun RemindersScreen(
    reminders: Map<String, Pair<Boolean, String>>, onBack: () -> Unit, onToggle: (String, Boolean) -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Rappels", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("Notifications sur ce téléphone", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            reminders.forEach { (key, pair) ->
                val (enabled, detail) = pair
                Row(Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(key, fontSize = 15.sp, fontWeight = FontWeight.Medium)
                        Text(detail, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Switch(checked = enabled, onCheckedChange = { onToggle(key, it) })
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }
        Spacer(Modifier.height(16.dp))
        PoufaInfoBanner("Les rappels fonctionnent aussi sans réseau.")
    }
}

/** Écran 54 — Notifications. */
data class AppNotification(val id: String, val title: String, val body: String, val isNew: Boolean, val section: String)

@Composable
fun NotificationsScreen(farmName: String, today: List<AppNotification>, week: List<AppNotification>, onBack: () -> Unit, onOpen: (String) -> Unit = {}) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Notifications", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(farmName, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        if (today.isNotEmpty()) {
            Text("Aujourd'hui", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                today.forEachIndexed { i, n ->
                    PoufaListRow(n.title, n.body, trailing = { if (n.isNew) PoufaStatusChip("Nouveau", bg = PoufaWarningBg, color = Color(0xFF8A6D1A)) }, onClick = { onOpen(n.id) })
                    if (i < today.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
            Spacer(Modifier.height(16.dp))
        }
        if (week.isNotEmpty()) {
            Text("Cette semaine", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                week.forEachIndexed { i, n ->
                    PoufaListRow(n.title, n.body, onClick = { onOpen(n.id) })
                    if (i < week.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }
        if (today.isEmpty() && week.isEmpty()) PoufaEmptyState("Aucune notification", "Les notifications apparaîtront ici.")
    }
}

/** Écran 55 — Données et synchronisation (Room outbox + WorkManager). */
data class PendingOpRow(val label: String, val detail: String)

@Composable
fun DataSynchronizationScreen(
    farmName: String, isOnline: Boolean, lastSyncLabel: String?,
    pending: List<PendingOpRow>, wifiOnly: Boolean, storageLabel: String,
    onBack: () -> Unit, onWifiOnly: (Boolean) -> Unit, onSyncNow: () -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Données et synchronisation", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(farmName, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        PoufaCard {
            PoufaListRow(if (isOnline) "En ligne" else "Hors connexion",
                subtitle = lastSyncLabel?.let { "Dernière synchronisation : $it" } ?: "Jamais synchronisé")
        }
        Spacer(Modifier.height(16.dp))
        if (pending.isNotEmpty()) {
            Text("En attente d'envoi (${pending.size})", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                pending.forEachIndexed { i, p ->
                    PoufaListRow(p.label, p.detail)
                    if (i < pending.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
            Spacer(Modifier.height(16.dp))
        }
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            Row(Modifier.fillMaxWidth().padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Envoyer uniquement en Wi-Fi", fontSize = 15.sp, fontWeight = FontWeight.Medium)
                    Text("Économise les données mobiles", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Switch(checked = wifiOnly, onCheckedChange = onWifiOnly)
            }
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Espace utilisé", subtitle = "Sur ce téléphone", trailing = { Text(storageLabel, fontWeight = FontWeight.SemiBold) })
        }
        Spacer(Modifier.height(20.dp))
        if (isOnline) PoufaPrimaryButton("Synchroniser maintenant", onSyncNow)
        else PoufaSecondaryButton("Synchroniser maintenant", {}, enabled = false)
        if (!isOnline) Text("Disponible au retour du réseau.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 8.dp))
    }
}

/** Écran 56 — Paramètres. */
@Composable
fun SettingsScreen(
    textScale: String, language: String, weightUnit: String, dateFormat: String, appVersion: String,
    onBack: () -> Unit, onTextScale: (String) -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Paramètres", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("Application POUFA", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        Text("Taille du texte", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("Normale" to "normal", "Grande" to "large", "Très grande" to "xlarge").forEach { (label, value) ->
                PoufaSelectionChip(label, textScale == value) { onTextScale(value) }
            }
        }
        Spacer(Modifier.height(20.dp))
        PoufaCard {
            PoufaListRow("Langue", trailing = { Text(language, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Unité de poids", trailing = { Text(weightUnit, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Format de date", trailing = { Text(dateFormat, fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Version de l'application", trailing = { Text(appVersion, fontWeight = FontWeight.SemiBold) })
        }
    }
}

/** Écran 57 — Aide (FAQ avec recherche). */
data class FaqItem(val q: String, val a: String)

@Composable
fun HelpScreen(faqs: List<FaqItem>, onBack: () -> Unit, onContacts: () -> Unit) {
    var query by remember { mutableStateOf("") }
    var expanded by remember { mutableStateOf<String?>(null) }
    val filtered = faqs.filter { query.isBlank() || it.q.contains(query, true) || it.a.contains(query, true) }
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Aide", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("Questions fréquentes", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))
        OutlinedTextField(value = query, onValueChange = { query = it }, placeholder = { Text("Rechercher dans l'aide") }, singleLine = true, modifier = Modifier.fillMaxWidth(), shape = androidx.compose.foundation.shape.RoundedCornerShape(12.dp))
        Spacer(Modifier.height(16.dp))
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            filtered.forEachIndexed { i, f ->
                Column(Modifier.fillMaxWidth().clickable { expanded = if (expanded == f.q) null else f.q }.padding(16.dp)) {
                    Text(f.q, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                    if (expanded == f.q) {
                        Spacer(Modifier.height(6.dp))
                        Text(f.a, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                if (i < filtered.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }
        Spacer(Modifier.height(16.dp))
        PoufaInfoBanner("Besoin d'aide sur le terrain ? Contactez votre technicien d'encadrement.")
        Spacer(Modifier.height(16.dp))
        PoufaSecondaryButton("Contacts utiles", onContacts)
    }
}
