import { Transaction } from "./App";

export interface Store {
  get(id: string): any;
  save(id: string, document: object): Promise<any>;
}

export class PostgresStore implements Store {

  constructor(private transaction: Transaction) {
  }

  public async save(id: string, document: object): Promise<void> {
    await this.transaction.query('INSERT INTO store values($1, $2) returning *', [id, document]);
  }

  public async get(id: string): Promise<any> {
    const query = await this.transaction.query('SELECT * FROM store t WHERE t.id = $1', [id]);
    return query.rows[0];
  }

  public async migrate() {
    const createTable = await this.transaction.query('CREATE TABLE IF NOT EXISTS store (id varchar(64) primary key, document jsonb)');
  }
}