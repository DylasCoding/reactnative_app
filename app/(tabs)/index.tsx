import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Timer from '../../components/Timer';
import { requestNotificationPermissions } from '../../services/notificationService';
import {
  getSettings,
  saveSettings,
  getStatistics,
  PomodoroSettings,
} from '../../services/storageService';

type TimerMode = 'work' | 'break' | null;

export default function HomeScreen() {
  const [mode, setMode] = useState<TimerMode>(null);
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    breakDuration: 5,
  });
  const [stats, setStats] = useState({
    todayCount: 0,
    totalSessions: 0,
    totalMinutes: 0,
    todaySessions: 0,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<PomodoroSettings>(settings);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      Alert.alert('Thông báo', 'Ứng dụng cần quyền thông báo để hoạt động tốt nhất');
    }

    const savedSettings = await getSettings();
    setSettings(savedSettings);
    setTempSettings(savedSettings);

    loadStatistics();
  };

  const loadStatistics = async () => {
    const statistics = await getStatistics();
    setStats(statistics);
  };

  const handleTimerComplete = () => {
    loadStatistics();

    if (mode === 'work') {
      Alert.alert('🎉 Hoàn thành!', 'Bạn đã hoàn thành phiên làm việc. Nghỉ ngơi chút nhé!', [
        { text: 'Bỏ qua', onPress: () => setMode(null) },
        { text: 'Nghỉ ngơi', onPress: () => setMode('break'), style: 'default' },
      ]);
    } else {
      Alert.alert('✅ Nghỉ xong!', 'Đã hết giờ nghỉ. Sẵn sàng làm việc tiếp chưa?', [
        { text: 'Chưa', onPress: () => setMode(null) },
        { text: 'Bắt đầu', onPress: () => setMode('work'), style: 'default' },
      ]);
    }
  };

  const handleTimerStop = () => {
    loadStatistics();
    setMode(null);
  };

  const handleSaveSettings = async () => {
    if (tempSettings.workDuration < 1 || tempSettings.breakDuration < 1) {
      Alert.alert('Lỗi', 'Thời gian phải lớn hơn 0 phút');
      return;
    }

    await saveSettings(tempSettings);
    setSettings(tempSettings);
    setShowSettings(false);
    Alert.alert('Thành công', 'Đã lưu cài đặt mới');
  };

  return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>🍅 Pomodoro Timer</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettings(true)}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.todayCount}</Text>
              <Text style={styles.statLabel}>Hôm nay</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Tổng phiên</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{stats.totalMinutes}</Text>
              <Text style={styles.statLabel}>Tổng phút</Text>
            </View>
          </View>

          {mode ? (
              <Timer
                  duration={mode === 'work' ? settings.workDuration : settings.breakDuration}
                  type={mode}
                  onComplete={handleTimerComplete}
                  onStop={handleTimerStop}
              />
          ) : (
              <View style={styles.modeSelection}>
                <Text style={styles.modeTitle}>Chọn chế độ</Text>
                <TouchableOpacity style={[styles.modeButton, styles.workButton]} onPress={() => setMode('work')}>
                  <Text style={styles.modeButtonText}>🎯 Làm việc</Text>
                  <Text style={styles.modeDuration}>{settings.workDuration} phút</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modeButton, styles.breakButton]} onPress={() => setMode('break')}>
                  <Text style={styles.modeButtonText}>☕ Nghỉ ngơi</Text>
                  <Text style={styles.modeDuration}>{settings.breakDuration} phút</Text>
                </TouchableOpacity>
              </View>
          )}
        </ScrollView>

        <Modal visible={showSettings} animationType="slide" transparent onRequestClose={() => setShowSettings(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cài đặt</Text>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Thời gian làm việc (phút)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={tempSettings.workDuration.toString()}
                    onChangeText={(text) =>
                        setTempSettings({
                          ...tempSettings,
                          workDuration: parseInt(text, 10) || 0,
                        })
                    }
                />
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Thời gian nghỉ (phút)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={tempSettings.breakDuration.toString()}
                    onChangeText={(text) =>
                        setTempSettings({
                          ...tempSettings,
                          breakDuration: parseInt(text, 10) || 0,
                        })
                    }
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setTempSettings(settings);
                      setShowSettings(false);
                    }}
                >
                  <Text style={styles.modalButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveSettings}>
                  <Text style={styles.modalButtonText}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 12,
    minWidth: 100,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  modeSelection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 30,
  },
  modeButton: {
    width: '100%',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  workButton: {
    backgroundColor: '#ef4444',
  },
  breakButton: {
    backgroundColor: '#10b981',
  },
  modeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  modeDuration: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 30,
    width: '100%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
    textAlign: 'center',
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
