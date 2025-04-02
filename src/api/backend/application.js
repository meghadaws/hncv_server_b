const express = require('express');
const router = express.Router();
const config = require('config');
var path = require('path');
var root_path = path.dirname(require.main.filename);
var models = require(root_path + '/models');
var moment = require("moment");
const multer = require('multer');
var fs = require('fs');
const request = require('request');
const { serverUrl, edulabAllow } = config.get('api');
const { FILE_LOCATION } = config.get('path');
var self_PDF = require('./invoiceTemplate');
var qs = require('querystring');
var converter = require('number-to-words');
var json2xls = require('json2xls');
const middleswares = require('../../utils/middleswares');
const functions = require('../backend/function')
var romans = require('romans');
const cipher = require('../../api/common/auth/cipherHelper');
var addZero = require('add-zero');
const pdf = require('pdf-parse');
var emailService = require ('../../utils/emailService');


router.get('/applicationdata', (req, res) => {
    var userid = req.query.user_id
    models.Application.findAll({
        where: {
            user_id: userid,
            source_from: 'hsncverification'
        }
    }).then(function (data) {
        if (data.length > 0) {
            res.json({
                status: 200
            })
        } else {
            res.json({
                status: 400
            })
        }
    })
})

router.get('/documentdetailsdata', (req, res) => {
    var userid = req.query.id
    models.DocumentDetails.findAll({
        where: {
            user_id: userid,
            upload_step: 'requested'
        }
    }).then(function (data) {
        if (data) {
            res.json({
                data: data,
                status: 200
            })
        } else {
            res.json({
                status: 400
            })
        }
    })
})

router.get('/getAgents', (req, res) => {
    models.User.findAll({
        where: {
            user_type: 'agent'
        }
    }).then(function (users) {
        res.json({
            status: 200,
            data: users
        })
    })
})

router.post('/setVerified', function (req, res) {
    console.log("/setVerified");
    if (req.user.email.includes('@edulab.in') && edulabAllow == false) {
        res.json({
            status: 400,
            message: "You don't have persmission"
        })
    } else {
        var app_id = req.body.app_id;
        var value = req.body.value;
        var verifiedBy = req.user.email_id;
        if (value == 'pending') {
            models.Application.update({
                tracker: 'signed',
                status: 'accept',
                approved_by: verifiedBy
            }, {
                where: {
                    id: app_id
                }
            }).then(function (data) {
                if (data != 0) {
                    models.User.getUserDetails(app_id).then(function (userData) {
                        var user = userData[0];
                        var url = config.get('email').BASE_URL_SENDGRID + 'applicationStatus';
                        models.Activitytracker.create({
                            user_id: user.id,
                            activity: "Application Verified",
                            data: "Application " + app_id + " is verified by " + verifiedBy,
                            application_id: app_id,
                            source: 'hsncverification'
                        });
                        models.VerificationTypes.findOne({
                            where: {
                                user_id: user.user_id,
                                app_id: app_id
                            }
                        }).then(function (verificationTypes) {
                            var statusType;
                            // if (verificationTypes.sealedCover == true) {
                            //     statusType = "verified-print";
                            // } else {
                            statusType = "verified-signed";
                            //}
                            if (user.agentName != null) {
                                request.post(url, {
                                    json: {
                                        mobile: user.agentMobile,
                                        mobile_country_code: user.agentMobileCountryCode,
                                        userName: user.agentName,
                                        email: user.agentEmail,
                                        studentName: user.studentName,
                                        app_id: app_id,
                                        statusType: statusType,
                                        source: 'verification',
                                        user_type: 'agent'
                                    }
                                }, function (error, response, body) {
                                });
                            } else {
                                request.post(url, {
                                    json: {
                                        mobile: user.studentMobile,
                                        mobile_country_code: user.studentMobileCountryCode,
                                        userName: user.studentName,
                                        email: user.studentEmail,
                                        statusType: statusType,
                                        app_id: app_id,
                                        source: 'verification',
                                        user_type: 'student'
                                    }
                                }, function (error, response, body) {
                                });
                            }
                            if (verificationTypes.marksheet == true) {
                                models.InstituteDetails.findAll({
                                    where: {
                                        user_id: user.user_id,
                                        // app_id : app_id,
                                        type: 'marksheet'
                                    }
                                }).then(function (instituteDetails) {
                                    var institutes = [...instituteDetails.reduce((mp, o) => {
                                        const key = JSON.stringify([o.name]);
                                        if (!mp.has(key)) mp.set(key, { name: o.name, count: 0 });
                                        mp.get(key).count++;
                                        return mp;
                                    }, new Map).values()];
                                    require('async').eachSeries(institutes, function (insti, callback) {
                                        self_PDF.generateQRCode(user.user_id, 'marksheet', insti.name, app_id, function (err) {
                                            if (err) {
                                                return res.json({
                                                    status: 400
                                                })
                                            } else {
                                            }
                                        })
                                        callback();
                                    }, function () {
                                    })
                                })
                            }
                            if (verificationTypes.transcript == true) {
                                models.InstituteDetails.findAll({
                                    where: {
                                        user_id: user.user_id,
                                        app_id: app_id,
                                        type: 'transcript'
                                    }
                                }).then(function (instituteDetails) {
                                    var institutes = [...instituteDetails.reduce((mp, o) => {
                                        const key = JSON.stringify([o.name]);
                                        if (!mp.has(key)) mp.set(key, { name: o.name, count: 0 });
                                        mp.get(key).count++;
                                        return mp;
                                    }, new Map).values()];
                                    require('async').eachSeries(institutes, function (insti, callback) {
                                        self_PDF.generateQRCode(user.user_id, 'transcript', insti.name, app_id, function (err) {
                                            if (err) {
                                                return res.json({
                                                    status: 400
                                                })
                                            } else {
                                            }
                                        })
                                        callback();
                                    }, function () {
                                    })
                                })
                            }
                            if (verificationTypes.degreeCertificate == true) {
                                models.InstituteDetails.findAll({
                                    where: {
                                        user_id: user.user_id,
                                        app_id: app_id,
                                        type: 'degree'
                                    }
                                }).then(function (instituteDetails) {
                                    var institutes = [...instituteDetails.reduce((mp, o) => {
                                        const key = JSON.stringify([o.name]);
                                        if (!mp.has(key)) mp.set(key, { name: o.name, count: 0 });
                                        mp.get(key).count++;
                                        return mp;
                                    }, new Map).values()];
                                    require('async').eachSeries(institutes, function (insti, callback) {
                                        self_PDF.generateQRCode(user.user_id, 'degree', insti.name, app_id, function (err) {
                                            if (err) {
                                                return res.json({
                                                    status: 400
                                                })
                                            } else {
                                            }
                                        })
                                        callback();
                                    }, function () {
                                    })
                                })
                            }
                        })
                        res.json({
                            status: 200,
                        })
                    })
                } else {
                    res.json({
                        status: 400
                    })
                }
            })
        } else if (value == 'print') {
            models.Application.update({
                tracker: 'print'
            }, {
                where: {
                    id: app_id
                }
            }).then(function (data) {
                if (data > 0) {
                    models.Activitytracker.create({
                        user_id: user.id,
                        activity: "Application Printed",
                        data: "Application " + app_id + " is printed by " + verifiedBy,
                        application_id: app_id,
                        source: 'hsncverification'
                    });
                    res.json({
                        status: 200,
                    })
                } else {
                    res.json({
                        status: 400
                    })
                }
            })
        }
    }
})

router.post('/rejectApplicationOfverification', function (req, res) {
    var outward = req.body.outward
    var app_id = req.body.app_id
    if (req.user.email.includes('@edulab.in') && edulabAllow == false) {
        res.json({
            status: 400,
            message: "You don't have persmission"
        })
    } else {
        models.User.findOne({
            where: {
                id: req.body.userId


            }
        }).then(function (user) {
            if (user) {
                models.Application.findOne({
                    where: {
                        user_id: req.body.userId,
                        id: req.body.app_id,
                        source_from: 'hsncverification',
                    }
                }).then(function (uca) {
                    if (uca) {
                        uca.update({
                            tracker: 'apply',
                            status: 'reject',
                            notes: outward
                        }).then(function (uca_updated) {
                            models.Activitytracker.create({
                                user_id: req.body.userId,
                                activity: "Reject Application",
                                data: "Application" + req.body.app_id + " has been rejected  by " + req.user.email,
                                application_id: req.body.app_id,
                                source: 'hsncverification',
                            });
                            if (uca_updated) {

                                var url = config.get('email').BASE_URL_SENDGRID + 'rejectverificationApplication';
                                // request.post(constant.BASE_URL_SENDGRID + 'rejectApplication', {
                                request.post(url, {

                                    json: {
                                        source: 'hsncverification',
                                        mobile: user.mobile,
                                        mobile_country_code: user.mobile_country_code,
                                        userName: user.name,
                                        surName: user.surname,
                                        email: user.email,
                                        marksheetName: user.marksheetName,
                                        to: user.email,
                                        toName: user.name,
                                        user_type: user.user_type,
                                        app_id: uca_updated.id,
                                        type: req.body.fromTab,
                                    }
                                }, function (error, response, body) {
                                    if (error) {
                                        res.json({
                                            status: 400,
                                            message: 'message not sent!!!..'
                                        })
                                    } else {
                                        res.send({
                                            status: 200,
                                            message: 'message sent to student.'
                                        });
                                    }
                                });
                            } else {
                                res.json({
                                    status: 400,
                                    message: 'user status does not changed!!!..'
                                })
                            }
                        })
                    } else {
                        res.json({
                            status: 400,
                            message: 'user application does not created!!!..'
                        })
                    }
                });
            } else {
                res.json({
                    status: 400,
                    message: 'user does not exist!!...'
                })
            }
        });
    }
});


