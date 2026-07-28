declare module 'better-sqlite3' {
  interface Statement {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): { lastInsertRowid: number; changes: number };
  }

  interface Database {
    pragma(statement: string): void;
    exec(statement: string): void;
    prepare(statement: string): Statement;
  }

  export default class DatabaseConstructor {
    constructor(filename: string, options?: Record<string, unknown>);
    pragma(statement: string): void;
    exec(statement: string): void;
    prepare(statement: string): Statement;
  }
}
