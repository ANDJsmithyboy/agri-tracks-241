package com.poufa.app.data

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import java.io.File
import java.io.FileOutputStream

/** Export PDF réel — étiquettes lot (46) et bilan bande clôturée (29). */
object PdfExport {

    private const val MM_TO_PT = 72f / 25.4f

    /** Étiquette lot : 50×30 ou 100×60 mm, N exemplaires, QR réel ZXing. */
    fun generateLotLabel(
        context: Context, lotCode: String, farmName: String, bandLabel: String,
        qty: Int, dateLabel: String, count: Int, large: Boolean,
    ): File {
        val wMm = if (large) 100 else 50
        val hMm = if (large) 60 else 30
        val doc = PdfDocument()
        val pageW = (wMm * MM_TO_PT).toInt()
        val pageH = (hMm * MM_TO_PT).toInt()

        // QR bitmap réel
        val qrSize = if (large) 400 else 200
        val matrix = QRCodeWriter().encode("POUFA-LOT:$lotCode", BarcodeFormat.QR_CODE, qrSize, qrSize)
        val qr = Bitmap.createBitmap(qrSize, qrSize, Bitmap.Config.ARGB_8888)
        val c = Canvas(qr)
        c.drawColor(Color.WHITE)
        val p = Paint().apply { color = Color.BLACK }
        for (x in 0 until qrSize) for (y in 0 until qrSize) if (matrix[x, y]) c.drawRect(x.toFloat(), y.toFloat(), x + 1f, y + 1f, p)

        repeat(count) { i ->
            val page = doc.startPage(PdfDocument.PageInfo.Builder(pageW, pageH, i + 1).create())
            val pc = page.canvas
            pc.drawColor(Color.WHITE)
            val margin = 8f * MM_TO_PT
            // QR à gauche
            val qrW = (hMm * 0.7f * MM_TO_PT).toInt()
            pc.drawBitmap(qr, margin, margin, null)
            // Texte à droite
            var y = margin + 14f
            val titlePaint = Paint().apply { color = Color.parseColor("#245747"); textSize = (large 14f else 9f) * MM_TO_PT / 2; isFakeBoldText = true }
            val bodyPaint = Paint().apply { color = Color.BLACK; textSize = (large 10f else 6f) * MM_TO_PT / 2 }
            val smallPaint = Paint().apply { color = Color.GRAY; textSize = (large 7f else 4f) * MM_TO_PT / 2 }
            pc.drawText("POUFA", margin + qrW + 10f, y, titlePaint); y += titlePaint.textSize + 4f
            pc.drawText(lotCode, margin + qrW + 10f, y, Paint(bodyPaint).apply { textSize = titlePaint.textSize * 1.4f }); y += titlePaint.textSize * 1.6f
            pc.drawText(farmName, margin + qrW + 10f, y, bodyPaint); y += bodyPaint.textSize + 2f
            pc.drawText("$bandLabel · $qty animaux", margin + qrW + 10f, y, bodyPaint); y += bodyPaint.textSize + 2f
            pc.drawText("Cession : $dateLabel", margin + qrW + 10f, y, smallPaint); y += smallPaint.textSize + 2f
            pc.drawText("Ne constitue pas un certificat sanitaire.", margin + qrW + 10f, y, smallPaint)
            doc.finishPage(page)
        }
        qr.recycle()
        val file = File(context.cacheDir, "etiquette_$lotCode.pdf")
        FileOutputStream(file).use { doc.writeTo(it) }
        doc.close()
        return file
    }

    /** Bilan bande clôturée — données réelles passées en paramètre. */
    fun generateBandReport(
        context: Context, farmName: String, bandCode: String,
        placementDate: String, closureDate: String, durationDays: Int,
        initialChicks: Int, deaths: Int, exits: Int, remaining: Int,
        mortalityPct: Double, totalFeedKg: Double, avgWeightKg: Double?,
        lots: List<String>, pendingSync: Boolean,
    ): File {
        val doc = PdfDocument()
        val pageW = (210 * MM_TO_PT).toInt() // A4
        val pageH = (297 * MM_TO_PT).toInt()
        val page = doc.startPage(PdfDocument.PageInfo.Builder(pageW, pageH, 1).create())
        val c = page.canvas
        c.drawColor(Color.WHITE)
        var y = 60f
        fun line(text: String, size: Float = 11f, bold: Boolean = false, gap: Float = 18f) {
            val paint = Paint().apply { color = Color.BLACK; textSize = size * MM_TO_PT / 3; isFakeBoldText = bold }
            c.drawText(text, 50f, y, paint); y += gap
        }
        line("POUFA — Bilan de bande", 16f, true, 30f)
        line("Ferme : $farmName"); line("Bande : $bandCode")
        line("Mise en place : $placementDate · Clôture : $closureDate · $durationDays jours")
        line("Poussins : $initialChicks · Morts : $deaths (${"%.1f".format(mortalityPct)} %) · Sorties : $exits · Restants : $remaining")
        line("Aliment : ${"%.0f".format(totalFeedKg)} kg" + (avgWeightKg?.let { " · Poids moyen : ${"%.2f".format(it)} kg" } ?: ""))
        if (lots.isNotEmpty()) line("Lots : ${lots.joinToString(", ")}")
        if (pendingSync) line("ATTENTION : certaines données sont en attente de synchronisation.", 10f, false, 16f)
        line("Généré le ${java.text.SimpleDateFormat("dd/MM/yyyy HH:mm", java.util.Locale.FRANCE).format(java.util.Date())} — Document local, non certifié.", 9f, false, 14f)
        doc.finishPage(page); doc.close()
        val file = File(context.cacheDir, "bilan_${bandCode}.pdf")
        FileOutputStream(file).use { doc.writeTo(it) }
        return file
    }
}

/** Persistance durable des photos sanitaires — copie privée + checksum. */
object PhotoStore {
    /** Copie le contenu d'une Uri dans filesDir/photos/<uuid>.<ext>. Retourne (path, size). */
    fun persist(context: Context, uri: android.net.Uri, attachmentId: String): Pair<String, Long>? =
        runCatching {
            val dir = File(context.filesDir, "photos").apply { mkdirs() }
            val ext = context.contentResolver.getType(uri)?.substringAfter("/") ?: "jpg"
            val dest = File(dir, "$attachmentId.$ext")
            context.contentResolver.openInputStream(uri)?.use { input ->
                dest.outputStream().use { input.copyTo(it) }
            } ?: return null
            dest.absolutePath to dest.length()
        }.getOrNull()

    fun exists(path: String) = File(path).exists()
}
