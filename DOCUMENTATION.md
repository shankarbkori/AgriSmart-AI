# AgriSmart AI - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Tech Stack Explanation](#tech-stack-explanation)
4. [Folder Structure & Module Origin](#folder-structure--module-origin)
5. [Functional Modules](#functional-modules)
6. [Data Flow Explanation](#data-flow-explanation)
7. [How the Project Runs](#how-the-project-runs)
8. [System Handling](#system-handling)
9. [Third-Party Dependencies](#third-party-dependencies)
10. [Optimizations & Security](#optimizations--security)
11. [Deployment Workflow](#deployment-workflow)
12. [Future Enhancements](#future-enhancements)

---

## 📌 1. Project Overview

### What is AgriSmart AI?

**AgriSmart AI** is an AI-powered agricultural decision support system designed to help farmers make data-driven decisions about crop management. It provides intelligent recommendations based on real-time weather data, soil conditions, and AI-powered disease detection.

### Purpose

The platform aims to:
- Predict crop yields based on environmental factors
- Recommend optimal crops for specific soil and climate conditions
- Detect plant diseases from images using AI
- Provide real-time weather insights for farm management
- Enable farmers to make informed agricultural decisions

### User Types

- **Farmers**: Primary users who need crop recommendations and yield predictions
- **Agricultural Consultants**: Use the system to advise multiple farms
- **Agri-businesses**: Monitor and optimize agricultural operations
- **Research Organizations**: Analyze agricultural patterns and trends

### High-Level Goals

1. **Accessibility**: Simple, intuitive interface for users with varying technical skills
2. **Accuracy**: AI-powered predictions based on scientific algorithms
3. **Real-time Data**: Integration with live weather APIs
4. **Scalability**: Serverless architecture for handling multiple users
5. **Security**: Protected user data with authentication

---

## 📌 2. System Architecture

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                    (React + TypeScript)                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ├──► State Management (TanStack Query)
                  │
                  ├──► UI Components (shadcn/ui + Tailwind CSS)
                  │
                  └──► Routing (React Router)
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                    API Layer (Edge Functions)                    │
│                     Lovable Cloud / Supabase                     │
├─────────────────────────────────────────────────────────────────┤
│  • predict-crop-yield      • recommend-crops                     │
│  • detect-disease          • get-weather                         │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ├──► Lovable AI Gateway (Gemini Vision)
                  │
                  ├──► OpenWeather API
                  │
                  └──► Open-Meteo API (Rainfall Data)
                  │
┌─────────────────▼───────────────────────────────────────────────┐
│                    Supabase Authentication                       │
│              (User Management & Session Handling)                │
└─────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    App Component (Root)                       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Query Client Provider (TanStack Query)                │  │
│  │  ├─ Toast Provider                                     │  │
│  │  ├─ Tooltip Provider                                   │  │
│  │  └─ Browser Router                                     │  │
│  │     ├─ / → Index (Dashboard)                           │  │
│  │     ├─ /auth → Auth (Login/Signup)                     │  │
│  │     └─ * → NotFound                                    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Index Page (Main Dashboard)                      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Tabs Component                                        │  │
│  │  ├─ Crop Yield Prediction                              │  │
│  │  ├─ Crop Recommendation                                │  │
│  │  ├─ Weather Dashboard                                  │  │
│  │  └─ Disease Detection                                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Backend Architecture (Lovable Cloud / Supabase)

```
┌──────────────────────────────────────────────────────────────┐
│                    Edge Functions (Deno)                      │
│                                                               │
│  ┌────────────────────┐    ┌─────────────────────┐          │
│  │ predict-crop-yield │    │ recommend-crops     │          │
│  │ - Yield Algorithm  │    │ - Crop Scoring      │          │
│  │ - Env Factors      │    │ - Confidence Calc   │          │
│  └────────────────────┘    └─────────────────────┘          │
│                                                               │
│  ┌────────────────────┐    ┌─────────────────────┐          │
│  │ detect-disease     │    │ get-weather         │          │
│  │ - AI Vision API    │    │ - OpenWeather API   │          │
│  │ - Disease DB       │    │ - Open-Meteo API    │          │
│  │ - Treatment Info   │    │ - pH Estimation     │          │
│  └────────────────────┘    └─────────────────────┘          │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  Supabase Authentication                      │
│  - Email/Password Auth                                        │
│  - Session Management                                         │
│  - Auto-confirm Email                                         │
│  - Password Reset                                             │
└──────────────────────────────────────────────────────────────┘
```

### Database Structure

Currently, the system uses serverless edge functions without persistent database tables. Future implementation may include:

```sql
-- Users profile (future)
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  full_name TEXT,
  location TEXT,
  farm_size DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Yield history (future)
CREATE TABLE yield_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  crop_type TEXT NOT NULL,
  area DECIMAL NOT NULL,
  predicted_yield DECIMAL NOT NULL,
  actual_yield DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disease scans (future)
CREATE TABLE disease_scans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  image_url TEXT NOT NULL,
  detected_disease TEXT NOT NULL,
  confidence DECIMAL NOT NULL,
  treatment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Communication Flow

```
Frontend (React)
    │
    ├─► TanStack Query (useMutation)
    │
    ├─► fetch() → Edge Function URL
    │        │
    │        ├─► Headers: Content-Type, Authorization
    │        ├─► Body: JSON payload
    │        └─► Method: POST
    │
    └─► Response
         │
         ├─► Success: Update UI state
         ├─► Error: Show toast notification
         └─► Loading: Display spinner
```

### Design Principles

1. **Progressive Enhancement**: Core functionality works without JavaScript
2. **Responsive Design**: Mobile-first approach, works on all screen sizes
3. **Accessibility**: WCAG 2.1 compliant, keyboard navigation support
4. **Performance**: Code splitting, lazy loading, optimized assets
5. **Type Safety**: Full TypeScript coverage for compile-time error detection

---

## 📌 3. Tech Stack Explanation

### Frontend Technologies

#### Vite
**Purpose**: Build tool and development server

**Why Vite?**
- **Lightning-fast HMR**: Hot Module Replacement updates in milliseconds
- **Optimized builds**: Uses Rollup for production, creating smaller bundles
- **Native ESM**: Leverages browser-native ES modules for faster dev experience
- **Plugin ecosystem**: Rich ecosystem for React, TypeScript support

**Configuration** (`vite.config.ts`):
```typescript
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), componentTagger()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### React 18.3.1
**Purpose**: UI library for building component-based interfaces

**Why React?**
- **Component reusability**: Build once, use anywhere
- **Virtual DOM**: Efficient UI updates and rendering
- **Rich ecosystem**: Large community, extensive libraries
- **Hooks**: Modern state management with useState, useEffect
- **Concurrent features**: Better user experience with transitions

**Key React Patterns Used**:
- **Functional Components**: All components use modern function syntax
- **Custom Hooks**: Encapsulated logic (e.g., `useMutation` from TanStack Query)
- **Controlled Components**: Form inputs managed by React state
- **Composition**: Building complex UIs from simple components

#### TypeScript
**Purpose**: Type-safe JavaScript superset

**Why TypeScript?**
- **Type safety**: Catch errors at compile time, not runtime
- **IntelliSense**: Better IDE autocomplete and documentation
- **Refactoring confidence**: Safe code changes with type checking
- **Self-documenting code**: Types serve as inline documentation

**Type System Example**:
```typescript
interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  ph: number;
}

interface CropRecommendation {
  crop: string;
  confidence: number;
  reasoning: string;
}
```

### State Management

#### TanStack Query (React Query)
**Purpose**: Server state management and data fetching

**Why TanStack Query?**
- **Automatic caching**: Reduces unnecessary API calls
- **Background refetching**: Keeps data fresh automatically
- **Loading/error states**: Built-in state management
- **Optimistic updates**: Better UX with instant feedback
- **Request deduplication**: Prevents duplicate requests

**Usage Pattern**:
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
  onSuccess: (data) => {
    toast({ title: "Success!" });
  },
  onError: (error) => {
    toast({ title: "Error", variant: "destructive" });
  },
});
```

### UI Framework

#### Tailwind CSS
**Purpose**: Utility-first CSS framework

**Why Tailwind?**
- **Rapid development**: No context switching between HTML and CSS
- **Design consistency**: Standardized spacing, colors, typography
- **Responsive design**: Mobile-first breakpoints built-in
- **Small bundle size**: Only used classes are included
- **Customization**: Easy theme customization via config

**Configuration** (`tailwind.config.ts`):
```typescript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        // ... semantic color tokens
      },
    },
  },
};
```

#### shadcn/ui
**Purpose**: Component library built on Radix UI

**Why shadcn/ui?**
- **Copy-paste components**: Own the code, not a dependency
- **Accessible**: Built on Radix UI primitives (WCAG compliant)
- **Customizable**: Full control over styling and behavior
- **Composable**: Build complex UIs from simple primitives
- **Type-safe**: Full TypeScript support

**Components Used**:
- Button, Card, Input, Textarea
- Tabs, Select, Label
- Toast, Toaster (notifications)
- Dialog, Sheet (modals)

### Backend Technologies

#### Lovable Cloud (Supabase)
**Purpose**: Backend-as-a-Service platform

**Why Lovable Cloud?**
- **Serverless**: No server management, auto-scaling
- **Real-time**: WebSocket support for live updates
- **Authentication**: Built-in user management
- **Edge Functions**: Serverless compute at the edge
- **PostgreSQL**: Robust relational database

**Features Used**:
- **Authentication**: Email/password, session management
- **Edge Functions**: API endpoints for business logic
- **Secrets Management**: Secure API key storage

#### Deno (Edge Functions Runtime)
**Purpose**: Runtime for serverless functions

**Why Deno?**
- **Secure by default**: Explicit permissions required
- **TypeScript native**: No build step needed
- **Web standard APIs**: Uses fetch, FormData, etc.
- **Fast cold starts**: Quick function initialization

### External Integrations

#### OpenWeather API
**Purpose**: Real-time weather data

**Features Used**:
- Current weather (temperature, humidity, pressure)
- Wind speed and direction
- Cloud cover and visibility
- Location-based weather

#### Open-Meteo API
**Purpose**: Historical rainfall data

**Why Open-Meteo?**
- **Free**: No API key required
- **Reliable**: High-quality weather data
- **Historical data**: Past 12 months of rainfall

#### Lovable AI Gateway (Gemini Vision)
**Purpose**: AI-powered image analysis

**Features**:
- Plant disease detection from images
- Multi-modal AI (text + images)
- No API key required (handled by Lovable)

**Supported Models**:
- `google/gemini-2.5-pro`: Best for complex reasoning + images
- `google/gemini-2.5-flash`: Balanced performance
- `openai/gpt-5`: General-purpose AI (if needed)

### Routing

#### React Router v6
**Purpose**: Client-side routing

**Routes**:
- `/` - Main dashboard (protected)
- `/auth` - Login/signup page
- `*` - 404 Not Found page

---

## 📌 4. Folder Structure & Module Origin

### Project Structure

```
agrismart-ai/
│
├── public/                        # Static assets
│   ├── robots.txt                 # SEO crawling rules
│   └── favicon.ico                # App icon
│
├── src/                           # Source code
│   ├── components/                # React components
│   │   ├── ui/                    # shadcn/ui components (third-party)
│   │   │   ├── button.tsx         # Button component
│   │   │   ├── card.tsx           # Card component
│   │   │   ├── input.tsx          # Input component
│   │   │   ├── tabs.tsx           # Tabs component
│   │   │   ├── toast.tsx          # Toast notification
│   │   │   └── ... (40+ components)
│   │   │
│   │   ├── CropRecommendation.tsx # Custom - Crop recommendation form
│   │   ├── CropYieldPrediction.tsx# Custom - Yield prediction form
│   │   ├── DiseaseDetection.tsx   # Custom - Disease detection UI
│   │   └── WeatherDashboard.tsx   # Custom - Weather display
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-mobile.tsx         # Custom - Mobile breakpoint detection
│   │   └── use-toast.ts           # Custom - Toast notification hook
│   │
│   ├── integrations/              # External service integrations
│   │   └── supabase/              # Supabase integration
│   │       ├── client.ts          # Auto-generated - Supabase client
│   │       └── types.ts           # Auto-generated - Database types
│   │
│   ├── lib/                       # Utility functions
│   │   └── utils.ts               # Third-party - Class name utilities
│   │
│   ├── pages/                     # Page components
│   │   ├── Index.tsx              # Custom - Main dashboard
│   │   ├── Auth.tsx               # Custom - Login/signup page
│   │   └── NotFound.tsx           # Custom - 404 error page
│   │
│   ├── App.tsx                    # Custom - Root application component
│   ├── App.css                    # Custom - Global styles
│   ├── index.css                  # Custom - Design system tokens
│   ├── main.tsx                   # Custom - Application entry point
│   └── vite-env.d.ts              # Auto-generated - Vite types
│
├── supabase/                      # Backend code
│   ├── functions/                 # Edge functions
│   │   ├── predict-crop-yield/
│   │   │   └── index.ts           # Custom - Yield prediction logic
│   │   ├── recommend-crops/
│   │   │   └── index.ts           # Custom - Crop recommendation logic
│   │   ├── detect-disease/
│   │   │   └── index.ts           # Custom - Disease detection logic
│   │   └── get-weather/
│   │       └── index.ts           # Custom - Weather API integration
│   │
│   └── config.toml                # Auto-generated - Supabase configuration
│
├── docs/                          # Documentation
│   └── IMPLEMENTATION.md          # Custom - Implementation guide
│
├── index.html                     # HTML entry point
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── vite.config.ts                 # Vite configuration
└── README.md                      # Project overview
```

### Module Origin Breakdown

#### `/src/components/ui/` (Third-Party - shadcn/ui)
All components in this folder are from **shadcn/ui**, which copies components into your project:

- **Source**: https://ui.shadcn.com/
- **Base Library**: Radix UI primitives
- **Customizable**: Yes (you own the code)
- **Examples**: `button.tsx`, `card.tsx`, `tabs.tsx`, `input.tsx`

#### `/src/components/` (Custom Built)
Main feature components built specifically for AgriSmart:

**CropRecommendation.tsx**
- **Purpose**: Form for crop recommendation based on soil/weather
- **Features**: Auto-location, weather API integration, form validation
- **Dependencies**: shadcn/ui, TanStack Query, Supabase client

**CropYieldPrediction.tsx**
- **Purpose**: Predict crop yield based on inputs
- **Features**: Dynamic form fields, yield calculation display
- **Dependencies**: shadcn/ui, TanStack Query

**DiseaseDetection.tsx**
- **Purpose**: Upload plant images for disease detection
- **Features**: Image upload, AI analysis, treatment recommendations
- **Dependencies**: Lovable AI Gateway, shadcn/ui

**WeatherDashboard.tsx**
- **Purpose**: Display current weather and climate data
- **Features**: Geolocation, weather API, monthly rainfall charts
- **Dependencies**: OpenWeather API, Open-Meteo API

#### `/src/hooks/` (Custom Built)
**use-mobile.tsx**
- **Purpose**: Detect mobile screen size
- **Implementation**: Uses `matchMedia` API
- **Returns**: Boolean indicating mobile viewport

**use-toast.ts**
- **Purpose**: Toast notification management
- **Implementation**: Wraps shadcn/ui toast system
- **Exports**: `useToast` hook, `toast` function

#### `/src/integrations/supabase/` (Auto-Generated)
**client.ts**
- **Source**: Auto-generated by Lovable Cloud
- **Purpose**: Supabase client instance
- **Configuration**: Auth persistence, auto-refresh tokens

**types.ts**
- **Source**: Auto-generated from database schema
- **Purpose**: TypeScript types for database tables
- **Note**: Read-only, regenerates on schema changes

#### `/src/lib/` (Third-Party Utility)
**utils.ts**
- **Source**: shadcn/ui utility
- **Purpose**: Class name merging with Tailwind
- **Function**: `cn()` - Combines class names intelligently

#### `/src/pages/` (Custom Built)
**Index.tsx**
- **Purpose**: Main authenticated dashboard
- **Features**: Session management, logout, tab navigation
- **Layout**: Header + tabbed interface for features

**Auth.tsx**
- **Purpose**: Login and signup page
- **Features**: Email/password auth, form validation
- **Integration**: Supabase Auth

**NotFound.tsx**
- **Purpose**: 404 error page
- **Features**: Friendly error message, navigation back

#### `/supabase/functions/` (Custom Built)
**predict-crop-yield/index.ts**
- **Purpose**: Calculate predicted crop yield
- **Algorithm**: Base yield × environmental factors
- **Input**: Crop type, area, rainfall, fertilizer, pesticide, temp, humidity
- **Output**: Predicted yield in kg/hectare

**recommend-crops/index.ts**
- **Purpose**: Suggest optimal crops
- **Algorithm**: Weighted scoring based on NPK, pH, climate
- **Input**: N, P, K, pH, temperature, humidity, rainfall, season
- **Output**: Top 3 crops with confidence scores

**detect-disease/index.ts**
- **Purpose**: Identify plant diseases from images
- **AI Model**: Google Gemini Vision (via Lovable AI Gateway)
- **Database**: Hardcoded disease information with treatments
- **Output**: Disease name, confidence, treatment details

**get-weather/index.ts**
- **Purpose**: Fetch real-time weather and rainfall data
- **APIs**: OpenWeather (current), Open-Meteo (historical rainfall)
- **Features**: pH estimation, mock data fallback
- **Output**: Temperature, humidity, rainfall, soil pH estimate

---

## 📌 5. Functional Modules

### Module 1: User Authentication

#### Purpose
Secure user registration, login, and session management using Supabase Auth.

#### Components
- **Auth.tsx**: Login/signup UI with forms
- **Index.tsx**: Session verification and logout

#### Implementation Details

**Registration Flow**:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
});

if (error) {
  toast({
    title: "Registration Failed",
    description: error.message,
    variant: "destructive",
  });
} else {
  toast({
    title: "Success",
    description: "Account created! Please log in.",
  });
}
```

**Login Flow**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});

