package com.poufa.app.di

import android.content.Context
import androidx.room.Room
import com.poufa.app.BuildConfig
import com.poufa.app.data.*
import com.poufa.app.data.local.PoufaDatabase
import com.poufa.app.data.local.SettingsRepository
import com.poufa.app.data.remote.PoufaApiClient
import com.poufa.app.data.remote.TokenProvider

/**
 * Injection manuelle — un seul point de construction (Hilt pourra le
 * remplacer sans toucher les consumers). Instancié dans PoufaApplication.
 */
object ServiceLocator {
    @Volatile private var db: PoufaDatabase? = null
    @Volatile private var appContext: Context? = null

    /** Appelée depuis PoufaApplication.onCreate. */
    fun init(context: Context) {
        appContext = context.applicationContext
    }

    private fun ctx(): Context =
        appContext ?: error("ServiceLocator.init() non appelé")

    /** Contexte applicatif pour WorkManager et autres singles. */
    fun context(): Context = ctx()

    val database: PoufaDatabase
        get() = db ?: synchronized(this) {
            db ?: Room.databaseBuilder(ctx(), PoufaDatabase::class.java, "poufa.db")
                .fallbackToDestructiveMigration() // v1 : recréation autorisée avant release
                .build().also { db = it }
        }

    val settings: SettingsRepository by lazy { SettingsRepository(ctx()) }

    /** Token Clerk injecté à chaque appel — jamais persisté. */
    val api: PoufaApiClient by lazy {
        PoufaApiClient(
            baseUrl = BuildConfig.API_BASE_URL,
            tokenProvider = TokenProvider {
                runCatching { com.clerk.api.Clerk.auth.getToken()?.jwt }.getOrNull()
            },
        )
    }

    val connectivity: ConnectivityObserver by lazy { ConnectivityObserver(ctx()) }
    val farmRepository: FarmRepository by lazy { FarmRepository(api, database, settings) }
    val dailyRepository: DailyRepository by lazy { DailyRepository(database) }
    val productionRepository: ProductionRepository by lazy { ProductionRepository(database) }
}
