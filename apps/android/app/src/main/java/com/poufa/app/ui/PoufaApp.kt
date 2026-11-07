package com.poufa.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.poufa.app.auth.AuthViewModel
import com.poufa.app.di.ServiceLocator
import com.poufa.app.ui.admin.*
import com.poufa.app.ui.auth.LoginScreen
import com.poufa.app.ui.buildings.*
import com.poufa.app.ui.closure.*
import com.poufa.app.ui.components.*
import com.poufa.app.ui.daily.DailyEntryScreen
import com.poufa.app.ui.exits.*
import com.poufa.app.ui.farms.*
import com.poufa.app.ui.health.*
import com.poufa.app.ui.indicators.*
import com.poufa.app.ui.inventory.*
import com.poufa.app.ui.more.*
import com.poufa.app.ui.receipts.ReceiptsTab
import com.poufa.app.ui.theme.*
import com.poufa.app.ui.traceability.*
import com.poufa.app.ui.treatments.*
import com.poufa.app.ui.viewmodels.BandDetailViewModel
import com.poufa.app.ui.viewmodels.FarmerHomeViewModel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

/** Ferme active en session — définie à la sélection (écran 09). */
object Session {
    var selectedFarmId: String? = null
    var userId: String? = null
}

private data class TopDest(val route: String, val label: String, val icon: ImageVector)
private val topDests = listOf(
    TopDest("home", "Accueil", Icons.Outlined.Home),
    TopDest("bandes", "Bande", Icons.Outlined.GridView),
    TopDest("intrants", "Intrants", Icons.Outlined.Inventory2),
    TopDest("plus", "Plus", Icons.Outlined.Menu),
)

@Composable
fun PoufaApp() {
    val authVm: AuthViewModel = viewModel()
    val signedIn by authVm.isSignedIn.collectAsStateWithLifecycle()
    if (!signedIn) { LoginScreen(onAuthenticated = {}); return }

    // Identité Clerk → scope compte (Room/DataStore isolés par userId)
    LaunchedEffect(signedIn) {
        Session.userId = com.clerk.api.Clerk.userFlow.first()?.id
    }

    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route ?: ""
    val showBottomBar = topDests.any { currentRoute.startsWith(it.route) }

    Scaffold(
        bottomBar = {
            if (showBottomBar) PoufaBottomNav(currentRoute) {
                navController.navigate(it) {
                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                    launchSingleTop = true; restoreState = true
                }
            }
        },
    ) { padding ->
        NavHost(navController, startDestination = "farms", modifier = Modifier.padding(padding)) {
            composable("farms") { FarmSelectRoute(navController) }
            composable("home") { HomeRoute(navController) }
            composable("bandes") { BandsRoute(navController) }
            composable("intrants") { InputsRoute(navController) }
            composable("plus") { MoreRoute(navController) }
            composable("profile") { ProfileRoute(navController) }
            composable("rappels") { RemindersRoute(navController) }
            composable("notifications") { NotificationsRoute(navController) }
            composable("sync") { SyncRoute(navController) }
            composable("parametres") { SettingsRoute(navController) }
            composable("aide") { HelpRoute(navController) }

            composable("farm/{farmId}/create") { CreateFarmRoute(navController) }
            composable("farm/{farmId}/receipts") { ReceiptsRoute(navController) }
            composable("farm/{farmId}/receipts/new") { NewReceiptRoute(navController) }
            composable("farm/{farmId}/daily") { DailyRoute(navController) }
            composable("farm/{farmId}/stock") { StockRoute(navController) }
            composable("farm/{farmId}/usage") { UsageRoute(navController) }
            composable("farm/{farmId}/contacts") { ContactsRoute(navController) }
            composable("farm/{farmId}/lots") { LotsRoute(navController) }
            composable("farm/{farmId}/lots/lookup") { LotLookupRoute(navController) }
            composable("farm/{farmId}/lots/result") { LotResultRoute(navController) }
            composable("farm/{farmId}/transfer/new") { TransferWizardRoute(navController) }
            composable("farm/{farmId}/ma-ferme") { MyFarmRoute(navController) }
            composable("farm/{farmId}/equipe") { TeamRoute(navController) }
            composable("farm/{farmId}/buildings") { BuildingsRoute(navController) }
            composable("farm/{farmId}/medical") { MedicalRoute(navController) }
            composable("farm/{farmId}/sante") { HealthListRoute(navController) }
            composable("farm/{farmId}/sante/new") { HealthFormRoute(navController) }
            composable("health/{declarationId}") { HealthDetailRoute(navController) }
            composable("lots/{lotId}/label") { LabelRoute(navController) }

            composable("band/{bandId}") { BandDetailRoute(navController) }
            composable("farm/{farmId}/band/new") { BandWizardRoute(navController) }
            composable("band/{bandId}/records") { BandRecordsRoute(navController) }
            composable("daily/{recordId}") { DailyDetailRoute(navController) }
            composable("band/{bandId}/indicators") { IndicatorsRoute(navController) }
            composable("band/{bandId}/weigh/add") { WeighAddRoute(navController) }
            composable("band/{bandId}/exit/add") { ExitAddRoute(navController) }
            composable("band/{bandId}/treatments") { TreatmentsRoute(navController) }
            composable("band/{bandId}/treat/add") { TreatAddRoute(navController) }
            composable("band/{bandId}/close") { CloseBandRoute(navController) }
            composable("band/{bandId}/summary") { BandSummaryRoute(navController) }
        }
    }
}

