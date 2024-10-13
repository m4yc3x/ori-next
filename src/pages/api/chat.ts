import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import prisma from '../../lib/prisma';
import { GroqAPI } from '../../lib/groq';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { chatId, message, step, initialPrompt, previousStepResponses } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiKey: true },
    });

    if (!user?.apiKey) {
      return res.status(400).json({ error: 'API key not found. Please add your API key in the settings.' });
    }

    let chat;
    if (chatId === 'new') {
      chat = await prisma.chat.create({
        data: {
          userId: session.user.id,
          title: message.substring(0, 50),
          currentStep: 'Initial response',
          isCompleted: false,
        },
      });
    } else {
      chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
    }

    // Save user message if it's the first step
    if (step === 'Initial response') {
      await prisma.message.create({
        data: {
          content: message,
          userId: session.user.id,
          chatId: chat.id,
          role: 'user',
        },
      });
    }

    const groq = new GroqAPI(user.apiKey);

    await prisma.chat.update({
      where: { id: chat.id },
      data: { currentStep: step },
    });

    let stepResponse, searchResults;
    const context = previousStepResponses.map((resp, index) => ({
      role: 'assistant',
      content: `Step ${index + 1}: ${resp.content}${resp.searchResults ? `\nSearch results: ${resp.searchResults}` : ''}`
    }));

    if (step === 'Web search') {
      stepResponse = await groq.generateResponse([...context, { role: 'user', content: message }], step, initialPrompt);
      searchResults = await groq.performSearch(stepResponse);
    } else {
      stepResponse = await groq.generateResponse([...context, { role: 'user', content: message }], step, initialPrompt);
    }

    const savedMessage = await prisma.message.create({
      data: {
        content: stepResponse,
        searchResults: step === 'Web search' ? (searchResults || undefined) : undefined,
        userId: session.user.id,
        chatId: chat.id,
        role: 'assistant',
        step: step,
      },
    });

    if (step === 'Final response') {
      await prisma.chat.update({
        where: { id: chat.id },
        data: { 
          isCompleted: true,
          currentStep: 'completed',
          updatedAt: new Date(),
        },
      });
    }

    res.status(200).json({
      messageId: savedMessage.id,
      content: stepResponse,
      searchResults: step === 'Web search' ? searchResults : undefined,
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: `Error processing chat: ${error.message}` });
  }
}
