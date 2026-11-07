package com.poufa.app

import android.app.Application
import com.clerk.api.Clerk
import com.poufa.app.di.ServiceLocator

/** Point d'entrée applicatif — Clerk + DI + Room. */
class PoufaApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        ServiceLocator.init(this)
        if (BuildConfig.CLERK_PUBLISHABLE_KEY.isNotBlank()) {
            Clerk.initialize(this, publishableKey = BuildConfig.CLERK_PUBLISHABLE_KEY)
        }
    }
}
