package com.poufa.app.data.remote

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Client HTTP unique — OkHttp (Retrofit non retenu : surfaces API minimales,
 * sérialisation kotlinx déjà en place).
 * Le token Clerk est fourni par [TokenProvider] à chaque appel — jamais persisté.
 */
fun interface TokenProvider {
    suspend fun getToken(): String?
}

class ApiException(val code: Int, val errorCode: String?, message: String) : IOException(message)

@Serializable
data class FarmDto(
    val id: String,
    val name: String,
    val province: String,
    val locality: String,
    @SerialName("farming_type") val farmingType: String,
    @SerialName("membership_role") val membershipRole: String = "owner",
    val status: String = "active",
    @SerialName("active_band") val activeBand: BandDto? = null,
)

@Serializable
data class BandDto(
    val id: String,
    @SerialName("official_code") val officialCode: String? = null,
    @SerialName("placement_date") val placementDate: String? = null,
    @SerialName("initial_count") val initialCount: Int? = null,
    @SerialName("current_population") val currentPopulation: Int? = null,
)

@Serializable
data class FarmsResponse(val farms: List<FarmDto> = emptyList())

@Serializable
data class FarmCreateRequest(
    val name: String,
    val province: String,
    val locality: String,
    @SerialName("farming_type") val farmingType: String,
    @SerialName("building_count_declared") val buildingCountDeclared: Int? = null,
    @SerialName("client_id") val clientId: String,
)

class PoufaApiClient(
    private val baseUrl: String,
    private val tokenProvider: TokenProvider,
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val http = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    private suspend fun request(path: String, method: String, body: String? = null): String {
        val token = tokenProvider.getToken()
        val req = Request.Builder()
            .url(baseUrl.trimEnd('/') + path)
            .header("Accept", "application/json")
            .apply {
                if (token != null) header("Authorization", "Bearer $token")
                when (method) {
                    "POST" -> post((body ?: "{}").toRequestBody("application/json".toMediaType()))
                    "GET" -> get()
                    else -> method(method, (body ?: "{}").toRequestBody("application/json".toMediaType()))
                }
            }
            .build()
        return withContext(Dispatchers.IO) {
            http.newCall(req).execute().use { resp ->
                val text = resp.body.string()
                if (!resp.isSuccessful) {
                    val code = runCatching {
                        json.decodeFromString<Map<String, String>>(text)["detail"]
                    }.getOrNull()
                    throw ApiException(resp.code, code, "HTTP ${resp.code}")
                }
                text
            }
        }
    }

    suspend fun listFarms(): FarmsResponse =
        json.decodeFromString(request("/api/v1/farms", "GET"))

    suspend fun getFarm(id: String): FarmDto =
        json.decodeFromString(request("/api/v1/farms/$id", "GET"))

    suspend fun createFarm(req: FarmCreateRequest): FarmDto =
        json.decodeFromString(request("/api/v1/farms", "POST", json.encodeToString(FarmCreateRequest.serializer(), req)))

    suspend fun me(): Map<String, String?> =
        json.decodeFromString(request("/api/v1/me", "GET"))

    suspend fun syncPush(payloadJson: String): String =
        request("/api/v1/sync/push", "POST", payloadJson)

    suspend fun syncPull(cursor: Int): String =
        request("/api/v1/sync/pull?cursor=$cursor", "GET")
}