if (!error) {
  navigate("/"); // Redirect to dashboard
}
```

**Session Check** (on page load):
```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
    setLoading(false);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () => subscription.unsubscribe();
}, [navigate]);
```

**Logout**:
```typescript
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    navigate("/auth");
  }
};
```

#### Features
- Email/password authentication
- Encrypted password storage (handled by Supabase)
- Session persistence (localStorage)
- Auto-refresh tokens
- Protected routes (redirect if not authenticated)
- Auto-confirm email (no email verification needed for development)

#### User Flow
1. User visits `/auth` page
2. Chooses between Login or Sign Up tabs
3. Enters email and password
4. On success, redirected to `/` (dashboard)
5. Session stored in browser
6. Can logout via button in header

---

### Module 2: Crop Yield Prediction

#### Purpose
Predict crop yield based on environmental and agricultural inputs using a simplified scientific algorithm.

#### Components
- **CropYieldPrediction.tsx**: Frontend form and results display
- **supabase/functions/predict-crop-yield/index.ts**: Backend calculation logic

#### Algorithm

**Input Parameters**:
- Crop type (Rice, Wheat, Maize, Cotton, etc.)
- Area (hectares)
- Rainfall (mm)
- Fertilizer usage (kg)
- Pesticide usage (kg)
- Temperature (°C)
- Humidity (%)

**Calculation Logic**:
```typescript
// Base yields (kg per hectare) for each crop
const baseYields = {
  Rice: 4500,
  Wheat: 3200,
  Maize: 5800,
  Cotton: 1200,
  // ... more crops
};