//to get the total "pending" students from student-managent (All students who have registered)
router.get('/pending_students', function (req, res) {
    console.log("/pending_students");
    var page = req.query.page;
    var name = req.query.name ? req.query.name : '';
    var email = req.query.email ? req.query.email : '';
    var type = req.query.type;
    var application_id = req.query.id

    var year = req.query.acadYear ? req.query.acadYear : '';
    var limit = 10;
    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters = [];

    if (name != '' && name != null && name != undefined && name != 'null' && name != 'undefined') {
        var filter = {};
        var filter1 = {};
        var nameSplit = name.split(' ');
        if (nameSplit.length == 1) {
            filter.name = 'name';
            filter.value = " AND( u.name like '%" + nameSplit[0] + "%' OR u.surname like '%" + nameSplit[0] + "%') ";
            filters.push(filter);
        } else if (nameSplit.length == 2) {
            filter.name = 'name';
            filter.value = " AND u.name like '%" + nameSplit[0] + "%' AND u.surname like '%" + nameSplit[1] + "%' ";
            filters.push(filter);
        } else {
            filter.name = 'name';
            var lastElement = nameSplit.pop();
            filter.value = " AND u.name like '%" + nameSplit.join(' ') + "%' AND u.surname like '%" + lastElement + "%' ";
            filters.push(filter);
        }

    }
    if (email != '' && email != null && email != undefined && email != 'null' && email != 'undefined') {
        var filter = {};
        filter.name = 'email';
        filter.value = email;
        filters.push(filter);
    }

    if (application_id != '' && application_id != null && application_id != undefined && application_id != 'null' && application_id != 'undefined') {
        var filter = {};
        filter.name = 'application_id';
        filter.value = application_id;
        filters.push(filter);
    }
    if (year != '' && year != null && year != undefined && year != 'null' && year != 'undefined') {
        var filter = {};
        var currentyear = year;
        var startdate = currentyear + "-04-01";
        var year = parseInt(currentyear) + 1;
        var enddate = year + "-04-01";
        filter.name = 'application_year';
        filter.value = " AND a.created_at BETWEEN '" + startdate + "' AND '" + enddate + "'";
        filters.push(filter);
    }
    var data = []; var countObj = {};
    // fetch total active & inactive student count from db.
    models.Application.getPendingUserApplications(filters, null, null, type).then(function (studentsData) {
        countObjects.totalLength = studentsData.length;
        models.Application.getPendingUserApplications(filters, limit, offset, type).then(function (students) {
            countObjects.filteredLength = students.length;
            if (students != null) {
                require('async').eachSeries(students, function (student, callback) {
                    
                    var obj = {
                        id: (student.id) ? student.id : '',
                        name: (student.name) ? student.name : '',
                        email: (student.email) ? student.email : '',
                        tracker: (student.tracker) ? student.tracker : '',
                        status: (student.status) ? student.status : '',
                        created_at: (student.created_at) ? moment(new Date(student.created_at)).format("DD-MM-YYYY") : '',
                        user_id: (student.user_id) ? (student.user_id) : '',
                        // created_by: (student.a_name) ? 'By agent ' : 'By student',
                        created_by: (student.a_name) ? 'By agent (' + student.aname + ')' : 'By student',
                        agent_name: (student.a_name) ? student.a_name : '',
                        applyFor:
                            student.marksheet === 1 && student.degreeCertificate === 1
                                ? 'Marksheet, Degree'
                                : student.marksheet === 1
                                    ? 'Marksheet'
                                    : student.degreeCertificate === 1
                                        ? 'Degree'
                                        : ''

                    };

                    data.push(obj);
                    callback();
                }, function () {
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


router.get('/verified_students', (req, res, next) => {
    console.log("/verified_students");
    var page = req.query.page;
    var name = req.query.name ? req.query.name : '';
    var email = req.query.email ? req.query.email : '';
    var year = req.query.acadYear ? req.query.acadYear : '';
    var limit = 10;
    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters = [];

    if (name != '' && name != null && name != undefined && name != 'null' && name != 'undefined') {
        var filter = {};
        var filter1 = {};
        var nameSplit = name.split(' ');
        if (nameSplit.length == 1) {
            filter.name = 'name';
            filter.value = " AND( u.name like '%" + nameSplit[0] + "%' OR u.surname like '%" + nameSplit[0] + "%') ";
            filters.push(filter);
        } else if (nameSplit.length == 2) {
            filter.name = 'name';
            filter.value = " AND u.name like '%" + nameSplit[0] + "%' AND u.surname like '%" + nameSplit[1] + "%' ";
            filters.push(filter);
        } else {
            filter.name = 'name';
            var lastElement = nameSplit.pop();
            filter.value = " AND u.name like '%" + nameSplit.join(' ') + "%' AND u.surname like '%" + lastElement + "%' ";
            filters.push(filter);
        }

    }
    if (email != '' && email != null && email != undefined && email != 'null' && email != 'undefined') {
        var filter = {};
        filter.name = 'email';
        filter.value = email;
        filters.push(filter);
    }

    if (year != '' && year != null && year != undefined && year != 'null' && year != 'undefined') {
        var filter = {};
        var currentyear = year;
        var startdate = currentyear + "-04-01";
        var year = parseInt(currentyear) + 1;
        var enddate = year + "-04-01";
        filter.name = 'application_year';
        filter.value = " AND a.created_at BETWEEN '" + startdate + "' AND '" + enddate + "'";
        filters.push(filter);
    }
    var data = []; var countObj = {};
    // fetch total active & inactive student count from db.
    models.Application.getVerifiedUserApplications(filters, null, null).then(function (studentsData) {
        countObjects.totalLength = studentsData.length;
        models.Application.getVerifiedUserApplications(filters, limit, offset).then(function (students) {
            countObjects.filteredLength = students.length;
            if (students != null) {

                require('async').eachSeries(students, function (student, callback) {
                    var obj = {
                        id: (student.id) ? student.id : '',
                        name: (student.name) ? student.name : '',
                        email: (student.email) ? student.email : '',
                        tracker: (student.tracker) ? student.tracker : '',
                        status: (student.status) ? student.status : '',
                        created_at: (student.cretaedAt) ? moment(new Date(student.cretaedAt)).format("DD-MM-YYYY") : '',
                        user_id: student.user_id ? student.user_id : '',
                        created_by: (student.agent_name) ? 'By agent (' + student.agent_name + ')' : 'By student'
                    };

                    data.push(obj);
                    callback();
                }, function () {
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


router.get('/getAdminSideDetails', (req, res, next) => {
    var user_id = req.query.id;
    var app_id = req.query.app_id;

    var previewData = {
        personalDetails: {},
        verificationDetails: {},
        marksheetDetails: [],
        transcriptDetails: [],
        degreeDetails: [],
        deliveryOptions: {},
        marksheetInstitute: {},
        transcriptInstitute: {},
        degreeInstitute: {}
    }

    models.User.findOne({
        where: {
            id: user_id
        }
    }).then(function (user) {
        previewData.personalDetails = {
            name: user.name,
            email: user.email,
            contactNo: user.mobile_country_code + '-' + user.mobile,
            marksheetName: user.marksheetName
        }
        models.Application.findOne({
            where: {
                id: app_id
            }
        }).then(function (application) {
            models.VerificationTypes.findOne({
                where: {
                    user_id: user_id
                }
            }).then(function (verificationTypes) {
                previewData.verificationDetails = verificationTypes;
                models.DocumentDetails.findAll({
                    where: {
                        user_id: user_id
                    }
                }).then(function (documentDetails) {
                    documentDetails.forEach(document => {
                        var extension = document.file.split('.');
                        if (document.type == 'marksheet') {
                            previewData.marksheetDetails.push({
                                id: document.id,
                                courseName: document.courseName,
                                seatNo: document.seatNo,
                                semester: document.semester,
                                resultClass: document.resultClass,
                                passingMonthYear: moment(new Date(document.PassingMonthYear)).format('MMM YYYY'),
                                fileName: document.file,
                                fileSrc: serverUrl + 'upload/documents/' + user_id + '/' + document.file,
                                fileExtension: extension[1],
                                lock_transcript: (document.lock_transcript == 'requested') ? true : false,
                                upload_step: (document.upload_step == 'requested') ? true : false,
                                sgpi: document.SGPI,
                                grade : document.grade,
                                courseType : document.courseType,
                                type : document.type
                            })
                        } else if (document.type == 'transcript') {
                            previewData.transcriptDetails.push({
                                id: document.id,
                                courseName: document.courseName,
                                seatNo: document.seatNo,
                                semester: document.semester,
                                resultClass: document.resultClass,
                                passingMonthYear: moment(new Date(document.PassingMonthYear)).format('MMM YYYY'),
                                fileName: document.file,
                                fileSrc: serverUrl + 'upload/documents/' + user_id + '/' + document.file,
                                fileExtension: extension[1],
                                lock_transcript: (document.lock_transcript == 'requested') ? true : false,
                                upload_step: (document.upload_step == 'requested') ? true : false
                            })
                        } else if (document.type == 'degree') {
                            previewData.degreeDetails.push({
                                id: document.id,
                                courseName: document.courseName,
                                seatNo: document.seatNo,
                                semester: document.semester,
                                resultClass: document.resultClass,
                                passingMonthYear: moment(new Date(document.PassingMonthYear)).format('MMM YYYY'),
                                fileName: document.file,
                                fileSrc: serverUrl + 'upload/documents/' + user_id + '/' + document.file,
                                fileExtension: extension[1],
                                lock_transcript: (document.lock_transcript == 'requested') ? true : false,
                                upload_step: (document.upload_step == 'requested') ? true : false,
                                sgpi: document.SGPI,
                                grade : document.grade,
                                courseType : document.courseType,
                                type : document.type,
                                convocationDate : document.convocationDate,
                                convocationNo : document.convocationNo
                            })
                        }
                    })

                    models.InstituteDetails.findAll({
                        where: {
                            user_id: user_id

                        }
                    }).then(function (instituteDetails) {
                        previewData.deliveryOptions = {
                            // deliveryOption : instituteDetails[0].deliveryOption,
                            // deliveryMode :instituteDetails[0].deliveryMode
                            deliveryOption: 'a',
                            deliveryMode: 'n'
                        }
                        instituteDetails.forEach(institute => {
                            if (institute.type == 'marksheet') {
                                previewData.marksheetInstitute = {
                                    id: institute.id,
                                    referenceNo: institute.referenceNo,
                                    name: institute.name,
                                    address: institute.address,
                                    email: institute.email
                                }
                            } else if (institute.type == 'transcript') {
                                previewData.transcriptInstitute = {
                                    id: institute.id,
                                    referenceNo: institute.referenceNo,
                                    name: institute.name,
                                    address: institute.address,
                                    email: institute.email
                                }
                            } else if (institute.type == 'degree') {
                                previewData.degreeInstitute = {
                                    id: institute.id,
                                    referenceNo: institute.referenceNo,
                                    name: institute.name,
                                    address: institute.address,
                                    email: institute.email
                                }
                            }
                        })
                        res.json({
                            status: 200,
                            data: previewData
                        })
                    })
                })
            })
        })
    })
})

router.post('/generateCertificates', (req, res, next) => {
    console.log("POST - application/generateCertificates");

    const clientIP = req.body.clientIP;
    var app_id = req.body.app_id;
    var userId = req.body.userId;
    var emailAdmin = req.user.email;
    if (emailAdmin.includes('@edulab.in') && edulabAllow == false) {
        res.json({
            status: 400,
            message: "You don't have persmission"
        })
    } else {
        var resolveData = { marksheet: null, degree: null };
        models.User.findOne({
            where: {
                id: userId
            }
        }).then(function (user) {
            models.Application.findOne({
                where: {
                    id: app_id
                }
            }).then(function (application) {

                var month = moment(new Date(application.created_at)).month();
                var year = moment(new Date(application.created_at)).year();
                var academicYear;
                if (month > 4) {
                    academicYear = year + '-' + (year + 1);
                } else if (month <= 4) {
                    academicYear = (year - 1) + '-' + year;
                }
                models.VerificationTypes.findOne({
                    where: {
                        user_id: userId,
                        app_id: app_id
                    }
                }).then(async function (verificationTypes) {
                    let enrollmentNumber = await functions.getEnrollDetails(userId, app_id, 'marksheet');
                    let marksheetPromise = new Promise(async function (resolve, reject) {
                        if (verificationTypes.marksheet == true) {
                            // let enrollmentNumber = functions.getEnrollDetails(userId, app_id, 'marksheet');
                            if (enrollmentNumber) {
                                let documentDetails = await functions.getDocumentDetails(userId, app_id, 'marksheet');
                                var marksheetDetails = [];
                                var studentName = user.marksheetName.toUpperCase();
                                var prefix = '';
                                if (user.gender == 'Male') {
                                    prefix = 'Mr.';
                                } else if (user.gender == 'Female') {
                                    prefix = 'Miss';
                                }
                                var width = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

                                var content = 'With reference to subject cited above, I am to confirm that the documents mentioned below in respect of ' + prefix + ' ' + studentName + ' have been verified and found genuine.'
                                var belowContent = 'The above details have been verified from this office records. After verification, it is observed that the aforesaid documents have been issued by the University and details mentioned in the documents are found to be correct.'
                                var tableHeader = 'Details of Statement of Marks';
                                marksheetDetails.push([{ text: 'Name of the Examination', bold: true, alignment: 'center' }, { text: 'Seat No', bold: true, alignment: 'center' }, { text: 'Month & Year of Examination', bold: true, alignment: 'center' }, { text: 'SGPI/CGPA', bold: true, alignment: 'center' }, { text: 'Grade', bold: true, alignment: 'center' }, { text: 'Mode of Study', bold: true, alignment: 'center' }]);
                                var count = 0;
                                var tablelayout = 'borders'


                                documentDetails.forEach((document, index) => {
                                    count++;
                                    var courseName = document.courseName + '(' + document.semester + ')';
                                    var monthYear = moment(new Date(document.PassingMonthYear)).format('MMMM YYYY');

                                    if (documentDetails.length) {

                                        // Add details for the current document
                                        marksheetDetails.push([
                                            { text: courseName, alignment: 'center' },
                                            { text: document.seatNo, alignment: 'center' },
                                            { text: monthYear, alignment: 'center' },
                                            // { text: document.resultClass, alignment: 'center' },
                                            { text: document.SGPI, alignment: 'center' },
                                            { text: document.grade, alignment: 'center' },
                                            { text: document.courseType, alignment: 'center' },
                                        ]);

                                        // Add a page break after every 6 items
                                        if ((index + 1) % 9 === 0) {
                                            marksheetDetails.push([{ text: '', colSpan: 6, border: [0, 0, 0, 0] }, {}, {}, {}, {}, {}]);
                                            marksheetDetails.push([{ text: '', pageBreak: 'after', colSpan: 6, border: [0, 0, 0, 0] }, {}, {}, {}, {}, {}]);
                                        }
                                    }
                                });

                                let instituteDetails = await functions.getInstituteDetails(userId, app_id, 'marksheet');

                                let institutes = await functions.getDistinctInstitute(instituteDetails);
                                var count = 0;
                                var count_inst = 0;
                                for (let institute of institutes) {
                                    count_inst++;
                                    var instCountWords = converter.toWords(count_inst);
                                    var genFile = app_id + "_" + instCountWords + "_" + "marksheetVerificationCertificate.pdf";
                                    var letterFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
                                    if (!fs.existsSync(letterFile)) {
                                        let generatedDoc = await functions.generateLetters(userId, marksheetDetails, 'marksheet', institute, app_id, width, content, tablelayout, enrollmentNumber, application.app_status, academicYear, count_inst, belowContent, tableHeader);
                                        if (generatedDoc.fileName == '') {
                                            callback(generatedDoc.error)
                                        } else {
                                            let verificationLetter = await functions.getVerificationLetter(generatedDoc.fileName, userId, app_id);
                                            if (verificationLetter == null) {
                                                await functions.addVerificationLetter(generatedDoc.fileName, userId, app_id, instituteDetails[0].type, institute.count);
                                            }
                                        }
                                    } else {
                                        let verificationLetter = await functions.getVerificationLetter(genFile, userId, app_id);
                                        if (verificationLetter == null) {
                                            await functions.addVerificationLetter(genFile, userId, app_id, instituteDetails[0].type, institute.count);
                                        }
                                    }

                                }

                                require('async').eachSeries(documentDetails, function (document, callback) {
                                    var fname = document.course_name.split(' ').join('_');
                                    var fileName = path.parse(document.file).name;
                                    var genFile = app_id + '_' + fname + '_' + fileName + '.pdf';
                                    var documentFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
                                    if (!fs.existsSync(documentFile)) {
                                        var filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + document.file;
                                        if (fs.existsSync(filePath)) {
                                            var outputDirectory = '';

                                            var extension = document.file.split('.').pop();

                                            var folderName = fileName;
                                            var numOfpages;
                                            if (extension == 'pdf' || extension == 'PDF') {
                                                let updateDocumentPromise = new Promise((resolve, reject) => {
                                                    outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/";
                                                    if (!fs.existsSync(outputDirectory)) {
                                                        fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                    }
                                                    self_PDF.pdfToImageConversion(fileName, userId, filePath, outputDirectory);
                                                    let dataBuffer = fs.readFileSync(filePath);
                                                    pdf(dataBuffer).then(function (data) {
                                                        numOfpages = data.numpages;
                                                    });

                                                    var mergeFileString = { fileString: '', fileString1: '' };
                                                    setTimeout(() => {
                                                        outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/signed_" + folderName + "/";
                                                        if (!fs.existsSync(outputDirectory)) {
                                                            fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                        }
                                                        var pagesLength = numOfpages.toString().length;
                                                        for (var i = 1; i <= numOfpages; i++) {
                                                            var j = addZero(i, pagesLength);
                                                            filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/" + fileName + "-" + j + ".jpg";
                                                            file_name = fileName + "-" + j;
                                                            self_PDF.signDocument(file_name, userId, app_id, filePath, outputDirectory, fname, 'marksheet', fileName, 'false', function (err, fileName1) {
                                                                if (err) {
                                                                    reject(err);
                                                                } else {
                                                                    mergeFileString.fileString = mergeFileString.fileString + ' "' + outputDirectory + fileName1 + '"';
                                                                    self_PDF.signDocument_notForPrint(file_name, userId, app_id, filePath, outputDirectory, fname, 'marksheet', fileName, 'false', function (err, fileName1) {
                                                                        if (err) {
                                                                            reject(err);
                                                                        } else {
                                                                            mergeFileString.fileString1 = mergeFileString.fileString1 + ' "' + outputDirectory + fileName1 + '"';
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    }, 6000);
                                                    setTimeout(() => { resolve(mergeFileString) }, 12000);
                                                });
                                                updateDocumentPromise.then((values) => {
                                                    outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
                                                    if (!fs.existsSync(outputDirectory)) {
                                                        fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                    }
                                                    var outputFile = outputDirectory + app_id + '_' + fname + '_' + fileName + '.pdf';
                                                    var outputFile1 = outputDirectory + app_id + '_' + fname + '_' + fileName + '_noPrint.pdf';
                                                    self_PDF.merge(values.fileString, outputFile1, function (err) {
                                                        if (err) {
                                                            callback(document.file + 'of ' + document.courseName + ' ' + document.type + ' cannot merge', '')
                                                        } else {
                                                            self_PDF.merge(values.fileString, outputFile, function (err) {
                                                                if (err) {
                                                                    callback(document.file + ' of ' + document.courseName + ' ' + document.type + ' cannot merge', '')
                                                                } else {
                                                                    models.VerificationLetters.findOne({
                                                                        where: {
                                                                            file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
                                                                            user_id: userId,
                                                                            app_id: app_id
                                                                        }
                                                                    }).then(function (verificationLetters) {
                                                                        if (verificationLetters == null) {
                                                                            models.VerificationLetters.create({
                                                                                file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
                                                                                user_id: userId,
                                                                                app_id: app_id,
                                                                                doc_type: instituteDetails[0].type,
                                                                                noOfCopies: instituteDetails.length
                                                                            }).then(function (addedLetter) {
                                                                                if (addedLetter) {

                                                                                }
                                                                            }).catch(error => {
                                                                                res.status(400).send(error)
                                                                            })
                                                                        }
                                                                    })
                                                                }
                                                            });
                                                        }
                                                    });
                                                },
                                                    (error) => {
                                                        reject(document.file + ' of ' + document.course_name + ' ' + document.type + ' can not process')
                                                    })
                                            } else {
                                                outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
                                                if (!fs.existsSync(outputDirectory)) {
                                                    fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                }
                                                self_PDF.signDocument_notForPrint(fileName, userId, app_id, filePath, outputDirectory, fname, 'marksheet', fileName, 'false', function (err, fileName_no) {
                                                    if (err) {
                                                        callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' can not process', '')
                                                    } else {
                                                        self_PDF.signDocument(fileName, userId, app_id, filePath, outputDirectory, fname, 'marksheet', fileName, 'false', function (err, fileName) {
                                                            if (err) {
                                                                callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' can not process', '')
                                                            } else {
                                                                models.VerificationLetters.findOne({
                                                                    where: {
                                                                        file_name: fileName,
                                                                        user_id: userId,
                                                                        app_id: app_id
                                                                    }
                                                                }).then(function (verificationLetters) {
                                                                    if (verificationLetters == null) {
                                                                        models.VerificationLetters.create({
                                                                            file_name: fileName,
                                                                            user_id: userId,
                                                                            app_id: app_id,
                                                                            doc_type: instituteDetails[0].type,
                                                                            noOfCopies: instituteDetails.length
                                                                        }).then(function (addedLetter) {
                                                                            if (addedLetter) {

                                                                            }
                                                                        }).catch(error => {
                                                                            res.status(400).send(error)
                                                                        })
                                                                    }
                                                                }).catch(error => {
                                                                    res.status(400).send(error)
                                                                })
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        } else {
                                            callback('File not Found', '')
                                        }
                                    } else {
                                        models.VerificationLetters.findOne({
                                            where: {
                                                file_name: genFile,
                                                user_id: userId,
                                                app_id: app_id
                                            }
                                        }).then(function (verificationLetters) {
                                            if (verificationLetters == null) {
                                                models.VerificationLetters.create({
                                                    file_name: genFile,
                                                    user_id: userId,
                                                    app_id: app_id,
                                                    doc_type: instituteDetails[0].type,
                                                    noOfCopies: instituteDetails.length
                                                }).then(function (addedLetter) {
                                                    if (addedLetter) {
                                                    }
                                                }).catch(error => {
                                                    res.status(400).send(error)
                                                })
                                            }
                                        }).catch(error => {
                                            res.status(400).send(error)
                                        })
                                    }
                                    setTimeout(() => {
                                        callback('', 'next');
                                    }, 13000)
                                }, function (err, result) {
                                    if (err) {
                                        reject(err);
                                    } else {

                                        resolveData.marksheet = "done";
                                        setTimeout(() => { resolve(resolveData) }, 14000)
                                    }
                                })

                            } else {
                                reject('Cannot process application because outward number not updated')
                            }

                        } else {
                            resolveData.marksheet = "done";
                            setTimeout(() => { resolve(resolveData) }, 1000)
                        }
                    });

                    /*let transcriptPromise = new Promise(function (resolve, reject) {
                        if (verificationTypes.transcript == true) {
                            models.Application.MDT_getEnrollmentNumber(userId, app_id, 'transcript').then(function (enrollmentNumber) {
                                if(enrollmentNumber.length > 0){
                                    models.DocumentDetails.findAll({
                                        where: {
                                            user_id: userId,
                                            app_id: app_id,
                                            type: 'transcript'
                                        }
                                    }).then(function (documentDetails) {
                                        require('async').eachSeries(documentDetails, function (document, callback) {
                                            var fname = document.course_name.split(' ').join('_');
                                            var fileName = path.parse(document.file).name;
                                            var genFile = app_id + '_' + fname + '_' + fileName + '.pdf';
                                            var documentFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
                                            if(!fs.existsSync(documentFile)){
                                                var filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + document.file;
                                                if (fs.existsSync(filePath)) {
                                                    var outputDirectory = '';
                                                    
                                                    var extension = document.file.split('.').pop();
                                                    
                                                    var folderName = fileName;
                                                    var numOfpages;
                                                    if (extension == 'pdf' || extension == 'PDF') {
                                                        let updateDocumentPromise = new Promise((resolve, reject) => {
                                                            outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/";
                                                            if (!fs.existsSync(outputDirectory)) {
                                                                fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                            }
                                                            self_PDF.pdfToImageConversion(fileName, userId, filePath, outputDirectory);
                                                            let dataBuffer = fs.readFileSync(filePath);
                                                            pdf(dataBuffer).then(function (data) {
                                                                numOfpages = data.numpages;
                                                            });

                                                            var mergeFileString = { fileString: '', fileString1: '' };
                                                            setTimeout(() => {
                                                                outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/signed_" + folderName + "/";
                                                                if (!fs.existsSync(outputDirectory)) {
                                                                    fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                                }

                                                                var pagesLength = numOfpages.toString().length;
                                                                for (var i = 1; i <= numOfpages; i++) {
                                                                    var j = addZero(i, pagesLength);
                                                                    filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/" + fileName + "-" + j + ".jpg";
                                                                    file_name = fileName + "-" + j;
                                                                    self_PDF.signDocument(file_name, userId, app_id, filePath, outputDirectory, fname, 'transcript', fileName, 'false', function (err, fileName1) {
                                                                        if (err) {
                                                                            reject(err);
                                                                        } else {
                                                                            mergeFileString.fileString = mergeFileString.fileString + ' "' + outputDirectory + fileName1 + '"';
                                                                            self_PDF.signDocument_notForPrint(file_name, userId, app_id, filePath, outputDirectory, fname, 'transcript', fileName, 'false', function (err, fileName1) {
                                                                                if (err) {
                                                                                    reject(err);
                                                                                } else {
                                                                                    mergeFileString.fileString1 = mergeFileString.fileString1 + ' "' + outputDirectory + fileName1 + '"';
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            }, 6000);
                                                            setTimeout(() => { resolve(mergeFileString) }, 12000);
                                                        });
                                                        updateDocumentPromise.then((values) => {
                                                            outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
                                                            if (!fs.existsSync(outputDirectory)) {
                                                                fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                            }
                                                            var outputFile = outputDirectory + app_id + '_' + fname + '_' + fileName + '.pdf';
                                                            var outputFile1 = outputDirectory + app_id + '_' + fname + '_' + fileName + '_noPrint.pdf';
                                                            self_PDF.merge(values.fileString, outputFile1, function (err) {
                                                                if (err) {
                                                                    callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' cannot merge', '')
                                                                } else {
                                                                    self_PDF.merge(values.fileString, outputFile, function (err) {
                                                                        if (err) {
                                                                            callback(document.file + ' of ' + document.course_name + ' ' + document.type + ' cannot merge', '')
                                                                        } else {
                                                                            models.InstituteDetails.findAll({
                                                                                where: {
                                                                                    user_id: userId,
                                                                                    app_id: app_id,
                                                                                    type: 'transcript'
                                                                                }
                                                                            }).then(function (instituteDetails) {
                                                                                models.VerificationLetters.findOne({
                                                                                    where: {
                                                                                        file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
                                                                                        user_id: userId,
                                                                                        app_id: app_id
                                                                                    }
                                                                                }).then(function (verificationLetters) {
                                                                                    if (verificationLetters == null) {
                                                                                        models.VerificationLetters.create({
                                                                                            file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
                                                                                            user_id: userId,
                                                                                            app_id: app_id,
                                                                                            doc_type: instituteDetails[0].type,
                                                                                            noOfCopies: instituteDetails.length
                                                                                        }).then(function (addedLetter) {
                                                                                            if (addedLetter) {

                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        },
                                                            (error) => {
                                                                reject(document.file + ' of ' + document.course_name + ' ' + document.type + ' can not process')
                                                            })
                                                    } else {
                                                        outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
                                                        if (!fs.existsSync(outputDirectory)) {
                                                            fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                        }
                                                        self_PDF.signDocument_notForPrint(fileName, userId, app_id, filePath, outputDirectory, fname, 'transcript', fileName, 'false', function (err, fileName_no) {
                                                            if (err) {
                                                                callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' can not process', '')
                                                            } else {
                                                                self_PDF.signDocument(fileName, userId, app_id, filePath, outputDirectory, fname, 'transcript', fileName, 'false', function (err, fileName) {
                                                                    if (err) {
                                                                        callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' can not process', '')
                                                                    } else {
                                                                        models.InstituteDetails.findAll({
                                                                            where: {
                                                                                user_id: userId,
                                                                                app_id: app_id,
                                                                                type: 'transcript'
                                                                            }
                                                                        }).then(function (instituteDetails) {
                                                                            models.VerificationLetters.findOne({
                                                                                where: {
                                                                                    file_name: fileName,
                                                                                    user_id: userId,
                                                                                    app_id: app_id
                                                                                }
                                                                            }).then(function (verificationLetters) {
                                                                                if (verificationLetters == null) {
                                                                                    models.VerificationLetters.create({
                                                                                        file_name: fileName,
                                                                                        user_id: userId,
                                                                                        app_id: app_id,
                                                                                        doc_type: instituteDetails[0].type,
                                                                                        noOfCopies: instituteDetails.length
                                                                                    }).then(function (addedLetter) {
                                                                                        if (addedLetter) {

                                                                                        }
                                                                                    })
                                                                                }
                                                                            })
                                                                        })
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    callback('File not Found', '')
                                                }
                                            }else{
                                                models.VerificationLetters.findOne({
                                                    where: {
                                                        file_name: genFile,
                                                        user_id: userId,
                                                        app_id: app_id
                                                    }
                                                }).then(function (verificationLetters) {
                                                    if (verificationLetters == null) {
                                                        models.VerificationLetters.create({
                                                            file_name: genFile,
                                                            user_id: userId,
                                                            app_id: app_id,
                                                            doc_type: instituteDetails[0].type,
                                                            noOfCopies: instituteDetails.length
                                                        }).then(function (addedLetter) {
                                                            if (addedLetter) {
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                            setTimeout(() => {
                                                callback('', 'next');
                                            }, 13000)
                                        }, function (err, result) {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resolveData.transcript = "done";
                                                setTimeout(() => { resolve(resolveData) }, 14000)
                                            }
                                        })
                                    })
                                }else{
                                    reject('Cannot process application because outward number not updated')
                                }
                            })
                        } else {
                            resolveData.transcript = "done";
                            setTimeout(() => { resolve(resolveData) }, 1000)
                        }
                    });*/


                    let degreePromise = new Promise(async function (resolve, reject) {
                        if (verificationTypes.degreeCertificate == true) {
                            //  let enrollmentNumber = functions.getEnrollDetails(userId, app_id, 'degree');
                            if (enrollmentNumber) {
                                let documentDetails = await functions.getDocumentDetails(userId, app_id, 'degree');
                                models.Orders.findOne({
                                    where: {
                                        application_id: app_id,
                                        user_id: userId
                                    }
                                }).then(async function (orders) {
                                    if (documentDetails.length > 0) {

                                        var degreeDetails = [];
                                        var studentName = user.marksheetName.toUpperCase();
                                        var prefix = '';
                                        if (user.gender == 'Male') {
                                            prefix = 'Mr.';
                                        } else if (user.gender == 'Female') {
                                            prefix = 'Miss';
                                        }
                                        var width = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

                                        var content = 'With reference to subject cited above, I am to confirm that the documents mentioned below in respect of ' + prefix + ' ' + studentName + ' have been verified and found genuine.'
                                        var belowContent = 'The above details have been verified from this office records. After verification, it is observed that the aforesaid documents have been issued by the University and details mentioned in the documents are found to be correct.'
                                        var tableHeader = 'Details of Degree Certificate';
                                        var tablelayout = 'noBorders';
                                        degreeDetails.push([{ text: 'Sr. No', bold: true, alignment: 'center' }, { text: 'Receipt No & Date', bold: true, alignment: 'center' }, { text: 'Name of Candidate', bold: true, alignment: 'center' }, { text: 'Exam', bold: true, alignment: 'center' }, { text: 'Month & Year of Exam', bold: true, alignment: 'center' }, { text: 'Convocation No.', bold: true, alignment: 'center' }, { text: 'Grade', bold: true, alignment: 'center' }]);
                                        var count = 0;
                                        var tablelayout = 'borders'
                                        var receipt = orders.id + " " + moment(new Date(orders.timestamp)).format('DD/MM/YYYY');

                                        documentDetails.forEach(document => {
                                            count++;
                                            //var courseName = document.courseName + '(' + document.semester + ')';

                                            var monthYear = moment(new Date(document.PassingMonthYear)).format('MMMM YYYY');
                                            if (count == 5 && documentDetails.length > count) {
                                                degreeDetails.push([
                                                    { text: count, alignment: 'center', pageBreak: 'after' },
                                                    { text: receipt, alignment: 'center', pageBreak: 'after' },
                                                    { text: studentName, alignment: 'center', pageBreak: 'after' },
                                                    { text: document.courseName, alignment: 'center', pageBreak: 'after' },
                                                    { text: monthYear, alignment: 'center', pageBreak: 'after' },
                                                    { text: document.convocationNo, alignment: 'center', pageBreak: 'after' },
                                                    { text: document.grade, alignment: 'center', pageBreak: 'after' },
                                                ])
                                            } else if (count == 5 && documentDetails.length == count) {
                                                degreeDetails.push([
                                                    { text: count, alignment: 'center', pageBreak: 'before' },
                                                    { text: receipt, alignment: 'center', pageBreak: 'before' },
                                                    { text: studentName, alignment: 'center', pageBreak: 'before' },
                                                    { text: document.courseName, alignment: 'center', pageBreak: 'before' },
                                                    { text: monthYear, alignment: 'center', pageBreak: 'after' },
                                                    { text: document.convocationNo, alignment: 'center', pageBreak: 'before' },
                                                    { text: document.grade, alignment: 'center', pageBreak: 'before' },
                                                ])
                                            } else {
                                                degreeDetails.push([
                                                    { text: count, alignment: 'center' },
                                                    { text: receipt, alignment: 'center' },
                                                    { text: studentName, alignment: 'center' },
                                                    { text: document.courseName, alignment: 'center' },
                                                    { text: monthYear, alignment: 'center' },
                                                    { text: document.convocationNo, alignment: 'center' },
                                                    { text: document.grade, alignment: 'center' },
                                                ])
                                            }
                                        })
                                        let instituteDetails = await functions.getInstituteDetails(userId, app_id, 'degree');
                                        let institutes = await functions.getDistinctInstitute(instituteDetails);
                                        var count = 0;
                                        var count_inst = 0;
                                        for (let institute of institutes) {
                                            count_inst++;
                                            var instCountWords = converter.toWords(count_inst);
                                            var genFile = app_id + "_" + instCountWords + "_" + "degreeVerificationCertificate.pdf";
                                            var letterFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
                                            if (!fs.existsSync(letterFile)) {
                                                let generatedDoc = await functions.generateLetters(userId, degreeDetails, 'degree', institute, app_id, width, content, tablelayout, enrollmentNumber, application.app_status, academicYear, count_inst, belowContent, tableHeader);
                                                if (generatedDoc.fileName == '') {
                                                    callback(generatedDoc.error)
                                                } else {
                                                    let verificationLetter = await functions.getVerificationLetter(generatedDoc.fileName, userId, app_id);
                                                    if (verificationLetter == null) {
                                                        await functions.addVerificationLetter(generatedDoc.fileName, userId, app_id, instituteDetails[0].type, institute.count);
                                                    }
                                                }
                                            } else {
                                                let verificationLetter = await functions.getVerificationLetter(genFile, userId, app_id);
                                                if (verificationLetter == null) {
                                                    await functions.addVerificationLetter(genFile, userId, app_id, instituteDetails[0].type, institute.count);
                                                }
                                            }

                                        }

                                        require('async').eachSeries(documentDetails, function (document, callback) {
                                            var fname = document.course_name.split(' ').join('_');
                                            var fileName = path.parse(document.file).name;
                                            var genFile = app_id + '_' + fname + '_' + fileName + '.pdf';
                                            var documentFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
                                            if (!fs.existsSync(documentFile)) {
                                                var filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + document.file;
                                                if (fs.existsSync(filePath)) {
                                                    var outputDirectory = '';

                                                    var extension = document.file.split('.').pop();

                                                    var folderName = fileName;
                                                    var numOfpages;
                                                    if (extension == 'pdf' || extension == 'PDF') {
                                                        let updateDocumentPromise = new Promise((resolve, reject) => {
                                                            outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/";
                                                            if (!fs.existsSync(outputDirectory)) {
                                                                fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                            }
                                                            self_PDF.pdfToImageConversion(fileName, userId, filePath, outputDirectory);
                                                            let dataBuffer = fs.readFileSync(filePath);
                                                            pdf(dataBuffer).then(function (data) {
                                                                numOfpages = data.numpages;
                                                            });
                                                            var mergeFileString = { fileString: '', fileString1: '' };
                                                            setTimeout(() => {
                                                                outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/signed_" + folderName + "/";
                                                                if (!fs.existsSync(outputDirectory)) {
                                                                    fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                                }
                                                                var pagesLength = numOfpages.toString().length;
                                                                for (var i = 1; i <= numOfpages; i++) {
                                                                    var j = addZero(i, pagesLength);
                                                                    filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/" + fileName + "-" + j + ".jpg";
                                                                    file_name = fileName + "-" + j;
                                                                    self_PDF.signDocument(file_name, userId, app_id, filePath, outputDirectory, fname, 'degree', fileName, 'false', function (err, fileName1) {
                                                                        if (err) {
                                                                            reject(err);
                                                                        } else {
                                                                            mergeFileString.fileString = mergeFileString.fileString + ' "' + outputDirectory + fileName1 + '"';
                                                                            self_PDF.signDocument_notForPrint(file_name, userId, app_id, filePath, outputDirectory, fname, 'degree', fileName, 'false', function (err, fileName1) {
                                                                                if (err) {
                                                                                    reject(err);
                                                                                } else {
                                                                                    mergeFileString.fileString1 = mergeFileString.fileString1 + ' "' + outputDirectory + fileName1 + '"';
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            }, 4000);
                                                            setTimeout(() => { resolve(mergeFileString) }, 8000);
                                                        });
                                                        updateDocumentPromise.then((values) => {
                                                            outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
                                                            if (!fs.existsSync(outputDirectory)) {
                                                                fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                            }
                                                            var outputFile = outputDirectory + app_id + '_' + fname + '_' + fileName + '.pdf';
                                                            var outputFile1 = outputDirectory + app_id + '_' + fname + '_' + fileName + '_noPrint.pdf';
                                                            self_PDF.merge(values.fileString1, outputFile1, function (err) {
                                                                if (err) {
                                                                    callback(err, '')
                                                                } else {
                                                                    self_PDF.merge(values.fileString, outputFile, function (err) {
                                                                        if (err) {
                                                                            callback(err, '')
                                                                        } else {
                                                                            models.InstituteDetails.findAll({
                                                                                where: {
                                                                                    user_id: userId,
                                                                                    app_id: app_id,
                                                                                    type: 'degree'
                                                                                }
                                                                            }).then(function (instituteDetails) {
                                                                                models.VerificationLetters.findOne({
                                                                                    where: {
                                                                                        file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
                                                                                        user_id: userId,
                                                                                        app_id: app_id
                                                                                    }
                                                                                }).then(function (verificationLetters) {
                                                                                    if (verificationLetters == null) {
                                                                                        models.VerificationLetters.create({
                                                                                            file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
                                                                                            user_id: userId,
                                                                                            app_id: app_id,
                                                                                            doc_type: instituteDetails[0].type,
                                                                                            noOfCopies: instituteDetails.length
                                                                                        }).then(function (addedLetter) {
                                                                                            if (addedLetter) {
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            })
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        },
                                                            (error) => {
                                                                callback(error, '')
                                                            })
                                                    } else {
                                                        outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
                                                        if (!fs.existsSync(outputDirectory)) {
                                                            fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
                                                        }
                                                        self_PDF.signDocument_notForPrint(fileName, userId, app_id, filePath, outputDirectory, fname, 'degree', fileName, 'false', function (err, fileName_no) {
                                                            if (err) {
                                                                callback(err, '');
                                                            } else {
                                                                self_PDF.signDocument(fileName, userId, app_id, filePath, outputDirectory, fname, 'degree', fileName, 'false', function (err, fileName) {
                                                                    if (err) {
                                                                        callback(err, '');
                                                                    } else {
                                                                        models.InstituteDetails.findAll({
                                                                            where: {
                                                                                user_id: userId,
                                                                                app_id: app_id,
                                                                                type: 'degree'
                                                                            }
                                                                        }).then(function (instituteDetails) {
                                                                            models.VerificationLetters.findOne({
                                                                                where: {
                                                                                    file_name: fileName,
                                                                                    user_id: userId,
                                                                                    app_id: app_id
                                                                                }
                                                                            }).then(function (verificationLetters) {
                                                                                if (verificationLetters == null) {
                                                                                    models.VerificationLetters.create({
                                                                                        file_name: fileName,
                                                                                        user_id: userId,
                                                                                        app_id: app_id,
                                                                                        doc_type: instituteDetails[0].type,
                                                                                        noOfCopies: instituteDetails.length
                                                                                    }).then(function (addedLetter) {
                                                                                        if (addedLetter) {
                                                                                        }
                                                                                    })
                                                                                }
                                                                            })
                                                                        })
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                } else {
                                                    callback('File not found', '');
                                                }
                                            } else {
                                                models.VerificationLetters.findOne({
                                                    where: {
                                                        file_name: genFile,
                                                        user_id: userId,
                                                        app_id: app_id
                                                    }
                                                }).then(function (verificationLetters) {
                                                    if (verificationLetters == null) {
                                                        models.VerificationLetters.create({
                                                            file_name: genFile,
                                                            user_id: userId,
                                                            app_id: app_id,
                                                            doc_type: instituteDetails[0].type,
                                                            noOfCopies: instituteDetails.length
                                                        }).then(function (addedLetter) {
                                                            if (addedLetter) {
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                            setTimeout(() => {
                                                callback('', 'next');
                                            }, 13000)
                                        }, function (err, result) {
                                            if (err) {
                                                reject(err);
                                            } else {

                                                resolveData.degree = "done";
                                                setTimeout(() => { resolve(resolveData) }, 14000)
                                            }
                                        })


                                    }
                                    // models.DocumentDetails.findAll({
                                    //     where: {
                                    //         user_id: userId,
                                    //         app_id: app_id,
                                    //         type: 'degree',
                                    //         degree_Type: {
                                    //             [op.in]:['Provisional Degree Certificate','Internship Completion Certificate']
                                    //         }
                                    //     }
                                    // }).then(function (docs) {
                                    //     if (docs.length > 0) {
                                    //         require('async').eachSeries(docs, function (doc, callback) {

                                    //             var extension = doc.file.split('.').pop();
                                    //             var fileName = '';
                                    //             if (extension == 'pdf' || extension == 'PDF') {
                                    //                 fileName = doc.file;
                                    //             } else {
                                    //                 var filePath = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + doc.file;
                                    //                 var new_filePath = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + path.parse(doc.file).name + '.pdf';
                                    //                 imagesToPdf([filePath], new_filePath);
                                    //                 fileName = path.parse(doc.file).name + '.pdf';
                                    //             }
                                    //             models.VerificationLetters.findOne({
                                    //                 where: {
                                    //                     file_name: fileName,
                                    //                     user_id: userId,
                                    //                     app_id: app_id
                                    //                 }
                                    //             }).then(function (verificationLetters) {
                                    //                 if (verificationLetters == null) {
                                    //                     models.VerificationLetters.create({
                                    //                         file_name: fileName,
                                    //                         user_id: userId,
                                    //                         app_id: app_id,
                                    //                         doc_type: 'degree',
                                    //                         noOfCopies: (verificationTypes.noOfCopies) ? verificationTypes.noOfCopies : 1 
                                    //                     }).then(function (addedLetter) {
                                    //                         if (addedLetter) {
                                    //                         }
                                    //                     })
                                    //                 }
                                    //             })
                                    //             callback('', 'next')
                                    //         }, function (err, result) {
                                    //             if (err) {
                                    //                 reject(err);
                                    //             } else {
                                    //                 resolveData.degree = "done";
                                    //                 setTimeout(() => { resolve(resolveData) }, 4000)

                                    //             }
                                    //         })
                                    //     } else {
                                    //         resolveData.degree = "done";
                                    //         setTimeout(() => { resolve(resolveData) }, 14000)
                                    //     }
                                    // })
                                }).catch(error => {
                                    res.status(400).send(error)
                                })
                            } else {
                                reject('Cannot process application because outward number not updated')
                            }
                        } else {
                            resolveData.degree = "done";
                            setTimeout(() => { resolve(resolveData) }, 1000)
                        }
                    });

                    // Promise.all([marksheetPromise, transcriptPromise, degreePromise]).then((values) => {
                    Promise.all([marksheetPromise, degreePromise]).then((values) => {
                        // if (values[0].marksheet == 'done' && values[0].transcript == 'done' && values[0].degree == 'done') {
                        if (values[0].marksheet == 'done' && values[0].degree == 'done') {

                            application.update({
                                tracker: 'signed',
                                status: 'accept',
                                verified_by: emailAdmin,
                                verified_date: moment().format("YYYY-MM-DD HH:mm:ss")
                            }).then(function (updatedApp) {

                                if (updatedApp) {
                                    models.User.getUserDetails(app_id).then(function (userData) {
                                        var user = userData[0];
                                        const data1 = 'Application ' + app_id + ' is signed' + emailAdmin;
                                        const activity = "Application Signed"
                                        models.Activitytracker.create({
                                            user_id: userId,
                                            application_id: app_id,
                                            data: data1,
                                            activity: activity,
                                            source: 'hsncverification'
                                        }).then(function (activity) {

                                            var url = config.get('email').BASE_URL_SENDGRID + 'applicationStatus';
                                            if (user.agentName != null) {
                                                request.post(url, {
                                                    json: {
                                                        mobile: user.agentMobile,
                                                        mobile_country_code: user.agentMobileCountryCode,
                                                        userName: user.agentName,
                                                        email: user.agentEmail,
                                                        studentName: user.studentName,
                                                        app_id: app_id,
                                                        statusType: 'signed-signed',
                                                        source: 'hsncverification',
                                                        user_type: 'agent'
                                                    }
                                                }, function (error, response, body) {

                                                });
                                            } else {
                                                request.post(url, {
                                                    json: {
                                                        mobile: user.studentMobile,
                                                        mobile_country_code: user.studentMobileCountryCode,
                                                        userName: user.studentName,
                                                        email: user.studentEmail,
                                                        statusType: 'signed-signed',
                                                        app_id: app_id,
                                                        source: 'hsncverification',
                                                        user_type: 'student'
                                                    }
                                                }, function (error, response, body) {

                                                });
                                            }
                                            res.json({
                                                status: 200,
                                                message: "Application Verified Successfully"
                                            })

                                        }).catch(error => {
                                        })
                                    }).catch(error => {
                                    })
                                } else {
                                    res.json({
                                        status: 400,
                                        message: "Application cannot proceed to next stage."
                                    })
                                }
                            }).catch(error => {
                            })
                        }


                    }, (error) => {
                        return res.json({
                            status: 400,
                            message: error
                        })
                    })

                }).catch(error => {
                    res.status(400).send(error)
                })

            }).catch(error => {
                res.status(400).send(error)
            })
        }).catch(error => {
            res.status(400).send(error)
        })
    }
})


// router.post('/generateCertificates', (req, res, next) => {
//     console.log("POST - application/generateCertificates");
//     const clientIP = req.body.clientIP;
//     var app_id = req.body.app_id;
//     var userId = req.body.userId;
//     var emailAdmin = req.user.email;
//     if (emailAdmin.includes('@edulab.in') && edulabAllow == false) {
//         res.json({
//             status: 400,
//             message: "You don't have persmission"
//         })
//     } else {
//         var resolveData = { marksheet: null, transcript: null, degree: null};
//         models.User.findOne({
//             where: {
//                 id: userId
//             }
//         }).then(function (user) {
//             models.Application.findOne({
//                 where: {
//                     id: app_id
//                 }
//             }).then(function (application) {

//                 var month = moment(new Date(application.created_at)).month();
//                 var year = moment(new Date(application.created_at)).year();
//                 var academicYear;
//                 if(month > 4){
//                     academicYear = year + '-' + (year + 1);
//                 }else if(month <= 4){
//                     academicYear = (year - 1) + '-' + year;
//                 }
//                 models.VerificationTypes.findOne({
//                     where: {
//                         user_id: userId,
//                         app_id: app_id
//                     }
//                 }).then(function (verificationTypes) {
//                     let marksheetPromise = new Promise(function (resolve, reject) {
//                         if (verificationTypes.marksheet == true) {
//                             models.Application.MDT_getEnrollmentNumber(userId, app_id, 'marksheet').then(function (enrollmentNumber) {
//                                 if(enrollmentNumber.length > 0){
//                                     models.DocumentDetails.findAll({
//                                         where: {
//                                             user_id: userId,
//                                             app_id: app_id,
//                                             type: 'marksheet'
//                                         }
//                                     }).then(function (documentDetails) {
//                                         var marksheetDetails = [];
//                                         var studentName = user.marksheetName.toUpperCase();
//                                         var prefix = '';
//                                         if(user.gender == 'Male'){
//                                             prefix = 'Mr.';
//                                         }else if(user.gender == 'Female'){
//                                             prefix = 'Miss';
//                                         }
//                                         var width = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

//                                         var content = 'With reference to subject cited above, I am to confirm that the documents mentioned below in respect of ' + prefix + ' ' + studentName + ' have been verified and found genuine.'
//                                         var belowContent = 'The above details have been verified from this office records. After verification, it is observed that the aforesaid documents have been issued by the University and details mentioned in the documents are found to be correct.'
//                                         var tableHeader = 'Details of Statement of Marks';
//                                         marksheetDetails.push([{ text: 'Name of the Examination', bold: true, alignment: 'center' }, { text: 'Seat No', bold: true, alignment: 'center' }, { text: 'Month & Year of Examination', bold: true, alignment: 'center' }, { text: 'Status', bold: true, alignment: 'center' }, { text: 'SGPI/CGPA', bold: true, alignment: 'center' }, { text: 'Mode of Study', bold: true, alignment: 'center' }]);
//                                         var count = 0;
//                                         var tablelayout = 'borders'

//                                         documentDetails.forEach(document => {
//                                             count++;
//                                             var courseName = document.courseName + '(' + document.semester + ')';
//                                             var monthYear = moment(new Date(document.PassingMonthYear)).format('MMMM YYYY');
//                                             if(count == 5 && documentDetails.length > count){
//                                                 marksheetDetails.push([{text:courseName,alignment:'center',pageBreak: 'after'},
//                                                     {text:document.seatNo,alignment:'center' ,pageBreak: 'after'},
//                                                     {text:monthYear,alignment:'center',pageBreak: 'after'},
//                                                     {text:document.resultClass,alignment:'center',pageBreak: 'after'},
//                                                     {text:document.SGPI,alignment:'center',pageBreak: 'after'},
//                                                     {text:document.courseType,alignment:'center',pageBreak: 'after'}
//                                                 ])
//                                             }else if(count == 5 && documentDetails.length == count){
//                                                 marksheetDetails.push([{text:courseName,alignment:'center',pageBreak: 'before'},
//                                                     {text:document.seatNo,alignment:'center' ,pageBreak: 'before'},
//                                                     {text:monthYear,alignment:'center',pageBreak: 'before'},
//                                                     {text:document.resultClass,alignment:'center',pageBreak: 'before'},
//                                                     {text:document.SGPI,alignment:'center',pageBreak: 'before'},
//                                                     {text:document.courseType,alignment:'center',pageBreak: 'before'}
//                                                 ])
//                                             }else{
//                                                 marksheetDetails.push([{ text: courseName, alignment: 'center' },
//                                                 { text: document.seatNo, alignment: 'center' },
//                                                 { text: monthYear, alignment: 'center' },
//                                                 { text: document.resultClass, alignment: 'center' },
//                                                 { text: document.SGPI, alignment: 'center' },
//                                                 { text: document.courseType, alignment: 'center' }
//                                                 ])
//                                             }
//                                         })
//                                         models.InstituteDetails.findAll({
//                                             where: {
//                                                 user_id: userId,
//                                                 app_id: app_id,
//                                                 type: 'marksheet'
//                                             }
//                                         }).then(function (instituteDetails) {
//                                             var institutes = [...instituteDetails.reduce((mp, o) => {
//                                                 const key = JSON.stringify([o.name]);
//                                                 if (!mp.has(key)) mp.set(key, { refNo: o.referenceNo, name: o.name, address: o.address, count: 0 });
//                                                 mp.get(key).count++;
//                                                 return mp;
//                                             }, new Map).values()];
//                                             var count = 0;
//                                             var count_inst = 0;
//                                             require('async').eachSeries(institutes, function (institute, callback) {
//                                                 count_inst++;
//                                                 var instCountWords = converter.toWords(count_inst);
//                                                 var genFile = app_id + "_" + instCountWords + "_" +   "marksheetVerificationCertificate.pdf";
//                                                 var letterFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
//                                                 if(!fs.existsSync(letterFile)){
//                                                     self_PDF.verificationCertificate_notForPrint(userId, marksheetDetails, 'marksheet', institute, app_id, width, content, tablelayout, enrollmentNumber[0], application.app_status, academicYear, count_inst,belowContent,tableHeader, function (err, filename) {
//                                                         if (err) {
//                                                             callback(err, '');
//                                                         } else {
//                                                             self_PDF.verificationCertificate(userId, marksheetDetails, 'marksheet', institute, app_id, width, content, tablelayout, enrollmentNumber[0], application.app_status, academicYear, count_inst,belowContent,tableHeader, function (err, filename) {
//                                                                 if (err) {
//                                                                     callback(err, '');
//                                                                 } else {
//                                                                     models.VerificationLetters.findOne({
//                                                                         where: {
//                                                                             file_name: filename,
//                                                                             user_id: userId,
//                                                                             app_id: app_id
//                                                                         }
//                                                                     }).then(function (verificationLetters) {
//                                                                         if (verificationLetters == null) {
//                                                                             models.VerificationLetters.create({
//                                                                                 file_name: filename,
//                                                                                 user_id: userId,
//                                                                                 app_id: app_id,
//                                                                                 doc_type: instituteDetails[0].type,
//                                                                                 noOfCopies: institute.count
//                                                                             }).then(function (addedLetter) {
//                                                                                 if (addedLetter) {

//                                                                                 }
//                                                                             })
//                                                                         }
//                                                                     })
//                                                                 }
//                                                             })
//                                                         }
//                                                     })
//                                                 }else{
//                                                     models.VerificationLetters.findOne({
//                                                         where: {
//                                                             file_name: genFile,
//                                                             user_id: userId,
//                                                             app_id: app_id
//                                                         }
//                                                     }).then(function (verificationLetters) {
//                                                         if (verificationLetters == null) {
//                                                             models.VerificationLetters.create({
//                                                                 file_name: genFile,
//                                                                 user_id: userId,
//                                                                 app_id: app_id,
//                                                                 doc_type: instituteDetails[0].type,
//                                                                 noOfCopies: institute.count
//                                                             }).then(function (addedLetter) {
//                                                                 if (addedLetter) {
//                                                                 }
//                                                             })
//                                                         }
//                                                     })
//                                                 }
//                                                 callback('', 'next')
//                                             }, function (err, result) {
//                                                 if (err) {
//                                                     reject(err);
//                                                 } else {
//                                                     require('async').eachSeries(documentDetails, function (document, callback) {
//                                                         var fname = document.course_name.split(' ').join('_');
//                                                         var fileName = path.parse(document.file).name;
//                                                         var genFile = app_id + '_' + fname + '_' + fileName + '.pdf';
//                                                         var documentFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
//                                                         if(!fs.existsSync(documentFile)){
//                                                             var filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + document.file;
//                                                             if (fs.existsSync(filePath)) {
//                                                                 var outputDirectory = '';

//                                                                 var extension = document.file.split('.').pop();

//                                                                 var folderName = fileName;
//                                                                 var numOfpages;
//                                                                 if (extension == 'pdf' || extension == 'PDF') {
//                                                                     let updateDocumentPromise = new Promise((resolve, reject) => {
//                                                                         outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/";
//                                                                         if (!fs.existsSync(outputDirectory)) {
//                                                                             fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                                                                         }
//                                                                         self_PDF.pdfToImageConversion(fileName, userId, filePath, outputDirectory);
//                                                                         let dataBuffer = fs.readFileSync(filePath);
//                                                                         pdf(dataBuffer).then(function (data) {
//                                                                             numOfpages = data.numpages;
//                                                                         });

//                                                                         var mergeFileString = { fileString: '', fileString1: '' };
//                                                                         setTimeout(() => {
//                                                                             outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/signed_" + folderName + "/";
//                                                                             if (!fs.existsSync(outputDirectory)) {
//                                                                                 fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                                                                             }
//                                                                             var pagesLength = numOfpages.toString().length;
//                                                                             for (var i = 1; i <= numOfpages; i++) {
//                                                                                 var j = addZero(i, pagesLength);
//                                                                                 filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/" + fileName + "-" + j + ".jpg";
//                                                                                 file_name = fileName + "-" + j;
//                                                                                 self_PDF.signDocument(file_name, userId, app_id, filePath, outputDirectory, fname, 'marksheet', fileName, 'false', function (err, fileName1) {
//                                                                                     if (err) {
//                                                                                         reject(err);
//                                                                                     } else {
//                                                                                         mergeFileString.fileString = mergeFileString.fileString + ' "' + outputDirectory + fileName1 + '"';
//                                                                                         self_PDF.signDocument_notForPrint(file_name, userId, app_id, filePath, outputDirectory, fname, 'marksheet', fileName, 'false', function (err, fileName1) {
//                                                                                             if (err) {
//                                                                                                 reject(err);
//                                                                                             } else {
//                                                                                                 mergeFileString.fileString1 = mergeFileString.fileString1 + ' "' + outputDirectory + fileName1 + '"';
//                                                                                             }
//                                                                                         });
//                                                                                     }
//                                                                                 });
//                                                                             }
//                                                                         }, 6000);
//                                                                         setTimeout(() => { resolve(mergeFileString) }, 12000);
//                                                                     });
//                                                                     updateDocumentPromise.then((values) => {
//                                                                         outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
//                                                                         if (!fs.existsSync(outputDirectory)) {
//                                                                             fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                                                                         }
//                                                                         var outputFile = outputDirectory + app_id + '_' + fname + '_' + fileName + '.pdf';
//                                                                         var outputFile1 = outputDirectory + app_id + '_' + fname + '_' + fileName + '_noPrint.pdf';
//                                                                         self_PDF.merge(values.fileString, outputFile1, function (err) {
//                                                                             if (err) {
//                                                                                 callback(document.file + 'of ' + document.courseName + ' ' + document.type + ' cannot merge', '')
//                                                                             } else {
//                                                                                 self_PDF.merge(values.fileString, outputFile, function (err) {
//                                                                                     if (err) {
//                                                                                         callback(document.file + ' of ' + document.courseName + ' ' + document.type + ' cannot merge', '')
//                                                                                     } else {
//                                                                                         models.VerificationLetters.findOne({
//                                                                                             where: {
//                                                                                                 file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
//                                                                                                 user_id: userId,
//                                                                                                 app_id: app_id
//                                                                                             }
//                                                                                         }).then(function (verificationLetters) {
//                                                                                             if (verificationLetters == null) {
//                                                                                                 models.VerificationLetters.create({
//                                                                                                     file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
//                                                                                                     user_id: userId,
//                                                                                                     app_id: app_id,
//                                                                                                     doc_type: instituteDetails[0].type,
//                                                                                                     noOfCopies: instituteDetails.length
//                                                                                                 }).then(function (addedLetter) {
//                                                                                                     if (addedLetter) {

//                                                                                                     }
//                                                                                                 })
//                                                                                             }
//                                                                                         })
//                                                                                     }
//                                                                                 });
//                                                                             }
//                                                                         });
//                                                                     },
//                                                                         (error) => {
//                                                                             reject(document.file + ' of ' + document.course_name + ' ' + document.type + ' can not process')
//                                                                         })
//                                                                 } else {
//                                                                     outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
//                                                                     if (!fs.existsSync(outputDirectory)) {
//                                                                         fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                                                                     }
//                                                                     self_PDF.signDocument_notForPrint(fileName, userId, app_id, filePath, outputDirectory, fname, 'marksheet', fileName, 'false', function (err, fileName_no) {
//                                                                         if (err) {
//                                                                             callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' can not process', '')
//                                                                         } else {
//                                                                             self_PDF.signDocument(fileName, userId, app_id, filePath, outputDirectory, fname, 'marksheet', fileName, 'false', function (err, fileName) {
//                                                                                 if (err) {
//                                                                                     callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' can not process', '')
//                                                                                 } else {
//                                                                                     models.VerificationLetters.findOne({
//                                                                                         where: {
//                                                                                             file_name: fileName,
//                                                                                             user_id: userId,
//                                                                                             app_id: app_id
//                                                                                         }
//                                                                                     }).then(function (verificationLetters) {
//                                                                                         if (verificationLetters == null) {
//                                                                                             models.VerificationLetters.create({
//                                                                                                 file_name: fileName,
//                                                                                                 user_id: userId,
//                                                                                                 app_id: app_id,
//                                                                                                 doc_type: instituteDetails[0].type,
//                                                                                                 noOfCopies: instituteDetails.length
//                                                                                             }).then(function (addedLetter) {
//                                                                                                 if (addedLetter) {

//                                                                                                 }
//                                                                                             })
//                                                                                         }
//                                                                                     })
//                                                                                 }
//                                                                             });
//                                                                         }
//                                                                     });
//                                                                 }
//                                                             } else {
//                                                                 callback('File not Found', '')
//                                                             }
//                                                         }else{
//                                                             models.VerificationLetters.findOne({
//                                                                 where: {
//                                                                     file_name: genFile,
//                                                                     user_id: userId,
//                                                                     app_id: app_id
//                                                                 }
//                                                             }).then(function (verificationLetters) {
//                                                                 if (verificationLetters == null) {
//                                                                     models.VerificationLetters.create({
//                                                                         file_name: genFile,
//                                                                         user_id: userId,
//                                                                         app_id: app_id,
//                                                                         doc_type: instituteDetails[0].type,
//                                                                         noOfCopies: instituteDetails.length
//                                                                     }).then(function (addedLetter) {
//                                                                         if (addedLetter) {
//                                                                         }
//                                                                     })
//                                                                 }
//                                                             })
//                                                         }
//                                                         setTimeout(() => {
//                                                             callback('', 'next');
//                                                         }, 13000)
//                                                     }, function (err, result) {
//                                                         if (err) {
//                                                             reject(err);
//                                                         } else {
//                                                             resolveData.marksheet = "done";
//                                                             setTimeout(() => { resolve(resolveData) }, 14000)
//                                                         }
//                                                     })

//                                                 }
//                                             })
//                                         })
//                                     }).catch(err =>{
//                                     })
//                                 }else{
//                                     reject('Cannot process application because outward number not updated')
//                                 }
//                             })
//                         } else {
//                             resolveData.marksheet = "done";
//                             setTimeout(() => { resolve(resolveData) }, 1000)
//                         }
//                     });

//                     // let transcriptPromise = new Promise(function (resolve, reject) {
//                     //     if (verificationTypes.transcript == true) {
//                     //         models.Application.MDT_getEnrollmentNumber(userId, app_id, 'transcript').then(function (enrollmentNumber) {
//                     //             if(enrollmentNumber.length > 0){
//                     //                 models.DocumentDetails.findAll({
//                     //                     where: {
//                     //                         user_id: userId,
//                     //                         app_id: app_id,
//                     //                         type: 'transcript'
//                     //                     }
//                     //                 }).then(function (documentDetails) {
//                     //                     require('async').eachSeries(documentDetails, function (document, callback) {
//                     //                         var fname = document.course_name.split(' ').join('_');
//                     //                         var fileName = path.parse(document.file).name;
//                     //                         var genFile = app_id + '_' + fname + '_' + fileName + '.pdf';
//                     //                         var documentFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
//                     //                         if(!fs.existsSync(documentFile)){
//                     //                             var filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + document.file;
//                     //                             if (fs.existsSync(filePath)) {
//                     //                                 var outputDirectory = '';

//                     //                                 var extension = document.file.split('.').pop();

//                     //                                 var folderName = fileName;
//                     //                                 var numOfpages;
//                     //                                 if (extension == 'pdf' || extension == 'PDF') {
//                     //                                     let updateDocumentPromise = new Promise((resolve, reject) => {
//                     //                                         outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/";
//                     //                                         if (!fs.existsSync(outputDirectory)) {
//                     //                                             fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                     //                                         }
//                     //                                         self_PDF.pdfToImageConversion(fileName, userId, filePath, outputDirectory);
//                     //                                         let dataBuffer = fs.readFileSync(filePath);
//                     //                                         pdf(dataBuffer).then(function (data) {
//                     //                                             numOfpages = data.numpages;
//                     //                                         });

//                     //                                         var mergeFileString = { fileString: '', fileString1: '' };
//                     //                                         setTimeout(() => {
//                     //                                             outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/signed_" + folderName + "/";
//                     //                                             if (!fs.existsSync(outputDirectory)) {
//                     //                                                 fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                     //                                             }

//                     //                                             var pagesLength = numOfpages.toString().length;
//                     //                                             for (var i = 1; i <= numOfpages; i++) {
//                     //                                                 var j = addZero(i, pagesLength);
//                     //                                                 filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/" + fileName + "-" + j + ".jpg";
//                     //                                                 file_name = fileName + "-" + j;
//                     //                                                 self_PDF.signDocument(file_name, userId, app_id, filePath, outputDirectory, fname, 'transcript', fileName, 'false', function (err, fileName1) {
//                     //                                                     if (err) {
//                     //                                                         reject(err);
//                     //                                                     } else {
//                     //                                                         mergeFileString.fileString = mergeFileString.fileString + ' "' + outputDirectory + fileName1 + '"';
//                     //                                                         self_PDF.signDocument_notForPrint(file_name, userId, app_id, filePath, outputDirectory, fname, 'transcript', fileName, 'false', function (err, fileName1) {
//                     //                                                             if (err) {
//                     //                                                                 reject(err);
//                     //                                                             } else {
//                     //                                                                 mergeFileString.fileString1 = mergeFileString.fileString1 + ' "' + outputDirectory + fileName1 + '"';
//                     //                                                             }
//                     //                                                         });
//                     //                                                     }
//                     //                                                 });
//                     //                                             }
//                     //                                         }, 6000);
//                     //                                         setTimeout(() => { resolve(mergeFileString) }, 12000);
//                     //                                     });
//                     //                                     updateDocumentPromise.then((values) => {
//                     //                                         outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
//                     //                                         if (!fs.existsSync(outputDirectory)) {
//                     //                                             fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                     //                                         }
//                     //                                         var outputFile = outputDirectory + app_id + '_' + fname + '_' + fileName + '.pdf';
//                     //                                         var outputFile1 = outputDirectory + app_id + '_' + fname + '_' + fileName + '_noPrint.pdf';
//                     //                                         self_PDF.merge(values.fileString, outputFile1, function (err) {
//                     //                                             if (err) {
//                     //                                                 callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' cannot merge', '')
//                     //                                             } else {
//                     //                                                 self_PDF.merge(values.fileString, outputFile, function (err) {
//                     //                                                     if (err) {
//                     //                                                         callback(document.file + ' of ' + document.course_name + ' ' + document.type + ' cannot merge', '')
//                     //                                                     } else {
//                     //                                                         models.InstituteDetails.findAll({
//                     //                                                             where: {
//                     //                                                                 user_id: userId,
//                     //                                                                 app_id: app_id,
//                     //                                                                 type: 'transcript'
//                     //                                                             }
//                     //                                                         }).then(function (instituteDetails) {
//                     //                                                             models.VerificationLetters.findOne({
//                     //                                                                 where: {
//                     //                                                                     file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
//                     //                                                                     user_id: userId,
//                     //                                                                     app_id: app_id
//                     //                                                                 }
//                     //                                                             }).then(function (verificationLetters) {
//                     //                                                                 if (verificationLetters == null) {
//                     //                                                                     models.VerificationLetters.create({
//                     //                                                                         file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
//                     //                                                                         user_id: userId,
//                     //                                                                         app_id: app_id,
//                     //                                                                         doc_type: instituteDetails[0].type,
//                     //                                                                         noOfCopies: instituteDetails.length
//                     //                                                                     }).then(function (addedLetter) {
//                     //                                                                         if (addedLetter) {

//                     //                                                                         }
//                     //                                                                     })
//                     //                                                                 }
//                     //                                                             })
//                     //                                                         })
//                     //                                                     }
//                     //                                                 });
//                     //                                             }
//                     //                                         });
//                     //                                     },
//                     //                                         (error) => {
//                     //                                             reject(document.file + ' of ' + document.course_name + ' ' + document.type + ' can not process')
//                     //                                         })
//                     //                                 } else {
//                     //                                     outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
//                     //                                     if (!fs.existsSync(outputDirectory)) {
//                     //                                         fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                     //                                     }
//                     //                                     self_PDF.signDocument_notForPrint(fileName, userId, app_id, filePath, outputDirectory, fname, 'transcript', fileName, 'false', function (err, fileName_no) {
//                     //                                         if (err) {
//                     //                                             callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' can not process', '')
//                     //                                         } else {
//                     //                                             self_PDF.signDocument(fileName, userId, app_id, filePath, outputDirectory, fname, 'transcript', fileName, 'false', function (err, fileName) {
//                     //                                                 if (err) {
//                     //                                                     callback(document.file + 'of ' + document.course_name + ' ' + document.type + ' can not process', '')
//                     //                                                 } else {
//                     //                                                     models.InstituteDetails.findAll({
//                     //                                                         where: {
//                     //                                                             user_id: userId,
//                     //                                                             app_id: app_id,
//                     //                                                             type: 'transcript'
//                     //                                                         }
//                     //                                                     }).then(function (instituteDetails) {
//                     //                                                         models.VerificationLetters.findOne({
//                     //                                                             where: {
//                     //                                                                 file_name: fileName,
//                     //                                                                 user_id: userId,
//                     //                                                                 app_id: app_id
//                     //                                                             }
//                     //                                                         }).then(function (verificationLetters) {
//                     //                                                             if (verificationLetters == null) {
//                     //                                                                 models.VerificationLetters.create({
//                     //                                                                     file_name: fileName,
//                     //                                                                     user_id: userId,
//                     //                                                                     app_id: app_id,
//                     //                                                                     doc_type: instituteDetails[0].type,
//                     //                                                                     noOfCopies: instituteDetails.length
//                     //                                                                 }).then(function (addedLetter) {
//                     //                                                                     if (addedLetter) {

//                     //                                                                     }
//                     //                                                                 })
//                     //                                                             }
//                     //                                                         })
//                     //                                                     })
//                     //                                                 }
//                     //                                             });
//                     //                                         }
//                     //                                     });
//                     //                                 }
//                     //                             } else {
//                     //                                 callback('File not Found', '')
//                     //                             }
//                     //                         }else{
//                     //                             models.VerificationLetters.findOne({
//                     //                                 where: {
//                     //                                     file_name: genFile,
//                     //                                     user_id: userId,
//                     //                                     app_id: app_id
//                     //                                 }
//                     //                             }).then(function (verificationLetters) {
//                     //                                 if (verificationLetters == null) {
//                     //                                     models.VerificationLetters.create({
//                     //                                         file_name: genFile,
//                     //                                         user_id: userId,
//                     //                                         app_id: app_id,
//                     //                                         doc_type: instituteDetails[0].type,
//                     //                                         noOfCopies: instituteDetails.length
//                     //                                     }).then(function (addedLetter) {
//                     //                                         if (addedLetter) {
//                     //                                         }
//                     //                                     })
//                     //                                 }
//                     //                             })
//                     //                         }
//                     //                         setTimeout(() => {
//                     //                             callback('', 'next');
//                     //                         }, 13000)
//                     //                     }, function (err, result) {
//                     //                         if (err) {
//                     //                             reject(err);
//                     //                         } else {
//                     //                             resolveData.transcript = "done";
//                     //                             setTimeout(() => { resolve(resolveData) }, 14000)
//                     //                         }
//                     //                     })
//                     //                 })
//                     //             }else{
//                     //                 reject('Cannot process application because outward number not updated')
//                     //             }
//                     //         })
//                     //     } else {
//                     //         resolveData.transcript = "done";
//                     //         setTimeout(() => { resolve(resolveData) }, 1000)
//                     //     }
//                     // });


//                     let degreePromise = new Promise(function (resolve, reject) {
//                         if (verificationTypes.degreeCertificate == true) {
//                             models.Application.MDT_getEnrollmentNumber(userId, app_id, 'degree').then(function (enrollmentNumber) {
//                                 models.DocumentDetails.findAll({
//                                     where: {
//                                         user_id: userId,
//                                         app_id: app_id,
//                                         type: 'degree',
//                                     }
//                                 }).then(function (documentDetails) {
//                                     models.Orders.findOne({
//                                         where :{
//                                             application_id : app_id,
//                                             user_id : userId
//                                         }
//                                     }).then(function(orders){
//                                         if (documentDetails.length > 0) {
//                                             if(enrollmentNumber.length> 0){
//                                                 var degreeDetails = [];
//                                                 var studentName = user.marksheetName.toUpperCase();
//                                                 var prefix = '';
//                                                 if(user.gender == 'Male'){
//                                                     prefix = 'Mr.';
//                                                 }else if(user.gender == 'Female'){
//                                                     prefix = 'Miss';
//                                                 }
//                                                 var width = ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'];

//                                                 var content = 'With reference to subject cited above, I am to confirm that the documents mentioned below in respect of ' + prefix + ' ' + studentName + ' have been verified and found genuine.'
//                                                 var belowContent = 'The above details have been verified from this office records. After verification, it is observed that the aforesaid documents have been issued by the University and details mentioned in the documents are found to be correct.'
//                                                 var tableHeader = 'Details of Degree Certificate';
//                                                 var tablelayout = 'noBorders';
//                                                 degreeDetails.push([{ text: 'Sr. No', bold: true, alignment: 'center' }, { text: 'Receipt No & Date', bold: true, alignment: 'center' }, { text: 'Name of Candidate', bold: true, alignment: 'center' }, { text: 'Exam', bold: true, alignment: 'center' }, { text: 'Month & Year of Exam', bold: true, alignment: 'center' }, { text: 'Convocation No.', bold: true, alignment: 'center' }, { text: 'Remarks', bold: true, alignment: 'center' }]);
//                                                 var count = 0;
//                                                 var tablelayout = 'borders'
//                                                 var receipt = orders.id + " " + moment(new Date(orders.timestamp)).format('DD/MM/YYYY');

//                                                 documentDetails.forEach(document => {
//                                                     count++;
//                                                     //var courseName = document.courseName + '(' + document.semester + ')';

//                                                     var monthYear = moment(new Date(document.PassingMonthYear)).format('MMMM YYYY');
//                                                     if(count == 5 && documentDetails.length > count){
//                                                         degreeDetails.push([
//                                                             {text:count,alignment:'center',pageBreak: 'after'},
//                                                             {text:receipt,alignment:'center',pageBreak: 'after'},
//                                                             {text:studentName,alignment:'center',pageBreak: 'after'},
//                                                             {text:document.courseName,alignment:'center' ,pageBreak: 'after'},
//                                                             {text:monthYear,alignment:'center',pageBreak: 'after'},
//                                                             {text:document.convocationNo,alignment:'center',pageBreak: 'after'},
//                                                             {text:document.resultClass,alignment:'center',pageBreak: 'after'},
//                                                         ])
//                                                     }else if(count == 5 && documentDetails.length == count){
//                                                         degreeDetails.push([
//                                                             {text:count,alignment:'center',pageBreak: 'before'},
//                                                             {text:receipt,alignment:'center',pageBreak: 'before'},
//                                                             {text:studentName,alignment:'center',pageBreak: 'before'},
//                                                             {text:document.courseName,alignment:'center' ,pageBreak: 'before'},
//                                                             {text:monthYear,alignment:'center',pageBreak: 'after'},
//                                                             {text:document.convocationNo,alignment:'center',pageBreak: 'before'},
//                                                             {text:document.resultClass,alignment:'center',pageBreak: 'before'},
//                                                         ])
//                                                     }else{
//                                                         degreeDetails.push([
//                                                             {text:count,alignment:'center'},
//                                                             {text:receipt,alignment:'center'},
//                                                             {text:studentName,alignment:'center'},
//                                                             {text:document.courseName,alignment:'center'},
//                                                             {text:monthYear,alignment:'center'},
//                                                             {text:document.convocationNo,alignment:'center'},
//                                                             {text:document.resultClass,alignment:'center'},
//                                                         ])
//                                                     }
//                                                 })
//                                                 models.InstituteDetails.findAll({
//                                                     where: {
//                                                         user_id: userId,
//                                                         app_id: app_id,
//                                                         type: 'degree'
//                                                     }
//                                                 }).then(function (instituteDetails) {
//                                                     var institutes = [...instituteDetails.reduce((mp, o) => {
//                                                         const key = JSON.stringify([o.name]);
//                                                         if (!mp.has(key)) mp.set(key, { refNo: o.referenceNo, name: o.name, address: o.address, count: 0 });
//                                                         mp.get(key).count++;
//                                                         return mp;
//                                                     }, new Map).values()];
//                                                     var count = 0;
//                                                     var count_inst = 0;
//                                                     require('async').eachSeries(institutes, function (institute, callback) {
//                                                         count_inst++;
//                                                         var instCountWords = converter.toWords(count_inst);
//                                                         var genFile = app_id + "_" + instCountWords + "_" +   "degreeVerificationCertificate.pdf";
//                                                         var letterFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
//                                                         if(!fs.existsSync(letterFile)){
//                                                             self_PDF.verificationCertificate_notForPrint(userId, degreeDetails, 'degree', institute, app_id, width, content, tablelayout, enrollmentNumber[0], application.app_status, academicYear, count_inst,belowContent,tableHeader, function (err, filename) {
//                                                                 if (err) {
//                                                                     callback(err, '');
//                                                                 } else {
//                                                                     self_PDF.verificationCertificate(userId, degreeDetails, 'degree', institute, app_id, width, content, tablelayout, enrollmentNumber[0], application.app_status, academicYear, count_inst,belowContent,tableHeader, function (err, filename) {
//                                                                         if (err) {
//                                                                             callback(err, '');
//                                                                         } else {
//                                                                             models.VerificationLetters.findOne({
//                                                                                 where: {
//                                                                                     file_name: filename,
//                                                                                     user_id: userId,
//                                                                                     app_id: app_id
//                                                                                 }
//                                                                             }).then(function (verificationLetters) {
//                                                                                 if (verificationLetters == null) {
//                                                                                     models.VerificationLetters.create({
//                                                                                         file_name: filename,
//                                                                                         user_id: userId,
//                                                                                         app_id: app_id,
//                                                                                         doc_type: instituteDetails[0].type,
//                                                                                         noOfCopies: institute.count
//                                                                                     }).then(function (addedLetter) {
//                                                                                         if (addedLetter) {
//                                                                                         }
//                                                                                     })
//                                                                                 }
//                                                                             })
//                                                                         }
//                                                                     })
//                                                                 }
//                                                             })
//                                                         }else{
//                                                             models.VerificationLetters.findOne({
//                                                                 where: {
//                                                                     file_name: genFile,
//                                                                     user_id: userId,
//                                                                     app_id: app_id
//                                                                 }
//                                                             }).then(function (verificationLetters) {
//                                                                 if (verificationLetters == null) {
//                                                                     models.VerificationLetters.create({
//                                                                         file_name: genFile,
//                                                                         user_id: userId,
//                                                                         app_id: app_id,
//                                                                         doc_type: instituteDetails[0].type,
//                                                                         noOfCopies: institute.count
//                                                                     }).then(function (addedLetter) {
//                                                                         if (addedLetter) {
//                                                                         }
//                                                                     })
//                                                                 }
//                                                             })
//                                                         }
//                                                         callback('', 'next');
//                                                     }, function (err, reuslt) {
//                                                         if (err) {
//                                                             reject(err)
//                                                         } else {
//                                                             require('async').eachSeries(documentDetails, function (document, callback) {
//                                                                 var fname = document.course_name.split(' ').join('_');
//                                                                 var fileName = path.parse(document.file).name;
//                                                                 var genFile = app_id + '_' + fname + '_' + fileName + '.pdf';
//                                                                 var documentFile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + genFile;
//                                                                 if(!fs.existsSync(documentFile)){
//                                                                     var filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + document.file;
//                                                                     if (fs.existsSync(filePath)) {
//                                                                         var outputDirectory = '';

//                                                                         var extension = document.file.split('.').pop();

//                                                                         var folderName = fileName;
//                                                                         var numOfpages;
//                                                                         if (extension == 'pdf' || extension == 'PDF') {
//                                                                             let updateDocumentPromise = new Promise((resolve, reject) => {
//                                                                                 outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/";
//                                                                                 if (!fs.existsSync(outputDirectory)) {
//                                                                                     fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                                                                                 }
//                                                                                 self_PDF.pdfToImageConversion(fileName, userId, filePath, outputDirectory);
//                                                                                 let dataBuffer = fs.readFileSync(filePath);
//                                                                                 pdf(dataBuffer).then(function (data) {
//                                                                                     numOfpages = data.numpages;
//                                                                                 });
//                                                                                 var mergeFileString = { fileString: '', fileString1: '' };
//                                                                                 setTimeout(() => {
//                                                                                     outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/signed_" + folderName + "/";
//                                                                                     if (!fs.existsSync(outputDirectory)) {
//                                                                                         fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                                                                                     }
//                                                                                     var pagesLength = numOfpages.toString().length;
//                                                                                     for (var i = 1; i <= numOfpages; i++) {
//                                                                                         var j = addZero(i, pagesLength);
//                                                                                         filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + folderName + "/" + fileName + "-" + j + ".jpg";
//                                                                                         file_name = fileName + "-" + j;
//                                                                                         self_PDF.signDocument(file_name, userId, app_id, filePath, outputDirectory, fname, 'degree', fileName, 'false', function (err, fileName1) {
//                                                                                             if (err) {
//                                                                                                 reject(err);
//                                                                                             } else {
//                                                                                                 mergeFileString.fileString = mergeFileString.fileString + ' "' + outputDirectory + fileName1 + '"';
//                                                                                                 self_PDF.signDocument_notForPrint(file_name, userId, app_id, filePath, outputDirectory, fname, 'degree', fileName, 'false', function (err, fileName1) {
//                                                                                                     if (err) {
//                                                                                                         reject(err);
//                                                                                                     } else {
//                                                                                                         mergeFileString.fileString1 = mergeFileString.fileString1 + ' "' + outputDirectory + fileName1 + '"';
//                                                                                                     }
//                                                                                                 });
//                                                                                             }
//                                                                                         });
//                                                                                     }
//                                                                                 }, 4000);
//                                                                                 setTimeout(() => { resolve(mergeFileString) }, 8000);
//                                                                             });
//                                                                             updateDocumentPromise.then((values) => {
//                                                                                 outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
//                                                                                 if (!fs.existsSync(outputDirectory)) {
//                                                                                     fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                                                                                 }
//                                                                                 var outputFile = outputDirectory + app_id + '_' + fname + '_' + fileName + '.pdf';
//                                                                                 var outputFile1 = outputDirectory + app_id + '_' + fname + '_' + fileName + '_noPrint.pdf';
//                                                                                 self_PDF.merge(values.fileString1, outputFile1, function (err) {
//                                                                                     if (err) {
//                                                                                         callback(err, '')
//                                                                                     } else {
//                                                                                         self_PDF.merge(values.fileString, outputFile, function (err) {
//                                                                                             if (err) {
//                                                                                                 callback(err, '')
//                                                                                             } else {
//                                                                                                 models.InstituteDetails.findAll({
//                                                                                                     where: {
//                                                                                                         user_id: userId,
//                                                                                                         app_id: app_id,
//                                                                                                         type: 'degree'
//                                                                                                     }
//                                                                                                 }).then(function (instituteDetails) {
//                                                                                                     models.VerificationLetters.findOne({
//                                                                                                         where: {
//                                                                                                             file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
//                                                                                                             user_id: userId,
//                                                                                                             app_id: app_id
//                                                                                                         }
//                                                                                                     }).then(function (verificationLetters) {
//                                                                                                         if (verificationLetters == null) {
//                                                                                                             models.VerificationLetters.create({
//                                                                                                                 file_name: app_id + '_' + fname + '_' + fileName + '.pdf',
//                                                                                                                 user_id: userId,
//                                                                                                                 app_id: app_id,
//                                                                                                                 doc_type: instituteDetails[0].type,
//                                                                                                                 noOfCopies: instituteDetails.length
//                                                                                                             }).then(function (addedLetter) {
//                                                                                                                 if (addedLetter) {
//                                                                                                                 }
//                                                                                                             })
//                                                                                                         }
//                                                                                                     })
//                                                                                                 })
//                                                                                             }
//                                                                                         });
//                                                                                     }
//                                                                                 });
//                                                                             },
//                                                                                 (error) => {
//                                                                                     callback(error, '')
//                                                                                 })
//                                                                         } else {
//                                                                             outputDirectory = FILE_LOCATION + "public/upload/documents/" + userId + "/";
//                                                                             if (!fs.existsSync(outputDirectory)) {
//                                                                                 fs.mkdirSync(outputDirectory, { recursive: true });//fs.writeFileSync
//                                                                             }
//                                                                             self_PDF.signDocument_notForPrint(fileName, userId, app_id, filePath, outputDirectory, fname, 'degree', fileName, 'false', function (err, fileName_no) {
//                                                                                 if (err) {
//                                                                                     callback(err, '');
//                                                                                 } else {
//                                                                                     self_PDF.signDocument(fileName, userId, app_id, filePath, outputDirectory, fname, 'degree', fileName, 'false', function (err, fileName) {
//                                                                                         if (err) {
//                                                                                             callback(err, '');
//                                                                                         } else {
//                                                                                             models.InstituteDetails.findAll({
//                                                                                                 where: {
//                                                                                                     user_id: userId,
//                                                                                                     app_id: app_id,
//                                                                                                     type: 'degree'
//                                                                                                 }
//                                                                                             }).then(function (instituteDetails) {
//                                                                                                 models.VerificationLetters.findOne({
//                                                                                                     where: {
//                                                                                                         file_name: fileName,
//                                                                                                         user_id: userId,
//                                                                                                         app_id: app_id
//                                                                                                     }
//                                                                                                 }).then(function (verificationLetters) {
//                                                                                                     if (verificationLetters == null) {
//                                                                                                         models.VerificationLetters.create({
//                                                                                                             file_name: fileName,
//                                                                                                             user_id: userId,
//                                                                                                             app_id: app_id,
//                                                                                                             doc_type: instituteDetails[0].type,
//                                                                                                             noOfCopies: instituteDetails.length
//                                                                                                         }).then(function (addedLetter) {
//                                                                                                             if (addedLetter) {
//                                                                                                             }
//                                                                                                         })
//                                                                                                     }
//                                                                                                 })
//                                                                                             })
//                                                                                         }
//                                                                                     });
//                                                                                 }
//                                                                             });
//                                                                         }
//                                                                     } else {
//                                                                         callback('File not found', '');
//                                                                     }
//                                                                 }else{
//                                                                     models.VerificationLetters.findOne({
//                                                                         where: {
//                                                                             file_name: genFile,
//                                                                             user_id: userId,
//                                                                             app_id: app_id
//                                                                         }
//                                                                     }).then(function (verificationLetters) {
//                                                                         if (verificationLetters == null) {
//                                                                             models.VerificationLetters.create({
//                                                                                 file_name: genFile,
//                                                                                 user_id: userId,
//                                                                                 app_id: app_id,
//                                                                                 doc_type: instituteDetails[0].type,
//                                                                                 noOfCopies: instituteDetails.length
//                                                                             }).then(function (addedLetter) {
//                                                                                 if (addedLetter) {
//                                                                                 }
//                                                                             })
//                                                                         }
//                                                                     })
//                                                                 }
//                                                                 setTimeout(() => {
//                                                                     callback('', 'next');
//                                                                 }, 13000)
//                                                             }, function (err, result) {
//                                                                 if (err) {
//                                                                     reject(err);
//                                                                 } else {


//                                                                 }
//                                                             })
//                                                         }
//                                                     })
//                                                 })
//                                             }else{
//                                                 reject('Cannot process application because outward number not updated')
//                                             }
//                                         }
//                                         // models.DocumentDetails.findAll({
//                                         //     where: {
//                                         //         user_id: userId,
//                                         //         app_id: app_id,
//                                         //         type: 'degree',
//                                         //         degree_Type: {
//                                         //             [op.in]:['Provisional Degree Certificate','Internship Completion Certificate']
//                                         //         }
//                                         //     }
//                                         // }).then(function (docs) {
//                                         //     if (docs.length > 0) {
//                                         //         require('async').eachSeries(docs, function (doc, callback) {

//                                         //             var extension = doc.file.split('.').pop();
//                                         //             var fileName = '';
//                                         //             if (extension == 'pdf' || extension == 'PDF') {
//                                         //                 fileName = doc.file;
//                                         //             } else {
//                                         //                 var filePath = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + doc.file;
//                                         //                 var new_filePath = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + path.parse(doc.file).name + '.pdf';
//                                         //                 imagesToPdf([filePath], new_filePath);
//                                         //                 fileName = path.parse(doc.file).name + '.pdf';
//                                         //             }
//                                         //             models.VerificationLetters.findOne({
//                                         //                 where: {
//                                         //                     file_name: fileName,
//                                         //                     user_id: userId,
//                                         //                     app_id: app_id
//                                         //                 }
//                                         //             }).then(function (verificationLetters) {
//                                         //                 if (verificationLetters == null) {
//                                         //                     models.VerificationLetters.create({
//                                         //                         file_name: fileName,
//                                         //                         user_id: userId,
//                                         //                         app_id: app_id,
//                                         //                         doc_type: 'degree',
//                                         //                         noOfCopies: (verificationTypes.noOfCopies) ? verificationTypes.noOfCopies : 1 
//                                         //                     }).then(function (addedLetter) {
//                                         //                         if (addedLetter) {
//                                         //                         }
//                                         //                     })
//                                         //                 }
//                                         //             })
//                                         //             callback('', 'next')
//                                         //         }, function (err, result) {
//                                         //             if (err) {
//                                         //                 reject(err);
//                                         //             } else {
//                                         //                 resolveData.degree = "done";
//                                         //                 setTimeout(() => { resolve(resolveData) }, 4000)

//                                         //             }
//                                         //         })
//                                         //     } else {
//                                         //         resolveData.degree = "done";
//                                         //         setTimeout(() => { resolve(resolveData) }, 14000)
//                                         //     }
//                                         // })
//                                     })
//                                 })

//                             })


//                         } else {
//                             resolveData.degree = "done";
//                             setTimeout(() => { resolve(resolveData) }, 1000)
//                         }
//                     });

//                     // Promise.all([marksheetPromise, transcriptPromise, degreePromise]).then((values) => {
//                     Promise.all([marksheetPromise, degreePromise]).then((values) => {
//                         // if (values[0].marksheet == 'done' && values[0].transcript == 'done' && values[0].degree == 'done') {
//                         if (values[0].marksheet == 'done'  && values[0].degree == 'done') {

//                             application.update({
//                                 tracker: 'signed',
//                                 status: 'accept',
//                                 verified_by: emailAdmin,
//                                 print_date: moment(new Date()).format('YYYY-MM-DD'),
//                                 verified_date: moment().format("YYYY-MM-DD HH:mm:ss")
//                             }).then(function (updatedApp) {
//                                 if (updatedApp) {
//                                     models.User.getUserDetails(app_id).then(function (userData) {
//                                         var user = userData[0];
//                                         const data1 = 'Application ' + app_id + ' is signed ' + emailAdmin;
//                                         const activity = "Application Signed/Print"
//                                         functions.activitylog(clientIP,req, user.user_id, activity, data1, app_id, 'guverification').then(function (activityCreated) {
//                                             var url = config.get('email').BASE_URL_SENDGRID + 'applicationStatus';
//                                             if (user.agentName != null) {
//                                                 request.post(url, {
//                                                     json: {
//                                                         mobile: user.agentMobile,
//                                                         mobile_country_code: user.agentMobileCountryCode,
//                                                         userName: user.agentName,
//                                                         email: user.agentEmail,
//                                                         studentName: user.studentName,
//                                                         app_id: app_id,
//                                                         statusType: 'signed-signed',
//                                                         source: 'verification',
//                                                         user_type: 'agent'
//                                                     }
//                                                 }, function (error, response, body) {

//                                                 });
//                                             } else {
//                                                 request.post(url, {
//                                                     json: {
//                                                         mobile: user.studentMobile,
//                                                         mobile_country_code: user.studentMobileCountryCode,
//                                                         userName: user.studentName,
//                                                         email: user.studentEmail,
//                                                         statusType: 'signed-signed',
//                                                         app_id: app_id,
//                                                         source: 'verification',
//                                                         user_type: 'student'
//                                                     }
//                                                 }, function (error, response, body) {

//                                                 });
//                                             }
//                                             res.json({
//                                                 status: 200,
//                                             })
//                                         })
//                                     })
//                                 } else {
//                                     res.json({
//                                         status: 400
//                                     })
//                                 }
//                             })
//                         }


//                     },(error) => {
//                         return res.json({
//                             status: 400,
//                             message: error
//                         })
//                     })

//                 })

//             })
//         })
//     }
// })


router.get('/downloadExcel', function (req, res) {
    console.log("/downloadExcel");
    var type = req.query.type;
    var tracker = req.query.tracker;
    var startDate = req.query.startDate;
    var endDate = moment(req.query.endDate).add(1, 'days').format('YYYY-MM-DD');
    var TotalAppdata = [];
    var filters = [];

    models.Application.getReqestedUserApplications(filters, tracker, type, startDate, endDate).then((data) => {
        if (data != null || data != undefined) {
            require('async').each(data, function (data, callback) {
                TotalAppdata.push({
                    'Application Id': data.id,
                    'Full Name': data.name,
                    ' Email': data.email,
                    'Application Tracker': data.tracker,
                    'Application Status': data.status,
                    'Application Date': data.created_at ? moment(new Date(data.created_at)).format("DD/MM/YYYY") : '',
                    // 'Application agent_name':data.agent_name,
                });
                callback();
            }, function (error, results) {
                setTimeout(function () {
                    var xls = json2xls(TotalAppdata);
                    fs.writeFileSync(FILE_LOCATION + "public/upload/Excel/" + tracker + '_' + type + "_Verification.xlsx", xls, 'binary');
                    var filepath = FILE_LOCATION + "public/upload/Excel/" + tracker + '_' + type + "_Verification.xlsx";
                    res.json({
                        status: 200,
                        data: filepath
                    });
                }, 1300);
            });
        } else {
            res.json({
                status: 400,
            })
        }
    })
})

router.post('/uploadDocument', (req, res, next) => {
    var image;
    var userId = req.query.user_id;

    var doc_id = req.query.doc_id;
    var dir = FILE_LOCATION + "public/upload/documents/" + userId;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    var ext;
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, FILE_LOCATION + 'public/upload/documents/' + userId);
        },
        filename: function (req, file, callback) {
            var extension = path.extname(file.originalname)
            var randomString = functions.generateRandomString(10, 'alphabetic')
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

                models.DocumentDetails.update(
                    {
                        file: image
                    }, {
                    where: {
                        id: doc_id
                    }
                }).then(function (documentDetails) {
                    if (documentDetails) {
                        var semester = (documentDetails.type == 'marksheet') ? documentDetails.semester : '';
                        models.Activitytracker.create({
                            user_id: userId,
                            activity: "Document Re-upload",
                            data: documentDetails.courseName + " " + semester + " " + documentDetails.type + " document re-uploaded for application id " + documentDetails.app_id + " by " + req.user.email,
                            application_id: documentDetails.app_id,
                            source: "hsncverification"
                        });
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

router.get('/downloadExcelTotalApplication', function (req, res) {
    console.log("/downloadExcelTotalApplication");
    var type = req.query.type;
    var tracker = req.query.tracker;
    var startDate = req.query.startDate;
    var endDate = moment(req.query.endDate).add(1, 'days').format('YYYY-MM-DD');
    var TotalAppdata = [];
    var filters = [];

    models.Application.getTotalUserApplications(filters, tracker, type, startDate, endDate).then((data) => {
        if (data != null || data != undefined) {
            require('async').each(data, function (data, callback) {
                TotalAppdata.push({
                    'Application Id': data.id,
                    'Full Name': data.name,
                    ' Email': data.email,
                    'Application Tracker': data.tracker,
                    'Application Status': data.status,
                    'Application Date': data.created_at ? moment(new Date(data.created_at)).format("DD/MM/YYYY") : '',
                    // 'Application agent_name':data.agent_name,
                });
                callback();
            }, function (error, results) {
                setTimeout(function () {
                    var xls = json2xls(TotalAppdata);
                    fs.writeFileSync(FILE_LOCATION + "public/upload/Excel/" + tracker + '_' + type + "_Verification.xlsx", xls, 'binary');
                    var filepath = FILE_LOCATION + "public/upload/Excel/" + tracker + '_' + type + "_Verification.xlsx";
                    res.json({
                        status: 200,
                        data: filepath
                    });
                }, 1300);
            });
        } else {
            res.json({
                status: 400,
            })
        }
    })
})

router.get('/downloadExcel_dateTotal', function (req, res) {
    console.log("/downloadExcel_dateTotal");
    var type = req.query.type;
    var tracker = req.query.tracker;
    var startDate = req.query.startDate;
    var endDate = moment(req.query.endDate).add(1, 'days').format('YYYY-MM-DD');
    var TotalAppdata = [];
    var filters = [];

    models.Application.getTotalpaymentUserApplications(filters, tracker, type, startDate, endDate).then((data) => {
        if (data != null || data != undefined) {
            require('async').each(data, function (data, callback) {
                TotalAppdata.push({
                    'Application Id': data.id,
                    'Student Name': data.name,
                    'Student Email': data.email,
                    'order_id': data.order_id,
                    "Transaction Id": data.tracking_id,
                    'Application Date': moment(data.created_at).format("DD-MM-YYYY"),
                    "Bank Reference No": data.bank_ref_no,
                    "Total Amount ": data.total_amount,
                    "Course Name": data.courseName

                    // 'Full Name': data.name,
                    // ' Email': data.email,
                    // 'Application Tracker': data.tracker,
                    // 'Application Status': data.status,
                    // 'Application Date': data.created_at ? moment(new Date(data.created_at)).format("DD/MM/YYYY") : '',
                    // 'Application agent_name':data.agent_name,
                });
                callback();
            }, function (error, results) {
                setTimeout(function () {
                    var xls = json2xls(TotalAppdata);
                    fs.writeFileSync(FILE_LOCATION + "public/upload/Excel/" + tracker + '_' + type + "_Verification.xlsx", xls, 'binary');
                    var filepath = FILE_LOCATION + "public/upload/Excel/" + tracker + '_' + type + "_Verification.xlsx";
                    res.json({
                        status: 200,
                        data: filepath
                    });
                }, 1300);
            });
        } else {
            res.json({
                status: 400,
            })
        }
    })
})

router.get('/mergeCertificate', (req, res, next) => {
    console.log('/mergeCertificate');
    var app_id = req.query.app_id;
    var userId = req.query.userId;
    var verificationCertificates = '';
    models.VerificationTypes.findOne({
        where: {
            user_id: userId
        }
    }).then(function (verificationTypes) {
        if (verificationTypes.marksheet == true) {
            var file = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + app_id + "marksheetCertificate.pdf";
            if (fs.existsSync(file)) {
                verificationCertificates = verificationCertificates + ' "' + file + '" ';
            }
            // }
            if (verificationTypes.transcript == true) {
                var file = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + app_id + "transcriptCertificate.pdf";
                if (fs.existsSync(file)) {
                    verificationCertificates = verificationCertificates + ' "' + file + '" ';
                }
            }
            if (verificationTypes.degreeCertificate == true) {
                var file = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + app_id + "degreeCertificate.pdf";
                if (fs.existsSync(file)) {
                    verificationCertificates = verificationCertificates + ' "' + file + '" ';
                }
            }
        }
        self_PDF.merg(app_id, userId, verificationCertificates, function (err) {
            if (err) {
                return res.json({
                    status: 400,
                    message: 'Files cannot merged'
                })
            } else {
                var fileUrl = FILE_LOCATION + "public/upload/documents/" + userId + "/" + app_id + "_Certificate.pdf"
                res.json({
                    status: 200,
                    data: fileUrl
                })
            }
        });
    })
})

router.get('/regenerateCertificates', (req, res, next) => {
    console.log('/regenerateCertificates');
    if (req.user.email.includes('@edulab.in') && edulabAllow == false) {
        res.json({
            status: 400,
            message: "You don't have persmission"
        })
    } else {
        var user_id = req.query.userId;
        var appl_id = req.query.id;
        var rege = req.query.reg_reason
        models.Application.findOne({
            where: {
                id: appl_id
            }
        }).then(function (application) {
            if (rege != null) {
                application.update({
                    regenerate_reason: rege
                })
            }
            if (application) {
                models.User.findOne({
                    where: {
                        id: application.user_id
                    }
                }).then(function (applicant) {
                    if (applicant) {
                        application.update({
                            tracker: 'apply',
                            status: 'new'
                        }).then(function (app_updated) {
                            if (app_updated) {
                                models.VerificationLetters.findAll({
                                    where: {
                                        user_id: application.user_id,
                                        app_id: appl_id
                                    }
                                }).then(function (generatedLetters) {
                                    require('async').each(generatedLetters, function (letter, callback) {
                                        var file_path = FILE_LOCATION + 'public/upload/documents/' + application.user_id + '/' + letter.file_name;
                                        if (fs.existsSync(file_path)) {
                                            fs.unlink(file_path, function (err) {
                                                if (err) {
                                                } else {
                                                    models.VerificationLetters.destroy({
                                                        where: {
                                                            id: letter.id
                                                        }
                                                    });
                                                }
                                            })
                                        }
                                        callback();
                                    }, function () {
                                        const data1 = "Application " + appl_id + " is sent to verified state for regenerate because of " + rege + " by " + req.user.email;
                                        const activity = "Application re-generate"
                                        models.Activitytracker.create({
                                            user_id: user_id,
                                            application_id: appl_id,
                                            activity: activity,
                                            data: data1,
                                            source: 'hsncverification'
                                        });
                                        res.json({
                                            status: 200,
                                            message: 'send to verified Application tab to regeneate certificate.'
                                        })
                                    })
                                })
                            } else {
                                res.json({
                                    status: 400,
                                    message: 'Error occured while updating Application.'
                                })
                            }
                        })
                    } else {
                        res.json({
                            status: 400,
                            message: 'Applicant not found.'
                        })
                    }
                })
            } else {
                res.json({
                    status: 400,
                    message: 'Application not found.'
                })
            }
        })
    }

})


router.get('/downloadpdf', function (req, res) {
    const userId = req.query.user_id
    var doc = req.query.documentFile;
    const downloadData =  FILE_LOCATION + 'public/upload/documents/'+ userId + '/' +doc;
    // const downloadData = doc;
    res.download(downloadData);

});

router.get('/downloadFiles', function (req, res) {
    console.log("/downloadFiles");
    const downloadData = req.query.documentFile;
    res.download(downloadData);
});

router.get('/downloadFilesTotal', function (req, res) {
    console.log("/downloadFilesTotal");
    const downloadData = req.query.documentFile;
    res.download(downloadData);
});

router.get('/downloadFilespaymenttotal', function (req, res) {
    console.log("/downloadFilespaymenttotal");
    const downloadData = req.query.documentFile;
    res.download(downloadData);
});

router.get('/downloadFiles_demo', function (req, res) {
    console.log("/downloadFiles_demo")
    var location = req.query.formPath;
    const downloadData = location;
    res.download(downloadData);
});

router.get('/getFileDetailsDocument', (req, res, next) => {
    console.log("/getFileDetailsDocument")
    var file_name = req.query.file;
    var user_id = req.query.user_id;
    var fileDetails = {};
    models.DocumentDetails.findOne({
        where: {
            user_id: user_id,
            file: file_name,
            // app_id : null
        }
    }).then(function (documents) {
        var extension = documents.file.split('.');
        fileDetails = {
            extension: extension[1],
            src: serverUrl + 'upload/documents/' + user_id + '/' + documents.file
            // src : serverUrl + 'public/upload/documents/' + user_id + '/' + documents.file
        }
        res.json({
            status: 200,
            data: fileDetails
        })
    })
})

router.get('/signed_students', (req, res, next) => {
    console.log("/signed_students");
    var filepath = req.query.filepath;
    // var app_id = req.query.app_id;
    var page = req.query.page;
    var name = req.query.name ? req.query.name : '';
    var email = req.query.email ? req.query.email : '';
    var year = req.query.acadYear ? req.query.acadYear : '';
    var limit = 10;
    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters = [];

    if (name != '' && name != null && name != undefined && name != 'null' && name != 'undefined') {
        var filter = {};
        var filter1 = {};
        var nameSplit = name.split(' ');
        if (nameSplit.length == 1) {
            filter.name = 'name';
            filter.value = " AND( u.name like '%" + nameSplit[0] + "%' OR u.surname like '%" + nameSplit[0] + "%') ";
            filters.push(filter);
        } else if (nameSplit.length == 2) {
            filter.name = 'name';
            filter.value = " AND u.name like '%" + nameSplit[0] + "%' AND u.surname like '%" + nameSplit[1] + "%' ";
            filters.push(filter);
        } else {
            filter.name = 'name';
            var lastElement = nameSplit.pop();
            filter.value = " AND u.name like '%" + nameSplit.join(' ') + "%' AND u.surname like '%" + lastElement + "%' ";
            filters.push(filter);
        }

    }
    if (email != '' && email != null && email != undefined && email != 'null' && email != 'undefined') {
        var filter = {};
        filter.name = 'email';
        filter.value = email;
        filters.push(filter);
    }

    if (year != '' && year != null && year != undefined && year != 'null' && year != 'undefined') {
        var filter = {};
        var currentyear = year;
        var startdate = currentyear + "-04-01";
        var year = parseInt(currentyear) + 1;
        var enddate = year + "-04-01";
        filter.name = 'application_year';
        filter.value = " AND a.created_at BETWEEN '" + startdate + "' AND '" + enddate + "'";
        filters.push(filter);
    }
    var data = []; var countObj = {};
    // fetch total active & inactive student count from db.
    // models.Application.signed_students(filters,null,null,req.query.type).then(function(studentsData) {
    models.Application.getSignedUserApplications(filters, null, null, req.query.type).then(function (studentsData) {
        countObjects.totalLength = studentsData.length;
        models.Application.getSignedUserApplications(filters, limit, offset, req.query.type).then(function (students) {
            countObjects.filteredLength = students.length;
            if (students != null) {
                require('async').eachSeries(students, function (student, callback) {
                    var obj = {
                        // app_id :(student.app_id) ? student.app_id:'',
                        id: (student.id) ? student.id : '',
                        name: (student.name) ? student.name : '',
                        email: (student.email) ? student.email : '',
                        tracker: (student.tracker) ? student.tracker : '',
                        status: (student.status) ? student.status : '',
                        created_at: (student.created_at) ? moment(new Date(student.created_at)).format("DD-MM-YYYY") : '',
                        user_id: student.user_id ? student.user_id : '',
                        verified_by: (student.verified_by) ? student.verified_by : '',
                        verified_date: (student.verified_date) ? moment(new Date(student.verified_date)).format("DD-MM-YYYY") : '',

                        // created_by: (student.a_name) ? 'By agent ' : 'By student',
                        // agent_name: (student.a_name) ? student.a_name : '',

                        created_by: (student.a_name) ? 'By agent (' + student.aname + ')' : 'By student',
                        agent_name: (student.a_name) ? student.a_name : '',
                        
                        
                        applyFor:
                            student.marksheet === 1 && student.degreeCertificate === 1
                                ? 'Marksheet, Degree'
                                : student.marksheet === 1
                                    ? 'Marksheet'
                                    : student.degreeCertificate === 1
                                        ? 'Degree'
                                        : ''
                    };

                    data.push(obj);
                    callback();
                }, function () {
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


router.get('/checksignedpdf', (req, res, next) => {
    var userId = req.query.userId;
    var app_id = req.query.id;

    models.VerificationLetters.findAll({
        where: {
            user_id: userId,
            app_id: app_id,
        }
    }).then(function (letters) {
        var count = 0;
        letters.forEach(function (letter) {
            var file = FILE_LOCATION + "public/upload/documents/" + userId + "/" + letter.file_name;
            if (fs.existsSync(file)) {
                count++;
            }
        })

        if (count == letters.length) {
            res.json({
                status: 200
            })
        } else {
            res.json({
                status: 400
            })
        }
    })
})

// working
router.post('/sendEmail', async(req, res, next) => {
    console.log("/sendEmail");
    if (req.user.email.includes('@edulab.in') && edulabAllow == false) {
        res.json({
            status: 400,
            message: "You don't have persmission"
        })
    } else {
        var userId = req.body.userId;
        var app_id = req.body.id;
        var adminEmail = req.body.adminEmail;

        var studentName;

        var InstituteDetails = []
        var instituteEmails = [];
        var attachments = [];
       
        models.User.findOne({
            where: {
                id: userId,
            }
        }).then(async function (data) {
            if (data) {
                models.Application.findOne({
                    where: {
                        id: app_id
                    }
                }).then(async function (application) {
                    models.InstituteDetails.findAll({
                        where: {
                            user_id: application.user_id,
                            app_id: app_id
                        }
                    }).then(async function (instituteDetails) {

                        instituteDetails.forEach(institute => {
                            if (!(instituteEmails.some((instEmail)=>(instEmail.email === institute.email)))) {
                                instituteEmails.push({
                                    email: institute.email,
                                    type: institute.type,
                                    reference_no: institute.referenceNo,
                                    institute_name: institute.name
                                })
                            }
                        })
                        if (instituteEmails.length > 1) {
                            var count_inst = 0;
                            instituteEmails.forEach(inst => {
                                if (inst.type == 'marksheet') {
                                    count_inst++;
                                    var instCountWords = converter.toWords(count_inst);
                                    var genFile = app_id + "_" + instCountWords + "_" + "marksheetVerificationCertificate.pdf";
                                    var file = FILE_LOCATION + 'public/upload/documents/' + application.user_id + '/' + genFile;
                                    if (fs.existsSync(file)) {
                                        var attachment = {};
                                        // var base64String = fs.readFileSync(file).toString("base64");
                                        attachment = {
                                            // content: base64String,
                                            filename: genFile,
                                            file: file
                                            // type: 'application/pdf',
                                            // disposition: 'attachment',
                                            // contentId: 'mytext'
                                        }
                                        attachments.push(attachment);
                                    }
                                    inst.attachments = attachments;
                                }
                                if (inst.type == 'transcript') {
                                    count_inst++;
                                    var instCountWords = converter.toWords(count_inst);
                                    var genFile = app_id + "_" + instCountWords + "_" + "transcriptVerificationCertificate.pdf";
                                    var file = FILE_LOCATION + 'public/upload/documents/' + application.user_id + '/' + genFile;
                                    if (fs.existsSync(file)) {
                                        var attachment = {};
                                        // var base64String = fs.readFileSync(file).toString("base64");
                                        attachment = {
                                            // content: base64String,
                                            filename: genFile,
                                            file: file
                                            // type: 'application/pdf',
                                            // disposition: 'attachment',
                                            // contentId: 'mytext'
                                        }
                                        attachments.push(attachment);
                                    }
                                    inst.attachments = attachments;
                                }
                                if (inst.type == 'degree') {
                                    count_inst++;
                                    var instCountWords = converter.toWords(count_inst);
                                    var genFile = app_id + "_" + instCountWords + "_" + "degreeVerificationCertificate.pdf";
                                    var file = FILE_LOCATION + 'public/upload/documents/' + application.user_id + '/' + genFile;
                                    if (fs.existsSync(file)) {
                                        var attachment = {};
                                        // var base64String = fs.readFileSync(file).toString("base64");
                                        attachment = {
                                            // content: base64String,
                                            filename: genFile,
                                            file: file
                                            // type: 'application/pdf',
                                            // disposition: 'attachment',
                                            // contentId: 'mytext'
                                        }
                                        attachments.push(attachment);
                                    }
                                    inst.attachments = attachments;
                                }

                            });
                            var emailData ={
                                data: instituteEmails,
                                InstituteDetails: InstituteDetails,
                                studentEmail: data.email,
                                attachments: attachments,
                                studentName: data.marksheetName,
                                app_id: app_id,
                                user_id: application.user_id,
                            }

                            var emailResponse = await emailService.sendDocuments(emailData);
                            if(emailResponse.status == 200){
                                var stud_emailData = {
                                    data: instituteEmails,
                                    studentName: data.marksheetName,
                                    studentEmail: data.email,
                                    InstituteDetails: InstituteDetails,
                                    sentTo: 'student'
                                }
                                if(data.agent_id){
                                    models.User.findOne({
                                        where:{
                                            id : data.agent_id
                                        }
                                    }).then(agentData=>{
                                        stud_emailData = {
                                            data: instituteEmails,
                                            studentName: data.marksheetName,
                                            studentEmail: data.email,
                                            InstituteDetails: InstituteDetails,
                                            agentName: agentData.marksheetName,
                                            agentEmail: agentData.email,
                                            sentTo: 'agent'
                                        }
                                    })
                                }
                                var stud_emailResponse = emailService.sendConfirmationBack(stud_emailData);
                                application.update({
                                    tracker: 'done',
                                    status: 'accept',
                                    sent_date: moment(new Date()).format("YYYY-MM-DD"),
                                    sent_by: adminEmail,

                                }).then(function (updatedApp) {
                                    if (updatedApp) {
                                        models.Activitytracker.create({
                                            user_id: updatedApp.user_id,
                                            activity: "Application Status",
                                            data: "Application " + app_id + " is sent to registered purpose by " + req.user.email,
                                            applicaiton_id: app_id,
                                            source: "hsncverification"
                                        });
                                       
                                        res.json({
                                            status: 200
                                        })
                                    }
                                    else {
                                        res.json({
                                            status: 400
                                        })
                                    }
                                })
                            }else{
                                res.json({
                                    status: 400,
                                    message:"Email not sent. Kindly contact support team"
                                })
                            }
                            // request.post(url, {
                            //     json: {
                            //         data: instituteEmails,
                            //         InstituteDetails: InstituteDetails,
                            //         studentEmail: data.email,
                            //         attachments: attachments,
                            //         studentName: data.name + '' + data.surname,
                            //         app_id: app_id,
                            //         user_id: application.user_id,


                            //     }
                            // }, function (error, response, body) {
                            //     application.update({
                            //         tracker: 'done',
                            //         status: 'accept',
                            //         sent_date: moment(new Date()).format("YYYY-MM-DD"),
                            //         sent_by: adminEmail,
                            //     }).then(function (updatedApp) {
                            //         if (updatedApp) {
                            //             models.Activitytracker.create({
                            //                 user_id: updatedApp.user_id,
                            //                 activity: "Application Status",
                            //                 data: "Application " + app_id + " is sent to registered purpose by " + req.user.email,
                            //                 applicaiton_id: app_id,
                            //                 source: "hsncverification"
                            //             });
                            //             // res.json({
                            //             //     status : 200
                            //             // })
                            //         }
                            //         else {
                            //             // res.json({
                            //             //     status : 400
                            //             // })
                            //         }
                            //     })
                            // });
                        } else if (instituteEmails.length == 1) {
                            models.VerificationTypes.findAll({
                                where: {
                                    user_id: application.user_id
                                }
                            }).then(async function (verificationTypes) {
                                if (verificationTypes[0].marksheet == true) {
                                    var genFile = app_id + "_" + "one" + "_" + "marksheetVerificationCertificate.pdf";
                                    var file = FILE_LOCATION + 'public/upload/documents/' + application.user_id + '/' + genFile;
                                    if (fs.existsSync(file)) {
                                        var attachment = {};
                                        // var base64String = fs.readFileSync(file).toString("base64");
                                        attachment = {
                                            // content: base64String,
                                            filename: genFile,
                                            file: file
                                            // type: 'application/pdf',
                                            // disposition: 'attachment',
                                            // contentId: 'mytext'
                                        }
                                        attachments.push(attachment);
                                    }
                                }
                                // if (verificationTypes[0].transcript == true) {
                                //     var genFile = app_id + "_" + "one" + "_" + "transcriptVerificationCertificate.pdf";
                                //     var file = FILE_LOCATION + 'public/upload/documents/' + application.user_id + '/' + genFile;
                                //     if (fs.existsSync(file)) {
                                //         var attachment = {};
                                //         var base64String = fs.readFileSync(file).toString("base64");
                                //         attachment = {
                                //             content: base64String,
                                //             filename: app_id + "transcriptCertificate.pdf",
                                //             type: 'application/pdf',
                                //             disposition: 'attachment',
                                //             contentId: 'mytext'
                                //         }
                                //         attachments.push(attachment);
                                //     }
                                // }
                                if (verificationTypes[0].degreeCertificate == true) {
                                    var genFile = app_id + "_" + "one" + "_" + "degreeVerificationCertificate.pdf";
                                    var file = FILE_LOCATION + 'public/upload/documents/' + application.user_id + '/' + genFile;
                                    if (fs.existsSync(file)) {
                                        var attachment = {};
                                        // var base64String = fs.readFileSync(file).toString("base64");
                                        attachment = {
                                            // content: base64String,
                                            filename: genFile,
                                            file: file
                                            // type: 'application/pdf',
                                            // disposition: 'attachment',
                                            // contentId: 'mytext'
                                        }
                                        attachments.push(attachment);
                                    }
                                }

                                instituteEmails.push({
                                    attachments: attachments
                                })

                                var emailData = {
                                    data: instituteEmails,
                                    studentName: data.marksheetName,
                                    studentEmail: data.email,
                                    InstituteDetails: InstituteDetails,
                                    attachments: attachments,
                                    app_id: app_id,
                                    user_id: application.user_id,
                                }
                                var emailResponse = await emailService.sendDocuments(emailData);
                                if(emailResponse.status == 200){
                                    
                                    if(data.agent_id){
                                        models.User.findOne({
                                            where:{
                                                id : data.agent_id
                                            }
                                        }).then(async (agentData)=>{
                                            var stud_emailData = {
                                                data: instituteEmails,
                                                studentName: data.marksheetName,
                                                studentEmail: data.email,
                                                InstituteDetails: InstituteDetails,
                                                agentName: agentData.marksheetName,
                                                agentEmail: agentData.email,
                                                sentTo: 'agent'
                                            }
                                            var stud_emailResponse = await emailService.sendConfirmationBack(stud_emailData);

                                        })
                                       
                                    }else{
                                        var stud_emailData = {
                                            data: instituteEmails,
                                            studentName: data.marksheetName,
                                            studentEmail: data.email,
                                            InstituteDetails: InstituteDetails,
                                            sentTo: 'student'
                                        }
                                        var stud_emailResponse = await emailService.sendConfirmationBack(stud_emailData);

                                    }
                                    
                                    application.update({
                                        tracker: 'done',
                                        status: 'accept',
                                        sent_date: moment(new Date()).format("YYYY-MM-DD"),
                                        sent_by: adminEmail,

                                    }).then(function (updatedApp) {
                                        if (updatedApp) {
                                            models.Activitytracker.create({
                                                user_id: updatedApp.user_id,
                                                activity: "Application Status",
                                                data: "Application " + app_id + " is sent to registered purpose by " + req.user.email,
                                                applicaiton_id: app_id,
                                                source: "hsncverification"
                                            });
                                           
                                            res.json({
                                                status: 200,
                                                message: 'Email Sent'
                                            })
                                        }
                                        else {
                                            res.json({
                                                status: 400,
                                                message:'Application not updated'
                                            })
                                        }
                                    })
                                }else{
                                    res.json({
                                        status: 400,
                                        message:"Email not sent. Kindly contact support team"
                                    })
                                }
                                // request.post(url, {
                                //     json: {
                                //         data: instituteEmails,
                                //         studentName: data.marksheetName,
                                //         studentEmail: data.email,
                                //         InstituteDetails: InstituteDetails,
                                //         attachments: attachments,
                                //         studentEmail: data.email,
                                //         studentName: data.name + '' + data.surname,
                                //         app_id: app_id,
                                //         user_id: application.user_id,

                                //     }
                                // }, function (error, response, body) {
                                //     application.update({
                                //         tracker: 'done',
                                //         status: 'accept',
                                //         sent_date: moment(new Date()).format("YYYY-MM-DD"),
                                //         sent_by: adminEmail,

                                //     }).then(function (updatedApp) {
                                //         if (updatedApp) {
                                //             models.Activitytracker.create({
                                //                 user_id: updatedApp.user_id,
                                //                 activity: "Application Status",
                                //                 data: "Application " + app_id + " is sent to registered purpose by " + req.user.email,
                                //                 applicaiton_id: app_id,
                                //                 source: "hsncverification"
                                //             });
                                //             // res.json({
                                //             //     status : 200
                                //             // })
                                //         }
                                //         else {
                                //             // res.json({
                                //             //     status : 400
                                //             // })
                                //         }
                                //     })
                                // });
                                // request.post(link, {
                                //     json: {
                                //         data: instituteEmails,
                                //         studentName: data.marksheetName,
                                //         studentEmail: data.email,
                                //         InstituteDetails: InstituteDetails
                                //     }
                                // }, function (error, response, body) {
                                //     application.update({
                                //         tracker: 'done',
                                //         status: 'accept',
                                //         sent_date: moment(new Date()).format("YYYY-MM-DD"),
                                //         sent_by: adminEmail,

                                //     }).then(function (updatedApp) {
                                //         if (updatedApp) {
                                //             res.json({
                                //                 status: 200
                                //             })
                                //         }
                                //         else {
                                //             res.json({
                                //                 status: 400
                                //             })
                                //         }
                                //     })
                                // });

                            })
                        }


                    })
                })


            }

        })
    }
})


router.get('/getVerificationLetters', (req, res, next) => {
    console.log('/getVerificationLetters')
    var app_id = req.query.app_id;
    var userId = req.query.userId;
    var verificationCertificates = '';
    var file = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + app_id + '_Merge.pdf';
    var fileUrl = serverUrl + "upload/documents/" + userId + "/" + app_id + "_Merge.pdf"
    models.VerificationLetters.findAll({
        where: {
            user_id: userId,
            app_id: app_id,
        }
    }).then(function (verificationLetters) {
        let fileStringPromise = new Promise((resolve, reject) => {
            var count = 0;
            verificationLetters.forEach(function (verificationLetter) {
                for (var i = 1; i <= verificationLetter.noOfCopies; i++) {
                    var file = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + verificationLetter.file_name;
                    if (fs.existsSync(file)) {
                        verificationCertificates = verificationCertificates + ' "' + file + '" ';
                        count++;
                    }
                }
            })
            setTimeout(() => {
                resolve('true');
            }, 9000)
        });

        fileStringPromise.then((value) => {
            if (value == 'true') {
                var outputfile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + app_id + "_MergeCertificate.pdf";
                self_PDF.merge(verificationCertificates, outputfile, function (err) {
                    if (err) {
                        return res.json({
                            status: 400,
                            message: 'Files cannot merged'
                        })
                    } else {
                        var fileUrl = serverUrl + "upload/documents/" + userId + "/" + app_id + "_MergeCertificate.pdf"
                        var filePath = FILE_LOCATION + "public/upload/documents/" + userId + "/" + app_id + "_MergeCertificate.pdf"
                        models.VerificationTypes.findOne({
                            where: {
                                user_id: userId,
                                app_id: app_id,
                            }
                        }).then(vt => {
                            var activity = '';
                            var data = '';

                            activity = "View Certificate";
                            data = "Certificate viewed by " + req.query.email_admin + "."
                            models.Activitytracker.create({
                                user_id: userId,
                                application_id: app_id,
                                activity: activity,
                                data: data,
                                source: 'hsncverification'
                            })
                            res.json({
                                status: 200,
                                data: fileUrl,
                                filePath: filePath
                            })
                        })
                    }
                });
            }
        })
    })

})

router.get('/getInstituteAddress', (req, res, next) => {
    console.log('/getInstituteAddress')
    var app_id = req.query.id;
    var userId = req.query.userId;
    var section = req.query.section;
    var mergeaddresseString = '';
    var file = FILE_LOCATION + 'public/upload/documents/' + userId + '/' + app_id + '_MergeAddress.pdf';
    var fileUrl = serverUrl + "upload/documents/" + userId + "/" + app_id + "_MergeAddress.pdf"
    if (fs.existsSync(file)) {
        res.json({
            status: 200,
            data: fileUrl
        })
    } else {
        let addressPromise = new Promise(function (resolve, reject) {

            models.InstituteDetails.findAll({
                where: {
                    user_id: userId,
                    app_id: app_id
                }
            }).then(function (instituteDetails) {
                var institutes = [...instituteDetails.reduce((mp, o) => {
                    const key = JSON.stringify([o.name]);
                    if (!mp.has(key)) mp.set(key, { refNo: o.referenceNo, name: o.name, address: o.address });
                    mp.get(key).count++;
                    return mp;
                }, new Map).values()];
                require('async').eachSeries(institutes, function (institute, callback) {
                    self_PDF.generateAddress(userId, institute, app_id, section, function (err, filename) {
                        if (err) {
                            return res.json({
                                status: 400
                            })
                        } else {
                            mergeaddresseString += ' "' + FILE_LOCATION + 'public/upload/documents/' + userId + '/' + filename + '"';
                        }

                    })
                    callback()
                }, function () {

                    setTimeout(() => { resolve('true') }, 2000)
                })
            })
        });

        addressPromise.then(function (address) {
            if (address == 'true') {
                var outputfile = FILE_LOCATION + "public/upload/documents/" + userId + "/" + app_id + "_MergeAddress.pdf";
                self_PDF.merge(mergeaddresseString, outputfile, function (err) {
                    if (err) {
                        return res.json({
                            status: 400,
                            message: 'Files cannot merged'
                        })
                    } else {
                        var fileUrl = serverUrl + "upload/documents/" + userId + "/" + app_id + "_MergeAddress.pdf"
                        res.json({
                            status: 200,
                            data: fileUrl
                        })
                    }
                });
            }
        })
    }

})

router.get('/emailed_students', function (req, res) {
    console.log("/emailed_students");
    var page = req.query.page;
    var name = req.query.name ? req.query.name : '';
    var email = req.query.email ? req.query.email : '';
    var year = req.query.acadYear ? req.query.acadYear : '';
    var limit = 10;
    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters = [];

    if (name != '' && name != null && name != undefined && name != 'null' && name != 'undefined') {
        var filter = {};
        var filter1 = {};
        var nameSplit = name.split(' ');
        if (nameSplit.length == 1) {
            filter.name = 'name';
            filter.value = " AND( u.name like '%" + nameSplit[0] + "%' OR u.surname like '%" + nameSplit[0] + "%') ";
            filters.push(filter);
        } else if (nameSplit.length == 2) {
            filter.name = 'name';
            filter.value = " AND u.name like '%" + nameSplit[0] + "%' AND u.surname like '%" + nameSplit[1] + "%' ";
            filters.push(filter);
        } else {
            filter.name = 'name';
            var lastElement = nameSplit.pop();
            filter.value = " AND u.name like '%" + nameSplit.join(' ') + "%' AND u.surname like '%" + lastElement + "%' ";
            filters.push(filter);
        }

    }
    if (email != '' && email != null && email != undefined && email != 'null' && email != 'undefined') {
        var filter = {};
        filter.name = 'email';
        filter.value = email;
        filters.push(filter);
    }

    if (year != '' && year != null && year != undefined && year != 'null' && year != 'undefined') {
        var filter = {};
        var currentyear = year;
        var startdate = currentyear + "-04-01";
        var year = parseInt(currentyear) + 1;
        var enddate = year + "-04-01";
        filter.name = 'application_year';
        filter.value = " AND a.created_at BETWEEN '" + startdate + "' AND '" + enddate + "'";
        filters.push(filter);
    }
    var data = []; var countObj = {};
    // fetch total active & inactive student count from db.
    models.Application.getEmailedUserApplications(filters, null, null).then(function (studentsData) {
        countObjects.totalLength = studentsData.length;
        models.Application.getEmailedUserApplications(filters, limit, offset).then(function (students) {
            countObjects.filteredLength = students.length;
            if (students != null) {

                require('async').eachSeries(students, function (student, callback) {
                    var obj = {
                        id: (student.id) ? student.id : '',
                        name: (student.name) ? student.name : '',
                        email: (student.email) ? student.email : '',
                        tracker: (student.tracker) ? student.tracker : '',
                        status: (student.status) ? student.status : '',
                        created_at: (student.created_at) ? moment(new Date(student.created_at)).format("DD-MM-YYYY") : '',
                        user_id: (student.user_id) ? student.user_id : '',
                        created_by: (student.a_name) ? 'By agent (' + student.aname + ')' : 'By student',
                        verified_by: (student.verified_by) ? student.verified_by : '',
                        sent_date: (student.sent_date) ? moment(new Date(student.sent_date)).format("DD-MM-YYYY") : '',
                        agent_name: (student.a_name) ? student.a_name : '',
                        sent_by: (student.sent_by) ? student.sent_by : '',
                        verified_by: (student.verified_by) ? student.verified_by : '',
                        verified_date: (student.verified_date) ? moment(new Date(student.verified_date)).format("DD-MM-YYYY") : '',
                        applyFor:
                            student.marksheet === 1 && student.degreeCertificate === 1
                                ? 'Marksheet, Degree'
                                : student.marksheet === 1
                                    ? 'Marksheet'
                                    : student.degreeCertificate === 1
                                        ? 'Degree'
                                        : ''

                    };

                    data.push(obj);
                    callback();
                }, function () {
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

router.post('/setApplicationErrata', (req, res, next) => {
    console.log('/setApplicationErrata');
    if (req.user.email.includes('@edulab.in') && edulabAllow == false) {
        res.json({
            status: 400,
            message: "You don't have persmission"
        })
    } else {
        var id = req.body.id;
        var event = req.body.event;
        var user_id = req.body.user_id;
        var type = req.body.type;
        var app_id = req.body.app_id;
        var message = req.body.message;
        models.DocumentDetails.findOne({
            where: {
                user_id: user_id,
                id: id
            }
        }).then(function (documentDetails) {
            models.Application.findOne({
                where: {
                    id: app_id
                }
            }).then(function (application) {
                var note;
                if (application.notes != null) {
                    note = application.notes + ' ' + message;
                } else {
                    note = message;
                }

                application.update({
                    status: 'requested',
                    notes: note
                }).then(function (updatedApp) {
                    if (type == 'education') {
                        documentDetails.update({
                            lock_transcript: (event == true) ? 'requested' : 'default'
                        }).then(function (updatedDetails) {
                            models.User.findOne({
                                where: {
                                    id: user_id
                                }
                            }).then(function (user) {
                                if (user.agent_id != null) {
                                    models.User.findOne({
                                        where: {
                                            id: user.agent_id
                                        }
                                    }).then(function (agent) {
                                        var url = config.get('email').BASE_URL_SENDGRID + 'lock_educations';
                                        request.post(url, {
                                            json: {
                                                userName: agent.marksheetName,
                                                email: agent.email,
                                                type: type,
                                                app_id: app_id,
                                                studentName: user.name + ' ' + user.surname,
                                                studentEmail: user.email,
                                                message: message,
                                                //erratanotes :application.notes,
                                                role: 'agent'
                                            }
                                        }, function (error, response, body) {
                                            var semester = (updatedDetails.type == 'marksheet') ? updatedDetails.semester : '';
                                            models.Activitytracker.create({
                                                user_id: updatedApp.user_id,
                                                activity: "Application Errata",
                                                data: updatedDetails.courseName + " " + semester + " " + updatedDetails.type + " has errata education by " + req.user.email,
                                                applicaiton_id: app_id,
                                                source: "hsncverification"
                                            })
                                            res.json({
                                                status: 200,
                                            })
                                        });
                                    })
                                } else {
                                    var url = config.get('email').BASE_URL_SENDGRID + 'lock_educations';
                                    request.post(url, {
                                        json: {
                                            userName: user.name + ' ' + user.surname,
                                            email: user.email,
                                            type: type,
                                            message: message,
                                            //erratanotes :application.notes,
                                            role: 'student'
                                        }
                                    }, function (error, response, body) {
                                        var semester = (updatedDetails.type == 'marksheet') ? updatedDetails.semester : '';
                                        models.Activitytracker.create({
                                            user_id: updatedApp.user_id,
                                            activity: "Application Errata",
                                            data: updatedDetails.courseName + " " + semester + " " + updatedDetails.type + " has errata education by " + req.user.email,
                                            applicaiton_id: app_id,
                                            source: "hsncverification"
                                        })
                                        res.json({
                                            status: 200,

                                        })
                                    });
                                }

                            })
                        })
                    } else if (type == 'document') {
                        documentDetails.update({
                            upload_step: (event == true) ? 'requested' : 'default'
                        }).then(function (updatedDetails) {
                            models.User.findOne({
                                where: {
                                    id: user_id
                                }
                            }).then(function (user) {
                                if (user.agent_id != null) {
                                    models.User.findOne({
                                        where: {
                                            id: user.agent_id
                                        }
                                    }).then(function (agent) {
                                        var url = config.get('email').BASE_URL_SENDGRID + 'lock_documents';
                                        request.post(url, {
                                            json: {
                                                userName: agent.marksheetName,
                                                email: agent.email,
                                                type: type,
                                                app_id: app_id,
                                                studentName: user.name + ' ' + user.surname,
                                                studentEmail: user.email,
                                                message: message,
                                                erratanotes: application.notes,
                                                role: 'agent'
                                            }
                                        }, function (error, response, body) {
                                            var semester = (updatedDetails.type == 'marksheet') ? updatedDetails.semester : '';
                                            models.Activitytracker.create({
                                                user_id: updatedApp.user_id,
                                                activity: "Application Errata",
                                                data: updatedDetails.courseName + " " + semester + " " + updatedDetails.type + " has errata document by " + req.user.email,
                                                applicaiton_id: app_id,
                                                source: "hsncverification"
                                            })
                                            res.json({
                                                status: 200,
                                            })
                                        });
                                    })
                                } else {
                                    var url = config.get('email').BASE_URL_SENDGRID + 'lock_documents';
                                    request.post(url, {
                                        json: {
                                            userName: user.name + ' ' + user.surname,
                                            email: user.email,
                                            type: type,
                                            message: message,
                                            erratanotes: application.notes,
                                            role: 'student'
                                        }
                                    }, function (error, response, body) {
                                        var semester = (updatedDetails.type == 'marksheet') ? updatedDetails.semester : '';
                                        models.Activitytracker.create({
                                            user_id: updatedApp.user_id,
                                            activity: "Application Errata",
                                            data: updatedDetails.courseName + " " + semester + " " + updatedDetails.type + " has errata document by " + req.user.email,
                                            applicaiton_id: app_id,
                                            source: "hsncverification"
                                        })
                                        res.json({
                                            status: 200,
                                        })
                                    });
                                }
                            })
                        })
                    }
                })
            })
        })
    }
})

//removeApplicationOfverification
router.post('/removefromreject', middleswares.getUserInfo, function (req, res) {
    console.log('/removefromreject');
    if (req.user.email.includes('@edulab.in') && edulabAllow == false) {
        res.json({
            status: 400,
            message: "You don't have persmission"
        })
    } else {
        var app_id = req.body.appl_id
        var user_id = req.body.user_id
        var value = req.body.value
        var tracker;
        models.Application.findOne({
            where: {
                id: app_id
            }
        }).then(function (applicationstatus) {
            if (applicationstatus) {
                applicationstatus.update({
                    tracker: "apply",
                    status: 'new'
                }).then(function (updatedDetails) {
                    models.Activitytracker.create({
                        user_id: user_id,
                        activity: ' Application Restore',
                        data: req.user.email + ' has restored application id ' + app_id + 'to pending application',
                        applicaiton_id: app_id,
                        source: "hsncverifcation"
                    })
                    res.json({
                        status: 200,
                    })
                })
            } else {
                res.json({
                    status: 400
                })
            }
        })
    }
})

//student feedback of admin side 
router.get('/student_feedback', middleswares.getUserInfo, function (req, res) {
    var feedbackData = [];
    var page = req.query.page;
    var limit = 10;
    var offset = (page - 1) * limit;
    var counter = 0;
    models.Feedback.getAllData(null, null).then(function (feedbacksAll) {
        var total_count = feedbacksAll.length;
        models.Feedback.getAllData(limit, offset).then(function (feedbacks) {
            feedbacks.forEach(function (feedback) {
                counter++;
                feedbackData.push({
                    feedback_create: feedback.feedback_create,
                    user_name: feedback.name + ' ' + feedback.surname,
                    user_email: feedback.email,
                    website_satisfy: feedback.website_satisfy,
                    website_recommend: feedback.website_recommend,
                    staff_satisfy: feedback.staff_satisfy,
                    experience_problem: feedback.experience_problem,
                    problem: feedback.problem,
                    suggestion: feedback.suggestion
                })
                if (feedbacks.length == counter) {
                    res.json({
                        status: 200,
                        data: feedbackData,
                        total_count: total_count
                    });
                }
            })
        })
    })
});

//admin side total application 
router.get('/paid_students', function (req, res) {
    var students = [];
    var page = req.query.page;
    var id = req.query.id ? req.query.id : '';
    var name = req.query.name ? req.query.name : '';
    var email = req.query.email ? req.query.email : '';
    var year = req.query.acadYear ? req.query.acadYear : '';
    var limit = 10;
    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters = [];

    if (id != '' && id != null && id != undefined && id != 'null' && id != 'undefined') {
        var filter = {};
        filter.name = 'id';
        filter.value =  id;
        filters.push(filter);
    }
    if (name != '' && name != null && name != undefined && name != 'null' && name != 'undefined') {
        var filter = {};
       
        filter.name = 'name';
        filter.value = name ;
            filters.push(filter);
        
    }
    if (email != '' && email != null && email != undefined && email != 'null' && email != 'undefined') {
        var filter = {};
        filter.name = 'email';
        filter.value = email ;
        filters.push(filter);
    }
    models.Application.getTotalUserApplications(filters, null, null).then(data1 => {
        countObjects.totalLength = data1.length;
        models.Application.getTotalUserApplications(filters, limit, offset).then(data => {
            countObjects.filteredLength = data.length;
            require('async').eachSeries(data, function (student, callback) {
                students.push({
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    tracker: student.tracker,
                    status: student.status,
                    user_id: student.user_id,
                    created_by: (student.a_name) ? 'By agent (' + student.aname + ')' : 'By student',
                        agent_name: (student.a_name) ? student.a_name : '',
                    notes: student.notes,
                    application_date: moment(new Date(student.created_at)).format("DD/MM/YYYY"),
                    applyFor:
                            student.marksheet === 1 && student.degreeCertificate === 1
                                ? 'Marksheet, Degree'
                                : student.marksheet === 1
                                    ? 'Marksheet'
                                    : student.degreeCertificate === 1
                                        ? 'Degree'
                                        : ''
                });
                callback();

            }, function () {
                res.json({
                    status: 200,
                    message: 'Student retrive successfully',
                    items: students,
                    total_count: countObjects
                });
            });
        });
    })

});


router.get('/activitytracker', middleswares.getUserInfo, async (req, res) => {
    console.log('/activitytracker')
    var students = [];
    var page = req.query.page;
    var id = req.User.id ? req.User.id : '';
    var date = req.query.date ? req.query.date : '';
    var formatetDate = moment(new Date(date)).format("YYYY-MM-DD")
    var email = req.query.email ? req.query.email : '';
    var data = req.query.data ? req.query.data : '';
    var limit = 10;
    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters = [];

    if (email != '' && email != null && email != undefined && email != 'null' && email != 'undefined') {
        var filter = {};
        filter.name = 'email';
        filter.value = email;
        filters.push(filter);
    }

    if (data != '' && data != null && data != undefined && data != 'null' && data != 'undefined') {
        var filter = {};
        filter.name = 'data';
        filter.value = data;
        filters.push(filter);
    }


    if (date != '' && date != null && date != undefined && date != 'null' && date != 'undefined') {

        var filter = {};
        filter.name = 'date';
        filter.value = formatetDate;
        filters.push(filter);
    }

    //Replace adminactivity to studentactivity
    models.Activitytracker.getactivitySearchResults(filters, null, null).then(function (useractivity) {
        countObjects.totalLength = useractivity.length;
        models.Activitytracker.getactivitySearchResults(filters, limit, offset).then(function (filter_activity) {
            countObjects.filteredLength = filter_activity.length;
            var acticity_data = [];
            if (filter_activity != null) {
                require('async').eachSeries(filter_activity, function (student, callback) {

                    var obj = {
                        application_id: (student.application_id) ? student.applicaiton_id : '',
                        created_at: (student.created_at) ? moment(new Date(student.created_at)).format('DD/MM/YYYY HH:mm') : '',
                        email: (student.username) ? student.username : '',
                        name: (student.name) ? student.name : '',
                        role: (student.role) ? student.role : '',
                        action: (student.action) ? student.action : '',
                        data: (student.data) ? student.data : '',
                        user_id: (student.userId) ? student.userId : '',
                    };

                    acticity_data.push(obj);
                    callback();

                }, function () {
                    res.json({
                        status: 200,
                        message: 'Student retrive successfully',
                        items: acticity_data,
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

    });

});

router.get('/students', function (req, res) {
    var page = req.query.page;
    var name = req.query.name ? req.query.name : '';
    var email = req.query.email ? req.query.email : '';
    var year = req.query.acadYear ? req.query.acadYear : '';
    var limit = 10;
    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters = [];

    if (name != '' && name != null && name != undefined && name != 'null' && name != 'undefined') {
        var filter = {};
        var filter1 = {};
        var nameSplit = name.split(' ');
        if (nameSplit.length == 1) {
            filter.name = 'name';
            filter.value = " AND( user.name like '%" + nameSplit[0] + "%' OR user.surname like '%" + nameSplit[0] + "%') ";
            filters.push(filter);
        } else if (nameSplit.length == 2) {
            filter.name = 'name';
            filter.value = " AND user.name like '%" + nameSplit[0] + "%' AND user.surname like '%" + nameSplit[1] + "%' ";
            filters.push(filter);
        } else {
            filter.name = 'name';
            var lastElement = nameSplit.pop();
            filter.value = " AND user.name like '%" + nameSplit.join(' ') + "%' AND user.surname like '%" + lastElement + "%' ";
            filters.push(filter);
        }

    }
    if (email != '' && email != null && email != undefined && email != 'null' && email != 'undefined') {
        var filter = {};
        filter.name = 'email';
        filter.value = email;
        filters.push(filter);
    }

    if (year != '' && year != null && year != undefined && year != 'null' && year != 'undefined') {
        var filter = {};
        var currentyear = year;
        var startdate = currentyear + "-04-01";
        var year = parseInt(currentyear) + 1;
        var enddate = year + "-04-01";
        filter.name = 'application_year';
        filter.value = " AND user.created_at BETWEEN '" + startdate + "' AND '" + enddate + "'";
        filters.push(filter);
    }

    var data = []; var countObj = {};
    // fetch total active & inactive student count from db.
    models.User.getAllUsersInfo(filters, null, null).then(function (studentsData) {
        countObjects.totalLength = studentsData.length;
        models.User.getAllUsersInfo(filters, limit, offset).then(function (students) {
            countObjects.filteredLength = students.length;

            if (students != null) {
                require('async').eachSeries(students, function (student, callback) {

                    var obj = {
                        id: (student.id) ? student.id : '',
                        name: (student.name) ? student.name : '',
                        surname: (student.surname) ? student.surname : '',
                        email: (student.email) ? student.email : '',
                        state: (student.state) ? student.state : '',
                        city: (student.city) ? student.city : '',
                        user_type: (student.user_type) ? student.user_type : '',
                        country: (student.country) ? student.country : '',
                        country_id: (student.college_country) ? student.college_country : '',
                        state: (student.state) ? student.state : '',
                        registerDate: (student.created_at) ? moment(new Date(student.created_at)).format("DD-MM-YYYY hh:mm") : '',
                        userStatus: (student.user_status) ? student.user_status : '',
                        otp_verify: (student.is_otp_verified) ? student.is_otp_verified : '',
                        otp: (student.otp) ? student.otp : '',
                        email_verification_token: (student.is_email_verified) ? student.is_email_verified : '',
                        course_id: (student.course_id) ? student.course_id : '',
                        courses: (student.applying_for) ? student.applying_for : 'Not Applied',
                        profile_completeness: (student.profile_completeness) ? student.profile_completeness : '',
                        interested_courses: (student.course_visits) ? student.course_visits : '',
                        admission_cancel: student.admission_cancel,
                        current_location: student.current_location ? student.current_location : '',
                        registered_on: moment(student.created_at).format("DD/MM/YYYY"),
                        profile_completeness: student.profile_completeness
                    };

                    data.push(obj);
                    callback();

                }, function () {
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


router.put('/status', function (req, res) {
    var userId = req.body.userId;

    models.User.findOne({
        where: {
            id: userId
        }
    }).then(function (user) {
        if (user) {
            user.update({
                user_status: req.body.status
            }).then(function (updatedUser) {
                var userStatus = (updatedUser.user_status == 'active') ? 'activated.' : 'de-activated.';
                if (userStatus == 'activated.') {
                    res.json({
                        status: 200,
                        message: 'Student ' + req.body.status
                    });
                } else if (userStatus == 'de-activated.') {
                    res.json({
                        status: 200,
                        message: 'Student ' + req.body.status
                    });
                } else {
                    res.json({
                        status: 200,
                        message: 'Student ' + req.body.status
                    });
                }
            });
        } else {
            res.json({
                status: 400,
                message: 'User not found'
            });
        }
    });
});



router.put('/verifyOtp', function (req, res) {
    var userId = req.body.userId;

    models.User.findOne({
        where: {
            id: userId
        }
    }).then(function (user) {
        if (user) {
            user.update({
                is_otp_verified: 1,
                is_email_verified: 1,
                otp: null,
                email_verification_token: null
            })
            res.json({
                status: 200,
                data: user
            })

        }

    })
})


router.get('/getPortalwaiseApplicationCount', function (req, res) {
    console.log("/getPortalwaiseApplicationCount");
    var countdata = { apply: '', signed: '', done: '', total: ''};

    models.Application.getPortalwaiseApplicationCount(null,null).then(function (newapplication) {
        countdata.total = newapplication[0].cnt;
        models.Application.getPortalwaiseApplicationCount('apply',null).then(function (newapplication) {
            countdata.apply = newapplication[0].cnt;
            models.Application.getPortalwaiseApplicationCount('signed', 'accept').then(function (newapplication) {
                countdata.signed = newapplication[0].cnt;
                models.Application.getPortalwaiseApplicationCount('done', 'accept').then(function (newapplication) {
                    countdata.done = newapplication[0].cnt;
                    res.json({
                        status: 200,
                        data: countdata 
                    });
                
                });
            });
        });
    });
});




router.post('/setResolve', async (req, res) => {

    var payid = req.body.id;
    var email_id = req.body.email;
    var source = req.body.value;

    models.paymenterror_details.update({
        tracker: 'resolved'
    }, {
        where: {
            id: payid,
            source: 'hsncverification'
        }

    }).then(function (data) {
        if (data.length == 1) {
            res.json({
                status: 200,

            })
        } else {
            res.json({
                status: 400,

            })
        }

    })
    request.post(BASE_URL_SENDGRID + 'Paymenterror_toStudent', {
        json: {
            status: 200,
        }
    }, function (error, response, body) {
        if (response) {
            res.json({
                status: 200,

            })
        } else {
            status: 400
        }
    })
})

router.get('/courseDetails', (req, res, next) => {
    console.log('/courseDetails')
    models.Program_List.findAll({
        where: {
            course_name: req.query.course
        },
        order: [['course_name', 'ASC']] 
    }).then(courses => {
        if (courses && courses.length > 0) {
            var duration = courses[0].duration
            var patternArr = [];
            if (req.query.pattern == 'Annual') {
                for (var i = 1; i <= duration; i++) {
                    var number = converter.toWordsOrdinal(i);
                    var number = number.charAt(0).toUpperCase() + number.slice(1).toLowerCase();
                    patternArr.push({
                        term_name: number + ' Year'
                    })
                }
            } else if (req.query.pattern == 'Semester') {
                duration = duration * 2;
                for (var i = 1; i <= duration; i++) {
                    var sem = romans.romanize(i)
                    patternArr.push({
                        term_name: 'Semester ' + sem
                    })
                }
            }
            res.json({
                status: 200,
                data: patternArr
            })
        } else {
            res.status(404).json({
                status: 404,
                message: "Course not found"
            })
        }
    }).catch(error => {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: "Internal server error"
        })
    })
})

router.get('/getallpedingpayment', async (req, res) => {
    var date = req.query.date ? req.query.date : '';
    var formatetDate = moment(new Date(date)).format("DD/MM/YYYY")
    var page = req.query.page;
    var email = req.query.email ? req.query.email : '';
    var value = req.query.value ? req.query.value : '';
    var limit = 10;
    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters = [];

    if (email != '' && email != null && email != undefined && email != 'null' && email != 'undefined') {
        var filter = {};
        filter.name = 'email';
        filter.value = email;
        filters.push(filter);
    }



    if (date != '' && date != null && date != undefined && date != 'null' && date != 'undefined') {

        var filter = {};
        filter.name = 'date';
        filter.value = formatetDate;
        filters.push(filter);
    }

    var data = []; var countObj = {};

    models.paymenterror_details.getpending(filters, null, null, value).then(function (useractivity) {
        countObjects.totalLength = useractivity.length;

        models.paymenterror_details.getpending(filters, limit, offset, value).then(function (filter_activity) {
            countObjects.filteredLength = filter_activity.length;
            var acticity_data = [];
            if (filter_activity != null) {
                require('async').eachSeries(filter_activity, function (student, callback) {

                    var obj = {
                        email: (student.email) ? student.email : '',
                        transaction_id: (student.transaction_id) ? student.transaction_id : '',
                        order_id: (student.order_id) ? student.order_id : '',
                        bank_refno: (student.bank_refno) ? student.bank_refno : '',
                        date: (student.date) ? student.date : '',
                        amount: (student.amount) ? student.amount : '',
                        selectissuetype: (student.selectissuetype) ? student.selectissuetype : '',
                        note: (student.note) ? student.note : '',
                        user_id: (student.user_id) ? student.user_id : '',
                        tracker: (student.tracker) ? student.tracker : '',
                        source: (student.source) ? student.source : '',
                        updated_at: moment(student.updated_at).format("DD/MM/YYYY"),


                    };

                    acticity_data.push(obj);
                    callback();

                }, function () {
                    res.json({
                        status: 200,
                        message: 'Student retrive successfully',
                        items: acticity_data,
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

    });
})

router.get('/getAll_Paydetails', function (req, res) {
    var id = req.query.id;
    var page = req.query.page;
    var name = req.query.name ? req.query.name : '';
    var email = req.query.email ? req.query.email : '';
    var limit = 10;

    var offset = (page - 1) * limit;
    var countObjects = {};
    var filters = [];
    var year = req.query.acadYear ? req.query.acadYear : '';
    if (year != '' && year != null && year != undefined && year != 'null' && year != 'undefined') {
        var filter = {};
        var currentyear = year;
        var startdate = currentyear + "-04-01";
        var year = parseInt(currentyear) + 1;
        var enddate = year + "-04-01";
        filter.name = 'application_year';
        filter.value = " AND a.created_at BETWEEN '" + startdate + "' AND '" + enddate + "'";
        filters.push(filter);
    }

    if (id != '' && id != null && id != undefined && id != 'null' && id != 'undefined') {
        var filter = {};
        filter.name = 'application_id';
        filter.value = id;
        filters.push(filter);
    }

    if (name != '' && name != null && name != undefined && name != 'null' && name != 'undefined') {
        var filter = {};
        var filter1 = {};
        var nameSplit = name.split(' ');
        if (nameSplit.length == 1) {
            filter.name = 'name';
            filter.value = " AND( u.name like '%" + nameSplit[0] + "%' OR u.surname like '%" + nameSplit[0] + "%') ";
            filters.push(filter);
        } else if (nameSplit.length == 2) {
            filter.name = 'name';
            filter.value = " AND u.name like '%" + nameSplit[0] + "%' AND u.surname like '%" + nameSplit[1] + "%' ";
            filters.push(filter);
        } else {
            filter.name = 'name';
            var lastElement = nameSplit.pop();
            filter.value = " AND u.name like '%" + nameSplit.join(' ') + "%' AND u.surname like '%" + lastElement + "%' ";
            filters.push(filter);
        }

    }

    if (email != '' && email != null && email != undefined && email != 'null' && email != 'undefined') {
        var filter = {};
        filter.name = 'email';
        filter.value = email;
        filters.push(filter);
    }


    var data = []; var countObj = {};
    models.Application.getTotalpaid(filters, null, null).then(function (studentsData) {
        countObjects.totalLength = studentsData.length;
        models.Application.getTotalpaid(filters, limit, offset).then(function (students) {
            countObjects.filteredLength = students.length;
            if (students != null) {

                require('async').eachSeries(students, function (student, callback) {
                    var obj = {
                        id: (student.id) ? student.id : '',
                        user_id: (student.user_id) ? student.user_id : '',
                        name: (student.name) ? student.name : '',
                        email: (student.email) ? student.email : '',
                        tracking_id: (student.tracking_id) ? student.tracking_id : '',
                        bank_ref_no: (student.bank_ref_no) ? student.bank_ref_no : '',
                        order_id: (student.order_id) ? student.order_id : '',
                        created_at: moment(student.created_at).format("DD/MM/YYYY"),
                        amount: (student.total_amount) ? student.total_amount : '',
                        split_status: student.split_status
                    };

                    data.push(obj);
                    callback();
                }, function () {
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

router.post('/adminResetPassword', middleswares.getUserInfo, function (req, res) {
    console.log("/adminResetPassword");
    var body_data = req.body.data;

    var password = '123456';
    // var confirm_password = body_data.userConfirmPassword;
    if (password == '123456') {
        var hashPassword = functions.generateHashPassword(password);
        models.User.findOne({
            where: {
                email: body_data
            }
        }).then(function (User_data) {
            User_data.update({
                password: hashPassword
            }).then(function (user_updated) {
                models.Activitytracker.create({
                    user_id: user_updated.id,
                    activity: "Reset Password ",
                    data: "Reset password of " + user_updated.email,
                    application_id: '',
                    source: 'hsncverification',
                });
                res.json({
                    status: 200,
                    data: User_data,
                    message: 'Password Reset successfully'
                });
            })
        })
    } else {
        res.json({
            status: 401,
            message: 'Something went wrong while changing your Password'
        });


    }

});

router.post('/nameChange', middleswares.getUserInfo, function (req, res) {
    console.log("/nameChange");
    var fname = req.body.fname;
    var Email = req.body.Email;
    var mobileNo = req.body.mobileNo;
    var nameofmarksheet = req.body.nameofmarksheet;
    var user_id = req.body.data;

    if (user_id != null) {
        models.User.findOne({
            where: {
                id: user_id
            }
        }).then(function (User_data) {
            User_data.update({
                name: fname,
                email: Email,
                mobile: mobileNo,
                marksheetName: nameofmarksheet,

            }).then(function (user_updated) {
                if (user_updated) {
                    models.Activitytracker.create({
                        user_id: req.body.user_id,
                        activity: "User Profile Update",
                        data: "User " + user_updated.email + "'s details updated  by " + req.user.email,
                        application_id: '',
                        source: 'hsncverification',
                    });
                }
            })
            res.json({
                status: 200,
                data: User_data,
                message: 'Name Changed successfully'
            });
        })
    } else {
        res.json({
            status: 401,
            message: 'Something went wrong.'
        });

    }
});

router.post('/saveInsDetails', async (req, res) => {
    console.log('/saveInsDetails')
    var documentData = req.body.errataDetails;
    var Email = req.body.email;

    if (documentData.id) {
        let InsDetails = await models.InstituteDetails.findOne({
            where: {
                id: documentData.id
            }
        })
        try {
            if (InsDetails) {
                let UpdateInsDetails = await InsDetails.update({
                    referenceNo: documentData.referenceNo,
                    name: documentData.name,
                    address: documentData.address,
                    email: documentData.email
                })
                if (UpdateInsDetails) {
                    models.Activitytracker.create({
                        user_id: UpdateInsDetails.user_id,
                        activity: "Edit Institute Details",
                        data: Email + " has been updated Institute Details by " + req.user.email,
                        application_id: UpdateInsDetails.app_id,
                        source: 'hsncverification',

                    });
                    res.json({
                        status: 200,
                        data: UpdateInsDetails
                    })

                }
                else {
                    res.json({
                        status: 400,
                        data: documentData
                    })
                }
            }

        }
        catch (e) {
            res.json({
                status: 500,
                message: 'Internal Server Error'
            })
        }

    }
})

router.get('/role_management/getMenuRole', function (req, res) {
    console.log('GET - application/role_management/getMenuRole');
    var featurenames = [];
    models.Role.findOne({
        where: {
            userid: req.query.userID
        }
    }).then(function (roles) {
        if (roles) {
            if (roles.studentmanagement) {
                featurenames.push('studentmanagement');
            }
            if (roles.adminTotal) {
                featurenames.push('adminTotal');
            }
            if (roles.adminPending) {
                featurenames.push('adminPending');
            }
            if (roles.adminVerified) {
                featurenames.push('adminVerified');
            }
            if (roles.adminSigned) {
                featurenames.push('adminSigned');
            }
            if (roles.adminpayment) {
                featurenames.push('adminpayment');
            }
            if (roles.admindashboard) {
                featurenames.push('admindashboard');
            }
            if (roles.help) {
                featurenames.push('help');
            }
            if (roles.adminReport) {
                featurenames.push('adminReport');
            }
            if (roles.collegeManagement) {
                featurenames.push('collegeManagement');
            }
            if (roles.adminWesApp) {
                featurenames.push('adminWesApp');
            }
            if (roles.adminEmailed) {
                featurenames.push('adminEmailed');
            }
            if (roles.studentfeedback) {
                featurenames.push('studentfeedback');
            }
            if (roles.rolemanagement) {
                featurenames.push('rolemanagement');
            }
            res.json({
                status: 200,
                data: featurenames
            })
        } else {
            res.json({
                status: 400
            })
        }
    })
});

router.get('/role_management/main', function (req, res) {
    console.log('GET - application/role_management/main');
    var counter = 0;
    var page = req.query.page;
    var limit = 10;
    var offset = (page - 1) * limit;
    var counter = 0;
    var name = req.query.name != "undefined" ? req.query.name : "";
    var email = req.query.email != "undefined" ? req.query.email : "";
    models.User.getAllSubadmin(limit, offset, name, email).then(function (subadmins) {
        var subAdminsFinal = [];
        var subfeaturenames = [];
        // for (var i = 0; i < subadmins.length; i++) {
        //     counter++;
        //     if (subadmins[i].studentmanagement) {
        //         if (subfeaturenames.indexOf("studentmanagement") == -1) {
        //             subfeaturenames.push("studentmanagement");
        //         }
        //     }
        //     if (subadmins[i].collegeManagement) {
        //         if (subfeaturenames.indexOf("collegeManagement") == -1) {
        //             subfeaturenames.push("collegeManagement");
        //         }
        //     }
        //     if (subadmins[i].adminTotal) {
        //         if (subfeaturenames.indexOf("adminTotal") == -1) {
        //             subfeaturenames.push("adminTotal");
        //         }
        //     }
        //     if (subadmins[i].adminPending) {
        //         if (subfeaturenames.indexOf("adminPending") == -1) {
        //             subfeaturenames.push("adminPending");
        //         }
        //     }

        //     if (subadmins[i].adminVerified) {
        //         if (subfeaturenames.indexOf("adminVerified") == -1) {
        //             subfeaturenames.push("adminVerified");
        //         }
        //     }
        //     if (subadmins[i].adminSigned) {
        //         if (subfeaturenames.indexOf("adminSigned") == -1) {
        //             subfeaturenames.push("adminSigned");
        //         }
        //     }
        //     if (subadmins[i].adminWesApp) {
        //         if (subfeaturenames.indexOf("adminWesApp") == -1) {
        //             subfeaturenames.push("adminWesApp");
        //         }
        //     }
        //     if (subadmins[i].adminEmailed) {
        //         if (subfeaturenames.indexOf("adminEmailed") == -1) {
        //             subfeaturenames.push("adminEmailed");
        //         }
        //     }
        //     if (subadmins[i].adminpayment) {
        //         if (subfeaturenames.indexOf("adminpayment") == -1) {
        //             subfeaturenames.push("adminpayment");
        //         }
        //     }
        //     if (subadmins[i].adminReport) {
        //         if (subfeaturenames.indexOf("adminReport") == -1) {
        //             subfeaturenames.push("adminReport");
        //         }
        //     }
        //     if (subadmins[i].studentfeedback) {
        //         if (subfeaturenames.indexOf("studentfeedback") == -1) {
        //             subfeaturenames.push("studentfeedback");
        //         }
        //     }
        //     if (subadmins[i].help) {
        //         if (subfeaturenames.indexOf("help") == -1) {
        //             subfeaturenames.push("help");
        //         }
        //     }
        //     if (subadmins[i].rolemanagement) {
        //         if (subfeaturenames.indexOf("rolemanagement") == -1) {
        //             subfeaturenames.push("rolemanagement");
        //         }
        //     }
        //     if (subadmins[i].admindashboard) {
        //         if (subfeaturenames.indexOf("admindashboard") == -1) {
        //             subfeaturenames.push("admindashboard");
        //         }
        //     }

        //     var subAdminsFinalObj = {};
        //     subAdminsFinalObj.subadmins = {};
        //     subAdminsFinalObj.subadmins.id = subadmins[i].id;
        //     subAdminsFinalObj.subadmins.name = subadmins[i].name;
        //     subAdminsFinalObj.subadmins.email = subadmins[i].email;
        //     subAdminsFinalObj.subadmins.mobile = subadmins[i].mobile;
        //     subAdminsFinalObj.subadmins.user_status = subadmins[i].user_status;
        //     subAdminsFinalObj.subadmins.subfeaturenames = subfeaturenames;
        //     subAdminsFinal.push(subAdminsFinalObj);

        //     if (subadmins.length == counter) {
        //         res.json({
        //             status: 200,
        //             message: 'Sub-admin list retrieved successfully',
        //             data: subAdminsFinal,
        //         });
        //     }
        // }
        // var subAdminsFinal = [];

// for (var i = 0; i < subadmins.length; i++) {
//     var subfeaturenames = []; // Reset for each sub-admin
//     var featureKeys = [
//         "studentmanagement",
//         "collegeManagement",
//         "adminTotal",
//         "adminPending",
//         "adminVerified",
//         "adminSigned",
//         "adminWesApp",
//         "adminEmailed",
//         "adminpayment",
//         "adminReport",
//         "studentfeedback",
//         "help",
//         "rolemanagement",
//         "admindashboard"
//     ];

//     // Loop through each feature and push it only if its value is 1
//     for (var key of featureKeys) {
//         if (subadmins[i][key] === 1) {
//             subfeaturenames.push(key);
//         }
//     }

//     var subAdminsFinalObj = {
//         subadmins: {
//             id: subadmins[i].id,
//             name: subadmins[i].name,
//             email: subadmins[i].email,
//             mobile: subadmins[i].mobile,
//             user_status: subadmins[i].user_status,
//             subfeaturenames: subfeaturenames
//         }
//     };

//     subAdminsFinal.push(subAdminsFinalObj);
// }

// // Send response after loop completes
// res.json({
//     status: 200,
//     message: 'Sub-admin list retrieved successfully',
//     data: subAdminsFinal
// });


var featureKeys = [
    "studentmanagement", "collegeManagement", "adminTotal", "adminPending",
    "adminVerified", "adminSigned", "adminWesApp", "adminEmailed",
    "adminpayment", "adminReport", "studentfeedback", "help",
    "rolemanagement", "admindashboard"
];

var subAdminsFinal = subadmins.map(admin => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    mobile: admin.mobile,
    user_status: admin.user_status,
    subfeaturenames: featureKeys.filter(key => admin[key] === 1) // Only keep features with value 1
}));

res.json({
    status: 200,
    message: 'Sub-admin list retrieved successfully',
    data: subAdminsFinal
});

    })
});

router.post("/role_management/changeSubAdminStatus", function (req, res) {
    console.log('POST - application/role_management/changeSubAdminStatus');
    models.User.findOne({
        where: {
            id: req.body.userId,
        },
    }).then(function (user) {
        if (user.user_status == "active") {
            user.update({
                user_status: "inactive",
            }).then(function (updatedUser) {
                if (updatedUser) {
                    models.Activitytracker.create({
                        user_id: updatedUser.id,
                        activity: "User Status Update",
                        data: "User status of " + updatedUser.email + " updated to Inactive by " + req.user.email,
                        application_id: '',
                        source: "hsncverification"
                    });
                    res.json({
                        status: 200,
                    });
                } else {
                    res.json({
                        status: 400,
                    });
                }
            });
        } else if (user.user_status == "inactive") {
            user.update({
                user_status: "active",
            }).then(function (updatedUser) {
                if (updatedUser) {
                    models.Activitytracker.create({
                        user_id: updatedUser.id,
                        activity: "User Status Update",
                        data: "User status of " + updatedUser.email + " updated to Active by " + req.user.email,
                        application_id: '',
                        source: "hsncverification"
                    });
                    res.json({
                        status: 200,
                    });
                } else {
                    res.json({
                        status: 400,
                    });
                }
            });
        }
    }).catch(error => {
        res.json({
            status: 400,
            data: error,
        });
    });
});

router.get("/role_management/getSubAdminData", function (req, res) {
    console.log('GET - application/role_management/getSubAdminData');
    models.User.findOne({
        where: {
            id: req.query.userId,
        },
    }).then(function (user) {
        res.json({
            status: 200,
            data: user,
        });
    }).catch(error => {
        res.json({
            status: 400,
            data: error,
        });
    });
});

router.post("/role_management/addUpdatesubAdmin", function (req, res) {
    console.log('POST - application/role_management/addUpdatesubAdmin');
    var data = req.body.subAdminData;
    if (req.body.userId != null) {
        models.User.findOne({
            where: {
                id: req.body.userId,
            },
        }).then(function (user) {
            user.update({
                name: data.name,
                surname: data.surname,
                email: data.email,
                mobile: data.mobile,
                gender: data.gender,
            }).then(function (updatedUser) {
                models.Activitytracker.create({
                    user_id: updatedUser.id,
                    activity: "SubAdmin Add/Update",
                    data: "SubAdmin " + updatedUser.email + " 's details updated by " + req.user.email,
                    application_id: '',
                    source: "hsncverification"
                });
                var response = {
                    status: "edit",
                    id: updatedUser.id,
                };

                res.json({
                    status: 200,
                    data: response,
                });
            });
        }).catch(error => {
            res.json({
                status: 400
            });
        });
    } else {
        var password = "123456";
        const { hashPassword } = cipher.generateHashPassword(password);
        const { randomString } = cipher.generateRandomString(6, "numeric");
        models.User.findOne({
            where:{
                email : data.email
            }
        }).then(userExists =>{
            if(!userExists){
                models.User.create({
                    name: data.name,
                    surname: data.surname,
                    email: data.email,
                    mobile_country_code: "91",
                    mobile: data.mobile,
                    gender: data.gender,
                    password: hashPassword,
                    user_status: "active",
                    user_type: "subadmin",
                    postal_code: "",
                    otp: randomString,
                    is_otp_verified: 1,
                    is_email_verified: 1,
                }).then(function (user) {
                    var response = {
                        status: "add",
                        id: user.id,
                    };
                    models.Activitytracker.create({
                        user_id: user.id,
                        activity: "SubAdmin Add/Update",
                        data: "SubAdmin " + user.email + " added by " + req.user.email,
                        application_id: '',
                        source: "hsncverification"
                    });
                    res.json({
                        status: 200,
                        data: response,
                    });
                }).catch(error => {
                    res.json({
                        status: 500,
                        mesaage: 'Internal Server Error. Kindly contact support team'
                    });
                });
            }else{
                res.json({
                    status: 400,
                    message: 'User email already exists. Kindly change.'
                });
            }
        })
    }
});

router.get("/role_management/getRolesData", function (req, res) {
    console.log('GET - application/role_management/getRolesData');
    var view_data = {};
    models.Role.findOne({
        where: {
            userid: req.query.userId,
        },
    }).then(function (roles) {
        if (roles) {
            view_data.admindashboard = roles.admindashboard;
            view_data.studentmanagement = roles.studentmanagement;
            view_data.rolemanagement = roles.rolemanagement;
            view_data.collegeManagement = roles.collegeManagement;
            view_data.adminTotal = roles.adminTotal;
            view_data.adminPending = roles.adminPending;
            view_data.adminVerified = roles.adminVerified;
            view_data.adminSigned = roles.adminSigned;
            view_data.adminWesApp = roles.adminWesApp;
            view_data.adminEmailed = roles.adminEmailed;
            view_data.adminpayment = roles.adminpayment;
            view_data.adminReport = roles.adminReport;
            view_data.studentfeedback = roles.studentfeedback;
            view_data.help = roles.help;
            res.json({
                status: 200,
                data: view_data
            });
        } else {
            res.json({
                status: 400,
            });
        }
    }).catch(error => {
        res.json({
            status: 400,
        });
    });
});

router.post("/role_management/setUpdateRole", function (req, res) {
    console.log('POST- application/role_management/setUpdateRole')
    models.Role.findOne({
        where: {
            userid: req.body.user_id,
        },
    }).then(function (roles) {
        models.User.findOne({
            where: {
                id: req.body.user_id
            }
        }).then(function (user) {
            if (roles) {
                var insert_obj = {
                    admindashboard: 0,
                    studentmanagement: 0,
                    collegeManagement: 0,
                    adminTotal: 0,
                    adminPending: 0,
                    adminVerified: 0,
                    adminSigned: 0,
                    adminWesApp: 0,
                    adminEmailed: 0,
                    adminpayment: 0,
                    adminReport: 0,
                    studentfeedback: 0,
                    rolemanagement: 0,
                    help: 1,
                };
                if (req.body.roles.constructor === Array && req.body.roles.length > 0) {
                    req.body.roles.forEach(function (role) {
                        insert_obj[role] = 1;
                    });
                }
                roles.update(insert_obj).then(function (updated_roles) {
                    if (updated_roles) {

                        res.json({
                            status: 200,
                            data: updated_roles,
                        });
                    } else {
                        res.json({
                            status: 400,
                            message: "Error occured while updating roles.",
                        });
                    }
                }).catch(error => {
                    models.Activitytracker.create({
                        user_id: user.id,
                        activity: "SubAdmin Roles Add/Update",
                        data: "SubAdmin roles updated for " + user.email + " by " + req.user.email,
                        application_id: '',
                        source: "hsncverification"
                    });
                    res.json({
                        status: 400,
                        message: error,
                    });
                });
            } else {
                var insert_obj = {
                    userid: req.body.user_id,
                };

                if (req.body.roles) {
                    if (
                        req.body.roles.constructor === Array &&
                        req.body.roles.length > 0
                    ) {
                        req.body.roles.forEach(function (role) {
                            insert_obj[role] = 1;
                        });
                    }
                }
                models.Role.create(insert_obj).then(function (roles_created) {
                    if (roles_created) {

                        models.Activitytracker.create({
                            user_id: user.id,
                            activity: "SubAdmin Roles Add/Update",
                            data: "SubAdmin roles added for " + user.email + " by " + req.user.email,
                            application_id: '',
                            source: "hsncverification"
                        });
                        res.json({
                            status: 200,
                            data: roles_created,
                        });
                    } else {
                        res.json({
                            status: 400,
                            message: "Error occured while creating roles.",
                        });
                    }
                }).catch(error => {
                    res.json({
                        status: 400,
                        message: "Internal Server Error",
                    });
                });
            }
        }).catch(error => {
            res.json({
                status: 400,
                message: "User not found",
            });
        });
    }).catch(error => {
        res.json({
            status: 400,
            message: "Internal Server Error 2",
        });
    });
});

router.post('/saveEduDetails', async (req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    var documentData = req.body.errataDetails;
    var Email = req.body.email;

    try {
        if (documentData.id) {
            let docDetails = await models.DocumentDetails.findOne({
                where: { id: documentData.id }
            })

            if (docDetails) {
                let updateDetails = await models.DocumentDetails.update({
                    courseName: documentData.courseName,
                    courseType: documentData.courseType,
                    seatNo: documentData.seatNo,
                    semester: documentData.semester,
                    PassingMonthYear: documentData.passingMonthYear,
                    resultClass: documentData.result,
                    SGPI: documentData.sgpi,
                    grade: documentData.grade,
                    course_name: documentData.courseName.replace(/[&\/\\#+()$~%'":*?<>{}-\s]/g, '_'),
                    convocationDate: (documentData.convocationDate) ? (moment(new Date(documentData.convocationDate)).format('YYYY-MM-DD')) : null,
                    convocationNo: documentData.convocationNo,
                }, {
                    where: { id: documentData.id }
                });
                if (updateDetails) {
                    const data1 = Email + " has been Edited Educational Details";
                    const activity = "Edit Educational Details"
                    functions.activitylog(clientIP, req, updateDetails.user_id, activity, data1, updateDetails.app_id, 'guverification')
                    res.json({
                        status: 200,
                        data: updateDetails,
                    });

                }
                else {
                    res.json({
                        status: 400,
                        data: documentData,
                    });
                }
            } else {
                res.json({
                    status: 404,
                    msg: "document id is not found",
                });
            }
        }
    } catch (e) {
        res.json({
            status: 404,
            msg: "document id is not found",
        });
    }

})

module.exports = router;

