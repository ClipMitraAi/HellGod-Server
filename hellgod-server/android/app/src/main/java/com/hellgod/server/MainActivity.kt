package com.hellgod.server

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * HELLGOD Android Main Controller
 * Provides dual mode: Native API telemetry dashboard and ultra-responsive Cyberpunk WebBridge
 */
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    // Default to local/network server endpoint; easily configurable in settings
    private var serverUrl: String = "http://10.0.2.2:3000" // 10.0.2.2 maps to host in Android Emulator

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)

        setupCyberpunkWebView()
        loadServerDashboard()
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupCyberpunkWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                progressBar.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                errorCode: Int,
                description: String?,
                failingUrl: String?
            ) {
                progressBar.visibility = View.GONE
                Toast.makeText(
                    this@MainActivity,
                    "HELLGOD Server offline or unreachable: $description",
                    Toast.LENGTH_LONG
                ).show()
            }
        }

        // Add Javascript Interface for native telemetry bridge
        webView.addJavascriptInterface(HellgodNativeBridge(this), "HellgodNativeBridge")
    }

    private fun loadServerDashboard() {
        webView.loadUrl(serverUrl)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

class HellgodNativeBridge(private val context: MainActivity) {
    @JavascriptInterface
    fun notifyAlert(title: String, message: String) {
        Toast.makeText(context, "[$title] $message", Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun getClientVersion(): String {
        return "HELLGOD Android 1.0.0"
    }
}
