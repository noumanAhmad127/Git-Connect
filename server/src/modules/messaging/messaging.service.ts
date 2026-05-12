import { Conversation } from './conversation.model.js';
import { Message, type IMessage } from './message.model.js';
import { User } from '../auth/user.model.js';
import { AppError } from '../../shared/errors/AppError.js';
import { createNotification } from '../notifications/notification.service.js';
import { emitToUser } from '../../socket/index.js';

interface ConversationResponse {
  id: string;
  participant: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
  };
  unreadCount: number;
  updatedAt: string;
}

interface MessageResponse {
  id: string;
  conversation: string;
  sender: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
}

function toMessageResponse(msg: IMessage, populated?: any): MessageResponse {
  const sender = populated?.sender ?? msg.sender;
  const receiver = populated?.receiver ?? msg.receiver;
  return {
    id: msg._id.toString(),
    conversation: msg.conversation.toString(),
    sender: sender.name
      ? {
          id: sender._id.toString(),
          name: sender.name,
          username: sender.username,
          avatar: sender.avatar,
        }
      : { id: msg.sender.toString(), name: 'Unknown', username: 'unknown' },
    receiver: receiver.name
      ? {
          id: receiver._id.toString(),
          name: receiver.name,
          username: receiver.username,
          avatar: receiver.avatar,
        }
      : { id: msg.receiver.toString(), name: 'Unknown', username: 'unknown' },
    content: msg.content,
    read: msg.read,
    createdAt: msg.createdAt.toISOString(),
  };
}

export async function getOrCreateConversation(
  userId: string,
  otherUserId: string,
): Promise<string> {
  const ids = [userId, otherUserId].sort();
  let conv = await Conversation.findOne({
    participants: { $all: ids, $size: 2 },
  });
  if (!conv) {
    conv = await Conversation.create({ participants: ids });
  }
  return conv._id.toString();
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string,
): Promise<MessageResponse> {
  if (senderId === receiverId) {
    throw new AppError('Cannot message yourself', 400, 'INVALID_ACTION');
  }

  const receiver = await User.findById(receiverId);
  if (!receiver) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

  const conversationId = await getOrCreateConversation(senderId, receiverId);

  const msg = await Message.create({
    conversation: conversationId,
    sender: senderId,
    receiver: receiverId,
    content,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: { content, sender: senderId, createdAt: new Date() },
  });

  const populated = await msg.populate('sender receiver', 'name username avatar');
  const response = toMessageResponse(msg, populated);
  emitToUser(receiverId, 'new_message', response);
  const notif = await createNotification(
    receiverId,
    'message',
    senderId,
    `/messages/${conversationId}`,
  );
  if (notif) emitToUser(receiverId, 'notification', notif);
  return response;
}

export async function getConversations(userId: string): Promise<ConversationResponse[]> {
  const conversations = await Conversation.find({
    participants: userId,
  })
    .sort({ updatedAt: -1 })
    .limit(50);

  const results: ConversationResponse[] = [];

  for (const conv of conversations) {
    const otherId = conv.participants.find((p) => p.toString() !== userId);
    const otherUser = otherId ? await User.findById(otherId).select('name username avatar') : null;

    const unreadCount = await Message.countDocuments({
      conversation: conv._id,
      receiver: userId,
      read: false,
    });

    results.push({
      id: conv._id.toString(),
      participant: otherUser
        ? {
            id: otherUser._id.toString(),
            name: otherUser.name,
            username: otherUser.username,
            avatar: otherUser.avatar,
          }
        : { id: 'unknown', name: 'Unknown', username: 'unknown' },
      lastMessage: conv.lastMessage
        ? {
            content: conv.lastMessage.content,
            sender: conv.lastMessage.sender.toString(),
            createdAt: conv.lastMessage.createdAt.toISOString(),
          }
        : undefined,
      unreadCount,
      updatedAt: conv.updatedAt.toISOString(),
    });
  }

  return results;
}

export async function getMessages(
  conversationId: string,
  userId: string,
  page: number,
  limit: number,
): Promise<{ messages: MessageResponse[]; total: number }> {
  const conv = await Conversation.findById(conversationId);
  if (!conv) throw new AppError('Conversation not found', 404, 'NOT_FOUND');
  if (!conv.participants.some((p) => p.toString() === userId)) {
    throw new AppError('Not authorized', 403, 'FORBIDDEN');
  }

  const [messages, total] = await Promise.all([
    Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender receiver', 'name username avatar'),
    Message.countDocuments({ conversation: conversationId }),
  ]);

  return {
    messages: messages.reverse().map((m) => toMessageResponse(m, m)),
    total,
  };
}

export async function markAsRead(conversationId: string, userId: string): Promise<void> {
  await Message.updateMany(
    { conversation: conversationId, receiver: userId, read: false },
    { read: true },
  );
}

export async function getUnreadCount(userId: string): Promise<number> {
  return Message.countDocuments({ receiver: userId, read: false });
}
