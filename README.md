# Smart Transport Ghana

A React Native/Expo application for real-time ride-hailing in Ghana. Features passenger and driver modes with demo authentication.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Expo CLI** (installed via npx)

### Installation

```bash
# Navigate to the project directory
cd smart_transport_ghana/flutter

# Install dependencies (using legacy peer deps due to React 19 compatibility)
npm install --legacy-peer-deps
```

### Development

```bash
# Start the development server
npx expo start

# Or start with specific options
npx expo start --localhost --port 8081
```

This will start the Metro bundler and show a QR code. You can:

| Platform | How to Access |
|----------|---------------|
| **Web** | Press `w` in terminal, or open http://localhost:8081 |
| **iOS** | Scan QR code with Camera app, or press `i` in terminal |
| **Android** | Scan QR code with Expo Go app, or press `a` in terminal |

### Demo Credentials

The app includes demo accounts for testing:

| Role | Email | Password |
|------|-------|----------|
| **Passenger** | `passenger@demo.com` | `Pass1234!` |
| **Driver** | `driver@demo.com` | `Drive1234!` |

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (configured for Replit environment) |
| `npm run build` | Build production static files (outputs to `static-build/`) |
| `npm run serve` | Serve production build (requires build first) |
| `npm run typecheck` | Run TypeScript type checking |

### Build for Production

```bash
# Build static files for web deployment
npm run build

# Serve the production build locally
npm run serve
```

The production server will be available at http://localhost:3000

## 🏗️ Project Structure

```
flutter/
├── app/                    # Expo Router pages
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Main screen (login, passenger, driver)
│   ├── (tabs)/             # Tab navigation
│   └── +not-found.tsx      # 404 screen
├── components/             # Reusable UI components
│   ├── ErrorBoundary.tsx   # Error boundary wrapper
│   ├── ErrorFallback.tsx   # Error UI with restart option
│   └── KeyboardAwareScrollViewCompat.tsx
├── context/
│   └── TransportContext.tsx # Global state (user, ride, auth)
├── hooks/
│   └── useColors.ts        # Color scheme hook
├── constants/
│   └── colors.ts           # Design tokens (light/dark)
├── scripts/
│   └── build.js            # Production build script
├── server/
│   └── serve.js            # Production static file server
└── assets/
    └── images/             # App icons and images
```

## 🛠️ Technology Stack

- **Framework**: Expo 54 + React Native 0.81
- **Routing**: Expo Router 6 (file-based routing)
- **State**: React Context + useReducer pattern
- **Storage**: AsyncStorage for persistence
- **Styling**: StyleSheet + custom design tokens
- **TypeScript**: Strict mode enabled
- **Build**: Custom Node.js build script for static export

## 🔧 Configuration Notes

### TypeScript Configuration

The project uses strict TypeScript with path aliases (`@/*`). Key config in `tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Known Version Constraints

Due to dependency compatibility, these packages are pinned to specific versions:

| Package | Version | Reason |
|---------|---------|--------|
| `react` | 19.1.0 | Compatible with react-native 0.81 |
| `react-dom` | 19.1.0 | Matching React version |
| `expo-modules-core` | 3.0.29 | Required for build output |
| `expo-router` | 6.0.17 | Includes required assets |
| `babel-preset-expo` | 57.0.9 | Compatible with React Compiler |

### React Compiler

The project uses React Compiler (experimental) enabled in `app.json`:

```json
{
  "expo": {
    "experiments": {
      "reactCompiler": true
    }
  }
}
```

## 🐛 Troubleshooting

### Metro bundler issues
```bash
# Clear Metro cache
npx expo start --clear
```

### Dependency issues
```bash
# Reinstall with legacy peer deps
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### TypeScript errors
```bash
# Run type check
npm run typecheck
```

### Port already in use
```bash
# Use different port
npx expo start --port 8082
```

## 📱 Demo Features

- **Passenger Mode**: Request rides, track driver, view trip history
- **Driver Mode**: Go online/offline, accept rides, navigate to pickup/dropoff
- **Real-time tracking**: Simulated ride progress with ETA
- **Offline persistence**: User session and ride state saved to AsyncStorage

## 📄 License

Private project - Smart Transport Ghana