@Composable
private fun PoufaBottomNav(currentRoute: String, onNav: (String) -> Unit) {
    Surface(color = MaterialTheme.colorScheme.surfaceContainerLowest) {
        Column {
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
            Row(Modifier.fillMaxWidth().navigationBarsPadding().height(64.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
                topDests.forEach { dest ->
                    val selected = currentRoute == dest.route || (dest.route == "bandes" && currentRoute.startsWith("band/"))
                    Column(
                        Modifier.weight(1f).fillMaxHeight().clickable { onNav(dest.route) },
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                    ) {
                        Box(Modifier.size(40.dp).clip(RoundedCornerShape(12.dp))
                            .background(if (selected) PoufaSoftGreen else MaterialTheme.colorScheme.surface),
                            contentAlignment = Alignment.Center) {
                            Icon(dest.icon, dest.label, tint = if (selected) PoufaPrimary else MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text(dest.label, fontSize = 12.sp, fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal,
                            color = if (selected) PoufaPrimary else MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

// ── Routes ──────────────────────────────────────────────────────────────

@Composable
private fun FarmSelectRoute(nav: NavHostController) {
    val scope = rememberCoroutineScope()
    val farms by ServiceLocator.database.farmDao().observeAll()
        .collectAsStateWithLifecycle(initialValue = emptyList())
    val selected by ServiceLocator.settings.selectedFarmId(Session.userId ?: "")
        .collectAsStateWithLifecycle(initialValue = null)
    var creating by remember { mutableStateOf(false) }

    if (creating) {
        CreateFarmScreen(
            onBack = { creating = false },
            onSubmit = { n, p, l, t, b ->
                scope.launch {
                    runCatching {
                        ServiceLocator.farmRepository.createFarm(Session.userId ?: "", n, p.lowercase(), l, t, b)
                    }.onSuccess { farm ->
                        ServiceLocator.settings.setSelectedFarm(Session.userId ?: "", farm.id)
                        Session.selectedFarmId = farm.id
                        nav.navigate("home") { popUpTo("farms") { inclusive = true } }
                    }
                }
            },
        )
        return
    }

    FarmSelectionScreen(
        farms = farms.map { it.id to "${it.name} — ${it.locality}" },
        selectedId = selected,
        onSelect = { id -> scope.launch { ServiceLocator.settings.setSelectedFarm(Session.userId ?: "", id); Session.selectedFarmId = id } },
        onContinue = { Session.selectedFarmId?.let { nav.navigate("home") { popUpTo("farms") { inclusive = true } } } },
        onAddFarm = { creating = true },
        canCreateFarm = true,
    )
}

@Composable
private fun HomeRoute(nav: NavHostController) {
    val farmId = Session.selectedFarmId ?: run { nav.navigate("farms") { popUpTo(0) }; return }
    val vm: FarmerHomeViewModel = viewModel { FarmerHomeViewModel(savedStateHandleOf(nav, "farmId" to farmId)) }
    val s by vm.uiState.collectAsStateWithLifecycle()

    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(PoufaPagePadding), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                PoufaBrandHeader(s.farmName)
                Box(Modifier.size(40.dp).clip(CircleShape).background(PoufaSoftGreen), contentAlignment = Alignment.Center) {
                    Text("A", fontWeight = FontWeight.Bold, color = PoufaPrimary)
                }
            }
        }
        item {
            Text("Bonjour", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text("Voici votre bande en cours.", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        val band = s.band
        if (band == null) {
            item {
                PoufaCard {
                    PoufaEmptyState("Aucune bande en cours", "Démarrez une bande dès l'arrivée des poussins.")
                    PoufaPrimaryButton("+ Démarrer une bande", { nav.navigate("farm/$farmId/band/new") })
                }
            }
        } else {
            item {
                PoufaCard(containerColor = PoufaSoftGreen) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("BANDE EN COURS", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = PoufaPrimary)
                        PoufaStatusChip("Jour ${s.dayCount}")
                    }
                    Spacer(Modifier.height(8.dp))
                    Text("Bande", fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
                    Text(s.population?.toString() ?: "—", fontSize = 52.sp, fontWeight = FontWeight.Bold, color = PoufaPrimary)
                    Text("animaux présents", fontSize = 14.sp, color = PoufaSecondaryText)
                    TextButton(onClick = { nav.navigate("band/${band.id}") }) { Text("Voir la bande →", color = PoufaPrimary, fontWeight = FontWeight.Medium) }
                }
            }
            item { PoufaPrimaryButton("Saisir les données du jour", { nav.navigate("farm/$farmId/daily") }) }
            item {
                PoufaCard {
                    PoufaListRow("Ajouter une pesée", onClick = { nav.navigate("band/${band.id}/weigh/add") })
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    PoufaListRow("Enregistrer une sortie", onClick = { nav.navigate("band/${band.id}/exit/add") })
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    PoufaListRow("Indicateurs techniques", onClick = { nav.navigate("band/${band.id}/indicators") })
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    PoufaListRow("Vaccins et traitements", onClick = { nav.navigate("band/${band.id}/treatments") })
                }
            }
        }
        if (s.pendingCount > 0) item { PoufaOfflineBanner() }
        item { PoufaSyncStatus(null, s.pendingCount) }
    }
}

private fun com.poufa.app.ui.viewmodels.FarmerHomeUiState.dayCountOrZero() = dayCount

@Composable
private fun BandsRoute(nav: NavHostController) {
    val farmId = Session.selectedFarmId ?: return
    val bands by ServiceLocator.database.bandDao().observeForFarm(farmId)
        .collectAsStateWithLifecycle(initialValue = emptyList())
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        Spacer(Modifier.height(24.dp))
        PoufaBrandHeader()
        Spacer(Modifier.height(24.dp))
        Text("Mes bandes", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        if (bands.isEmpty()) PoufaEmptyState("Aucune bande", "Les bandes de la ferme apparaîtront ici.")
        bands.forEach { b ->
            PoufaCard {
                PoufaListRow(
                    b.displayCode ?: "Bande", "${if (b.status == "active") "En cours" else "Clôturée"} · ${b.initialChicks} poussins",
                    trailing = { PoufaStatusChip(if (b.status == "active") "● En cours" else "Clôturée", bg = if (b.status == "active") PoufaSoftGreen else PoufaNeutralSelected, color = if (b.status == "active") PoufaSuccess else PoufaSecondaryText) },
                    onClick = { nav.navigate("band/${b.id}") },
                )
            }
            Spacer(Modifier.height(12.dp))
        }
        PoufaSecondaryButton("+ Démarrer une bande", { nav.navigate("farm/$farmId/band/new") })
    }
}

@Composable
private fun InputsRoute(nav: NavHostController) {
    val farmId = Session.selectedFarmId ?: return
    val pending by ServiceLocator.database.receiptDao().observeByStatus(farmId, "pending")
        .collectAsStateWithLifecycle(initialValue = emptyList())
    val confirmed by ServiceLocator.database.receiptDao().observeByStatus(farmId, "confirmed")
        .collectAsStateWithLifecycle(initialValue = emptyList())
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        Spacer(Modifier.height(24.dp))
        PoufaBrandHeader()
        Spacer(Modifier.height(24.dp))
        Text("Mes intrants", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(20.dp))
        var invTab by remember { mutableIntStateOf(0) }
        PoufaSegmentedTabs(listOf("Stock", "Réceptions"), invTab, { invTab = it })
        Spacer(Modifier.height(16.dp))
        if (invTab == 0) {
            val products by ServiceLocator.database.inventoryDao().observeProducts(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
            val movements by ServiceLocator.database.inventoryDao().observeMovements(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
            products.forEach { p ->
                val stock = movements.filter { it.productId == p.id }.sumOf { it.quantity }
                PoufaCard { PoufaListRow(p.name, "${"%.1f".format(stock)} ${p.unit} disponible(s)", onClick = { nav.navigate("farm/$farmId/stock") }) }
                Spacer(Modifier.height(8.dp))
            }
            if (products.isEmpty()) PoufaEmptyState("Aucun intrant", "Le stock apparaîtra ici.")
        } else {
            ReceiptsTab(pending, confirmed,
                onOpenReceipt = { },
                onAddReceipt = { nav.navigate("farm/$farmId/receipts/new") })
        }
    }
}

@Composable
private fun ReceiptsRoute(nav: NavHostController) {
    InputsRoute(nav)
}

@Composable
private fun DailyRoute(nav: NavHostController) {
    val farmId = Session.selectedFarmId ?: return
    val band by ServiceLocator.database.bandDao().observeActiveForFarm(farmId)
        .collectAsStateWithLifecycle(initialValue = null)
    val b = band ?: run { nav.popBackStack(); return }
    val pop by ServiceLocator.dailyRepository.observePopulation(b.id)
        .collectAsStateWithLifecycle(initialValue = null)
    var saving by remember { mutableStateOf(false) }
    var done by remember { mutableStateOf<Triple<Int, Double?, String?>?>(null) }

    if (done != null) {
        DailyEntryScreen(
            bandLabel = "Bande ${b.id.take(4)}", farmLabel = "", currentPopulation = pop,
            onBack = { nav.popBackStack() },
            onSave = { d, f, o ->
                scopeSave(b.farmId, b.id, d, f, o) { done = Triple(d, f, o); saving = false }
            },
            saving = saving,
        )
        return
    }
    DailyEntryScreen(
        bandLabel = "Bande ${b.id.take(4)}", farmLabel = "", currentPopulation = pop,
        onBack = { nav.popBackStack() },
        onSave = { d, f, o ->
            saving = true
            scopeSave(b.farmId, b.id, d, f, o) { done = Triple(d, f, o); saving = false }
        },
        saving = saving,
    )
}

private fun scopeSave(farmId: String, bandId: String, d: Int, f: Double?, o: String?, cb: () -> Unit) {
    kotlinx.coroutines.MainScope().launch {
        ServiceLocator.dailyRepository.saveDailyRecord(farmId, bandId, System.currentTimeMillis(), d, f, o, null)
        com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context())
        cb()
    }
}

@Composable
private fun BandDetailRoute(nav: NavHostController) {
    val backStackEntry = nav.currentBackStackEntryAsState().value
    val bandId = backStackEntry?.arguments?.getString("bandId") ?: return
    val vm: BandDetailViewModel = viewModel { BandDetailViewModel(savedStateHandleOf(nav)) }
    val s by vm.uiState.collectAsStateWithLifecycle()
    var tab by remember { mutableStateOf(0) }

    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = { nav.popBackStack() }) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text(s.band?.let { "Bande ${it.id.take(4)}" } ?: "Bande", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Text(s.farmName ?: "", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Spacer(Modifier.height(12.dp))
        PoufaSegmentedTabs(listOf("Suivi", "Pesées", "Sorties"), tab, { tab = it })
        Spacer(Modifier.height(16.dp))

        when (tab) {
            0 -> Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                PoufaCard {
                    PoufaListRow("Effectif présent", trailing = { Text("${s.population ?: "—"} animaux", fontWeight = FontWeight.Bold)) }
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    PoufaListRow("Mortalité cumulée", trailing = { Text("${s.cumulativeDeaths}", fontWeight = FontWeight.Bold)) }
                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
                    PoufaListRow("Jour", trailing = { Text("${s.dayCount}", fontWeight = FontWeight.Bold)) }
                }
                PoufaPrimaryButton("Saisir une journée", { nav.navigate("farm/${s.band?.farmId}/daily") })
                PoufaSecondaryButton("Voir les indicateurs techniques", { nav.navigate("band/$bandId/indicators") })
            }
            1 -> BandWeighingsTab(
                weighings = s.weighings.map { WeighingRowData(it.id, "Pesée", "${it.averageWeightKg?.let { a -> "%.2f".format(a) + " kg" } ?: "—"} · ${it.sampleCount} pesés") },
                overdueWarning = null,
                onAddWeighing = { nav.navigate("band/$bandId/weigh/add") },
            )
            2 -> BandExitsTab(
                exits = s.exits.map { ExitRowData(it.id, "${it.exitType} · ${it.quantity} animaux", "Lot ${it.provisionalLotCode ?: "—"}", it.provisionalLotCode, true) },
                onAddExit = { nav.navigate("band/$bandId/exit/add") },
            )
        }
    }
}

@Composable
private fun IndicatorsRoute(nav: NavHostController) {
    val bandId = nav.currentBackStackEntryAsState().value?.arguments?.getString("bandId") ?: return
    val vm: BandDetailViewModel = viewModel { BandDetailViewModel(savedStateHandleOf(nav)) }
    val s by vm.uiState.collectAsStateWithLifecycle()
    val b = s.band ?: return
    TechnicalIndicatorsScreen(
        IndicatorsData(
            bandLabel = "Bande ${b.id.take(4)}", farmLabel = s.farmName ?: "",
            initialChicks = b.initialChicks, cumulativeDeaths = s.cumulativeDeaths,
            population = s.population,
            mortalityPct = com.poufa.app.data.IndicatorsCalculator.mortalityPct(b.initialChicks, s.cumulativeDeaths),
            latestAvgWeightKg = s.weighings.firstOrNull()?.averageWeightKg,
            latestWeighingDay = null,
            lastDayFeedKg = null, lastDayPopulation = s.population,
            totalFeedKg = 0.0, conversionRatio = null,
        ),
        onBack = { nav.popBackStack() },
    )
}

@Composable
private fun WeighAddRoute(nav: NavHostController) {
    val vm: BandDetailViewModel = viewModel { BandDetailViewModel(savedStateHandleOf(nav)) }
    val s by vm.uiState.collectAsStateWithLifecycle()
    AddWeighingScreen(
        bandLabel = s.band?.let { "Bande ${it.id.take(4)}" } ?: "",
        population = s.population,
        onBack = { nav.popBackStack() },
        onSave = { n, w -> vm.saveWeighing(n, w) { nav.popBackStack() } },
    )
}

@Composable
private fun ExitAddRoute(nav: NavHostController) {
    val vm: BandDetailViewModel = viewModel { BandDetailViewModel(savedStateHandleOf(nav)) }
    val s by vm.uiState.collectAsStateWithLifecycle()
    RegisterExitScreen(
        bandLabel = s.band?.let { "Bande ${it.id.take(4)}" } ?: "",
        population = s.population,
        onBack = { nav.popBackStack() },
        onSave = { t, q, r -> vm.registerExit(t, q, r) { nav.popBackStack() } },
    )
}

@Composable
private fun TreatmentsRoute(nav: NavHostController) {
    val vm: BandDetailViewModel = viewModel { BandDetailViewModel(savedStateHandleOf(nav)) }
    val s by vm.uiState.collectAsStateWithLifecycle()
    VaccinationTreatmentScreen(
        bandLabel = s.band?.let { "Bande ${it.id.take(4)}" } ?: "",
        events = s.treatments,
        onBack = { nav.popBackStack() },
        onAddTreatment = { nav.navigate("band/${s.band?.id}/treat/add") },
    )
}

@Composable
private fun TreatAddRoute(nav: NavHostController) {
    val vm: BandDetailViewModel = viewModel { BandDetailViewModel(savedStateHandleOf(nav)) }
    val s by vm.uiState.collectAsStateWithLifecycle()
    RegisterTreatmentScreen(
        bandLabel = s.band?.let { "Bande ${it.id.take(4)}" } ?: "",
        population = s.population,
        onBack = { nav.popBackStack() },
        onSave = { t, p, b, m, a ->
            s.band?.let { band ->
                kotlinx.coroutines.MainScope().launch {
                    ServiceLocator.productionRepository.recordTreatment(band.farmId, band.id, t, p, b, m, a, System.currentTimeMillis(), null)
                    com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context())
                    nav.popBackStack()
                }
            }
        },
    )
}

@Composable
private fun CreateFarmRoute(nav: NavHostController) { /* via FarmSelectRoute */ }

@Composable
private fun CloseBandRoute(nav: NavHostController) {
    val vm: BandDetailViewModel = viewModel { BandDetailViewModel(savedStateHandleOf(nav)) }
    val s by vm.uiState.collectAsStateWithLifecycle()
    CloseBandScreen(
        bandLabel = s.band?.let { "Bande ${it.id.take(4)}" } ?: "",
        dayCount = s.dayCount,
        checks = emptyList(), // TODO: ClosureReadiness depuis données réelles
        canClose = false,
        onBack = { nav.popBackStack() },
        onClose = { /* TODO batch suivant : clôture transactionnelle */ },
    )
}

@Composable
private fun BandSummaryRoute(nav: NavHostController) {
    PlaceholderScreen("Bilan de bande", "Écran 29 — clôture requise")
}

// ── Routes Batch 04/05/06 ───────────────────────────────────────────────

private fun farmArg(nav: NavHostController): String? =
    savedStateHandleOf(nav).get<String>("farmId") ?: Session.selectedFarmId

@Composable
private fun MoreRoute(nav: NavHostController) {
    val farmId = Session.selectedFarmId
    val farm by ServiceLocator.database.farmDao().let { dao ->
        if (farmId != null) dao.observeById(farmId).collectAsStateWithLifecycle(initialValue = null) else mutableStateOf<com.poufa.app.data.local.FarmEntity?>(null)
    }
    var unread by remember { mutableStateOf(0) }
    val user by produceState<String?>(initialValue = null) {
        value = runCatching { com.clerk.api.Clerk.userFlow.first()?.fullName }.getOrNull()
    }
    MoreScreen(
        userName = user?.substringBefore(" ")?.ifBlank { null } ?: user,
        userRole = "Responsable",
        farmName = farm?.name,
        unreadNotifications = unread,
        onProfile = { nav.navigate("profile") },
        onNavigate = { route ->
            val fid = Session.selectedFarmId ?: return@MoreScreen
            when (route) {
                "bandes" -> nav.navigate("bandes")
                "lots" -> nav.navigate("farm/$fid/lots")
                "sante" -> nav.navigate("farm/$fid/sante")
                "traitements" -> ServiceLocator.database.bandDao().observeActiveForFarm(fid).first()?.let { nav.navigate("band/${it.id}/treatments") }
                "stock_medical" -> nav.navigate("farm/$fid/medical")
                "ma_ferme" -> nav.navigate("farm/$fid/ma-ferme")
                "equipe" -> nav.navigate("farm/$fid/equipe")
                "contacts" -> nav.navigate("farm/$fid/contacts")
                "notifications" -> nav.navigate("notifications")
                "rappels" -> nav.navigate("rappels")
                "sync" -> nav.navigate("sync")
                "parametres" -> nav.navigate("parametres")
                "aide" -> nav.navigate("aide")
            }
        },
    )
}

@Composable
private fun ProfileRoute(nav: NavHostController) {
    val farmId = Session.selectedFarmId
    val farm by ServiceLocator.database.farmDao().let { dao ->
        if (farmId != null) dao.observeById(farmId).collectAsStateWithLifecycle(initialValue = null) else mutableStateOf<com.poufa.app.data.local.FarmEntity?>(null)
    }
    val user by produceState<com.clerk.api.models.User?>(initialValue = null) {
        value = runCatching { com.clerk.api.Clerk.userFlow.first() }.getOrNull()
    }
    MyProfileScreen(
        displayName = user?.firstName ?: user?.fullName,
        phone = user?.primaryPhoneNumber?.phoneNumber,
        role = "Responsable de ferme",
        farmName = farm?.name,
        onBack = { nav.popBackStack() },
        onSave = { /* TODO: PATCH /api/v1/me/profile via FastAPI */ },
        onLogout = {
            kotlinx.coroutines.MainScope().launch {
                runCatching { com.clerk.api.Clerk.auth.signOut() }
            }
        },
    )
}

@Composable
private fun ContactsRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val farm by ServiceLocator.database.farmDao().observeById(farmId).collectAsStateWithLifecycle(initialValue = null)
    val roomContacts by ServiceLocator.database.contactDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    val contacts = if (roomContacts.isEmpty()) listOf(
        ContactRow("Services vétérinaires", null, null, Icons.Outlined.MedicalServices),
        ContactRow("Technicien d'encadrement", null, null, Icons.Outlined.Person),
        ContactRow("Couvoir partenaire", null, null, Icons.Outlined.Egg),
        ContactRow("Abattoir partenaire", null, null, Icons.Outlined.LocalShipping),
        ContactRow("Provenderie partenaire", null, null, Icons.Outlined.Inventory2),
    ) else roomContacts.map {
        ContactRow(it.name, it.detail, it.phone, when (it.category) {
            "veterinary" -> Icons.Outlined.MedicalServices; "technician" -> Icons.Outlined.Person
            "hatchery" -> Icons.Outlined.Egg; "slaughterhouse" -> Icons.Outlined.LocalShipping
            else -> Icons.Outlined.Inventory2
        })
    }
    UsefulContactsScreen(
        farmLabel = farm?.name ?: "",
        contacts = contacts,
        onBack = { nav.popBackStack() },
        onCall = { phone ->
            runCatching {
                nav.context.startActivity(android.content.Intent(android.content.Intent.ACTION_DIAL, android.net.Uri.parse("tel:$phone")))
            }
        },
    )
}

@Composable
private fun LotsRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val farm by ServiceLocator.database.farmDao().observeById(farmId).collectAsStateWithLifecycle(initialValue = null)
    val lots by ServiceLocator.database.lotDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    var query by remember { mutableStateOf("") }
    val recent = remember { mutableStateListOf<String>() }
    LotsScreen(
        farmLabel = farm?.name ?: "",
        lots = lots.map { LotRowData(it.id, it.displayCode ?: it.provisionalCode ?: "Lot", "Bande · ${it.quantity} animaux", !it.isProvisional) },
        query = query, onQueryChange = { query = it },
        onScan = { nav.navigate("farm/$farmId/lots/lookup") },
        onOpenLot = { id -> nav.navigate("lots/$id/label") },
        onNewTransfer = { nav.navigate("farm/$farmId/transfer/new") },
        onBack = { nav.popBackStack() },
    )
}

@Composable
private fun LotLookupRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val recent = remember { mutableStateListOf<String>() }
    LotLookupScreen(
        recentSearches = recent.toList(),
        onBack = { nav.popBackStack() },
        onSearch = { code ->
            recent.add(0, code); if (recent.size > 5) recent.removeAt(recent.lastIndex)
            nav.navigate("farm/$farmId/lots/result?code=${java.net.URLEncoder.encode(code, "UTF-8")}")
        },
        onScan = { /* CameraX — batch runtime */ },
        onRecent = { code -> nav.navigate("farm/$farmId/lots/result?code=${java.net.URLEncoder.encode(code, "UTF-8")}") },
    )
}

@Composable
private fun LotResultRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val code = nav.currentBackStackEntry?.arguments?.getString("code") ?: ""
    var result by remember { mutableStateOf<com.poufa.app.data.local.LotEntity?>(null) }
    var searched by remember { mutableStateOf(false) }
    LaunchedEffect(code) {
        result = ServiceLocator.database.lotDao().findByCode(code)
        searched = true
    }
    val band by ServiceLocator.database.bandDao().let { dao ->
        result?.let { dao.observeById(it.bandId).collectAsStateWithLifecycle(initialValue = null) }
            ?: mutableStateOf<com.poufa.app.data.local.BandEntity?>(null)
    }
    LotSearchResultScreen(
        query = code, found = result != null, offline = false,
        lotCode = result?.displayCode ?: result?.provisionalCode,
        bandLabel = band?.displayCode,
        qty = result?.quantity, recipient = result?.recipient,
        dateLabel = result?.transferDate?.let { java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.FRANCE).format(java.util.Date(it)) },
        recentSearches = emptyList(),
        onBack = { nav.popBackStack() },
        onOpenLot = { result?.let { nav.navigate("lots/${it.id}/label") } },
        onRecent = {},
    )
}

@Composable
private fun TransferWizardRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val scope = rememberCoroutineScope()
    val bands by ServiceLocator.database.bandDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    val activeBands = bands.filter { it.status == "active" }
    var bandId by remember { mutableStateOf<String?>(null) }
    var qty by remember { mutableStateOf("") }
    var recipient by remember { mutableStateOf("") }
    var step by remember { mutableIntStateOf(1) }

    if (step == 1) {
        CreateTransferStepOneScreen(
            farmLabel = "", bands = activeBands.map { it.id to (it.displayCode ?: "Bande") },
            recipients = listOf("Abattoir partenaire", "Autoconsommation", "Autre"),
            bandId = bandId, qty = qty, recipient = recipient,
            onBand = { bandId = it }, onQty = { qty = it }, onRecipient = { recipient = it },
            onBack = { nav.popBackStack() }, onContinue = { step = 2 },
        )
    } else {
        val band = activeBands.firstOrNull { it.id == bandId }
        val pop by ServiceLocator.dailyRepository.observePopulation(bandId ?: "").collectAsStateWithLifecycle(initialValue = null)
        CreateTransferReviewScreen(
            bandLabel = band?.displayCode ?: "Bande", qty = qty.toIntOrNull() ?: 0,
            recipient = recipient, provisionalCode = "LOT-${System.currentTimeMillis() % 10000}",
            onBack = { step = 1 },
            onSave = {
                scope.launch {
                    band?.let {
                        ServiceLocator.productionRepository.registerExit(
                            farmId = farmId, bandId = it.id, exitType = "cession",
                            quantity = qty.toIntOrNull() ?: 0, recipient = recipient,
                            date = System.currentTimeMillis(), authorId = Session.userId,
                        )
                        com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context())
                    }
                    nav.popBackStack()
                }
            },
            onModify = { step = 1 },
        )
    }
}

