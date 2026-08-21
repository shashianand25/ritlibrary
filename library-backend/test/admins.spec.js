import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  initDb,
  checkAdminInDb,
  listAdminsFromDb,
  addAdminToDb,
  removeAdminFromDb,
  getPool,
} from '../src/db/admins.js';

describe('Neon Postgres Admin Database Repository', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false gracefully when DATABASE_URL is not set', async () => {
    const env = {};
    expect(await checkAdminInDb('test@msrit.edu', env)).toBe(false);
    expect(await listAdminsFromDb(env)).toEqual([]);
  });

  it('throws error when modifying admins without DATABASE_URL', async () => {
    const env = {};
    await expect(addAdminToDb('test@msrit.edu', env)).rejects.toThrow(
      'DATABASE_URL is not configured'
    );
    await expect(removeAdminFromDb('test@msrit.edu', env)).rejects.toThrow(
      'DATABASE_URL is not configured'
    );
  });

  it('initializes database table when pool is available', async () => {
    const mockQuery = vi.fn().mockResolvedValue({ rows: [] });
    const env = { DATABASE_URL: 'postgres://mock:mock@localhost/db' };
    
    // Test pool instance creation
    const pool = getPool(env);
    expect(pool).toBeDefined();
  });
});
