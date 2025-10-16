# Android Notification Setup Guide for BabyBloom

## 📱 How to Set Up Notifications on Android

### 1. **App Configuration (Already Done)**
The app has been configured with the necessary settings in `app.json`:
- ✅ Android permissions for notifications
- ✅ Expo notifications plugin
- ✅ Notification channels setup

### 2. **Device Settings**

#### **Enable App Notifications:**
1. Go to **Settings** → **Apps** → **BabyBloom**
2. Tap **Notifications**
3. Make sure **"Allow notifications"** is **ON**
4. Enable **"Show on lock screen"**
5. Enable **"Show notification dot"**

#### **Notification Categories:**
1. In the same notification settings, you should see:
   - **"Medication Reminders"** - Set to **High Priority**
   - **"General Notifications"** - Set to **Default Priority**

#### **Battery Optimization:**
1. Go to **Settings** → **Battery** → **Battery Optimization**
2. Find **BabyBloom** in the list
3. Select **"Don't optimize"** or **"Not optimized"**
   - This ensures notifications work even when the app is in background

### 3. **Do Not Disturb Settings**
1. Go to **Settings** → **Sound & vibration** → **Do Not Disturb**
2. Tap **"Apps"** or **"App notifications"**
3. Add **BabyBloom** to **"Allowed apps"**
4. This ensures medication reminders show even during Do Not Disturb mode

### 4. **Lock Screen Settings**
1. Go to **Settings** → **Security** → **Lock screen**
2. Enable **"Show notifications"**
3. Set to **"Show all notification content"** for medication reminders

### 5. **Testing Notifications**

#### **Create a Test Reminder:**
1. Open BabyBloom app
2. Go to **Nutrition** → **Dose Reminder**
3. Create a new medication reminder
4. Set the time to **2-3 minutes from now**
5. Save the reminder

#### **Expected Behavior:**
- You should see a popup notification 5 minutes before (or your selected time)
- The notification should appear on the lock screen
- The notification should make a sound and vibrate
- Tapping the notification should open the app

### 6. **Troubleshooting**

#### **If Notifications Don't Work:**

1. **Check App Permissions:**
   - Settings → Apps → BabyBloom → Permissions
   - Ensure **"Notifications"** permission is granted

2. **Check Notification Settings:**
   - Settings → Apps → BabyBloom → Notifications
   - Ensure all notification types are enabled

3. **Restart the App:**
   - Force close BabyBloom
   - Reopen the app
   - Try creating a new reminder

4. **Check Battery Settings:**
   - Ensure BabyBloom is not in battery optimization
   - Check if "Background app refresh" is enabled

5. **Test with Different Times:**
   - Try setting a reminder for 1 minute from now
   - Check if the notification appears

### 7. **Notification Features**

#### **What You'll See:**
- **Popup Notification**: Appears on top of any screen
- **Lock Screen**: Shows on lock screen with medication details
- **Sound & Vibration**: Audible and haptic feedback
- **Action Buttons**: "Mark as Taken" and "Snooze" options

#### **Notification Content:**
- Medication name and dosage
- Person type (Mother/Child)
- Time of day (Morning/Noon/Evening/Night)
- Action buttons for quick response

### 8. **Customization Options**

#### **In App Settings:**
- Go to **Profile** → **Settings** → **Notifications**
- Toggle notifications on/off
- Change notification timing (1, 5, 10, or 15 minutes before)

#### **Android System Settings:**
- Customize notification sound
- Adjust vibration pattern
- Set notification priority
- Configure lock screen display

### 9. **Important Notes**

- **Physical Device Required**: Notifications only work on physical Android devices, not emulators
- **Background Activity**: The app needs to run in background for notifications to work
- **Battery Optimization**: Disable battery optimization for BabyBloom
- **Do Not Disturb**: Add BabyBloom to allowed apps in Do Not Disturb mode

### 10. **Support**

If you're still having issues:
1. Check the console logs in the app
2. Verify all permissions are granted
3. Test with a simple 1-minute reminder
4. Ensure the device is not in airplane mode
5. Check if other apps can send notifications

---

**Remember**: Notifications are crucial for medication reminders, so make sure to properly configure all settings for the best experience!
