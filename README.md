# @tilt/react-native

React Native bridge that turns an Android device into a **Tilt compute peer** — joining the Tilt distributed grid with a single call.

## Installation

```sh
npm install @tilt/react-native
# or
yarn add @tilt/react-native
```

## Android setup

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC"/>

<service
    android:name="technology.tilt.sdk.Tilt"
    android:exported="false"
    android:foregroundServiceType="dataSync"/>
```

## Usage

```typescript
import { start, stop, onLog } from '@tilt/react-native';

// Start the peer
start('pk_your_public_key', { environment: 'production' });

// Subscribe to runtime logs
const unsubscribe = onLog((event) => {
  console.log(`[${event.level}] ${event.message}`);
});

// Stop and clean up
stop();
unsubscribe();
```

## Platform support

| Platform | Status |
|----------|--------|
| Android  | ✅     |
