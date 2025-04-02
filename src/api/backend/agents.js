const express = require('express');
const router = express.Router();
const config = require('config');
var path = require('path');
var root_path = path.dirname(require.main.filename);
var models = require(root_path + '/models');
var moment = require("moment");
const { FILE_LOCATION } = config.get('path');
const { serverUrl, clientUrl } = config.get('api');
const Sequelize = require('sequelize');
const op = Sequelize.Op;
var fs = require('fs');
const multer = require('multer');
const stringFunctionsService = require('../../utils/stringFunctionsService');
var pdfreader = require('pdfreader');
var functions= require('./function')
var self_PDF = require('./invoiceTemplate');

router.post('/addStudents', (req, res) => {
    console.log('/addStudents');
    models.User.findOne({
        where :{
            email : req.body.email
        }
    }).then(function(user){
        if(user){
            res.json({
                status : 400,
                message : 'student already added'
            })
        }else{
            models.User.create({
                name : req.body.firstName,
                surname : req.body.lastName,
                marksheetName : req.body.fullName,
                email : req.body.email,
                mobile_country_code: '91',
                mobile:req.body.mobile,
                agent_id : req.user.id,
                postal_code : ''
            }).then(function(user){
                if(user){
                    models.Activitytracker.create({
                        user_id : req.user.id,
                        activity : "Student Add/Update",
                        data : "Student " + user.marksheetName + " is added by " + req.user.email,
                        application_id : '',
                        source : "hsncverification"
                    });
                    res.json({
                        status : 200,
                        data : user
                    })
                }else{

                    res.json({
                        status : 400,
                        message : "something went wrong"
                    })
                }
            })
        }
    })
})

router.get('/VerificationTypes', (req, res, next) => {
    models.VerificationTypes.findOne({
        where :{
            user_id : req.query.user_id,
            app_id : null
        }
    }).then(types=>{
        if(types){
            res.json({
                status : 200,
                data : types
            })
        }else{
            res.json({
                status : 200,
                data : null
            })
        }
    })
})

// router.get('/checkStepper',(req,res,next)=>{
//     var user_id =req.query.user_id;
//     var obj = {};
//     obj['tab1']=false, 
// 	obj['tab2']=false, 
// 	obj['tab3']=false, 
// 	obj['tab4']=false;
//     models.VerificationTypes.findOne({
//         where :{
//             user_id : user_id,
//             app_id : null
//         }
//     }).then(function(verificationTypes){
//         require('async').series([
//             function(callback) {
//                 if(verificationTypes){
//                     if(verificationTypes.marksheet == true && verificationTypes.transcript == true && verificationTypes.degreeCertificate == true ){
//                         if(verificationTypes.noOfMarksheet != null && verificationTypes.noOfTranscript != null 
//                             && verificationTypes.noOfDegree != null ){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.marksheet == true && verificationTypes.transcript == true && verificationTypes.degreeCertificate == true){
//                         if(verificationTypes.noOfMarksheet != null && verificationTypes.noOfTranscript != null && verificationTypes.noOfDegree != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.marksheet == true && verificationTypes.transcript == true ){
//                         if(verificationTypes.noOfMarksheet != null && verificationTypes.noOfTranscript != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.marksheet == true && verificationTypes.degreeCertificate == true ){
//                         if(verificationTypes.noOfMarksheet != null && verificationTypes.noOfDegree != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.transcript == true && verificationTypes.degreeCertificate == true ){
//                         if(verificationTypes.noOfTranscript != null && verificationTypes.noOfDegree != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.marksheet == true && verificationTypes.transcript == true){
//                         if(verificationTypes.noOfMarksheet != null && verificationTypes.noOfTranscript != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.marksheet == true && verificationTypes.degreeCertificate == true){
//                         if(verificationTypes.noOfMarksheet != null && verificationTypes.noOfDegree != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.marksheet == true ){
//                         if(verificationTypes.noOfMarksheet != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.transcript == true && verificationTypes.degreeCertificate == true){
//                         if(verificationTypes.noOfTranscript != null && verificationTypes.noOfDegree != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.transcript == true ){
//                         if(verificationTypes.noOfTranscript != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.degreeCertificate == true ){
//                         if(verificationTypes.noOfDegree != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.marksheet == true){
//                         if(verificationTypes.noOfMarksheet != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.transcript == true){
//                         if(verificationTypes.noOfTranscript != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }else if(verificationTypes.degreeCertificate == true){
//                         if(verificationTypes.noOfDegree != null){
//                                 obj['tab1']=true;
//     							callback(null, verificationTypes);
//                         }else{
//                             obj['tab1']=false;
//     						callback(null, verificationTypes);
//                         }
//                     }
//                 }else{
//                     obj['tab1']=false;
//                         callback(null, ''); 
//                 }
//             },
//             function(callback) {
//                 if(verificationTypes){
//                     models.DocumentDetails.findAll({
//                         where :{
//                              user_id : user_id,
//                              file : {
//                                 [op.ne] : null
//                              },
//                              app_id : null,
//                              type: {
//                                 [op.notIn]: ['secondYear','supportive']
//                             }
//                         }
//                     }).then(function(documentDetails){
//                             if (verificationTypes.marksheet == true && verificationTypes.transcript == true && verificationTypes.degreeCertificate == true) {
//                                 models.DocumentDetails.findAll({
//                                     where: {
//                                         user_id: user_id,
//                                         file: {
//                                             [op.ne]: null
//                                         },
//                                         app_id: null,
//                                         type:{
//                                             [op.notIn] : ['supportive']
//                                         },
//                                         // degree_Type: {
//                                         //     [op.in]: ['Degree Certificate', 'Provisional Degree Certificate']
//                                         // }
//                                     }
//                                 }).then(function(degreeDetails){   
//                                     models.DocumentDetails.findAll({
//                                         where:{
//                                             user_id:user_id,
//                                             app_id:null,
//                                             type:'supportive'
//                                         }     
//                                     }).then(function(docDetails){
//                                         var total = verificationTypes.noOfMarksheet + verificationTypes.noOfTranscript + verificationTypes.noOfDegree;
//                                         var uploadedTotal = documentDetails.length;
//                                         if (uploadedTotal == total && docDetails.length != 0) {
//                                             obj['tab2'] = true;
//                                             callback(null, documentDetails);
//                                         } else {
//                                                 obj['tab2'] = false;
//                                             callback(null, documentDetails);
//                                         }
//                                     }).catch(e=>{
//                                         console.log("error",e)
//                                     })                              
//                                 }).catch(error=>{
//                                     console.log("errorror",error)
//                                 })
//                             } else if (verificationTypes.marksheet == true && verificationTypes.degreeCertificate == true) {
//                                 models.DocumentDetails.findAll({
//                                     where: {
//                                         user_id: user_id,
//                                         file: {
//                                             [op.ne]: null
//                                         },
//                                         app_id: null,
//                                         type:{
//                                             [op.notIn] : ['supportive']
//                                         },                   
//                                         // degree_Type: {
//                                         //     [op.in]: ['Degree Certificate', 'Provisional Degree Certificate']
//                                         // }
//                                     }
//                                 }).then(function(degreeDetails){
//                                     models.DocumentDetails.findAll({
//                                         where:{
//                                             user_id:user_id,
//                                             app_id:null,
//                                             type:'supportive'
//                                         }     
//                                     }).then(function (docDetails) {
//                                         var total = verificationTypes.noOfMarksheet + verificationTypes.noOfDegree;
//                                         var uploadedTotal = documentDetails.length ;
//                                         if (uploadedTotal == total && docDetails.length !=0) {
//                                             obj['tab2'] = true;
//                                             callback(null, documentDetails);
//                                         } else {
//                                             obj['tab2'] = false;
//                                             callback(null, documentDetails);
//                                         }
//                                     })
//                                 })                      
//                             } else if (verificationTypes.marksheet == true && verificationTypes.transcript == true) {
//                                 var total = verificationTypes.noOfMarksheet + verificationTypes.noOfTranscript;
//                                 models.DocumentDetails.findAll({
//                                     where:{
//                                         user_id:user_id,
//                                         app_id:null,
//                                         type:'supportive'
//                                     }                               
//                                 }).then(function(docDetails){
//                                     if (documentDetails.length == total && docDetails.length !=0) {
//                                         obj['tab2'] = true;
//                                         callback(null, documentDetails);
//                                     } else {
//                                         obj['tab2'] = false;
//                                         callback(null, documentDetails);
//                                     }
//                                 })
//                             } else if (verificationTypes.transcript == true && verificationTypes.degreeCertificate == true ) {
//                                 models.DocumentDetails.findAll({
//                                     where: {
//                                         user_id: user_id,
//                                         file: {
//                                             [op.ne]: null
//                                         },
//                                         app_id: null,
//                                         type:{
//                                             [op.notIn] : ['supportive']
//                                         },
//                                         // degree_Type: {
//                                         //     [op.in]: ['Degree Certificate', 'Provisional Degree Certificate']
//                                         // }
//                                     }
//                                 }).then(function(degreeDetails){
//                                     models.DocumentDetails.findAll({
//                                         where:{
//                                             user_id:user_id,
//                                             app_id:null,
//                                             type:'supportive'
//                                         } 
//                                     }).then(function (docDetails) {
//                                            var total = verificationTypes.noOfTranscript + verificationTypes.noOfDegree
//                                         var uploadedTotal = degreeDetails.length;
//                                         if (uploadedTotal == total && docDetails.length !=0) {
//                                             obj['tab2'] = true;
//                                             callback(null, documentDetails);
//                                         } else {
//                                             obj['tab2'] = false;
//                                             callback(null, documentDetails);
//                                         }
//                                     })
//                                 })
//                             } else if (verificationTypes.marksheet == true ) {
//                                 var total = verificationTypes.noOfMarksheet;
//                                 if (documentDetails.length == total) {
//                                     obj['tab2'] = true;
//                                     callback(null, documentDetails);
//                                 } else {
//                                     obj['tab2'] = false;
//                                     callback(null, documentDetails);
//                                 }
//                             } else if (verificationTypes.transcript == true) {
//                                     models.DocumentDetails.findAll({
//                                         where:{
//                                             user_id:user_id,
//                                             app_id:null,
//                                             type:'supportive'
//                                         } 
//                                     }).then(function(docDetails){
//                                         var total = verificationTypes.noOfTranscript;
//                                         if (documentDetails.length == total && docDetails.length != 0 ) {
//                                                obj['tab2'] = true;
//                                             callback(null, documentDetails);
//                                         } else {
//                                                     obj['tab2'] = false;
//                                             callback(null, documentDetails);
//                                         }
//                                     })
                              
