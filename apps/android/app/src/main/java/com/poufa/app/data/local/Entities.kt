package com.poufa.app.data.local

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Entités Room — Batch 01 (écrans 01–10).
 * Chaque entité syncable : UUID stable + scope ferme + révisions + état de sync.
 * Les enums métier sont stockés en TEXT pour rester évolutifs côté schéma.
 */

@Entity(tableName = "local_user_profile")
data class LocalUserProfileEntity(
    @PrimaryKey val id: String,               // Clerk user id (sub)
    val displayName: String?,
    val phone: String?,
    val poufaRole: String?,
    val selectedFarmId: String?,
    val updatedAt: Long,
)

@Entity(tableName = "farm", indices = [Index("ownerId")])
data class FarmEntity(
    @PrimaryKey val id: String,               // UUID interne
    val displayCode: String?,                 // identifiant officiel serveur
    val ownerId: String,
    val name: String,
    val province: String,
    val locality: String,
    val farmingType: String?,
    val buildingCount: Int?,
    val status: String = "draft",             // draft|pending|active|closed
    val serverRevision: Long = 0,
    val localRevision: Long = 0,
    val createdAt: Long,
    val syncedAt: Long? = null,
)

@Entity(tableName = "farm_assignment")
data class FarmAssignmentEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val farmId: String,
    val role: String,
    val status: String = "active",
)

@Entity(tableName = "building", indices = [Index("farmId")])
data class BuildingEntity(
    @PrimaryKey val id: String,
    val farmId: String,
    val name: String,
    val capacity: Int?,
    val status: String = "available",
    val flockId: String? = null,
    val serverRevision: Long = 0,
    val localRevision: Long = 0,
    val createdAt: Long,
)

@Entity(tableName = "band", indices = [Index("farmId"), Index("status")])
data class BandEntity(
    @PrimaryKey val id: String,
    val displayCode: String? = null,
    val farmId: String,
    val buildingId: String?,
    val status: String = "active",            // active|closed
    val placementDate: Long,
    val initialChicks: Int,
    val strainId: String? = null,
    val strainLabel: String? = null,
    val ageAtReceiptDays: Int? = null,
    val origin: String? = null,
    val hatcheryLot: String? = null,
    val initialFeedProductId: String? = null,
    val strain: String? = null,
    val ageAtReceptionDays: Int? = null,
    val closedAt: Long? = null,
    val serverRevision: Long = 0,
    val localRevision: Long = 0,
    val createdAt: Long,
    val syncedAt: Long? = null,
)

@Entity(tableName = "daily_record", indices = [Index("bandId", "recordDate")])
data class DailyRecordEntity(
    @PrimaryKey val id: String,
    val farmId: String = "",
    val bandId: String,
    val recordDate: Long,                      // epoch jour (yyyyMMdd ou millis)
    val mortality: Int?,
    val feedKg: Double?,
    val avgWeightKg: Double? = null,
    val notes: String?,
    val authorId: String?,
    val status: String = "pending",            // pending|synced|conflict
    val serverRevision: Long = 0,
    val createdAt: Long,
    val syncedAt: Long? = null,
)

@Entity(tableName = "inventory_product")
data class InventoryProductEntity(
    @PrimaryKey val id: String,
    val farmId: String,
    val name: String,
    val category: String?,                     // feed|vaccine|medicine|other
    val unit: String,
    val batchNumber: String? = null,
    val expiryDate: Long? = null,              // epoch — calcul statut réel
    val serverRevision: Long = 0,
    val createdAt: Long,
)

@Entity(tableName = "inventory_movement", indices = [Index("productId")])
data class InventoryMovementEntity(
    @PrimaryKey val id: String,
    val productId: String,
    val farmId: String,
    val bandId: String?,
    val quantity: Double,                      // signé : + réception, − consommation
    val unit: String,
    val movementType: String,                  // receipt|consumption|usage|adjustment
    val sourceRecordId: String?,               // daily_record / receipt / usage
    val movementDate: Long,
    val status: String = "pending",
    val serverRevision: Long = 0,
    val createdAt: Long,
    val syncedAt: Long? = null,
)

@Entity(tableName = "health_declaration", indices = [Index("bandId")])
data class HealthDeclarationEntity(
    @PrimaryKey val id: String,
    val bandId: String,
    val farmId: String,
    val eventDate: Long,
    val problemType: String,
    val signs: String,                         // CSV ou JSON des signes
    val affectedCount: Int?,
    val notes: String?,
    val status: String = "local",              // local|pending|submitted|review|closed
    val serverRevision: Long = 0,
    val createdAt: Long,
    val syncedAt: Long? = null,
)

@Entity(tableName = "lot", indices = [Index("farmId")])
data class LotEntity(
    @PrimaryKey val id: String,
    val displayCode: String?,                  // LP-003-01 — officiel serveur
    val provisionalCode: String?,              // code provisoire hors ligne
    val farmId: String,
    val bandId: String,
    val quantity: Int,
    val recipient: String?,
    val transferDate: Long,
    val status: String = "pending",            // pending|confirmed|printed
    val isProvisional: Boolean = true,
    val serverRevision: Long = 0,
    val createdAt: Long,
    val syncedAt: Long? = null,
)

@Entity(tableName = "lot_event")
data class LotEventEntity(
    @PrimaryKey val id: String,
    val lotId: String,
    val eventType: String,                     // placement|raising|transfer|receipt
    val eventDate: Long,
    val detail: String?,
    val createdAt: Long,
)

