# Tilt React Native — justfile
# Requires: node, yarn, adb, react-native CLI

example_dir := "example"
package     := "com.example"
activity    := ".MainActivity"

# Build the parent package TypeScript, install deps, start Metro + run on Android
run: build-ts
    cd {{example_dir}} && yarn install
    @echo "Starting Metro bundler in background..."
    cd {{example_dir}} && yarn start --reset-cache &
    @sleep 3
    cd {{example_dir}} && yarn android

# Build only (no Metro / no device install)
build: build-ts
    cd {{example_dir}} && yarn install
    cd {{example_dir}} && yarn android --no-packager

# Compile the TypeScript package (must run before any example command)
build-ts:
    yarn install
    yarn build

# Start Metro bundler only (useful when running build separately)
metro:
    cd {{example_dir}} && yarn start --reset-cache

# Install APK on connected device and launch the app
install:
    cd {{example_dir}} && ./android/gradlew -p android :app:installDebug
    adb shell am start -n {{package}}/{{package}}{{activity}}

# Launch the already-installed app
launch:
    adb shell am start -n {{package}}/{{package}}{{activity}}

# Kill the app on device
kill:
    adb shell am force-stop {{package}}

# Clear app data + cache on device
clear-data:
    adb shell pm clear {{package}}

# Tail Tilt-related logs from the device
logs:
    adb logcat -s "TiltSDK" "ReactNativeJS" "tilt_sdk"

# Tail all app logs
logs-all:
    adb logcat --pid=$(adb shell pidof -s {{package}})

# List connected ADB devices
devices:
    adb devices

# Full clean: wipe gradle cache + node_modules + TS build output
clean:
    cd {{example_dir}} && ./android/gradlew -p android clean
    rm -rf {{example_dir}}/node_modules
    rm -rf node_modules lib
