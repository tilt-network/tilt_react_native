jest.mock('react-native', () => ({
  NativeModules: {
    TiltModule: {
      start: jest.fn(),
      stop: jest.fn(),
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    },
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  })),
  Platform: { OS: 'android' },
}));

import { start, stop, onLog } from '../index';
import { NativeModules } from 'react-native';

const TiltNative = NativeModules.TiltModule;

describe('start', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls native start with publicKey and default environment', () => {
    start('pk_test123');
    expect(TiltNative.start).toHaveBeenCalledWith('pk_test123', 'production');
  });

  it('calls native start with custom environment', () => {
    start('pk_test123', { environment: 'staging' });
    expect(TiltNative.start).toHaveBeenCalledWith('pk_test123', 'staging');
  });
});

describe('stop', () => {
  it('calls native stop', () => {
    stop();
    expect(TiltNative.stop).toHaveBeenCalled();
  });
});

describe('onLog', () => {
  it('returns an unsubscribe function', () => {
    const unsub = onLog(() => {});
    expect(typeof unsub).toBe('function');
  });

  it('unsubscribe removes the listener', () => {
    const removeMock = jest.fn();
    // The emitter is created lazily — capture the mock before first onLog call
    const { NativeEventEmitter } = require('react-native');
    (NativeEventEmitter as jest.Mock).mockImplementationOnce(() => ({
      addListener: jest.fn().mockReturnValue({ remove: removeMock }),
    }));

    // Reset module to clear cached emitter
    jest.resetModules();
    jest.mock('react-native', () => ({
      NativeModules: {
        TiltModule: {
          start: jest.fn(),
          stop: jest.fn(),
          addListener: jest.fn(),
          removeListeners: jest.fn(),
        },
      },
      NativeEventEmitter: jest.fn().mockImplementation(() => ({
        addListener: jest.fn().mockReturnValue({ remove: removeMock }),
      })),
      Platform: { OS: 'android' },
    }));

    const { onLog: freshOnLog } = require('../index');
    const unsub = freshOnLog(() => {});
    unsub();
    expect(removeMock).toHaveBeenCalled();
  });
});