//                             } else if (verificationTypes.degreeCertificate == true) {
//                                 models.DocumentDetails.findAll({
//                                     where: {
//                                         user_id: user_id,
//                                         file: {
//                                             [op.ne]: null
//                                         },
//                                         app_id: null,
//                                         type:{
//                                             [op.notIn] : ['supportive']
//                                         },
//                                         // degree_Type: {
//                                         //     [op.in]: ['Degree Certificate', 'Provisional Degree Certificate']
//                                         // }
//                                     }
//                                 }).then(function (degreeDetails) {
//                                     models.DocumentDetails.findAll({
//                                         where:{
//                                             user_id:user_id,
//                                             app_id:null,
//                                             type:'supportive'
//                                         }
//                                     }).then(function(docDetails){
//                                         var total = verificationTypes.noOfDegree;
//                                         var uploadedTotal = parseInt(documentDetails.length);
//                                         if (uploadedTotal == total && docDetails.length !=0) {
//                                             obj['tab2'] = true;
//                                             callback(null, documentDetails);
//                                         } else {
//                                             obj['tab2'] = false;
//                                             callback(null, documentDetails);
//                                         }
//                                     })
                                    
//                                 })
//                             } else {
//                                 obj['tab2'] = false;
//                                 callback(null, documentDetails);
//                             }
                            
//                     })
//                 }else{
//                     obj['tab2']=false;
//                     callback(null, verificationTypes);
//                 }
                
//             },
//             function(callback) {
//                 if(verificationTypes){
//                     var noOfCopies = 0;
//                     var instituteDetails = [];
//                     if(verificationTypes.sealedCover){
//                         noOfCopies = verificationTypes.noOfCopies;
//                         models.InstituteDetails.findAll({
//                             where :{
//                                 user_id : user_id,
//                                 address : {
//                                     [op.ne] : null
//                                 },
//                                 app_id : null
//                             }
//                         }).then(function(institute_Details){
//                             instituteDetails = institute_Details;
//                         })

//                     }else{
//                         noOfCopies = 1;
//                         models.InstituteDetails.findAll({
//                             where :{
//                                 user_id : user_id,
//                                 email : {
//                                     [op.ne] : null
//                                 },
//                                 app_id : null
//                             }
//                         }).then(function(institute_Details){
//                             instituteDetails = institute_Details;
//                         })
//                     }
//                     setTimeout(()=>{
//                         if(instituteDetails.length > 0){
//                             if(verificationTypes.marksheet == true && verificationTypes.transcript == true && verificationTypes.degreeCertificate == true && verificationTypes.secondYear == true){
//                                 var expectedLength = noOfCopies * 4;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.marksheet == true && verificationTypes.transcript == true && verificationTypes.degreeCertificate == true){
//                                 var expectedLength = noOfCopies * 3;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.marksheet == true && verificationTypes.transcript == true && verificationTypes.secondYear == true){
//                                 var expectedLength = noOfCopies * 3;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.marksheet == true && verificationTypes.degreeCertificate == true && verificationTypes.secondYear == true){
//                                 var expectedLength = noOfCopies * 3;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.marksheet == true && verificationTypes.transcript == true){
//                                 var expectedLength = noOfCopies * 2;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.marksheet == true && verificationTypes.degreeCertificate == true){
//                                 var expectedLength = noOfCopies * 2;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.marksheet == true && verificationTypes.secondYear == true){
//                                 var expectedLength = noOfCopies * 2;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.transcript == true && verificationTypes.degreeCertificate == true && verificationTypes.secondYear == true){
//                                 var expectedLength = noOfCopies * 3;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.transcript == true && verificationTypes.degreeCertificate == true){
//                                 var expectedLength = noOfCopies * 2;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.transcript == true && verificationTypes.secondYear == true){
//                                 var expectedLength = noOfCopies * 2;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.degreeCertificate == true && verificationTypes.secondYear == true){
//                                 var expectedLength = noOfCopies * 2;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.marksheet == true){
//                                 var expectedLength = noOfCopies * 1;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.transcript == true){
//                                 var expectedLength = noOfCopies * 1;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else if(verificationTypes.degreeCertificate == true){
//                                 var expectedLength = noOfCopies * 1;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 } 
//                             }else if(verificationTypes.secondYear == true){
//                                 var expectedLength = noOfCopies * 1;
//                                 if(instituteDetails.length == expectedLength){
//                                     obj['tab3']=true;
//                                     callback(null, instituteDetails);
//                                 }else{
//                                     obj['tab3']=false;
//                                     callback(null, instituteDetails);
//                                 }
//                             }else {
//                                 obj['tab3']=false;
//                                 callback(null, instituteDetails);
//                             }
//                         }else{
//                             obj['tab3']=false;
//                             callback(null, instituteDetails);
//                         }
//                     },3000)
//                 }else{
//                     obj['tab3']=false;
//                     callback(null, verificationTypes);
//                 }
//             },
//             function(callback) {
//                 if(obj['tab1']==true && obj['tab2']==true && obj['tab3']==true){
//                     obj['tab4'] = true;
//                     callback(null, '');
//                 }else{
//                     obj['tab4'] = false;
//                     callback(null, '');
//                 }
//             },
            
