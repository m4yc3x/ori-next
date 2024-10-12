import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const newChat = await prisma.chat.create({
      data: {
        title: 'New Chat',
        userId: session.user.id,
        currentStep: 'Initial',
        isCompleted: false,
      },
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error('Error creating new chat:', error);
    res.status(500).json({ error: 'Error creating new chat' });
  }
}
