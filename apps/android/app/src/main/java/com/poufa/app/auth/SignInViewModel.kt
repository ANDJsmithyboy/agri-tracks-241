package com.poufa.app.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clerk.api.Clerk
import com.clerk.api.network.serialization.ClerkResult
import com.clerk.api.network.serialization.onFailure
import com.clerk.api.network.serialization.onSuccess
import com.clerk.api.sso.OAuthProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface SignInUiState {
    data object Idle : SignInUiState
    data object Loading : SignInUiState
    data object GoogleLoading : SignInUiState
    data class Error(val message: String) : SignInUiState
    data object Done : SignInUiState
}

/**
 * Auth POUFA — Clerk Free : Google OAuth + email/mot de passe.
 * Aucun OTP, aucun SMS. API : signInWithOAuth(OAuthProvider.GOOGLE),
 * signInWithPassword { identifier; password }, signUp { email; password }.
 */
class SignInViewModel : ViewModel() {

    private val _state = MutableStateFlow<SignInUiState>(SignInUiState.Idle)
    val state: StateFlow<SignInUiState> = _state.asStateFlow()

    fun signInWithGoogle() {
        if (_state.value is SignInUiState.Loading || _state.value is SignInUiState.GoogleLoading) return
        _state.value = SignInUiState.GoogleLoading
        viewModelScope.launch {
            _state.value = runCatching {
                when (val result = Clerk.auth.signInWithOAuth(OAuthProvider.GOOGLE)) {
                    is ClerkResult.Success -> SignInUiState.Done
                    is ClerkResult.Failure -> SignInUiState.Error("Connexion Google impossible")
                }
            }.getOrElse {
                SignInUiState.Error(it.message ?: "Connexion Google impossible")
            }
        }
    }

    fun signIn(email: String, password: String) = submit(email, password, signUp = false)

    fun signUp(email: String, password: String, name: String?) = submit(email, password, signUp = true, name = name)

    private fun submit(email: String, password: String, signUp: Boolean, name: String? = null) {
        if (_state.value is SignInUiState.Loading || _state.value is SignInUiState.GoogleLoading) return
        _state.value = SignInUiState.Loading
        viewModelScope.launch {
            _state.value = runCatching {
                if (signUp) {
                    val parts = name?.trim()?.split(" ", limit = 2).orEmpty()
                    val first = parts.getOrNull(0)?.takeIf { it.isNotBlank() }
                    val last = parts.getOrNull(1)?.takeIf { it.isNotBlank() }
                    val result = Clerk.auth.signUp {
                        this.email = email.trim()
                        this.password = password
                        if (first != null) this.firstName = first
                        if (last != null) this.lastName = last
                    }
                    when (result) {
                        is ClerkResult.Success -> SignInUiState.Done
                        is ClerkResult.Failure -> SignInUiState.Error("Échec de la création du compte")
                    }
                } else {
                    val result = Clerk.auth.signInWithPassword {
                        identifier = email.trim()
                        this.password = password
                    }
                    when (result) {
                        is ClerkResult.Success -> SignInUiState.Done
                        is ClerkResult.Failure -> SignInUiState.Error("Identifiants incorrects")
                    }
                }
            }.getOrElse {
                SignInUiState.Error(it.message ?: "Échec de l'authentification")
            }
        }
    }
}
