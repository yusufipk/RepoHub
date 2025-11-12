#!/usr/bin/env node

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10)
const DB_USER = process.env.DB_USER || 'postgres'
const DB_PASSWORD = process.env.DB_PASSWORD || ''
const DB_NAME = process.env.DB_NAME || 'repohub'

async function main() {
  // Connect to default 'postgres' database to create DB if missing
  const admin = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    database: 'postgres',
    user: DB_USER,
    password: DB_PASSWORD,
  })

  try {
    console.log(`🔍 Ensuring database "${DB_NAME}" exists on ${DB_HOST}:${DB_PORT} ...`)
    await admin.query(`CREATE DATABASE ${DB_NAME};`)
    console.log(`✅ Created database "${DB_NAME}"`)
  } catch (err) {
    // 42P04 = duplicate_database
    if (err && err.code === '42P04') {
      console.log(`ℹ️ Database "${DB_NAME}" already exists`)
    } else {
      console.error('❌ Failed to create database:', err)
      process.exitCode = 1
    }
  } finally {
    await admin.end().catch(() => {})
  }

  // Connect to the target DB and apply schema, then run migrations
  const db = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  })

  try {
    const schemaPath = path.join(__dirname, '..', 'src', 'lib', 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    console.log('🔧 Applying schema...')
    await db.query(schema)
    console.log('✅ Schema applied')
  } catch (err) {
    // 42P07 duplicate_table, 42710 duplicate_object, 23505 unique_violation (for seed inserts)
    const ignorable = new Set(['42P07', '42710', '23505'])
    if (err && ignorable.has(err.code)) {
      console.log('ℹ️ Schema objects already exist; skipping')
    } else {
      console.error('❌ Schema apply error:', err)
      process.exitCode = 1
      // continue to attempt migrations anyway
    }
  } 

  // Ensure schema_migrations table exists
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
  } catch (err) {
    console.error('❌ Failed to ensure schema_migrations table:', err)
    process.exitCode = 1
  }

  // Discover migration files
  try {
    const migrationsDir = path.join(__dirname, 'migrations')
    const migrationFiles = []

    if (fs.existsSync(migrationsDir)) {
      for (const f of fs.readdirSync(migrationsDir)) {
        if (f.endsWith('.sql')) {
          migrationFiles.push({ filename: f, fullpath: path.join(migrationsDir, f) })
        }
      }
    }

    // Back-compat: also pick up legacy root-level migrations named migrate-*.sql
    for (const f of fs.readdirSync(__dirname)) {
      if (f.startsWith('migrate-') && f.endsWith('.sql')) {
        migrationFiles.push({ filename: f, fullpath: path.join(__dirname, f) })
      }
    }

    // Sort by filename for deterministic order (e.g., 001_*, 002_* ...)
    migrationFiles.sort((a, b) => a.filename.localeCompare(b.filename))

    if (migrationFiles.length) {
      console.log(`🚀 Running migrations (${migrationFiles.length} found)...`)
    } else {
      console.log('ℹ️ No migrations found')
    }

    for (const m of migrationFiles) {
      try {
        const { rows } = await db.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [m.filename])
        if (rows.length) {
          console.log(`↪️  Skipping already applied migration: ${m.filename}`)
          continue
        }

        const sql = fs.readFileSync(m.fullpath, 'utf8')
        console.log(`➡️  Applying migration: ${m.filename}`)
        await db.query('BEGIN')
        await db.query(sql)
        await db.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [m.filename])
        await db.query('COMMIT')
        console.log(`✅ Migration applied: ${m.filename}`)
      } catch (err) {
        console.error(`❌ Migration failed: ${m.filename}`, err)
        try { await db.query('ROLLBACK') } catch {}
        process.exitCode = 1
        break
      }
    }
  } catch (err) {
    console.error('❌ Failed during migration discovery/execution:', err)
    process.exitCode = 1
  }

  // Done
  await db.end().catch(() => {})
}

main().catch((e) => {
  console.error('❌ init:db failed:', e)
  process.exit(1)
})