//         ],
//         function(err, result) {
//             res.json({
//                 status: 200,
//                 message: 'Sending Tab Status',
//                 data: obj
//             });
//         });
//     })
// })

router.get('/checkStepper',(req,res,next)=>{
    var user_id =req.query.user_id;
    var obj = {};
    obj['tab1']=false, 
	obj['tab2']=false, 
	obj['tab3']=false, 
	obj['tab4']=false;
    models.VerificationTypes.findOne({
        where :{
            user_id : user_id,
            app_id : null
        }
    }).then(function(verificationTypes){
        require('async').series([
            function(callback) {
                if(verificationTypes){
                    if(verificationTypes.marksheet == true && verificationTypes.degreeCertificate == true ){
                        if(verificationTypes.noOfMarksheet != null && verificationTypes.noOfDegree != null){
                                obj['tab1']=true;
    							callback(null, verificationTypes);
                        }else{
                            obj['tab1']=false;
    						callback(null, verificationTypes);
                        }
                    }else if(verificationTypes.marksheet == true ){
                        if(verificationTypes.noOfMarksheet != null){
                                obj['tab1']=true;
    							callback(null, verificationTypes);
                        }else{
                            obj['tab1']=false;
    						callback(null, verificationTypes);
                        }
                    }else if(verificationTypes.degreeCertificate == true ){
                        if(verificationTypes.noOfDegree != null){
                                obj['tab1']=true;
    							callback(null, verificationTypes);
                        }else{
                            obj['tab1']=false;
    						callback(null, verificationTypes);
                        }
                    }
                }else{
                    obj['tab1']=false;
                        callback(null, ''); 
                }
            },
            function(callback) {
                if(verificationTypes){
                    models.DocumentDetails.findAll({
                        where :{
                             user_id : user_id,
                             file : {
                                [op.ne] : null
                             },
                             app_id : null,
                             type: {
                                [op.notIn]: ['supportive']
                            }
                        }
                    }).then(function(documentDetails){
                            if (verificationTypes.marksheet == true && verificationTypes.degreeCertificate == true) {
                                 
                                // models.DocumentDetails.findAll({
                                //     where:{
                                //         user_id:user_id,
                                //         app_id:null,
                                //         type:'supportive'
                                //     }     
                                // }).then(function(docDetails){
                                    var total = verificationTypes.noOfMarksheet + verificationTypes.noOfTranscript + verificationTypes.noOfDegree;
                                    var uploadedTotal = documentDetails.length;
                                    // if (uploadedTotal == total && docDetails.length != 0) {
                                    if (uploadedTotal == total) {
                                        obj['tab2'] = true;
                                        callback(null, documentDetails);
                                    } else {
                                            obj['tab2'] = false;
                                        callback(null, documentDetails);
                                    }
                                // }).catch(e=>{
                                //     console.log("error",e)
                                // })                              
                               
                            } else if (verificationTypes.marksheet == true ) {
                                var total = verificationTypes.noOfMarksheet;
                                if (documentDetails.length == total) {
                                    obj['tab2'] = true;
                                    callback(null, documentDetails);
                                } else {
                                    obj['tab2'] = false;
                                    callback(null, documentDetails);
                                }
                            } else if (verificationTypes.degreeCertificate == true) {
                                
                                // models.DocumentDetails.findAll({
                                //     where:{
                                //         user_id:user_id,
                                //         app_id:null,
                                //         type:'supportive'
                                //     }
                                // }).then(function(docDetails){
                                    var total = verificationTypes.noOfDegree;
                                    var uploadedTotal = parseInt(documentDetails.length);
                                    // if (uploadedTotal == total && docDetails.length !=0) {
                                    if (uploadedTotal == total) {
                                        obj['tab2'] = true;
                                        callback(null, documentDetails);
                                    } else {
                                        obj['tab2'] = false;
                                        callback(null, documentDetails);
                                    }
                                // })
                            } else {
                                obj['tab2'] = false;
                                callback(null, documentDetails);
                            }
                            
                    })
                }else{
                    obj['tab2']=false;
                    callback(null, verificationTypes);
                }
                
            },
            function(callback) {
                if(verificationTypes){
                    var noOfCopies = 0;
                    var instituteDetails = [];
                    noOfCopies = 1;
                    models.InstituteDetails.findAll({
                        where :{
                            user_id : user_id,
                            email : {
                                [op.ne] : null
                            },
                            app_id : null
                        }
                    }).then(function(institute_Details){
                        instituteDetails = institute_Details;
                    })
                    
                    setTimeout(()=>{
                        if(instituteDetails.length > 0){
                            if(verificationTypes.marksheet == true && verificationTypes.degreeCertificate == true){
                                var expectedLength = noOfCopies * 2;
                                if(instituteDetails.length == expectedLength){
                                    obj['tab3']=true;
                                    callback(null, instituteDetails);
                                }else{
                                    obj['tab3']=false;
                                    callback(null, instituteDetails);
                                }
                            }else if(verificationTypes.marksheet == true){
                                var expectedLength = noOfCopies * 1;
                                if(instituteDetails.length == expectedLength){
                                    obj['tab3']=true;
                                    callback(null, instituteDetails);
                                }else{
                                    obj['tab3']=false;
                                    callback(null, instituteDetails);
                                }
                            }else if(verificationTypes.degreeCertificate == true){
                                var expectedLength = noOfCopies * 1;
                                if(instituteDetails.length == expectedLength){
                                    obj['tab3']=true;
                                    callback(null, instituteDetails);
                                }else{
                                    obj['tab3']=false;
                                    callback(null, instituteDetails);
                                } 
                            }else {
                                obj['tab3']=false;
                                callback(null, instituteDetails);
                            }
                        }else{
                            obj['tab3']=false;
                            callback(null, instituteDetails);
                        }
                    },3000)
                }else{
                    obj['tab3']=false;
                    callback(null, verificationTypes);
                }
            },
            function(callback) {
                if(obj['tab1']==true && obj['tab2']==true && obj['tab3']==true){
                    obj['tab4'] = true;
                    callback(null, '');
                }else{
                    obj['tab4'] = false;
                    callback(null, '');
                }
            },
            
        ],
        function(err, result) {
            res.json({
                status: 200,
                message: 'Sending Tab Status',
                data: obj
            });
        });
    })
})

router.get('/getAllApplications',(req,res,next)=>{
    console.log('/getAllApplications');

    var applicationData = [];
    models.Application.findAll({
        where :{
            user_id : req.query.user_id
        }
    }).then(function(applications){
        if(applications.length> 0){
             require('async').eachSeries(applications, function(app, callback){
                var application ={
                    id : app.id ,
                    user_id :  req.query.user_id,
                    tracker : app.tracker,
                    status : app.status,
                    requestedData : []
                }
                if(app.status == 'requested'){
                    models.DocumentDetails.findAll({
                        where:{
                            user_id : app.user_id,
                            app_id : app.id,
                            [op.or]:[{
                                lock_transcript :"requested"
                            },{
                                upload_step : "requested"
                            }]
                        }
                    }).then(function(docDetails){
                        if(docDetails.length > 0){
                            var requestedData = [];
                            docDetails.forEach(doc=>{
                                requestedData.push({
                                    id : doc.id,
                                    courseName : doc.courseName,
                                    semester:doc.semester,
                                    type : doc.type,
                                    upload_step : doc.upload_step,
                                    lock_transcript : doc.lock_transcript
                                })
                            })
                           application.requestedData = requestedData;
                        }  
                        
                    })

                }
                setTimeout(()=>{
                    applicationData.push(application); 
                    callback();
                },1000)
             }, function(){
                res.json({
                    status : 200,
                    data : applicationData
                })
            });
        }
    })
})