// Get base yield for crop
let predictedYield = baseYields[cropType] || 3000;

// Apply rainfall adjustment
if (rainfall < 400) {
  predictedYield *= 0.6; // Drought stress
} else if (rainfall > 400 && rainfall < 800) {
  predictedYield *= 0.85; // Below optimal
} else if (rainfall >= 800 && rainfall <= 1200) {
  predictedYield *= 1.0; // Optimal
} else if (rainfall > 1200) {
  predictedYield *= 0.9; // Excess water
}

// Apply fertilizer adjustment (diminishing returns)
const fertilizerEffect = Math.min(fertilizer / 200, 1.2);
predictedYield *= fertilizerEffect;

// Apply temperature adjustment
if (temperature < 15 || temperature > 35) {
  predictedYield *= 0.8; // Extreme temps
} else if (temperature >= 20 && temperature <= 30) {
  predictedYield *= 1.1; // Optimal range
}

// Apply humidity adjustment
if (humidity < 40) {
  predictedYield *= 0.85; // Too dry
} else if (humidity > 80) {
  predictedYield *= 0.9; // Too humid
}

// Total yield = predicted yield per hectare × area
const totalYield = predictedYield * area;
```

#### API Endpoint

**URL**: `https://dfyzsbiawdrjspeokbfz.supabase.co/functions/v1/predict-crop-yield`

**Method**: POST

**Request Body**:
```json
{
  "cropType": "Rice",
  "area": 10,
  "rainfall": 1000,
  "fertilizer": 150,
  "pesticide": 20,
  "temperature": 28,
  "humidity": 70
}
```

**Response**:
```json
{
  "predictedYield": 48500,
  "yieldPerHectare": 4850,
  "confidence": 0.85,
  "factors": {
    "rainfall": "optimal",
    "temperature": "good",
    "humidity": "moderate"
  }
}
```

#### User Flow
1. User navigates to "Yield Prediction" tab
2. Selects crop type from dropdown
3. Enters area, rainfall, fertilizer, pesticide
4. Enters temperature and humidity (or uses auto-location)
5. Clicks "Predict Yield"
6. Results displayed with yield estimate and factors

---

### Module 3: Crop Recommendation

#### Purpose
Recommend the most suitable crops based on soil nutrients, environmental conditions, and growing season.

#### Components
- **CropRecommendation.tsx**: Frontend form with auto-location feature
- **supabase/functions/recommend-crops/index.ts**: Backend recommendation engine

#### Algorithm

**Input Parameters**:
- Nitrogen (N) content (0-100)
- Phosphorus (P) content (0-100)
- Potassium (K) content (0-100)
- Soil pH (4.0-9.0)
- Temperature (°C)
- Humidity (%)
- Rainfall (mm)
- Season (Kharif, Rabi, Zaid, Summer, Winter)

**Crop Database** (partial example):
```typescript
const cropDatabase = {
  Rice: {
    N: [80, 100], P: [40, 60], K: [40, 60],
    pH: [5.5, 7.0], temp: [20, 35], humidity: [70, 90],
    rainfall: [1000, 2000], season: ["Kharif"],
  },
  Wheat: {
    N: [40, 60], P: [30, 50], K: [30, 50],
    pH: [6.0, 7.5], temp: [15, 25], humidity: [50, 70],
    rainfall: [400, 800], season: ["Rabi", "Winter"],
  },
  // ... 20+ crops
};
```

**Scoring Algorithm**:
```typescript
for (const [crop, requirements] of Object.entries(cropDatabase)) {
  let score = 0;
  let matchCount = 0;

  // Nitrogen match (weight: 20%)
  if (N >= requirements.N[0] && N <= requirements.N[1]) {
    score += 20;
    matchCount++;
  }

  // Phosphorus match (weight: 20%)
  if (P >= requirements.P[0] && P <= requirements.P[1]) {
    score += 20;
    matchCount++;
  }

  // Potassium match (weight: 20%)
  if (K >= requirements.K[0] && K <= requirements.K[1]) {
    score += 20;
    matchCount++;
  }

  // pH match (weight: 15%)
  if (pH >= requirements.pH[0] && pH <= requirements.pH[1]) {
    score += 15;
    matchCount++;
  }

  // Temperature match (weight: 10%)
  if (temp >= requirements.temp[0] && temp <= requirements.temp[1]) {
    score += 10;
    matchCount++;
  }

  // Humidity match (weight: 5%)
  if (humidity >= requirements.humidity[0] && humidity <= requirements.humidity[1]) {
    score += 5;
    matchCount++;
  }

  // Rainfall match (weight: 5%)
  if (rainfall >= requirements.rainfall[0] && rainfall <= requirements.rainfall[1]) {
    score += 5;
    matchCount++;
  }

  // Season match (weight: 5%)
  if (requirements.season.includes(season)) {
    score += 5;
    matchCount++;
  }

  const confidence = score / 100;
  
  results.push({
    crop,
    confidence,
    matchCount,
    reasoning: `Matches ${matchCount}/8 criteria`
  });
}

// Sort by confidence and return top 3
results.sort((a, b) => b.confidence - a.confidence);
return results.slice(0, 3);
```

