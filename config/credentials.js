module.exports = {
  database: process.env.DB_HOST || 'mongodb://localhost:27017/blog',
  secret: process.env.PASSPORT_SECRET || 'blog'
}