/**
 * 消息接口
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * 模型响应接口
 */
export interface ModelResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * 模型配置接口
 */
export interface ModelConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  baseURL?: string;
}

/**
 * 模型提供商抽象类
 * 定义所有模型提供商必须实现的接口
 */
export abstract class ModelProvider {
  protected apiKey: string;
  protected model: string;
  protected maxTokens: number;
  protected temperature: number;
  protected baseURL?: string;

  constructor(config: ModelConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || this.getDefaultModel();
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
    this.baseURL = config.baseURL;
  }

  /**
   * 获取默认模型名称
   */
  abstract getDefaultModel(): string;

  /**
   * 获取提供商名称
   */
  abstract getProviderName(): string;

  /**
   * 发送聊天请求
   */
  abstract chat(
    messages: Message[],
    systemPrompt?: string
  ): Promise<ModelResponse>;

  /**
   * 流式聊天（可选实现）
   */
  async *streamChat(
    messages: Message[],
    systemPrompt?: string
  ): AsyncGenerator<string, void, unknown> {
    // 默认实现：一次性返回完整响应
    const response = await this.chat(messages, systemPrompt);
    yield response.content;
  }

  /**
   * 验证API Key是否有效
   */
  abstract validateApiKey(): Promise<boolean>;

  /**
   * 获取当前配置信息
   */
  getConfig(): {
    provider: string;
    model: string;
    maxTokens: number;
    temperature: number;
  } {
    return {
      provider: this.getProviderName(),
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
    };
  }
}
