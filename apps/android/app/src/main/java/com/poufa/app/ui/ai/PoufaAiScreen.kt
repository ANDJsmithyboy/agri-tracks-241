package com.poufa.app.ui.ai

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.poufa.app.data.NetState
import com.poufa.app.data.remote.AiConversationDto
import com.poufa.app.di.ServiceLocator
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.util.UUID

data class NativeChatMessage(
    val id: String,
    val role: String,
    val content: String,
    val status: String = "complete",
)

private val SUGGESTED_PROMPTS = listOf(
    "Analyser ma bande" to "Résume ma bande en cours avec l'effectif placé, les mortalités, les sorties et l'effectif actuel présent.",
    "Vérifier mes stocks" to "Quelles sont mes réceptions d'intrants récentes et l'aliment distribué sur ma bande ?",
    "Comprendre mes indicateurs" to "Quel est mon taux de mortalité, ma viabilité et la dernière pesée enregistrée ?",
    "Consulter mes signalements" to "Quels signalements sanitaires et quels lots de traçabilité sont enregistrés sur mon exploitation ?",
)

enum class HistoryGroup(val label: String) {
    TODAY("Aujourd'hui"),
    YESTERDAY("Hier"),
    LAST_7_DAYS("7 derniers jours"),
    LAST_30_DAYS("30 derniers jours"),
    OLDER("Plus anciennes"),
}

private fun groupConversations(conversations: List<AiConversationDto>): Map<HistoryGroup, List<AiConversationDto>> {
    val now = ZonedDateTime.now(ZoneId.systemDefault()).toLocalDate()
    val grouped = mutableMapOf<HistoryGroup, MutableList<AiConversationDto>>()
    for (group in HistoryGroup.entries) {
        grouped[group] = mutableListOf()
    }

    for (conv in conversations) {
        val dateStr = conv.updatedAt ?: conv.createdAt
        val group = if (dateStr.isNullOrBlank()) {
            HistoryGroup.OLDER
        } else {
            try {
                val itemDate = OffsetDateTime.parse(dateStr).atZoneSameInstant(ZoneId.systemDefault()).toLocalDate()
                val daysDiff = ChronoUnit.DAYS.between(itemDate, now)
                when {
                    daysDiff <= 0 -> HistoryGroup.TODAY
                    daysDiff == 1L -> HistoryGroup.YESTERDAY
                    daysDiff in 2..7 -> HistoryGroup.LAST_7_DAYS
                    daysDiff in 8..30 -> HistoryGroup.LAST_30_DAYS
                    else -> HistoryGroup.OLDER
                }
            } catch (e: Exception) {
                HistoryGroup.OLDER
            }
        }
        grouped[group]?.add(conv)
    }
    return grouped.filterValues { it.isNotEmpty() }
}

