export type UserRole = 'user' | 'admin';

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Portfolio {
  title: string;
  description?: string;
  url?: string;
  githubUrl?: string;
  screenshots: string[];
}

export interface PrivacySettings {
  emailVisible: boolean;
  portfolioVisible: boolean;
  contactVisible: boolean;
  allowMessagesFrom: 'everyone' | 'followers';
  allowMentorshipRequests: 'everyone' | 'followers';
}

export interface User {
  _id: string;
  email: string;
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
  socialLinks: SocialLinks;
  education: Education[];
  experience: Experience[];
  portfolio: Portfolio[];
  followers: string[];
  following: string[];
  followerCount: number;
  followingCount: number;
  privacy: PrivacySettings;
  role: UserRole;
  emailVerified: boolean;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}