#### Auto-Location Feature

**Weather Data Integration**:
```typescript
// Get user's location
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;

  // Fetch weather data
  const response = await fetch(
    `https://dfyzsbiawdrjspeokbfz.supabase.co/functions/v1/get-weather`,
    {
      method: "POST",
      body: JSON.stringify({ lat: latitude, lon: longitude }),
    }
  );

  const data = await response.json();

  // Auto-populate form fields
  setFormData({
    temperature: data.temperature,
    humidity: data.humidity,
    rainfall: data.rainfall,
    ph: data.ph, // Estimated based on climate zone
    season: determineSeason(data.temperature),
  });
});
```

**pH Estimation Logic**:
```typescript
function estimateSoilPH(lat: number, lon: number, rainfall: number, temp: number) {
  let pH = 6.5; // Neutral default

  // High rainfall → Acidic (leaching)
  if (rainfall > 1500) pH = 5.8;
  
  // Low rainfall → Alkaline
  else if (rainfall < 500) pH = 7.5;

  // Tropical zones → More acidic
  if (lat >= -23.5 && lat <= 23.5) {
    pH = Math.max(5.5, pH - 0.5);
  }

  // Desert belts → More alkaline
  if (lat >= 15 && lat <= 35) {
    pH = Math.min(8.0, pH + 0.5);
  }

  return Math.round(pH * 10) / 10;
}
```

#### User Flow
1. User navigates to "Crop Recommendation" tab
2. Clicks "Get Location Data" button (optional)
3. Browser requests geolocation permission
4. Weather API fetches data and auto-fills form
5. User can manually adjust values or enter NPK data
6. Clicks "Get Recommendations"
7. Top 3 crops displayed with confidence scores

---

### Module 4: Weather Dashboard

#### Purpose
Display real-time weather conditions and historical rainfall data to aid in farm planning.

#### Components
- **WeatherDashboard.tsx**: Frontend weather display with charts
- **supabase/functions/get-weather/index.ts**: Weather API integration

#### Data Sources

**OpenWeather API** (Current Weather):
- Temperature, feels-like temperature
- Humidity, pressure
- Wind speed, wind direction
- Cloud cover, visibility
- Weather description (sunny, cloudy, rainy)

**Open-Meteo API** (Historical Rainfall):
- Past 12 months of rainfall data
- Monthly aggregation
- No API key required (free service)

#### Implementation

**Geolocation-based Weather**:
```typescript
const fetchWeather = async () => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;

    const response = await fetch(
      `https://dfyzsbiawdrjspeokbfz.supabase.co/functions/v1/get-weather`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: latitude, lon: longitude }),
      }
    );

    const data = await response.json();
    setWeatherData(data);
  });
};
```

**Rainfall Chart** (using Recharts):
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<LineChart data={monthlyRainfall}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="rainfall" stroke="#8884d8" />
</LineChart>
```

#### Features
- Real-time weather updates
- Location-based or manual city search
- Monthly rainfall visualization
- Temperature, humidity, pressure display
- Wind speed and direction
- Cloud cover percentage
- Soil pH estimation (based on climate)

#### User Flow
1. User navigates to "Weather Dashboard" tab
2. Browser requests location permission
3. Weather data fetched and displayed
4. Monthly rainfall chart renders
5. User can refresh data or enter manual location

---

### Module 5: Disease Detection

#### Purpose
Identify plant diseases from uploaded images using AI vision and provide treatment recommendations.

#### Components
- **DiseaseDetection.tsx**: Frontend image upload UI
- **supabase/functions/detect-disease/index.ts**: AI integration and disease database

#### AI Integration

**Model**: Google Gemini 2.5 Flash (via Lovable AI Gateway)

**Prompt**:
```typescript
const prompt = `
You are an expert plant pathologist. Analyze this plant image and detect any diseases.

Respond ONLY with valid JSON in this exact format:
{
  "disease": "disease name or 'Healthy'",
  "confidence": 0.85,
  "severity": "low/medium/high"
}

Be specific with disease names (e.g., "Late Blight", "Powdery Mildew").
`;

const response = await fetch(
  "https://api.lovable.app/v1/ai/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableApiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
          ]
        }
      ]
    })
  }
);
```

#### Disease Database

```typescript
const diseaseDatabase = {
  "Late Blight": {
    description: "Fungal disease causing dark lesions on leaves and stems",
    treatment: "Apply copper-based fungicides every 7-10 days",
    severity: "high",
    pesticides: ["Mancozeb", "Chlorothalonil", "Copper Hydroxide"],
    fertilizers: ["Potassium-rich fertilizer"],
    prevention: [
      "Remove infected plants immediately",
      "Improve air circulation",
      "Water early in the day",
    ],
  },
  "Powdery Mildew": {
    description: "White powdery fungal growth on leaves",
    treatment: "Spray sulfur or neem oil solution",
    severity: "medium",
    pesticides: ["Sulfur spray", "Neem oil"],
    fertilizers: ["Balanced NPK"],
    prevention: [
      "Prune crowded branches",
      "Avoid overhead watering",
    ],
  },
  // ... 20+ diseases
};
```

#### Response Format

```json
{
  "disease": "Late Blight",
  "confidence": 0.92,
  "severity": "high",
  "description": "Fungal disease causing dark lesions on leaves and stems",
  "treatment": "Apply copper-based fungicides every 7-10 days",
  "pesticides": ["Mancozeb", "Chlorothalonil"],
  "fertilizers": ["Potassium-rich fertilizer"],
  "prevention": ["Remove infected plants", "Improve air circulation"],
  "applicationTiming": "Apply at first sign of infection, repeat every 7-10 days"
}
```

#### User Flow
1. User navigates to "Disease Detection" tab
2. Clicks "Upload Image" button
3. Selects plant image from device
4. Image converted to base64 and sent to AI
5. AI analyzes image (5-10 seconds)
6. Results displayed with:
   - Disease name and confidence
   - Description and severity
   - Treatment recommendations
   - Pesticide and fertilizer suggestions
   - Prevention tips

---

### Module 6: Navigation & Routing

#### Purpose
Handle page navigation and route protection for authenticated users.

#### Routes

| Route | Component | Protected | Description |
|-------|-----------|-----------|-------------|
| `/` | Index.tsx | Yes | Main dashboard with all features |
| `/auth` | Auth.tsx | No | Login and signup page |
| `*` | NotFound.tsx | No | 404 error page |

#### Route Protection

```typescript
// In Index.tsx
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth"); // Redirect to login
    } else {
      setUser(session.user);
    }
    
    setLoading(false);
  };

  checkSession();
}, [navigate]);

// Show loading spinner while checking
if (loading) {
  return <div>Loading...</div>;
}

// Don't render dashboard if not authenticated
if (!user) {
  return null;
}
```

#### Browser Router Setup

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

---

## 📌 6. Data Flow Explanation

