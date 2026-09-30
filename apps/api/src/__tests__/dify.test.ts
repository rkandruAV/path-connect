import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { runWorkflow, sendChatMessage } from '../lib/dify.js';

vi.mock('axios');

describe('Dify client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runWorkflow', () => {
    it('returns outputs on successful workflow', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          workflow_run_id: 'run-1',
          task_id: 'task-1',
          data: {
            id: 'wf-1',
            workflow_id: 'wf-id',
            status: 'succeeded',
            outputs: { result: '{"mentors": []}' },
          },
        },
      });

      const outputs = await runWorkflow('api-key', { input: 'test' }, 'user-1');

      expect(outputs).toEqual({ result: '{"mentors": []}' });
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/workflows/run'),
        expect.objectContaining({
          inputs: { input: 'test' },
          response_mode: 'blocking',
          user: 'user-1',
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer api-key',
          }),
          timeout: 60000,
        })
      );
    });

    it('throws AppError when workflow status is not succeeded', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          data: { status: 'failed', outputs: {} },
        },
      });

      await expect(runWorkflow('key', {}, 'user-1')).rejects.toThrow(
        'AI workflow did not complete successfully'
      );
    });

    it('maps 429 Dify error to rate limit AppError', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 429, data: { message: 'Rate limited' } },
      };
      vi.mocked(axios.post).mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await expect(runWorkflow('key', {}, 'user-1')).rejects.toMatchObject({
        statusCode: 429,
        message: expect.stringContaining('rate limit'),
      });
    });

    it('maps 401 Dify error to 500 config error', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 401, data: {} },
      };
      vi.mocked(axios.post).mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await expect(runWorkflow('key', {}, 'user-1')).rejects.toMatchObject({
        statusCode: 500,
        message: expect.stringContaining('configuration'),
      });
    });

    it('maps unknown Dify errors to 503', async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 502, data: {} },
      };
      vi.mocked(axios.post).mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await expect(runWorkflow('key', {}, 'user-1')).rejects.toMatchObject({
        statusCode: 503,
      });
    });

    it('wraps non-Axios errors as 500', async () => {
      vi.mocked(axios.post).mockRejectedValue(new Error('Network failed'));
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      await expect(runWorkflow('key', {}, 'user-1')).rejects.toMatchObject({
        statusCode: 500,
        message: 'AI service request failed',
      });
    });
  });

  describe('sendChatMessage', () => {
    it('returns answer and conversationId on success', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          message_id: 'msg-1',
          conversation_id: 'conv-abc',
          answer: 'Hello! How can I help?',
        },
      });

      const result = await sendChatMessage('key', 'Hi', 'user-1');

      expect(result).toEqual({
        answer: 'Hello! How can I help?',
        conversationId: 'conv-abc',
      });
    });

    it('passes conversationId for multi-turn conversations', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          message_id: 'msg-2',
          conversation_id: 'conv-abc',
          answer: 'Follow-up response',
        },
      });

      await sendChatMessage('key', 'Tell me more', 'user-1', 'conv-abc');

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/chat-messages'),
        expect.objectContaining({
          conversation_id: 'conv-abc',
          query: 'Tell me more',
        }),
        expect.any(Object)
      );
    });

    it('sends empty string as conversationId for first message', async () => {
      vi.mocked(axios.post).mockResolvedValue({
        data: {
          message_id: 'msg-1',
          conversation_id: 'conv-new',
          answer: 'Welcome!',
        },
      });

      await sendChatMessage('key', 'Hello', 'user-1');

      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          conversation_id: '',
        }),
        expect.any(Object)
      );
    });
  });
});
