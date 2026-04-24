import axios from 'axios';
import { AppError } from '../utils/errors.js';

const DIFY_BASE_URL = process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1';
const TIMEOUT = 60_000; // 60s — LLM calls can be slow

interface WorkflowResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: string;
    outputs: Record<string, unknown>;
  };
}

interface ChatResponse {
  message_id: string;
  conversation_id: string;
  answer: string;
}

function mapDifyError(status: number, message?: string): AppError {
  switch (status) {
    case 400:
      return new AppError(message || 'Invalid input to AI workflow', 400);
    case 401:
      return new AppError('AI service configuration error', 500);
    case 429:
      return new AppError('AI service rate limit exceeded — please try again later', 429);
    default:
      return new AppError('AI service temporarily unavailable', 503);
  }
}

export async function runWorkflow(
  apiKey: string,
  inputs: Record<string, unknown>,
  userId: string
): Promise<Record<string, unknown>> {
  try {
    const { data } = await axios.post<WorkflowResponse>(
      `${DIFY_BASE_URL}/workflows/run`,
      {
        inputs,
        response_mode: 'blocking',
        user: userId,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: TIMEOUT,
      }
    );

    if (data.data?.status !== 'succeeded') {
      throw new AppError('AI workflow did not complete successfully', 500);
    }

    return data.data.outputs;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (axios.isAxiosError(error)) {
      throw mapDifyError(error.response?.status || 500, error.response?.data?.message);
    }
    throw new AppError('AI service request failed', 500);
  }
}

export async function sendChatMessage(
  apiKey: string,
  message: string,
  userId: string,
  conversationId?: string
): Promise<{ answer: string; conversationId: string }> {
  try {
    const { data } = await axios.post<ChatResponse>(
      `${DIFY_BASE_URL}/chat-messages`,
      {
        inputs: {},
        query: message,
        response_mode: 'blocking',
        user: userId,
        conversation_id: conversationId || '',
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: TIMEOUT,
      }
    );

    return {
      answer: data.answer,
      conversationId: data.conversation_id,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (axios.isAxiosError(error)) {
      throw mapDifyError(error.response?.status || 500, error.response?.data?.message);
    }
    throw new AppError('AI chat request failed', 500);
  }
}
