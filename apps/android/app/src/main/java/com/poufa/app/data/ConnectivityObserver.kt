package com.poufa.app.data

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/** État réseau honnête — disponibilité ≠ synchro réussie. */
enum class NetState { OFFLINE, AVAILABLE_UNVALIDATED, ONLINE }

/**
 * Observateur ConnectivityManager — StateFlow réactif.
 * ONLINE = réseau avec accès Internet validé (NET_CAPABILITY_VALIDATED).
 * AVAILABLE_UNVALIDATED = réseau présent mais pas encore prouvé.
 */
class ConnectivityObserver(context: Context) {
    private val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private val _state = MutableStateFlow(currentState())
    val state: StateFlow<NetState> = _state.asStateFlow()

    private val callback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) { _state.value = currentState() }
        override fun onLost(network: Network) { _state.value = currentState() }
        override fun onCapabilitiesChanged(network: Network, caps: NetworkCapabilities) { _state.value = currentState() }
    }

    init {
        cm.registerNetworkCallback(
            NetworkRequest.Builder().addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET).build(),
            callback,
        )
    }

    private fun currentState(): NetState {
        val caps = cm.getNetworkCapabilities(cm.activeNetwork) ?: return NetState.OFFLINE
        return when {
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED) -> NetState.ONLINE
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) -> NetState.AVAILABLE_UNVALIDATED
            else -> NetState.OFFLINE
        }
    }
}
