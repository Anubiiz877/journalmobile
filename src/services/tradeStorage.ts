// src/services/tradeStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// Estructura de un Trade dentro del teléfono
export interface Trade {
  id: string;
  pair: string;            // ej: 'EURUSD', 'USDCAD'
  type: 'BUY' | 'SELL';
  lots: string;            // ej: '0.08'
  pnl: string;             // ej: '30' o '-10'
  result: 'TP' | 'SL' | 'BE';
  date: string;            // Fecha de ejecución
  notes?: string;          // Confluencias o notas
}

const STORAGE_KEY = '@fx_journal_local_trades';

export const tradeStorage = {
  // 1. Obtener todos los trades guardados en el teléfono
  getTrades: async (): Promise<Trade[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error leyendo el almacenamiento local:', error);
      return [];
    }
  },

  // 2. Guardar una nueva operación
  saveTrade: async (tradeData: Omit<Trade, 'id'>): Promise<Trade[]> => {
    try {
      const currentTrades = await tradeStorage.getTrades();
      const newTrade: Trade = {
        ...tradeData,
        id: Date.now().toString(), // Genera un ID único basado en timestamp
      };

      const updatedTrades = [newTrade, ...currentTrades];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrades));
      return updatedTrades;
    } catch (error) {
      console.error('Error guardando la operación:', error);
      throw error;
    }
  },

  // 3. Eliminar una operación por su ID
  deleteTrade: async (id: string): Promise<Trade[]> => {
    try {
      const currentTrades = await tradeStorage.getTrades();
      const updatedTrades = currentTrades.filter((item) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTrades));
      return updatedTrades;
    } catch (error) {
      console.error('Error eliminando la operación:', error);
      throw error;
    }
  },

  // 4. Borrar todos los datos (Reiniciar Journal)
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error limpiando los datos locales:', error);
    }
  },
};