### Request → Response Flow Example: Crop Recommendation

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Interaction                                         │
│ User fills form and clicks "Get Recommendations"                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend Validation                                      │
│ React Hook Form validates:                                       │
│ - N, P, K are numbers (0-100)                                    │
│ - pH is number (4-9)                                             │
│ - All required fields present                                    │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: State Update (TanStack Query)                            │
│ mutation.mutate() called with form data                          │
│ - Loading state: true                                            │
│ - UI shows loading spinner                                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: API Call                                                 │
│ fetch("https://...supabase.co/functions/v1/recommend-crops", {   │
│   method: "POST",                                                │
│   headers: { "Content-Type": "application/json" },               │
│   body: JSON.stringify({                                         │
│     N: 80, P: 40, K: 40,                                         │
│     ph: 6.5, temperature: 28,                                    │
│     humidity: 70, rainfall: 1000,                                │
│     season: "Kharif"                                             │
│   })                                                             │
│ })                                                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Edge Function Receives Request                           │
│ Deno runtime executes recommend-crops/index.ts                   │
│ - Parses JSON body                                               │
│ - Extracts parameters                                            │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Algorithm Execution                                      │
│ Loop through crop database:                                      │
│ For each crop:                                                   │
│   - Check N match (score += 20 if in range)                      │
│   - Check P match (score += 20 if in range)                      │
│   - Check K match (score += 20 if in range)                      │
│   - Check pH match (score += 15 if in range)                     │
│   - Check temperature (score += 10 if in range)                  │
│   - Check humidity (score += 5 if in range)                      │
│   - Check rainfall (score += 5 if in range)                      │
│   - Check season (score += 5 if match)                           │
│   - Calculate confidence = score / 100                           │
│                                                                  │
│ Sort crops by confidence descending                              │
│ Take top 3 results                                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Response Generation                                      │
│ return new Response(JSON.stringify({                             │
│   recommendations: [                                             │
│     { crop: "Rice", confidence: 0.95, reasoning: "..." },        │
│     { crop: "Cotton", confidence: 0.78, reasoning: "..." },      │
│     { crop: "Maize", confidence: 0.65, reasoning: "..." }        │
│   ]                                                              │
│ }), {                                                            │
│   headers: { "Content-Type": "application/json" }                │
│ })                                                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: Frontend Receives Response                               │
│ fetch() promise resolves                                         │
│ - Parse JSON response                                            │
│ - mutation.onSuccess() callback triggered                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: State Update                                             │
│ - setRecommendations(data.recommendations)                       │
│ - Loading state: false                                           │
│ - Cache response in TanStack Query                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 10: UI Re-render                                            │
│ React re-renders with new data:                                  │
│ - Hide loading spinner                                           │
│ - Display recommendation cards                                   │
│ - Show confidence bars                                           │
│ - Display reasoning text                                         │
│ - Show toast notification: "Recommendations ready!"              │
└─────────────────────────────────────────────────────────────────┘
```

### Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ Error Occurs (Network, Validation, Server)                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ mutation.onError() Triggered                                     │
│ - Receives error object                                          │
│ - Parses error message                                           │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ Display Error Toast                                              │
│ toast({                                                          │
│   title: "Error",                                                │
│   description: error.message,                                    │
│   variant: "destructive"                                         │
│ })                                                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│ UI Updates                                                       │
│ - Hide loading spinner                                           │
│ - Keep form data (allow retry)                                   │
│ - Display error state                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📌 7. How the Project Runs

### Development Workflow

#### 1. Local Development Setup

**Prerequisites**:
- Node.js 18+ or Bun runtime
- Git
- Modern web browser

**Installation**:
```bash
# Clone repository
git clone <repository-url>
cd agrismart-ai

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev
```

#### 2. Development Server

**Vite Dev Server**:
- Runs on `http://localhost:8080`
- Hot Module Replacement (HMR) for instant updates
- Fast rebuild times (< 100ms)
- Source maps for debugging

**Commands**:
```json
{
  "scripts": {
    "dev": "vite",           // Start dev server
    "build": "tsc && vite build",  // Production build
    "preview": "vite preview",     // Preview production build
    "lint": "eslint ."             // Lint code
  }
}
```

#### 3. Environment Variables

**Automatic Configuration**:
The `.env` file is auto-generated by Lovable Cloud and contains:

```bash
VITE_SUPABASE_URL=https://dfyzsbiawdrjspeokbfz.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=dfyzsbiawdrjspeokbfz
```

**⚠️ Important**: Never edit `.env` manually. It's managed by Lovable Cloud.

**Additional Secrets** (managed via Lovable Cloud UI):
- `OPENWEATHER_API_KEY`: For weather API (optional, has fallback)
- `LOVABLE_AI_API_KEY`: For AI features (managed automatically)

#### 4. Development Tools

**Browser DevTools**:
- React DevTools extension
- Network tab for API monitoring
- Console for error checking

**VS Code Extensions** (recommended):
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Build Process

#### 1. TypeScript Compilation

```bash
tsc
```

Compiles TypeScript to JavaScript with type checking:
- Checks for type errors
- Generates `.d.ts` declaration files
- Ensures type safety across codebase

#### 2. Vite Build

```bash
vite build
```

Creates optimized production bundle:

**Output**:
```
dist/
├── assets/
│   ├── index-[hash].js      # Main bundle (minified)
│   ├── vendor-[hash].js     # Third-party dependencies
│   └── index-[hash].css     # Compiled styles
├── index.html               # Entry HTML
└── robots.txt               # SEO file
```

**Optimizations**:
- Code splitting (separate vendor bundle)
- Tree shaking (remove unused code)
- Minification (compress JavaScript)
- CSS optimization (purge unused styles)
- Asset hashing (cache busting)

**Bundle Sizes** (typical):
- Main bundle: ~150 KB (gzipped)
- Vendor bundle: ~200 KB (gzipped)
- CSS: ~20 KB (gzipped)

#### 3. Preview Build

```bash
npm run preview
```

Serves production build locally at `http://localhost:4173` for testing before deployment.

### Production Deployment

#### 1. Lovable CDN Deployment

**Automatic Deployment**:
- Every git push triggers deployment
- Built assets uploaded to Lovable CDN
- Edge locations worldwide for fast delivery

**Deployment URL**:
- Staging: `https://[project-name].lovable.app`
- Custom domain: Connect via Lovable dashboard

#### 2. Edge Functions Deployment

**Automatic Deployment**:
- Edge functions in `supabase/functions/` auto-deploy
- No manual deployment needed
- Deployed to Supabase edge network

**Function URLs**:
```
https://dfyzsbiawdrjspeokbfz.supabase.co/functions/v1/predict-crop-yield
https://dfyzsbiawdrjspeokbfz.supabase.co/functions/v1/recommend-crops
https://dfyzsbiawdrjspeokbfz.supabase.co/functions/v1/detect-disease
https://dfyzsbiawdrjspeokbfz.supabase.co/functions/v1/get-weather
```

#### 3. CI/CD Pipeline

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Lovable    │
│  Detects    │
│  Changes    │
└──────┬──────┘
       │
       ├──► TypeScript Check
       ├──► Lint Code
       ├──► Run Tests (if configured)
       ├──► Build Assets
       │
       ▼
┌─────────────┐
│  Deploy to  │
│     CDN     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Deploy     │
│  Edge       │
│  Functions  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Live!    │
└─────────────┘
```

### Versioning & Branching

**Recommended Git Flow**:

```
main (production)
  │
  ├── develop (staging)
  │     │
  │     ├── feature/crop-recommendation
  │     ├── feature/disease-detection
  │     └── bugfix/auth-issue
  │
  └── hotfix/critical-bug
```

**Workflow**:
1. Create feature branch from `develop`
2. Develop and test locally
3. Push to remote
4. Create pull request to `develop`
5. Review and merge
6. Deploy `develop` to staging
7. Test on staging
8. Merge `develop` to `main`
9. Deploy to production

---

## 📌 8. System Handling

### Routing

**React Router Configuration**:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";

<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

**Navigation**:
```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Programmatic navigation
navigate("/auth");       // Go to auth page
navigate("/", { replace: true }); // Replace history
navigate(-1);            // Go back
```

**Link Components**:
```typescript
import { Link } from "react-router-dom";

<Link to="/auth">Login</Link>
```

### State Management

**TanStack Query Setup**:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

**Mutation Pattern**:
```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  },
  onSuccess: (data) => {
    // Update UI, show success message
  },
  onError: (error) => {
    // Show error message
  },
});

// Trigger mutation
mutation.mutate(formData);

// Access state
mutation.isLoading   // Loading state
mutation.isError     // Error state
mutation.isSuccess   // Success state
mutation.data        // Response data
```

**Local State** (useState):
```typescript
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const [recommendations, setRecommendations] = useState([]);
```

### API Calls

**Pattern 1: Mutation (POST)**:
```typescript
const response = await fetch(
  "https://dfyzsbiawdrjspeokbfz.supabase.co/functions/v1/recommend-crops",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }
);

if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

