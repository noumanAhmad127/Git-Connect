import { User } from '../auth/user.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { createNotification } from '../notifications/notification.service.js';
import { emitToUser } from '../../socket/index.js';
import type mongoose from 'mongoose';

interface PublicProfile {
  id: string;
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
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  createdAt: string;
}

function toPublicProfile(user: InstanceType<typeof User>, currentUserId?: string): PublicProfile {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    headline: user.headline,
    bio: user.bio,
    skills: user.skills,
    location: user.location,
    experienceYears: user.experienceYears,
    availableForMentorship: user.availableForMentorship,
    availableForCollaboration: user.availableForCollaboration,
    socialLinks: user.socialLinks,
    education: user.education,
    experience: user.experience,
    portfolio: user.portfolio,
    followerCount: user.followers.length,
    followingCount: user.following.length,
    isFollowing: currentUserId ? user.followers.some((f) => f.toString() === currentUserId) : false,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function getProfile(username: string, currentUserId?: string): Promise<PublicProfile> {
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return toPublicProfile(user, currentUserId);
}

export async function updateProfile(
  userId: string,
  updates: Partial<{
    name: string;
    headline: string;
    bio: string;
    skills: string[];
    location: string;
    experienceYears: number;
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
  }>,
): Promise<PublicProfile> {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return toPublicProfile(user, userId);
}

export async function listDevelopers(params: {
  page: number;
  limit: number;
  skills?: string;
  location?: string;
  minExperience?: number;
  mentorship?: boolean;
  search?: string;
}): Promise<{ users: PublicProfile[]; total: number }> {
  const filter: Record<string, unknown> = {};

  if (params.skills) {
    const skillArray = params.skills.split(',').map((s) => s.trim());
    filter.skills = { $in: skillArray };
  }
  if (params.location) {
    filter.location = { $regex: params.location, $options: 'i' };
  }
  if (params.minExperience !== undefined) {
    filter.experienceYears = { $gte: params.minExperience };
  }
  if (params.mentorship) {
    filter.availableForMentorship = true;
  }
  if (params.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: 'i' } },
      { username: { $regex: params.search, $options: 'i' } },
      { headline: { $regex: params.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit),
    User.countDocuments(filter),
  ]);

  return {
    users: users.map((u) => toPublicProfile(u)),
    total,
  };
}

export async function toggleFollow(
  followerId: string,
  targetUsername: string,
): Promise<{ isFollowing: boolean; followerCount: number }> {
  if (followerId === targetUsername) {
    throw new AppError('Cannot follow yourself', 400, 'INVALID_ACTION');
  }

  const target = await User.findOne({ username: targetUsername.toLowerCase() });
  if (!target) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const followerObjectId = target._id;
  const isCurrentlyFollowing = target.followers.some((f) => f.toString() === followerId);

  if (isCurrentlyFollowing) {
    target.followers = target.followers.filter((f) => f.toString() !== followerId);
    await User.findByIdAndUpdate(followerId, {
      $pull: { following: followerObjectId },
    });
  } else {
    target.followers.push(followerId as unknown as mongoose.Types.ObjectId);
    await User.findByIdAndUpdate(followerId, {
      $push: { following: followerObjectId },
    });
    const notif = await createNotification(
      target._id.toString(),
      'follow',
      followerId,
      `/developers/${targetUsername}`,
    );
    if (notif) {
      emitToUser(target._id.toString(), 'notification', notif);
    }
  }

  await target.save();

  return {
    isFollowing: !isCurrentlyFollowing,
    followerCount: target.followers.length,
  };
}

export async function getFollowers(
  username: string,
  page: number,
  limit: number,
): Promise<{ users: PublicProfile[]; total: number }> {
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const total = user.followers.length;
  const followerIds = user.followers.slice((page - 1) * limit, page * limit);
  const followers = await User.find({ _id: { $in: followerIds } });

  return {
    users: followers.map((u) => toPublicProfile(u)),
    total,
  };
}

export async function getFollowing(
  username: string,
  page: number,
  limit: number,
): Promise<{ users: PublicProfile[]; total: number }> {
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const total = user.following.length;
  const followingIds = user.following.slice((page - 1) * limit, page * limit);
  const following = await User.find({ _id: { $in: followingIds } });

  return {
    users: following.map((u) => toPublicProfile(u)),
    total,
  };
}
