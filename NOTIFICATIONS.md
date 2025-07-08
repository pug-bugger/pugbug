# PugBug Notification System

A comprehensive client-side notification system for tracking truck inspection and insurance deadlines.

## Features

### ✅ Core Functionality

- **Daily Notifications**: Automated daily checks at a user-configurable time (default: 7:00 AM)
- **Deadline Monitoring**: Tracks insurance and tech inspection deadlines
- **Customizable Warning Period**: User can set warning days (3, 7, 14, or 30 days before deadline)
- **Background Operation**: Works even when the app is closed or in background
- **Cross-Platform**: Works on both Android and iOS

### ✅ User Interface

- **Notification Settings Screen**: Complete settings management interface
- **Permission Management**: Easy permission request and status display
- **Test Functionality**: Send test notifications and manual deadline checks
- **Visual Indicators**: Color-coded deadline status with icons
- **Header Warnings**: Real-time deadline summaries in the main screen

### ✅ Smart Features

- **Duplicate Prevention**: Prevents multiple notifications on the same day
- **Contextual Notifications**: Different messages based on single/multiple trucks and deadlines
- **Automatic Rescheduling**: Updates notifications when truck data changes
- **Status Integration**: Visual indicators in truck list showing deadline status

## Architecture

### Components

1. **NotificationService** (`services/NotificationService.ts`)

   - Core notification logic
   - Background task management
   - Deadline checking algorithms
   - Local storage integration

2. **NotificationContext** (`contexts/NotificationContext.tsx`)

   - React Context for state management
   - Custom hooks for easy component integration
   - Centralized error handling

3. **NotificationSettings** (`components/NotificationSettings.tsx`)

   - User interface for notification configuration
   - Permission management
   - Test functions

4. **useNotificationIntegration** (`hooks/useNotificationIntegration.ts`)
   - Integration with truck management
   - Deadline status utilities
   - Automatic notification scheduling

### Data Flow

```
Trucks Data → Notification Integration → Background Tasks → Local Notifications
     ↓                    ↓                      ↓                ↓
  Storage           Auto-scheduling        Daily checks      User alerts
```

## Usage

### Basic Setup

1. **Install Dependencies**:

   ```bash
   npx expo install expo-notifications expo-device expo-task-manager @react-native-community/datetimepicker
   ```

2. **Wrap App with Provider**:

   ```tsx
   import { NotificationProvider } from "@/contexts/NotificationContext";

   export default function App() {
     return (
       <NotificationProvider>{/* Your app content */}</NotificationProvider>
     );
   }
   ```

3. **Use in Components**:

   ```tsx
   import { useNotifications } from "@/contexts/NotificationContext";

   function MyComponent() {
     const { settings, requestPermissions } = useNotifications();
     // Component logic
   }
   ```

### Configuration

#### Notification Settings

- **Enable/Disable**: Toggle notifications on/off
- **Daily Time**: Set when daily checks occur (24-hour format)
- **Warning Days**: Configure how many days before deadline to warn
- **Timezone**: Defaults to Europe/Vilnius, configurable

#### Permissions

- **Android**: Automatically requests notification permissions
- **iOS**: Requests alert, badge, and sound permissions
- **Background**: Registers background tasks for closed-app functionality

### Integration with Trucks

The notification system automatically integrates with truck data:

```tsx
import { useNotificationIntegration } from "@/hooks/useNotificationIntegration";

function TruckList() {
  const {
    getTrucksWithUpcomingDeadlines,
    getTruckDeadlineStatus,
    isNotificationSetupComplete,
  } = useNotificationIntegration();

  // Automatically updates when truck data changes
}
```

## API Reference

### NotificationService Methods

```typescript
// Permission management
requestPermissions(): Promise<NotificationPermissionStatus>
getPermissionStatus(): Promise<NotificationPermissionStatus>

// Settings
getSettings(): Promise<NotificationSettings>
updateSettings(settings: Partial<NotificationSettings>): Promise<void>

// Manual operations
triggerManualCheck(): Promise<void>
sendTestNotification(): Promise<void>

// Enable/disable
enable(): Promise<void>
disable(): Promise<void>
```

### Custom Hooks

```typescript
// Main hook
useNotifications(): NotificationContextType

// Specialized hooks
useNotificationSettings(): { settings, updateSettings, isLoading, error }
useNotificationPermissions(): { permissionStatus, requestPermissions, ... }
useNotificationActions(): { sendTestNotification, triggerManualCheck, ... }
useNotificationIntegration(): { getTrucksWithUpcomingDeadlines, ... }
```

## Background Tasks

### How It Works

1. **Task Registration**: Background tasks are registered when permissions are granted
2. **Daily Scheduling**: Notifications are scheduled using Expo's daily trigger
3. **Deadline Checking**: Background tasks check truck deadlines against warning thresholds
4. **Smart Notifications**: Only sends notifications when deadlines are actually approaching

### Limitations

- **iOS**: Background execution is limited by the system
- **Android**: Doze mode may delay notifications
- **Client-side Only**: No server-side backup (as requested)

## Testing

### Manual Testing

1. **Test Notification**: Use the "Send Test Notification" button
2. **Manual Check**: Trigger deadline checking manually
3. **Permission Testing**: Test permission request flow
4. **Settings Testing**: Verify all settings persist correctly

### Deadline Testing

1. Create trucks with deadlines in the warning period
2. Set warning days to 30 for easier testing
3. Use manual check to verify logic
4. Check visual indicators in truck list

## Troubleshooting

### Common Issues

1. **Notifications Not Appearing**

   - Check device notification settings
   - Verify permissions are granted
   - Test with manual notification first

2. **Background Tasks Not Running**

   - Ensure app has background app refresh enabled
   - Check device battery optimization settings
   - Verify permissions are properly granted

3. **Timezone Issues**
   - Notifications use device local time
   - Default timezone is Europe/Vilnius
   - Can be configured in settings

### Debug Information

Enable debug logging by checking the console for:

- `Daily notification scheduled for XX:XX`
- `Background notification task triggered`
- `Deadline notification sent`

## Future Enhancements

Potential improvements for the notification system:

1. **Additional Deadline Types**: Support for more truck-related deadlines
2. **Custom Notification Sounds**: Per-deadline-type notification sounds
3. **Snooze Functionality**: Ability to snooze notifications
4. **Notification History**: Track sent notifications
5. **Advanced Scheduling**: Multiple daily checks or custom intervals
6. **Export/Import Settings**: Backup and restore notification settings

## Dependencies

- `expo-notifications`: Core notification functionality
- `expo-device`: Device information and validation
- `expo-task-manager`: Background task management
- `@react-native-community/datetimepicker`: Time selection UI
- `@react-native-async-storage/async-storage`: Local data persistence

## Security & Privacy

- All data stored locally on device
- No external API calls for notifications
- User has full control over notification settings
- Permissions requested transparently with clear explanations
