const fs = require("fs")
const path = require("path")
const {pool} = require("../src/config/db")
const logger = require("../src/utils/logger")

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations")


async function ensureMigrationsTable(client) {

    await client.query(
         `CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    `)
    
}

async function run() {
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const applied = new Set(
      (await client.query('SELECT filename FROM schema_migrations')).rows.map((r) => r.filename)
    );
 
    const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
 
    for (const file of files) {
      if (applied.has(file)) {
        logger.info(`Skipping already-applied migration: ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      logger.info(`Applying migration: ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }
    logger.info('All migrations applied.');
  } finally {
    client.release();
    await pool.end();
  }
}
 
run().catch((err) => {
  logger.error('Migration run failed', { error: err.message });
  process.exit(1);
});
