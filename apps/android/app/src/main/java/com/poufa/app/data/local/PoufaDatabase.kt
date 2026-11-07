package com.poufa.app.data.local

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.RoomDatabase
import androidx.room.Transaction
import androidx.room.Upsert
import kotlinx.coroutines.flow.Flow

// ── DAOs ────────────────────────────────────────────────────────────────

@Dao
interface UserProfileDao {
    @Query("SELECT * FROM local_user_profile WHERE id = :userId")
    fun observeProfile(userId: String): Flow<LocalUserProfileEntity?>

    @Query("SELECT * FROM local_user_profile WHERE id = :userId")
    suspend fun getProfile(userId: String): LocalUserProfileEntity?

    @Upsert
    suspend fun upsert(profile: LocalUserProfileEntity)
}

@Dao
interface FarmDao {
    @Query("SELECT * FROM farm ORDER BY name")
    fun observeAll(): Flow<List<FarmEntity>>

    @Query("SELECT * FROM farm WHERE id = :farmId")
    fun observeById(farmId: String): Flow<FarmEntity?>

    @Query("SELECT * FROM farm WHERE id = :farmId")
    suspend fun getById(farmId: String): FarmEntity?

    @Upsert
    suspend fun upsertAll(farms: List<FarmEntity>)

    @Upsert
    suspend fun upsert(farm: FarmEntity)

    @Query("UPDATE farm SET status = :status WHERE id = :farmId")
    suspend fun updateStatus(farmId: String, status: String)
}

@Dao
interface FarmAssignmentDao {
    @Query("SELECT * FROM farm_assignment WHERE userId = :userId AND status = 'active'")
    fun observeForUser(userId: String): Flow<List<FarmAssignmentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(assignments: List<FarmAssignmentEntity>)

    @Query("DELETE FROM farm_assignment WHERE userId = :userId")
    suspend fun clearForUser(userId: String)
}

@Dao
interface BuildingDao {
    @Query("SELECT * FROM building WHERE farmId = :farmId")
    fun observeForFarm(farmId: String): Flow<List<BuildingEntity>>

    @Upsert
    suspend fun upsertAll(buildings: List<BuildingEntity>)
}

@Dao
interface BandDao {
    @Query("SELECT * FROM band WHERE farmId = :farmId AND status = 'active' ORDER BY placementDate DESC LIMIT 1")
    fun observeActiveForFarm(farmId: String): Flow<BandEntity?>

    @Query("SELECT * FROM band WHERE id = :bandId")
    fun observeById(bandId: String): Flow<BandEntity?>

    @Query("SELECT * FROM band WHERE farmId = :farmId ORDER BY placementDate DESC")
    fun observeForFarm(farmId: String): Flow<List<BandEntity>>

    @Upsert
    suspend fun upsertAll(bands: List<BandEntity>)
}

@Dao
interface DailyRecordDao {
    @Query("SELECT * FROM daily_record WHERE bandId = :bandId ORDER BY recordDate DESC")
    fun observeForBand(bandId: String): Flow<List<DailyRecordEntity>>

    @Query("SELECT * FROM daily_record WHERE bandId = :bandId AND recordDate = :date LIMIT 1")
    suspend fun getForDate(bandId: String, date: Long): DailyRecordEntity?

    @Query("SELECT * FROM daily_record WHERE id = :id")
    fun observeById(id: String): Flow<DailyRecordEntity?>

    @Upsert
    suspend fun upsert(record: DailyRecordEntity)
}

@Dao
interface PendingOperationDao {
    @Query("SELECT * FROM pending_operation WHERE userId = :userId AND status IN ('pending','failed') ORDER BY createdAt")
    fun observePending(userId: String): Flow<List<PendingOperationEntity>>

    @Query("SELECT COUNT(*) FROM pending_operation WHERE status IN ('pending','failed')")
    fun observePendingCount(): Flow<Int>

    @Query("SELECT * FROM pending_operation WHERE status IN ('pending','failed') ORDER BY createdAt")
    suspend fun pendingAll(): List<PendingOperationEntity>

