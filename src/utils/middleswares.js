var jwtorig = require('jsonwebtoken');
var path = require('path');
var root_path = path.dirname(require.main.filename);
var models = require(root_path + '/models');
var _ = require('lodash');
const cfg = require("../../config/default");
var request = require('request');
var Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
	getUserInfo: function(req, res, next){
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token =req.headers.authorization.split(' ')[1];
            decoded = jwtorig.verify(token, cfg.auth.jwt.accessTokenSecret);
            req.user_id = decoded.id;
            models.User.findOne({
                where:{
                    id : req.user_id
                }
            }).then(function(User){
                req.User = User;
                next();
             });
       
        }else{
            req.User = null;
            req.sendGuardianEmail = false; 
            //req.User_Guardian = User_Guardian;
            req.User_Guardian = null;
            next();
        }
      },
}
    