@Composable
private fun MyFarmRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val farm by ServiceLocator.database.farmDao().observeById(farmId).collectAsStateWithLifecycle(initialValue = null)
    val buildings by ServiceLocator.database.buildingDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    val band by ServiceLocator.database.bandDao().observeActiveForFarm(farmId).collectAsStateWithLifecycle(initialValue = null)
    MyFarmScreen(
        farmName = farm?.name ?: "", locality = farm?.locality ?: "", farmType = farm?.farmingType ?: "",
        ownerName = "Responsable", lotPrefix = "LP",
        activeBandLabel = band?.displayCode, buildingsSummary = "${buildings.size} bâtiments",
        teamCount = 0,
        onBack = { nav.popBackStack() },
        onBuildings = { nav.navigate("farm/$farmId/buildings") },
        onTeam = { nav.navigate("farm/$farmId/equipe") },
        onEdit = { /* TODO: formulaire modification ferme */ },
    )
}

@Composable
private fun TeamRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val farm by ServiceLocator.database.farmDao().observeById(farmId).collectAsStateWithLifecycle(initialValue = null)
    val members by ServiceLocator.database.farmMemberDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    FarmTeamScreen(
        farmName = farm?.name ?: "",
        members = if (members.isEmpty()) listOf(TeamMember("Vous", "Responsable", "Toutes les actions", "Responsable"))
        else members.map { TeamMember(it.displayName + if (it.userId == Session.userId) " (vous)" else "", it.role, it.permissions ?: "", if (it.status == "pending") "En attente" else it.role.replaceFirstChar { c -> c.uppercase() }) },
        onBack = { nav.popBackStack() }, onInvite = { /* TODO: invitation Clerk/FastAPI */ },
    )
}

