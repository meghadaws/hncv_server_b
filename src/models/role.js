"use strict";

module.exports = function(sequelize, DataTypes) {
	var Role = sequelize.define("Role", {
		admindashboard: {
	      type: DataTypes.BOOLEAN,
	      allowNull: false,
	      defaultValue: false
	    },
	  
		studentmanagement: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },
        
        collegeManagement: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },

        adminTotal: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },
         
        adminPending: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },

        adminVerified: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },
        
        adminSigned: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },
         
        adminWesApp: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },

        adminEmailed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },
        
        adminpayment: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },
        
        adminReport: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
        },
		 
		studentfeedback :  {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},

		help :  {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
		collegeManagement :  {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
		rolemanagement :  {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false
		},
	}, {

		sequelize,
		tableName: 'Role',
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

	Role.checkSource = function( portal, user_id){
		var query='';
		query += " SELECT JSON_SEARCH(source, 'all', '"+portal+"') as location, JSON_LENGTH(source) as count from role where userid = "+user_id ;
		return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
	};
	
    Role.associate = (models) => {
        Role.belongsTo(models.User, {foreignKey: 'userid'});
    };
	

	return Role;
};