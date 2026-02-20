import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import { ZodError, ZodIssue } from 'zod';

import swaggerSpec from './config/swagger.js';
import logger from './utils/logger.js';
import { AppError } from './utils/AppError.js';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.route.js';
import metricsRoutes from './modules/users/metrics.routes.js';
import classRoutes from './modules/classes/class.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import workoutRoutes from './modules/workouts/workout.routes.js';
import membershipRoutes from './modules/memberships/membership.routes.js';
import ratingRoutes from './modules/ratings/rating.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import paymentRoutes from './modules/payment/payment.routes.js';
import studioRoutes from './modules/studios/studio.routes.js';

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(hpp());
import path from 'path';

// ... existing code

app.use(compression());

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/metrics', metricsRoutes);
app.use('/api/v1/classes', classRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/memberships', membershipRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/studios', studioRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Fitness Platform API Running' });
});

app.all('*', (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

interface IResponseError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number | string;
  errmsg?: string;
  path?: string;
  value?: string;
  issues?: ZodIssue[]; // For ZodError
}

app.use((err: IResponseError, _req: Request, res: Response, _next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'fail',
      message: 'Validation Error',
      errors: err.issues,
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ status: 'fail', message: `Invalid ${err.path}: ${err.value}` });
    return;
  }

  if (err.code === 11000) {
    const value = err.errmsg?.match(/(["'])(\\?.)*?\1/);
    const message = value ? `Duplicate field value: ${value[0]}. Please use another value!` : 'Duplicate field value. Please use another value!';
    res.status(400).json({ status: 'fail', message });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ status: 'fail', message: 'Invalid token. Please log in again!' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ status: 'fail', message: 'Your token has expired! Please log in again.' });
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
});

export default app;