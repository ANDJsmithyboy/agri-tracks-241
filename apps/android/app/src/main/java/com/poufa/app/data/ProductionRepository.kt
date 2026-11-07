package com.poufa.app.data

import com.poufa.app.data.local.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import org.json.JSONObject
import java.util.UUID

/** Calculs zootechniques — fonctions pures testables (spec §2 écran 21). */
object IndicatorsCalculator {
    /** mortalité % = morts cumulés / poussins placés × 100 */
    fun mortalityPct(initialChicks: Int, cumulativeDeaths: Int): Double =
        if (initialChicks <= 0) 0.0 else cumulativeDeaths * 100.0 / initialChicks

    fun viabilityPct(initialChicks: Int, cumulativeDeaths: Int): Double =
        100.0 - mortalityPct(initialChicks, cumulativeDeaths)

    /** poids moyen = poids total / nb pesés (dénominateur ≠ 0) */
    fun averageWeightKg(totalWeightKg: Double, sampleCount: Int): Double? =
        if (sampleCount <= 0 || totalWeightKg <= 0) null else totalWeightKg / sampleCount

    /**
     * Consommation par animal (g/jour) — politique de dénominateur documentée :
     * aliment du jour × poussins placés / effectif présent (référence : 85×1000/948≈90g).
     */
    fun feedPerAnimalGrams(feedKg: Double, initialChicks: Int, population: Int): Double? =
        if (population <= 0) null else feedKg * initialChicks * 1000.0 / population

    /** IPC = aliment total / biomasse produite (null si pesée manquante) */
    fun feedConversionRatio(totalFeedKg: Double, avgExitWeightKg: Double?, exitCount: Int): Double? =
        if (avgExitWeightKg == null || avgExitWeightKg <= 0 || exitCount <= 0) null
        else totalFeedKg / (avgExitWeightKg * exitCount)
}

/**
 * Transactions métier batch 03 — chaque mutation = 1 commit Room
 * (enregistrement + mouvement/lot + outbox). Jamais de double décompte.
 */
class ProductionRepository(private val db: PoufaDatabase) {

    // ── Pesées (écrans 21–23) ────────────────────────────────────────────
    fun observeWeighings(bandId: String) = db.weighingDao().observeForBand(bandId)
    fun observeLatestWeighing(bandId: String) = db.weighingDao().observeLatest(bandId)

    @androidx.room.Transaction
    suspend fun saveWeighing(
        farmId: String, bandId: String, date: Long,
        sampleCount: Int, totalWeightKg: Double, authorId: String?,
    ): WeighingEntity {
        val avg = IndicatorsCalculator.averageWeightKg(totalWeightKg, sampleCount)
        val w = WeighingEntity(
            id = UUID.randomUUID().toString(), farmId = farmId, bandId = bandId,
            weighingDate = date, sampleCount = sampleCount, totalWeightKg = totalWeightKg,
            averageWeightKg = avg, recordedBy = authorId,
            createdAt = System.currentTimeMillis(), updatedAt = System.currentTimeMillis(),
        )
        db.weighingDao().upsert(w)
        db.pendingOperationDao().insert(outbox("weighing", w.id, authorId) {
            put("band_id", bandId).put("date", date).put("sample_count", sampleCount)
                .put("total_weight_kg", totalWeightKg)
        })
        return w
    }

    // ── Sorties (écrans 24–25) ───────────────────────────────────────────
    fun observeExits(bandId: String) = db.flockExitDao().observeForBand(bandId)
    suspend fun totalExits(bandId: String) = db.flockExitDao().totalQuantity(bandId)

