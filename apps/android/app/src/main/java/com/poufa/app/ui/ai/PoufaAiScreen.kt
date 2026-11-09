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
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
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
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var lastPrompt by remember { mutableStateOf<String?>(null) }
    var showHistorySheet by remember { mutableStateOf(false) }
    var streamingJob by remember { mutableStateOf<Job?>(null) }
    var copyNotice by remember { mutableStateOf<String?>(null) }

    val listState = rememberLazyListState()

    fun refreshConversations() {
        scope.launch {
            runCatching { ServiceLocator.api.listAiConversations() }
                .onSuccess { conversations = it.conversations }
        }
    }

    LaunchedEffect(Unit) {
        refreshConversations()
    }

    LaunchedEffect(messages.size, messages.lastOrNull()?.content) {
        if (messages.isNotEmpty()) {
            runCatching { listState.animateScrollToItem(messages.lastIndex) }
        }
    }

    fun sendMessage(rawText: String) {
        val text = rawText.trim()
        if (text.isEmpty() || isStreaming) return
        if (!isOnline) {
            errorMessage = "Hors connexion — votre question est conservée. Reconnectez-vous pour interroger POUFA AI."
            return
        }

        input = ""
        lastPrompt = text
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

    // Modal Bottom Sheet pour l'historique des conversations
    if (showHistorySheet) {
        ModalBottomSheet(onDismissRequest = { showHistorySheet = false }) {
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = PoufaPagePadding, vertical = 12.dp),
            ) {
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text("Historique des échanges", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    TextButton(onClick = {
                        streamingJob?.cancel()
                        activeConversationId = null
                        messages = emptyList()
                        errorMessage = null
                        showHistorySheet = false
                    }) {
                        Icon(Icons.Filled.Add, null, Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Nouvelle discussion")
                    }
                }
                Spacer(Modifier.height(8.dp))
                if (conversations.isEmpty()) {
                    Text(
                        "Aucune conversation archivée sur ce compte.",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(vertical = 24.dp),
                    )
                } else {
                    conversations.forEach { conv ->
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .clickable {
                                    showHistorySheet = false
                                    activeConversationId = conv.id
                                    scope.launch {
                                        runCatching { ServiceLocator.api.getAiConversation(conv.id) }
                                            .onSuccess { detail ->
                                                messages = detail.messages.map {
                                                    NativeChatMessage(it.id, it.role, it.content, it.status)
                                                }
                                            }
                                    }
                                }
                                .padding(vertical = 12.dp, horizontal = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text(
                                conv.title,
                                fontSize = 14.sp,
                                fontWeight = if (conv.id == activeConversationId) FontWeight.SemiBold else FontWeight.Normal,
                                color = if (conv.id == activeConversationId) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.weight(1f),
                            )
                            IconButton(onClick = {
                                scope.launch {
                                    runCatching { ServiceLocator.api.deleteAiConversation(conv.id) }
                                    conversations = conversations.filterNot { it.id == conv.id }
                                    if (activeConversationId == conv.id) {
                                        activeConversationId = null
                                        messages = emptyList()
                                    }
                                }
                            }) {
                                Icon(Icons.Filled.DeleteOutline, "Supprimer", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
                Spacer(Modifier.height(24.dp))
            }
        }
    }

    // ── Layout Principal avec gestion stricte des Insets & Clavier ───────────
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
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Retour")
            }
            PoufaEmblem(size = 32.dp)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text("POUFA AI", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onBackground)
                Text(
                    farmLabel ?: "Assistant pour le suivi avicole national",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                )
            }
            IconButton(onClick = { showHistorySheet = true }) {
                Icon(Icons.Filled.History, contentDescription = "Historique", tint = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }

        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

        // Zone de discussion scrollable
        Box(Modifier.weight(1f).fillMaxWidth()) {
            if (messages.isEmpty()) {
                // Écran d'accueil conversationnel avec suggestions
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
                        text = "Bienvenue sur POUFA AI",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground,
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = "Posez vos questions sur vos bandes, la mortalité, les pesées et les stocks d'intrants.",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center,
                        lineHeight = 18.sp,
                    )
                    Spacer(Modifier.height(28.dp))

                    Text(
                        "Suggestions d'analyse :",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.align(Alignment.Start),
                    )
                    Spacer(Modifier.height(10.dp))

                    SUGGESTED_PROMPTS.forEach { (title, prompt) ->
                        Surface(
                            onClick = { sendMessage(prompt) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.surfaceContainerLowest,
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.7f),
                            ),
                        ) {
                            Column(Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                                Text(
                                    title,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MaterialTheme.colorScheme.primary,
                                )
                                Text(
                                    prompt,
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 2,
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
                            Modifier.fillMaxWidth(),
                            horizontalAlignment = if (isUser) Alignment.End else Alignment.Start,
                        ) {
                            if (!isUser) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(bottom = 4.dp),
                                ) {
                                    PoufaEmblem(size = 18.dp)
                                    Spacer(Modifier.width(6.dp))
                                    Text(
                                        "POUFA AI",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = MaterialTheme.colorScheme.primary,
                                    )
                                }
                            }

                            Box(
                                Modifier
                                    .widthIn(max = 320.dp)
                                    .clip(
                                        RoundedCornerShape(
                                            topStart = 16.dp,
                                            topEnd = 16.dp,
                                            bottomStart = if (isUser) 16.dp else 4.dp,
                                            bottomEnd = if (isUser) 4.dp else 16.dp,
                                        )
                                    )
                                    .background(
                                        if (isUser) MaterialTheme.colorScheme.primary
                                        else MaterialTheme.colorScheme.surfaceContainerLowest
                                    )
                                    .border(
                                        width = if (isUser) 0.dp else 1.dp,
                                        color = if (isUser) Color.Transparent else MaterialTheme.colorScheme.outlineVariant,
                                        shape = RoundedCornerShape(16.dp),
                                    )
                                    .padding(horizontal = 14.dp, vertical = 10.dp),
                            ) {
                                Text(
                                    text = msg.content.ifEmpty {
                                        if (msg.status == "streaming") "Analyse des indicateurs zootechniques…" else ""
                                    },
                                    fontSize = 14.sp,
                                    lineHeight = 20.sp,
                                    color = if (isUser) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface,
                                )
                            }

                            if (!isUser && msg.status != "streaming" && msg.content.isNotBlank()) {
                                Row(
                                    modifier = Modifier.padding(top = 2.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    TextButton(
                                        onClick = {
                                            clipboard.setText(AnnotatedString(msg.content))
                                            copyNotice = "Réponse copiée"
                                            scope.launch {
                                                kotlinx.coroutines.delay(2000)
                                                copyNotice = null
                                            }
                                        },
                                        contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp),
                                    ) {
                                        Icon(Icons.Filled.ContentCopy, contentDescription = null, Modifier.size(13.dp))
                                        Spacer(Modifier.width(4.dp))
                                        Text(copyNotice ?: "Copier", fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Bannière d'erreur éventuelle
        AnimatedVisibility(visible = errorMessage != null) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp)
                    .background(MaterialTheme.colorScheme.errorContainer, RoundedCornerShape(10.dp))
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    errorMessage ?: "",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.weight(1f),
                )
                if (lastPrompt != null && isOnline) {
                    IconButton(onClick = { lastPrompt?.let { sendMessage(it) } }) {
                        Icon(Icons.Filled.Refresh, contentDescription = "Réessayer", tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }

        // ── Composer ancré AU-DESSUS du clavier grâce à imePadding() ─────────
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
                            "Posez une question à POUFA AI…",
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
