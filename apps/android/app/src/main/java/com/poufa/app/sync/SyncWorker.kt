package com.poufa.app.sync

import android.content.Context
import androidx.work.*
import com.poufa.app.di.ServiceLocator
import com.poufa.app.data.local.PendingOperationEntity
import kotlinx.coroutines.flow.first
import java.util.concurrent.TimeUnit

/**
 * WorkManager — pousse les opérations outbox vers FastAPI.
 * Règles :
 *  - Une op n'est supprimée QUE sur accusé 'accepted' explicite.
 *  - 'duplicate' = déjà traitée côté serveur → on purge aussi (idempotent).
 *  - Erreur réseau → retry exponentiel WorkManager, ops conservées.
 *  - Wi-Fi only : contrainte UNMETERED (réseau non mesuré ≈ Wi-Fi).
 */
class SyncWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {

    override suspend fun doWork(): Result {
        val db = ServiceLocator.database
        val api = ServiceLocator.api
        val ops = db.pendingOperationDao().observePending("*").first()
            .ifEmpty { db.pendingOperationDao().pendingAll() }
        if (ops.isEmpty()) return Result.success()

        return try {
            val payload = org.json.JSONArray()
            ops.forEach { op ->
                payload.put(org.json.JSONObject()
                    .put("op_id", op.opId).put("op_type", op.opType)
                    .put("entity_type", op.entityType).put("entity_id", op.entityId)
                    .put("payload", org.json.JSONObject(op.payloadJson))
                    .put("client_ts", op.clientTs).put("schema_version", op.schemaVersion))
            }
            val body = """{"operations":$payload}"""
            val resp = api.syncPush(body)
            // Parsing minimal des accusés : on marque accepted/duplicate pour suppression.
            val results = parseResults(resp)
            ops.forEach { op ->
                val ack = results[op.opId]
                if (ack == "accepted" || ack == "duplicate") {
                    db.pendingOperationDao().delete(op.opId)
                } else {
                    db.pendingOperationDao().markAttempt(op.opId, "failed", ack)
                }
            }
            Result.success()
        } catch (e: Exception) {
            if (runAttemptCount < 5) Result.retry() else Result.failure()
        }
    }

    private fun parseResults(resp: String): Map<String, String> {
        // Contrat : {"results":[{"op_id":"…","status":"accepted|duplicate|rejected"}]}
        return runCatching {
            val jo = org.json.JSONObject(resp)
            val arr = jo.optJSONArray("results") ?: return emptyMap()
            (0 until arr.length()).associate { i ->
                val r = arr.getJSONObject(i)
                r.getString("op_id") to r.getString("status")
            }
        }.getOrDefault(emptyMap())
    }

    companion object {
        private const val WORK_NAME = "poufa_sync"

        fun schedule(context: Context, wifiOnly: Boolean = false) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(
                    if (wifiOnly) NetworkType.UNMETERED else NetworkType.CONNECTED,
                )
                .build()
            val request = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()
            WorkManager.getInstance(context)
                .enqueueUniqueWork(WORK_NAME, ExistingWorkPolicy.KEEP, request)
        }
    }
}