@Composable
private fun BuildingsRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val farm by ServiceLocator.database.farmDao().observeById(farmId).collectAsStateWithLifecycle(initialValue = null)
    val buildings by ServiceLocator.database.buildingDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    val bands by ServiceLocator.database.bandDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    BuildingsScreen(
        farmLabel = farm?.name ?: "",
        buildings = buildings.map { b ->
            val occ = bands.firstOrNull { it.id == b.flockId }
            BuildingRowData(b.id, b.name, b.capacity ?: 0, occ?.displayCode, null)
        },
        onBack = { nav.popBackStack() }, onAdd = { /* TODO: création bâtiment */ },
    )
}

@Composable
private fun MedicalRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val farm by ServiceLocator.database.farmDao().observeById(farmId).collectAsStateWithLifecycle(initialValue = null)
    val products by ServiceLocator.database.inventoryDao().observeProducts(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    MedicalInventoryScreen(
        farmLabel = farm?.name ?: "", products = products.filter { it.category != "feed" },
        onBack = { nav.popBackStack() }, onNewReceipt = { nav.navigate("farm/$farmId/receipts/new") },
    )
}

@Composable
private fun HealthListRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val farm by ServiceLocator.database.farmDao().observeById(farmId).collectAsStateWithLifecycle(initialValue = null)
    val decls by ServiceLocator.database.healthDeclarationDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    val bands by ServiceLocator.database.bandDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    HealthDeclarationsScreen(
        farmLabel = farm?.name ?: "", declarations = decls,
        bandLabel = { bid -> bands.firstOrNull { it.id == bid }?.displayCode ?: bid.take(4) },
        onBack = { nav.popBackStack() }, onNew = { nav.navigate("farm/$farmId/sante/new") },
        onOpen = { id -> nav.navigate("health/$id") },
    )
}

