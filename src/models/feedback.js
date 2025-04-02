"use strict";

module.exports = function(sequelize, DataTypes) {
  	var _ = require('lodash');
  	var Feedback = sequelize.define("Feedback", {
    	website_satisfy: DataTypes.STRING(20),
	    website_recommend: DataTypes.STRING(20),
    	staff_satisfy: DataTypes.STRING(20),
    	experience_problem : DataTypes.STRING(20),
    	problem: DataTypes.TEXT,
    	suggestion: DataTypes.TEXT,
		source : DataTypes.STRING(50),
 	},{
		sequelize,
		tableName: 'Feedback',
		timestamps: true,
		createdAt: "created_at", // alias createdAt as created_at
		updatedAt: "updated_at", 
		indexes: [
			{
				name: "PRIMARY",
				unique: true,
				using: "BTREE",
				fields: [
					{ name: "id" },
				]
			},
		]
	});

	Feedback.getAllData  = function(limit, offset) {
		var limitOffset = '';
		if (limit != null && offset != null) {
			limitOffset = ' LIMIT ' + limit + ' OFFSET ' + offset;
		}
		var query = "SELECT DATE_FORMAT(fdb.created_at, '%d/%m/%Y') as feedback_create, usr.email, usr.name, usr.surname, ";
		query += "fdb.website_satisfy, fdb.website_recommend, fdb.staff_satisfy, fdb.experience_problem, fdb.problem, ";
		query += "fdb.suggestion from Feedback as fdb ";
		query += "Left Join User as usr on usr.id = fdb.user_id ";
		query += "where fdb.source = 'hsncverification' ORDER BY fdb.created_at DESC ";
		query += limitOffset;
		return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
	};

	Feedback.getimporvementFeedback  = function(date) {
		var query = "SELECT usr.email, usr.name, usr.surname FROM Feedback AS fdb ";
		query += " JOIN User AS usr ON usr.id = fdb.user_id "
		query += " WHERE (website_satisfy = 'can_improve' OR staff_satisfy = 'can_improve' OR website_satisfy = 'Unsatisfy' OR staff_satisfy = 'Unsatisfy') AND ";
		query += " fdb.created_at like '%" + date + "%'";
		
		return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
	};

    Feedback.associate = (models) => {
        Feedback.belongsTo(models.User, {foreignKey: 'user_id'});
    };
  //Feedback.belongsTo(sequelize.models.User, {foreignKey: 'user_id'});
  
  return Feedback;
};
