import { Pool, PoolConfig } from 'pg'

// Database configuration
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'repohub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
}

// Create connection pool
const pool = new Pool(dbConfig)

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect()
    await client.query('SELECT NOW()')
    client.release()
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Helper function for queries
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    // Only log slow queries (> 100ms) or errors
    if (duration > 100) {
      console.log('⚠️ Slow query', { text: text.substring(0, 50), duration, rows: res.rowCount })
    }
    return res
  } catch (error) {
    console.error('❌ Query failed', { text, error })
    throw error
  }
}

// Get a single client for transactions
export async function getClient() {
  return await pool.connect()
}

// Close all connections
export async function closePool() {
  await pool.end()
  console.log('🔌 Database connection pool closed')
}

export { pool }
export default pool
