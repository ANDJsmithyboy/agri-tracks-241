package com.poufa.app.data

import com.poufa.app.data.local.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import org.json.JSONObject
import java.util.UUID

/**
 * Saisie quotidienne + effectif — la règle métier centrale POUFA.
 * present = poussins mis en place − mortalités cumulées − sorties cumulées.
 * (Les sorties/cessions affineront le calcul quand le module lots arrivera ;
 * en attendant on retranche les quantités de lots confirmés si disponibles.)
 */
class DailyRepository(
    private val db: PoufaDatabase,
) {
    fun observeHistory(bandId: String): Flow<List<DailyRecordEntity>> =
        db.dailyRecordDao().observeForBand(bandId)

    fun observeRecord(bandId: String, date: Long): Flow<DailyRecordEntity?> =
        db.dailyRecordDao().observeForBand(bandId).map { list ->
            list.firstOrNull { it.recordDate == date }
        }

    /** Effectif courant dérivé de Room — réactif, jamais de constante. */
    fun observePopulation(bandId: String): Flow<Int?> =
        db.bandDao().observeById(bandId).map { band ->
            band?.let { computePopulation(it, db.dailyRecordDao()) }
        }

    private suspend fun computePopulation(band: BandEntity, dao: DailyRecordDao): Int {
        val deaths = dao.observeForBand(band.id).first().sumOf { it.mortality ?: 0 }
        val exits = db.flockExitDao().totalQuantity(band.id)
        // present = placés − morts − sorties (spec : jamais de double décompte)
        return band.initialChicks - deaths - exits
    }

    suspend fun populationNow(band: BandEntity): Int = computePopulation(band, db.dailyRecordDao())

    /**
     * Enregistre (ou corrige) une journée : UNE transaction Room —
     * daily_record + outbox pending_operation. Jamais de doublon band+date.
     */
    @androidx.room.Transaction
    suspend fun saveDailyRecord(
        farmId: String,
        bandId: String,
        recordDate: Long,
        deaths: Int,
        feedKg: Double?,
        observations: String?,
        authorId: String?,
    ): DailyRecordEntity {
        val dao = db.dailyRecordDao()
        val existing = dao.getForDate(bandId, recordDate)
        val record = DailyRecordEntity(
            id = existing?.id ?: UUID.randomUUID().toString(),
            farmId = farmId,
            bandId = bandId,
            recordDate = recordDate,
            mortality = deaths,
            feedKg = feedKg,
            notes = observations,
            authorId = authorId,
            status = "pending",
            createdAt = existing?.createdAt ?: System.currentTimeMillis(),
        )
        dao.upsert(record)

        val op = PendingOperationEntity(
            opId = UUID.randomUUID().toString(),
            userId = authorId ?: "",
            opType = if (existing == null) "create" else "update",
            entityType = "daily_record",
            entityId = record.id,
            payloadJson = JSONObject()
                .put("band_id", bandId).put("record_date", recordDate)
                .put("deaths", deaths).put("feed_kg", feedKg)
                .put("observations", observations).toString(),
            clientTs = System.currentTimeMillis(),
            createdAt = System.currentTimeMillis(),
        )
        db.pendingOperationDao().insert(op)
        return record
    }
}
