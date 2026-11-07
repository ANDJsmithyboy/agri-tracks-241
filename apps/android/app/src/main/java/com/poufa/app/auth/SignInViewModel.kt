package com.poufa.app.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clerk.api.Clerk
import com.clerk.api.models.OAuthProvider
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
 * signInWithPassword { identifier; password }, signUpWithPassword.
 */
class SignInViewModel : ViewModel() {

    private val _state = MutableStateFlow<SignInUiState>(SignInUiState.Idle)
    val state: StateFlow<SignInUiState> = _state.asStateFlow()

    fun signInWithGoogle() {
        if (_state.value is SignInUiState.Loading || _state.value is SignInUiState.GoogleLoading) return
        _state.value = SignInUiState.GoogleLoading
        viewModelScope.launch {
            _state.value = runCatching {
                val result = Clerk.auth.signInWithOAuth(OAuthProvider.GOOGLE)
                result.onFailure { throw it }
            }.fold(
                onSuccess = { SignInUiState.Done },
                onFailure = { SignInUiState.Error(it.message ?: "Connexion Google impossible") },
            )
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
                    val result = Clerk.auth.signUpWithPassword {
                        this.email = email.trim()
                        this.password = password
                        name?.let { this.name = it }
                    }
                    result.onFailure { throw it }
                } else {
                    val result = Clerk.auth.signInWithPassword {
                        identifier = email.trim()
                        this.password = password
                    }
                    result.onFailure { throw it }
                }
            }.fold(
                onSuccess = { SignInUiState.Done },
                onFailure = { SignInUiState.Error(it.message ?: "Échec de l'authentification") },
            )
        }
    }
}
