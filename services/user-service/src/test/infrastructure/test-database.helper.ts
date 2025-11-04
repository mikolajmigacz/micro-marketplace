export class TestDatabaseHelper {
  private static store: Map<string, Map<string, Record<string, unknown>>> = new Map();

  static reset(): void {
    this.store.clear();
  }

  static createTable(tableName: string): void {
    if (!this.store.has(tableName)) {
      this.store.set(tableName, new Map());
    }
  }

  static getTable(tableName: string): Map<string, Record<string, unknown>> {
    if (!this.store.has(tableName)) {
      this.createTable(tableName);
    }
    return this.store.get(tableName)!;
  }

  static async saveItem(tableName: string, item: Record<string, unknown>): Promise<void> {
    const table = this.getTable(tableName);
    const id = item.id as string;
    table.set(id, item);
  }

  static async getItem(tableName: string, id: string): Promise<Record<string, unknown> | null> {
    const table = this.getTable(tableName);
    return table.get(id) || null;
  }

  static async queryByEmail(
    tableName: string,
    email: string
  ): Promise<Record<string, unknown> | null> {
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

  static async getAllItems(tableName: string): Promise<Record<string, unknown>[]> {
    const table = this.getTable(tableName);
    return Array.from(table.values());
  }
}