    @Query("SELECT * FROM pending_operation WHERE status IN ('pending','failed') ORDER BY createdAt")
    fun observeAllPending(): Flow<List<PendingOperationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(op: PendingOperationEntity)

    @Query("UPDATE pending_operation SET status = :status, attempts = attempts + 1, lastError = :error WHERE opId = :opId")
    suspend fun markAttempt(opId: String, status: String, error: String?)

    @Query("DELETE FROM pending_operation WHERE opId = :opId")
    suspend fun delete(opId: String)

    @Query("DELETE FROM pending_operation")
    suspend fun clearAll()
}

@Dao
interface SyncCursorDao {
    @Query("SELECT * FROM sync_cursor WHERE userId = :userId")
    fun observe(userId: String): Flow<SyncCursorEntity?>

    @Query("SELECT * FROM sync_cursor WHERE userId = :userId")
    suspend fun get(userId: String): SyncCursorEntity?

    @Upsert
    suspend fun upsert(cursor: SyncCursorEntity)
}

@Dao
interface InventoryDao {
    @Query("SELECT * FROM inventory_product WHERE farmId = :farmId")
    fun observeProducts(farmId: String): Flow<List<InventoryProductEntity>>

    @Query("SELECT * FROM inventory_movement WHERE farmId = :farmId ORDER BY movementDate DESC")
    fun observeMovements(farmId: String): Flow<List<InventoryMovementEntity>>

    @Upsert
    suspend fun upsertProducts(products: List<InventoryProductEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMovement(movement: InventoryMovementEntity)
}

@Dao
interface HealthDeclarationDao {
    @Query("SELECT * FROM health_declaration WHERE bandId = :bandId ORDER BY eventDate DESC")
    fun observeForBand(bandId: String): Flow<List<HealthDeclarationEntity>>

    @Query("SELECT * FROM health_declaration WHERE farmId = :farmId ORDER BY eventDate DESC")
    fun observeForFarm(farmId: String): Flow<List<HealthDeclarationEntity>>

    @Query("SELECT * FROM health_declaration WHERE id = :id")
    fun observeById(id: String): Flow<HealthDeclarationEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(declaration: HealthDeclarationEntity)
}

@Dao
interface LotDao {
    @Query("SELECT * FROM lot WHERE farmId = :farmId ORDER BY transferDate DESC")
    fun observeForFarm(farmId: String): Flow<List<LotEntity>>

    @Query("SELECT * FROM lot WHERE id = :lotId")
    fun observeById(lotId: String): Flow<LotEntity?>

    @Query("SELECT * FROM lot WHERE displayCode = :code OR provisionalCode = :code LIMIT 1")
    suspend fun findByCode(code: String): LotEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(lot: LotEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvents(events: List<LotEventEntity>)
}

@Dao
interface WeighingDao {
    @Query("SELECT * FROM weighing WHERE bandId = :bandId ORDER BY weighingDate DESC")
    fun observeForBand(bandId: String): Flow<List<WeighingEntity>>

    @Query("SELECT * FROM weighing WHERE bandId = :bandId ORDER BY weighingDate DESC LIMIT 1")
    fun observeLatest(bandId: String): Flow<WeighingEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(w: WeighingEntity)
}

@Dao
interface FlockExitDao {
    @Query("SELECT * FROM flock_exit WHERE bandId = :bandId ORDER BY exitDate DESC")
    fun observeForBand(bandId: String): Flow<List<FlockExitEntity>>

    @Query("SELECT COALESCE(SUM(quantity),0) FROM flock_exit WHERE bandId = :bandId AND status != 'cancelled'")
    suspend fun totalQuantity(bandId: String): Int

    @Query("SELECT * FROM flock_exit WHERE farmId = :farmId ORDER BY exitDate DESC")
    fun observeForFarm(farmId: String): Flow<List<FlockExitEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(exit: FlockExitEntity)
}

@Dao
interface TreatmentDao {
    @Query("SELECT * FROM treatment_event WHERE bandId = :bandId ORDER BY eventDate DESC")
    fun observeForBand(bandId: String): Flow<List<TreatmentEventEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(t: TreatmentEventEntity)
}

@Dao
interface ReceiptDao {
    @Query("SELECT * FROM inventory_receipt WHERE farmId = :farmId ORDER BY receiptDate DESC")
    fun observeForFarm(farmId: String): Flow<List<InventoryReceiptEntity>>

