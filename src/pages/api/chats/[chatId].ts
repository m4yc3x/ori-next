import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { chatId } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Check if the chat exists and belongs to the user
      const chat = await prisma.chat.findUnique({
        where: { id: chatId as string },
        select: { userId: true },
      });

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      if (chat.userId !== session.user.id) {
        return res.status(403).json({ error: 'Unauthorized to delete this chat' });
      }

      // Delete associated messages first
      await prisma.message.deleteMany({
        where: { chatId: chatId as string },
      });

      // Then delete the chat
      await prisma.chat.delete({
        where: { id: chatId as string },
      });

      res.status(200).json({ message: 'Chat and associated messages deleted successfully' });
    } catch (error) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ error: 'Error deleting chat' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}