const result = await response.json();
```

**Pattern 2: Query (GET)**:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["weather", location],
  queryFn: async () => {
    const response = await fetch(`/api/weather?location=${location}`);
    return response.json();
  },
});
```

**Error Handling**:
```typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }
  
  return await response.json();
} catch (error) {
  console.error("API Error:", error);
  
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive",
  });
  
  throw error; // Re-throw for mutation error handling
}
```

### Image Uploading

**File Input**:
```typescript
<input
  type="file"
  accept="image/*"
  onChange={handleImageUpload}
/>
```

**Convert to Base64**:
```typescript
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  
  reader.onloadend = () => {
    const base64String = reader.result as string;
    // Remove data URL prefix
    const base64Data = base64String.split(",")[1];
    
    setImageBase64(base64Data);
  };
  
  reader.readAsDataURL(file);
};
```

**Send to API**:
```typescript
const response = await fetch(
  "https://dfyzsbiawdrjspeokbfz.supabase.co/functions/v1/detect-disease",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: base64Data, // Base64 encoded image
    }),
  }
);
```

**Image Preview**:
```typescript
{imagePreview && (
  <img
    src={imagePreview}
    alt="Preview"
    className="max-w-full h-auto rounded-lg"
  />
)}
```

### Real-time Updates

**Not Currently Implemented** but can be added with Supabase Realtime:

```typescript
// Enable realtime on a table
// SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE public.yield_history;

// Frontend:
const channel = supabase
  .channel('yield-updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'yield_history'
    },
    (payload) => {
      console.log('New yield prediction:', payload.new);
      // Update UI with new data
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### Notifications

**Toast Notifications** (using shadcn/ui):

```typescript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Success notification
toast({
  title: "Success",
  description: "Your crop recommendations are ready!",
});

// Error notification
toast({
  title: "Error",
  description: "Failed to fetch weather data",
  variant: "destructive",
});

// Info notification
toast({
  title: "Info",
  description: "Location data auto-populated",
});
```

**Toast Variants**:
- `default`: Standard notification
- `destructive`: Error notification (red)

**Push Notifications** (not implemented):
Would require:
- Service worker registration
- Push notification permission
- Web Push API integration
- Backend notification queue

---

## 📌 9. Third-Party Dependencies

### UI Libraries

#### shadcn/ui
**Version**: Latest  
**Purpose**: Accessible component library

**Why Used**:
- Copy-paste components (you own the code)
- Built on Radix UI (accessibility)
- Fully customizable
- Type-safe with TypeScript

**Integration**:
```bash
npx shadcn-ui@latest add button card input tabs
```

**Components Used** (40+):
- Forms: Button, Input, Textarea, Select, Checkbox, Radio, Slider
- Layout: Card, Separator, Tabs, Sheet, Dialog
- Feedback: Toast, Alert, Progress
- Data: Table, Pagination
- Navigation: Navigation Menu, Breadcrumb

#### Tailwind CSS
**Version**: 3.x  
**Purpose**: Utility-first CSS framework

**Configuration**:
```typescript
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        // ... semantic tokens from index.css
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

**Custom Theme** (`src/index.css`):
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... more semantic tokens */
}
```

#### Lucide React
**Version**: ^0.462.0  
**Purpose**: Icon library

**Why Used**:
- 1000+ icons
- Tree-shakeable (only import what you use)
- Consistent design
- TypeScript support

**Usage**:
```typescript
import { Leaf, Cloud, Droplets, Activity } from "lucide-react";

<Leaf className="w-6 h-6" />
<Cloud className="w-8 h-8 text-blue-500" />
```

**Icons Used**:
- `Leaf`: Agriculture theme
- `Cloud`: Weather
- `Droplets`: Rainfall
- `Thermometer`: Temperature
- `Camera`: Image upload
- `LogOut`: Logout button

### State Management

#### TanStack Query
**Version**: ^5.83.0  
**Purpose**: Server state management

**Installation**:
```bash
npm install @tanstack/react-query
```

**Setup**:
```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

**Features Used**:
- `useMutation`: POST requests
- `useQuery`: GET requests (future)
- Automatic caching
- Loading/error states

### Form Management

#### React Hook Form
**Version**: ^7.61.1  
**Purpose**: Form state and validation

**Why Used**:
- Minimal re-renders
- Built-in validation
- TypeScript support
- Easy integration with shadcn/ui

**Usage**:
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  cropType: z.string().min(1, "Crop type is required"),
  area: z.number().positive("Area must be positive"),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {
    cropType: "",
    area: 0,
  },
});

const onSubmit = (data) => {
  mutation.mutate(data);
};

<form onSubmit={form.handleSubmit(onSubmit)}>
  {/* Form fields */}
</form>
```

#### Zod
**Version**: ^3.25.76  
**Purpose**: Schema validation

**Why Used**:
- Type-safe validation
- Composable schemas
- Great TypeScript inference
- Works with React Hook Form

**Schema Example**:
```typescript
const cropYieldSchema = z.object({
  cropType: z.string().min(1),
  area: z.number().positive(),
  rainfall: z.number().min(0).max(5000),
  temperature: z.number().min(-10).max(50),
  humidity: z.number().min(0).max(100),
});

type CropYieldInput = z.infer<typeof cropYieldSchema>;
```

### Data Visualization

#### Recharts
**Version**: ^2.15.4  
**Purpose**: Chart library for React

**Why Used**:
- React-native charts
- Responsive design
- Customizable
- Good documentation

**Usage** (Weather Dashboard):
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const monthlyRainfall = [
  { month: "Jan", rainfall: 120 },
  { month: "Feb", rainfall: 80 },
  // ... more months
];

<LineChart width={600} height={300} data={monthlyRainfall}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis label={{ value: "Rainfall (mm)", angle: -90 }} />
  <Tooltip />
  <Line type="monotone" dataKey="rainfall" stroke="#3b82f6" />
</LineChart>
```

### Authentication

#### Supabase JS
**Version**: ^2.76.1  
**Purpose**: Authentication and backend client

**Installation**:
```bash
npm install @supabase/supabase-js
```

**Client Setup**:
```typescript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

**Authentication Methods**:
```typescript
// Sign up
await supabase.auth.signUp({ email, password });

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Sign out
await supabase.auth.signOut();

// Get session
const { data: { session } } = await supabase.auth.getSession();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

### Utilities

#### class-variance-authority (CVA)
**Version**: ^0.7.1  
**Purpose**: Component variant styling

**Usage** (Button variants):
```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        outline: "border border-input hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

#### clsx + tailwind-merge
**Versions**: clsx ^2.1.1, tailwind-merge ^2.6.0  
**Purpose**: Conditional class names

**Utility Function**:
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage**:
```typescript
<div className={cn(
  "base-class",
  isActive && "active-class",
  className // Passed as prop
)} />
```

### Date Handling

#### date-fns
**Version**: ^3.6.0  
**Purpose**: Date manipulation and formatting

**Usage**:
```typescript
import { format, subMonths } from "date-fns";

// Format date
const formatted = format(new Date(), "MMM yyyy"); // "Nov 2025"

// Calculate past date
const lastYear = subMonths(new Date(), 12);
```

---

## 📌 10. Optimizations & Security

### Performance Optimizations

#### Code Splitting

**Route-based Splitting**:
```typescript
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));

<Suspense fallback={<div>Loading...</div>}>
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth" element={<Auth />} />
  </Routes>
</Suspense>
```

**Component Lazy Loading**:
```typescript
const WeatherDashboard = lazy(() => import("./components/WeatherDashboard"));

<Suspense fallback={<Skeleton />}>
  <WeatherDashboard />
</Suspense>
```

#### Asset Optimization

**Image Optimization**:
- Lazy loading: `loading="lazy"` attribute
- WebP format for modern browsers
- Responsive images: `srcset` attribute
- Compressed images (80% quality)

**Font Optimization**:
```css
@font-face {
  font-family: 'Inter';
  font-display: swap; /* Avoid FOIT */
  src: url('/fonts/inter.woff2') format('woff2');
}
```

**CSS Optimization**:
- Tailwind purges unused classes
- CSS minification in production
- Critical CSS inlining (Vite handles this)

#### Caching Strategy

**TanStack Query Caching**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      cacheTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

**HTTP Caching** (via CDN):
- Static assets: 1 year cache (`Cache-Control: public, max-age=31536000, immutable`)
- HTML: No cache (`Cache-Control: no-cache`)
- API responses: Custom caching per endpoint

**Service Worker** (future):
```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

