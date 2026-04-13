/**
 * Tilt React Native SDK — Example App
 * Move this file to example/App.tsx after scaffold is created.
 */
import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { start, stop, onLog, LogEvent } from '@tilt/react-native';

export default function App() {
  const [publicKey, setPublicKey] = useState('pk_3NqPrvpe6nDkdtyS1gJt4kX_4MQ');
  const [environment, setEnvironment] = useState('staging');
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const unsubRef = useRef<(() => void) | null>(null);
  const listRef = useRef<FlatList>(null);

  function handleStart() {
    if (running) return;
    start(publicKey.trim(), { environment: environment.trim() });
    unsubRef.current = onLog((event: LogEvent) => {
      setLogs(prev => {
        const next = [...prev, event.line];
        return next;
      });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    });
    setRunning(true);
  }

  function handleStop() {
    unsubRef.current?.();
    unsubRef.current = null;
    stop();
    setRunning(false);
  }

  function logColor(line: string) {
    if (line.includes('[ERROR]')) return '#ef5350';
    if (line.includes('[WARN]')) return '#ffa726';
    return '#66bb6a';
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <View style={styles.header}>
        <Text style={styles.title}>Tilt SDK Demo</Text>
        <View style={[styles.badge, running ? styles.badgeOn : styles.badgeOff]}>
          <Text style={styles.badgeText}>{running ? `Running (${environment})` : 'Idle'}</Text>
        </View>
      </View>

      <View style={styles.form}>
        <TextInput
          style={[styles.input, running && styles.inputDisabled]}
          value={publicKey}
          onChangeText={setPublicKey}
          placeholder="Public Key"
          placeholderTextColor="#555"
          editable={!running}
        />
        <TextInput
          style={[styles.input, running && styles.inputDisabled]}
          value={environment}
          onChangeText={setEnvironment}
          placeholder="Environment (staging | production)"
          placeholderTextColor="#555"
          editable={!running}
        />
        <TouchableOpacity
          style={[styles.button, running ? styles.buttonStop : styles.buttonStart]}
          onPress={running ? handleStop : handleStart}>
          <Text style={styles.buttonText}>{running ? '⏹ Stop' : '▶ Start'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Runtime logs</Text>

      <View style={styles.logBox}>
        {logs.length === 0 ? (
          <Text style={styles.emptyLog}>No logs yet</Text>
        ) : (
          <FlatList
            ref={listRef}
            data={logs}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <Text style={[styles.logLine, { color: logColor(item) }]}>{item}</Text>
            )}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a4a',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeOn: { backgroundColor: '#1b5e20' },
  badgeOff: { backgroundColor: '#333' },
  badgeText: { color: '#fff', fontSize: 12 },
  form: { padding: 16, gap: 10 },
  input: {
    backgroundColor: '#16213e',
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2a2a4a',
    fontSize: 14,
  },
  inputDisabled: { opacity: 0.5 },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonStart: { backgroundColor: '#0f3460' },
  buttonStop: { backgroundColor: '#7b1fa2' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sectionTitle: { color: '#aaa', fontSize: 13, fontWeight: '600', paddingHorizontal: 16, marginBottom: 6 },
  logBox: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    backgroundColor: '#0d0d1a',
    borderRadius: 8,
    padding: 10,
  },
  emptyLog: { color: '#444', textAlign: 'center', marginTop: 20 },
  logLine: { fontFamily: 'monospace', fontSize: 11, lineHeight: 18 },
});
