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

  const { chatId, message } = req.body;

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

    // Save user message
    await prisma.message.create({
      data: {
        content: message,
        userId: session.user.id,
        chatId: chat.id,
        role: 'user',
      },
    });

    const groq = new GroqAPI(user.apiKey);

    const steps = [
      { name: 'Initial response', description: 'Generating initial response' },
      { name: 'Verified response', description: 'Verifying and refining the response' },
      { name: 'Web search', description: 'Performing web search for additional information' },
      { name: 'Validated reasoning', description: 'Validating the reasoning process' },
      { name: 'Final response', description: 'Generating the final response' },
    ];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let conversationHistory = [{ role: 'user', content: message }];
    let searchResults = '';

    for (const [index, step] of steps.entries()) {
      try {
        await prisma.chat.update({
          where: { id: chat.id },
          data: { currentStep: step.name },
        });

        res.write(`data: ${JSON.stringify({ type: 'step', step: index + 1, total: steps.length, description: step.description })}\n\n`);

        const stepResponse = await groq.generateResponse(conversationHistory, step.name, message);

        if (step.name === 'Web search') {
          searchResults = await groq.performSearch(stepResponse);
        }

        const savedMessage = await prisma.message.create({
          data: {
            content: stepResponse,
            searchResults: step.name === 'Web search' ? searchResults : undefined,
            userId: session.user.id,
            chatId: chat.id,
            role: 'assistant',
            step: step.name,
          },
        });

        conversationHistory.push({ role: 'assistant', content: stepResponse });
        if (step.name === 'Web search') {
          conversationHistory.push({ role: 'system', content: `Search results:\n${searchResults}` });
        }
        conversationHistory.push({ role: 'user', content: `Proceed to the next step: ${steps[index + 1]?.name || 'Final response'}` });

        res.write(`data: ${JSON.stringify({ type: 'message', id: savedMessage.id, content: stepResponse, step: step.name, searchResults: step.name === 'Web search' ? searchResults : undefined })}\n\n`);
      } catch (stepError: any) {
        console.error(`Error in step ${step.name}:`, stepError);
        res.write(`data: ${JSON.stringify({ type: 'error', message: `Error in ${step.name}: ${stepError.message}` })}\n\n`);
      }
    }

    await prisma.chat.update({
      where: { id: chat.id },
      data: { 
        isCompleted: true,
        currentStep: 'completed',
        updatedAt: new Date(),
      },
    });

    res.write(`data: ${JSON.stringify({ type: 'end' })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: `Error processing chat: ${error.message}` })}\n\n`);
    res.end();
  }
}
