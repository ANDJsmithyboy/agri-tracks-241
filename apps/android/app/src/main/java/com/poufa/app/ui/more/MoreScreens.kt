package com.poufa.app.ui.more

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.automirrored.outlined.Help
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*

/** Écran 42 — Contacts utiles (numéros réels ou placeholder, dialer ACTION_DIAL). */
data class ContactRow(val name: String, val detail: String?, val phone: String?, val icon: ImageVector)

@Composable
fun UsefulContactsScreen(farmLabel: String, contacts: List<ContactRow>, onBack: () -> Unit, onCall: (String) -> Unit = {}) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Contacts utiles", style = MaterialTheme.typography.displaySmall)
        Text(farmLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))
        PoufaInfoBanner("Numéros à compléter par la ferme ou son organisme d'encadrement.")
        Spacer(Modifier.height(16.dp))
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            contacts.forEachIndexed { i, c ->
                PoufaListRow(
                    c.name, c.detail ?: "[Numéro non renseigné]",
                    leading = {
                        Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                            Icon(c.icon, null, Modifier.size(18.dp), tint = PoufaPrimary)
                        }
                    },
                    trailing = {
                        IconButton(onClick = { c.phone?.let(onCall) }, enabled = c.phone != null) {
                            Icon(Icons.Filled.Call, "Appeler", tint = if (c.phone != null) PoufaPrimary else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f))
                        }
                    },
                )
                if (i < contacts.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }
    }
}

/** Écran 43 — Lots et traçabilité (recherche + liste Room). */
data class LotRowData(val id: String, val code: String, val subtitle: String, val confirmed: Boolean)

@Composable
fun LotsScreen(
    farmLabel: String,
    lots: List<LotRowData>,
    query: String,
    onQueryChange: (String) -> Unit,
    onScan: () -> Unit,
    onOpenLot: (String) -> Unit,
    onNewTransfer: () -> Unit,
    onBack: (() -> Unit)? = null,
) {
    val filtered = lots.filter { query.isBlank() || it.code.contains(query, true) || it.subtitle.contains(query, true) }
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        if (onBack != null) IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Lots et traçabilité", style = MaterialTheme.typography.displaySmall)
        Text(farmLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(16.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = query, onValueChange = onQueryChange,
                placeholder = { Text("Rechercher un lot") }, singleLine = true,
                leadingIcon = { Icon(Icons.Filled.Search, null) },
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f),
            )
            Spacer(Modifier.width(10.dp))
            Box(Modifier.size(56.dp).clip(RoundedCornerShape(12.dp)).background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                IconButton(onClick = onScan) { Icon(Icons.Filled.QrCodeScanner, "Scanner", tint = PoufaPrimary) }
            }
        }
        Spacer(Modifier.height(16.dp))

        if (filtered.isEmpty()) PoufaEmptyState("Aucun lot", "Les lots de cession apparaîtront ici.")
        else PoufaCard(contentPadding = PaddingValues(0.dp)) {
            filtered.forEachIndexed { i, l ->
                PoufaListRow(
                    l.code, l.subtitle,
                    trailing = {
                        PoufaStatusChip(if (l.confirmed) "Cession enregistrée" else "En attente",
                            bg = if (l.confirmed) PoufaSoftGreen else PoufaWarningBg,
                            color = if (l.confirmed) PoufaSuccess else Color(0xFF8A6D1A))
                    },
                    onClick = { onOpenLot(l.id) },
                )
                if (i < filtered.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }
        Spacer(Modifier.height(20.dp))
        PoufaPrimaryButton("+ Nouvelle cession", onNewTransfer)
    }
}

private data class MoreItem(val label: String, val route: String, val icon: ImageVector)

