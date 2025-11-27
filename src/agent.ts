import readline from 'readline';
import { ModelProvider, Message, ProviderFactory, ProviderType } from './providers/index.js';

interface AgentConfig {
  provider: ProviderType;
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  baseURL?: string;
}

/**
 * NovelAgent - 支持多模型的小说创作助手
 */
export class NovelAgent {
  private provider: ModelProvider;
  private conversationHistory: Message[] = [];
  private systemPrompt: string;

  constructor(config: AgentConfig) {
    // 使用工厂创建对应的模型提供商
    this.provider = ProviderFactory.createProvider(config.provider, {
      apiKey: config.apiKey,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      baseURL: config.baseURL,
    });

    this.systemPrompt = this.buildSystemPrompt();
  }

  /**
   * 构建系统提示词
   */
  private buildSystemPrompt(): string {
    return `你是一个专业的小说创作助手，名为 Novel Agent。你的使命是帮助作家构思、规划和撰写小说。

你的核心能力包括：

1. **创意激发**: 帮助作家产生新颖的故事点子、情节转折和人物冲突
2. **结构规划**: 协助构建清晰的故事大纲、章节结构和时间线
3. **角色塑造**: 深入挖掘角色的性格、背景、动机和成长弧线
4. **世界观构建**: 设计一致且引人入胜的虚构世界设定
5. **文本润色**: 提供写作建议，优化叙事节奏和语言表达

工作原则：
- 始终以作家的创作意图为中心，提供辅助而非主导
- 保持故事元素的一致性和连贯性
- 提出启发性问题，帮助作家深化思考
- 尊重不同的文学风格和创作偏好
- 在需要时提供具体的写作示例

当前你可以使用以下命令来管理小说项目：
- /new-project <项目名> - 创建新的小说项目
- /add-character <角色名> - 添加新角色
- /create-outline - 创建章节大纲
- /write-scene - 撰写场景
- /worldbuild - 构建世界观设定

请用友好、专业且富有创造力的方式与作家交流。`;
  }

  /**
   * 发送消息并获取响应
   */
  async chat(userMessage: string): Promise<string> {
    // 添加用户消息到历史
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      // 调用模型提供商的API
      const response = await this.provider.chat(
        this.conversationHistory,
        this.systemPrompt
      );

      // 添加助手响应到历史
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      return response.content;
    } catch (error) {
      console.error('API调用失败:', error);
      throw error;
    }
  }

  /**
   * 清空对话历史
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * 获取对话历史
   */
  getHistory(): Message[] {
    return [...this.conversationHistory];
  }

  /**
   * 获取当前模型配置信息
   */
  getModelInfo(): string {
    const config = this.provider.getConfig();
    return `当前使用: ${config.provider} - ${config.model}`;
  }

  /**
   * 启动交互式会话
   */
  async startInteractiveSession(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\n你> ',
    });

    console.log('💬 开始对话（输入 /quit 退出，/clear 清空历史，/info 查看模型信息）\n');
    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();

      // 处理特殊命令
      if (input === '/quit' || input === '/exit') {
        console.log('\n👋 再见！祝创作愉快！');
        rl.close();
        process.exit(0);
        return;
      }

      if (input === '/clear') {
        this.clearHistory();
        console.log('✨ 对话历史已清空');
        rl.prompt();
        return;
      }

      if (input === '/history') {
        console.log('\n📜 对话历史:');
        this.conversationHistory.forEach((msg, idx) => {
          console.log(`\n[${idx + 1}] ${msg.role}:`);
          console.log(msg.content);
        });
        rl.prompt();
        return;
      }

      if (input === '/info') {
        console.log(`\n📊 ${this.getModelInfo()}`);
        rl.prompt();
        return;
      }

      if (!input) {
        rl.prompt();
        return;
      }

      try {
        // 显示思考状态
        process.stdout.write('\n💭 思考中...\n\n');

        // 获取响应
        const response = await this.chat(input);

        // 显示响应
        console.log(`Agent> ${response}`);
      } catch (error) {
        console.error('\n❌ 处理消息时出错:', error);
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\n👋 会话结束');
      process.exit(0);
    });
  }
}
