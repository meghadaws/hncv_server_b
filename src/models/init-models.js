var DataTypes = require("sequelize").DataTypes;
var _documents = require("./verificationTypes");
var _users = require("./user");

function initModels(sequelize) {
  var VerificationTypes = _documents(sequelize, DataTypes);
  var User = _users(sequelize, DataTypes);

  return {
    VerificationTypes,
    User,
    };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
