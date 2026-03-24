# TV Channels - Android TV App

A modern Android TV application built with Flutter that displays IPTV channels with categories, favorites, and video playback.

## Features

✅ **Modern UI Design**: Clean, Netflix-style interface optimized for TV
✅ **Category Sidebar**: Browse channels by category
✅ **Favorites**: Long-press any channel to add/remove from favorites
✅ **Video Playback**: BetterPlayer Plus integration for smooth streaming
✅ **Offline Support**: SQLite database caches channels locally
✅ **Auto-refresh**: Fetches latest channels from remote JSON
✅ **Android TV Optimized**: Leanback launcher support

## Tech Stack

- **Flutter**: Cross-platform framework
- **Dio**: HTTP client for fetching channel data
- **Video Player**: Native video playback with TV remote support
- **SQLite**: Local database for caching
- **Provider**: State management
- **Cached Network Image**: Efficient image loading
- **Wakelock Plus**: Keep screen on during playback

## Setup Instructions

### 1. Prerequisites

```bash
# Install Flutter (if not already installed)
# Visit: https://docs.flutter.dev/get-started/install

# Verify Flutter installation
flutter doctor
```

### 2. Install Dependencies

```bash
cd tv_app
flutter pub get
```

### 3. Run on Android TV / Emulator

```bash
# Connect your Android TV device or start an Android TV emulator
# Verify device is connected
flutter devices

# Run the app
flutter run
```

### 4. Build APK for Android TV

```bash
# Build release APK
flutter build apk --release

# APK will be located at: build/app/outputs/flutter-apk/app-release.apk
# Install on your Android TV device
```

## JSON Data Structure

The app expects a JSON file with the following structure:

```json
[
  {
    "name": "Channel Name",
    "url": "http://stream-url.com/stream.m3u8",
    "logo": "http://logo-url.com/logo.png",
    "category": "Sports"
  }
]
```

**Supported JSON keys** (flexible mapping):
- `name` / `title` → Channel name
- `url` / `stream_url` → Stream URL
- `logo` / `icon` / `image` → Logo URL
- `category` / `group` → Category name

## Usage

### Android TV Remote Control
**Main Screen:**
- **D-Pad arrows** - Navigate between channels and categories
- **Select/Enter** - Play selected channel
- **Menu/Info button** - Open channel options (Add to Favorites)
- **Back button** - Exit app

**Video Player:**
- **Select/Enter** - Play/Pause
- **Left Arrow / Channel Down** - Previous channel
- **Right Arrow / Channel Up** - Next channel
- **Back button** - Return to channel list
- **Up/Down arrows** - Show/hide controls

### Touch Controls (for mobile/tablet)
- **Tap** on a channel card to play
- **Long-press** on a channel to open context menu
- Click sidebar categories to filter channels

### Context Menu Options
- Add/Remove from Favorites
- Play Channel

### Refresh Channels
Click the "Refresh" button in the sidebar to fetch latest channels from the server.

## Customization

### Change Channel Source URL

Edit `lib/services/api_service.dart`:

```dart
static const String channelsUrl = 'YOUR_JSON_URL_HERE';
```

### Modify Theme Colors

Edit `lib/main.dart` and update the color values:

```dart
primaryColor: const Color(0xFFE50914), // Red accent
scaffoldBackgroundColor: const Color(0xFF0F0F0F), // Dark background
```

### Adjust Grid Layout

Edit `lib/screens/home_screen.dart`:

```dart
gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
  crossAxisCount: 4, // Number of columns
  childAspectRatio: 1.2, // Card aspect ratio
  crossAxisSpacing: 20,
  mainAxisSpacing: 20,
),
```

## Troubleshooting

### Issue: "No channels available"
- Check your internet connection
- Verify the JSON URL is accessible
- Check JSON format matches expected structure

### Issue: Video won't play
- Ensure stream URL is valid and accessible
- Check if stream format is supported (HLS/M3U8 recommended)
- Verify internet connection

### Issue: App doesn't appear on TV launcher
- Ensure AndroidManifest.xml has `LEANBACK_LAUNCHER` category
- Rebuild and reinstall the app

## Project Structure

```
tv_app/
├── lib/
│   ├── models/
│   │   └── channel.dart          # Channel data model
│   ├── providers/
│   │   └── channel_provider.dart # State management
│   ├── screens/
│   │   ├── home_screen.dart      # Main screen with sidebar & grid
│   │   └── player_screen.dart    # Video player screen
│   ├── services/
│   │   ├── api_service.dart      # API/network calls
│   │   └── database_helper.dart  # SQLite operations
│   └── main.dart                 # App entry point
└── pubspec.yaml                  # Dependencies
```

## License

This project is open source and available for modification.

## Support

For issues or questions, check the Flutter and BetterPlayer documentation:
- [Flutter Docs](https://docs.flutter.dev)
- [BetterPlayer Plus](https://pub.dev/packages/better_player_plus)
