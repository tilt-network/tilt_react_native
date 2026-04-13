import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const LINKING_ERROR =
  `The package '@tilt/react-native' doesn't seem to be linked. Make sure to ` +
  `rebuild the app after installing the package.\n\n`;

const TiltNative = NativeModules.TiltModule
  ? NativeModules.TiltModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export interface TiltOptions {
  environment?: string;
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface LogEvent {
  level: LogLevel;
  message: string;
  line: string;
}

let emitter: NativeEventEmitter | null = null;

function getEmitter(): NativeEventEmitter {
  if (!emitter) {
    emitter = new NativeEventEmitter(TiltNative);
  }
  return emitter;
}

/**
 * Start the Tilt peer SDK.
 *
 * @param publicKey - Your Tilt public key (pk_...)
 * @param options   - Optional configuration
 */
export function start(publicKey: string, options: TiltOptions = {}): void {
  if (Platform.OS !== 'android') {
    console.warn('@tilt/react-native: only Android is supported at this time.');
    return;
  }
  TiltNative.start(publicKey, options.environment ?? 'production');
}

/**
 * Stop the Tilt peer SDK and release all resources.
 */
export function stop(): void {
  TiltNative.stop();
}

/**
 * Subscribe to runtime log events emitted by the native SDK.
 *
 * @returns Unsubscribe function
 */
export function onLog(callback: (event: LogEvent) => void): () => void {
  const subscription = getEmitter().addListener('TiltLog', callback);
  return () => subscription.remove();
}
