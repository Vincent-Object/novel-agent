import { ModelProvider, Message, ModelResponse, ModelConfig } from './base.js';

/**
 * DeepSeek 模型提供商
 * 使用 OpenAI 兼容的 API 格式
 */
export class DeepSeekProvider extends ModelProvider {
  private baseURL: string;

  constructor(config: ModelConfig) {
    super(config);
    this.baseURL = config.baseURL || 'https://api.deepseek.com/v1';
  }

  getDefaultModel(): string {
    return 'deepseek-chat';
  }

  getProviderName(): string {
    return 'DeepSeek';
  }

  /**
   * 转换消息格式（DeepSeek 使用 OpenAI 兼容格式）
   */
  private convertMessages(messages: Message[], systemPrompt?: string): Array<{ role: string; content: string }> {
    const result: Array<{ role: string; content: string }> = [];

    // 如果有系统提示词，添加到最前面
    if (systemPrompt) {
      result.push({ role: 'system', content: systemPrompt });
    }

    // 添加其他消息
    messages.forEach(msg => {
      result.push({ role: msg.role, content: msg.content });
    });

    return result;
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<ModelResponse> {
    try {
      const requestMessages = this.convertMessages(messages, systemPrompt);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: requestMessages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API 错误: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
      };
    } catch (error) {
      console.error('DeepSeek API 调用失败:', error);
      throw new Error(`DeepSeek API 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async *streamChat(messages: Message[], systemPrompt?: string): AsyncGenerator<string, void, unknown> {
    try {
      const requestMessages = this.convertMessages(messages, systemPrompt);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: requestMessages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API 错误: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices[0]?.delta?.content;
            if (delta) {
              yield delta;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    } catch (error) {
      console.error('DeepSeek 流式调用失败:', error);
      throw new Error(`DeepSeek 流式错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10,
        }),
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
