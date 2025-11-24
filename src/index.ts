import 'dotenv/config';
import { NovelAgent } from './agent.js';

/**
 * Novel Agent 主入口
 * 一个帮助作家构思和撰写小说的AI助手
 */
async function main() {
  console.log('🎭 Novel Agent 启动中...\n');

  // 检查API Key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ 错误: 未找到 ANTHROPIC_API_KEY 环境变量');
    console.error('请在 .env 文件中设置您的 Claude API Key\n');
    process.exit(1);
  }

  try {
    // 创建并初始化Agent
    const agent = new NovelAgent({
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-sonnet-4-5-20250929',
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