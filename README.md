# PoolUp Frontend

A React Native app built with Expo for collaborative savings and group travel planning.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run ios
npm run android
npm run web
```

## 🏗️ Production Deployment

### Web Deployment (Render)
The app is configured for automatic deployment to Render using the `render.yaml` configuration.

```bash
# Build for production
npm run build:web

# The build outputs to ./dist for static hosting
```

### Mobile App Deployment (EAS Build)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS (first time only)
eas login
eas build:configure

# Build for production
eas build --platform all --profile production

# Submit to app stores
eas submit --platform all
```

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=https://poolup-api.onrender.com
EXPO_PUBLIC_ENVIRONMENT=production

# App Configuration  
EXPO_PUBLIC_APP_SCHEME=poolup
EXPO_PUBLIC_DEEP_LINK_URL=https://www.getpoolup.com
```

### Build Profiles
- **Development**: Local development with hot reload
- **Preview**: Internal testing builds
- **Production**: App store and web deployment builds

## 📱 Features

### Core Features
- ✅ User authentication (Guest & Google OAuth)
- ✅ Pool creation and management
- ✅ Real-time savings tracking
- ✅ Friends system
- ✅ Badge/achievement system
- ✅ Profile management
- ✅ Smart savings calculator
- ✅ Privacy settings

### UX Enhancements
- ✅ Loading states for all API calls
- ✅ Error handling with retry options
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Intuitive navigation

## 🏛️ Architecture

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation 6
- **State Management**: React Hooks + Context
- **API Client**: Fetch with custom error handling
- **Storage**: AsyncStorage for local data
- **Styling**: StyleSheet with custom theme system

### Project Structure
```
src/
├── screens/          # Screen components
├── components/       # Reusable UI components  
├── services/         # API and business logic
├── theme/           # Colors, fonts, spacing
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## 🔗 API Integration

The app connects to the PoolUp backend API with full error handling:

- **Base URL**: Configurable via environment variables
- **Authentication**: User ID headers for API requests
- **Error Handling**: Graceful fallbacks and user-friendly messages
- **Loading States**: Visual feedback for all async operations

## 🎨 Design System

### Theme
- **Colors**: Purple primary, coral accents, clean whites/grays
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8px grid system
- **Radius**: Consistent border radius values

### Components
- Reusable UI components with consistent styling
- Loading skeletons for better perceived performance
- Error states with retry functionality
- Empty states with encouraging messaging

## 🧪 Development

### Code Quality
- TypeScript for type safety
- ESLint for code consistency
- Proper error boundaries
- Comprehensive error logging

### Performance
- Optimized bundle size
- Lazy loading where appropriate
- Efficient re-renders with proper memoization
- Image optimization

## 📦 Deployment Status

### Current Status: Production Ready ✅

- ✅ All mock data removed
- ✅ Real API integration complete
- ✅ Error handling implemented
- ✅ Loading states added
- ✅ Production configuration ready
- ✅ Build system configured
- ✅ Environment variables set up

### Deployment Options

1. **Web**: Automatic deployment via Render
2. **Mobile**: EAS Build for iOS/Android app stores
3. **Development**: Expo Go for testing

## 🚨 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Metro Bundle Issues**
```bash
# Reset Metro cache
npx expo start --clear
```

**EAS Build Issues**
```bash
# Check build status
eas build:list
```

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review error logs in the console
- Ensure all environment variables are set correctly
- Verify API connectivity

---

**Built with ❤️ for collaborative savings and group travel**
