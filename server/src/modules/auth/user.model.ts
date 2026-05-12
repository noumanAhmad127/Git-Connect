import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  createdAt: Date;
  updatedAt: Date;
  email: string;
  passwordHash: string;
  name: string;
  username: string;
  avatar?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  location?: string;
  experienceYears?: number;
  availableForMentorship: boolean;
  availableForCollaboration: boolean;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  education: {
    degree: string;
    institution: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  experience: {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }[];
  portfolio: {
    title: string;
    description?: string;
    url?: string;
    githubUrl?: string;
    screenshots: string[];
  }[];
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  privacy: {
    emailVisible: boolean;
    portfolioVisible: boolean;
    contactVisible: boolean;
    allowMessagesFrom: 'everyone' | 'followers';
    allowMentorshipRequests: 'everyone' | 'followers';
  };
  role: 'user' | 'admin';
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  banned: boolean;
  bannedAt?: Date;
  lastLogin?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      maxlength: 30,
    },
    avatar: { type: String },
    headline: { type: String, maxlength: 200 },
    bio: { type: String, maxlength: 2000 },
    skills: [{ type: String, maxlength: 50 }],
    location: { type: String, maxlength: 100 },
    experienceYears: { type: Number, min: 0, max: 80 },
    availableForMentorship: { type: Boolean, default: false },
    availableForCollaboration: { type: Boolean, default: false },
    socialLinks: {
      github: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      website: { type: String },
    },
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: String,
        description: String,
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: String,
        startDate: { type: String, required: true },
        endDate: String,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],
    portfolio: [
      {
        title: { type: String, required: true },
        description: String,
        url: String,
        githubUrl: String,
        screenshots: [{ type: String }],
      },
    ],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    privacy: {
      emailVisible: { type: Boolean, default: false },
      portfolioVisible: { type: Boolean, default: true },
      contactVisible: { type: Boolean, default: false },
      allowMessagesFrom: { type: String, enum: ['everyone', 'followers'], default: 'everyone' },
      allowMentorshipRequests: {
        type: String,
        enum: ['everyone', 'followers'],
        default: 'everyone',
      },
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationTokenExpiry: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiry: { type: Date },
    banned: { type: Boolean, default: false },
    bannedAt: { type: Date },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

userSchema.virtual('followerCount').get(function () {
  return this.followers.length;
});

userSchema.virtual('followingCount').get(function () {
  return this.following.length;
});

userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.passwordHash;
    delete obj.__v;
    return obj;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);