router.post('/VerificationTypes', (req, res, next) => {
    console.log('/VerificationTypes')
    var verificationData = {
        marksheet : null,
        noOfMarksheet : null,
        // transcript : null,
        // noOfTranscript : null,
        degree : null,
        noOfDegree : null,
    };
    req.body.verificationData.forEach(verification=>{
        if(verification.type == 'marksheet'){
            verificationData.marksheet = verification.event,
            verificationData.noOfMarksheet = verification.documentCount
        }
        // if(verification.type == 'transcript'){
        //     verificationData.transcript = verification.event,
        //     verificationData.noOfTranscript = verification.documentCount
        // }

        if(verification.type == 'degree'){
            verificationData.degree = verification.event,
            verificationData.noOfDegree = verification.documentCount
        }
    })
    models.VerificationTypes.findOne({
        where :{
            user_id : req.body.user_id,
            app_id : null
        }
    }).then(types=>{
        if(types){
            var limit = types.noOfCopies - 1;
            types.update({
                marksheet : verificationData.marksheet,
                noOfMarksheet : verificationData.noOfMarksheet,
                // transcript : verificationData.transcript,
                // noOfTranscript : verificationData.noOfTranscript,
                degreeCertificate : verificationData.degree,
                noOfDegree : verificationData.noOfDegree,
            }).then(updatedDetails =>{
                if(updatedDetails){
                   res.json({
                        status : 200,
                        data : updatedDetails
                    })
                }else{
                    res.json({
                        status : 400,
                        data : ''
                    }) 
                }
            })
        }else{
            models.VerificationTypes.create({
                marksheet : verificationData.marksheet,
                noOfMarksheet : verificationData.noOfMarksheet,
                // transcript : verificationData.transcript,
                // noOfTranscript : verificationData.noOfTranscript,
                degreeCertificate : verificationData.degree,
                noOfDegree : verificationData.noOfDegree,
                user_id : req.body.user_id
            }).then(updatedDetails=>{
                if(updatedDetails){
                    res.json({
                        status : 200,
                        data : updatedDetails
                    })
                }else{
                    res.json({
                        status : 400,
                        data : ''
                    }) 
                }
            })
        }
       
    })
})

