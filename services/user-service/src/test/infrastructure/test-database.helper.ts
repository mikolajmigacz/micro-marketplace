export class TestDatabaseHelper {
  private static store: Map<string, Map<string, any>> = new Map();

  static reset(): void {
    this.store.clear();
  }

  static createTable(tableName: string): void {
    if (!this.store.has(tableName)) {
      this.store.set(tableName, new Map());
    }
  }

  static getTable(tableName: string): Map<string, any> {
    if (!this.store.has(tableName)) {
      this.createTable(tableName);
    }
    return this.store.get(tableName)!;
  }

  static async saveItem(tableName: string, item: any): Promise<void> {
    const table = this.getTable(tableName);
    table.set(item.id, item);
  }

  static async getItem(tableName: string, id: string): Promise<any | null> {
    const table = this.getTable(tableName);
    return table.get(id) || null;
  }

  static async queryByEmail(tableName: string, email: string): Promise<any | null> {
    const table = this.getTable(tableName);
    for (const item of table.values()) {
      if (item.email === email) {
        return item;
      }
    }
    return null;
  }

  static async clearTable(tableName: string): Promise<void> {
    const table = this.getTable(tableName);
    table.clear();
  }

  static async getAllItems(tableName: string): Promise<any[]> {
    const table = this.getTable(tableName);
    return Array.from(table.values());
  }
}