    @Query("SELECT * FROM inventory_receipt WHERE farmId = :farmId AND status = :status ORDER BY receiptDate DESC")
    fun observeByStatus(farmId: String, status: String): Flow<List<InventoryReceiptEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(r: InventoryReceiptEntity)

    @Query("UPDATE inventory_receipt SET status = 'confirmed', movementId = :movementId WHERE id = :id")
    suspend fun confirm(id: String, movementId: String?)
}

@Dao
interface HealthAttachmentDao {
    @Query("SELECT * FROM health_attachment WHERE declarationId = :declarationId")
    fun observeForDeclaration(declarationId: String): Flow<List<HealthAttachmentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(attachments: List<HealthAttachmentEntity>)
}

@Dao
interface ContactDao {
    @Query("SELECT * FROM contact WHERE farmId = :farmId ORDER BY category")
    fun observeForFarm(farmId: String): Flow<List<ContactEntity>>
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(items: List<ContactEntity>)
}

@Dao
interface FarmMemberDao {
    @Query("SELECT * FROM farm_member WHERE farmId = :farmId AND status != 'revoked' ORDER BY createdAt")
    fun observeForFarm(farmId: String): Flow<List<FarmMemberEntity>>
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(items: List<FarmMemberEntity>)
}

@Dao
interface AppNotificationDao {
    @Query("SELECT * FROM app_notification WHERE userId = :userId ORDER BY createdAt DESC")
    fun observeForUser(userId: String): Flow<List<AppNotificationEntity>>

    @Query("SELECT COUNT(*) FROM app_notification WHERE userId = :userId AND isRead = 0")
    fun observeUnreadCount(userId: String): Flow<Int>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(n: AppNotificationEntity)

    @Query("UPDATE app_notification SET isRead = 1 WHERE id = :id")
    suspend fun markRead(id: String)
}

// ── Database ────────────────────────────────────────────────────────────

@Database(
    entities = [
        LocalUserProfileEntity::class,
        FarmEntity::class,
        FarmAssignmentEntity::class,
        BuildingEntity::class,
        BandEntity::class,
        DailyRecordEntity::class,
        InventoryProductEntity::class,
        InventoryMovementEntity::class,
        HealthDeclarationEntity::class,
        LotEntity::class,
        LotEventEntity::class,
        WeighingEntity::class,
        FlockExitEntity::class,
        TreatmentEventEntity::class,
        InventoryReceiptEntity::class,
        HealthAttachmentEntity::class,
        ContactEntity::class,
        FarmMemberEntity::class,
        AppNotificationEntity::class,
        PendingOperationEntity::class,
        SyncCursorEntity::class,
        SyncConflictEntity::class,
    ],
    version = 1,
    exportSchema = true,
)
abstract class PoufaDatabase : RoomDatabase() {
    abstract fun userProfileDao(): UserProfileDao
    abstract fun farmDao(): FarmDao
    abstract fun farmAssignmentDao(): FarmAssignmentDao
    abstract fun buildingDao(): BuildingDao
    abstract fun bandDao(): BandDao
    abstract fun dailyRecordDao(): DailyRecordDao
    abstract fun inventoryDao(): InventoryDao
    abstract fun healthDeclarationDao(): HealthDeclarationDao
    abstract fun lotDao(): LotDao
    abstract fun weighingDao(): WeighingDao
    abstract fun flockExitDao(): FlockExitDao
    abstract fun treatmentDao(): TreatmentDao
    abstract fun receiptDao(): ReceiptDao
    abstract fun healthAttachmentDao(): HealthAttachmentDao
    abstract fun contactDao(): ContactDao
    abstract fun farmMemberDao(): FarmMemberDao
    abstract fun appNotificationDao(): AppNotificationDao
    abstract fun pendingOperationDao(): PendingOperationDao
    abstract fun syncCursorDao(): SyncCursorDao
}
