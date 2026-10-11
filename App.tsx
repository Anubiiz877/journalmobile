// App.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  SafeAreaView,
} from 'react-native';
import { COLORS } from './src/constants/theme';
import { tradeStorage, Trade } from './src/services/tradeStorage';

export default function App() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pair, setPair] = useState('EURUSD');
  const [pnl, setPnl] = useState('');
  const [result, setResult] = useState<'TP' | 'SL' | 'BE'>('TP');

  // Cargar trades locales al abrir la app
  useEffect(() => {
    loadLocalTrades();
  }, []);

  async function loadLocalTrades() {
    const data = await tradeStorage.getTrades();
    setTrades(data);
  }

  async function handleAddTrade() {
    if (!pnl) {
      Alert.alert('Atención', 'Ingresa el resultado en $ de la operación.');
      return;
    }

    const updated = await tradeStorage.saveTrade({
      pair,
      type: 'BUY',
      lots: '0.08',
      pnl,
      result,
      date: new Date().toLocaleDateString('es-ES'),
    });

    setTrades(updated);
    setPnl('');
    Alert.alert('¡Éxito!', 'Operación guardada en la memoria local del teléfono.');
  }

  async function handleDelete(id: string) {
    const updated = await tradeStorage.deleteTrade(id);
    setTrades(updated);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <Text style={styles.headerTitle}>
        FX <Text style={styles.greenText}>Journal</Text> Local
      </Text>
      <Text style={styles.subTitle}>Almacenamiento 100% Offline</Text>

      {/* Formulario Rápido de Prueba */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>// REGISTRAR OPERACIÓN LOCAL</Text>
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={pair}
            onChangeText={setPair}
            placeholder="Par"
            placeholderTextColor={COLORS.textMuted}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 10 }]}
            value={pnl}
            onChangeText={setPnl}
            placeholder="PnL ($)"
            keyboardType="numeric"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Botones de Resultado */}
        <View style={styles.rowBtn}>
          {(['TP', 'BE', 'SL'] as const).map((res) => (
            <TouchableOpacity
              key={res}
              style={[
                styles.typeBtn,
                result === res && styles.typeBtnActive,
              ]}
              onPress={() => setResult(res)}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  result === res && styles.typeBtnTextActive,
                ]}
              >
                {res}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btnSave} onPress={handleAddTrade}>
          <Text style={styles.btnSaveText}>GUARDAR EN TELÉFONO 💾</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Trades en Memoria Local */}
      <Text style={styles.listHeader}>OPERACIONES EN MEMORIA ({trades.length})</Text>
      
      <FlatList
        data={trades}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.tradeCard}>
            <View>
              <Text style={styles.tradePair}>{item.pair} — <Text style={{ color: item.result === 'TP' ? COLORS.green : item.result === 'SL' ? COLORS.red : '#fff' }}>{item.result}</Text></Text>
              <Text style={styles.tradeDate}>{item.date}</Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={[styles.tradePnl, { color: Number(item.pnl) >= 0 ? COLORS.green : COLORS.red }]}>
                {Number(item.pnl) >= 0 ? `+$${item.pnl}` : `-$${Math.abs(Number(item.pnl))}`}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={{ color: COLORS.red, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: COLORS.textMain, textAlign: 'center', marginTop: 10 },
  greenText: { color: COLORS.green },
  subTitle: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginBottom: 16 },
  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 10, fontWeight: '700', color: COLORS.green, letterSpacing: 1, marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 10 },
  input: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.textMain, fontSize: 13 },
  rowBtn: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 6, alignItems: 'center' },
  typeBtnActive: { backgroundColor: COLORS.greenDim, borderColor: COLORS.green },
  typeBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 11 },
  typeBtnTextActive: { color: COLORS.green },
  btnSave: { backgroundColor: COLORS.green, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnSaveText: { color: '#000', fontWeight: '700', fontSize: 12 },
  listHeader: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 10 },
  tradeCard: { backgroundColor: COLORS.card2, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tradePair: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
  tradeDate: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  tradePnl: { fontSize: 15, fontWeight: '700' },
});