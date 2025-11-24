import { promises as fs } from 'fs';
import path from 'path';

/**
 * 地点信息接口
 */
export interface Location {
  id: string;
  name: string;
  type?: string; // e.g., "城市", "村庄", "建筑物"
  description?: string;
  geography?: string;
  climate?: string;
  culture?: string;
  history?: string;
  notableFeatures?: string[];
  inhabitants?: string[];
  parentLocation?: string; // 父级地点ID
}

/**
 * 设定元素接口
 */
export interface WorldElement {
  id: string;
  category: 'magic' | 'technology' | 'culture' | 'history' | 'creature' | 'other';
  name: string;
  description?: string;
  rules?: string[];
  examples?: string[];
  relatedElements?: string[];
}

/**
 * 世界观接口
 */
export interface Worldbuilding {
  title: string;
  type?: string; // e.g., "现实主义", "奇幻", "科幻"
  overview?: string;
  locations: Location[];
  elements: WorldElement[];
  timeline?: TimelineEvent[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 时间线事件接口
 */
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  significance?: string;
}

/**
 * 世界观构建工具类
 */
export class WorldbuildingManager {
  private projectPath: string;
  private worldFile: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.worldFile = path.join(projectPath, 'worldbuilding.json');
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 初始化世界观
   */
  async initializeWorld(title: string, type?: string): Promise<Worldbuilding> {
    const world: Worldbuilding = {
      title,
      type,
      locations: [],
      elements: [],
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveWorld(world);
    return world;
  }

  /**
   * 读取世界观
   */
  async getWorld(): Promise<Worldbuilding | null> {
    try {
      const content = await fs.readFile(this.worldFile, 'utf-8');
      return JSON.parse(content) as Worldbuilding;
    } catch (error) {
      return null;
    }
  }

  /**
   * 保存世界观
   */
  async saveWorld(world: Worldbuilding): Promise<void> {
    world.updatedAt = new Date().toISOString();
    await fs.writeFile(this.worldFile, JSON.stringify(world, null, 2), 'utf-8');
  }

  /**
   * 添加地点
   */
  async addLocation(locationData: Omit<Location, 'id'>): Promise<Location> {
    const world = await this.getWorld();
    if (!world) {
      throw new Error('World not found. Please initialize world first.');
    }

    const location: Location = {
      id: this.generateId(),
      ...locationData,
    };

    world.locations.push(location);
    await this.saveWorld(world);

    return location;
  }

  /**
   * 更新地点
   */
  async updateLocation(locationId: string, updates: Partial<Location>): Promise<Location | null> {
    const world = await this.getWorld();
    if (!world) {
      return null;
    }

    const locationIndex = world.locations.findIndex(loc => loc.id === locationId);
    if (locationIndex === -1) {
      return null;
    }

    world.locations[locationIndex] = {
      ...world.locations[locationIndex],
      ...updates,
      id: locationId,
    };

    await this.saveWorld(world);
    return world.locations[locationIndex];
  }

  /**
   * 删除地点
   */
  async deleteLocation(locationId: string): Promise<boolean> {
    const world = await this.getWorld();
    if (!world) {
      return false;
    }

    const initialLength = world.locations.length;
    world.locations = world.locations.filter(loc => loc.id !== locationId);

    if (world.locations.length === initialLength) {
      return false;
    }

    await this.saveWorld(world);
    return true;
  }

  /**
   * 添加世界元素
   */
  async addElement(elementData: Omit<WorldElement, 'id'>): Promise<WorldElement> {
    const world = await this.getWorld();
    if (!world) {
      throw new Error('World not found. Please initialize world first.');
    }

    const element: WorldElement = {
      id: this.generateId(),
      ...elementData,
    };

    world.elements.push(element);
    await this.saveWorld(world);

    return element;
  }

  /**
   * 更新世界元素
   */
  async updateElement(elementId: string, updates: Partial<WorldElement>): Promise<WorldElement | null> {
    const world = await this.getWorld();
    if (!world) {
      return null;
    }

    const elementIndex = world.elements.findIndex(el => el.id === elementId);
    if (elementIndex === -1) {
      return null;
    }

    world.elements[elementIndex] = {
      ...world.elements[elementIndex],
      ...updates,
      id: elementId,
    };

    await this.saveWorld(world);
    return world.elements[elementIndex];
  }

  /**
   * 添加时间线事件
   */
  async addTimelineEvent(eventData: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const world = await this.getWorld();
    if (!world) {
      throw new Error('World not found. Please initialize world first.');
    }

    const event: TimelineEvent = {
      id: this.generateId(),
      ...eventData,
    };

    if (!world.timeline) {
      world.timeline = [];
    }
    world.timeline.push(event);

    // 按日期排序时间线
    world.timeline.sort((a, b) => a.date.localeCompare(b.date));

    await this.saveWorld(world);
    return event;
  }

  /**
   * 列出所有地点
   */
  async listLocations(): Promise<Location[]> {
    const world = await this.getWorld();
    return world?.locations || [];
  }

  /**
   * 按类别列出世界元素
   */
  async listElementsByCategory(category: WorldElement['category']): Promise<WorldElement[]> {
    const world = await this.getWorld();
    if (!world) {
      return [];
    }

    return world.elements.filter(el => el.category === category);
  }

  /**
   * 获取时间线
   */
  async getTimeline(): Promise<TimelineEvent[]> {
    const world = await this.getWorld();
    return world?.timeline || [];
  }

  /**
   * 搜索地点
   */
  async searchLocations(query: string): Promise<Location[]> {
    const world = await this.getWorld();
    if (!world) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return world.locations.filter(loc =>
      loc.name.toLowerCase().includes(lowerQuery) ||
      loc.description?.toLowerCase().includes(lowerQuery) ||
      loc.type?.toLowerCase().includes(lowerQuery)
    );
  }
}