@Composable
private fun HealthFormRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val band by ServiceLocator.database.bandDao().observeActiveForFarm(farmId).collectAsStateWithLifecycle(initialValue = null)
    val b = band ?: run { nav.popBackStack(); return }
    val pop by ServiceLocator.dailyRepository.observePopulation(b.id).collectAsStateWithLifecycle(initialValue = null)
    var photoCount by remember { mutableIntStateOf(0) }
    val pendingPhotos = remember { mutableStateListOf<Pair<String, Long>>() }
    val photoPicker = androidx.activity.compose.rememberLauncherForActivityResult(
        androidx.activity.result.contract.ActivityResultContracts.GetContent(),
    ) { uri ->
        if (uri != null) {
            val id = java.util.UUID.randomUUID().toString()
            com.poufa.app.data.PhotoStore.persist(nav.context, uri, id)?.let { (path, size) ->
                pendingPhotos.add(path to size); photoCount++
            }
        }
    }
    HealthDeclarationFormScreen(
        bandLabel = b.displayCode ?: "Bande", population = pop, photoCount = photoCount,
        onBack = { nav.popBackStack() },
        onSave = { type, signs, affected, notes, photos ->
            kotlinx.coroutines.MainScope().launch {
                val decl = ServiceLocator.productionRepository.saveHealthDeclaration(
                    farmId = farmId, bandId = b.id, problemType = type, signs = signs,
                    affectedCount = affected, notes = notes, photoCount = photos,
                    authorId = Session.userId,
                )
                // Lier les fichiers privés aux enregistrements Room
                pendingPhotos.forEach { (path, size) ->
                    ServiceLocator.database.healthAttachmentDao().insertAll(listOf(
                        com.poufa.app.data.local.HealthAttachmentEntity(
                            id = java.util.UUID.randomUUID().toString(), declarationId = decl.id,
                            filePath = path, mimeType = "image/jpeg", fileSize = size,
                            uploadStatus = "pending", createdAt = System.currentTimeMillis(),
                        )))
                }
                com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context())
                nav.popBackStack()
            }
        },
        onAddPhoto = { photoPicker.launch("image/*") },
    )
}

