# CobroYa App

Mobile app for managing Mercado Pago payments. Built with Expo + React Native.

## Features

- **Dashboard** -- Payment stats, 7-day revenue chart, recent payments
- **Create payments** -- Generate payment links with QR code sharing
- **Search payments** -- Filter by status (approved, pending, rejected, refunded)
- **Payment details** -- Full info with refund capabilities (full + partial)
- **Merchant profile** -- Account information
- **Push notifications** -- Get notified when payments are received
- **Sharing** -- Share payment links via WhatsApp, SMS, email, clipboard, QR code
- **Dark theme** -- Consistent with CobroYa branding
- **Secure storage** -- Access token stored in device keychain
- **Haptic feedback** -- Tactile responses on interactions

## Quick Start

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS simulator / `a` for Android emulator.

## Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for iOS
eas build --platform ios --profile production

# Build for both
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Environment

The app requires a Mercado Pago access token which is entered in the login screen. No `.env` file needed -- the token is securely stored on-device.

## Tech Stack

- **Expo SDK 55** + Expo Router (file-based routing)
- **React Native** 0.83
- **TanStack Query** for data fetching and caching
- **expo-secure-store** for credential storage
- **expo-notifications** for push notifications
- **react-native-chart-kit** for revenue charts
- **react-native-qrcode-svg** for QR code generation
- **expo-haptics** for tactile feedback
- **date-fns** for date formatting

## Project Structure

```
app/
  _layout.tsx       # Root layout with auth guard
  login.tsx         # Token input screen
  create.tsx        # Quick create modal
  settings.tsx      # Currency, logout
  payment/[id].tsx  # Payment detail + refunds
  (tabs)/
    _layout.tsx     # Tab navigation
    index.tsx       # Dashboard with charts
    payments.tsx    # Payment list with filters
    create.tsx      # Full create payment form
    profile.tsx     # Merchant profile
components/         # Reusable UI components
hooks/              # React Query hooks
lib/                # API client, auth, notifications, types
constants/          # Theme colors, spacing, helpers
```

## License

[MIT](../LICENSE) -- by [dan1d](https://dan1d.dev/)
