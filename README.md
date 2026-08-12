# Calories

![Calories Tracker](https://github.com/AnasMansha/calories-tracker-app/blob/main/assets/android-icon-foreground.png)

A simple calorie tracker built with Expo. Log meals by day, watch progress against your daily goal, and review history and stats — all offline on device.

## Features

- **Daily logging** — add, edit, and delete food entries by meal (breakfast, lunch, dinner, snack, other)
- **Goal tracking** — set a calorie target and see progress on the home ring
- **Statistics** — summaries and charts for recent ranges
- **History** — browse past days and open day details
- **Settings** — theme preference, week start, target name, JSON/CSV export & import, clear data
- **Onboarding** — first-run setup for your daily calorie goal

Data is stored locally with AsyncStorage (no account required).

## Stack

- Expo SDK 57 / React Native
- TypeScript
- React Navigation (tabs + native stack)
- Zustand for state
- date-fns, react-native-svg, Expo File System / Sharing / Document Picker

## Requirements

- Node.js 20+
- npm
- Expo Go or a development build (iOS Simulator / Android emulator / device)

## Getting started

```bash
npm install
npm start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

| Script | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` | Open on Android |
| `npm run ios` | Open on iOS |
| `npm run web` | Open in the browser |

## Project layout

```
App.tsx                 # App entry / providers
src/
  screens/              # Home, Statistics, History, Settings, Add/Edit Food, …
  components/           # UI and feature components
  navigation/           # Tab + stack navigators
  store/                # Zustand store + persistence
  theme/                # Theme tokens and provider
  utils/                # Dates, export, stats, insights
```

## Builds (EAS)

This project includes `eas.json` profiles for development, preview (APK), and production. With the EAS CLI installed and logged in:

```bash
eas build --platform android --profile preview
eas build --platform ios --profile production
```

## License

Private project (`"private": true` in `package.json`).
