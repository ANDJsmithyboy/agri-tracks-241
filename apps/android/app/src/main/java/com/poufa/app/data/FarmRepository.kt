package com.poufa.app.data

import com.poufa.app.data.local.*
import com.poufa.app.data.remote.FarmCreateRequest
import com.poufa.app.data.remote.FarmDto
import com.poufa.app.data.remote.PoufaApiClient
import kotlinx.coroutines.flow.Flow
import java.util.UUID

/** Pont API FastAPI ↔ Room — Room = source de vérité locale. */
class FarmRepository(
    private val api: PoufaApiClient,
    private val db: PoufaDatabase,
    private val settings: SettingsRepository,
) {
    fun observeFarms(): Flow<List<FarmEntity>> = db.farmDao().observeAll()
    fun observeFarm(farmId: String) = db.farmDao().observeById(farmId)
    fun observeSelectedFarmId(userId: String) = settings.selectedFarmId(userId)

    /** Télécharge les fermes autorisées (FastAPI) et les persiste dans Room. */
    suspend fun refreshFarms(userId: String) {
        val res = api.listFarms()
        val now = System.currentTimeMillis()
        db.farmDao().upsertAll(res.farms.map { it.toEntity(userId, now) })
        db.farmAssignmentDao().upsertAll(
            res.farms.map {
                FarmAssignmentEntity(
                    id = "${it.id}:$userId", userId = userId, farmId = it.id,
                    role = it.membershipRole,
                )
            },
        )
        db.syncCursorDao().upsert(SyncCursorEntity(userId = userId, lastPullAt = now))
    }

    suspend fun createFarm(
        userId: String,
        name: String, province: String, locality: String,
        farmingType: String, buildingCount: Int?,
    ): FarmEntity {
        val dto = api.createFarm(
            FarmCreateRequest(
                name = name, province = province, locality = locality,
                farmingType = farmingType, buildingCountDeclared = buildingCount,
                clientId = UUID.randomUUID().toString(), // idempotence
            ),
        )
        val entity = dto.toEntity(userId, System.currentTimeMillis())
        db.farmDao().upsert(entity)
        db.farmAssignmentDao().upsertAll(
            listOf(FarmAssignmentEntity("${dto.id}:$userId", userId, dto.id, dto.membershipRole)),
        )
        return entity
    }

    suspend fun selectFarm(userId: String, farmId: String) = settings.setSelectedFarm(userId, farmId)

    private fun FarmDto.toEntity(userId: String, now: Long) = FarmEntity(
        id = id, displayCode = null, ownerId = userId, name = name,
        province = province, locality = locality, farmingType = farmingType,
        buildingCount = null, status = "active", createdAt = now, syncedAt = now,
    )
}
