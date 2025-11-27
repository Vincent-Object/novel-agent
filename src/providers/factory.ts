import { ModelProvider, ModelConfig } from './base.js';
import { ClaudeProvider } from './claude.js';
import { DeepSeekProvider } from './deepseek.js';

/**
 * 支持的模型提供商类型
 */
export type ProviderType = 'claude' | 'deepseek';

/**
 * 模型提供商工厂类
 * 根据配置创建相应的提供商实例
 */
export class ProviderFactory {
  /**
   * 创建模型提供商实例
   */
  static createProvider(type: ProviderType, config: ModelConfig): ModelProvider {
    switch (type) {
      case 'claude':
        return new ClaudeProvider(config);
      case 'deepseek':
        return new DeepSeekProvider(config);
      default:
        throw new Error(`不支持的模型提供商: ${type}`);
    }
  }

  /**
   * 获取所有支持的提供商列表
   */
  static getSupportedProviders(): ProviderType[] {
    return ['claude', 'deepseek'];
  }

  /**
   * 检查提供商类型是否支持
   */
  static isSupported(type: string): type is ProviderType {
    return this.getSupportedProviders().includes(type as ProviderType);
  }

  /**
   * 获取提供商的默认模型
   */
  static getDefaultModel(type: ProviderType): string {
    const dummyConfig: ModelConfig = { apiKey: 'dummy' };
    const provider = this.createProvider(type, dummyConfig);
    return provider.getDefaultModel();
  }

  /**
   * 获取提供商信息
   */
  static getProviderInfo(): Record<ProviderType, { name: string; defaultModel: string; description: string }> {
    return {
      claude: {
        name: 'Claude',
        defaultModel: 'claude-sonnet-4-5-20250929',
        description: 'Anthropic Claude - 擅长复杂推理、长文本处理和代码生成',
      },
      deepseek: {
        name: 'DeepSeek',
        defaultModel: 'deepseek-chat',
        description: 'DeepSeek - 国产大模型，中文理解能力强，成本低',
      },
    };
  }
}
