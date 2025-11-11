#!/usr/bin/env node

const { Pool } = require('pg')

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
}

main().catch((e) => {
  console.error('❌ init:db failed:', e)
  process.exit(1)
})
