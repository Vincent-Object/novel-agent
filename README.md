# Novel Agent 🎭✍️

一个基于 Claude Agent SDK 构建的智能小说创作助手，帮助作家更好地构思、规划和撰写小说。

## ✨ 核心功能

- **📝 创意激发**: 协助生成小说创意、情节转折和人物冲突
- **📋 大纲规划**: 创建详细的章节结构和故事时间线
- **👤 角色塑造**: 深入挖掘角色背景、性格和成长弧线
- **🌍 世界观构建**: 设计一致且引人入胜的虚构世界设定
- **✍️ 内容撰写**: 提供写作建议和文本润色

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- Claude API Key（从 [Claude Console](https://console.anthropic.com/) 获取）

### 安装步骤

1. **克隆或下载项目**
```bash
cd novel-agent
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 API Key：
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

4. **启动 Agent**
```bash
npm run dev
```

## 📁 项目结构

```
novel-agent/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── agent.ts              # Agent核心逻辑
│   ├── tools/                # 工具模块
│   │   ├── character.ts      # 角色管理
│   │   ├── outline.ts        # 大纲管理
│   │   └── worldbuilding.ts  # 世界观构建
│   └── utils/                # 工具函数
├── .claude/                  # Claude SDK 配置
│   ├── agents/               # 子代理定义
│   ├── skills/               # 技能定义
│   ├── commands/             # 自定义命令
│   └── settings.json         # Agent配置
├── novels/                   # 小说项目存储目录
└── CLAUDE.md                 # 项目级别上下文

## 💬 使用示例

启动 Agent 后，你可以进行以下对话：

### 创建新项目
```
你> 我想写一部科幻小说，关于人工智能觉醒的故事
```

### 创建角色
```
你> 帮我创建一个主角，他是一位AI研究员
```

### 规划大纲
```
你> 我想创建一个三幕式结构的大纲
```

### 撰写场景
```
你> 帮我写第一章的开头场景
```

## 🛠️ 可用命令

在交互式会话中，你可以使用以下命令：

- `/quit` 或 `/exit` - 退出程序
- `/clear` - 清空对话历史
- `/history` - 查看对话历史

未来将支持更多命令：
- `/new-project <名称>` - 创建新的小说项目
- `/add-character <角色名>` - 添加新角色
- `/create-outline` - 创建章节大纲
- `/write-scene` - 撰写场景
- `/worldbuild` - 构建世界观设定

## 📚 技术栈

- **Claude Agent SDK** - AI Agent 框架
- **TypeScript** - 类型安全的开发
- **Node.js** - 运行时环境

## 🎯 开发路线图

- [x] 基础 Agent 架构
- [x] 角色管理工具
- [x] 大纲规划工具
- [x] 世界观构建工具
- [ ] 交互式命令系统
- [ ] 项目管理功能
- [ ] 多语言支持
- [ ] Web UI 界面
- [ ] 导出功能（PDF、DOCX等）

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

本项目基于 [Claude Agent SDK](https://docs.anthropic.com/en/api/agent-sdk) 构建。

---

**祝你创作愉快！** ✨📖
