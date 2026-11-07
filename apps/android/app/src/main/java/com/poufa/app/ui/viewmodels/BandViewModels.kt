package com.poufa.app.ui.viewmodels

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.poufa.app.data.DailyRepository
import com.poufa.app.data.ProductionRepository
import com.poufa.app.data.local.*
import com.poufa.app.di.ServiceLocator
import com.poufa.app.sync.SyncWorker
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/** État accueil éleveur — Room-backed (écrans 01/12/13). */
data class FarmerHomeUiState(
    val farmName: String? = null,
    val userName: String? = null,
    val band: BandEntity? = null,
    val population: Int? = null,
    val latestWeighingAvgKg: Double? = null,
    val pendingCount: Int = 0,
    val lastSyncAt: Long? = null,
    val loading: Boolean = true,
    val dayCount: Int = 0,
)

class FarmerHomeViewModel(private val handle: SavedStateHandle) : ViewModel() {
    private val db = ServiceLocator.database
    private val farmId: String? = handle.get<String>("farmId")

    val uiState: StateFlow<FarmerHomeUiState> = combine(
        if (farmId != null) db.farmDao().observeById(farmId) else flowOf(null),
        if (farmId != null) db.bandDao().observeActiveForFarm(farmId) else flowOf(null),
        db.pendingOperationDao().observePendingCount(),
    ) { farm, band, pending ->
        Triple(farm, band, pending)
    }.flatMapLatest { (farm, band, pending) ->
        val popFlow = band?.let {
            ServiceLocator.dailyRepository.observePopulation(it.id)
        } ?: flowOf(null)
        val weighFlow = band?.let {
            ServiceLocator.productionRepository.observeLatestWeighing(it.id)
        } ?: flowOf(null)
        combine(popFlow, weighFlow) { pop, w -> Quad(farm, band, pop, w, pending) }
    }.map { q ->
        FarmerHomeUiState(
            farmName = q.farm?.name, band = q.band, population = q.pop,
            latestWeighingAvgKg = q.weighing?.averageWeightKg,
            pendingCount = q.pending, loading = false,
            dayCount = q.b?.let { ((System.currentTimeMillis() - it.placementDate) / 86_400_000).toInt().coerceAtLeast(0) } ?: 0,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), FarmerHomeUiState())

    private data class Quad(val f: FarmEntity?, val b: BandEntity?, val p: Int?, val w: WeighingEntity?, val pending: Int)
}

/** État fiche bande — onglets Suivi/Pesées/Sorties + indicateurs. */
data class BandDetailUiState(
    val band: BandEntity? = null,
    val farmName: String? = null,
    val population: Int? = null,
    val cumulativeDeaths: Int = 0,
    val dayCount: Int = 0, // calculé dans FarmerHomeRoute depuis placementDate
    val weighings: List<WeighingEntity> = emptyList(),
    val exits: List<FlockExitEntity> = emptyList(),
    val treatments: List<TreatmentEventEntity> = emptyList(),
    val loading: Boolean = true,
)

class BandDetailViewModel(private val handle: SavedStateHandle) : ViewModel() {
    private val db = ServiceLocator.database
    private val bandId: String = checkNotNull(handle.get<String>("bandId"))

    val uiState: StateFlow<BandDetailUiState> =
        db.bandDao().observeById(bandId).flatMapLatest { band ->
            if (band == null) {
                flowOf(BandDetailUiState(loading = false))
            } else {
                val farmFlow = db.farmDao().observeById(band.farmId)
                val popFlow = ServiceLocator.dailyRepository.observePopulation(bandId)
                val deathsFlow = db.dailyRecordDao().observeForBand(bandId)
                val weighFlow = db.weighingDao().observeForBand(bandId)
                val exitFlow = db.flockExitDao().observeForBand(bandId)
                val treatFlow = db.treatmentDao().observeForBand(bandId)
                val base = combine(farmFlow, popFlow, deathsFlow) { f, pop, recs -> Triple(f, pop, recs) }
                val rest = combine(weighFlow, exitFlow, treatFlow) { w, e, t -> Triple(w, e, t) }
                combine(base, rest) { (f, pop, recs), (w, e, t) ->
                    BandDetailUiState(
                        band = band, farmName = f?.name, population = pop,
                        cumulativeDeaths = recs.sumOf { it.mortality ?: 0 },
                        dayCount = ((System.currentTimeMillis() - band.placementDate) / 86_400_000).toInt(),
                        weighings = w, exits = e, treatments = t, loading = false,
                    )
                }
            }
        }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), BandDetailUiState())

    fun saveWeighing(sampleCount: Int, totalWeightKg: Double, onDone: () -> Unit) {
        viewModelScope.launch {
            val band = uiState.value.band ?: return@launch
            ServiceLocator.productionRepository.saveWeighing(
                farmId = band.farmId, bandId = band.id,
                date = System.currentTimeMillis(), sampleCount = sampleCount,
                totalWeightKg = totalWeightKg, authorId = null,
            )
            com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context())
            onDone()
        }
    }

    fun registerExit(type: String, quantity: Int, recipient: String?, onDone: () -> Unit) {
        viewModelScope.launch {
            val band = uiState.value.band ?: return@launch
            ServiceLocator.productionRepository.registerExit(
                farmId = band.farmId, bandId = band.id, exitType = type,
                quantity = quantity, recipient = recipient,
                date = System.currentTimeMillis(), authorId = null,
            )
            com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context())
            onDone()
        }
    }
}
