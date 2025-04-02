const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    var Application =  sequelize.define('Application', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        tracker: {
            type: DataTypes.ENUM('preapply','apply','verification','verified','done','signed','print'),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('new','accept', 'reject','repeat','requested','changed'),
            allowNull: false
        },
        total_amount: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 0.00
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        user_id_byAgent :{
            type: DataTypes.INTEGER,
        },
        approved_by:{
            type: DataTypes.STRING(100),
        },
        verified_by: {
          type: DataTypes.STRING(100),
        }, 
        // sent_by:{
        //   type: DataTypes.STRING(100),
        // },
        verified_date:{
          type: DataTypes.DATE,
        },
        sent_date:{
          type: DataTypes.DATE,
        },

        print_date:{
          type: DataTypes.DATE,
        },
        courier_name :{
          type: DataTypes.STRING(100),
        },
        tracking_id :{
          type: DataTypes.STRING(100),
        },
        app_status :{
          type: DataTypes.ENUM('new','repeat'),
          defaultValue : 'new'
        },
        print_by :{
          type: DataTypes.STRING(100),
        },
        source_from :{
          type: DataTypes.STRING(100),
        },
        pick_up_date :{
          type: DataTypes.STRING(100),
        },
        deliveryType :{
          type: DataTypes.STRING(100),
        },
        deliveryTime :{
          type: DataTypes.STRING(100),
        },
        notes: {
            type: DataTypes.TEXT,
        },
        regenerate_reason:{
          type: DataTypes.TEXT
        }
    }, {

        sequelize,
        tableName: 'Application',
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
    Application.getPendingUserApplications = function(filters,limit,offset,type) {
        var where_student_name = '',
        where_application_id = '',
        where_application_email = '',
        where_application_date = '';
        var limitOffset = '';
        if (filters.length > 0) {
        filters.forEach(function(filter) {
            if (filter.name == "name") {
                where_student_name = filter.value;
            } else if (filter.name == "surname") {
                where_student_surname = " AND u.surname LIKE '%" + filter.value + "%' ";
            } else if (filter.name == "application_id") {
                where_application_id = " AND a.id = " + filter.value + " ";
            } else if (filter.name == "email") {
                where_application_email = " AND u.email like '%" + filter.value  + "%' ";
            } else if(filter.name == 'application_year'){
                where_application_date = filter.value;
            }
        });
        }
        if (limit != null && offset != null) {
        limitOffset = ' LIMIT ' + limit + ' OFFSET ' + offset;
        }
        var query = "SELECT a.id,u.email,CONCAT(u.name,' ',u.surname) as name,a.tracker,a.status,"
        query += " a.user_id,a.created_at, CONCAT(u1.name,' ',u1.surname) as a_name, u.marksheetName as aname, v.marksheet, v.degreeCertificate";
        query += " FROM Application as a JOIN User as u on u.id = a.user_id ";
        query += " LEFT JOIN User as u1 on u1.agent_id = u.id "
        query += " LEFT JOIN VerificationTypes AS v ON v.app_id = a.id "
        query += " WHERE a.source_from='hsncverification' and a.tracker = 'apply' and a.status ='" + type +"'";
        query += where_application_id;
        query += where_application_email;
        query += where_student_name;
        query += where_application_date;
        query += " ORDER BY a.created_at desc ";
        query += limitOffset;
        return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});    
    }

    Application.getVerifiedUserApplications = function(filters,limit,offset) {
        var where_student_name = '',
        where_application_id = '',
        where_application_email = '',
        where_application_date = '';
      var limitOffset = '';
      if (filters.length > 0) {
        filters.forEach(function(filter) {
            if (filter.name == "name") {
              where_student_name = filter.value;
            } else if (filter.name == "surname") {
              where_student_surname = " AND user.surname LIKE '%" + filter.value + "%' ";
            } else if (filter.name == "application_id") {
              where_application_id = " AND a.id = " + filter.value + " ";
            } else if (filter.name == "email") {
              where_application_email = " AND user.email like '%" + filter.value  + "%' ";
            } else if(filter.name == 'application_year'){
              where_application_date = filter.value;
            }
        });
      }
      if (limit != null && offset != null) {
        limitOffset = ' LIMIT ' + limit + ' OFFSET ' + offset;
      }
      var query = "SELECT a.id,u.email,CONCAT(u.name,' ',u.surname) as name,a.tracker,a.status,"
      query += " a.user_id,a.created_at, u1.marksheetName as agent_name";
      query += " FROM Application as a JOIN User as u on u.id = a.user_id ";
      query += " LEFT JOIN User as u1 on u1.id = u.agent_id ";
      query += " WHERE a.source_from='hsncverification' and a.tracker = 'verified' and a.status = 'accept'";
      query += where_application_id;
      query += where_application_email;
      query += where_student_name;
      query += where_application_date;
      query += " ORDER BY a.created_at desc ";
      query += limitOffset;
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});    
    };

    Application.getSignedUserApplications = function(filters,limit,offset,type) {
        var where_student_name = '',
        where_application_id = '',
        where_application_email = '',
        where_application_date = '';
      var limitOffset = '';
      if (filters.length > 0) {
        filters.forEach(function(filter) {
            if (filter.name == "name") {
              where_student_name = filter.value;
            } else if (filter.name == "surname") {
              where_student_surname = " AND u.surname LIKE '%" + filter.value + "%' ";
            } else if (filter.name == "application_id") {
              where_application_id = " AND a.id = " + filter.value + " ";
            } else if (filter.name == "email") {
              where_application_email = " AND u.email like '%" + filter.value  + "%' ";
            } else if(filter.name == 'application_year'){
              where_application_date = filter.value;
            }
        });
      }
      if (limit != null && offset != null) {
        limitOffset = ' LIMIT ' + limit + ' OFFSET ' + offset;
      }
      
      var query = "SELECT a.id,u.email,CONCAT(u.name,' ',u.surname) as name,a.tracker,a.status,"
      query += " a.user_id,a.verified_date,a.verified_by,a.created_at, CONCAT(u1.name,' ',u1.surname) as a_name, u.marksheetName as aname,v.marksheet, v.degreeCertificate";
      query += " FROM Application as a JOIN User as u on u.id = a.user_id ";
      query += " LEFT JOIN User as u1 on u1.agent_id = u.id ";
      query += " LEFT JOIN VerificationTypes AS v ON v.app_id = a.id "
      query += " WHERE a.source_from='hsncverification' and a.tracker = '" + type +"' AND a.status='accept' ";
      query += where_application_id;
      query += where_application_email;
      query += where_student_name;
      query += where_application_date;
      query += " ORDER BY a.created_at desc ";
      query += limitOffset;
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});    
    };

    Application.getEmailedUserApplications = function(filters,limit,offset) {
      var where_student_name = '',
      where_application_id = '',
      where_application_email = '',
      where_application_date = '';
    var limitOffset = '';
    if (filters.length > 0) {
      filters.forEach(function(filter) {
          if (filter.name == "name") {
            where_student_name = filter.value;
          } else if (filter.name == "surname") {
            where_student_surname = " AND u.surname LIKE '%" + filter.value + "%' ";
          } else if (filter.name == "application_id") {
            where_application_id = " AND a.id = " + filter.value + " ";
          } else if (filter.name == "email") {
            where_application_email = " AND u.email like '%" + filter.value  + "%' ";
          } else if(filter.name == 'application_year'){
            where_application_date = filter.value;
          }
      });
    }
    if (limit != null && offset != null) {
      limitOffset = ' LIMIT ' + limit + ' OFFSET ' + offset;
    }
    var query = "SELECT a.id,u.email,CONCAT(u.name,' ',u.surname) as name,a.tracker,a.status,";
    query += " a.user_id,a.sent_date,a.verified_date,a.verified_by,a.created_at,a.sent_by, CONCAT(u1.name,' ',u1.surname) as a_name, u.marksheetName as aname ,v.marksheet, v.degreeCertificate";
    query += " FROM Application as a JOIN User as u on u.id = a.user_id ";
    query += " LEFT JOIN User as u1 on u1.agent_id = u.id ";
    query += " LEFT JOIN VerificationTypes AS v ON v.user_id = u.id "
    query += " WHERE a.source_from='hsncverification' and a.tracker = 'done' AND a.status = 'accept'";
    query += where_application_id;
    query += where_application_email;
    query += where_student_name;
    query += where_application_date;
    query += " ORDER BY a.created_at desc ";
    query += limitOffset;
    return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});    
    };

    // Application.getAllApplicationsDetails = function(user_id) {
    //   var query = "SELECT app.id as app_id, app.tracker, app.status, app.notes FROM Application AS app "
    //  //query += " WHERE app.source_from ='guverification' AND app.user_id = " + user_id ;
    //   query += " WHERE app.source_from ='hsncverification' AND app.user_id = " + user_id ;
    //   return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});  
    // }
    
    Application.getAllApplicationsDetails = function(user_id) {
      var query = "SELECT app.id as app_id, app.tracker, app.status, app.notes, ";
      query += " IF(app.status = 'requested',true,false) as lock_transcript FROM Application AS app "
      query += " WHERE app.source_from ='hsncverification' AND app.user_id = " + user_id ;
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});  
    }

    Application.MDT_getEnrollmentNumber = function(userId,app_id,type) {
      var query='';
      query += " SELECT mdt.* FROM Application AS app ";
      query += " LEFT JOIN MDT_User_Enrollment_Detail AS mdt ON app.id = mdt.application_id ";
      query += " WHERE app.user_id = " + userId +" AND app.id = " + app_id ; //+ " AND MDT_type = '" + type + "'";
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
    };

    // Application.getTotalUserApplications = function(filters,limit,offset) {
      
    //   var where_student_name = '',
    //    // where_student_surname = '',
    //     where_application_id = '',
    //     where_application_email = '',
    //     where_application_date = '';
    //   var limitOffset = '';
    //   if (filters.length > 0) {
    //     filters.forEach(function(filter) {
    //       if (filter.name == "name") {
    //         where_student_name = filter.value;
    //       } 
    //       else if (filter.name == "surname") {
    //         where_student_surname = " AND u.surname LIKE '%" + filter.value + "%' ";
    //       } else if (filter.name == "application_id") {
    //         where_application_id = " AND a.id = " + filter.value + " ";
    //       } else if (filter.name == "email") {
    //         where_application_email = " AND u.email like '%" + filter.value  + "%' ";
    //       } else if(filter.name == 'application_year'){
    //         where_application_date = filter.value;
    //       }
    //     });
    //   }
    //   if (limit != null && offset != null) {
    //     limitOffset = ' LIMIT ' + limit + ' OFFSET ' + offset;
    //   }
    //   //all data
    //   // var query = "SELECT * FROM Application  As a join User as u on u.id = a.user_id  where 1 = 1 AND a.source_from ='hsncverification'";
    //   //query to get info of application id , name ,tracker, status ,user_id, created_at
    //   var query = "SELECT a.id,u.email,CONCAT(u.name,' ',u.surname) as name,a.tracker,a.`status`,a.user_id ,a.created_at FROM Application  As a join User as u on u.id = a.user_id  where 1 = 1 AND a.source_from ='hsncverification'"
    //   query += where_application_id;
    //   query += where_application_email;
    //   query += where_student_name;
    //   query += where_application_date;
    //   query += " ORDER BY a.created_at desc ";
    //   query += limitOffset;
    //   return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
    // };

    Application.getTotalUserApplications = function (filters,limit, offset, tracker, type, startDate, endDate, ) {
      var whereCreated_at = '';
      if (startDate && endDate) {
          whereCreated_at = ' AND a.created_at BETWEEN "' + startDate + '" AND "' + endDate + '"';
      }
  
      var where_student_name = '',
          where_application_id = '',
          where_application_email = '',
          where_application_date = '';
        var limitOffset = '';
  
      if (filters.length > 0) {
          filters.forEach(function (filter) {
              if (filter.name == "name") {
                  where_student_name = " AND CONCAT(u.name, ' ', u.surname) LIKE '%" + filter.value + "%' ";
              } else if (filter.name == "id") {
                  where_application_id = " AND a.id = " + filter.value + " ";
              } else if (filter.name == "email") {
                  where_application_email = " AND u.email LIKE '%" + filter.value + "%' ";
              } else if (filter.name == "application_year") {
                  where_application_date = " AND a.application_year = " + filter.value + " ";
              }
          });
      }
      if (limit != null && offset != null) {
          limitOffset = ' LIMIT ' + limit + ' OFFSET ' + offset;
      }
  
      var query = "SELECT DISTINCT  a.id, u.email, CONCAT(u.name, ' ', u.surname) as name, a.tracker, a.status,";
      query += " a.user_id, a.created_at, u1.marksheetName as agent_name,v.marksheet, v.degreeCertificate";
      query += " FROM Application as a JOIN User as u on u.id = a.user_id";
      query += " LEFT JOIN User as u1 on u1.id = u.agent_id";
       query += " LEFT JOIN VerificationTypes AS v ON v.user_id = u.id "
      query += " WHERE a.source_from='hsncverification'";
      query += where_application_id;
      query += where_application_email;
      query += where_student_name;
      query += where_application_date;
      query += whereCreated_at;
      query += " ORDER BY a.created_at desc";
      query += limitOffset;
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  };
  
    Application.getReqestedUserApplications = function(filters,tracker,type,startDate,endDate) {
      var whereCreated_at = '';
      if(startDate && endDate){
          whereCreated_at = 'and a.created_at BETWEEN "'+startDate+'" AND "'+endDate+'"'
        
      }
      var query = "SELECT a.id,u.email,CONCAT(u.name,' ',u.surname) as name,a.tracker,a.status,"
          query += " a.user_id,a.created_at, u1.marksheetName as agent_name ";
          query += " FROM Application as a JOIN User as u on u.id = a.user_id ";
          query += " LEFT JOIN User as u1 on u1.id = u.agent_id "
          query += " WHERE a.source_from='hsncverification' and a.tracker = '" + tracker + "' and a.status ='" + type +"'";
          query += ""+whereCreated_at+" ORDER BY a.created_at desc ";
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
    };

      // Application.getTotalUserApplications = function(filters,tracker,type,startDate,endDate) {
      //   var whereCreated_at = '';
      //   if(startDate && endDate){
      //       whereCreated_at = 'and a.created_at BETWEEN "'+startDate+'" AND "'+endDate+'"'
          
      //   }
      //   var where_student_name = '',
      //   // where_student_surname = '',
      //    where_application_id = '',
      //    where_application_email = '',
      //    where_application_date = '';
      //  if (filters.length > 0) {
      //    filters.forEach(function(filter) {
      //      if (filter.name == "name") {
      //        where_student_name = filter.value;
      //      } 
      //      else if (filter.name == "surname") {
      //        where_student_surname = " AND u.surname LIKE '%" + filter.value + "%' ";
      //      } else if (filter.name == "application_id") {
      //        where_application_id = " AND a.id = " + filter.value + " ";
      //      } else if (filter.name == "email") {
      //        where_application_email = " AND u.email like '%" + filter.value  + "%' ";
      //      } else if(filter.name == 'application_year'){
      //        where_application_date = filter.value;
      //      }
      //    });
      //  }
   
      //   var query = "SELECT a.id,u.email,CONCAT(u.name,' ',u.surname) as name,a.tracker,a.status,"
      //       query += " a.user_id,a.created_at, u1.marksheetName as agent_name ";
      //       query += " FROM Application as a JOIN User as u on u.id = a.user_id ";
      //       query += " LEFT JOIN User as u1 on u1.id = u.agent_id "
      //       query += " WHERE a.source_from='hsncverification'";
      //       query += ""+whereCreated_at+" ORDER BY a.created_at desc ";
      //     return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
      //   };


        
        Application.getTotalpaymentUserApplications = function(filters,tracker,type,startDate,endDate) {
          var whereCreated_at = '';
          if(startDate && endDate){
              whereCreated_at = 'and a.created_at BETWEEN "'+startDate+'" AND "'+endDate+'"'
            
          }
          var query ="SELECT DISTINCT u.email, CONCAT(u.name,' ',u.surname) as name,a.created_at ,t.order_id,t.tracking_id, ";
          query += " t.bank_ref_no, a.total_amount, a.id, dd.courseName "
          query += " FROM Application as a JOIN User as u on u.id = a.user_id ";
          query += " JOIN DocumentDetails as dd ON a.id = dd.app_id"
          query += " JOIN Orders as o on u.id = o.user_id ";
          query += " JOIN Transaction as t on o.id = t.order_id  and a.source_from like '%hsncverification%'"
          query += whereCreated_at + " ORDER BY a.created_at desc ";
          return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
        };
    
    Application.getPortalwaiseApplicationCount = function(service, status) {
      var tracker = '';
      var statusCondition = '';
      if (service != null) {
          tracker = " AND tracker = '" + service + "'";
      }
  
      if (status != null) {
          statusCondition = " AND status = '" + status + "'";
        }
       
      var query = "SELECT COUNT(id) as cnt";
          query += " FROM Application ";
          query += " WHERE source_from = 'hsncverification' ";
          query += tracker;
          query += statusCondition;
       
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
  };
  





    Application.getTotalpaid = function(filters,limit,offset) {
      var where_student_name = '',
      where_application_id = '',
      where_application_email = '',
      where_application_date = '';
      var limitOffset = '';
      if (filters.length > 0) {
      filters.forEach(function(filter) {
          if (filter.name == "name") {
            where_student_name = filter.value;
          } else if (filter.name == "surname") {
            where_student_surname = " AND u.surname LIKE '%" + filter.value + "%' ";
          } else if (filter.name == "application_id") {
            where_application_id = " AND a.id = " + filter.value + " ";
          } else if (filter.name == "email") {
            where_application_email = " AND u.email like '%" + filter.value  + "%' ";
          } else if(filter.name == 'application_year'){
            where_application_date = filter.value;
          }
      });
      }
      if (limit != null && offset != null) {
      limitOffset = ' LIMIT ' + limit + ' OFFSET ' + offset;
      }
      var query = "SELECT u.email,CONCAT(u.name,' ',u.surname) as name,a.created_at ,t.order_id,t.tracking_id, ";
      query += " t.bank_ref_no,a.total_amount,a.id, t.split_status FROM ";
      query += "Application as a JOIN User as u on u.id = a.user_id JOIN Orders";
      query += " as o on u.id = o.user_id JOIN Transaction as t";
      query += " on o.id = t.order_id  and a.source_from like '%hsncverification%'";
      query += where_application_id;
      query += where_application_email;
      query += where_student_name;
      query += where_application_date;
      query += " ORDER BY a.created_at desc ";
      query += limitOffset;
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});    
      };



    Application.downloadExcel_date = function(startDate,endDate){
         
      var whereCreated_at = '';
      if(startDate && endDate){
          whereCreated_at = 'and a.created_at BETWEEN "'+startDate+'" AND "'+endDate+'"'
        }
      var query;
      
      query="SELECT u.email,CONCAT(u.name,' ',u.surname) as name,a.created_at ,t.order_id,t.tracking_id,t.bank_ref_no,a.id FROM Application as a  ";
      query += " JOIN User as u on u.id = a.user_id JOIN Orders as o on u.id = o.user_id JOIN Transaction as t on o.id = t.order_id  and a.source_from  ";
      query += " like '%hsncverification%' where 1=1 "+ whereCreated_at + "ORDER BY a.id desc ";
      return sequelize.query(query, { type: sequelize.QueryTypes.SELECT});
      }


    return Application;
};