    /**
     * Cession : exit + brouillon de lot + outbox — UN SEUL commit.
     * Le lot porte un code provisoire (UUID) ; le code officiel LP-…
     * n'est alloué que par le serveur (jamais de séquence locale).
     */
    @androidx.room.Transaction
    suspend fun registerExit(
        farmId: String, bandId: String, exitType: String, quantity: Int,
        recipient: String?, date: Long, authorId: String?,
    ): FlockExitEntity {
        val exit = FlockExitEntity(
            id = UUID.randomUUID().toString(), farmId = farmId, bandId = bandId,
            exitType = exitType, quantity = quantity, recipient = recipient,
            exitDate = date,
            provisionalLotCode = if (exitType == "cession") "LOT-${UUID.randomUUID().toString().take(8).uppercase()}" else null,
            lotId = if (exitType == "cession") UUID.randomUUID().toString() else null,
            createdAt = System.currentTimeMillis(),
        )
        db.flockExitDao().insert(exit)
        db.pendingOperationDao().insert(outbox("flock_exit", exit.id, authorId) {
            put("band_id", bandId).put("type", exitType).put("quantity", quantity)
                .put("recipient", recipient).put("date", date).put("lot_id", exit.lotId)
        })
        return exit
    }

    // ── Traitements (écrans 26–27) ───────────────────────────────────────
    fun observeTreatments(bandId: String) = db.treatmentDao().observeForBand(bandId)

    @androidx.room.Transaction
    suspend fun recordTreatment(
        farmId: String, bandId: String, type: String, productName: String,
        batch: String?, method: String?, animalsTreated: Int?, date: Long, authorId: String?,
    ): TreatmentEventEntity {
        val t = TreatmentEventEntity(
            id = UUID.randomUUID().toString(), farmId = farmId, bandId = bandId,
            treatmentType = type, productName = productName, batchNumber = batch,
            method = method, animalsTreated = animalsTreated, eventDate = date,
            createdBy = authorId, createdAt = System.currentTimeMillis(),
        )
        db.treatmentDao().insert(t)
        db.pendingOperationDao().insert(outbox("treatment", t.id, authorId) {
            put("band_id", bandId).put("type", type).put("product", productName)
                .put("method", method).put("animals", animalsTreated).put("date", date)
        })
        return t
    }

    // ── Réceptions intrants (écran 30) ───────────────────────────────────
    fun observeReceipts(farmId: String) = db.receiptDao().observeForFarm(farmId)
    fun observePendingReceipts(farmId: String) = db.receiptDao().observeByStatus(farmId, "pending")
    fun observeConfirmedReceipts(farmId: String) = db.receiptDao().observeByStatus(farmId, "confirmed")

    @androidx.room.Transaction
    suspend fun confirmReceipt(
        receiptId: String, farmId: String, movementQty: Double, unit: String,
        productId: String?, authorId: String?,
    ) {
        val movementId = UUID.randomUUID().toString()
        db.inventoryDao().insertMovement(
            InventoryMovementEntity(
                id = movementId, productId = productId ?: receiptId, farmId = farmId,
                bandId = null, quantity = movementQty, unit = unit,
                movementType = "receipt", sourceRecordId = receiptId,
                movementDate = System.currentTimeMillis(), createdAt = System.currentTimeMillis(),
            ),
        )
        db.receiptDao().confirm(receiptId, movementId)
        db.pendingOperationDao().insert(outbox("receipt_confirm", receiptId, authorId) {
            put("movement_id", movementId).put("quantity", movementQty).put("unit", unit)
        })
    }

    /** Utilisation manuelle d'intrant (écran 32) — mouvement 'usage' + outbox. */
    @androidx.room.Transaction
    suspend fun recordUsage(
        farmId: String, productId: String, bandId: String?, quantity: Double,
        unit: String, date: Long, authorId: String?,
    ): InventoryMovementEntity {
        val m = InventoryMovementEntity(
            id = UUID.randomUUID().toString(), productId = productId, farmId = farmId,
            bandId = bandId, quantity = -kotlin.math.abs(quantity), unit = unit,
            movementType = "usage", sourceRecordId = null, movementDate = date,
            createdAt = System.currentTimeMillis(),
        )
        db.inventoryDao().insertMovement(m)
        db.pendingOperationDao().insert(outbox("inventory_usage", m.id, authorId) {
            put("product_id", productId).put("quantity", quantity).put("unit", unit).put("date", date)
        })
        return m
    }

