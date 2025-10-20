import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#10b981',
                tabBarInactiveTintColor: '#6b7280',
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1f2937',
                    borderTopColor: '#374151',
                    height: Platform.OS === 'ios' ? 90 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Timer',
                    tabBarIcon: ({ color }) => <TabBarIcon name="🍅" color={color} />,
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: 'Thống kê',
                    tabBarIcon: ({ color }) => <TabBarIcon name="📊" color={color} />,
                }}
            />
        </Tabs>
    );
}

function TabBarIcon({ name, color }: { name: string; color: string }) {
    return <Text style={{ fontSize: 24, color }}>{name}</Text>;
}
