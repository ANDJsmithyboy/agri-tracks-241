package com.poufa.app.ui.traceability

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
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*

/** Écran 44 — Nouvelle cession étape 1. */
@Composable
fun CreateTransferStepOneScreen(
    farmLabel: String,
    bands: List<Pair<String, String>>, // id to "Bande X · N animaux"
    recipients: List<String>,
    bandId: String?, qty: String, recipient: String,
    onBand: (String) -> Unit, onQty: (String) -> Unit, onRecipient: (String) -> Unit,
    onBack: () -> Unit, onContinue: () -> Unit,
) {
    Scaffold(bottomBar = { PoufaBottomActionBar("Continuer", onContinue, enabled = bandId != null && qty.toIntOrNull()?.let { it > 0 } == true && recipient.isNotBlank()) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            ProgressHeader("Étape 1 sur 2", "Détails", 0.5f)
            Spacer(Modifier.height(20.dp))
            Text("Nouvelle cession", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text(farmLabel, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))
            PoufaFormField("Bande d'origine", bands.firstOrNull { it.first == bandId }?.second ?: "", { })
            bands.forEach { (id, label) -> PoufaSelectionChip(label, bandId == id) { onBand(id) } }
            Spacer(Modifier.height(16.dp))
            PoufaNumericField("Quantité cédée", qty, onQty, unit = "animaux")
            Spacer(Modifier.height(16.dp))
            Text("Destinataire", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(bottom = 8.dp))
            recipients.forEach { r -> PoufaSelectionChip(r, recipient == r) { onRecipient(r) } }
            Spacer(Modifier.height(16.dp))
            PoufaCard { PoufaListRow("Date de cession", subtitle = "Aujourd'hui") }
        }
    }
}

@Composable
fun ProgressHeader(stepLabel: String, stage: String, fraction: Float) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(stepLabel, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(stage, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = PoufaPrimary)
    }
    Spacer(Modifier.height(8.dp))
    LinearProgressIndicator(progress = { fraction }, modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)), color = PoufaPrimary, trackColor = PoufaNeutralSelected)
}

/** Écran 45 — Vérification cession. */
@Composable
fun CreateTransferReviewScreen(
    bandLabel: String, qty: Int, recipient: String, provisionalLotCode: String?,
    onBack: () -> Unit, onSave: () -> Unit, onModify: () -> Unit,
) {
    Scaffold(bottomBar = {
        Column {
            PoufaPrimaryButton("Enregistrer la cession", onSave)
            TextButton(onClick = onModify, modifier = Modifier.fillMaxWidth()) { Text("Modifier", color = PoufaPrimary) }
            Spacer(Modifier.height(8.dp))
        }
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            ProgressHeader("Étape 2 sur 2", "Vérification", 1f)
            Spacer(Modifier.height(20.dp))
            Text("Vérifiez la cession", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text(farmLabelOf(bandLabel), fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))
            PoufaCard {
                PoufaListRow("Bande d'origine", trailing = { Text(bandLabel, fontWeight = FontWeight.SemiBold) })
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("Quantité cédée", trailing = { Text("$qty animaux", fontWeight = FontWeight.SemiBold) })
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("Destinataire", trailing = { Text(recipient, fontWeight = FontWeight.SemiBold) })
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("Date de cession", trailing = { Text("Aujourd'hui", fontWeight = FontWeight.SemiBold) })
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                PoufaListRow("Numéro de lot", trailing = {
                    PoufaStatusChip(provisionalLotCode ?: "En attente", bg = PoufaWarningBg, color = Color(0xFF8A6D1A))
                })
            }
            Spacer(Modifier.height(16.dp))
            PoufaInfoBanner("Le QR code permet de retrouver le lot. Il ne constitue pas un certificat sanitaire.")
        }
    }
}
private fun farmLabelOf(s: String) = s

