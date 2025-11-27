import Anthropic from '@anthropic-ai/sdk';
import { ModelProvider, Message, ModelResponse, ModelConfig } from './base.js';

/**
 * Claude 模型提供商
 * 使用 Anthropic API
 */
export class ClaudeProvider extends ModelProvider {
  private client: Anthropic;

  constructor(config: ModelConfig) {
    super(config);
    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  getDefaultModel(): string {
    return 'claude-sonnet-4-5-20250929';
  }

  getProviderName(): string {
    return 'Claude';
  }

  /**
   * 转换消息格式为 Anthropic 格式
   */
  private convertMessages(messages: Message[]): Array<{ role: 'user' | 'assistant'; content: string }> {
    // Anthropic API 不支持 system 角色在 messages 中
    // system 消息应该通过单独的 system 参数传递
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
  }

  async chat(messages: Message[], systemPrompt?: string): Promise<ModelResponse> {
    try {
      const anthropicMessages = this.convertMessages(messages);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: anthropicMessages,
      });

      // 提取文本内容
      const content = response.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''))
        .join('\n');

      return {
        content,
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('Claude API 调用失败:', error);
      throw new Error(`Claude API 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async *streamChat(messages: Message[], systemPrompt?: string): AsyncGenerator<string, void, unknown> {
    try {
      const anthropicMessages = this.convertMessages(messages);

      const stream = await this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: anthropicMessages,
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text;
        }
      }
    } catch (error) {
      console.error('Claude 流式调用失败:', error);
      throw new Error(`Claude 流式错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // 发送一个最小的测试请求
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}
