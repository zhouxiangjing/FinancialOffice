import sqlite3 from 'sqlite3'
const sqlite = process.env.NODE_ENV === 'development' ? sqlite3.verbose() : sqlite3

const DB_FILE = 'sqlite.db'
const CREATE_ORDERS_TABLE = `
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY,
  order_no TEXT NOT NULL,
  member_id TEXT NOT NULL,
  member_type TEXT NOT NULL,
  money NUMERIC NOT NULL,
  category TEXT NOT NULL,
  status INTEGER NOT NULL,
  remark TEXT NOT NULL,
  created INTEGER NOT NULL,
  updated INTEGER NOT NULL
);
`
// 参考 https://blog.csdn.net/maidu_xbd/article/details/99977786
class SqliteUtils {
  db = null
  // 初始化数据库
  constructor () {
    this._init()
  }
  async _init () {
    await this._connect(DB_FILE)
    await this.run(CREATE_ORDERS_TABLE)
  }
  // 连接数据库
  _connect (path) {
    if (this.db) {
      return Promise.reject(new Error('SqliteUtils.connect: database already connect'))
    }
    return new Promise((resolve, reject) => {
      this.db = new sqlite.Database(path, (err) => {
        if (err === null) {
          resolve()
          console.log('sqlite connect succeed')
        } else {
          console.log('sqlite connect failed')
          console.log(err)
          reject(err)
        }
      })
    })
  }
  // 运行sql
  run (sql, params) {
    if (!this.db) {
      return Promise.reject(new Error('SqliteUtils.run: database is not open'))
    }
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        err === null ? resolve() : reject(err)
      })
    })
  }
  // 运行多条sql
  exec (sql) {
    if (!this.db) {
      return Promise.reject(new Error('SqliteUtils.exec: database is not open'))
    }
    return new Promise((resolve, reject) => {
      this.db.exec(sql, (err, data) => {
        err === null ? resolve(data) : reject(err)
      })
    })
  }
  // 查询一条数据
  get (sql, params) {
    if (!this.db) {
      return Promise.reject(new Error('SqliteUtils.get: database is not open'))
    }
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, data) => {
        err === null ? resolve(data) : reject(err)
      })
    })
  }
  // 查询所有数据
  all (sql, params) {
    if (!this.db) {
      return Promise.reject(new Error('SqliteUtils.all: database is not open'))
    }
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, data) => {
        err === null ? resolve(data) : reject(err)
      })
    })
  }
  // 关闭数据库
  close () {
    this.db.close()
  }

  // 单例
  static getInstance () {
    if (!SqliteUtils.instance) {
      SqliteUtils.instance = new SqliteUtils()
    }
    return SqliteUtils.instance
  }
}

export default SqliteUtils