router.post('/documentDetails', (req, res, next) => {
    console.log('agent/documentDetails');
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    var documentType = req.body.type;
    var documentData = req.body.documentDetailsData;
    if(documentData.id){
        models.DocumentDetails.findOne({
            where:{
                id : documentData.id
            }
        }).then(function(documentDetails){
            documentDetails.update({
                courseName : documentData.courseName,
                courseType : documentData.courseType,
                seatNo : documentData.seatNo,
                semester : documentData.semester,
                PassingMonthYear : documentData.passingMonthYear,
                convocationDate: (documentData.convocationDate) ? (moment(new Date(documentData.convocationDate)).format('YYYY-MM-DD')) : null,
                transcriptNo : documentData.transcriptNo,
                convocationNo : documentData.convocationNo,
                resultClass : documentData.result,
                SGPI : documentData.sgpi,
                // user_id : req.user.id,
                type : documentType,
                course_name : documentData.courseName.replace(/[&\/\\#+()$~%'":*?<>{}-\s]/g, '_'),
                grade : documentData.grade
            }).then(documentDetails =>{
                models.User.findOne({
                    where:{
                        id: documentDetails.user_id
                    }
                }).then(user=>{
                    const data1 = `${req.user.email} has been Updated and Saved Details of ${user.marksheetName}.`;
                    const activity = "Update and Save Details";
                    functions.activitylog(clientIP,req,req.user.id,activity,data1,null);
                    res.json({
                        status : 200,
                        data : documentDetails
                    })
                })
            })
        })
    }else{
        models.DocumentDetails.create({
            courseName : documentData.courseName,
            courseType : documentData.courseType,
            seatNo : documentData.seatNo,
            PassingMonthYear : documentData.passingMonthYear,
            semester : documentData.semester,
            convocationDate: (documentData.convocationDate) ? (moment(new Date(documentData.convocationDate)).format('YYYY-MM-DD')) : null,
            transcriptNo : documentData.transcriptNo,
            convocationNo : documentData.convocationNo,
            resultClass : documentData.result,
            user_id : req.body.user_id,
            type : documentType,
            SGPI : documentData.sgpi,
            course_name : documentData.courseName.replace(/[&\/\\#+()$~%'":*?<>{}-\s]/g, '_'),
            grade : documentData.grade
        }).then(documentDetails =>{
            res.json({
                status : 200,
                data : documentDetails
            })
        })
    }
})
    
router.get('/validateDocumentDetails',(req, res, next) => {
    var validateData = {marksheet : false,  degreeCertificate :false};
    var noOfCopies = 1;
    if(req.query.type == 'documents'){
        models.VerificationTypes.findOne({
            where:{
                user_id : req.query.user_id,
                app_id : null,
            }
        }).then(function(types){
            let documentPromise = new Promise(function(resolve, reject){
                if(types){
                    if(types.marksheet == true){
                        models.DocumentDetails.findAll({
                            where:{
                                user_id : req.query.user_id,
                                app_id : null,
                                file:{
                                    [op.ne]:null
                                },
                                type :'marksheet'
                            }
                        }).then(function(docDetails){
                            if(docDetails.length > 0){
                                if(docDetails.length == types.noOfMarksheet){
                                    validateData.marksheet = true;
                                }
                            }
                        })
                    }else{
                        validateData.marksheet = true;
                    }
                    if(types.degreeCertificate == true){
                        models.DocumentDetails.findAll({
                            where:{
                                user_id : req.query.user_id,
                                app_id : null,
                                file:{
                                    [op.ne]:null
                                },
                                type:'degree'
                                
                            }
                        }).then(function(docDetails){
                            if(docDetails.length > 0){
                                if(docDetails.length == types.noOfDegree){
                                    validateData.degreeCertificate = true;
                                }
                            }
                            
                        })
                    }else{
                        validateData.degreeCertificate = true;
                    }
                    setTimeout(()=>{
                        resolve(validateData)
                    },1000)
                }else{
                    setTimeout(()=>{
                        resolve(validateData)
                    },1000)
                }
            });

            documentPromise.then((data)=>{
                res.json({
                    status: 200,
                    data:validateData
                })
            },(error)=>{
                res.json({
                    status: 200,
                    message:'Something Went wrong'
                })
            })
        })
    }else if(req.query.type == 'institutes'){
        models.VerificationTypes.findOne({
            where:{
                user_id : req.query.user_id,
                app_id : null,
            }
        }).then(function(types){
            
            if(types && types.sealedCover == true){
                noOfCopies = types.noOfCopies;
            }

            let documentPromise = new Promise(function(resolve, reject){
                if(types){
                    if(types.marksheet == true){
                        models.InstituteDetails.findAll({
                            where:{
                                user_id : req.query.user_id,
                                app_id : null,
                                type :'marksheet'
                            }
                        }).then(function(docDetails){
                            
                            if(docDetails.length == noOfCopies){
                                validateData.marksheet = true;
                            }
                        })
                    }else{
                        validateData.marksheet = true;
                    }
                   if(types.degreeCertificate == true){
                        models.InstituteDetails.findAll({
                            where:{
                                user_id : req.query.user_id,
                                app_id : null,
                                type:'degree'
                            }
                        }).then(function(docDetails){
                            if(docDetails.length == noOfCopies){
                                validateData.degreeCertificate = true;
                            }
                        })
                    }else{
                        validateData.degreeCertificate = true;
                    }
                    
                    setTimeout(()=>{
                        resolve(validateData)
                    },1000)
                }else{
                    setTimeout(()=>{
                        resolve(validateData)
                    },1000)
                }
            });

            documentPromise.then((data)=>{
                res.json({
                    status: 200,
                    data:validateData
                })
            },(error)=>{
                res.json({
                    status: 400,
                    message : 'Something Went Wrong'
                })
            })
        })
    }
})

router.get('/documentDetails', (req, res, next) => {
    console.log('/documentDetails')
    var documentData = [];
    models.DocumentDetails.findAll({
        where :{
            user_id : req.query.user_id,
            app_id : null
        }
    }).then(documentDetails =>{
        documentDetails.forEach(document =>{
                documentData.push({
                    id : document.id,
                    courseName : document.courseName,
                    courseType : document.courseType,
                    semester : document.semester,
                    seatNo : document.seatNo,
                    passingMonthYear : document.PassingMonthYear,
                    result : document.resultClass,
                    sgpi : document.SGPI,
                    fileName : document.file,
                    type : document.type,
                    convocationDate : document.convocationDate,
                    transcriptNo: document.transcriptNo,
                    convocationNo : document.convocationNo,
                    grade: document.grade
                })
            })
            res.json({
                status : 200,
                data : documentData
            })
    })
})

router.get('/institutionalDetails',(req,res,next)=>{
    var user_id = req.query.user_id;
    var data = [];
    models.InstituteDetails.findAll({
        where :{
            user_id : user_id,
            app_id : null
        }
    }).then(function(instituteDetails){
        if (instituteDetails.length > 0) {
            require('async').eachSeries(instituteDetails, function (institute, callback) {
                var address = [];
                if (Array.isArray(institute.address)) { // Check if institute.address is an array
                    address = institute.address.filter(add => add.app_type === 'new');
                }
                data.push({
                    id: institute.id,
                    referenceNo: institute.referenceNo,
                    name: institute.name,
                    address: (address.length > 0) ? address[0].address : null,
                    email: institute.email,
                    deliveryOption: institute.deliveryOption,
                    type: institute.type,
                    deliveryMode: institute.deliveryMode
                });
                callback();
            }, function () {
                res.json({
                    status: 200,
                    data: data
                });
            });
        } else {
            res.json({
                status: 200,
                data: data
            });
        }
    })
})

router.post('/institutionalDetails',async (req,res,next)=>{
    try{
        const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        var user_id = req.body.user_id;
        var instituteType = req.body.type;
        var instituteData = req.body.instituteData;
        var deliveryOption = req.body.selectedDelivery;
        var deliveryMode = req.body.selectedDeliveryMode;
        var address = [];
        if(instituteData.address != null){
            address.push({
                app_type : "new",
                address :  instituteData.address
            })
        }else{
            address = null;
        };
        if(instituteData.id){
            let insUpdateData = await models.InstituteDetails.update({
                referenceNo : instituteData.referenceNo,
                name : instituteData.name.replace(/[^a-zA-Z0-9 ]|\//g, ' '),
                address : address,
                student_address : instituteData.student_address,
                email : instituteData.email,
                type : instituteType,
                deliveryOption : deliveryOption,
                deliveryMode : deliveryMode
            },{
                where :{
                    id : instituteData.id
                }
            });
            if(insUpdateData){  
                models.User.findOne({
                    where:{
                        id: req.body.user_id
                    }
                }).then(user=>{
                    const data1 = `${req.user.email} has been Updated and  saved instituteDetails of ${user.marksheetName}.`;
                    const activity = "Updated and Save instituteDetails";
                    functions.activitylog(clientIP,req,req.user.id,activity,data1,null);
                    res.json({
                        status : 200
                    })
                })
            }else{
                res.json({
                    status : 400
                })
            }
        }else{
            let createInsData = await models.InstituteDetails.create({
                referenceNo : instituteData.referenceNo,
                name : instituteData.name.replace(/[^a-zA-Z0-9 ]|\//g, ' '),
                address : address,
                student_address : instituteData.student_address,
                email : instituteData.email,
                type : instituteType,
                deliveryOption : deliveryOption,
                deliveryMode : deliveryMode,
                user_id : user_id
            });
            if(createInsData){
                models.User.findOne({
                    where:{
                        id: req.body.user_id
                    }
                }).then(user=>{
                    const data1 = `${req.user.email} has been saved instituteDetails of ${user.marksheetName}.`;
                    const activity = "Save instituteDetails";
                    functions.activitylog(clientIP,req,req.user.id,activity,data1,null);
                    res.json({
                        status : 200
                    })
                })
            }
        }
    }catch(err){
        res.json({
        status: 400,
        data: err
    })
}
})

router.get('/getPreviewData',(req,res,next)=>{
    var user_id = req.query.user_id;
    var previewData ={
        personalDetails : {},
        verificationDetails :{},
        marksheetDetails :[],
        //transcriptDetails : [],
        degreeDetails :[],
        deliveryOptions:{},
        marksheetInstitute : [],
        //transcriptInstitute :[],
        degreeInstitute : [],
    }
      
    models.User.findOne({
        where :{
            id : user_id
        }
    }).then(function(user){
        previewData.personalDetails = {
            name : user.firstName + " " + user.lastName,
            email : user.email,
            mobile : user.mobile_country_code + '-' + user.mobile,
            marksheetName : user.marksheetName
        } 
        models.VerificationTypes.findOne({
            where :{
                user_id : user_id,
                app_id : null
            }
        }).then(function(verificationTypes){
            previewData.verificationDetails = verificationTypes;
            models.DocumentDetails.findAll({
                where :{
                    user_id : user_id,
                    app_id : null
                }
            }).then(function(documentDetails){
                documentDetails.forEach(document=>{
                    var extension =document.file ? document.file.split('.') : null;
                    if(document.type == 'marksheet'){
                        previewData.marksheetDetails.push({
                            courseName : document.courseName,
                            courseType : document.courseType,
                            seatNo : document.seatNo,
                            passingMonthYear : document.PassingMonthYear,
                            result : document.resultClass,
                            sgpi: document.SGPI,
                            fileName : document.file,
                            fileSrc : serverUrl + 'upload/documents/' + user_id + '/' + document.file,
                            fileExtension : extension ? extension[1] : null,
                        })
                    // }else if(document.type == 'transcript'){
                    //     previewData.transcriptDetails.push({
                    //         courseName : document.courseName,
                    //         seatNo : document.seatNo,
                    //         passingMonthYear : document.PassingMonthYear,
                    //         fileName : document.file,
                    //         fileSrc : serverUrl + 'upload/documents/' + user_id + '/' + document.file,
                    //         fileExtension : extension ? extension[1] : null,
                    //     })
                    }else if(document.type == 'degree'){
                        previewData.degreeDetails.push({
                            courseName : document.courseName,
                            courseType : document.courseType,
                            seatNo : document.seatNo,
                            passingMonthYear : document.PassingMonthYear,
                            convocationDate : document.convocationDate,
                            result : document.resultClass,
                            fileName : document.file,
                            fileSrc : serverUrl + 'upload/documents/' + user_id + '/' + document.file,
                            fileExtension : extension ? extension[1] : null,
                        })
                    }
                })

                models.InstituteDetails.findAll({
                    where :{
                        user_id : user_id,
                        app_id : null
                    }
                }).then(function(instituteDetails){
                    if(instituteDetails.length > 0){
                        previewData.deliveryOptions= {
                            deliveryOption : instituteDetails[0].deliveryOption,
                            deliveryMode :instituteDetails[0].deliveryMode
                        }
                        instituteDetails.forEach(institute=>{
                            var address = []
                            if(institute.address != null)
                               address =  institute.address.filter(add=>(add.app_type == 'new'));
                            if(institute.type == 'marksheet'){
                                previewData.marksheetInstitute.push({
                                    referenceNo : institute.referenceNo,
                                    name : institute.name,
                                    address:(address.length > 0) ? address[0].address : null,
                                    email : institute.email
                                })
                            // }else if(institute.type == 'transcript'){
                            //     previewData.transcriptInstitute.push({
                            //         referenceNo : institute.referenceNo,
                            //         name : institute.name,
                            //         address:(address.length > 0) ? address[0].address : null,
                            //         student_address : institute.student_address,
                            //         email : institute.email
                            //     })
                            }else if(institute.type == 'degree'){
                                previewData.degreeInstitute.push({
                                    referenceNo : institute.referenceNo,
                                    name : institute.name,
                                    address:(address.length > 0) ? address[0].address : null,
                                    email : institute.email 
                                })
                            }
                        })
                    }

                    res.json({
                        status : 200,
                        data : previewData
                    })
                })
            })
        })
    })
})

router.get('/getPaymentAmount', (req,res,next)=>{
    // var total_amount = 0;
    var total_amount = 2108;

    models.User.findOne({
        where:{
         // id  :req.query.user_id
            id  :req.query.user_id

        }
    }).then(function(user){

        // models.VerificationTypes.findOne({
        //     where:{
        //         // user_id : req.query.user_id
        //         user_id : req.user.id,
        //         // app_id : null
        //     }
        // }).then(function(verificationTypes){
            // if(verificationTypes.marksheet == true){
            //     total_amount = total_amount + (verificationTypes.noOfMarksheet * 100)
            // }
            // if(verificationTypes.transcript == true){
            //     total_amount = total_amount + (verificationTypes.noOfTranscript * 700)
            // }
            // if(verificationTypes.degreeCertificate == true){
            //     total_amount = total_amount + (verificationTypes.noOfDegree * 350)
            // }
            // if(verificationTypes.sealedCover == true){
            //     total_amount = total_amount + (verificationTypes.noOfCopies * 700)
            // }
            // if(verificationTypes.secondYear == true){
            //     total_amount = total_amount + 400
            // }

            res.json({
                staus : 200,
                data : total_amount,
                user_data : user
            })
        })
    //})
});

router.get('/getAllStudents', (req,res,next)=>{
    console.log("/getAllStudents");
    var page = req.query.page;
    var name = req.query.name ? req.query.name : '';
    var email = req.query.email ? req.query.email : '';
    var year = req.query.acadYear ? req.query.acadYear : '';
    var limit = 10;
    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters =[];

    if(name != '' && name != null && name != undefined && name != 'null' && name != 'undefined'){
        var filter ={};
        var filter1 = {};
        var nameSplit = name.split(' ');
        if(nameSplit.length == 1){
             filter.name = 'name';
           filter.value = " AND( u.name like '%" + nameSplit[0] + "%' OR u.surname like '%" + nameSplit[0] + "%') ";
            filters.push(filter);
        }else if(nameSplit.length == 2){
             filter.name = 'name';
           filter.value = " AND u.name like '%" + nameSplit[0] + "%' AND u.surname like '%" + nameSplit[1] + "%' ";
            filters.push(filter);
        }else{
             filter.name = 'name';
             var lastElement = nameSplit.pop();
             filter.value = " AND u.name like '%" + nameSplit.join(' ') + "%' AND u.surname like '%" + lastElement + "%' ";
            filters.push(filter);
        }
        
    }
    if(email != '' && email != null && email != undefined && email != 'null' && email != 'undefined'){
        var filter ={};
        filter.name = 'email';
        filter.value = email;
        filters.push(filter);
    }

    if(year != '' && year != null && year != undefined && year != 'null' && year != 'undefined'){	
        var filter ={};	
		var currentyear = year;	
		var startdate = currentyear+"-04-01";	
		var year = parseInt(currentyear) + 1;	
		var enddate = year + "-04-01"  ;	
        filter.name = 'application_year';	
        filter.value = " AND a.created_at BETWEEN '" + startdate + "' AND '" + enddate + "'";	
        filters.push(filter);	
    }
    var data = []; var countObj={};
   // fetch total active & inactive student count from db.
    models.User.getAllStudents(req.user.id,filters,null,null).then(function(studentsData) {
        countObjects.totalLength = studentsData.length;
        models.User.getAllStudents(req.user.id,filters,limit,offset).then(function(students) {	
            countObjects.filteredLength = students.length;	
            if(students != null) {
                require('async').eachSeries(students, function(student, callback){
                    var obj = {
                        name: (student.name) ? student.name : '',
                        email: (student.email) ? student.email : '',
                        created_at: (student.created_at) ? moment(new Date(student.created_at)).format("DD-MM-YYYY hh:mm") : '',
                        user_id : student.user_id ? student.user_id : '',
                        app_id : student.app_id ? student.app_id : null
                    };

                    data.push(obj);
                    callback();
                }, function(){
                    res.json({
                        status: 200,
                        message: 'Student retrive successfully',
                        items: data,
                        total_count: countObjects,
                    });
                });
            } else {
                res.json({
                    status: 400,
                    message: 'Problem in retrieving student list'
                });
            }
                    
        });
    })
       
});

router.get('/getStudentDetails',(req,res,next)=>{
    console.log('/getStudentDetails');
    models.User.findOne({
        where :{
            id : req.query.user_id
        }
    }).then(function(user){
        if(user){
            res.json({
                status : 200,
                data : user
            })
        }else{
            res.json({
                status : 200,
                data : null
            })
        }
    })
})

router.get('/getAllApplications',(req,res,next)=>{
    console.log('/getAllApplications');
    var applicationData = [];
    models.Application.findAll({
        where :{
            user_id : req.query.user_id,
            source_from : 'hsncverification'
        }
    }).then(function(applications){
        if(applications.length> 0){
             require('async').eachSeries(applications, function(app, callback){
                var application ={
                    id : app.id ,
                    tracker : app.tracker,
                    status : app.status,
                    requestedData : []
                }
                if(app.status == 'requested'){
                    models.DocumentDetails.findAll({
                        where:{
                            user_id : app.user_id,
                            app_id : app.id,
                            [op.or]:[{
                                lock_transcript :"requested"
                            },{
                                upload_step : "requested"
                            }]
                        }
                    }).then(function(docDetails){
                        if(docDetails.length > 0){
                            var requestedData = [];
                            docDetails.forEach(doc=>{
                                requestedData.push({
                                    id : doc.id,
                                    courseName : doc.courseName,
                                    semester:doc.semester,
                                    type : doc.type,
                                    upload_step : doc.upload_step,
                                    lock_transcript : doc.lock_transcript
                                })
                            })
                           application.requestedData = requestedData;
                        }  
                        
                    })

                }
                setTimeout(()=>{
                    applicationData.push(application); 
                    callback();
                },1000)
             }, function(){
                res.json({
                    status : 200,
                    data : applicationData
                })
            });
            
            
            
        }
    })
})

router.get('/errataDetails',(req,res,next)=>{
    console.log('/getErrataDetails');
    models.DocumentDetails.findOne({
        where :{
            id : req.query.id
        }
    }).then(function(docDetails){4
        res.json({
            status : 200,
            data : docDetails
        })
    })
})

router.post('/errataDetails',(req,res,next)=>{
    console.log('/errataDetails');
    var documentData = req.body.errataDetails;
    models.DocumentDetails.findOne({
        where :{
            id : documentData.id
        }
    }).then(function(docDetails){
        docDetails.update({
            courseName : documentData.courseName,
            seatNo : documentData.seatNo,
            semester : documentData.semester,
            // selectedpattern : documentData.pattern,
            pattern : documentData.pattern,
            PassingMonthYear : documentData.passingMonthYear,
            convocationDate : documentData.convocationDate,
            convocationNo: documentData.convocationNo,
            transcriptNo :  documentData.transcriptNo,
            resultClass : documentData.result,
            lock_transcript : 'changed'
        }).then(function(updatedDetails){
            if(updatedDetails){
                let user;
                let data;
                if(updatedDetails.user_id != req.user.id){
                    user = models.User.findOne({where:{id : updatedDeatils.user_id}});
                    data = req.user.email + " has been updated educational details of  " + user.marksheetName;
                }else{
                    data = req.user.email + " has been updated educational details";
                }
                models.Activitytracker.create({
                    user_id : req.user.id,
                    activity : "Education Details Update",
                    data : data,
                    application_id : updatedDetails.app_id,
                    source : "hsncverification"
                });
                models.DocumentDetails.findAll({
                    where:{
                        user_id : updatedDetails.user_id,
                        app_id : updatedDetails.app_id
                    }
                }).then(function(documentDetails){
                    var requestedFlag = false;
                    documentDetails.forEach(doc=>{
                        if(doc.lock_transcript == 'requested' || doc.upload_step == 'requested'){
                            requestedFlag = true;                            
                        }
                    })
                    if(requestedFlag == false){
                        models.Application.update({
                            status : 'changed'
                        },{
                            where:{
                                id : updatedDetails.app_id,
                                user_id : updatedDetails.user_id
                            }
                        });
                    }
                    res.json({
                        status : 200,
                        data : updatedDetails
                    })
                })
                
            }
        })
        
    })
})



router.post('/uploadDocument',  (req, res, next) => {
    console.log('POST - agent/uploadDocument');
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    var image;

    var userId = req.query.user_id
    var dir = FILE_LOCATION + "public/upload/documents/" + userId;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    var doc_id = req.query.doc_id;
    var ext;
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, FILE_LOCATION + 'public/upload/documents/' + userId);
        },
        filename: function (req, file, callback) {
            var extension = path.extname(file.originalname)
            var randomString = stringFunctionsService.generateRandomString(10, 'alphabetic')
            var newFileName = randomString.concat(extension);
            image = newFileName;
            callback(null, newFileName);

        }
    });

    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            ext = path.extname(file.originalname)
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.pdf' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PDF') {
                return callback(res.end('Please upload your document in .pdf, .jpeg, .jpg or .png formats only'), null)
            }

            callback(null, true)
        }
    }).single('file');

    upload(req, res, function (err, data) {
        imageLocationToCallClient = image;
        if (ext == '.pdf') {
            fs.readFile(FILE_LOCATION + 'public/upload/documents/' + userId + '/' + image, (err, pdfBuffer) => {
                new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {
                    if (err) {
                        uploadValue = false;
                        ValueUpdateData(uploadValue);
                    } else if (!item) {
                        uploadValue = true;
                        ValueUpdateData(uploadValue);
                    } else if (item.text) { }
                });
            });
        } else {
            uploadValue = true;
            ValueUpdateData(uploadValue);
        }

        function ValueUpdateData(uploadValue) {
            if (uploadValue == true) {
                if (req.query.errata == 'false') {
                    models.DocumentDetails.update(
                        {
                            file: image
                        }, {
                        where: {
                            id: doc_id
                        }
                    }).then(function (documentDetails) {
                        if (documentDetails) {
                            return res.json({
                                status: 200,
                                message: `Upload Completed.`,
                                data: documentDetails
                            });
                        } else {
                            return res.json({
                                status: 400,
                                message: `Error occured in uploading document.`
                            });
                        }
                    })
                } else {
                    models.DocumentDetails.findOne({
                        where: {
                            id: doc_id
                        }
                    }).then(function (documentDetails) {
                        if (documentDetails) {
                            var documentName = documentDetails.type + " " + documentDetails.courseName + " " + documentDetails.semester;
                            documentDetails.update({
                                file: imageLocationToCallClient,
                                upload_step: 'changed'
                            }).then(function (updatedDoc) {
                                const user = models.User.findOne({where:{id: updatedDoc.user_id}})
                                let data1 = req.user.email + " has been re-uploaded doecument of " + documentName;
                                if(user.id != updatedDoc.user_id){
                                    data1 += ' of ' + user.marksheetName;
                                }
                                const activity = "Re-upload document"
                                functions.activitylog(clientIP,req, req.user.id, activity, data1, null);

                                models.DocumentDetails.findAll({
                                    where: {
                                        user_id: userId,
                                        app_id: documentDetails.app_id
                                    }
                                }).then(function (docDetails) {
                                    var requestedFlag = false;
                                    docDetails.forEach(doc => {
                                        if (doc.lock_transcript == 'requested' || doc.upload_step == 'requested') {
                                            requestedFlag = true;
                                        }
                                    })
                                    if (requestedFlag == false) {
                                        models.Application.update({
                                            status: 'changed'
                                        }, {
                                            where: {
                                                id: documentDetails.app_id,
                                                user_id: userId
                                            }
                                        })
                                    }
                                    return res.json({
                                        status: 200,
                                        message: `Upload Completed.`,
                                        data: updatedDoc
                                    });
                                })
                            })
                        } else {
                            return res.json({
                                status: 400,
                                message: `Error occured in uploading document.`
                            });
                        }
                    })
                }
                
            } else if (uploadValue == false) {
                fs.unlink(FILE_LOCATION + 'public/upload/documents/' + userId + '/' + image, function (err) {
                    if (err) {
                        return res.json({
                            status: 400,
                            message: `Error occured in uploading document.`
                        });
                    } else {
                        return res.json({
                            status: 401,
                            message: 'You have uploaded the Password Protected Document. Please Upload correct document.'
                        });
                    }
                });
            }
        }
    });

})

