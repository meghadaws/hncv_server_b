const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Program_List', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      primaryKey: true
    },
    college_code:{
        type: DataTypes.STRING(20)
    },
    college_name:{
        type: DataTypes.STRING(500)
    },
    college_address:{
        type: DataTypes.STRING(500)
    },
    course_code:{
        type: DataTypes.STRING(100)
    },
    programme_pattern:{
        type: DataTypes.STRING(250)
    },
    part_name:{
        type: DataTypes.STRING(100)
    },
    term_name:{
        type: DataTypes.STRING(100)
    },
    year:{
        type: DataTypes.STRING(20)
    },
    course_short_form:{
        type: DataTypes.STRING(255)
    },
    emailId:{
        type: DataTypes.STRING(100)
    },
    contactNo:{
        type: DataTypes.STRING(30)
    },
    contactPerson:{
        type: DataTypes.STRING(100)
    },
    alternateContactPerson:{
        type: DataTypes.STRING(100)
    },
    alternateContactNo:{
        type: DataTypes.STRING(30)
    },
    alternateEmailId:{
        type: DataTypes.STRING(100)
    },
    college_short_form:{
        type: DataTypes.STRING(500)
    },
    college_status:{
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue : 'active'
    },
    course_status:{
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue : 'active'
    },
    course_name:{
        type: DataTypes.STRING(500)
    },
    duration :{
        type: DataTypes.STRING(20)  
    }
  }, {
    sequelize,
    tableName: 'Program_List',
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
};