@Entity(tableName = "pending_operation")
data class PendingOperationEntity(
    @PrimaryKey val opId: String,              // UUID immuable
    val userId: String,
    val opType: String,                        // create|update|delete
    val entityType: String,
    val entityId: String?,
    val payloadJson: String,
    val clientTs: Long,
    val schemaVersion: Int = 1,
    val attempts: Int = 0,
    val lastError: String? = null,
    val status: String = "pending",            // pending|sending|failed|acked
    val createdAt: Long,
)

@Entity(tableName = "sync_cursor")
data class SyncCursorEntity(
    @PrimaryKey val userId: String,
    val pullCursor: Long = 0,
    val lastPushAt: Long? = null,
    val lastPullAt: Long? = null,
    val lastConfirmedSyncAt: Long? = null,
)

// ── Batch 03 : pesées, sorties, traitements, réceptions ──────────────────

@Entity(tableName = "weighing", indices = [Index("bandId", "weighingDate")])
data class WeighingEntity(
    @PrimaryKey val id: String,
    val farmId: String = "",
    val bandId: String,
    val weighingDate: Long,
    val sampleCount: Int,
    val totalWeightKg: Double,
    val averageWeightKg: Double?,
    val recordedBy: String?,
    val status: String = "pending",
    val serverRevision: Long = 0,
    val createdAt: Long,
    val updatedAt: Long,
    val syncedAt: Long? = null,
)

@Entity(tableName = "flock_exit", indices = [Index("bandId")])
data class FlockExitEntity(
    @PrimaryKey val id: String,
    val farmId: String = "",
    val bandId: String,
    val exitType: String,                      // cession|autoconsommation|autre
    val quantity: Int,
    val recipient: String?,
    val exitDate: Long,
    val lotId: String?,                        // lot traçabilité associé
    val provisionalLotCode: String?,
    val status: String = "pending",
    val serverRevision: Long = 0,
    val createdAt: Long,
    val syncedAt: Long? = null,
)

@Entity(tableName = "treatment_event", indices = [Index("bandId")])
data class TreatmentEventEntity(
    @PrimaryKey val id: String,
    val farmId: String = "",
    val bandId: String,
    val treatmentType: String,                 // vaccine|medicine|vitamins
    val productName: String,
    val batchNumber: String?,
    val method: String?,                       // eau_de_boisson|injection|pulverisation
    val animalsTreated: Int?,
    val eventDate: Long,
    val status: String = "pending_confirmation", // pending_confirmation|done
    val createdBy: String?,
    val serverRevision: Long = 0,
    val createdAt: Long,
    val syncedAt: Long? = null,
)

@Entity(tableName = "inventory_receipt", indices = [Index("farmId")])
data class InventoryReceiptEntity(
    @PrimaryKey val id: String,
    val farmId: String,
    val productName: String,
    val quantity: Double,
    val unit: String,                          // kg|g|flacon|dose|L…
    val receiptDate: Long,
    val deliveryRef: String?,
    val status: String = "pending",            // pending|confirmed
    val movementId: String? = null,
    val createdAt: Long,
    val syncedAt: Long? = null,
)

/** Pièce jointe d'un signalement sanitaire — fichier copié en stockage privé. */
@Entity(tableName = "health_attachment", indices = [Index("declarationId")])
data class HealthAttachmentEntity(
    @PrimaryKey val id: String,
    val declarationId: String,
    val filePath: String,                      // stockage privé durable
    val mimeType: String?,
    val fileSize: Long?,
    val checksum: String?,
    val uploadStatus: String = "pending",      // pending|uploaded
    val createdAt: Long,
)

/** Annuaire contacts de la ferme (écran 42). */
@Entity(tableName = "contact", indices = [Index("farmId")])
data class ContactEntity(
    @PrimaryKey val id: String,
    val farmId: String,
    val category: String,                      // veterinary|technician|hatchery|slaughterhouse|supplier
    val name: String,
    val phone: String?,
    val detail: String?,
    val authority: String = "farm",            // farm|operator|national
    val serverRevision: Long = 0,
    val createdAt: Long,
)

/** Membre de l'équipe ferme (écran 52). */
@Entity(tableName = "farm_member", indices = [Index("farmId")])
data class FarmMemberEntity(
    @PrimaryKey val id: String,
    val farmId: String,
    val userId: String?,
    val displayName: String,
    val role: String,                          // manager|worker
    val permissions: String?,
    val status: String = "active",             // active|pending|revoked
    val invitedAt: Long? = null,
    val createdAt: Long,
)

/** Notification locale (écran 54) — dédup par sourceEventId. */
@Entity(tableName = "app_notification", indices = [Index("farmId"), Index("userId")])
data class AppNotificationEntity(
    @PrimaryKey val id: String,
    val userId: String = "",
    val farmId: String,
    val eventType: String,
    val title: String,
    val message: String,
    val targetRoute: String?,
    val sourceEventId: String?,                // idempotence : 1 notif / événement
    val isRead: Boolean = false,
    val createdAt: Long,
)

@Entity(tableName = "sync_conflict")
data class SyncConflictEntity(
    @PrimaryKey val id: String,
    val opId: String,
    val entityType: String,
    val entityId: String?,
    val localPayload: String,
    val serverPayload: String?,
    val detectedAt: Long,
    val resolvedAt: Long? = null,
    val resolution: String?,
)
