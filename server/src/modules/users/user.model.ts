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
  certifications?: string[];

  // Member Specific
  metrics?: IBodyMetrics[]; // Array to track progress over time

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 3. Create the Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
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
    certifications: [{ type: String }],

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

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Auto-manage createdAt, updatedAt
    versionKey: false
  }
);

// 4. Export the Model
export const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);