import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import {
    scheduleNotification,
    cancelNotification
} from '@/services/notificationService';
import { saveSession } from '@/services/storageService';

interface TimerProps {
    duration: number; // phút
    type: 'work' | 'break';
    onComplete: () => void;
    onStop: () => void;
}

export default function Timer({ duration, type, onComplete, onStop }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration * 60); // giây
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const notificationIdRef = useRef<string | null>(null);
    const startTimeRef = useRef<number>(0);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (timeLeft === 0 && isRunning) {
            handleComplete();
        }
    }, [timeLeft, isRunning]);

    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (notificationIdRef.current) {
            cancelNotification(notificationIdRef.current);
        }
        deactivateKeepAwake();
    };

    const startTimer = async () => {
        setIsRunning(true);
        setIsPaused(false);
        startTimeRef.current = Date.now();

        // Giữ màn hình sáng
        await activateKeepAwakeAsync();

        // Lên lịch thông báo
        const message = type === 'work'
            ? 'Hết giờ làm việc! Nghỉ ngơi thôi 🎉'
            : 'Hết giờ nghỉ! Quay lại làm việc nào 💪';

        const id = await scheduleNotification(
            type === 'work' ? 'Pomodoro Work Done!' : 'Break Time Over!',
            message,
            timeLeft
        );
        notificationIdRef.current = id;

        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Bắt đầu đếm ngược
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const pauseTimer = async () => {
        setIsPaused(true);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (notificationIdRef.current) {
            await cancelNotification(notificationIdRef.current);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const resumeTimer = async () => {
        setIsPaused(false);

        // Lên lịch thông báo mới với thời gian còn lại
        const message = type === 'work'
            ? 'Hết giờ làm việc! Nghỉ ngơi thôi 🎉'
            : 'Hết giờ nghỉ! Quay lại làm việc nào 💪';

        const id = await scheduleNotification(
            type === 'work' ? 'Pomodoro Work Done!' : 'Break Time Over!',
            message,
            timeLeft
        );
        notificationIdRef.current = id;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = async () => {
        cleanup();

        // Lưu phiên chưa hoàn thành
        await saveSession({
            id: Date.now().toString(),
            type,
            duration,
            completedAt: new Date().toISOString(),
            wasCompleted: false,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onStop();
    };

    const handleComplete = async () => {
        cleanup();

        // Lưu phiên đã hoàn thành
        await saveSession({
            id: Date.now().toString(),
            type,
            duration,
            completedAt: new Date().toISOString(),
            wasCompleted: true,
        });

        // Haptic feedback mạnh
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        onComplete();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

    return (
        <View style={styles.container}>
            <View style={[
                styles.timerCircle,
                { borderColor: type === 'work' ? '#ef4444' : '#10b981' }
            ]}>
                <Text style={styles.typeText}>
                    {type === 'work' ? '🎯 WORK' : '☕ BREAK'}
                </Text>
                <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>

            <View style={styles.buttonContainer}>
                {!isRunning && !isPaused && (
                    <TouchableOpacity style={styles.startButton} onPress={startTimer}>
                        <Text style={styles.buttonText}>Bắt đầu</Text>
                    </TouchableOpacity>
                )}

                {isRunning && !isPaused && (
                    <>
                        <TouchableOpacity style={styles.pauseButton} onPress={pauseTimer}>
                            <Text style={styles.buttonText}>Tạm dừng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
                            <Text style={styles.buttonText}>Dừng</Text>
                        </TouchableOpacity>
                    </>
                )}

                {isPaused && (
                    <>
                        <TouchableOpacity style={styles.resumeButton} onPress={resumeTimer}>
                            <Text style={styles.buttonText}>Tiếp tục</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
                            <Text style={styles.buttonText}>Dừng</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    timerCircle: {
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1f2937',
        marginBottom: 40,
    },
    typeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#9ca3af',
        marginBottom: 10,
    },
    timeText: {
        fontSize: 64,
        fontWeight: 'bold',
        color: '#fff',
        fontVariant: ['tabular-nums'],
    },
    progressText: {
        fontSize: 18,
        color: '#9ca3af',
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    startButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 50,
        paddingVertical: 16,
        borderRadius: 12,
    },
    pauseButton: {
        backgroundColor: '#f59e0b',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 12,
    },
    resumeButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 12,
    },
    stopButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});