@Composable
private fun HealthDetailRoute(nav: NavHostController) {
    val declId = savedStateHandleOf(nav).get<String>("declarationId") ?: return
    val decl by ServiceLocator.database.healthDeclarationDao().observeById(declId).collectAsStateWithLifecycle(initialValue = null)
    val band by ServiceLocator.database.bandDao().let { dao ->
        decl?.let { dao.observeById(it.bandId).collectAsStateWithLifecycle(initialValue = null) }
            ?: mutableStateOf<com.poufa.app.data.local.BandEntity?>(null)
    }
    val d = decl ?: return
    val statusLabels = mapOf("local" to "En attente d'envoi", "pending" to "En attente d'envoi", "submitted" to "Transmis", "review" to "En analyse", "closed" to "Clôturé")
    val typeLabels = mapOf("signes_inhabituels" to "Signes inhabituels", "mortalite_anormale" to "Mortalité anormale", "croissance_anormale" to "Croissance anormale", "eau_alimentation" to "Eau/alimentation", "autre" to "Autre")
    HealthDeclarationDetailScreen(
        problemLabel = typeLabels[d.problemType] ?: d.problemType,
        bandLabel = band?.displayCode ?: "",
        statusLabel = statusLabels[d.status] ?: d.status,
        statusIsPending = d.status in listOf("local", "pending"),
        eventDate = java.text.SimpleDateFormat("dd MMM yyyy", java.util.Locale.FRANCE).format(java.util.Date(d.eventDate)),
        affected = d.affectedCount, signs = d.signs, photoCount = 0,
        timeline = listOf(
            Triple("Signalement enregistré", "local", true),
            Triple("Transmis aux services vétérinaires", if (d.status in listOf("submitted","review","closed")) "serveur" else "En attente", d.status in listOf("submitted","review","closed")),
            Triple("Réponse des services vétérinaires", "En attente", d.status == "closed"),
        ),
        onBack = { nav.popBackStack() }, onAddInfo = { /* TODO: suivi additionnel */ },
    )
}

@Composable
private fun NewReceiptRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    CreateReceiptScreen(
        onBack = { nav.popBackStack() },
        onSave = { type, product, qty, unit, supplier, date ->
            kotlinx.coroutines.MainScope().launch {
                ServiceLocator.productionRepository.createReceipt(farmId, product, qty, unit, supplier, date, Session.userId)
                com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context())
                nav.popBackStack()
            }
        },
    )
}

@Composable
private fun StockRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val farm by ServiceLocator.database.farmDao().observeById(farmId).collectAsStateWithLifecycle(initialValue = null)
    val products by ServiceLocator.database.inventoryDao().observeProducts(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    val movements by ServiceLocator.database.inventoryDao().observeMovements(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    var selected by remember { mutableStateOf<com.poufa.app.data.local.InventoryProductEntity?>(null) }
    val p = selected
    if (p == null) {
        Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
            IconButton(onClick = { nav.popBackStack() }) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
            Text("Stock", fontSize = 26.sp, fontWeight = FontWeight.Bold)
            Text(farm?.name ?: "", fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Spacer(Modifier.height(16.dp))
            products.forEach { prod ->
                PoufaCard { PoufaListRow(prod.name, "${prod.unit} · ${prod.category ?: ""}", onClick = { selected = prod }) }
                Spacer(Modifier.height(8.dp))
            }
        }
    } else {
        val prodMovements = movements.filter { it.productId == p.id }
        val stock = prodMovements.sumOf { it.quantity }
        FeedStockDetailScreen(
            productName = p.name, farmLabel = farm?.name ?: "",
            availableQty = stock, unit = p.unit, daysLeft = null,
            movements = prodMovements.take(10).map { m ->
                Triple(m.movementType, m.quantity, java.text.SimpleDateFormat("dd/MM", java.util.Locale.FRANCE).format(java.util.Date(m.movementDate)))
            },
            onBack = { selected = null }, onRecordUsage = { nav.navigate("farm/$farmId/usage?product=${p.id}") },
        )
    }
}

@Composable
private fun UsageRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val productId = nav.currentBackStackEntry?.arguments?.getString("product")
    val products by ServiceLocator.database.inventoryDao().observeProducts(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    val movements by ServiceLocator.database.inventoryDao().observeMovements(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    val band by ServiceLocator.database.bandDao().observeActiveForFarm(farmId).collectAsStateWithLifecycle(initialValue = null)
    val p = products.firstOrNull { it.id == productId } ?: products.firstOrNull() ?: run { nav.popBackStack(); return }
    val stock = movements.filter { it.productId == p.id }.sumOf { it.quantity }
    RecordUsageScreen(
        productName = p.name, availableStock = "${"%.1f".format(stock)} ${p.unit}",
        bandLabel = band?.displayCode ?: "—",
        onBack = { nav.popBackStack() },
        onSave = { qty ->
            kotlinx.coroutines.MainScope().launch {
                ServiceLocator.productionRepository.recordUsage(farmId, p.id, band?.id, qty, p.unit, System.currentTimeMillis(), Session.userId)
                com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context())
                nav.popBackStack()
            }
        },
    )
}

@Composable
private fun LabelRoute(nav: NavHostController) {
    val lotId = savedStateHandleOf(nav).get<String>("lotId") ?: return
    val lot by ServiceLocator.database.lotDao().observeById(lotId).collectAsStateWithLifecycle(initialValue = null)
    val farm by ServiceLocator.database.farmDao().let { dao ->
        lot?.let { dao.observeById(it.farmId).collectAsStateWithLifecycle(initialValue = null) }
            ?: mutableStateOf<com.poufa.app.data.local.FarmEntity?>(null)
    }
    val band by ServiceLocator.database.bandDao().let { dao ->
        lot?.let { dao.observeById(it.bandId).collectAsStateWithLifecycle(initialValue = null) }
            ?: mutableStateOf<com.poufa.app.data.local.BandEntity?>(null)
    }
    val l = lot ?: return
    LotLabelPreviewScreen(
        lotCode = l.displayCode ?: l.provisionalCode ?: "Lot", isProvisional = l.isProvisional,
        farmName = farm?.name ?: "", bandLabel = band?.displayCode ?: "",
        qty = l.quantity,
        dateLabel = java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.FRANCE).format(java.util.Date(l.transferDate)),
        onBack = { nav.popBackStack() },
        onPrint = { /* TODO: Android Print Framework */ },
        onPdf = {
            runCatching {
                val f = com.poufa.app.data.PdfExport.generateLotLabel(
                    nav.context, l.displayCode ?: l.provisionalCode ?: "lot",
                    farm?.name ?: "", band?.displayCode ?: "", l.quantity,
                    java.text.SimpleDateFormat("dd/MM/yyyy", java.util.Locale.FRANCE).format(java.util.Date(l.transferDate)),
                    1, true,
                )
                val uri = androidx.core.content.FileProvider.getUriForFile(nav.context, "${nav.context.packageName}.fileprovider", f)
                nav.context.startActivity(android.content.Intent(android.content.Intent.ACTION_SEND).apply {
                    type = "application/pdf"; putExtra(android.content.Intent.EXTRA_STREAM, uri); addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
                })
            }
        },
    )
}

