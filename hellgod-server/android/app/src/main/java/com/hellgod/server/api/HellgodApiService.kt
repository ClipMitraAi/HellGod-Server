package com.hellgod.server.api

import retrofit2.Response
import retrofit2.http.*

data class SystemMetricsResponse(
    val hostname: String,
    val uptimeFormatted: String,
    val cpu: CpuMetrics,
    val memory: MemoryMetrics
)

data class CpuMetrics(
    val cores: Int,
    val usagePercent: Int
)

data class MemoryMetrics(
    val totalFormatted: String,
    val usedFormatted: String,
    val usagePercent: Int
)

data class ServiceItem(
    val id: String,
    val name: String,
    val status: String,
    val port: Int,
    val memory: Int
)

data class ActionRequest(
    val action: String // "start", "stop", "restart"
)

interface HellgodApiService {

    @GET("/api/health")
    suspend fun checkHealth(): Response<Map<String, Any>>

    @GET("/api/system/metrics")
    suspend fun getMetrics(
        @Header("Authorization") token: String
    ): Response<SystemMetricsResponse>

    @GET("/api/services")
    suspend fun getServices(
        @Header("Authorization") token: String
    ): Response<List<ServiceItem>>

    @POST("/api/services/{id}/action")
    suspend fun executeServiceAction(
        @Header("Authorization") token: String,
        @Path("id") serviceId: String,
        @Body action: ActionRequest
    ): Response<Map<String, Any>>

    @POST("/api/ai/chat")
    suspend fun queryAi(
        @Header("Authorization") token: String,
        @Body payload: Map<String, String>
    ): Response<Map<String, String>>
}
