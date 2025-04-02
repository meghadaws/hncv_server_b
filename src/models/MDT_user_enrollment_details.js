"use strict";

module.exports = function(sequelize, DataTypes) {
  var MDT_User_Enrollment_Detail = sequelize.define("MDT_User_Enrollment_Detail", {
    enrollment_no: DataTypes.INTEGER(30),
    application_date: DataTypes.DATEONLY,
    user_id : DataTypes.INTEGER(11),
    application_id : DataTypes.INTEGER(11),
  }, {
    sequelize,
    tableName: 'MDT_User_Enrollment_Detail',
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
  
  MDT_User_Enrollment_Detail.getAlldata = function() {
    var query = 'Select * from MDT_User_Enrollment_Detail';
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
  };

  MDT_User_Enrollment_Detail.getListLastData = function(year) {
    var query='';
    query +=" SELECT id , enrollment_no, created_at, application_date From MDT_User_Enrollment_Detail ";
    query +=" WHERE enrollment_no=(SELECT MAX(enrollment_no) FROM MDT_User_Enrollment_Detail) ";
    // query += " WHERE application_date like '%" + year +"%')";
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
  };
  
  return MDT_User_Enrollment_Detail;
};
