package com.poufa.app.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.poufa.app.auth.SignInUiState
import com.poufa.app.auth.SignInViewModel
import com.poufa.app.ui.components.*
import com.poufa.app.ui.theme.*

/**
 * Login POUFA — Google + email/mot de passe (Clerk Free, aucun OTP).
 * Refond maquette 07 : même identité visuelle, nouvelles méthodes auth.
 */
@Composable
fun LoginScreen(onAuthenticated: () -> Unit) {
    val vm: SignInViewModel = viewModel()
    val state by vm.state.collectAsState()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isSignUp by remember { mutableStateOf(false) }
    var name by remember { mutableStateOf("") }

    LaunchedEffect(state) {
        if (state is SignInUiState.Done) onAuthenticated()
    }

    val busy = state is SignInUiState.Loading || state is SignInUiState.GoogleLoading
    val canSubmit = email.contains("@") && password.length >= 8 &&
        (!isSignUp || name.isNotBlank())

    Scaffold(
        bottomBar = {
            PoufaBottomActionBar(
                primaryText = if (isSignUp) "Créer mon compte" else "Se connecter",
                onPrimary = {
                    if (isSignUp) vm.signUp(email, password, name.ifBlank { null })
                    else vm.signIn(email, password)
                },
                hint = when (val s = state) {
                    is SignInUiState.Error -> s.message
                    SignInUiState.Loading -> "Connexion en cours…"
                    SignInUiState.GoogleLoading -> "Ouverture de Google…"
                    else -> null
                },
            )
        },
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).padding(horizontal = PoufaPagePadding),
        ) {
            Spacer(Modifier.height(48.dp))
            PoufaBrandHeader("Suivi d'élevage et traçabilité")
            Spacer(Modifier.height(28.dp))
            Text("Bienvenue sur POUFA", fontSize = 28.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(8.dp))
            Text(
                "Connectez-vous pour accéder à votre exploitation.",
                fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(28.dp))

            // Google — méthode sociale Clerk (OAuthProvider.GOOGLE)
            OutlinedButton(
                onClick = { vm.signInWithGoogle() },
                enabled = !busy,
                modifier = Modifier.fillMaxWidth().height(PoufaButtonHeight),
                shape = RoundedCornerShape(PoufaRadiusButton),
            ) {
                Text("G", fontWeight = FontWeight.Bold, color = Color(0xFF4285F4), fontSize = 18.sp)
                Spacer(Modifier.width(10.dp))
                Text("Continuer avec Google", fontWeight = FontWeight.SemiBold)
            }
            Spacer(Modifier.height(20.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                HorizontalDivider(Modifier.weight(1f), color = MaterialTheme.colorScheme.outlineVariant)
                Text("  ou  ", fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                HorizontalDivider(Modifier.weight(1f), color = MaterialTheme.colorScheme.outlineVariant)
            }
            Spacer(Modifier.height(20.dp))

            if (isSignUp) {
                OutlinedTextField(
                    value = name, onValueChange = { name = it },
                    label = { Text("Nom complet") }, singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(16.dp))
            }
            OutlinedTextField(
                value = email, onValueChange = { email = it },
                label = { Text("Adresse email") }, singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(16.dp))
            OutlinedTextField(
                value = password, onValueChange = { password = it },
                label = { Text("Mot de passe") }, singleLine = true,
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            if (passwordVisible) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                            if (passwordVisible) "Masquer" else "Afficher",
                        )
                    }
                },
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(12.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                TextButton(onClick = { /* reset mot de passe Clerk — à brancher */ }) {
                    Text("Mot de passe oublié ?", fontSize = 13.sp)
                }
                TextButton(onClick = { isSignUp = !isSignUp }) {
                    Text(
                        if (isSignUp) "Se connecter" else "Créer un compte",
                        color = PoufaPrimary, fontWeight = FontWeight.SemiBold, fontSize = 13.sp,
                    )
                }
            }
        }
    }
}
