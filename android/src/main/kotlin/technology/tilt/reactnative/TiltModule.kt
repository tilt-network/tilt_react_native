package technology.tilt.reactnative

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import technology.tilt.sdk.Tilt
import technology.tilt.sdk.TiltLogBus

class TiltModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var logJob: Job? = null

    override fun getName() = "TiltModule"

    @ReactMethod
    fun start(publicKey: String, environment: String) {
        Tilt.initialize(reactContext)

        logJob?.cancel()
        logJob = scope.launch(start = CoroutineStart.UNDISPATCHED) {
            TiltLogBus.events.collect { event ->
                val payload = Arguments.createMap().apply {
                    putString("level", event.level.toString())
                    putString("message", event.message)
                    putString("line", "[${event.level}] ${event.message}")
                }
                withContext(Dispatchers.Main) {
                    reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("TiltLog", payload)
                }
            }
        }

        Tilt.start(reactContext, publicKey, environment)
    }

    @ReactMethod
    fun stop() {
        logJob?.cancel()
        logJob = null
        Tilt.stop(reactContext)
    }

    // Required for NativeEventEmitter on Android
    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}

    override fun invalidate() {
        scope.cancel()
        super.invalidate()
    }
}
