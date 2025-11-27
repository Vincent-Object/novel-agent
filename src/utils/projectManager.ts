import { promises as fs } from 'fs';
import path from 'path';
import { CharacterManager } from '../tools/character.js';
import { OutlineManager } from '../tools/outline.js';
import { WorldbuildingManager } from '../tools/worldbuilding.js';
import { FileHelper } from './fileHelper.js';

/**
 * 项目元数据接口
 */
export interface ProjectMetadata {
  name: string;
  genre?: string;
  targetAudience?: string;
  targetWordCount?: number;
  status: 'planning' | 'drafting' | 'revising' | 'completed';
  createdAt: string;
  updatedAt: string;
  author?: string;
  description?: string;
}

/**
 * 项目管理器
 * 负责创建、管理和组织小说项目
 */
export class ProjectManager {
  private basePath: string;

  constructor(basePath: string = './novels') {
    this.basePath = basePath;
  }

  /**
   * 获取项目路径
   */
  private getProjectPath(projectName: string): string {
    return path.join(this.basePath, projectName);
  }

  /**
   * 获取项目元数据文件路径
   */
  private getMetadataPath(projectName: string): string {
    return path.join(this.getProjectPath(projectName), 'project.json');
  }

  /**
   * 创建新项目
   */
  async createProject(
    projectName: string,
    options?: {
      genre?: string;
      targetAudience?: string;
      targetWordCount?: number;
      author?: string;
      description?: string;
    }
  ): Promise<ProjectMetadata> {
    const projectPath = this.getProjectPath(projectName);

    // 检查项目是否已存在
    if (await FileHelper.fileExists(projectPath)) {
      throw new Error(`Project "${projectName}" already exists`);
    }

    // 创建项目目录结构
    await FileHelper.ensureDir(projectPath);
    await FileHelper.ensureDir(path.join(projectPath, 'characters'));
    await FileHelper.ensureDir(path.join(projectPath, 'chapters'));
    await FileHelper.ensureDir(path.join(projectPath, 'research'));
    await FileHelper.ensureDir(path.join(projectPath, 'drafts'));

    // 创建项目元数据
    const metadata: ProjectMetadata = {
      name: projectName,
      genre: options?.genre,
      targetAudience: options?.targetAudience,
      targetWordCount: options?.targetWordCount,
      status: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: options?.author,
      description: options?.description,
    };

    await FileHelper.writeJSON(this.getMetadataPath(projectName), metadata);

    // 初始化大纲
    const outlineManager = new OutlineManager(projectPath);
    await outlineManager.initializeOutline(projectName, options?.genre);

    // 初始化世界观
    const worldManager = new WorldbuildingManager(projectPath);
    await worldManager.initializeWorld(projectName);

    // 创建README
    await this.createProjectReadme(projectPath, metadata);

    return metadata;
  }

  /**
   * 创建项目README
   */
  private async createProjectReadme(projectPath: string, metadata: ProjectMetadata): Promise<void> {
    const readmeContent = `# ${metadata.name}

## 项目信息

- **类型**: ${metadata.genre || '未指定'}
- **目标读者**: ${metadata.targetAudience || '未指定'}
- **目标字数**: ${metadata.targetWordCount ? metadata.targetWordCount.toLocaleString() : '未指定'}
- **状态**: ${this.getStatusLabel(metadata.status)}
- **创建时间**: ${new Date(metadata.createdAt).toLocaleString('zh-CN')}

${metadata.description ? `## 简介\n\n${metadata.description}\n` : ''}

## 项目结构

- \`characters/\` - 角色档案
- \`outline.json\` - 故事大纲
- \`worldbuilding.json\` - 世界观设定
- \`chapters/\` - 章节内容
- \`research/\` - 研究资料
- \`drafts/\` - 草稿和备份

## 快速开始

使用 Novel Agent 打开此项目：
\`\`\`bash
npm run dev
\`\`\`

然后使用以下命令：
- \`/add-character\` - 添加角色
- \`/create-outline\` - 编辑大纲
- \`/write-scene\` - 撰写场景
- \`/worldbuild\` - 构建世界观
`;

    await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent, 'utf-8');
  }

  /**
   * 获取状态标签
   */
  private getStatusLabel(status: ProjectMetadata['status']): string {
    const labels = {
      planning: '规划中',
      drafting: '撰写中',
      revising: '修订中',
      completed: '已完成',
    };
    return labels[status];
  }

  /**
   * 读取项目元数据
   */
  async getProjectMetadata(projectName: string): Promise<ProjectMetadata | null> {
    return FileHelper.readJSON<ProjectMetadata>(this.getMetadataPath(projectName));
  }

  /**
   * 更新项目元数据
   */
  async updateProjectMetadata(
    projectName: string,
    updates: Partial<ProjectMetadata>
  ): Promise<ProjectMetadata | null> {
    const metadata = await this.getProjectMetadata(projectName);
    if (!metadata) {
      return null;
    }

    const updatedMetadata: ProjectMetadata = {
      ...metadata,
      ...updates,
      name: metadata.name, // 保持名称不变
      createdAt: metadata.createdAt, // 保持创建时间不变
      updatedAt: new Date().toISOString(),
    };

    await FileHelper.writeJSON(this.getMetadataPath(projectName), updatedMetadata);
    return updatedMetadata;
  }

  /**
   * 列出所有项目
   */
  async listProjects(): Promise<ProjectMetadata[]> {
    await FileHelper.ensureDir(this.basePath);
    const entries = await fs.readdir(this.basePath, { withFileTypes: true });
    const projectDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

    const projects: ProjectMetadata[] = [];
    for (const dir of projectDirs) {
      const metadata = await this.getProjectMetadata(dir);
      if (metadata) {
        projects.push(metadata);
      }
    }

    return projects.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * 删除项目
   */
  async deleteProject(projectName: string): Promise<boolean> {
    const projectPath = this.getProjectPath(projectName);
    if (!(await FileHelper.fileExists(projectPath))) {
      return false;
    }

    await FileHelper.removeDir(projectPath);
    return true;
  }

  /**
   * 获取项目工具管理器
   */
  getProjectTools(projectName: string): {
    characters: CharacterManager;
    outline: OutlineManager;
    worldbuilding: WorldbuildingManager;
  } {
    const projectPath = this.getProjectPath(projectName);

    return {
      characters: new CharacterManager(projectPath),
      outline: new OutlineManager(projectPath),
      worldbuilding: new WorldbuildingManager(projectPath),
    };
  }

  /**
   * 检查项目是否存在
   */
  async projectExists(projectName: string): Promise<boolean> {
    return FileHelper.fileExists(this.getProjectPath(projectName));
  }

  /**
   * 获取项目统计信息
   */
  async getProjectStats(projectName: string): Promise<{
    characterCount: number;
    chapterCount: number;
    locationCount: number;
    totalWordCount?: number;
  } | null> {
    if (!(await this.projectExists(projectName))) {
      return null;
    }

    const tools = this.getProjectTools(projectName);

    const characters = await tools.characters.listCharacters();
    const chapters = await tools.outline.listChapters();
    const locations = await tools.worldbuilding.listLocations();

    return {
      characterCount: characters.length,
      chapterCount: chapters.length,
      locationCount: locations.length,
    };
  }
}
