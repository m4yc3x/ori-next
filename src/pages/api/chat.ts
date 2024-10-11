import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from '../../lib/prisma';
// Import your AI service here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chatId, message } = req.body;

  try {
    let chat;
    if (chatId === 'new') {
      // Create a new chat with a default title
      chat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          title: "New Chat", // Add this line
        },
      });
    } else {
      // Use existing chat
      chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        content: message,
        userId: session.user.id,
        chatId: chat.id,
      },
    });

    // Get AI response (implement your AI service call here)
    const aiResponse = "This is a placeholder AI response.";

    // Save AI response
    const assistantMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        userId: session.user.id, // You might want to use a special ID for the AI
        chatId: chat.id,
      },
    });

    // Update the chat's title and updatedAt timestamp
    await prisma.chat.update({
      where: { id: chat.id },
      data: { 
        title: message.substring(0, 50), // Use the first 50 characters of the message as the title
        updatedAt: new Date() 
      },
    });

    res.status(200).json({ 
      chatId: chat.id,
      messages: [
        {
          id: userMessage.id,
          content: userMessage.content,
          role: 'user',
        },
        {
          id: assistantMessage.id,
          content: assistantMessage.content,
          role: 'assistant',
        },
      ],
    });
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: 'Error processing chat' });
  }
}