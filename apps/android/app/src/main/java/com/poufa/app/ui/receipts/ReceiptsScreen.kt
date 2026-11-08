package com.poufa.app.ui.receipts

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.poufa.app.data.local.InventoryReceiptEntity
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*

/** Écran 30 — Intrants · Réceptions (onglet Room). */
@Composable
fun ReceiptsTab(
    pending: List<InventoryReceiptEntity>,
    confirmed: List<InventoryReceiptEntity>,
    onOpenReceipt: (String) -> Unit = {},
    onAddReceipt: () -> Unit = {},
) {
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        if (pending.isNotEmpty()) {
            Text("À confirmer", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                pending.forEachIndexed { i, r ->
                    PoufaListRow(
                        title = r.productName,
                        subtitle = "${formatQty(r.quantity)} ${r.unit} · ${recency(r.receiptDate)}",
                        trailing = { PoufaStatusChip("À confirmer", bg = PoufaWarningBg, color = Color(0xFF8A6D1A)) },
                        onClick = { onOpenReceipt(r.id) },
                    )
                    if (i < pending.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }

        Text("Confirmées", fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
        if (confirmed.isEmpty() && pending.isEmpty()) {
            PoufaEmptyState("Aucune réception", "Les réceptions d'intrants apparaîtront ici.")
        } else {
            PoufaCard(contentPadding = PaddingValues(0.dp)) {
                confirmed.forEachIndexed { i, r ->
                    PoufaListRow(
                        title = r.productName,
                        subtitle = "${formatQty(r.quantity)} ${r.unit} · ${recency(r.receiptDate)}",
                        trailing = { PoufaStatusChip("Confirmée", bg = PoufaSoftGreen, color = PoufaSuccess) },
                        onClick = { onOpenReceipt(r.id) },
                    )
                    if (i < confirmed.lastIndex) HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                }
            }
        }
        PoufaSecondaryButton("+ Ajouter une réception", onAddReceipt)
    }
}

private fun formatQty(q: Double): String =
    if (q == q.toLong().toDouble()) q.toLong().toString() else "%.2f".format(q)

private fun recency(epoch: Long): String {
    val days = ((System.currentTimeMillis() - epoch) / 86_400_000).toInt()
    return when {
        days <= 0 -> "Aujourd'hui"
        days == 1 -> "Hier"
        days < 30 -> "Il y a ${days} jours"
        else -> "Il y a ${days / 30} mois"
    }
}