/**
 * Espace conversationnel natif POUFA AI — Finition premium Apple / Claude / Luma.
 * Tiroir latéral ModalNavigationDrawer, synchronisation Neon via FastAPI,
 * gestion dynamique du clavier, typographie calme et double palette Royal Cream / Obsidian Neon.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PoufaAiScreen(
    farmId: String?,
    farmLabel: String?,
    onBack: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val clipboard = LocalClipboardManager.current
    val netState by ServiceLocator.connectivity.state.collectAsStateWithLifecycle()
    val isOnline = netState == NetState.ONLINE

    var conversations by remember { mutableStateOf<List<AiConversationDto>>(emptyList()) }
    var activeConversationId by remember { mutableStateOf<String?>(null) }
    var messages by remember { mutableStateOf<List<NativeChatMessage>>(emptyList()) }
    var input by remember { mutableStateOf("") }
    var isStreaming by remember { mutableStateOf(false) }
    var isLoadingHistory by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var streamingJob by remember { mutableStateOf<Job?>(null) }
    var copyNotice by remember { mutableStateOf<String?>(null) }

    // État du tiroir et recherche
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    var searchQuery by remember { mutableStateOf("") }

    // Dialogues de gestion (renommer & supprimer)
    var renamingConv by remember { mutableStateOf<AiConversationDto?>(null) }
    var renameInput by remember { mutableStateOf("") }
    var deletingConv by remember { mutableStateOf<AiConversationDto?>(null) }

    val listState = rememberLazyListState()
    val configuration = LocalConfiguration.current
    val isTablet = configuration.screenWidthDp >= 840

    fun refreshConversations() {
        scope.launch {
            isLoadingHistory = true
            runCatching { ServiceLocator.api.listAiConversations() }
                .onSuccess { conversations = it.conversations }
                .onFailure {
                    // Conserve les conversations actuelles en cache si hors ligne
                }
            isLoadingHistory = false
        }
    }

    LaunchedEffect(Unit) {
        refreshConversations()
    }

    // Défilement automatique lors des réponses de l'IA (seulement si l'utilisateur est déjà en bas)
    LaunchedEffect(messages.size, messages.lastOrNull()?.content) {
        if (messages.isNotEmpty()) {
            val shouldScroll = !listState.isScrollInProgress || listState.firstVisibleItemIndex >= (messages.size - 3).coerceAtLeast(0)
            if (shouldScroll) {
                runCatching { listState.animateScrollToItem(messages.lastIndex) }
            }
        }
    }

    fun selectConversation(convId: String) {
        if (activeConversationId == convId) return
        streamingJob?.cancel()
        isStreaming = false
        activeConversationId = convId
        errorMessage = null
        scope.launch {
            runCatching { ServiceLocator.api.getAiConversation(convId) }
                .onSuccess { detail ->
                    messages = detail.messages.map {
                        NativeChatMessage(it.id, it.role, it.content, it.status)
                    }
                }
                .onFailure { exc ->
                    errorMessage = "Impossible de charger la conversation : ${exc.message}"
                }
        }
    }

    fun startNewConversation() {
        streamingJob?.cancel()
        isStreaming = false
        activeConversationId = null
        messages = emptyList()
        errorMessage = null
        input = ""
    }

    fun sendMessage(rawText: String) {
        val text = rawText.trim()
        if (text.isEmpty() || isStreaming) return
        if (!isOnline) {
            errorMessage = "Hors connexion — votre question est conservée. Reconnectez-vous pour interroger POUFA AI."
            return
        }

        input = ""
        errorMessage = null

        val convId = activeConversationId ?: UUID.randomUUID().toString().also {
            activeConversationId = it
        }
        val userMsgId = UUID.randomUUID().toString()
        val assistantMsgId = UUID.randomUUID().toString()

        messages = messages +
            NativeChatMessage(id = userMsgId, role = "user", content = text, status = "complete") +
            NativeChatMessage(id = assistantMsgId, role = "assistant", content = "", status = "streaming")

        isStreaming = true
        streamingJob = scope.launch {
            try {
                ServiceLocator.api.streamAiMessage(
                    conversationId = convId,
                    content = text,
                    farmId = farmId,
                    onDelta = { delta ->
                        messages = messages.map { m ->
                            if (m.id == assistantMsgId) m.copy(content = m.content + delta) else m
                        }
                    },
                )
                messages = messages.map { m ->
                    if (m.id == assistantMsgId) m.copy(status = "complete") else m
                }
                refreshConversations()
            } catch (e: kotlinx.coroutines.CancellationException) {
                messages = messages.map { m ->
                    if (m.id == assistantMsgId) {
                        m.copy(
                            content = m.content.ifBlank { "Génération interrompue par l'utilisateur." },
                            status = "complete",
                        )
                    } else m
                }
            } catch (e: Exception) {
                errorMessage = e.message ?: "Impossible de joindre POUFA AI."
                messages = messages.map { m ->
                    if (m.id == assistantMsgId) {
                        m.copy(
                            content = m.content.ifBlank { "La réponse n'a pas pu être générée." },
                            status = "error",
                        )
                    } else m
                }
            } finally {
                isStreaming = false
                streamingJob = null
            }
        }
    }

    // Filtrage dynamique des conversations par titre
    val filteredConversations = remember(conversations, searchQuery) {
        if (searchQuery.isBlank()) conversations
        else conversations.filter { it.title.contains(searchQuery.trim(), ignoreCase = true) }
    }
    val groupedConversations = remember(filteredConversations) {
        groupConversations(filteredConversations)
    }

    // Contenu composable du Sidebar
    val sidebarContent: @Composable () -> Unit = {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .statusBarsPadding()
                .navigationBarsPadding(),
        ) {
            // ── En-tête du tiroir ────────────────────────────────────────────
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    PoufaEmblem(size = 28.dp)
                    Spacer(Modifier.width(10.dp))
                    Text(
                        text = "POUFA AI",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        letterSpacing = 0.5.sp,
                    )
                }

                // Bouton Nouvelle conversation
                IconButton(
                    onClick = {
                        startNewConversation()
                        if (!isTablet) scope.launch { drawerState.close() }
                    },
                ) {
                    Icon(
                        imageVector = Icons.Filled.Add,
                        contentDescription = "Nouvelle discussion",
                        tint = MaterialTheme.colorScheme.primary,
                    )
                }
            }

            // Bouton pleine largeur "Nouvelle discussion"
            Surface(
                onClick = {
                    startNewConversation()
                    if (!isTablet) scope.launch { drawerState.close() }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 4.dp),
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surface,
                border = androidx.compose.foundation.BorderStroke(
                    1.dp,
                    MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f),
                ),
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        imageVector = Icons.Filled.Add,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(Modifier.width(10.dp))
                    Text(
                        text = "Nouvelle discussion",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface,
                    )
                }
            }

            // Champ de recherche des conversations
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Rechercher…", fontSize = 13.sp) },
                leadingIcon = {
                    Icon(
                        Icons.Filled.Search,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Filled.Clear, contentDescription = "Effacer", modifier = Modifier.size(16.dp))
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f),
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 8.dp)
                    .height(50.dp),
            )

            // Séparateur ultra fin
            HorizontalDivider(
                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f),
                thickness = 1.dp,
                modifier = Modifier.padding(vertical = 4.dp),
            )

            // ── Liste d'historique défilable par groupes temporels ───────────
            Box(Modifier.weight(1f).fillMaxWidth()) {
                if (conversations.isEmpty() && !isLoadingHistory) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.ChatBubbleOutline,
                            contentDescription = null,
                            modifier = Modifier.size(36.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f),
                        )
                        Spacer(Modifier.height(10.dp))
                        Text(
                            text = "Aucune conversation",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = "Vos échanges avec POUFA AI apparaîtront ici.",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                        )
                    }
                } else if (filteredConversations.isEmpty() && searchQuery.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(20.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = "Aucune conversation ne correspond à \"$searchQuery\"",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                    ) {
                        groupedConversations.forEach { (group, convList) ->
                            item(key = "header_${group.name}") {
                                Text(
                                    text = group.label.uppercase(),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 0.8.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                )
                            }
                            items(convList, key = { it.id }) { conv ->
                                val isSelected = conv.id == activeConversationId
                                var showMenu by remember { mutableStateOf(false) }

                                Surface(
                                    onClick = {
                                        selectConversation(conv.id)
                                        if (!isTablet) scope.launch { drawerState.close() }
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    color = if (isSelected) MaterialTheme.colorScheme.surfaceContainerHigh else Color.Transparent,
                                    border = if (isSelected) androidx.compose.foundation.BorderStroke(
                                        1.dp,
                                        MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.7f),
                                    ) else null,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 2.dp),
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(horizontal = 12.dp, vertical = 10.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Text(
                                            text = conv.title,
                                            fontSize = 13.sp,
                                            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
                                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis,
                                            modifier = Modifier.weight(1f),
                                        )

                                        Box {
                                            IconButton(
                                                onClick = { showMenu = true },
                                                modifier = Modifier.size(28.dp),
                                            ) {
                                                Icon(
                                                    Icons.Filled.MoreVert,
                                                    contentDescription = "Options",
                                                    modifier = Modifier.size(16.dp),
                                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                )
                                            }
                                            DropdownMenu(
                                                expanded = showMenu,
                                                onDismissRequest = { showMenu = false },
                                            ) {
                                                DropdownMenuItem(
                                                    text = { Text("Renommer", fontSize = 13.sp) },
                                                    leadingIcon = {
                                                        Icon(Icons.Filled.Edit, null, Modifier.size(16.dp))
                                                    },
                                                    onClick = {
                                                        showMenu = false
                                                        renamingConv = conv
                                                        renameInput = conv.title
                                                    },
                                                )
                                                DropdownMenuItem(
                                                    text = {
                                                        Text(
                                                            "Supprimer",
                                                            fontSize = 13.sp,
                                                            color = MaterialTheme.colorScheme.error,
                                                        )
                                                    },
                                                    leadingIcon = {
                                                        Icon(
                                                            Icons.Filled.DeleteOutline,
                                                            null,
                                                            Modifier.size(16.dp),
                                                            tint = MaterialTheme.colorScheme.error,
                                                        )
                                                    },
                                                    onClick = {
                                                        showMenu = false
                                                        deletingConv = conv
                                                    },
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ── Section inférieure stable (Compte et sortie) ─────────────────
            HorizontalDivider(
                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f),
                thickness = 1.dp,
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(if (isOnline) Color(0xFF2E8555) else Color(0xFFD64545)),
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = if (isOnline) "Connecté · Neon Sync" else "Hors ligne",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                TextButton(
                    onClick = onBack,
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                ) {
                    Text(
                        text = "Quitter",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }

    // ── Dialogues d'action ───────────────────────────────────────────────────
    renamingConv?.let { conv ->
        AlertDialog(
            onDismissRequest = { renamingConv = null },
            title = { Text("Renommer la conversation", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
            text = {
                OutlinedTextField(
                    value = renameInput,
                    onValueChange = { renameInput = it },
                    singleLine = true,
                    label = { Text("Nouveau titre") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val newTitle = renameInput.trim()
                        if (newTitle.isNotEmpty()) {
                            renamingConv = null
                            scope.launch {
                                runCatching { ServiceLocator.api.renameAiConversation(conv.id, newTitle) }
                                    .onSuccess {
                                        conversations = conversations.map { c ->
                                            if (c.id == conv.id) c.copy(title = newTitle) else c
                                        }
                                    }
                            }
                        }
                    },
                ) {
                    Text("Enregistrer")
                }
            },
            dismissButton = {
                TextButton(onClick = { renamingConv = null }) {
                    Text("Annuler")
                }
            },
        )
    }

    deletingConv?.let { conv ->
        AlertDialog(
            onDismissRequest = { deletingConv = null },
            title = { Text("Supprimer la conversation ?", fontSize = 16.sp, fontWeight = FontWeight.Bold) },
            text = {
                Text(
                    "Cette action supprimera définitivement l'échange sur votre compte et sur tous vos appareils.",
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        val targetId = conv.id
                        deletingConv = null
                        scope.launch {
                            runCatching { ServiceLocator.api.deleteAiConversation(targetId) }
                            conversations = conversations.filterNot { it.id == targetId }
                            if (activeConversationId == targetId) {
                                startNewConversation()
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                ) {
                    Text("Supprimer")
                }
            },
            dismissButton = {
                TextButton(onClick = { deletingConv = null }) {
                    Text("Annuler")
                }
            },
        )
    }

    // ── Zone de conversation principale ──────────────────────────────────────
    val chatContent: @Composable () -> Unit = {
        Column(
            Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .statusBarsPadding(),
        ) {
            // En-tête officiel POUFA AI
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = {
                    if (isTablet) onBack()
                    else scope.launch { drawerState.open() }
                }) {
                    Icon(
                        imageVector = if (isTablet) Icons.AutoMirrored.Filled.ArrowBack else Icons.Filled.Menu,
                        contentDescription = "Menu des conversations",
                        tint = MaterialTheme.colorScheme.onBackground,
                    )
                }

                PoufaEmblem(size = 30.dp)
                Spacer(Modifier.width(10.dp))

                Column(Modifier.weight(1f)) {
                    Text(
                        text = "POUFA AI",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground,
                        letterSpacing = 0.3.sp,
                    )
                    Text(
                        text = farmLabel ?: "Suivi avicole & santé animale",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }

                // Bouton Nouvelle conversation en accès direct
                IconButton(onClick = { startNewConversation() }) {
                    Icon(
                        imageVector = Icons.Filled.Add,
                        contentDescription = "Nouvelle discussion",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }

                if (!isTablet) {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Retour",
                            tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }

            HorizontalDivider(
                color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f),
                thickness = 1.dp,
            )

            // Zone de discussion défilable
            Box(Modifier.weight(1f).fillMaxWidth()) {
                if (messages.isEmpty()) {
                    Column(
                        Modifier
                            .fillMaxSize()
                            .padding(horizontal = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                    ) {
                        Box(
                            Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.primaryContainer),
                            contentAlignment = Alignment.Center,
                        ) {
                            PoufaEmblem(size = 38.dp)
                        }
                        Spacer(Modifier.height(14.dp))
                        Text(
                            text = "POUFA AI",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground,
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = "Conduite d'élevage, zootechnie, traçabilité & santé animale",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center,
                            lineHeight = 18.sp,
                        )
                        Spacer(Modifier.height(26.dp))

                        Text(
                            "Suggestions d'analyse :",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.align(Alignment.Start),
                        )
                        Spacer(Modifier.height(8.dp))

                        SUGGESTED_PROMPTS.forEach { (title, prompt) ->
                            Surface(
                                onClick = { sendMessage(prompt) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 3.dp),
                                shape = RoundedCornerShape(12.dp),
                                color = MaterialTheme.colorScheme.surfaceContainerLowest,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.7f),
                                ),
                            ) {
                                Column(Modifier.padding(horizontal = 14.dp, vertical = 9.dp)) {
                                    Text(
                                        text = title,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.primary,
                                    )
                                    Text(
                                        text = prompt,
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis,
                                    )
                                }
                            }
                        }
                    }
                } else {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 14.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        items(messages, key = { it.id }) { msg ->
                            val isUser = msg.role == "user"
                            Column(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalAlignment = if (isUser) Alignment.End else Alignment.Start,
                            ) {
                                if (isUser) {
                                    Surface(
                                        color = MaterialTheme.colorScheme.surfaceContainerHigh,
                                        shape = RoundedCornerShape(18.dp),
                                        border = androidx.compose.foundation.BorderStroke(
                                            1.dp,
                                            MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f),
                                        ),
                                        modifier = Modifier.widthIn(max = 300.dp),
                                    ) {
                                        Text(
                                            text = msg.content,
                                            color = MaterialTheme.colorScheme.onSurface,
                                            fontSize = 14.sp,
                                            lineHeight = 20.sp,
                                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                                        )
                                    }
                                } else {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(end = 16.dp),
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            modifier = Modifier.padding(bottom = 6.dp),
                                        ) {
                                            PoufaEmblem(size = 18.dp)
                                            Spacer(Modifier.width(8.dp))
                                            Text(
                                                text = "POUFA AI",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = MaterialTheme.colorScheme.primary,
                                            )
                                            if (msg.status == "streaming") {
                                                Spacer(Modifier.width(8.dp))
                                                Text(
                                                    text = "Réflexion…",
                                                    fontSize = 11.sp,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                )
                                            }
                                        }

                                        Surface(
                                            color = MaterialTheme.colorScheme.surface,
                                            shape = RoundedCornerShape(16.dp),
                                            border = androidx.compose.foundation.BorderStroke(
                                                1.dp,
                                                MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f),
                                            ),
                                            modifier = Modifier.fillMaxWidth(),
                                        ) {
                                            Column(Modifier.padding(horizontal = 14.dp, vertical = 12.dp)) {
                                                Text(
                                                    text = msg.content.ifBlank {
                                                        if (msg.status == "streaming") "POUFA AI formule sa réponse…"
                                                        else ""
                                                    },
                                                    color = MaterialTheme.colorScheme.onSurface,
                                                    fontSize = 14.sp,
                                                    lineHeight = 22.sp,
                                                )

                                                if (msg.status == "complete" && msg.content.isNotBlank()) {
                                                    Spacer(Modifier.height(8.dp))
                                                    Row(
                                                        modifier = Modifier.fillMaxWidth(),
                                                        horizontalArrangement = Arrangement.End,
                                                    ) {
                                                        IconButton(
                                                            onClick = {
                                                                clipboard.setText(AnnotatedString(msg.content))
                                                                copyNotice = "Copié"
                                                            },
                                                            modifier = Modifier.size(28.dp),
                                                        ) {
                                                            Icon(
                                                                imageVector = Icons.Filled.ContentCopy,
                                                                contentDescription = "Copier la réponse",
                                                                modifier = Modifier.size(16.dp),
                                                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                                            )
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Notification de copie discrète
            AnimatedVisibility(
                visible = copyNotice != null,
                enter = fadeIn(),
                exit = fadeOut(),
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.padding(horizontal = 16.dp),
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                        ) {
                            Icon(Icons.Filled.Check, null, Modifier.size(14.dp), tint = MaterialTheme.colorScheme.primary)
                            Spacer(Modifier.width(6.dp))
                            Text(copyNotice ?: "", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }

            // Message d'erreur
            errorMessage?.let { err ->
                Surface(
                    color = MaterialTheme.colorScheme.errorContainer,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            text = err,
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            fontSize = 12.sp,
                            modifier = Modifier.weight(1f),
                        )
                        TextButton(onClick = { errorMessage = null }) {
                            Text("Fermer", fontSize = 11.sp, color = MaterialTheme.colorScheme.onErrorContainer)
                        }
                    }
                }
            }

            // ── Composer ancré AU-DESSUS du clavier grâce à imePadding() ─────
            Surface(
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 3.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .imePadding()
                    .navigationBarsPadding(),
            ) {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.Bottom,
                ) {
                    OutlinedTextField(
                        value = input,
                        onValueChange = { input = it },
                        placeholder = {
                            Text(
                                "Posez votre question à POUFA AI…",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                            )
                        },
                        modifier = Modifier
                            .weight(1f)
                            .heightIn(min = 44.dp, max = 130.dp),
                        shape = RoundedCornerShape(18.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MaterialTheme.colorScheme.primary,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outlineVariant,
                            focusedContainerColor = MaterialTheme.colorScheme.surfaceContainerLowest,
                            unfocusedContainerColor = MaterialTheme.colorScheme.surfaceContainerLowest,
                        ),
                        maxLines = 4,
                    )

                    Spacer(Modifier.width(8.dp))

                    // Bouton d'action circulaire : flèche vers le haut [↑] ou arrêt carré [■]
                    val isSendEnabled = input.isNotBlank() && isOnline
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                when {
                                    isStreaming -> MaterialTheme.colorScheme.errorContainer
                                    isSendEnabled -> MaterialTheme.colorScheme.primary
                                    else -> MaterialTheme.colorScheme.surfaceVariant
                                }
                            )
                            .clickable(
                                enabled = isStreaming || isSendEnabled,
                                onClick = {
                                    if (isStreaming) {
                                        streamingJob?.cancel()
                                    } else {
                                        sendMessage(input)
                                    }
                                },
                            ),
                        contentAlignment = Alignment.Center,
                    ) {
                        if (isStreaming) {
                            Icon(
                                imageVector = Icons.Filled.Stop,
                                contentDescription = "Arrêter la génération",
                                modifier = Modifier.size(18.dp),
                                tint = MaterialTheme.colorScheme.onErrorContainer,
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Filled.ArrowUpward,
                                contentDescription = "Envoyer vers POUFA AI",
                                modifier = Modifier.size(20.dp),
                                tint = if (isSendEnabled) {
                                    MaterialTheme.colorScheme.onPrimary
                                } else {
                                    MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.45f)
                                },
                            )
                        }
                    }
                }
            }
        }
    }

    // ── Rendu adaptatif (Tablette 2 panneaux vs Téléphone ModalDrawer) ────────
    if (isTablet) {
        Row(Modifier.fillMaxSize()) {
            Box(
                Modifier
                    .width(320.dp)
                    .fillMaxHeight(),
            ) {
                sidebarContent()
            }
            Box(
                Modifier
                    .width(1.dp)
                    .fillMaxHeight()
                    .background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
            )
            Box(Modifier.weight(1f).fillMaxHeight()) {
                chatContent()
            }
        }
    } else {
        ModalNavigationDrawer(
            drawerState = drawerState,
            gesturesEnabled = true,
            drawerContent = {
                ModalDrawerSheet(
                    modifier = Modifier
                        .widthIn(max = 320.dp)
                        .fillMaxHeight(),
                    drawerContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                    drawerTonalElevation = 2.dp,
                ) {
                    sidebarContent()
                }
            },
        ) {
            chatContent()
        }
    }
}
