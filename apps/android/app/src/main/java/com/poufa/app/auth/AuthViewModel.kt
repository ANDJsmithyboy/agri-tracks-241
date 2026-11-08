package com.poufa.app.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clerk.api.Clerk
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/** États de démarrage applicatif (spec §13). */
sealed interface AppAuthState {
    data object ClerkInitializing : AppAuthState
    data object SignedOut : AppAuthState
    data object SignedInLoadingProfile : AppAuthState
    data object NoAssignedFarm : AppAuthState
    data object FarmSelectionRequired : AppAuthState
    data object ReadyOnline : AppAuthState
    data object ReadyOfflineCached : AppAuthState
    data object AuthorizationRequired : AppAuthState
    data class RecoverableError(val message: String) : AppAuthState
}

/**
 * État d'authentification — pattern officiel Clerk Android
 * (`Clerk.isInitialized` + `Clerk.userFlow`, non-bloquant).
 */
class AuthViewModel : ViewModel() {

    val clerkReady: StateFlow<Boolean> = Clerk.isInitialized
        .stateIn(viewModelScope, SharingStarted.Eagerly, false)

    val isSignedIn: StateFlow<Boolean> = Clerk.userFlow
        .combine(Clerk.isInitialized) { user, ready -> ready && user != null }
        .stateIn(viewModelScope, SharingStarted.Eagerly, false)

    private val _appState = MutableStateFlow<AppAuthState>(AppAuthState.ClerkInitializing)
    val appState: StateFlow<AppAuthState> = _appState.asStateFlow()

    init {
        viewModelScope.launch {
            combine(Clerk.isInitialized, Clerk.userFlow) { ready, user -> ready to user }
                .collect { (ready, user) ->
                    _appState.value = when {
                        !ready -> AppAuthState.ClerkInitializing
                        user == null -> AppAuthState.SignedOut
                        else -> AppAuthState.SignedInLoadingProfile // ← profil fermes à résoudre (Slice C)
                    }
                }
        }
    }

    /** Jeton de session Clerk pour FastAPI — jamais loggé ni persisté. */
    suspend fun sessionToken(): String? = runCatching {
        when (val result = Clerk.auth.getToken()) {
            is com.clerk.api.network.serialization.ClerkResult.Success -> result.value
            else -> null
        }
    }.getOrNull()
}
