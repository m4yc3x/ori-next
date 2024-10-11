import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { chatId } = req.query;

  if (chatId === 'new') {
    // Return an empty array for new chats
    return res.status(200).json([]);
  }

  try {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId as string },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            role: true,
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (chat.userId !== session.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this chat' });
    }

    const formattedMessages = chat.messages.map(message => ({
      id: message.id,
      content: message.content,
      role: message.role,
      createdAt: message.createdAt,
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error fetching messages' });
  }
}