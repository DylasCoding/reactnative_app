import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình thông báo nền
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});


export default function TimerScreen() {
    useKeepAwake(); // Giữ màn hình không tắt

    const [seconds, setSeconds] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState<'Work' | 'Break'>('Work');
    const intervalRef = useRef<number | null>(null);

    // Xin quyền thông báo
    useEffect(() => {
        Notifications.requestPermissionsAsync().then(({ status }) => {
            if (status !== 'granted') {
                Alert.alert('Notification permission required');
            }
        });
    }, []);

    // Xử lý đếm ngược
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => {
                    if (prev === 1) {
                        clearInterval(intervalRef.current!);
                        onSessionEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current!);
    }, [isRunning]);

    // Khi hết phiên
    const onSessionEnd = async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${mode} session completed!`,
                body: mode === 'Work' ? 'Take a 5-minute break ☕' : 'Time to work 💪',
            },
            trigger: null,
        });

        // Lưu lịch sử vào AsyncStorage
        const history = JSON.parse(await AsyncStorage.getItem('history') || '[]');
        history.push({ mode, time: new Date().toISOString() });
        await AsyncStorage.setItem('history', JSON.stringify(history));

        // Chuyển chế độ
        const nextMode = mode === 'Work' ? 'Break' : 'Work';
        setMode(nextMode);
        setSeconds(nextMode === 'Work' ? 25 * 60 : 5 * 60);
        setIsRunning(false);
    };

    // Format thời gian
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{mode} Mode</Text>
            <Text style={styles.timer}>{formatTime(seconds)}</Text>
            <View style={styles.buttons}>
                <Button title={isRunning ? 'Pause' : 'Start'} onPress={() => setIsRunning(!isRunning)} />
                <Button title="Reset" onPress={() => { setIsRunning(false); setSeconds(mode === 'Work' ? 25 * 60 : 5 * 60); }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
    timer: { fontSize: 60, fontWeight: '600', marginBottom: 20 },
    buttons: { flexDirection: 'row', gap: 10 },
});