/** Écran 49 — Plus (hub navigation). */
@Composable
fun MoreScreen(
    userName: String?,
    userRole: String?,
    farmName: String?,
    unreadNotifications: Int = 0,
    onProfile: () -> Unit,
    onNavigate: (String) -> Unit,
) {
    val elevage = listOf(
        MoreItem("Mes bandes", "bandes", Icons.Outlined.GridView),
        MoreItem("Lots et traçabilité", "lots", Icons.Outlined.QrCode),
        MoreItem("Signalements sanitaires", "sante", Icons.Outlined.MedicalServices),
        MoreItem("Vaccins et traitements", "traitements", Icons.Outlined.Vaccines),
        MoreItem("Stock vaccins et médicaments", "stock_medical", Icons.Outlined.Inventory2),
    )
    val ferme = listOf(
        MoreItem("Ma ferme", "ma_ferme", Icons.Outlined.Home),
        MoreItem("Équipe", "equipe", Icons.Outlined.Group),
        MoreItem("Contacts utiles", "contacts", Icons.Outlined.Phone),
    )
    val app = listOf(
        MoreItem("POUFA AI", "poufa_ai", Icons.Outlined.AutoAwesome),
        MoreItem("Notifications", "notifications", Icons.Outlined.Notifications),
        MoreItem("Rappels", "rappels", Icons.Outlined.NotificationsActive),
        MoreItem("Données et synchronisation", "sync", Icons.Outlined.Sync),
        MoreItem("Paramètres", "parametres", Icons.Outlined.Settings),
        MoreItem("Aide", "aide", Icons.AutoMirrored.Outlined.Help),
    )

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(PoufaPagePadding), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                PoufaBrandHeader(farmName)
                Box(Modifier.size(40.dp).clip(CircleShape).background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                    Text(userName?.firstOrNull()?.uppercase() ?: "?", fontWeight = FontWeight.Bold, color = PoufaPrimary)
                }
            }
        }
        item {
            PoufaCard {
                PoufaListRow(
                    userName ?: "Utilisateur", "${userRole ?: "Membre"} · ${farmName ?: ""}",
                    leading = {
                        Box(Modifier.size(44.dp).clip(CircleShape).background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                            Text(userName?.firstOrNull()?.uppercase() ?: "?", fontWeight = FontWeight.Bold, color = PoufaPrimary)
                        }
                    },
                    onClick = onProfile,
                )
            }
        }
        item { MoreSection("Élevage", elevage, onNavigate, unreadNotifications.takeIf { it > 0 && elevage.any { i -> i.route == "notifications" } }) }
        item { MoreSection("Ferme", ferme, onNavigate) }
        item { MoreSection("Application", app, onNavigate, unreadNotifications.takeIf { it > 0 }) }
    }
}

@Composable
private fun MoreSection(title: String, items: List<MoreItem>, onNavigate: (String) -> Unit, badge: Int? = null) {
    Column {
        Text(title, fontSize = 18.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 12.dp))
        PoufaCard(contentPadding = PaddingValues(0.dp)) {
            items.forEachIndexed { i, item ->
                PoufaListRow(
                    item.label,
                    leading = {
                        Box(Modifier.size(36.dp).clip(RoundedCornerShape(10.dp)).background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                            Icon(item.icon, null, Modifier.size(18.dp), tint = PoufaPrimary)
                        }
                    },
                    trailing = {
                        if (item.route == "notifications" && badge != null && badge > 0) {
                            PoufaStatusChip("$badge nouvelles", bg = PoufaWarningBg, color = Color(0xFF8A6D1A))
                        } else {
                            Icon(Icons.AutoMirrored.Filled.KeyboardArrowRight, null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    },
                    onClick = { onNavigate(item.route) },
                )
                if (i < items.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            }
        }
    }
}

/** Écran 50 — Mon profil (Clerk identity + logout réel). */
@Composable
fun MyProfileScreen(
    displayName: String?,
    phone: String?,
    role: String?,
    farmName: String?,
    onBack: () -> Unit,
    onSave: (String) -> Unit,
    onLogout: () -> Unit,
) {
    var firstName by remember { mutableStateOf(displayName ?: "") }
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Box(Modifier.size(88.dp).clip(CircleShape).background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                Text(displayName?.firstOrNull()?.uppercase() ?: "?", fontSize = 34.sp, fontWeight = FontWeight.Bold, color = PoufaPrimary)
            }
            Spacer(Modifier.height(12.dp))
            Text(displayName ?: "Utilisateur", style = MaterialTheme.typography.headlineLarge)
            Text(role ?: "Membre", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        Spacer(Modifier.height(24.dp))
        PoufaFormField("Prénom", firstName, { firstName = it })
        Spacer(Modifier.height(16.dp))
        PoufaCard {
            PoufaListRow("Téléphone", trailing = { Text(phone ?: "Non renseigné", fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Rôle", trailing = { Text(role ?: "—", fontWeight = FontWeight.SemiBold) })
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            PoufaListRow("Ferme", trailing = { Text(farmName ?: "—", fontWeight = FontWeight.SemiBold) })
        }
        Spacer(Modifier.height(24.dp))
        OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth().height(48.dp)) {
            Text("Se déconnecter")
        }
        Spacer(Modifier.height(16.dp))
        PoufaPrimaryButton("Enregistrer", { onSave(firstName.trim()) })
    }
}
