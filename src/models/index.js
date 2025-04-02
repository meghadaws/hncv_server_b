var fs        = require("fs");
var path      = require("path");
//const dbConfig = require("../../config/default");
const config = require('config');
const { HOST,
USER,
PASSWORD,
PORT,
DB,
dialect,
pool } = config.get('mysqldb');

const Sequelize = require("sequelize");
const sequelize = new Sequelize(DB, USER, PASSWORD, {
  host: HOST,
  port : PORT || 3306,
  dialect: dialect,
  operatorsAliases: 0,
  logging:false,
  pool: {
    max: pool.max,
    min: pool.min,
    acquire: pool.acquire,
    idle: pool.idle
  }
});

const db = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
   
    var model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes) //sequelize.import(path.join(__dirname, file));
    db[model.name] = model;

  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});
db.sequelize = sequelize;
//db.Sequelize = Sequelize;
module.exports = db;