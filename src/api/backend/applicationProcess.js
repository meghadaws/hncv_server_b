const express = require('express');
const router = express.Router();
const config = require('config');
var path = require('path');
var root_path = path.dirname(require.main.filename);
var models = require(root_path + '/models');
var moment = require("moment");
const multer = require('multer');
var fs = require('fs');
var pdfreader = require('pdfreader');
const { FILE_LOCATION } = config.get('path');
const { serverUrl, clientUrl } = config.get('api');
var Moment = require('moment-timezone');
const { Sequelize } = require('sequelize');
const op = Sequelize.Op;
const stringFunctionsService = require('../../utils/stringFunctionsService');
var romans = require('romans');
var converter = require('number-to-words');
var functions= require('./function')
var self_PDF = require('./invoiceTemplate');
var qs = require('querystring');

router.get('/VerificationTypes', (req, res, next) => {
    models.VerificationTypes.findOne({
        where :{
            user_id : req.user.id,
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
            user_id : req.user.id,
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
                    if(verificationData.sealedCover == null){
                        if(limit > 1){
                            req.body.verificationData.forEach(verificationData=>{
                                if(verificationData.type == "marksheet"){
                                    models.InstituteDetails.deleteOthers(req.user.id,'marksheet',limit);
                                }
                                // if(verificationData.type == "transcript"){
                                //     models.InstituteDetails.deleteOthers(req.user.id,'transcript',limit);
                                // }
                                if(verificationData.type == "degree"){
                                    models.InstituteDetails.deleteOthers(req.user.id,'degree',limit);
                                }
                            })
                        }
                        models.InstituteDetails.removeEmailOrAddress(req.user.id,'address').then(function(changedInstitute){
                            res.json({
                                status : 200,
                                data : updatedDetails
                            })
                        })

                    }else{
                        models.InstituteDetails.removeEmailOrAddress(req.user.id,'email').then(function(changedInstitute){
                            res.json({
                                status : 200,
                                data : updatedDetails
                            })
                        })
                    }
                    
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
                user_id : req.user.id
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

router.get('/courses',(req,res,next)=>{
    if(req.query.college == ''){
        models.Program_List.findAll({
            order:[
                ['course_name','ASC']
            ],
            attributes:[    
                [Sequelize.fn('DISTINCT',Sequelize.col('course_name')),'name'],
                'duration'
            ]
        }).then(courses=>{
        res.json({
                status : 200,
                data : courses
            })
        })
    }else{
        models.Program_List.findAll({
            order:[
                ['course_name','ASC']
            ],
            attributes:[    
                [Sequelize.fn('DISTINCT',Sequelize.col('course_name')),'name'],
                'duration'
            ]
        }).then(courses=>{
        res.json({
                status : 200,
                data : courses
            })
        })
    }
})

router.get('/colleges',(req,res,next)=>{
    models.College.findAll({
        order:[
            ['name','ASC']
        ],
        attributes:[    
            [Sequelize.fn('DISTINCT',Sequelize.col('name')),'name']
        ]
    }).then(courses=>{
       res.json({
            status : 200,
            data : courses
        })
    })
})

router.get("/courseDetails", async (req, res, next) => {
    console.log("/courseDetails");
    try {
        const decodedCourseName = decodeURIComponent(req.query.course);
        let courses = await models.Program_List.findAll({
            where: {
                course_name: decodedCourseName,
            }
        });
        if (courses) {
            var duration = courses[0].duration;
            var patternArr = [];
            if (req.query.pattern == "Annual") {
                for (var i = 1; i <= duration; i++) {
                    var number = converter.toWordsOrdinal(i);
                    var number =
                        number.charAt(0).toUpperCase() + number.slice(1).toLowerCase();
                    patternArr.push({
                        term_name: number + " Year",
                    });
                }
                
            } else if (req.query.pattern == "Semester") {
                duration = duration * 2;
                for (var i = 1; i <= duration; i++) {
                    var sem = romans.romanize(i);
                    patternArr.push({
                        term_name: "Semester " + sem,
                    });
                }
                
            }
            res.json({
                status: 200,
                data: patternArr,
            });
        }
    } catch (err) {
        res.status(500).json({
            status: 500,
            message: "Internal server error",
        });
    }
});


router.post('/documentDetails', (req, res, next) => {
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
                user_id : req.user.id,
                type : documentType,
                course_name : documentData.courseName.replace(/[&\/\\#+()$~%'":*?<>{}-\s]/g, '_'),
                grade : documentData.grade
        
            }).then(documentDetails =>{
                const data1 = `${req.user.email}has been Updated and Saved Details.`;
                const activity = "Update and Save Details";
                functions.activitylog(clientIP,req,req.user.id,activity,data1,null);
                res.json({
                    status : 200,
                    data : documentDetails
                })
            }).catch(e=>{
            })
        }).catch(e=>{
        })
    }else{
        models.DocumentDetails.create({
                courseName : documentData.courseName,
                courseType : documentData.courseType,
                seatNo : documentData.seatNo,
                PassingMonthYear : documentData.passingMonthYear,
                // PassingMonthYear: (documentData.PassingMonthYear) ? (moment(new Date(documentData.PassingMonthYear)).format('YYYY-MM-DD')) : null,

                semester : documentData.semester,
                convocationDate: (documentData.convocationDate) ? (moment(new Date(documentData.convocationDate)).format('YYYY-MM-DD')) : null,
                // convocationDate : documentData.convocationDate,
                transcriptNo : documentData.transcriptNo,
                convocationNo : documentData.convocationNo,
                resultClass : documentData.result,
                SGPI : documentData.sgpi,
                user_id : req.user.id,
                type : documentType,
                course_name : documentData.courseName.replace(/[&\/\\#+()$~%'":*?<>{}-\s]/g, '_'),
                grade : documentData.grade

            }).then(documentDetails =>{
                const data1 = `${req.user.email}has been Saved Details.`;
                const activity = "Save Details";
                functions.activitylog(clientIP,req,req.user.id,activity,data1,null);
                res.json({
                    status : 200,
                    data : documentDetails
                })
            }).catch(e=>{
            })
    }
})

router.get('/validateDocumentDetails',(req, res, next) => {
    var validateData = {marksheet : false,  degreeCertificate :false};
    var noOfCopies = 1;
    if(req.query.type == 'documents'){
        models.VerificationTypes.findOne({
            where:{
                user_id : req.user.id,
                app_id : null,
            }
        }).then(function(types){
            let documentPromise = new Promise(function(resolve, reject){
                if(types){
                    if(types.marksheet == true){
                        models.DocumentDetails.findAll({
                            where:{
                                user_id : req.user.id,
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
                                user_id : req.user.id,
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
                user_id : req.user.id,
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
                                user_id : req.user.id,
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
                                user_id : req.user.id,
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
    var documentData = [];
    models.DocumentDetails.findAll({
        where :{
            user_id : req.user.id,
            app_id : null,
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


router.post('/uploadDocument',(req,res,next)=>{
    var image;
    var userId = req.user.id
    var dir = FILE_LOCATION + "public/upload/documents/" + userId; 
    if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}
    var doc_id = req.query.doc_id;
    var ext;
    var storage = multer.diskStorage({
		destination: function(req, file, callback) {
			callback(null, FILE_LOCATION+'public/upload/documents/'+userId);
		},
		filename: function(req, file, callback) {
			var extension = path.extname(file.originalname)
			var randomString = stringFunctionsService.generateRandomString(10,'alphabetic')
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
			fs.readFile(FILE_LOCATION +'public/upload/documents/' + userId + '/' + image, (err, pdfBuffer) => {
			    new pdfreader.PdfReader().parseBuffer(pdfBuffer, function (err, item) {
					if (err) {
						uploadValue = false;
						ValueUpdateData(uploadValue);
					} else if (!item) {
						uploadValue = true;
						ValueUpdateData(uploadValue);
					} else if (item.text) {}
				});
			});
		} else {
			uploadValue = true;
			ValueUpdateData(uploadValue);
		}

		function ValueUpdateData(uploadValue) {
			if (uploadValue == true) {
                if (req.query.type == 'supportive') {
                    models.DocumentDetails.findOne({
                        where: {
                            user_id: userId,
                            app_id: null
                        }
                    }).then(function (document) {
                        models.DocumentDetails.create({
                            courseName:req.query.courseName,
                            user_id: req.query.userId,
                            semester: req.query.semester,
                            type: req.query.type,
                            file: image
                        }).then(function(documentDetails) {
                            res.json({
                                status:200,
                                message :"File Uploaded Successfully",
                                data:documentDetails
                            })
                        }).catch(err=>{
                        })
                    }).catch(err => {
                    })
                } else{
                    models.DocumentDetails.update(
                        {
                            file : image
                        },{
                        where:{
                            id : doc_id
                        }
                    }).then(function(documentDetails){
                        if (documentDetails) {
                            return res.json({
                                status: 200,
                                message: `Upload Completed.`,
                                data : documentDetails
                            });
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

router.get('/getFileDetails', (req, res, next)=> {
	var file_name = req.query.file;
    var user_id = req.query.user_id;
    var fileDetails = {};
    models.DocumentDetails.findOne({
        where:{
            user_id : user_id,
            file : file_name,
            app_id : null
        }
    }).then(function(documents){
        var extension = documents.file.split('.');
        fileDetails = {
            extension : extension[1],
            src : serverUrl + 'upload/documents/' + user_id + '/' + documents.file
            // src : serverUrl + 'public/upload/documents/' + user_id + '/' + documents.file
        }

        res.json({
            status : 200,
            data : fileDetails
        })
    })
})

router.get('/institutionalDetails',(req,res,next)=>{
    var user_id = req.user.id;
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
    var user_id = req.user.id;
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
            const data1 = `${req.user.email} has been Updated and  saved instituteDetails.`;
                const activity = "Updated and Save instituteDetails";
                functions.activitylog(clientIP,req,user_id,activity,data1,null);
                res.json({
                    status : 200
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
            const data1 = `${req.user.email} has been saved instituteDetails.`;
            const activity = "Save instituteDetails";
            functions.activitylog(clientIP,req,user_id,activity,data1,null);
            res.json({
                status : 200
            })
        }else{
            res.json({
                status : 400
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
    var user_id = req.user.id;
    var previewData ={
        personalDetails : {},
        verificationDetails :{},
        marksheetDetails :[],
       // transcriptDetails : [],
        degreeDetails :[],
        deliveryOptions:{},
        marksheetInstitute : [],
       // transcriptInstitute :[],
        degreeInstitute : [],
    }
      
    models.User.findOne({
        where :{
            id : user_id
        }
    }).then(function(user){
        previewData.personalDetails = {
            name : user.name,
            email : user.email,
            mobile : user.mobile_country_code + '-' + user.mobile,
            marksheetName : user.marksheetName
        } 
        models.VerificationTypes.findOne({
            where :{
                user_id : req.user.id,
                app_id : null
            }
        }).then(function(verificationTypes){
            previewData.verificationDetails = verificationTypes;
            models.DocumentDetails.findAll({
                where :{
                    user_id : req.user.id,
                    app_id : null
                }
            }).then(function(documentDetails){
                documentDetails.forEach(document=>{
                    var extension = document.file ? document.file.split('.') : null;
                    if(document.type == 'marksheet'){
                        previewData.marksheetDetails.push({
                            courseName : document.courseName,
                            courseType : document.courseType,
                            seatNo : document.seatNo,
                            semester : document.semester,
                            result : document.resultClass,
                            sgpi: document.SGPI,
                            passingMonthYear : moment(new Date(document.PassingMonthYear)).format('MMM YYYY'),
                            fileName : document.file,
                            fileSrc : serverUrl + 'upload/documents/' + user_id + '/' + document.file,
                            fileExtension : extension ? extension[1] : null,
                        })
                    // }else if(document.type == 'transcript'){
                    //     previewData.transcriptDetails.push({
                    //         courseName : document.courseName,
                    //         seatNo : document.seatNo,
                    //         transcriptNo :document.transcriptNo,
                    //         passingMonthYear : moment(new Date(document.PassingMonthYear)).format('MMM YYYY'),
                    //         fileName : document.file,
                    //         fileSrc : serverUrl + 'upload/documents/' + user_id + '/' + document.file,
                    //         fileExtension : extension ? extension[1] : null,
                    //     })
                    }else if(document.type == 'degree'){
                        previewData.degreeDetails.push({
                            courseName : document.courseName,
                            courseType : document.courseType,
                            seatNo : document.seatNo,
                            passingMonthYear : moment(new Date(document.PassingMonthYear)).format('MMM YYYY'),
                            convocationDate : moment(new Date(document.convocationDate)).format('DD/MM/YYYY'),
                            convocationNo: document.convocationNo,
                            result : document.resultClass,
                            fileName : document.file,
                            fileSrc : serverUrl + 'upload/documents/' + user_id + '/' + document.file,
                            fileExtension : extension ? extension[1] : null,
                        })
                    }
                })

                models.InstituteDetails.findAll({
                    where :{
                        user_id : req.user.id,
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
                               address =  institute.address.filter(add=>(add.app_type === 'new'));
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
    var total_amount = 2108;
    models.User.findOne({
        where:{
            id  :req.user.id
        }
    }).then(function(user){

        // models.VerificationTypes.findOne({
        //     where:{
        //         user_id : req.user.id,
        //         app_id : null
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
        //})
    })
});


// router.get('/checkStepper',(req,res,next)=>{
//     var user_id = req.user.id;
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
//                                         var uploadedTotal = documentDetails.length ;
//                                         if (uploadedTotal == total && docDetails.length != 0) {
//                                             obj['tab2'] = true;
//                                             callback(null, documentDetails);
//                                         } else {
//                                                 obj['tab2'] = false;
//                                             callback(null, documentDetails);
//                                         }
//                                     }).catch(e=>{
//                                     })                              
//                                 }).catch(error=>{
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
//                                         var uploadedTotal = documentDetails.length;
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
//                                         var uploadedTotal = parseInt(documentDetails.length + degreeDetails.length );
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
    var user_id = req.user.id;
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
                        if(verificationTypes.noOfMarksheet != null && verificationTypes.noOfDegree != null ){
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
                                    var total = verificationTypes.noOfMarksheet + verificationTypes.noOfDegree;
                                    var uploadedTotal = documentDetails.length ;
                                    if (uploadedTotal == total) {
                                        obj['tab2'] = true;
                                        callback(null, documentDetails);
                                    } else {
                                            obj['tab2'] = false;
                                        callback(null, documentDetails);
                                    }
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
                                    var uploadedTotal = parseInt(documentDetails.length  );
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
                            if(verificationTypes.marksheet == true  && verificationTypes.degreeCertificate == true){
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
            user_id : req.user.id,         
            source_from : 'hsncverification'

        }
    }).then(function(applications){
        if(applications.length> 0){
             require('async').eachSeries(applications, function(app, callback){
                var application ={
                    id : app.id ,
                    application_date : moment(new Date(app.created_at)).format('DD-MM-YYYY'), 
                    user_id : req.user.id,
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

// router.post('/generatepdfform',
//     async (req,res)=>{
//     console.log("/generatepdfform");
    
//     var app_id  = req.body.app_id;
//     var userId  = req.user.id;
//     var noMarksheet;
//     var noDegree;
//     // var noTranscript;
//     var nosealedCover;

//     file=[],

//     marksheet = {
//         personalDetails:[],
//         eduDetails:[],
//         noOfMarksheet:[]
           
//     }
//     degree = {
//         personalDetails:[],
//         eduDetails:[],
//         noOfdegree:[]
    
//     }
//     // transcript = {
//     //     personalDetails:[],
//     //     eduDetails:[],
//     //     noOfTranscript:[]
//     // }
//     secondyear = {
//         personalDetails:[],
//         eduDetails:[],
        
//     }

//     //Marksheet Data
//     models.User.findOne({
//         where: {
//             id: userId
//         }
//     }).then(function (user) {

//         models.DocumentDetails.findAll({
//             where: {
//                 user_id: userId,
//                 app_id : app_id
//                 // type : 'marksheet'
//             }
//         }).then(function (docDetails) {
            
//              models.VerificationTypes.findOne({
//                     where : {
//                         user_id : userId
//                     }
//                 }).then(function(verificationType) {
//                     if(verificationType.noOfMarksheet != '' && verificationType.noOfMarksheet != null && verificationType.noOfMarksheet != undefined && verificationType.noOfMarksheet != 'null' ){
//                          noMarksheet='Martsheet('+verificationType.noOfMarksheet+')'
//                     }
//                     if(verificationType.noOfDegree != '' && verificationType.noOfDegree != null && verificationType.noOfDegree != undefined && verificationType.noOfDegree != 'undefined' && verificationType.noOfDegree != 'null' ){
//                         noDegree='+Degree('+verificationType.noOfDegree+')'
//                     }
//                     // if(verificationType.noOfTranscript != '' && verificationType.noOfTranscript != null && verificationType.noOfTranscript != undefined && verificationType.noOfTranscript != 'null' ){
//                     //     noTranscript='+Transcript('+verificationType.noOfTranscript+')'
//                     // }
                    
//                     if(verificationType.marksheet === true){
//                         marksheet.personalDetails.push(
//                             //[{text:'Marksheet Verification Details',bold:true,colSpan:2,fontSize:16},{}],
//                             //[{ text: '',bold: true, colSpan: 2 },{}],
//                             [{ text: 'Personal Details', bold: true, colSpan: 2,fontSize:11 ,border: [false, false, false, true],},{}],
//                             [{ text: 'Name', bold: true }, { text: ':' + user.name }],
//                             [{ text: 'Email ID', bold: true }, { text: ':' + user.email }],
//                             [{ text: 'Mobile No', bold: true }, { text: ':' + user.mobile }],
//                             [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
//                             [{text:'Marksheet Verification Details',bold:true,colSpan:2,fontSize:16},{}],
//                             [{ text: '',bold: true, colSpan: 2 },{}],
//                             [{ text: 'Institute/ Agency/ Company', bold: true, colSpan: 2,fontSize:11 ,border: [false, false, false, true],},{}],
                            

//                         )                         
//                     }
//                     if(verificationType.degreeCertificate === true){ 
//                         degree.personalDetails.push(
//                             [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
//                             [{text:'Degree Certificate Details',bold:true,colSpan:2,fontSize:16},{}],
//                             [{ text: '',bold: true, colSpan: 2 },{}],
//                             // [{ text: 'Personal Details', bold: true, colSpan: 2,fontSize:11,border: [false, false, false, true], },{}],
//                             // [{ text: 'Email ID', bold: true }, { text: ':' + user.email}],
//                             // [{ text: 'Mobile No', bold: true }, { text: ':' + user.mobile }],
//                             [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
//                             [{ text: 'Institute/ Agency/ Company', bold: true, colSpan: 2,fontSize:11 ,border: [false, false, false, true],},{}],

//                         )
//                     } 
//                     // if(verificationType.transcript === true){ 
//                     //     transcript.personalDetails.push(
//                     //     [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
//                     //     [{text:'Transcript Verification Details',bold:true,colSpan:2,fontSize:16},{}],
//                     //     [{ text: '',bold: true, colSpan: 2 },{}],
//                     //     // [{ text: 'Personal Details', bold: true, colSpan: 2,fontSize:11 ,border: [false, false, false, true],},{}],
//                     //     // [{ text: 'Email ID', bold: true }, { text: ':' + user.email}],
//                     //     // [{ text: 'Mobile No', bold: true }, { text: ':' + user.mobile }],
//                     //     [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
//                     //     [{ text: 'Institute/ Agency/ Company', bold: true, colSpan: 2,fontSize:11 ,border: [false, false, false, true],},{}],

//                     // )
//                     //    } 
                    
//             models.InstituteDetails.findAll({
//                 where: {
//                     user_id: userId,
//                     app_id : app_id
//                 }
//             }).then(async function (InstituteDetail) {
//                 var markshhe_count = 0;
//                 var deg_count = 0;
//                 var tran_count = 0;
//             InstituteDetail.forEach((institute_detail)=>{
//                 if(institute_detail.type == 'marksheet'){
         
//                     markshhe_count++;
//                     if(institute_detail.deliveryOption == 'Physical'){
                        
//                         marksheet.personalDetails.push(
//                              [{ text: 'Institute Ref. No. '+markshhe_count }, { text: ':' + institute_detail.referenceNo }],
//                              [{ text: 'Institute Name '+markshhe_count }, { text: ':' + institute_detail.name }],
//                              [{ text: 'Institute Address '+ markshhe_count }, { text: ':' + institute_detail.address }],
                             
//                         )
//                     }else if(institute_detail.deliveryOption == 'Digital'){
//                         marksheet.personalDetails.push(
                        
//                              [{ text: 'Institute Ref. No. '+markshhe_count  }, { text: ':' + institute_detail.referenceNo }],
//                              [{ text: 'Institute Name '+markshhe_count }, { text: ':' + institute_detail.name }],
//                              [{ text: 'Institute Address '+markshhe_count }, { text: ':' + institute_detail.address }],
//                              [{ text: 'Institute Email '+markshhe_count }, { text: ':' + institute_detail.email }],
//                              [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}]
//                         )
                    
//             }       
//                 } if(institute_detail.type == 'degree'){
//                     deg_count++;
//                     if(institute_detail.deliveryOption == 'Physical'){
//                         degree.personalDetails.push(
//                              [{ text: 'Institute Ref. No. ' +deg_count }, { text: ':' + institute_detail.referenceNo }],
//                              [{ text: 'Institute Name ' +deg_count}, { text: ':' + institute_detail.name }],
//                              [{ text: 'Institute Address '+deg_count }, { text: ':' + institute_detail.address}],
//                         )
//                         }else if(institute_detail.deliveryOption == 'Digital'){
//                             degree.personalDetails.push(
//                                  [{ text: 'Institute Ref. No. '+deg_count }, { text: ':' + institute_detail.referenceNo }],
//                                  [{ text: 'Institute Name ' +deg_count}, { text: ':' + institute_detail.name }],
//                                  [{ text: 'Institute Address ' +deg_count}, { text: ':' + institute_detail.address }],
//                                  [{ text: 'Institute Email '+deg_count  }, { text: ':' + institute_detail.email}],
//                             )
//                         }
                    
//                 } 
//                 // if(institute_detail.type == 'transcript'){
//                 //     tran_count++;
//                 //    if(institute_detail.deliveryOption == 'Physical'){
//                 //         transcript.personalDetails.push(
//                 //              [{ text: 'Institute Ref. No.'+tran_count  }, { text: ':' + institute_detail.referenceNo }],
//                 //              [{ text: 'Institute Name '+tran_count  }, { text: ':' + institute_detail.name }],
//                 //              [{ text: 'Institute Address. '+tran_count }, { text: ':' + institute_detail.address}],
//                 //         )
                    
//                 //         }else if(institute_detail.deliveryOption == 'Digital'){
//                 //             transcript.personalDetails.push(
//                 //                  [{ text: 'Institute Ref. No. '+tran_count }, { text: ':' + institute_detail.referenceNo }],
//                 //                  [{ text: 'Institute Name ' +tran_count }, { text: ':' + institute_detail.name }],
//                 //                  [{ text: 'Institute Address. '+tran_count }, { text: ':' + institute_detail.address}],
//                 //                  [{ text: 'Institute Email. ' +tran_count}, { text: ':' + institute_detail.email}],
//                 //             )
//                 //         }
//                 // }
                

            
//             })
//             var mark_count = 0;
//             var degree_count = 0;
//           //  var trans_count = 0;
//             var fileu=0;
//             docDetails.forEach(document => {
//             fileu++;
//                 if(document.type == 'marksheet'){
                    
//                 file.push(
//                     [{ text: fileu+'                   :' + document.courseName+' '+document.semester+' '+document.type }],
//                 )
//                 }else if(document.type == 'degree'){
//                     file.push(
//                         [{ text: fileu+'                   :' + document.courseName+'  '+document.type }],
//                     )
//                 }
               
                
//                 if(document.type == 'marksheet'){
//                     if( marksheet.eduDetails.length == 0){
//                         marksheet.eduDetails.push(
//                             [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
//                             [{ text: 'Educational Details',border: [false, false, false, true], bold: true, colSpan: 2 },{}])
//                     }
//                     mark_count++;
//                     var date = moment(new Date(document.PassingMonthYear)).format("YYYY-MM")

//                     marksheet.eduDetails.push(
//                     [{ text: 'Degree / Course ' + mark_count }, { text: ':' + document.courseName }],
//                     [{ text: 'Student Name ' + mark_count }, { text: ':' + user.marksheetName }],
//                     [{ text: 'Seat Number ' + mark_count }, { text: ':' + document.seatNo }],
//                     [{ text: 'Month-Year ' + mark_count }, { text: ':' + date }],
//                     [{ text: 'Result Class ' + mark_count }, { text: ':' + document.resultClass }],
            
//                     )
                

//                 }else if(document.type == 'degree'){
//                     degree_count++;
//                     if( degree.eduDetails.length == 0){
//                         degree.eduDetails.push(
//                             [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
//                             [{ text: 'Educational Details',border: [false, false, false, true], bold: true, colSpan: 2 },{}])
//                     }
//                     var date = moment(new Date(document.PassingMonthYear)).format("YYYY-MM ")
//                     var Convocationdate= moment(new Date(document.convocationDate)).format("YYYY-MM-DD")

//                     degree.eduDetails.push(
//                         [{text:'Degree / Course '+degree_count},{text:':'+document.courseName}],
//                         [{text:'Student Name '+degree_count},{text:':'+user.marksheetName}],
//                         [{text:'Last Year Seat Number '+degree_count},{text:':'+document.seatNo}],
//                         [{text:'Result Class '+degree_count},{text:':'+document.resultClass}],
//                         [{text:'Month-Year '+degree_count},{text:':'+ date}],
//                         [{text:'Convocation Date '+degree_count},{text:':'+Convocationdate}],
//                         [{text:'Convocation Number '+degree_count},{text:':'+document.convocationNo}],
                        
//                     )
                  
                
//                  }//else if(document.type == 'transcript'){
//                 //     trans_count++;
//                 //     if( transcript.eduDetails.length == 0){
//                 //         transcript.eduDetails.push(
//                 //             [{ text: '',border: [false, false, false, true], bold: true, colSpan: 2 },{}],
//                 //             [{ text: 'Educational Details',border: [false, false, false, true], bold: true, colSpan: 2 },{}])
//                 //     }
//                 //     var date = moment(new Date(document.PassingMonthYear)).format("YYYY-MM")
//                 //     transcript.eduDetails.push(
//                 //         [{ text: 'Degree / Course ' + trans_count }, { text: ':' + document.courseName }],
//                 //         [{ text: 'Student Name ' + trans_count }, { text: ':' + user.marksheetName }],
//                 //         [{ text: 'Seat Number ' + trans_count }, { text: ':' + document.seatNo }],
//                 //         [{ text: 'Month-Year ' + trans_count }, { text: ':' + date}],
//                 //         [{ text: 'Transcript No ' + trans_count }, { text: ':' + document.transcriptNo}],
                    
//                 //     )
//                 //}
//         })
//         var getorder = await functions.getorderdetails(app_id)
//         if(getorder[0]['status'] == '1'){
//             statuspayment ='Success';
//         }else{
//             statuspayment='Payment Failed'
//         }
//                 self_PDF.applicationForm(marksheet,degree,transcript,file,userId,noMarksheet? noMarksheet:'',noDegree? noDegree :  '',noTranscript? noTranscript:'',nosealedCover? nosealedCover:'',app_id,secondyear,getorder,statuspayment,function(err){
//                     if(err){
//                         return res.json({
//                             status : 400,
//                             message : 'Files cannot merged'
//                         })
//                     }else{
//                         setTimeout(()=>{
//                             var fileUrl = app_id + "_ApplicationForm.pdf"
//                             res.json({
//                                 status : 200,
//                                 data : fileUrl
//                             })
//                         },3000)
//                     }
//                 });
            
//             })
//         })
//     })
//     }) 
    
   
// })

// generateSerial number 


router.post('/generatepdfform', async (req, res) => {
    console.log("/generatepdfform");

    try {
        var app_id = req.body.app_id;
        var userId = req.user.id;
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

router.get('/generateSerialNumbers', function (req, res) {
    console.log('/generateSerialNumbers')
    var user_id = req.query.user_id;
    var app_id = req.query.app_id;
    models.Application.findOne({
        where :{
            id : app_id
        }
    }).then(function(application){
        models.VerificationTypes.findOne({
                where :{
                    user_id : user_id,
                    app_id : app_id
                }
            }).then(function(verification){
            var randomNumber = 100000 + parseInt(app_id);
            var currentYear = Moment(new Date(application.created_at)).format('YYYY');
            if(verification.marksheet == true || verification.degreeCertificate == true){
                models.MDT_User_Enrollment_Detail.getListLastData(currentYear).then(function(lastData){
                    var enrollment_no;
                    if(lastData.length > 0){
                        enrollment_no = parseInt(lastData[0].enrollment_no) + 1;
                    }else{
                        enrollment_no = 1;
                       
                    }

                    models.MDT_User_Enrollment_Detail.create({
                        enrollment_no: enrollment_no,
                        application_date: Moment(new Date (application.created_at)).format('YYYY-MM-DD'),
                        user_id :user_id,
                        application_id : app_id,
                       // randomNumber : randomNumber
                    });
                })
                
            }

            res.json({status : 200})
        })
    })
})

// merge document

router.get('/mergedocument',(req,res,next)=>{
    console.log('/mergedocument');
    var app_id = req.query.app_id;
    var userId = req.query.userId;
    var uploaddocument = [];
    var mergeAllUserDocuments = '';
    models.DocumentDetails.findAll({
        where :{
            user_id : userId
        }
    }).then( function(documentDetails){
        documentDetails.forEach(document =>{
            var name = document.file;
            var split1 = name.split('.');
            var exte = split1.pop();
            var file = split1[0];
            var signedfile_doc = FILE_LOCATION + "public/upload/documents/" + document.user_id + "/" + document.file;
   
            if ((exte == "jpg" || exte == "jpeg" || exte == "png" || exte == "JPG" || exte == "JPEG" || exte == "PNG" ) && fs.existsSync(signedfile_doc)) {
                var outputfile = FILE_LOCATION + "public/upload/documents/" + document.user_id + "/" + file + ".pdf";
                setTimeout(() => {
                    self_PDF.img2pdf(imgTopdf, outputfile)
                }, 2000);
                mergeAllUserDocuments = mergeAllUserDocuments +' "'+ FILE_LOCATION + 'public/upload/documents/' + document.user_id + '/' + file + '.pdf"';
            } else if (fs.existsSync(signedfile_doc)) {
                mergeAllUserDocuments = mergeAllUserDocuments +' "'+ FILE_LOCATION+ 'public/upload/documents/' + document.user_id + '/' + file + '.pdf"'; 
            }
        })
        var files = ' "'+FILE_LOCATION + 'public/upload/documents/' + userId + '/' + app_id + "_ApplicationForm.pdf"+'"'

        setTimeout(() => {
            self_PDF.merge(app_id,userId,files,mergeAllUserDocuments,function(err){
                if(err){
                    return res.json({
                        status : 400,
                        message : 'Files cannot merged'
                    })
                }else{
                    var fileUrl = FILE_LOCATION +"public/upload/documents/" + userId +"/" + app_id + "_Documents.pdf"
                    res.json({
                        status : 200,
                        data : fileUrl
                    })
                }
            });
        }, 5000);
    })
})

// payment receipt

router.post('/paymentreceipt',async (req,res)=>{
    console.log("/paymentreceipt");
    var app_id  = req.body.app_id;
    var userId  = req.user.id;
    var noMarksheet;
    var noDegree;
    var noTranscript;
    var nosealedCover;

    file=[],

    marksheet = {
        personalDetails:[],
        eduDetails:[],
        noOfMarksheet:[]         
    }
    degree = {
        personalDetails:[],
        eduDetails:[],
        noOfdegree:[]
    }
    // transcript = {
    //     personalDetails:[],
    //     eduDetails:[],
    //     noOfTranscript:[]
    // }

    //Marksheet Data
    models.User.findOne({
        where: {
            id: userId
        }
    }).then(function (user) {

        
        models.DocumentDetails.findAll({
            where: {
                user_id: userId,
                app_id : app_id
                // type : 'marksheet'
            }
        }).then(function (docDetails) {
            models.VerificationTypes.findOne({
                where : {
                    user_id : userId
                }
            }).then(function(verificationType) {
                models.InstituteDetails.findAll({
                    where: {
                        user_id: userId,
                        app_id : app_id
                    }
                }).then(async function (InstituteDetail) {
                    // var markshhe_count = 0;
                    // var deg_count = 0;
                    // var tran_count = 0;
                    // var mark_count = 0;
                    // var degree_count = 0;
                    // var trans_count = 0;
                    var fileu=0;
                    docDetails.forEach(document => {
                        fileu++;
                    })
                    var getorder = await functions.getorderdetails(app_id)
                    if(getorder[0]['status'] == '1'){
                        statuspayment ='Success';
                    }else{
                        statuspayment='Payment Failed'
                    }
                    self_PDF.paymentreceipt(marksheet,degree,file,userId,noMarksheet? noMarksheet:'',noDegree? noDegree :  '',app_id,getorder,statuspayment,function(err){
                        if(err){
                            return res.json({
                                status : 400,
                                message : 'Files cannot merged'
                            })
                        }else{
                            setTimeout(()=>{
                                var fileUrl = app_id + "_ApplicationForm.pdf"
                                res.json({
                                    status : 200,
                                    data : fileUrl
                                })
                            },3000)
                        }
                    });
                })
            })
        })
    }) 
})

 //download pdf 
router.get('/downloadFiles',function (req, res) {
   var doc = req.query.documentFile;
   const downloadData =  FILE_LOCATION + 'public/upload/documents/'+req.user.id + '/' +doc;
   res.download(downloadData);
});

router.get('/downloadFilesTotal',function (req, res) {
    var doc = req.query.documentFile;
    const downloadData =  FILE_LOCATION + 'public/upload/documents/'+req.user.id + '/' +doc;
    res.download(downloadData);
 });
 
 router.get('/downloadFilespaymenttotal',function (req, res) {
    var doc = req.query.documentFile;
    const downloadData =  FILE_LOCATION + 'public/upload/documents/'+req.user.id + '/' +doc;
    res.download(downloadData);
 });

router.post('/deletefile', function (req, res) {
    console.log("/deletefile");
    var doc_id = req.body.doc_id
    models.DocumentDetails.findOne({
        where: {
            id: doc_id,
           // file:type
        }
    }).then(function(filename){
        if(filename){
            var documentName = filename.type + " " + filename.courseName + " " + filename.semester;
            filename.update({
                file: null
            }).then(function(deletefile){
                models.Activitytracker.create({
                    user_id : req.user.id,
                    activity : "Delete Document",
                    data : req.user.email+" has been deleted document of "+documentName,
                    application_id : null,
                    // source :'guverification'
                    source :'hsncverification'
                });
                res.json({
                    status:200,
                    data: deletefile
                })
            })
        }
    })
})

/*Author :Priyanka Divekar
Desc : get sample document of sy verification college letter
parameter : N/A
*/
router.get('/downloadTemplate',function(req,res){
	
    const location = FILE_LOCATION +'public/upload/sample/SYVerification_CollegeLetter.pdf'
    const downloadData = location; 
    res.download(downloadData);
})

router.get('/getApplicationsDetails',function(req,res){
    var user_id = req.user.id;;
    models.Application.getAllApplicationsDetails(user_id).then(function(data){
        if(data.length > 0){
            var result = data.some(app=>(app.lock_transcript == true))
            res.json({
                status : 200,
                data : data,
                lock_transcript : result
            })
        }else{
            res.json({
                status : 200,
                data : null
            })
        }
        
    })
});

router.delete('/deletedoc',async(req,res)=>{
    console.log('DELETE - student/deletedoc')
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    let type=req.query.type;
    let doc_id=req.query.id;
    try{
        if(type=='edu_details'){
            let docDetails=await models.DocumentDetails.destroy({
                where:{
                    id: doc_id,
                }
            })
            if(docDetails){
                const data=`${req.user.email} has been deleted document details of ${req.user.id}`;
                const activity="Deleted Document Details";
                functions.activitylog(req.user.id,activity,data,null)
                res.json({
                    status:200,
                    data:docDetails
                })

            }else{
                res.json({
                    staus:400
                })
            }
        }
        if(type=='Ins_details'){
            let docDetails=await models.InstituteDetails.destroy({
                where:{
                    id: doc_id,
                }
            })
            if(docDetails){
                const data=`${req.user.email} has been deleted institute details of ${req.user.id}`;
                const activity="Deleted institute Details";
                functions.activitylog(req.user.id,activity,data,null)
                res.json({
                    status:200,
                    data:docDetails
                })

            }else{
                res.json({
                    staus:400
                })
            }
        }
    }catch(e){
        res.json({
            status: 500,
            message: e.message,
        })
    }
});

router.get('/getSupportiveData', (req, res, next) => {
    models.DocumentDetails.findAll({
        where: {
            user_id: req.user.id,
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
})



module.exports = router;
