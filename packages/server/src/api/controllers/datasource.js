const CouchDB = require("../../db")
const {
  generateDatasourceID,
  getDatasourceParams,
  getQueryParams,
} = require("../../db/utils")
const { integrations } = require("../../integrations")

exports.fetch = async function (ctx) {
  const database = new CouchDB(ctx.appId)
  ctx.body = (
    await database.allDocs(
      getDatasourceParams(null, {
        include_docs: true,
      })
    )
  ).rows.map(row => row.doc)
}

exports.save = async function (ctx) {
  const db = new CouchDB(ctx.appId)

  const datasource = {
    _id: generateDatasourceID(),
    type: "datasource",
    ...ctx.request.body,
  }

  const response = await db.post(datasource)
  datasource._rev = response.rev

  // Drain connection pools when configuration is changed
  const source = integrations[datasource.source]
  if (source && source.pool) {
    await source.pool.end()
  }

  ctx.status = 200
  ctx.message = "Datasource saved successfully."
  ctx.body = datasource
}

exports.destroy = async function (ctx) {
  const db = new CouchDB(ctx.appId)

  // Delete all queries for the datasource
  const rows = await db.allDocs(getQueryParams(ctx.params.datasourceId, null))
  await db.bulkDocs(rows.rows.map(row => ({ ...row.doc, _deleted: true })))

  // delete the datasource
  await db.remove(ctx.params.datasourceId, ctx.params.revId)

  ctx.message = `Datasource deleted.`
  ctx.status = 200
}

exports.find = async function (ctx) {
  const database = new CouchDB(ctx.appId)
  ctx.body = await database.get(ctx.params.datasourceId)
}
