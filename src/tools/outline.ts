import { promises as fs } from 'fs';
import path from 'path';

/**
 * 章节信息接口
 */
export interface Chapter {
  id: string;
  number: number;
  title: string;
  summary?: string;
  scenes?: Scene[];
  wordCountTarget?: number;
  status: 'planned' | 'drafting' | 'completed';
  notes?: string;
}

/**
 * 场景信息接口
 */
export interface Scene {
  id: string;
  title: string;
  location?: string;
  characters?: string[];
  summary?: string;
  content?: string;
  timeOfDay?: string;
  mood?: string;
}

/**
 * 大纲信息接口
 */
export interface Outline {
  title: string;
  genre?: string;
  theme?: string;
  synopsis?: string;
  structure?: string; // e.g., "三幕式", "英雄之旅"
  chapters: Chapter[];
  totalWordCountTarget?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 大纲管理工具类
 */
export class OutlineManager {
  private projectPath: string;
  private outlineFile: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.outlineFile = path.join(projectPath, 'outline.json');
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 初始化大纲
   */
  async initializeOutline(title: string, genre?: string): Promise<Outline> {
    const outline: Outline = {
      title,
      genre,
      chapters: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveOutline(outline);
    return outline;
  }

  /**
   * 读取大纲
   */
  async getOutline(): Promise<Outline | null> {
    try {
      const content = await fs.readFile(this.outlineFile, 'utf-8');
      return JSON.parse(content) as Outline;
    } catch (error) {
      return null;
    }
  }

  /**
   * 保存大纲
   */
  async saveOutline(outline: Outline): Promise<void> {
    outline.updatedAt = new Date().toISOString();
    await fs.writeFile(this.outlineFile, JSON.stringify(outline, null, 2), 'utf-8');
  }

  /**
   * 添加章节
   */
  async addChapter(chapterData: Omit<Chapter, 'id'>): Promise<Chapter> {
    const outline = await this.getOutline();
    if (!outline) {
      throw new Error('Outline not found. Please initialize outline first.');
    }

    const chapter: Chapter = {
      id: this.generateId(),
      ...chapterData,
    };

    outline.chapters.push(chapter);
    await this.saveOutline(outline);

    return chapter;
  }

  /**
   * 更新章节
   */
  async updateChapter(chapterId: string, updates: Partial<Chapter>): Promise<Chapter | null> {
    const outline = await this.getOutline();
    if (!outline) {
      return null;
    }

    const chapterIndex = outline.chapters.findIndex(ch => ch.id === chapterId);
    if (chapterIndex === -1) {
      return null;
    }

    outline.chapters[chapterIndex] = {
      ...outline.chapters[chapterIndex],
      ...updates,
      id: chapterId, // 保持ID不变
    };

    await this.saveOutline(outline);
    return outline.chapters[chapterIndex];
  }

  /**
   * 删除章节
   */
  async deleteChapter(chapterId: string): Promise<boolean> {
    const outline = await this.getOutline();
    if (!outline) {
      return false;
    }

    const initialLength = outline.chapters.length;
    outline.chapters = outline.chapters.filter(ch => ch.id !== chapterId);

    if (outline.chapters.length === initialLength) {
      return false; // 没有找到要删除的章节
    }

    // 重新编号章节
    outline.chapters.forEach((ch, idx) => {
      ch.number = idx + 1;
    });

    await this.saveOutline(outline);
    return true;
  }

  /**
   * 为章节添加场景
   */
  async addScene(chapterId: string, sceneData: Omit<Scene, 'id'>): Promise<Scene | null> {
    const outline = await this.getOutline();
    if (!outline) {
      return null;
    }

    const chapter = outline.chapters.find(ch => ch.id === chapterId);
    if (!chapter) {
      return null;
    }

    const scene: Scene = {
      id: this.generateId(),
      ...sceneData,
    };

    if (!chapter.scenes) {
      chapter.scenes = [];
    }
    chapter.scenes.push(scene);

    await this.saveOutline(outline);
    return scene;
  }

  /**
   * 获取章节列表
   */
  async listChapters(): Promise<Chapter[]> {
    const outline = await this.getOutline();
    return outline?.chapters || [];
  }

  /**
   * 获取特定章节
   */
  async getChapter(chapterId: string): Promise<Chapter | null> {
    const outline = await this.getOutline();
    if (!outline) {
      return null;
    }

    return outline.chapters.find(ch => ch.id === chapterId) || null;
  }

  /**
   * 更新大纲元信息
   */
  async updateOutlineMetadata(updates: Partial<Omit<Outline, 'chapters' | 'createdAt'>>): Promise<Outline | null> {
    const outline = await this.getOutline();
    if (!outline) {
      return null;
    }

    const updatedOutline = {
      ...outline,
      ...updates,
      chapters: outline.chapters, // 保持章节不变
      createdAt: outline.createdAt, // 保持创建时间不变
    };

    await this.saveOutline(updatedOutline);
    return updatedOutline;
  }
}
