import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
    getSessions,
    getSessionsByDate,
    clearAllData,
    PomodoroSession,
} from '@/services/storageService';

export default function ExploreScreen() {
    const [sessions, setSessions] = useState<PomodoroSession[]>([]);
    const [todaySessions, setTodaySessions] = useState<PomodoroSession[]>([]);
    const [weeklyData, setWeeklyData] = useState<{ day: string; count: number }[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Tải tất cả sessions
        const allSessions = await getSessions();
        setSessions(allSessions.slice(0, 10)); // Chỉ hiển thị 10 gần nhất

        // Tải sessions hôm nay
        const today = await getSessionsByDate(new Date());
        setTodaySessions(today);

        // Tính toán dữ liệu 7 ngày
        const weekly = await calculateWeeklyData();
        setWeeklyData(weekly);
    };

    const calculateWeeklyData = async () => {
        const data = [];
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const sessions = await getSessionsByDate(date);
            const completedWork = sessions.filter(
                s => s.type === 'work' && s.wasCompleted
            ).length;

            data.push({
                day: days[date.getDay()],
                count: completedWork,
            });
        }

        return data;
    };

    const handleClearData = () => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn xóa toàn bộ dữ liệu?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        await clearAllData();
                        loadData();
                        Alert.alert('Thành công', 'Đã xóa toàn bộ dữ liệu');
                    },
                },
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>📊 Thống kê</Text>
                    <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
                        <Text style={styles.clearButtonText}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                </View>

                {/* Biểu đồ tuần */}
                <View style={styles.chartContainer}>
                    <Text style={styles.sectionTitle}>7 ngày qua</Text>
                    <View style={styles.chart}>
                        {weeklyData.map((item, index) => (
                            <View key={index} style={styles.chartBar}>
                                <Text style={styles.chartCount}>{item.count}</Text>
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${(item.count / maxCount) * 100}%`,
                                                backgroundColor:
                                                    item.count === 0 ? '#374151' : '#10b981',
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.chartDay}>{item.day}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Sessions hôm nay */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hôm nay ({todaySessions.length})</Text>
                    {todaySessions.length === 0 ? (
                        <Text style={styles.emptyText}>Chưa có phiên nào</Text>
                    ) : (
                        todaySessions.map((session) => (
                            <View key={session.id} style={styles.sessionCard}>
                                <View style={styles.sessionIcon}>
                                    <Text style={styles.sessionEmoji}>
                                        {session.type === 'work' ? '🎯' : '☕'}
                                    </Text>
                                </View>
                                <View style={styles.sessionInfo}>
                                    <Text style={styles.sessionType}>
                                        {session.type === 'work' ? 'Làm việc' : 'Nghỉ ngơi'}
                                    </Text>
                                    <Text style={styles.sessionTime}>{formatDate(session.completedAt)}</Text>
                                </View>
                                <View style={styles.sessionStatus}>
                                    <Text style={styles.sessionDuration}>{session.duration}'</Text>
                                    {session.wasCompleted ? (
                                        <Text style={styles.completedBadge}>✓</Text>
                                    ) : (
                                        <Text style={styles.incompleteBadge}>✗</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Lịch sử gần đây */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lịch sử gần đây</Text>
                    {sessions.length === 0 ? (
                        <Text style={styles.emptyText}>Chưa có lịch sử</Text>
                    ) : (
                        sessions.map((session) => (
                            <View key={session.id} style={styles.sessionCard}>
                                <View style={styles.sessionIcon}>
                                    <Text style={styles.sessionEmoji}>
                                        {session.type === 'work' ? '🎯' : '☕'}
                                    </Text>
                                </View>
                                <View style={styles.sessionInfo}>
                                    <Text style={styles.sessionType}>
                                        {session.type === 'work' ? 'Làm việc' : 'Nghỉ ngơi'}
                                    </Text>
                                    <Text style={styles.sessionTime}>{formatDate(session.completedAt)}</Text>
                                </View>
                                <View style={styles.sessionStatus}>
                                    <Text style={styles.sessionDuration}>{session.duration}'</Text>
                                    {session.wasCompleted ? (
                                        <Text style={styles.completedBadge}>✓</Text>
                                    ) : (
                                        <Text style={styles.incompleteBadge}>✗</Text>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
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
    clearButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    chartContainer: {
        backgroundColor: '#1f2937',
        padding: 20,
        borderRadius: 16,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 20,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 180,
    },
    chartBar: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    chartCount: {
        color: '#9ca3af',
        fontSize: 12,
        marginBottom: 5,
    },
    barContainer: {
        width: '70%',
        height: 120,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: '100%',
        borderRadius: 6,
        minHeight: 4,
    },
    chartDay: {
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 8,
        fontWeight: '600',
    },
    section: {
        marginBottom: 25,
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 16,
        textAlign: 'center',
        paddingVertical: 30,
    },
    sessionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f2937',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    sessionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#374151',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    sessionEmoji: {
        fontSize: 24,
    },
    sessionInfo: {
        flex: 1,
    },
    sessionType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    sessionTime: {
        fontSize: 14,
        color: '#9ca3af',
    },
    sessionStatus: {
        alignItems: 'flex-end',
    },
    sessionDuration: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    completedBadge: {
        fontSize: 18,
        color: '#10b981',
    },
    incompleteBadge: {
        fontSize: 18,
        color: '#ef4444',
    },
});