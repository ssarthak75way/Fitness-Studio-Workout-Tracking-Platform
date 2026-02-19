# FITNESS STUDIO: Elite Performance & Tracking Platform

A premium, full-stack application for fitness studios to manage classes, bookings, memberships, and track member progress with cinematic aesthetics and deep analytics.

## Features

### For Members
- 📅 **Smart Booking**: Browse and book fitness classes with calendar integration
- 💪 **Workout Tracking**: Log exercises, sets, reps, and weight with PR tracking
- 📊 **Body Analytics**: Track weight, body fat, and measurements with interactive charts
- 🎯 **Gamification**: View workout streaks, personal records, and consistency graphs
- ⭐ **Feedback**: Rate classes and instructors
- 📱 **Quick Access**: QR code check-in for classes
- 🌗 **Cinematic UI**: Stunning dark/light mode with glassmorphism design

### For Instructors
- 📋 Manage class schedules and capacity
- 👥 Real-time class attendance/check-ins
- ⭐ Track performance ratings and reviews
- 📊 View teaching statistics

### For Studio Admins
- 👤 User management (RBAC)
- 📅 Master class scheduling
- 💳 Membership plan management
- 📊 Platform-wide analytics and revenue tracking

## Tech Stack

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT with specialized middlewares
- **Validation**: Zod
- **Storage**: Cloudinary (Image uploads)
- **Payments**: Razorpay Integration
- **Utils**: QR Code generation, Winston Logger

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **UI System**: Material-UI (v7) + Custom Theme Engine
- **Animations**: Framer Motion
- **Data Viz**: Recharts (Customized)
- **Routing**: React Router v7
- **Calendar**: FullCalendar
- **HTTP**: Axios with Interceptors

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary Account
- Razorpay Account

### Backend Setup

```bash
cd server
npm install
# Configure .env file (see below)
npm run dev
# Seed Database (Optional)
npm run db:seed
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

App runs on `http://localhost:5173`

## Environment Configuration

### Server `.env`
Create `server/.env` based on `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-studio
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Cloudinary (Images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Payments)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Client `.env`
Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## API Endpoints Overview

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login

### Core Features
- `Classes`: CRUD operations for schedules
- `Bookings`: Reserve, Cancel, Check-in (QR)
- `Workouts`: Log sessions, view history, PRs
- `Memberships`: Subscribe to plans
- `Dashboard`: Role-specific analytics
- `Uploads`: Profile picture management

## Testing & Seeding

### Seeding Data
Populate the database with demo users, classes, and workouts:

```bash
cd server
npm run db:seed
```
*Note: This script uses `tsx` to run without compilation.*

### Create Test Users via API
```bash
# Register as Member
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"member@test.com","password":"password123","fullName":"Test Member","role":"MEMBER"}'
```

## Project Structure

```
server/
├── src/
│   ├── config/          # DB, Swagger, Envs
│   ├── middlewares/     # Auth, Upload, Validation
│   ├── modules/         # Feature-based architecture
│   │   ├── auth/
│   │   ├── users/
│   │   ├── classes/
│   │   ├── ...
│   ├── scripts/         # Seeding & Maintenance
│   └── app.ts           # Express setup

client/
├── src/
│   ├── components/      # Shared UI
│   ├── context/         # Auth, Toast, Theme
│   ├── features/        # Page-level smart components
│   ├── hooks/           # Custom hooks
│   ├── theme/           # MUI Theme config
│   └── services/        # API integration
```

## License

MIT

## Author

Sarthak Singh