router.post('/deletefile', function (req, res) {
    console.log("/deleteDocument");
    //var type = req.body.fileName
    var doc_id = req.body.doc_id
    models.DocumentDetails.findOne({
        where: {
            id: doc_id,
           // file:type
        }
    }).then(function(filename){
        if(filename){
            filename.update({
                file: null
            }).then(function(deletefile){
                res.json({
                    status:200,
                    data: deletefile
                })
            })
        }
    })
})

router.get('/getSupportiveData', (req, res, next) => {
    console.log("GET - agent/getSupportiveData")
    models.DocumentDetails.findAll({
        where: {
            user_id: req.query.user_id,
            app_id: null,
            type: 'supportive'
        }
    }).then(function (data) {
        res.json({
            status: 200,
            data: data
        });
    }).catch(error => {
        res.json({
            status: 400,
            data: error,
        });
    })
});

router.post('/editStudent', async (req, res) => {
    const studentData = req.body.studentData;
    const user_id = req.body.user_id;
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    try {
        if (user_id) {
            let updateData = await models.User.update({
                name: studentData.firstName,
                surname: studentData.lastName,
                marksheetName: studentData.fullName,
                email: studentData.email.toLowerCase(),
                mobile_country_code: '91',
                mobile: studentData.mobile,
                agent_id: req.user.id
            },
                { where: { id: user_id } });
            if (updateData) {
                const data = `Details of ${studentData.fullName} are edited by ${req.user.email}.`;
                const activity = "Data is Edited";
                functions.activitylog(clientIP,req, req.user.id, activity, data, null)
                res.json({
                    status: 200,
                    data: updateData
                })
            } else {
                res.json({
                    status: 400,
                    msg: "Data mot updated"
                })
            }


        }

    } catch (e) {
        res.json({
            status: 500,
            message: e.message,
        })
    }
})

