package com.poufa.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "poufa_settings")

/** Préférences locales — DataStore (spec §11, écrans 55–56). */
class SettingsRepository(private val context: Context) {

    private object Keys {
        val SELECTED_FARM_PREFIX = "selected_farm_"   // par compte Clerk
        val WIFI_ONLY_SYNC = longPreferencesKey("wifi_only_sync")
        val TEXT_SCALE = stringPreferencesKey("text_scale")
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val LANGUAGE = stringPreferencesKey("language")
        val DATE_FORMAT = stringPreferencesKey("date_format")
        val UNITS = stringPreferencesKey("units")
    }

    fun selectedFarmId(userId: String): Flow<String?> =
        context.dataStore.data.map { it[stringPreferencesKey(Keys.SELECTED_FARM_PREFIX + userId)] }

    suspend fun setSelectedFarm(userId: String, farmId: String?) {
        context.dataStore.edit {
            val key = stringPreferencesKey(Keys.SELECTED_FARM_PREFIX + userId)
            if (farmId == null) it.remove(key) else it[key] = farmId
        }
    }

    suspend fun selectedFarmIdNow(userId: String): String? = selectedFarmId(userId).first()

    val wifiOnlySync: Flow<Boolean> =
        context.dataStore.data.map { it[Keys.WIFI_ONLY_SYNC] == 1L }

    suspend fun setWifiOnlySync(enabled: Boolean) {
        context.dataStore.edit { it[Keys.WIFI_ONLY_SYNC] = if (enabled) 1L else 0L }
    }

    suspend fun getTextScale(): String? =
        context.dataStore.data.first()[Keys.TEXT_SCALE]

    suspend fun setTextScale(scale: String) {
        context.dataStore.edit { it[Keys.TEXT_SCALE] = scale }
    }

    val themeMode: Flow<String> =
        context.dataStore.data.map { it[Keys.THEME_MODE] ?: "system" }

    suspend fun setThemeMode(mode: String) {
        context.dataStore.edit { it[Keys.THEME_MODE] = mode }
    }
}
