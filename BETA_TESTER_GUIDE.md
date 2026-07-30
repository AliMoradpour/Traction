# Beta Tester Guide

Welcome to Traction Beta! This guide will help you get started and make the most of the app.

---

## 1. Installation

### Prerequisites
- Node.js 18+ installed
- Expo Go app on your iOS/Android device
- Backend server running (ask your admin for connection details)

### Steps

**Mobile App:**
```bash
cd apps/mobile
npm install
npm start
```

**Backend:**
```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm start:dev
```

### Connecting
1. Open Expo Go on your phone
2. Scan the QR code from the terminal
3. The app will load automatically

---

## 2. Account Setup

1. **Sign Up**: Enter your email, password, and name
2. **Verify**: Check your email for a verification code (if enabled)
3. **Onboarding**: Complete the guided setup:
   - Set your display name
   - Choose your experience level
   - Select your goals (health, career, personal, etc.)
   - Set your daily available time for tasks

---

## 3. Feature Walkthrough

### Today Tab (Home)
Your daily dashboard showing:
- **Dynamic Greeting**: Personalized based on time of day
- **Today's Tasks**: Tasks scheduled for today
- **Quick Add**: Tap + to create a new task instantly
- **Task Completion**: Swipe or tap to mark tasks complete
- **Progress Bar**: Visual indicator of daily completion

### Goals Tab
Track your long-term objectives:
- **Create Goal**: Set a title, description, and target date
- **Add Milestones**: Break goals into smaller, measurable steps
- **Track Progress**: Mark milestones complete to see overall progress
- **View History**: See your goal completion history

### Focus Tab
Deep work sessions with concentration tracking:
- **Start Session**: Choose a duration (15, 30, 45, 60, 90 minutes)
- **Distraction Logging**: Log when you get distracted during a session
- **Session Stats**: View your focus score after each session
- **History**: Track your focus trends over time

### Insights Tab
Analytics and AI-powered recommendations:
- **Behavioral Metrics**: Energy, focus, stress, motivation, mood
- **AI Daily Brief**: Morning overview of your day
- **Goal Recovery**: AI suggestions when you're falling behind
- **Friction Analysis**: Identify what's blocking your progress
- **Weekly Review**: AI-generated summary of your performance

### Profile Tab
Manage your account:
- **Edit Profile**: Update name, email, avatar
- **Preferences**: Notification settings, theme
- **Settings**: App configuration
- **Developer Settings**: Hidden debug panel (tap version number 5 times)

---

## 4. How to Use Focus Mode

1. Navigate to the **Focus** tab
2. Tap **Start Focus Session**
3. Select a duration:
   - Quick Focus: 15 minutes
   - Standard: 30 or 45 minutes
   - Deep Work: 60 or 90 minutes
4. Stay focused! The timer will count down
5. If you get distracted, tap **Log Distraction** to note what pulled you away
6. When complete, review your session stats
7. Your focus data will appear in Insights

**Tips:**
- Start with shorter sessions and build up
- Log distractions honestly to identify patterns
- Use Focus Mode for your most important tasks

---

## 5. How to Track Goals

1. Go to the **Goals** tab
2. Tap **Create New Goal**
3. Fill in:
   - **Title**: What do you want to achieve?
   - **Description**: Why is this important?
   - **Target Date**: When do you want to accomplish this?
   - **Category**: Health, Career, Personal, Finance, Learning
4. Add **Milestones** to break the goal into steps
5. Mark milestones complete as you progress
6. View your progress percentage on the Goals screen

**Example Goal:**
- Title: "Run a 5K"
- Milestones:
  - [ ] Run 1 mile without stopping
  - [ ] Run 2 miles without stopping
  - [ ] Run 3 miles without stopping
  - [ ] Complete a 5K race

---

## 6. How to Give Feedback

### In-App Feedback Widget
1. Look for the floating **?** button in the bottom-right corner
2. Tap it to open the feedback form
3. Choose a category:
   - Bug Report
   - Feature Request
   - General Feedback
4. Describe your issue or suggestion
5. Add screenshots if helpful
6. Submit!

### GitHub Issues
For detailed bug reports, visit:
https://github.com/AliMoradpour/Traction/issues

**Include in your report:**
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots or videos
- Your device model and OS version

---

## 7. FAQ

**Q: The app won't load after scanning the QR code.**
A: Make sure your phone and computer are on the same WiFi network. Try restarting the Expo dev server.

**Q: I can't sign up - it says "Invite code required".**
A: Contact your admin for a valid invite code, or check if direct sign-up is enabled.

**Q: My tasks aren't saving.**
A: Check your internet connection. The app needs to sync with the backend. Try pulling down to refresh.

**Q: How do I delete a goal?**
A: Swipe left on the goal in the Goals tab, or tap the goal and look for the delete option in the menu.

**Q: Focus Mode didn't track my session.**
A: Make sure you started the session properly and the app stayed open. Sessions are saved when you tap "Complete".

**Q: Where do I see my progress over time?**
A: Go to the **Insights** tab to see your behavioral metrics, focus history, and goal progress.

**Q: The app is slow or laggy.**
A: Try closing other apps. If the issue persists, report it through the feedback widget with details about when it happens.

**Q: How do I reset my password?**
A: On the login screen, tap "Forgot Password" and follow the instructions. (Note: Email reset is not yet functional in beta - contact your admin.)

**Q: Can I use the app offline?**
A: The app works best online, but basic viewing of cached data may work offline. An offline banner will appear when you lose connection.

---

## Need Help?

- **In-App**: Use the feedback widget (? button)
- **GitHub**: https://github.com/AliMoradpour/Traction/issues
- **Email**: Contact your beta program admin

Thank you for being a beta tester! Your feedback helps us build a better product.
