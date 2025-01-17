const { Pool } = require("pg")
const { FIELD_TYPES } = require("./Integration")

const SCHEMA = {
  docs: "https://node-postgres.com",
  friendlyName: "PostgreSQL",
  description:
    "PostgreSQL, also known as Postgres, is a free and open-source relational database management system emphasizing extensibility and SQL compliance.",
  datasource: {
    host: {
      type: FIELD_TYPES.STRING,
      default: "localhost",
      required: true,
    },
    port: {
      type: FIELD_TYPES.NUMBER,
      required: true,
      default: 5432,
    },
    database: {
      type: FIELD_TYPES.STRING,
      default: "postgres",
      required: true,
    },
    user: {
      type: FIELD_TYPES.STRING,
      default: "root",
      required: true,
    },
    password: {
      type: FIELD_TYPES.PASSWORD,
      default: "root",
      required: true,
    },
    ssl: {
      type: FIELD_TYPES.BOOLEAN,
      default: false,
      required: false,
    },
  },
  query: {
    create: {
      type: "sql",
    },
    read: {
      type: "sql",
    },
    update: {
      type: "sql",
    },
    delete: {
      type: "sql",
    },
  },
}

class PostgresIntegration {
  static pool

  constructor(config) {
    this.config = config
    if (this.config.ssl) {
      this.config.ssl = {
        rejectUnauthorized: true,
      }
    }

    if (!this.pool) {
      this.pool = new Pool(this.config)
    }

    this.client = this.pool
  }

  async query(sql) {
    try {
      return await this.client.query(sql)
    } catch (err) {
      throw new Error(err)
    }
  }

  async create({ sql }) {
    const response = await this.query(sql)
    return response.rows.length ? response.rows : [{ created: true }]
  }

  async read({ sql }) {
    const response = await this.query(sql)
    return response.rows
  }

  async update({ sql }) {
    const response = await this.query(sql)
    return response.rows.length ? response.rows : [{ updated: true }]
  }

  async delete({ sql }) {
    const response = await this.query(sql)
    return response.rows.length ? response.rows : [{ deleted: true }]
  }
}

module.exports = {
  schema: SCHEMA,
  integration: PostgresIntegration,
}
