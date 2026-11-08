package com.poufa.app.ui.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
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
            errorMessage = "Hors connexion — votre texte est conservé. Reconnectez-vous pour interroger POUFA AI."
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
                            content = m.content.ifBlank { "Génération interrompue." },
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
                    Text("Conversations", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    TextButton(onClick = {
                        streamingJob?.cancel()
                        activeConversationId = null
                        messages = emptyList()
                        errorMessage = null
                        showHistorySheet = false
                    }) {
                        Icon(Icons.Filled.Add, null, Modifier.size(16.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Nouvelle")
                    }
                }
                Spacer(Modifier.height(8.dp))
                if (conversations.isEmpty()) {
                    Text(
                        "Aucune conversation enregistrée.",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(vertical = 20.dp),
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
                                .padding(vertical = 10.dp, horizontal = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text(
                                conv.title,
                                fontSize = 14.sp,
                                fontWeight = if (conv.id == activeConversationId) FontWeight.SemiBold else FontWeight.Normal,
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

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)) {
        // Header
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, "Retour")
            }
            PoufaEmblem(size = 28.dp)
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f)) {
                Text("POUFA AI", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text(
                    farmLabel ?: "Votre assistant pour le suivi avicole.",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            IconButton(onClick = {
                streamingJob?.cancel()
                activeConversationId = null
                messages = emptyList()
                errorMessage = null
            }) {
                Icon(Icons.Filled.Add, "Nouvelle conversation")
            }
            IconButton(onClick = {
                refreshConversations()
                showHistorySheet = true
            }) {
                Icon(Icons.Filled.History, "Historique")
            }
        }

        HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

        if (!isOnline) {
            Box(Modifier.padding(horizontal = PoufaPagePadding, vertical = 8.dp)) {
                PoufaOfflineBanner()
            }
        }

        // Messages or Welcome State
        if (messages.isEmpty()) {
            LazyColumn(
                Modifier.weight(1f).fillMaxWidth(),
                contentPadding = PaddingValues(PoufaPagePadding),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                item {
                    PoufaEmblem(size = 56.dp)
                    Spacer(Modifier.height(12.dp))
                    Text("POUFA AI", fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "Votre assistant pour le suivi avicole.",
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.height(24.dp))
                }
                items(SUGGESTED_PROMPTS) { (title, prompt) ->
                    PoufaCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 5.dp)
                            .clickable(enabled = isOnline) { sendMessage(prompt) },
                        contentPadding = PaddingValues(14.dp),
                    ) {
                        Text(title, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(Modifier.height(4.dp))
                        Text(
                            prompt,
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        } else {
            LazyColumn(
                state = listState,
                modifier = Modifier.weight(1f).fillMaxWidth(),
                contentPadding = PaddingValues(PoufaPagePadding),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(messages, key = { it.id }) { msg ->
                    val isUser = msg.role == "user"
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start,
                    ) {
                        Column(
                            Modifier
                                .widthIn(max = 310.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(
                                    if (isUser) PoufaPrimary else MaterialTheme.colorScheme.surfaceContainerLowest,
                                )
                                .border(
                                    width = if (isUser) 0.dp else 1.dp,
                                    color = if (isUser) PoufaPrimary else MaterialTheme.colorScheme.outlineVariant,
                                    shape = RoundedCornerShape(16.dp),
                                )
                                .padding(14.dp),
                        ) {
                            Text(
                                text = msg.content.ifEmpty {
                                    if (msg.status == "streaming") "Analyse des données de l'exploitation…" else ""
                                },
                                fontSize = 14.sp,
                                color = if (isUser) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface,
                            )
                            if (!isUser && msg.status != "streaming" && msg.content.isNotBlank()) {
                                Spacer(Modifier.height(6.dp))
                                Row(
                                    Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.End,
                                ) {
                                    TextButton(
                                        onClick = { clipboard.setText(AnnotatedString(msg.content)) },
                                        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                    ) {
                                        Icon(Icons.Filled.ContentCopy, null, Modifier.size(14.dp))
                                        Spacer(Modifier.width(4.dp))
                                        Text("Copier", fontSize = 11.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Error Banner with Retry
        if (errorMessage != null) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(horizontal = PoufaPagePadding, vertical = 6.dp)
                    .background(PoufaWarningBg, RoundedCornerShape(12.dp))
                    .padding(10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    errorMessage ?: "",
                    fontSize = 12.sp,
                    color = PoufaInk,
                    modifier = Modifier.weight(1f),
                )
                if (lastPrompt != null && isOnline) {
                    IconButton(onClick = { lastPrompt?.let { sendMessage(it) } }) {
                        Icon(Icons.Filled.Refresh, "Réessayer", tint = PoufaPrimary)
                    }
                }
            }
        }

        // Composer
        Surface(color = MaterialTheme.colorScheme.surfaceContainerLowest, tonalElevation = 2.dp) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                OutlinedTextField(
                    value = input,
                    onValueChange = { input = it },
                    placeholder = { Text("Posez une question à POUFA AI…") },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(14.dp),
                    maxLines = 4,
                )
                Spacer(Modifier.width(8.dp))
                if (isStreaming) {
                    FilledTonalIconButton(onClick = { streamingJob?.cancel() }) {
                        Icon(Icons.Filled.Stop, "Arrêter")
                    }
                } else {
                    FilledIconButton(
                        onClick = { sendMessage(input) },
                        enabled = input.isNotBlank() && isOnline,
                    ) {
                        Icon(Icons.AutoMirrored.Filled.Send, "Envoyer")
                    }
                }
            }
        }
    }
}