@Composable
private fun BandWizardRoute(nav: NavHostController) {
    val farmId = farmArg(nav) ?: return
    val scope = rememberCoroutineScope()
    val farm by ServiceLocator.database.farmDao().observeById(farmId).collectAsStateWithLifecycle(initialValue = null)
    val buildings by ServiceLocator.database.buildingDao().observeForFarm(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    val products by ServiceLocator.database.inventoryDao().observeProducts(farmId).collectAsStateWithLifecycle(initialValue = emptyList())
    var step by remember { mutableIntStateOf(1) }
    var chicks by remember { mutableStateOf("") }
    var strain by remember { mutableStateOf<String?>(null) }
    var age by remember { mutableStateOf<Int?>(1) }
    var building by remember { mutableStateOf<String?>(null) }
    var origin by remember { mutableStateOf("") }
    var hatchery by remember { mutableStateOf("") }
    var feed by remember { mutableStateOf<String?>(null) }
    val strains = listOf("Cobb 500" to "Cobb 500", "Ross 308" to "Ross 308", "Hubbard" to "Hubbard")
    val feeds = products.filter { it.category == "feed" }.map { it.name }.ifEmpty { listOf("Aliment démarrage") }
    val bRows = buildings.map { BuildingRowData(it.id, it.name, it.capacity ?: 0, null, null) }

    when (step) {
        1 -> CreateBandStepOneScreen(
            farmLabel = farm?.name ?: "", chickCount = chicks, onChickCount = { chicks = it.filter(Char::isDigit) },
            strains = strains, strainId = strain, onStrain = { strain = it },
            ageDays = age, onAge = { age = it },
            onBack = { nav.popBackStack() }, onContinue = { step = 2 },
        )
        2 -> CreateBandStepTwoScreen(
            farmLabel = farm?.name ?: "", buildings = bRows, buildingId = building, onBuilding = { building = it },
            chickCount = chicks.toIntOrNull() ?: 0, origin = origin, onOrigin = { origin = it },
            hatcheryLot = hatchery, onHatcheryLot = { hatchery = it },
            feeds = feeds, feedId = feed, onFeed = { feed = it },
            onBack = { step = 1 }, onVerify = { step = 3 },
        )
        else -> CreateBandReviewScreen(
            farmLabel = farm?.name ?: "",
            rows = listOf(
                "Date de mise en place" to "Aujourd'hui",
                "Poussins reçus" to (chicks.ifBlank { "0" }),
                "Souche" to (strain ?: "—"),
                "Âge à la réception" to ("${age ?: 1} jour(s)"),
                "Bâtiment" to (buildings.firstOrNull { it.id == building }?.name ?: "—"),
                "Origine" to origin.ifBlank { "—" },
            ),
            provisionalCode = "Bande provisoire",
            onBack = { step = 2 },
            onConfirm = {
                scope.launch {
                    ServiceLocator.productionRepository.createBand(
                        farmId = farmId, buildingId = building,
                        chicks = chicks.toIntOrNull() ?: 0, strainLabel = strain,
                        ageDays = age, origin = origin.ifBlank { null }, hatcheryLot = hatchery.ifBlank { null },
                        feedProductId = feed, authorId = Session.userId,
                    )
                    com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context())
                    nav.popBackStack()
                }
            },
            onModify = { step = 2 },
        )
    }
}

