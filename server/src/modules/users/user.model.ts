import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Define Types & Enums
export enum UserRole {
  ADMIN = 'STUDIO_ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  MEMBER = 'MEMBER',
}

export interface IBodyMetrics {
  weight?: number;
  height?: number;
  bodyFatPercentage?: number;
  measurements?: {
    neck?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    biceps?: number;
    thighs?: number;
  };
  updatedAt: Date;
}

// 2. Define the Interface (extends Document for _id, etc.)
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  profileImage?: string;

  // Instructor Specific
  bio?: string;
  specialties?: string[];
  certifications?: Array<{ name: string; expiryDate: Date }>;


  // Member Specific
  metrics?: IBodyMetrics[];
  unitPreference: 'METRIC' | 'IMPERIAL';

  // Preferences
  timezone: string;
  notificationPreferences: {
    category: 'CLASS_REMINDER' | 'CLASS_CANCELLED' | 'WAITLIST_NOTIFICATION' | 'PROMOTION' | 'BOOKING_CONFIRMATION' | 'IMPERSONATION_STARTED' | 'CERT_EXPIRY';
    quietHoursStart: string; // "HH:mm"
    quietHoursEnd: string; // "HH:mm"
    enabled: boolean;
  }[];

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}



// 3. Create the Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.MEMBER
    },
    profileImage: { type: String },

    // Instructor Fields
    bio: { type: String },
    specialties: [{ type: String }],
    certifications: [
      {
        name: { type: String, required: true },
        expiryDate: { type: Date, required: true },
      }
    ],


    // Member Fields (Embedded array for history)
    metrics: [
      {
        weight: Number,
        height: Number,
        bodyFatPercentage: Number,
        measurements: {
          neck: Number,
          chest: Number,
          waist: Number,
          hips: Number,
          biceps: Number,
          thighs: Number,
        },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    unitPreference: {
      type: String,
      enum: ['METRIC', 'IMPERIAL'],
      default: 'METRIC',
    },

    timezone: { type: String, default: 'UTC' },
    notificationPreferences: [
      {
        category: {
          type: String,
          enum: ['CLASS_REMINDER', 'CLASS_CANCELLED', 'WAITLIST_NOTIFICATION', 'PROMOTION', 'BOOKING_CONFIRMATION', 'IMPERSONATION_STARTED', 'CERT_EXPIRY'],
          required: true
        },
        quietHoursStart: { type: String, default: '22:00' },
        quietHoursEnd: { type: String, default: '08:00' },
        enabled: { type: Boolean, default: false }
      }
    ],

    isActive: { type: Boolean, default: true },

  },

  {
    timestamps: true, // Auto-manage createdAt, updatedAt
    versionKey: false
  }
);

// 4. Export the Model
export const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);