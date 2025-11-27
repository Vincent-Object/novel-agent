import 'dotenv/config';
import { NovelAgent } from './agent.js';
import { ProviderFactory, ProviderType } from './providers/index.js';

/**
 * Novel Agent 主入口
 * 一个帮助作家构思和撰写小说的AI助手，支持多模型切换
 */
async function main() {
  console.log('🎭 Novel Agent 启动中...\n');

  // 获取配置
  const provider = (process.env.MODEL_PROVIDER || 'claude') as ProviderType;

  // 验证提供商类型
  if (!ProviderFactory.isSupported(provider)) {
    console.error(`❌ 错误: 不支持的模型提供商 "${provider}"`);
    console.error(`支持的提供商: ${ProviderFactory.getSupportedProviders().join(', ')}\n`);
    process.exit(1);
  }

  // 根据提供商检查对应的API Key
  let apiKey: string | undefined;

  if (provider === 'claude') {
    apiKey = process.env.ANTHROPIC_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.error('❌ 错误: 未找到 ANTHROPIC_API_KEY 或 API_KEY 环境变量');
      console.error('请在 .env 文件中设置您的 Claude API Key\n');
      process.exit(1);
    }
  } else if (provider === 'deepseek') {
    apiKey = process.env.DEEPSEEK_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      console.error('❌ 错误: 未找到 DEEPSEEK_API_KEY 或 API_KEY 环境变量');
      console.error('请在 .env 文件中设置您的 DeepSeek API Key\n');
      process.exit(1);
    }
  }

  if (!apiKey) {
    console.error('❌ 错误: 未找到有效的 API Key');
    process.exit(1);
  }

  try {
    // 获取提供商信息
    const providerInfo = ProviderFactory.getProviderInfo()[provider];

    console.log(`🤖 使用模型提供商: ${providerInfo.name}`);
    console.log(`📝 ${providerInfo.description}\n`);

    // 创建并初始化Agent
    const agent = new NovelAgent({
      provider,
      apiKey,
      model: process.env.MODEL_NAME,
      maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : undefined,
      temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : undefined,
      baseURL: process.env.MODEL_BASE_URL,
    });

    console.log('✨ Novel Agent 已就绪！');
    console.log('我是您的小说创作助手，可以帮助您：');
    console.log('  📝 构思小说创意');
    console.log('  📋 规划章节大纲');
    console.log('  👤 设计角色档案');
    console.log('  🌍 构建世界观设定');
    console.log('  ✍️  撰写小说内容\n');

    // 启动交互式会话
    await agent.startInteractiveSession();
  } catch (error) {
    console.error('❌ Agent启动失败:', error);
    process.exit(1);
  }
}

// 优雅退出处理
process.on('SIGINT', () => {
  console.log('\n\n👋 感谢使用 Novel Agent，祝创作愉快！');
  process.exit(0);
});

// 启动应用
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