@Composable
private fun BandRecordsRoute(nav: NavHostController) {
    val bandId = savedStateHandleOf(nav).get<String>("bandId") ?: return
    val records by ServiceLocator.database.dailyRecordDao().observeForBand(bandId).collectAsStateWithLifecycle(initialValue = emptyList())
    Column(Modifier.fillMaxSize().padding(horizontal = PoufaPagePadding)) {
        IconButton(onClick = { nav.popBackStack() }) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour") }
        Text("Historique", fontSize = 26.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        if (records.isEmpty()) PoufaEmptyState("Aucune saisie", "Les journées apparaîtront ici.")
        records.forEach { r ->
            PoufaCard {
                PoufaListRow(
                    java.text.SimpleDateFormat("EEEE dd MMMM", java.util.Locale.FRANCE).format(java.util.Date(r.recordDate)),
                    "${r.mortality ?: 0} morts · ${r.feedKg?.let { "%.1f kg".format(it) } ?: "—"}",
                    onClick = { nav.navigate("daily/${r.id}") },
                )
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun DailyDetailRoute(nav: NavHostController) {
    val recordId = savedStateHandleOf(nav).get<String>("recordId") ?: return
    val record by ServiceLocator.database.dailyRecordDao().observeById(recordId).collectAsStateWithLifecycle(initialValue = null)
    val r = record ?: return
    val band by ServiceLocator.database.bandDao().observeById(r.bandId).collectAsStateWithLifecycle(initialValue = null)
    DailyRecordDetailScreen(
        record = DailyRecordRowData(
            id = r.id,
            dateLabel = java.text.SimpleDateFormat("EEEE dd MMMM yyyy", java.util.Locale.FRANCE).format(java.util.Date(r.recordDate)),
            deaths = r.mortality, feedKg = r.feedKg, population = null,
            author = r.authorId, synced = r.status == "synced", observations = r.notes,
        ),
        onBack = { nav.popBackStack() },
        onCorrect = { /* TODO: rouvrir formulaire pré-rempli */ },
        readOnly = band?.status == "closed",
    )
}

@Composable
private fun RemindersRoute(nav: NavHostController) {
    val reminders = mapOf(
        "Saisie du jour" to (true to "Chaque jour à 18:00"),
        "Pesée" to (true to "Tous les 7 jours"),
        "Vaccins et traitements" to (true to "La veille de chaque date prévue"),
        "Réceptions à confirmer" to (true to "Dès qu'une livraison est annoncée"),
        "Stock d'aliment bas" to (false to "Moins de 3 jours de consommation"),
    )
    RemindersScreen(
        reminders = reminders,
        onBack = { nav.popBackStack() },
        onToggle = { /* TODO: DataStore + WorkManager scheduling */ },
    )
}

@Composable
private fun NotificationsRoute(nav: NavHostController) {
    val farmId = Session.selectedFarmId
    val farm by ServiceLocator.database.farmDao().let { dao ->
        if (farmId != null) dao.observeById(farmId).collectAsStateWithLifecycle(initialValue = null) else mutableStateOf<com.poufa.app.data.local.FarmEntity?>(null)
    }
    val notifs by ServiceLocator.database.appNotificationDao()
        .observeForUser(Session.userId ?: "").collectAsStateWithLifecycle(initialValue = emptyList())
    val today = notifs.filter { System.currentTimeMillis() - it.createdAt < 86_400_000 }
    val week = notifs.filter { System.currentTimeMillis() - it.createdAt >= 86_400_000 }
    NotificationsScreen(
        farmName = farm?.name ?: "",
        today = today.map { AppNotification(it.id, it.title, it.message, !it.isRead, it.eventType) },
        week = week.map { AppNotification(it.id, it.title, it.message, !it.isRead, it.eventType) },
        onBack = { nav.popBackStack() },
        onOpen = { id -> runCatching { ServiceLocator.database.appNotificationDao().markRead(id) } },
    )
}

@Composable
private fun SyncRoute(nav: NavHostController) {
    val farmId = Session.selectedFarmId
    val farm by ServiceLocator.database.farmDao().let { dao ->
        if (farmId != null) dao.observeById(farmId).collectAsStateWithLifecycle(initialValue = null) else mutableStateOf<com.poufa.app.data.local.FarmEntity?>(null)
    }
    val pending by ServiceLocator.database.pendingOperationDao().observeAllPending()
        .collectAsStateWithLifecycle(initialValue = emptyList())
    val wifiOnly by ServiceLocator.settings.wifiOnlySync.collectAsStateWithLifecycle(initialValue = false)
    val scope = rememberCoroutineScope()
    val netState by ServiceLocator.connectivity.state.collectAsStateWithLifecycle()
    val dbFile = remember { nav.context.getDatabasePath("poufa.db") }
    val storageMb = remember { (dbFile?.length() ?: 0) / 1_048_576 }
    val photosDir = remember { java.io.File(nav.context.filesDir, "photos") }
    val photosMb = remember { (photosDir.walkTopDown().filter { it.isFile }.sumOf { it.length() }) / 1_048_576 }
    val lastSync by ServiceLocator.database.syncCursorDao().observe(Session.userId ?: "")
        .collectAsStateWithLifecycle(initialValue = null)
    DataSynchronizationScreen(
        farmName = farm?.name ?: "",
        isOnline = netState == com.poufa.app.data.NetState.ONLINE,
        lastSyncLabel = lastSync?.lastConfirmedSyncAt?.let { java.text.SimpleDateFormat("dd/MM à HH:mm", java.util.Locale.FRANCE).format(java.util.Date(it)) } ?: "Jamais",
        pending = pending.map { PendingOpRow(it.entityType, it.entityId.take(8)) },
        wifiOnly = wifiOnly, storageLabel = "${storageMb + photosMb} Mo",
        onBack = { nav.popBackStack() },
        onWifiOnly = { scope.launch { ServiceLocator.settings.setWifiOnlySync(it) } },
        onSyncNow = { com.poufa.app.sync.SyncWorker.schedule(ServiceLocator.context()) },
    )
}

@Composable
private fun SettingsRoute(nav: NavHostController) {
    val scope = rememberCoroutineScope()
    val textScale by produceState("normal") {
        value = ServiceLocator.settings.getTextScale() ?: "normal"
    }
    SettingsScreen(
        textScale = textScale, language = "Français", weightUnit = "Kilogrammes (kg)",
        dateFormat = "Jour/mois/année", appVersion = "1.0.0",
        onBack = { nav.popBackStack() },
        onTextScale = { scope.launch { ServiceLocator.settings.setTextScale(it) } },
    )
}

@Composable
private fun HelpRoute(nav: NavHostController) {
    val faqs = listOf(
        FaqItem("Comment saisir les données du jour ?", "Ouvrez votre bande, touchez « Saisir les données du jour », indiquez les mortalités et l'aliment donné, puis enregistrez. Le calcul de l'effectif est automatique."),
        FaqItem("Que faire si je n'ai pas de réseau ?", "Toutes les saisies sont conservées sur le téléphone et envoyées automatiquement au retour du réseau."),
        FaqItem("Comment corriger une saisie ?", "Ouvrez le détail de la journée depuis l'historique de la bande, puis « Corriger la journée ». La correction est tracée."),
        FaqItem("À quoi sert le QR code d'un lot ?", "Il permet de retrouver la fiche du lot de cession pour la traçabilité. Ce n'est pas un certificat sanitaire."),
        FaqItem("Comment signaler un problème sanitaire ?", "Dans Plus → Signalements sanitaires → Nouveau signalement. Décrivez les signes observés et joignez des photos si possible."),
    )
    HelpScreen(
        faqs = faqs,
        onBack = { nav.popBackStack() },
        onContacts = { Session.selectedFarmId?.let { nav.navigate("farm/$it/contacts") } },
    )
}

/** Helper : SavedStateHandle depuis la nav entry courante (non-composable). */
private fun savedStateHandleOf(nav: NavHostController, vararg extras: Pair<String, String>): androidx.lifecycle.SavedStateHandle {
    val args = nav.currentBackStackEntry?.arguments
    return androidx.lifecycle.SavedStateHandle().apply {
        extras.forEach { (k, v) -> set(k, v) }
        args?.keySet()?.forEach { k -> args.getString(k)?.let { set(k, it) } }
    }
}

@Composable
private fun PlaceholderScreen(title: String, ref: String) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(title, fontSize = 22.sp, fontWeight = FontWeight.SemiBold)
        Text(ref, fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(top = 8.dp))
    }
}
