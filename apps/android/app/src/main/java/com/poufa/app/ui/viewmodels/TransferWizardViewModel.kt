package com.poufa.app.ui.viewmodels

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.poufa.app.data.local.BandEntity
import com.poufa.app.di.ServiceLocator
import com.poufa.app.sync.SyncWorker
import com.poufa.app.ui.Session
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

data class TransferWizardState(
    val step: Int = 1,
    val farmId: String = "",
    val bandId: String? = null,
    val qty: String = "",
    val recipient: String = "",
    val transferDate: Long = System.currentTimeMillis(),
    val draftUuid: String = UUID.randomUUID().toString(),
    val isSaving: Boolean = false,
    val isDone: Boolean = false,
    val errorMessage: String? = null,
)

class TransferWizardViewModel(private val stateHandle: SavedStateHandle) : ViewModel() {
    private val keyStep = "transfer_step"
    private val keyFarmId = "transfer_farm_id"
    private val keyBandId = "transfer_band_id"
    private val keyQty = "transfer_qty"
    private val keyRecipient = "transfer_recipient"
    private val keyDraftUuid = "transfer_draft_uuid"
    private val keyTransferDate = "transfer_date"

    private val _uiState = MutableStateFlow(
        TransferWizardState(
            step = stateHandle[keyStep] ?: 1,
            farmId = stateHandle[keyFarmId] ?: "",
            bandId = stateHandle[keyBandId],
            qty = stateHandle[keyQty] ?: "",
            recipient = stateHandle[keyRecipient] ?: "",
            transferDate = stateHandle[keyTransferDate] ?: System.currentTimeMillis(),
            draftUuid = stateHandle[keyDraftUuid] ?: UUID.randomUUID().toString().also { stateHandle[keyDraftUuid] = it },
        )
    )
    val uiState: StateFlow<TransferWizardState> = _uiState.asStateFlow()

    fun initFarm(farmId: String) {
        if (_uiState.value.farmId.isBlank()) {
            stateHandle[keyFarmId] = farmId
            _uiState.value = _uiState.value.copy(farmId = farmId)
        }
    }

    fun setBand(bandId: String) {
        stateHandle[keyBandId] = bandId
        _uiState.value = _uiState.value.copy(bandId = bandId)
    }

    fun setQty(qty: String) {
        stateHandle[keyQty] = qty
        _uiState.value = _uiState.value.copy(qty = qty)
    }

    fun setRecipient(recipient: String) {
        stateHandle[keyRecipient] = recipient
        _uiState.value = _uiState.value.copy(recipient = recipient)
    }

    fun goToStep(step: Int) {
        stateHandle[keyStep] = step
        _uiState.value = _uiState.value.copy(step = step)
    }

    fun submitTransfer(band: BandEntity?, onSuccess: () -> Unit) {
        val s = _uiState.value
        if (s.isSaving || s.isDone || band == null) return
        val count = s.qty.toIntOrNull() ?: return
        if (count <= 0) return

        _uiState.value = s.copy(isSaving = true, errorMessage = null)
        viewModelScope.launch {
            runCatching {
                ServiceLocator.productionRepository.registerExit(
                    farmId = s.farmId,
                    bandId = band.id,
                    exitType = "cession",
                    quantity = count,
                    recipient = s.recipient,
                    date = s.transferDate,
                    authorId = Session.userId,
                )
                SyncWorker.schedule(ServiceLocator.context())
            }.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(isSaving = false, isDone = true)
                    onSuccess()
                },
                onFailure = {
                    _uiState.value = _uiState.value.copy(
                        isSaving = false,
                        errorMessage = it.message ?: "Échec de l'enregistrement de la cession"
                    )
                }
            )
        }
    }
}