router.post('/generatepdfform', async (req, res) => {
    console.log("/generatepdfform");

    try {
        var app_id = req.body.app_id;
        var userId = req.body.user_id;
        var noMarksheet;
        var noDegree;
        // var noTranscript;
        var nosealedCover;
        var applicationFor = '';

        var file = [];
        var personalDetails =[];

        var marksheet = [],
        degree = [];

        
        // Fetch user details
        const user = await models.User.findOne({
            where: {
                id: userId
            }
        });

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        personalDetails.push(
            [{ text: 'Personal Details',border: [false, false, false, true], bold: true, colSpan: 2,fontSize:16},{}],
            [{ text: 'Name', bold: true }, { text: ':' + user.marksheetName }],
            [{ text: 'Email Address', bold: true }, { text: ':' + user.email }],
            [{ text: 'Mobile Number', bold: true }, { text: ':' + user.mobile_country_code + '-' + user.mobile }],
            [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
            [{ text: '', bold: true, colSpan: 2 },{}],
            [{ text: '', bold: true, colSpan: 2 },{}],
        )
        // Fetch document details
        const docDetails = await models.DocumentDetails.findAll({
            where: {
                user_id: userId,
                app_id: app_id
            }
        });

        // Fetch verification types
        const verificationType = await models.VerificationTypes.findOne({
            where: {
                user_id: userId
            }
        });

        const application = await models.Application.findOne({
            where:{
                id: app_id
            }
        });

        if (!verificationType) {
            return res.status(404).json({ status: 404, message: 'Verification type not found' });
        }



        if (verificationType.noOfMarksheet) {
            noMarksheet = 'Marksheet(' + verificationType.noOfMarksheet + ')';
        }
        if (verificationType.noOfDegree) {
            noDegree = '+Degree(' + verificationType.noOfDegree + ')';
        }

        // Fetch institute details
        const InstituteDetail = await models.InstituteDetails.findAll({
            where: {
                user_id: userId,
                app_id: app_id
            }
        });

        var markshhe_count = 0;
        var deg_count = 0;
        // var tran_count = 0;

        InstituteDetail.forEach((institute) => {
            var address;
            if(institute.address){
                address = institute.address.filter(add=>(add.app_type == application.app_status));
            }
            if (institute.type == 'marksheet') {
                markshhe_count++;
                if (institute.deliveryOption == 'Physical') {
                    marksheet.push(
                        [{ text: 'Institute Details ' + markshhe_count, bold: true, colSpan: 2 },{}],
                        [{ text: 'Refernce No.'}, { text: ':' + institute.referenceNo }],
                        [{ text: 'Name '}, { text: ':' + institute.name }],
                        [{ text: 'Address ' },{ text: ':' + (address) ? address[0].address : ''}],
                        [{ text: 'Email '}, { text: ':' + institute.email }],
                        [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
                    )
                } else if (institute.deliveryOption == 'Digital') {
                    marksheet.push(
                        [{ text: 'Institute Details ' + markshhe_count, bold: true, colSpan: 2 },{}],
                        [{ text: 'Refernce No.'}, { text: ':' + institute.referenceNo }],
                        [{ text: 'Name '}, { text: ':' + institute.name }],
                        [{ text: 'Address ' },{ text: ':' + (address) ? address[0].address : ''}],
                        [{ text: 'Email '}, { text: ':' + institute.email }],
                        [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}]
                    )
                }
            }
            if (institute.type == 'degree') {
                deg_count++;
                if (institute.deliveryOption == 'Physical') {
                    degree.push(
                        [{ text: 'Institute Details ' + deg_count, bold: true, colSpan: 2 },{}],
                        [{ text: 'Refernce No.'}, { text: ':' + institute.referenceNo }],
                        [{ text: 'Name '}, { text: ':' + institute.name }],
                        [{ text: 'Address ' },{ text: ':' + (address) ? address[0].address : ''}],
                        [{ text: 'Email '}, { text: ':' + institute.email }],
                        [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
                    );
                } else if (institute.deliveryOption == 'Digital') {
                    degree.push(
                        [{ text: 'Institute Details ' + deg_count, bold: true, colSpan: 2 },{}],
                        [{ text: 'Refernce No.'}, { text: ':' + institute.referenceNo }],
                        [{ text: 'Name '}, { text: ':' + institute.name }],
                        [{ text: 'Address ' },{ text: ':' + (address) ? address[0].address : ''}],
                        [{ text: 'Email '}, { text: ':' + institute.email }],
                        [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
                    );
                }
            }
        });

        var mark_count = 0;
        var degree_count = 0;
        var fileu = 0;

        if(verificationType.marksheet == true){
            marksheet.push(
                [{ text: '', bold: true, colSpan: 2 },{}],
                [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
                [{ text: 'Educational Details',border: [false, false, false, true], bold: true, colSpan: 2, fontSize:11},{}],
            );
        }
        if(verificationType.degreeCertificate == true){
            degree.push( 
             [{ text: '', bold: true, colSpan: 2 },{}],
             [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
             [{ text: 'Educational Details',border: [false, false, false, true], bold: true, colSpan: 2,fontSize:11 },{}],
            );
        }

        docDetails.forEach(document => {
            fileu++;
            if (document.type == 'marksheet') {
                file.push(
                    [{ text: fileu + '                   :' + document.courseName + ' ' + document.semester + ' ' + document.type }],
                );
            } else if (document.type == 'degree') {
                file.push(
                    [{ text: fileu + '                   :' + document.courseName + '  ' + document.type }],
                );
            }

            if (document.type == 'marksheet') {
                mark_count++;
                var date = moment(new Date(document.PassingMonthYear)).format("YYYY-MM")
                marksheet.push(
                    [{ text: 'Education Details' + mark_count,bold: true }, {}],
                    [{ text: 'Degree / Course ' }, { text: ':' + document.courseName +'(' + document.courseType + ')' }],
                    [{ text: 'Year/Semester ' }, { text: ':' + document.semester }],
                    [{ text: 'Seat Number '}, { text: ':' + document.seatNo }],
                    [{ text: 'Month-Year '}, { text: ':' + date }],
                    [{ text: 'SGPI '}, { text: ':' + document.SGPI }],
                    [{ text: 'Grade '}, { text: ':' + document.grade }],
                    [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
                )
            } else if (document.type == 'degree') {
                degree_count++;
                var date = moment(new Date(document.PassingMonthYear)).format("YYYY-MM")
                var Convocationdate = moment(new Date(document.convocationDate)).format("DD-MM-YYYY")
                degree.push(
                    [{ text: 'Education Details' + degree_count,bold: true }, {}],
                    [{text:'Degree / Course '},{text:':'+document.courseName}],
                    [{text:'Last Year Seat Number '},{text:':'+document.seatNo}],
                    [{text:'Result Class '},{text:':'+document.resultClass}],
                    [{text:'Month-Year '},{text:':'+ date}],
                    [{text:'Convocation Date '},{text:':'+Convocationdate}],
                    [{ text: 'Convocation Number ' + degree_count }, { text: ':' + document.convocationNo }],
                    [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
                )
                
            }
        });

        var getorder = await functions.getorderdetails(app_id);
        var statuspayment = getorder[0]['status'] == '1' ? 'Success' : 'Payment Failed';

        // self_PDF.applicationForm(marksheet, degree, transcript, file, userId, noMarksheet ? noMarksheet : '', noDegree ? noDegree : '', noTranscript ? noTranscript : '', nosealedCover ? nosealedCover : '', app_id, secondyear, getorder, statuspayment, function (err) {
            self_PDF.applicationForm(marksheet, degree, file, userId, noMarksheet ? noMarksheet : '', noDegree ? noDegree : '', nosealedCover ? nosealedCover : '', app_id, getorder, statuspayment, personalDetails, function (err) {
            if (err) {
                return res.status(400).json({ status: 400, message: 'Files cannot be merged' });
            } else {
                setTimeout(() => {
                    var fileUrl = app_id + "_ApplicationForm.pdf";
                    res.json({ status: 200, data: fileUrl });
                }, 3000);
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
});


module.exports = router;

