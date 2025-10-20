import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PomodoroSession {
    id: string;
    type: 'work' | 'break';
    duration: number; // phút
    completedAt: string; // ISO date string
    wasCompleted: boolean;
}

export interface PomodoroSettings {
    workDuration: number;
    breakDuration: number;
}

const SESSIONS_KEY = '@pomodoro_sessions';
const SETTINGS_KEY = '@pomodoro_settings';

// Lưu phiên làm việc
export const saveSession = async (session: PomodoroSession) => {
    try {
        const sessions = await getSessions();
        sessions.unshift(session);
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
        console.error('Error saving session:', error);
    }
};

// Lấy tất cả phiên
export const getSessions = async (): Promise<PomodoroSession[]> => {
    try {
        const data = await AsyncStorage.getItem(SESSIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting sessions:', error);
        return [];
    }
};

// Lấy phiên theo ngày
export const getSessionsByDate = async (date: Date): Promise<PomodoroSession[]> => {
    const sessions = await getSessions();
    const targetDate = date.toISOString().split('T')[0];

    return sessions.filter(session => {
        const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
        return sessionDate === targetDate;
    });
};

// Lấy thống kê
export const getStatistics = async () => {
    const sessions = await getSessions();
    const today = new Date().toISOString().split('T')[0];

    const todaySessions = sessions.filter(session => {
        const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
        return sessionDate === today && session.wasCompleted;
    });

    const totalSessions = sessions.filter(s => s.wasCompleted).length;
    const totalMinutes = sessions
        .filter(s => s.wasCompleted && s.type === 'work')
        .reduce((sum, s) => sum + s.duration, 0);

    return {
        todayCount: todaySessions.filter(s => s.type === 'work').length,
        totalSessions,
        totalMinutes,
        todaySessions: todaySessions.length,
    };
};

// Lưu cài đặt
export const saveSettings = async (settings: PomodoroSettings) => {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings:', error);
    }
};

// Lấy cài đặt
export const getSettings = async (): Promise<PomodoroSettings> => {
    try {
        const data = await AsyncStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : { workDuration: 25, breakDuration: 5 };
    } catch (error) {
        console.error('Error getting settings:', error);
        return { workDuration: 25, breakDuration: 5 };
    }
};

// Xóa tất cả dữ liệu
export const clearAllData = async () => {
    try {
        await AsyncStorage.multiRemove([SESSIONS_KEY, SETTINGS_KEY]);
    } catch (error) {
        console.error('Error clearing data:', error);
    }
};