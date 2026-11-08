package com.poufa.app.data

import com.poufa.app.data.local.*
import com.poufa.app.data.remote.FarmCreateRequest
import com.poufa.app.data.remote.FarmDto
import com.poufa.app.data.remote.PoufaApiClient
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
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
        val clientId = UUID.randomUUID().toString()
        val now = System.currentTimeMillis()
        return runCatching {
            val dto = api.createFarm(
                FarmCreateRequest(
                    name = name, province = province, locality = locality,
                    farmingType = farmingType, buildingCountDeclared = buildingCount,
                    clientId = clientId, // idempotence
                ),
            )
            val entity = dto.toEntity(userId, now)
            db.farmDao().upsert(entity)
            db.farmAssignmentDao().upsertAll(
                listOf(FarmAssignmentEntity("${dto.id}:$userId", userId, dto.id, dto.membershipRole)),
            )
            entity
        }.getOrElse {
            val localFarm = FarmEntity(
                id = clientId,
                displayCode = null,
                ownerId = userId,
                name = name,
                province = province,
                locality = locality,
                farmingType = farmingType,
                buildingCount = buildingCount,
                status = "active",
                createdAt = now,
                syncedAt = null,
            )
            db.farmDao().upsert(localFarm)
            db.farmAssignmentDao().upsertAll(
                listOf(FarmAssignmentEntity("$clientId:$userId", userId, clientId, "owner")),
            )
            db.pendingOperationDao().insert(
                PendingOperationEntity(
                    opId = UUID.randomUUID().toString(),
                    userId = userId,
                    opType = "create",
                    entityType = "farm",
                    entityId = clientId,
                    payloadJson = org.json.JSONObject()
                        .put("name", name)
                        .put("province", province)
                        .put("locality", locality)
                        .put("farming_type", farmingType)
                        .put("building_count_declared", buildingCount)
                        .put("client_id", clientId)
                        .toString(),
                    clientTs = now,
                    createdAt = now,
                )
            )
            localFarm
        }
    }

    suspend fun editFarm(farmId: String, name: String, locality: String, farmingType: String, userId: String): FarmEntity? {
        val existing = db.farmDao().observeById(farmId).first() ?: return null
        val updated = existing.copy(name = name, locality = locality, farmingType = farmingType)
        db.farmDao().upsert(updated)
        db.pendingOperationDao().insert(
            PendingOperationEntity(
                opId = UUID.randomUUID().toString(),
                userId = userId,
                opType = "update",
                entityType = "farm",
                entityId = farmId,
                payloadJson = org.json.JSONObject().put("name", name).put("locality", locality).put("farming_type", farmingType).toString(),
                clientTs = System.currentTimeMillis(),
                createdAt = System.currentTimeMillis(),
            )
        )
        return updated
    }

    suspend fun createBuilding(farmId: String, name: String, capacity: Int, userId: String): BuildingEntity {
        val building = BuildingEntity(
            id = UUID.randomUUID().toString(),
            farmId = farmId,
            name = name,
            capacity = capacity,
            status = "available",
            createdAt = System.currentTimeMillis(),
        )
        db.buildingDao().upsertAll(listOf(building))
        db.pendingOperationDao().insert(
            PendingOperationEntity(
                opId = UUID.randomUUID().toString(),
                userId = userId,
                opType = "create",
                entityType = "building",
                entityId = building.id,
                payloadJson = org.json.JSONObject().put("farm_id", farmId).put("name", name).put("capacity", capacity).toString(),
                clientTs = System.currentTimeMillis(),
                createdAt = System.currentTimeMillis(),
            )
        )
        return building
    }

    suspend fun inviteMember(farmId: String, email: String, role: String, userId: String): FarmMemberEntity {
        val member = FarmMemberEntity(
            id = UUID.randomUUID().toString(),
            farmId = farmId,
            userId = email,
            displayName = email.substringBefore("@"),
            role = role,
            permissions = "read_write",
            status = "pending",
            createdAt = System.currentTimeMillis(),
        )
        db.farmMemberDao().upsertAll(listOf(member))
        db.pendingOperationDao().insert(
            PendingOperationEntity(
                opId = UUID.randomUUID().toString(),
                userId = userId,
                opType = "create",
                entityType = "invitation",
                entityId = member.id,
                payloadJson = org.json.JSONObject().put("farm_id", farmId).put("email", email).put("role", role).toString(),
                clientTs = System.currentTimeMillis(),
                createdAt = System.currentTimeMillis(),
            )
        )
        return member
    }

    suspend fun selectFarm(userId: String, farmId: String) = settings.setSelectedFarm(userId, farmId)

    private fun FarmDto.toEntity(userId: String, now: Long) = FarmEntity(
        id = id, displayCode = null, ownerId = userId, name = name,
        province = province, locality = locality, farmingType = farmingType,
        buildingCount = null, status = "active", createdAt = now, syncedAt = now,
    )
}