#### Network Optimization

**Request Batching**:
```typescript
// Batch multiple mutations
Promise.all([
  mutation1.mutateAsync(data1),
  mutation2.mutateAsync(data2),
]);
```

**Request Deduplication** (TanStack Query):
- Automatic deduplication of identical requests
- Prevents double-fetching on component mount

**Compression**:
- Gzip compression on CDN (automatic)
- Brotli compression (better than gzip)

#### Bundle Size Optimization

**Tree Shaking**:
- Only used Lucide icons are bundled
- Vite automatically tree-shakes unused code

**Vendor Splitting**:
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/react-*'],
      },
    },
  },
}
```

**Dynamic Imports**:
```typescript
// Only load when needed
const heavyModule = await import('./heavy-module');
```

#### Rendering Optimization

**Memo Components**:
```typescript
import { memo } from "react";

const CropCard = memo(({ crop }) => {
  return <Card>{crop.name}</Card>;
});
```

**useMemo Hook**:
```typescript
const filteredCrops = useMemo(() => {
  return crops.filter(crop => crop.confidence > 0.7);
}, [crops]);
```

**useCallback Hook**:
```typescript
const handleSubmit = useCallback((data) => {
  mutation.mutate(data);
}, [mutation]);
```

### Security Implementation

#### Input Validation

**Frontend Validation** (Zod):
```typescript
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ characters"),
  cropType: z.enum(["Rice", "Wheat", "Maize"]),
  area: z.number().positive().max(10000),
});
```

**Backend Validation** (Edge Functions):
```typescript
// Validate input types
if (typeof N !== 'number' || N < 0 || N > 100) {
  return new Response(
    JSON.stringify({ error: "Invalid N value (0-100)" }),
    { status: 400 }
  );
}

// Sanitize strings
const cropType = String(params.cropType).trim();
if (!["Rice", "Wheat", "Maize"].includes(cropType)) {
  return new Response(
    JSON.stringify({ error: "Invalid crop type" }),
    { status: 400 }
  );
}
```

#### API Key Management

**Environment Variables**:
```bash
# .env (auto-generated, never commit)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

**Edge Function Secrets**:
```typescript
const openWeatherKey = Deno.env.get("OPENWEATHER_API_KEY");
const lovableAiKey = Deno.env.get("LOVABLE_AI_API_KEY");

if (!lovableAiKey) {
  throw new Error("Missing LOVABLE_AI_API_KEY");
}
```

**Never Expose**:
- ❌ Don't hardcode API keys in code
- ❌ Don't commit `.env` to git
- ✅ Use environment variables
- ✅ Manage secrets via Lovable Cloud UI

#### Authentication Security

**Password Security**:
- Minimum 8 characters
- Hashed with bcrypt (Supabase handles this)
- Rate limiting on login attempts (Supabase feature)

**Session Security**:
```typescript
// HttpOnly cookies (Supabase default)
// Secure flag in production
// SameSite=Lax for CSRF protection

supabase.auth.getSession(); // Validates JWT token
```

**Protected Routes**:
```typescript
// Redirect if not authenticated
useEffect(() => {
  if (!user && !loading) {
    navigate("/auth");
  }
}, [user, loading, navigate]);
```

#### CORS Protection

**Edge Functions**:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Restrict in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle preflight
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

**Production CORS** (recommended):
```typescript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];

const origin = req.headers.get('origin');

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '',
};
```

#### XSS Prevention

**React Auto-Escaping**:
React automatically escapes JSX content:
```typescript
// Safe (React escapes HTML)
<div>{userInput}</div>

// Dangerous (avoid unless necessary)
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Content Security Policy**:
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://dfyzsbiawdrjspeokbfz.supabase.co;
">
```

#### SQL Injection Prevention

**Not Applicable**: No direct SQL queries in frontend.

**If using Supabase queries**:
```typescript
// Safe (parameterized)
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId); // Parameter binding

// Dangerous (avoid raw SQL)
// await supabase.rpc('raw_query', { sql: userInput });
```

#### Rate Limiting

**Edge Functions** (Supabase feature):
- 100 requests per second per IP (default)
- Configurable per function

**Future: Implement Custom Rate Limiting**:
```typescript
const rateLimit = new Map();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  
  // Remove requests older than 1 minute
  const recent = requests.filter(t => now - t < 60000);
  
  if (recent.length >= 60) {
    throw new Error("Rate limit exceeded");
  }
  
  recent.push(now);
  rateLimit.set(ip, recent);
}
```

---

## 📌 11. Deployment Workflow

### CI/CD Pipeline

#### 1. Git Workflow

```
Developer → Git Commit → Git Push → Lovable Detects Changes
                                          │
                                          ▼
                                    Run Checks
                                    - TypeScript
                                    - Linting
                                    - Tests
                                          │
                                          ▼
                                    Build Assets
                                    - Vite build
                                    - Minification
                                    - Asset optimization
                                          │
                                          ▼
                                    Deploy Frontend
                                    - Upload to CDN
                                    - Cache invalidation
                                          │
                                          ▼
                                    Deploy Backend
                                    - Edge functions
                                    - Database migrations
                                          │
                                          ▼
                                      Live ✓
```

#### 2. Deployment Steps

**Frontend Deployment**:
1. Code changes pushed to Git
2. Lovable webhook triggered
3. Build process starts:
   - `npm install` (if package.json changed)
   - `npm run build` (TypeScript + Vite)
4. Assets uploaded to CDN
5. Old cache invalidated
6. New version live

**Backend Deployment** (Edge Functions):
1. Changes to `supabase/functions/` detected
2. Functions packaged
3. Deployed to Supabase edge network
4. Available globally within seconds

**Database Migrations**:
1. Migration SQL files applied
2. Schema updated
3. Types regenerated (`src/integrations/supabase/types.ts`)

#### 3. Rollback Strategy

**Frontend Rollback**:
- Git revert commit
- Push to trigger new deployment
- Previous version deployed

**Edge Function Rollback**:
- Revert changes in Git
- Redeploy functions

**Database Rollback** (manual):
```sql
-- Create down migration
-- Reverse changes from up migration
DROP TABLE IF EXISTS new_table;
ALTER TABLE old_table ADD COLUMN removed_column TEXT;
```

### Hosting Details

#### Frontend Hosting

**Lovable CDN**:
- Global edge network
- Automatic HTTPS
- Custom domain support
- 99.9% uptime SLA

**CDN Locations**:
- North America (US, Canada)
- Europe (UK, Germany, France)
- Asia (Singapore, Japan, India)
- Australia

**Performance**:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse Score: 90+

#### Backend Hosting

**Supabase Edge Functions**:
- Deno runtime
- Global deployment
- Auto-scaling
- Cold start: < 100ms

**Database Hosting**:
- PostgreSQL 15
- Automatic backups (daily)
- Point-in-time recovery
- Connection pooling

#### Domain Configuration

**Staging Domain**:
- `https://[project-name].lovable.app`
- Automatic HTTPS
- Free subdomain

**Custom Domain** (requires paid plan):
1. Add domain in Lovable dashboard
2. Add DNS records:
   ```
   CNAME www [project-name].lovable.app
   A     @   [IP provided by Lovable]
   ```
