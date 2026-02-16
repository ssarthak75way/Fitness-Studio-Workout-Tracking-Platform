# Fitness Studio & Workout Tracking Platform

A full-stack application for fitness studios to manage classes, bookings, memberships, and track member progress.

## Features

### For Members
- 📅 Browse and book fitness classes
- 💪 Log workouts with exercises, sets, reps, and weight
- 📊 Track body metrics and progress
- 🎯 View personal records and workout streaks
- ⭐ Rate classes and instructors
- 📱 QR code check-in for classes

### For Instructors
- 📋 Manage class schedules
- 👥 View class attendance
- ⭐ Track ratings and reviews
- 📊 View teaching statistics

### For Studio Admins
- 👤 User management
- 📅 Class scheduling
- 💳 Membership management
- 📊 Platform analytics

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- QR Code generation
- Zod validation

### Frontend
- React 19 + TypeScript
- Material-UI
- React Router
- Axios
- FullCalendar
- Recharts

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd server
npm install
# Configure .env file (already created with defaults)
npm run dev
```

Server runs on `http://localhost:5000`

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

App runs on `http://localhost:5173`

### Environment Configuration

Server `.env` file (already created):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-studio
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login

### Classes
- `GET /api/v1/classes` - List classes (with filters)
- `POST /api/v1/classes` - Create class (Admin/Instructor)
- `GET /api/v1/classes/:id` - Get class details
- `PATCH /api/v1/classes/:id` - Update class
- `DELETE /api/v1/classes/:id` - Delete class

### Bookings
- `POST /api/v1/bookings` - Book a class
- `GET /api/v1/bookings/my-bookings` - Get user bookings
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking
- `POST /api/v1/bookings/check-in` - Check-in with QR code

### Workouts
- `POST /api/v1/workouts` - Log workout
- `GET /api/v1/workouts/history` - Get workout history
- `GET /api/v1/workouts/records` - Get personal records
- `GET /api/v1/workouts/streak` - Get workout streak

### Memberships
- `POST /api/v1/memberships` - Create membership
- `GET /api/v1/memberships/my-membership` - Get active membership

### Ratings
- `POST /api/v1/ratings` - Submit rating
- `GET /api/v1/ratings` - Get ratings

### Dashboard
- `GET /api/v1/dashboard` - Get role-specific stats

## User Roles

- **MEMBER** - Book classes, log workouts, track progress
- **INSTRUCTOR** - Manage classes, view attendance
- **STUDIO_ADMIN** - Full platform management

## Database Models

- **User** - Authentication, profiles, metrics
- **ClassSession** - Class schedules with capacity
- **Booking** - Class bookings with QR codes and waitlist
- **WorkoutLog** - Exercise tracking
- **Membership** - Plan management (Monthly/Annual/Class Packs)
- **Rating** - Class and instructor reviews
- **Notification** - User notifications

## Key Features

✅ JWT Authentication with role-based access
✅ Class booking with automatic waitlist
✅ QR code generation for check-ins
✅ Workout logging with personal records
✅ Body metrics tracking
✅ Membership validation and credit management
✅ Rating system for classes and instructors
✅ Role-specific dashboards

## Testing

### Create Test Users

```bash
# Register as Member
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"member@test.com","password":"password123","fullName":"Test Member","role":"MEMBER"}'

# Register as Instructor
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@test.com","password":"password123","fullName":"Test Instructor","role":"INSTRUCTOR"}'

# Register as Admin
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123","fullName":"Test Admin","role":"STUDIO_ADMIN"}'
```

## Project Structure

```
server/
├── src/
│   ├── config/          # Database configuration
│   ├── middlewares/     # Auth middleware
│   ├── modules/         # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── classes/
│   │   ├── bookings/
│   │   ├── workouts/
│   │   ├── memberships/
│   │   ├── ratings/
│   │   ├── notifications/
│   │   └── dashboard/
│   ├── utils/           # Utilities (AppError)
│   ├── app.ts           # Express app
│   └── server.ts        # Entry point

client/
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # Auth context
│   ├── features/        # Feature pages
│   ├── routes/          # Routing
│   ├── services/        # API services
│   └── App.tsx          # Main app
```

## License

MIT

## Author

Sarthak Singh