    /** Nouvelle réception (écran 34) — statut 'pending', hors stock confirmé. */
    @androidx.room.Transaction
    suspend fun createReceipt(
        farmId: String, productName: String, quantity: Double, unit: String,
        supplier: String?, date: Long, authorId: String?,
    ): InventoryReceiptEntity {
        val r = InventoryReceiptEntity(
            id = UUID.randomUUID().toString(), farmId = farmId, productName = productName,
            quantity = quantity, unit = unit, receiptDate = date,
            deliveryRef = supplier, status = "pending",
            createdAt = System.currentTimeMillis(),
        )
        db.receiptDao().insert(r)
        db.pendingOperationDao().insert(outbox("receipt_create", r.id, authorId) {
            put("product", productName).put("quantity", quantity).put("unit", unit).put("date", date)
        })
        return r
    }

    /** Signalement sanitaire (écrans 36–40) — Room + outbox, statut 'local'. */
    @androidx.room.Transaction
    suspend fun saveHealthDeclaration(
        farmId: String, bandId: String, problemType: String, signs: List<String>,
        affectedCount: Int?, notes: String?, photoCount: Int, authorId: String?,
    ): HealthDeclarationEntity {
        val d = HealthDeclarationEntity(
            id = UUID.randomUUID().toString(), bandId = bandId, farmId = farmId,
            eventDate = System.currentTimeMillis(), problemType = problemType,
            signs = signs.joinToString(","), affectedCount = affectedCount,
            notes = notes, status = "local", createdAt = System.currentTimeMillis(),
        )
        db.healthDeclarationDao().insert(d)
        db.pendingOperationDao().insert(outbox("health_declaration", d.id, authorId) {
            put("band_id", bandId).put("type", problemType)
                .put("signs", signs.joinToString(",")).put("count", affectedCount)
                .put("photos", photoCount)
        })
        return d
    }

    /** Création de bande (wizard écrans 15–17) — bande + occupation bâtiment + outbox, 1 commit. */
    @androidx.room.Transaction
    suspend fun createBand(
        farmId: String, buildingId: String?, chicks: Int, strainLabel: String?,
        ageDays: Int?, origin: String?, hatcheryLot: String?, feedProductId: String?,
        authorId: String?,
    ): BandEntity {
        val band = BandEntity(
            id = UUID.randomUUID().toString(), farmId = farmId, buildingId = buildingId,
            status = "active", placementDate = System.currentTimeMillis(),
            initialChicks = chicks, strainId = null, strainLabel = strainLabel,
            ageAtReceiptDays = ageDays, origin = origin, hatcheryLot = hatcheryLot,
            initialFeedProductId = feedProductId,
            strain = strainLabel, ageAtReceptionDays = ageDays,
            createdAt = System.currentTimeMillis(),
        )
        db.bandDao().upsertAll(listOf(band))
        buildingId?.let { bid ->
            // Préserve nom/capacité — REPLACE écraserait sinon les champs métier.
            val existing = db.buildingDao().observeForFarm(farmId).first().firstOrNull { it.id == bid }
            if (existing != null) {
                db.buildingDao().upsertAll(listOf(existing.copy(status = "occupied", flockId = band.id)))
            }
        }
        db.pendingOperationDao().insert(outbox("band", band.id, authorId) {
            put("farm_id", farmId).put("building_id", buildingId)
                .put("chicks", chicks).put("strain", strainLabel).put("date", band.placementDate)
        })
        return band
    }

    private fun outbox(
        entityType: String, entityId: String, userId: String?,
        payload: JSONObject.() -> JSONObject,
    ) = PendingOperationEntity(
        opId = UUID.randomUUID().toString(),
        userId = userId ?: "",
        opType = "create",
        entityType = entityType,
        entityId = entityId,
        payloadJson = JSONObject().apply(payload).toString(),
        clientTs = System.currentTimeMillis(),
        createdAt = System.currentTimeMillis(),
    )
}