3. SSL certificate auto-generated (Let's Encrypt)
4. Live within 24 hours (DNS propagation)

### Monitoring & Logging

#### Frontend Monitoring

**Browser Console**:
- Error tracking
- Performance metrics
- Network requests

**Lovable Analytics** (built-in):
- Page views
- User sessions
- Error rates
- Performance metrics

**Future: Sentry Integration**:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

#### Backend Monitoring

**Supabase Logs**:
- Edge function logs
- Error tracking
- Execution time
- Request volume

**Access Logs**:
```typescript
// In edge function
console.log("Request received:", req.url);
console.error("Error occurred:", error);

// View in Lovable Cloud UI → Logs
```

**Performance Monitoring**:
```typescript
const startTime = Date.now();

// ... function logic ...

const duration = Date.now() - startTime;
console.log(`Execution time: ${duration}ms`);
```

#### Alerting (Future)

**Set up alerts for**:
- Error rate > 5%
- Response time > 5s
- Uptime < 99%
- High request volume (potential attack)

---

## 📌 12. Future Enhancement Roadmap

### Phase 1: User Management & Profiles

**User Profiles**:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  farm_size DECIMAL,
  crops_grown TEXT[],
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Features**:
- Profile creation form
- Farm details management
- Avatar upload
- Contact information

**UI Components**:
- Profile page (`/profile`)
- Edit profile modal
- Avatar upload component

### Phase 2: Yield History Tracking

**Database Schema**:
```sql
CREATE TABLE yield_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  crop_type TEXT NOT NULL,
  area DECIMAL NOT NULL,
  predicted_yield DECIMAL NOT NULL,
  actual_yield DECIMAL,
  planting_date DATE,
  harvest_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE yield_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON yield_history FOR SELECT
  USING (auth.uid() = user_id);
```

**Features**:
- Save yield predictions
- Record actual yields
- Compare predicted vs actual
- Historical charts
- Export to CSV

**UI Components**:
- Yield history page (`/history`)
- Comparison charts (Recharts)
- Data table with filters

### Phase 3: Advanced Weather Features

**7-Day Forecast**:
```typescript
const response = await fetch(
  `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}`
);

const forecast = await response.json();

// Process 7-day forecast
const daily = forecast.list.filter((_, i) => i % 8 === 0).slice(0, 7);
```

**Weather Alerts**:
```typescript
// Check for extreme weather
if (temperature > 40 || temperature < 0) {
  sendAlert("Extreme temperature warning");
}

if (rainfall > 100) {
  sendAlert("Heavy rainfall expected");
}
```

**Irrigation Recommendations**:
```typescript
function calculateIrrigation(rainfall, evapotranspiration, cropType) {
  const waterNeeded = cropWaterRequirements[cropType];
  const deficit = waterNeeded - rainfall - evapotranspiration;
  
  return {
    shouldIrrigate: deficit > 0,
    amount: Math.max(0, deficit),
    frequency: calculateFrequency(deficit),
  };
}
```

### Phase 4: AI Farm Advisor Chatbot

**Implementation**:
```typescript
import { supabase } from "@/integrations/supabase/client";

const chatbot = async (userMessage: string, context: any) => {
  const response = await supabase.functions.invoke('ai-advisor', {
    body: {
      message: userMessage,
      context: {
        location: context.location,
        crops: context.crops,
        season: context.season,
        recentScans: context.recentScans,
      },
    },
  });

  return response.data.reply;
};
```

**Features**:
- Natural language Q&A
- Personalized advice
- Historical context awareness
- Multi-turn conversations
- Voice input (future)

**UI Components**:
- Chat interface
- Message bubbles
- Typing indicator
- Suggested questions

### Phase 5: Marketplace Module

**Buyer-Seller Platform**:

**Database Schema**:
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  category TEXT NOT NULL,
  images TEXT[],
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users NOT NULL,
  seller_id UUID REFERENCES auth.users NOT NULL,
  product_id UUID REFERENCES products NOT NULL,
  quantity DECIMAL NOT NULL,
  total_price DECIMAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Features**:
- Product listings
- Search and filters
- Order management
- Payment integration (Stripe)
- Rating and reviews

**Routes**:
- `/marketplace` - Browse products
- `/marketplace/sell` - Create listing
- `/marketplace/orders` - Order history

### Phase 6: IoT & Sensor Integration

**Sensor Data Collection**:
```typescript
// Connect to IoT devices
const sensorData = await fetch('https://iot-api.example.com/sensors', {
  headers: {
    'Authorization': `Bearer ${iotApiKey}`,
  },
});

const { soilMoisture, temperature, humidity } = await sensorData.json();
```

**Real-time Monitoring**:
```typescript
// WebSocket connection to IoT gateway
const ws = new WebSocket('wss://iot-gateway.example.com');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data);
};
```

**Automation Rules**:
```typescript
// Auto-irrigation based on soil moisture
if (soilMoisture < 30) {
  triggerIrrigation();
  notifyUser("Irrigation started due to low soil moisture");
}
```

### Phase 7: Drone & Satellite Imagery

**Field Mapping**:
- Upload drone images
- Analyze crop health (NDVI)
- Detect pest infestations
- Measure crop density

**Satellite Integration**:
- Sentinel-2 imagery (free)
- NDVI calculation
- Change detection
- Yield estimation

**AI Analysis**:
```typescript
const analyzeFieldImage = async (imageUrl: string) => {
  const response = await fetch('edge-function-url', {
    method: 'POST',
    body: JSON.stringify({
      image: imageUrl,
      analysis: ['ndvi', 'pest_detection', 'crop_health'],
    }),
  });

  return response.json();
};
```

### Phase 8: Mobile App (React Native)

**Features**:
- All web features
- Offline mode
- Push notifications
- Camera integration
- GPS tracking

**Tech Stack**:
- React Native
- Expo
- Supabase client (same backend)
- Async Storage (offline data)

**Code Sharing**:
```typescript
// Shared business logic
import { predictYield } from '@agrismart/shared';

// Platform-specific UI
import { Button } from 'react-native';
// or
import { Button } from '@/components/ui/button';
```

### Phase 9: Community & Social Features

**Farmer Forums**:
- Discussion boards
- Q&A section
- Expert answers
- Best practices sharing

**Knowledge Base**:
- Articles and guides
- Video tutorials
- Crop calendars
- Pest identification guide

**Social Interaction**:
- Follow other farmers
- Like and comment on posts
- Share success stories
- Farm photo gallery

**Database Schema**:
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[],
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts NOT NULL,
  author_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Phase 10: Analytics Dashboard

**Farm Analytics**:
- Yield trends over time
- Crop performance comparison
- Revenue analysis
- Cost tracking

**Visualizations**:
- Line charts (yield trends)
- Bar charts (crop comparison)
- Pie charts (crop distribution)
- Heat maps (field productivity)

**Export Reports**:
- PDF generation
- Excel export
- Scheduled email reports

**Implementation**:
```typescript
import { jsPDF } from 'jspdf';

const generateReport = (data: YieldHistory[]) => {
  const doc = new jsPDF();
  
  doc.text('Yield Report', 10, 10);
  doc.text(`Total Yield: ${calculateTotal(data)} kg`, 10, 20);
  
  // Add charts
  const chart = generateChartImage(data);
  doc.addImage(chart, 'PNG', 10, 30, 180, 100);
  
  doc.save('yield-report.pdf');
};
```

---

## Conclusion

AgriSmart AI is a modern, AI-powered agricultural decision support system built with cutting-edge web technologies. It provides farmers with intelligent recommendations, real-time weather insights, and disease detection capabilities to optimize crop management and increase yields.

**Key Strengths**:
- ✅ Serverless architecture for scalability
- ✅ AI-powered insights (Gemini Vision)
- ✅ Real-time weather integration
- ✅ Type-safe codebase (TypeScript)
- ✅ Responsive, accessible UI
- ✅ Secure authentication
- ✅ Fast performance (<3s load time)

**Future Vision**:
Transform AgriSmart AI into a comprehensive agricultural platform with social features, IoT integration, marketplace, and mobile apps to serve millions of farmers worldwide.

---

## Additional Resources

**Official Documentation**:
- React: https://react.dev/
- TypeScript: https://www.typescriptlang.org/
- Vite: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/
- shadcn/ui: https://ui.shadcn.com/
- Supabase: https://supabase.com/docs
- TanStack Query: https://tanstack.com/query/latest

**API Documentation**:
- OpenWeather API: https://openweathermap.org/api
- Open-Meteo API: https://open-meteo.com/
- Lovable AI: https://docs.lovable.dev/

**Learning Resources**:
- Lovable Discord: https://discord.com/channels/1119885301872070706
- YouTube Playlist: https://www.youtube.com/watch?v=9KHLTZaJcR8&list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-21  
**Project**: AgriSmart AI  
**Author**: AI Assistant (Lovable)
