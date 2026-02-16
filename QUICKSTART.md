# Fitness Studio Platform - Quick Start Guide

## 🚀 Running the Application

### Backend (Terminal 1)
```bash
cd server
npm install
npm run dev
```
Server will run on `http://localhost:5000`

### Frontend (Terminal 2)
```bash
cd client
npm install
npm run dev
```
App will run on `http://localhost:5173`

### MongoDB
Make sure MongoDB is running:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or check if it's running
brew services list
```

## 📱 Testing the App

1. **Register a new account** at `http://localhost:5173/login`
   - Click "Don't have an account? Register"
   - Choose a role: Member, Instructor, or Studio Admin
   
2. **Explore features by role:**

**Member:**
- Dashboard: View stats and upcoming bookings
- Schedule: Browse and book classes
- Bookings: See your bookings with QR codes
- Workouts: Log workouts and track personal records
- Progress: Track body metrics with charts
- Membership: Purchase a plan

**Instructor:**
- Dashboard: View your classes and ratings
- Schedule: Create and manage classes
- View student bookings

**Studio Admin:**
- Dashboard: Platform overview
- Full access to all features
- User and class management

## ✅ What's Complete

### Backend (100%)
- ✅ 10 API modules with 40+ endpoints
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ MongoDB integration
- ✅ QR code generation
- ✅ Waitlist management
- ✅ Membership validation
- ✅ Personal records tracking
- ✅ Workout streak calculation

### Frontend (95%)
- ✅ 8 complete pages
- ✅ FullCalendar integration
- ✅ Recharts for analytics
- ✅ Material-UI components
- ✅ Protected routing
- ✅ Auth with profile fetching
- ✅ QR code display
- ✅ Responsive design

## 🎯 Key Features

1. **Class Booking** - Book classes with automatic waitlist
2. **QR Check-in** - Generate QR codes for class check-in
3. **Workout Logging** - Track exercises, sets, reps, weight
4. **Progress Analytics** - Charts for weight and body fat
5. **Personal Records** - Automatic PR tracking
6. **Membership Management** - Multiple plan types
7. **Rating System** - Rate classes and instructors
8. **Role-Based Dashboards** - Custom views for each role

## 📚 Documentation

- [README.md](../README.md) - Full documentation
- [Walkthrough](./walkthrough.md) - Detailed feature guide
- [Task List](./task.md) - Implementation checklist

## 🐛 Troubleshooting

**MongoDB not connecting:**
- Check if MongoDB is running: `brew services list`
- Verify connection string in `server/.env`

**Port in use:**
- Backend: Change `PORT` in `server/.env`
- Frontend: Vite will auto-select next port

**CORS errors:**
- Ensure `CORS_ORIGIN` in `server/.env` matches frontend URL

## 🎉 You're Ready!

The application is fully functional and ready to use. Start both servers and begin exploring!
