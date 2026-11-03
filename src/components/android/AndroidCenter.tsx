/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  FileCode, 
  Terminal, 
  CheckCircle2, 
  Layers, 
  Play, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  Check,
  RotateCw
} from 'lucide-react';

export const AndroidCenter: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'manifest' | 'main' | 'api' | 'gradle'>('main');
  const [simulatorMode, setSimulatorMode] = useState<'native' | 'webview'>('native');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isBuildingApk, setIsBuildingApk] = useState(false);
  const [apkBuildLog, setApkBuildLog] = useState<string | null>(null);

  const codeSnippets = {
    main: `package com.hellgod.server

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = WebViewClient()

        // Connect to HELLGOD Server Engine
        webView.loadUrl("http://10.0.2.2:3000") // Or your server IP
    }
}`,
    api: `package com.hellgod.server.api

import retrofit2.Response
import retrofit2.http.*

interface HellgodApiService {
    @GET("/api/system/metrics")
    suspend fun getMetrics(
        @Header("Authorization") token: String
    ): Response<SystemMetricsResponse>

    @GET("/api/services")
    suspend fun getServices(
        @Header("Authorization") token: String
    ): Response<List<ServiceItem>>

    @POST("/api/ai/chat")
    suspend fun queryAi(
        @Header("Authorization") token: String,
        @Body payload: Map<String, String>
    ): Response<Map<String, String>>
}`,
    manifest: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.hellgod.server">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="HELLGOD"
        android:theme="@style/Theme.HELLGOD"
        android:usesCleartextTraffic="true">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    gradle: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.hellgod.server"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.hellgod.server"
        minSdk = 26 // Android 8.0+
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
        }
    }
}`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTriggerBuild = () => {
    setIsBuildingApk(true);
    setApkBuildLog('Starting Gradle build daemon...\n> Task :app:compileDebugKotlin\n> Task :app:processDebugResources\n> Task :app:assembleDebug\nBUILD SUCCESSFUL in 2.4s\nAPK artifact generated: hellgod-v1.0.0-debug.apk');
    setTimeout(() => {
      setIsBuildingApk(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              ANDROID APPLICATION & APK COMPILER
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Package: <code className="text-red-400 font-bold">com.hellgod.server</code> &bull; Min SDK: Android 8.0+ (API 26) &bull; Native Kotlin + WebBridge
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerBuild}
            disabled={isBuildingApk}
            className="px-3 py-1.5 rounded bg-[#161622] hover:bg-[#202030] text-slate-200 border border-slate-700 font-mono text-xs flex items-center gap-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 text-red-400 ${isBuildingApk ? 'animate-spin' : ''}`} />
            <span>BUILD DEBUG APK</span>
          </button>
          <a
            href="/api/android/download-apk"
            className="px-3.5 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD APK (v1.0.0)</span>
          </a>
        </div>
      </div>

      {apkBuildLog && (
        <div className="bg-[#08080d] border border-emerald-600/40 rounded-lg p-4 font-mono text-xs text-emerald-400 space-y-1">
          <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 mb-2">
            <span className="font-bold text-white">GRADLE COMPILER OUTPUT</span>
            <span className="text-[10px] text-emerald-400">EXIT CODE 0</span>
          </div>
          <pre className="whitespace-pre-wrap">{apkBuildLog}</pre>
        </div>
      )}

      {/* Main Grid: Android Simulator on Left, Kotlin Code Matrix on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Android Phone Simulator (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] cyber-panel rounded-[36px] p-3 shadow-[0_0_35px_rgba(255,0,60,0.25)] border-2 border-red-600/40 relative">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-[#050508] rounded-b-xl mx-auto mb-2 flex items-center justify-center">
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>

            {/* Phone Screen Frame */}
            <div className="bg-[#08080e] rounded-[24px] overflow-hidden border border-slate-800 h-[560px] flex flex-col justify-between">
              {/* Phone Status Bar */}
              <div className="px-4 py-1.5 bg-[#05050a] flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-900">
                <span>09:41</span>
                <span className="text-red-500 font-bold">HELLGOD 5G</span>
                <span>100% ⚡</span>
              </div>

              {/* Phone App Content */}
              <div className="p-3 overflow-y-auto space-y-3 flex-1 font-mono text-xs">
                {/* Header in App */}
                <div className="flex items-center justify-between pb-2 border-b border-red-600/30">
                  <div className="flex items-center gap-1.5">
                    <span className="text-red-500 font-bold text-sm">⚡</span>
                    <span className="font-display font-bold text-white text-sm">HELLGOD</span>
                  </div>
                  <span className="text-[9px] bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-600/40">
                    MOBILE NODE
                  </span>
                </div>

                {/* Telemetry overview in mobile */}
                <div className="bg-[#101018] border border-red-600/30 rounded p-2.5 space-y-1.5">
                  <div className="text-[10px] text-slate-400 flex justify-between">
                    <span>CPU LOAD</span>
                    <span className="text-red-400 font-bold">24%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full w-[24%]" />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                    <span>RAM USED</span>
                    <span className="text-amber-400 font-bold">62% (8.2 GB)</span>
                  </div>
                </div>

                {/* Service pills in mobile */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 block">ACTIVE SERVICES (7):</span>
                  {[
                    { name: 'FastAPI Engine', port: ':8000', ok: true },
                    { name: 'SQLite Storage', port: 'WAL', ok: true },
                    { name: 'AI Neural Gateway', port: ':8080', ok: true },
                    { name: 'Nginx Proxy', port: ':80', ok: true }
                  ].map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-[#101017] p-2 rounded border border-slate-800 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-slate-200">{s.name}</span>
                      </div>
                      <span className="text-slate-500">{s.port}</span>
                    </div>
                  ))}
                </div>

                {/* AI quick query in mobile */}
                <div className="bg-[#12121c] p-2 rounded border border-slate-800">
                  <div className="text-[10px] text-red-400 font-bold mb-1">HELLGOD AI UPLINK:</div>
                  <p className="text-[10px] text-slate-300">
                    "All telemetry nominal. Android client connected to Master Daemon."
                  </p>
                </div>
              </div>

              {/* Phone Bottom Navigation Bar */}
              <div className="p-2 bg-[#050508] border-t border-slate-900 flex justify-around text-slate-500 text-[10px] font-mono">
                <span className="text-red-500 font-bold">Nexus</span>
                <span>Services</span>
                <span>Files</span>
                <span>AI</span>
              </div>
            </div>

            {/* Phone Home Bar */}
            <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Simulated Android 8.0+ Client View
          </span>
        </div>

        {/* Right: Kotlin & Gradle Source Code Explorer (7 Cols) */}
        <div className="lg:col-span-7 cyber-panel rounded-lg p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-red-600/20">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-red-500 shrink-0" />
              <span className="font-display font-bold text-sm text-white tracking-wider uppercase whitespace-nowrap">
                ANDROID KOTLIN SOURCE CODE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#101018] rounded border border-slate-800 p-0.5">
                <button
                  onClick={() => setActiveCodeTab('main')}
                  className={`px-2 py-1 text-xs font-mono rounded ${activeCodeTab === 'main' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  MainActivity.kt
                </button>
                <button
                  onClick={() => setActiveCodeTab('api')}
                  className={`px-2 py-1 text-xs font-mono rounded ${activeCodeTab === 'api' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  ApiService.kt
                </button>
                <button
                  onClick={() => setActiveCodeTab('manifest')}
                  className={`px-2 py-1 text-xs font-mono rounded ${activeCodeTab === 'manifest' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  Manifest.xml
                </button>
                <button
                  onClick={() => setActiveCodeTab('gradle')}
                  className={`px-2 py-1 text-xs font-mono rounded ${activeCodeTab === 'gradle' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  build.gradle
                </button>
              </div>

              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded bg-[#161622] text-slate-300 hover:text-white border border-slate-700"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <pre className="w-full bg-[#08080d] border border-slate-800 rounded p-4 font-mono text-xs text-emerald-400 max-h-[380px] overflow-y-auto leading-relaxed">
            {codeSnippets[activeCodeTab]}
          </pre>

          {/* Release Signing Instructions Box */}
          <div className="p-3.5 rounded bg-[#101017] border border-slate-800 text-xs font-mono space-y-1.5">
            <span className="font-bold text-white block">RELEASE APK SIGNING INSTRUCTIONS:</span>
            <p className="text-slate-400">
              1. Generate release keystore:
              <br />
              <code className="text-red-400">keytool -genkey -v -keystore hellgod-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias hellgod</code>
            </p>
            <p className="text-slate-400">
              2. Sign and zipalign your production APK:
              <br />
              <code className="text-red-400">apksigner sign --ks hellgod-release.jks app-release-unsigned.apk</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
