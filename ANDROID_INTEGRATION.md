# Guia de Integração Android para CineStream Pro

## Visão Geral

Este documento descreve como integrar a aplicação web CineStream Pro em um aplicativo Android. A arquitetura se baseia em um `WebView` que carrega a interface do usuário (HTML/JS/CSS), enquanto toda a comunicação de rede com a API Xtremecodes é delegada ao código nativo do Android.

A comunicação é realizada através de uma "Ponte JavaScript" (`JavascriptInterface`), onde o JavaScript no WebView chama métodos Kotlin/Java, e o código nativo retorna os resultados para o JavaScript através de uma função de callback.

## 1. Configuração do Projeto Android

### Dependências
Adicione a dependência do OkHttp ao seu `build.gradle.kts` (ou `build.gradle`) para facilitar as requisições HTTP.

```kotlin
// build.gradle.kts
implementation("com.squareup.okhttp3:okhttp:4.12.0")
implementation("com.google.code.gson:gson:2.10.1") // Para parse de JSON
```

### Assets
Copie **todo o conteúdo** da aplicação web (index.html, index.tsx, etc.) para o diretório `src/main/assets/` do seu projeto Android.

## 2. Configuração do WebView

No seu layout XML, adicione um `WebView`.

```xml
<!-- activity_main.xml -->
<WebView
    android:id="@+id/webView"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

Na sua `Activity`, configure o `WebView` para habilitar JavaScript e injetar a ponte de comunicação.

```kotlin
// MainActivity.kt
import android.os.Bundle
import android.webkit.WebView
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val webView: WebView = findViewById(R.id.webView)

        // Habilita o JavaScript e o DOM Storage (para o cache do localStorage)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true

        // Adiciona a interface da ponte, nomeando-a como "AndroidBridge"
        webView.addJavascriptInterface(WebAppInterface(this, webView), "AndroidBridge")

        // Carrega a página inicial a partir dos assets locais
        webView.loadUrl("file:///android_asset/index.html")
    }
}
```

## 3. Implementação da Ponte (`WebAppInterface.kt`)

Esta classe contém a lógica que será executada no lado nativo. O método `makeApiRequest` é anotado com `@JavascriptInterface` para ser acessível pelo JavaScript.

```kotlin
// WebAppInterface.kt
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebView
import com.google.gson.Gson
import okhttp3.*
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import java.io.IOException

class WebAppInterface(private val context: Context, private val webView: WebView) {

    private val client = OkHttpClient()
    private val gson = Gson()
    private val mainHandler = Handler(Looper.getMainLooper())

    // IMPORTANTE: Defina aqui as credenciais do seu servidor Xtremecodes
    private val xtreamServer = "http://SEU_SERVIDOR.COM:PORT"
    private val xtreamUsername = "SEU_USUARIO"
    private val xtreamPassword = "SUA_SENHA"

    @JavascriptInterface
    fun makeApiRequest(action: String, paramsJson: String, callbackId: String) {
        when (action) {
            "get_credentials" -> handleGetCredentials(callbackId)
            "player_api" -> handlePlayerApi(paramsJson, callbackId)
            else -> {
                val error = mapOf("message" to "Ação nativa desconhecida: $action")
                resolvePromise(callbackId, isSuccess = false, data = null, error = gson.toJson(error))
            }
        }
    }

    private fun handleGetCredentials(callbackId: String) {
        // Retorna as credenciais para o JS. Usado para construir URLs de stream.
        val credentials = mapOf(
            "id" to "native-android",
            "server" to xtreamServer,
            "username" to xtreamUsername,
            "password" to xtreamPassword, // Tenha cuidado ao expor senhas
            "added_at" to System.currentTimeMillis().toString(),
            "last_validated" to System.currentTimeMillis().toString()
        )
        resolvePromise(callbackId, isSuccess = true, data = gson.toJson(credentials), error = null)
    }

    private fun handlePlayerApi(paramsJson: String, callbackId: String) {
        val params = gson.fromJson(paramsJson, Map::class.java) as Map<String, String>
        val action = params["action"] ?: ""

        val urlBuilder = (xtreamServer + "/player_api.php").toHttpUrlOrNull()?.newBuilder()
        if (urlBuilder == null) {
            val error = mapOf("message" to "URL do servidor inválida.")
            resolvePromise(callbackId, isSuccess = false, data = null, error = gson.toJson(error))
            return
        }

        urlBuilder.addQueryParameter("username", xtreamUsername)
        urlBuilder.addQueryParameter("password", xtreamPassword)
        params.forEach { (key, value) -> urlBuilder.addQueryParameter(key, value) }
        
        val request = Request.Builder().url(urlBuilder.build()).build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                val error = mapOf("message" to (e.message ?: "Falha na requisição de rede"))
                resolvePromise(callbackId, isSuccess = false, data = null, error = gson.toJson(error))
            }

            override fun onResponse(call: Call, response: Response) {
                response.use {
                    if (!it.isSuccessful) {
                        val error = mapOf("message" to "Erro na API: ${it.code} ${it.message}")
                        resolvePromise(callbackId, isSuccess = false, data = null, error = gson.toJson(error))
                    } else {
                        val body = it.body?.string()
                        if (body == null) {
                            val error = mapOf("message" to "Resposta da API vazia.")
                            resolvePromise(callbackId, isSuccess = false, data = null, error = gson.toJson(error))
                        } else {
                            resolvePromise(callbackId, isSuccess = true, data = body, error = null)
                        }
                    }
                }
            }
        })
    }

    /**
     * Envia o resultado de volta para o JavaScript no WebView.
     * Deve ser chamado na thread principal.
     */
    private fun resolvePromise(callbackId: String, isSuccess: Boolean, data: String?, error: String?) {
        val dataJson = data?.let { gson.toJson(it) } ?: "null"
        val errorJson = error?.let { gson.toJson(it) } ?: "null"
        
        // O JavaScript espera que 'data' seja um JSON string, e não um JSON stringificado.
        val finalData = if (data != null) data else "null"
        
        val script = "window.resolvePromise('$callbackId', $isSuccess, $finalData, $errorJson)"
        
        // Executa o JavaScript na thread principal.
        mainHandler.post {
            webView.evaluateJavascript(script, null)
        }
    }
}
```

## 4. Fluxo da Requisição

1.  **JS:** O `ApiContext.tsx` precisa de dados e chama `api.getLiveCategories()`.
2.  **JS:** `XtremecodesApi.ts` chama `invokeNative('player_api', { action: 'get_live_categories' })`.
3.  **JS:** `androidBridge.ts` gera um `callbackId`, armazena a `Promise` e chama `window.AndroidBridge.makeApiRequest('player_api', '{"action":"get_live_categories"}', 'cb-123')`.
4.  **Android:** O método `WebAppInterface.makeApiRequest` é invocado.
5.  **Android:** Ele identifica a ação `player_api`, constrói a URL completa (`http://.../player_api.php?username=...&action=get_live_categories`), e usa o OkHttp para fazer a requisição de rede em uma thread de background.
6.  **Android:** Ao receber a resposta da API, ele chama `resolvePromise('cb-123', true, '[{...}]', null)`.
7.  **Android:** `resolvePromise` formata e executa o JavaScript `window.resolvePromise('cb-123', true, [{...}], null)` na thread principal do `WebView`.
8.  **JS:** A função global `window.resolvePromise` em `androidBridge.ts` é executada. Ela encontra a `Promise` correspondente a `'cb-123'` e a resolve com os dados recebidos.
9.  **JS:** A `Promise` original em `ApiContext.tsx` é resolvida e a UI é atualizada com as categorias.
