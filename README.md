# 🕒 Task Timer (Basic Pomodoro)


## 📖 Project Overview
**Task Timer** is a simple **Pomodoro-style productivity app** built with Expo.  
It helps users manage their work and rest cycles effectively through a timer system with notifications and history tracking.  
This app follows the Pomodoro technique: work for a fixed period (**25 minutes**) and take a short break (**5 minutes**) to boost focus and efficiency.

---

## 🧰 Tech Stack
- **Framework:** Expo (React Native)
- **Notifications:** `expo-notifications`
- **Screen Wake Lock:** `expo-keep-awake`
- **Vibration Feedback:** `expo-haptics`
- **Local Storage:** `AsyncStorage`
- **Chart Visualization (optional):** Simple chart library for session statistics

---

## ⚙️ Core Features

### 1. Work Timer
<p align="center">
  <img src="/img/work1.png" alt="Work Timer 1" width="47%" />
  <img src="/img/work2.png" alt="Work Timer 2" width="45%" />
</p>

- Work mode duration: **25 minutes**
- Helps maintain focus and productivity.
- Countdown continues even when the app is in the background.

---

### 2. Break Timer
<p align="center">
  <img src="/img/work1.png" alt="Break Timer 1" width="47%" />
  <img src="/img/work2.png" alt="Break Timer 2" width="45%" />
</p>

- Break mode duration: **5 minutes**
- Encourages relaxation and recovery after each work session.
- Automatically switches back to work mode when finished.

---

### 3. Notifications
![Notification Example](/img/Notifications.png)
- Sends notifications when a work or break session ends.
- Optionally includes haptic feedback for a better user experience.

---

### 4. Session History
![History Screen](/img/DailySessionChart.png)
- Saves completed sessions locally using **AsyncStorage**.
- Displays previous work/break sessions for daily tracking.

---

## 🚀 Extended Features

### ⏱ Custom Timer Settings
![Custom Timer Screen](/img/custom.png)
- Allows users to customize work and break durations to fit personal preferences.

---

### 📊 Daily Session Chart
![Chart Screen](/img/DailySessionChart.png)
- Visualizes the number of sessions completed per day.
- Helps track productivity trends over time.

---

## ▶️ Run the App
To start the app on Android, use the following command:
```bash
npx expo start --android
