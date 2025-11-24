import { promises as fs } from 'fs';
import path from 'path';

/**
 * 角色信息接口
 */
export interface Character {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  background?: string;
  personality?: string;
  appearance?: string;
  motivation?: string;
  conflict?: string;
  relationships?: Record<string, string>;
  characterArc?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 角色管理工具类
 */
export class CharacterManager {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * 确保角色目录存在
   */
  private async ensureCharacterDir(): Promise<string> {
    const charDir = path.join(this.projectPath, 'characters');
    await fs.mkdir(charDir, { recursive: true });
    return charDir;
  }

  /**
   * 生成角色ID
   */
  private generateId(name: string): string {
    const timestamp = Date.now();
    const sanitized = name.toLowerCase().replace(/\s+/g, '-');
    return `${sanitized}-${timestamp}`;
  }

  /**
   * 创建新角色
   */
  async createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    const charDir = await this.ensureCharacterDir();

    const character: Character = {
      id: this.generateId(characterData.name),
      ...characterData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const filePath = path.join(charDir, `${character.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(character, null, 2), 'utf-8');

    return character;
  }

  /**
   * 读取角色信息
   */
  async getCharacter(characterId: string): Promise<Character | null> {
    const charDir = await this.ensureCharacterDir();
    const filePath = path.join(charDir, `${characterId}.json`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as Character;
    } catch (error) {
      return null;
    }
  }

  /**
   * 更新角色信息
   */
  async updateCharacter(characterId: string, updates: Partial<Character>): Promise<Character | null> {
    const character = await this.getCharacter(characterId);
    if (!character) {
      return null;
    }

    const updatedCharacter: Character = {
      ...character,
      ...updates,
      id: character.id, // 保持ID不变
      createdAt: character.createdAt, // 保持创建时间不变
      updatedAt: new Date().toISOString(),
    };

    const charDir = await this.ensureCharacterDir();
    const filePath = path.join(charDir, `${characterId}.json`);
    await fs.writeFile(filePath, JSON.stringify(updatedCharacter, null, 2), 'utf-8');

    return updatedCharacter;
  }

  /**
   * 列出所有角色
   */
  async listCharacters(): Promise<Character[]> {
    const charDir = await this.ensureCharacterDir();

    try {
      const files = await fs.readdir(charDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      const characters = await Promise.all(
        jsonFiles.map(async (file) => {
          const content = await fs.readFile(path.join(charDir, file), 'utf-8');
          return JSON.parse(content) as Character;
        })
      );

      return characters.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      return [];
    }
  }

  /**
   * 删除角色
   */
  async deleteCharacter(characterId: string): Promise<boolean> {
    const charDir = await this.ensureCharacterDir();
    const filePath = path.join(charDir, `${characterId}.json`);

    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 搜索角色
   */
  async searchCharacters(query: string): Promise<Character[]> {
    const allCharacters = await this.listCharacters();
    const lowerQuery = query.toLowerCase();

    return allCharacters.filter(char =>
      char.name.toLowerCase().includes(lowerQuery) ||
      char.background?.toLowerCase().includes(lowerQuery) ||
      char.personality?.toLowerCase().includes(lowerQuery)
    );
  }
}