/** Écran 46 — Aperçu étiquette lot (QR réel via ZXing + export PDF réel). */
@Composable
fun LotLabelPreviewScreen(
    lotCode: String, isProvisional: Boolean,
    farmName: String, bandLabel: String, qty: Int, dateLabel: String,
    onBack: () -> Unit, onPrint: () -> Unit, onPdf: () -> Unit,
) {
    var count by remember { mutableIntStateOf(1) }
    var large by remember { mutableStateOf(true) }
    // QR réel : payload = référence canonique du lot (pas d'URL inventée)
    val qrBitmap = remember(lotCode) {
        runCatching {
            val size = 512
            val matrix = com.google.zxing.qrcode.QRCodeWriter().encode("POUFA-LOT:$lotCode", com.google.zxing.BarcodeFormat.QR_CODE, size, size)
            val bmp = android.graphics.Bitmap.createBitmap(size, size, android.graphics.Bitmap.Config.RGB_565)
            for (x in 0 until size) for (y in 0 until size) bmp.setPixel(x, y, if (matrix[x, y]) android.graphics.Color.BLACK else android.graphics.Color.WHITE)
            bmp
        }.getOrNull()
    }
    Scaffold(bottomBar = {
        Column {
            PoufaPrimaryButton(if (isProvisional) "Imprimer (provisoire)" else "Imprimer", onPrint, enabled = !isProvisional)
            TextButton(onClick = onPdf, modifier = Modifier.fillMaxWidth()) { Text("Enregistrer en PDF", color = PoufaPrimary) }
            Spacer(Modifier.height(8.dp))
        }
    }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Aperçu de l'étiquette", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text("Lot $lotCode", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(20.dp))

            Box(Modifier.fillMaxWidth().height(200.dp).clip(RoundedCornerShape(16.dp)).background(PoufaNeutralSelected), contentAlignment = Alignment.Center) {
                Row(Modifier.padding(16.dp).fillMaxWidth().height(140.dp).clip(RoundedCornerShape(8.dp)).background(Color.White).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    qrBitmap?.let { bmp ->
                        androidx.compose.foundation.Image(bmp.asImageBitmap(), "QR $lotCode", Modifier.size(96.dp))
                    } ?: Box(Modifier.size(96.dp).background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                        Icon(Icons.Filled.QrCode, null, tint = PoufaPrimary)
                    }
                    Spacer(Modifier.width(16.dp))
                    Column {
                        Text("POUFA", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PoufaGold)
                        Text(lotCode, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Text(farmName, fontSize = 12.sp)
                        Text("$bandLabel · $qty animaux", fontSize = 12.sp)
                        Text("Cession : $dateLabel", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text("Ne constitue pas un certificat sanitaire.", fontSize = 9.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            Spacer(Modifier.height(16.dp))
            PoufaCard {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Nombre d'étiquettes", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = { if (count > 1) count-- }) { Icon(Icons.Filled.Remove, "−") }
                        Text("$count", fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.width(24.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                        IconButton(onClick = { if (count < 50) count++ }) { Icon(Icons.Filled.Add, "+") }
                    }
                }
                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                Text("Format", fontSize = 14.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(vertical = 8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    PoufaSelectionChip("Petite · 50×30", !large) { large = false }
                    PoufaSelectionChip("Grande · 100×60", large) { large = true }
                }
            }
        }
    }
}

/** Écran 47 — Retrouver un lot (scan manuel + zone caméra). */
@Composable
fun LotLookupScreen(
    recentSearches: List<String>,
    onBack: () -> Unit,
    onSearch: (String) -> Unit,
    onScan: () -> Unit,
    onRecent: (String) -> Unit,
) {
    var code by remember { mutableStateOf("") }
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Retrouver un lot", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("Scannez le QR code ou saisissez le numéro.", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))

        Box(Modifier.fillMaxWidth().height(180.dp).clip(RoundedCornerShape(16.dp)).background(PoufaNeutralSelected), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Filled.QrCodeScanner, null, Modifier.size(48.dp), tint = PoufaPrimary)
                Text("Placez le QR code dans le cadre", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                TextButton(onClick = onScan) { Text("Activer la caméra", color = PoufaPrimary) }
            }
        }
        Spacer(Modifier.height(12.dp))
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            HorizontalDivider(Modifier.weight(1f)); Text(" ou ", Modifier.padding(horizontal = 12.dp), fontSize = 13.sp)
            HorizontalDivider(Modifier.weight(1f))
        }
        Spacer(Modifier.height(12.dp))
        PoufaFormField("Numéro du lot", code, { code = it }, placeholder = "Ex. LP-003-01")
        Spacer(Modifier.height(16.dp))
        PoufaPrimaryButton("Rechercher", { if (code.isNotBlank()) onSearch(code.trim()) }, icon = Icons.Filled.Search)
        if (recentSearches.isNotEmpty()) {
            Spacer(Modifier.height(24.dp))
            Text("Recherches récentes", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(8.dp))
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                recentSearches.take(5).forEachIndexed { i, s ->
                    PoufaListRow(s, onClick = { onRecent(s) })
                    if (i < recentSearches.take(5).lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }
    }
}

/** Écran 48 — Résultat recherche lot. */
@Composable
fun LotSearchResultScreen(
    query: String, found: Boolean, offline: Boolean,
    lotCode: String?, bandLabel: String?, qty: Int?, recipient: String?, dateLabel: String?,
    recentSearches: List<String>,
    onBack: () -> Unit, onOpenLot: () -> Unit, onRecent: (String) -> Unit,
) {
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Résultat de la recherche", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text("« $query »", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(20.dp))
        when {
            !found && offline -> PoufaInfoBanner("Hors connexion — ce lot n'est pas dans le cache local. Réessayez plus tard.", bg = PoufaWarningBg)
            !found -> PoufaInfoBanner("Aucun lot trouvé pour « $query ».", bg = PoufaWarningBg)
            else -> {
                PoufaInfoBanner("1 lot correspond à votre recherche.", bg = PoufaSoftGreen, fg = PoufaSuccess)
                Spacer(Modifier.height(12.dp))
                PoufaCard {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(lotCode ?: "", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        PoufaStatusChip("Cession enregistrée", bg = PoufaSoftGreen, color = PoufaSuccess)
                    }
                    Spacer(Modifier.height(8.dp))
                    PoufaListRow("Bande d'origine", trailing = { Text(bandLabel ?: "—", fontWeight = FontWeight.SemiBold) })
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    PoufaListRow("Quantité cédée", trailing = { Text("${qty ?: 0} animaux", fontWeight = FontWeight.SemiBold) })
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    PoufaListRow("Destinataire", trailing = { Text(recipient ?: "—", fontWeight = FontWeight.SemiBold) })
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    PoufaListRow("Date de cession", trailing = { Text(dateLabel ?: "—", fontWeight = FontWeight.SemiBold) })
                    Spacer(Modifier.height(8.dp))
                    PoufaSecondaryButton("Ouvrir la fiche du lot", onOpenLot)
                }
            }
        }
        if (recentSearches.isNotEmpty()) {
            Spacer(Modifier.height(24.dp))
            Text("Recherches récentes", fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                recentSearches.take(5).forEachIndexed { i, s ->
                    PoufaListRow(s, onClick = { onRecent(s) })
                    if (i < recentSearches.take(5).lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }
    }
}
