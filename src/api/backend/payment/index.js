const express = require('express');
const router = express.Router();
const config = require('config');
var path = require('path');
var root_path = path.dirname(require.main.filename);
var models = require(root_path + '/models');
const request = require('request');
const { FILE_LOCATION } = config.get('path');
const { serverUrl, clientUrl } = config.get('api');
const {access_Code,working_Key,merchantId,secure_Url} = config.get('paymentGateway');
var Moment = require('moment-timezone');
var urlencode = require('urlencode');
var ccav = require("./ccavutil");
var qs = require('querystring');
const { json } = require('body-parser');
const functions = require('../function');
var self_PDF = require('../invoiceTemplate');
var moments = require("moment");
var converter = require('number-to-words');
var emailService = require ('../../../utils/emailService');

var paymentGatewayMode = 'live';//'live'; // live OR test
var workingKey = '';
var accessCode = '';
var secureUrl = '';
var merchant_id = '';
var currency;
var serverurl = serverUrl;
var clienturl = clientUrl;

//Nodedev payment gateway - for testing
if (paymentGatewayMode == 'live') {
    //Live payment gateway
   //merchant_id = '942196';
    merchant_id= merchantId;   

    workingKey = working_Key;
    //accessCode = 'AVPC75JC35BU56CPUB'; 
    accessCode = access_Code;  //hsnc 

    secureUrl = secure_Url;
    currency = 'INR';
}
else
{
   //
    //for local
   workingKey = '2A0F1980BE153FFB5A15A0783018F35A'; //hsnc
   //workingKey = '19220C811E78848B76420041521DC0E1';
    accessCode = 'AVXY02GC57AA32YXAA'; //
    secureUrl = 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
}

router.post('/paymentrequest', (req, res, next)=> {
    var currentdate = new Date();
    var year = currentdate.getFullYear();
    year = year.toString().substr(-2);
    var total_amount
    if (req.body.user_id == 445) {
        total_amount = 1;
    } else {
        total_amount = req.body.amount;

    }

    var transaction_id = req.body.user_id + "Y" + year + "M" + (currentdate.getMonth() + 1) + "D" + currentdate.getDate() + "T" + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds();

    models.Orders.findOne({
        where: {
            user_id: req.body.user_id,
            amount: total_amount,
            status: '0'
        }
    }).then(function (order_exists) {
        if (order_exists) {
            var paymentData = {
                merchant_id: merchant_id,
                order_id: order_exists.id,
                currency: currency,
                amount: total_amount,
                redirect_url: serverurl + "payment/success-redirect-url",
                cancel_url: serverurl + "payment/cancel-redirect-url",
                language: 'EN',
                billing_name: req.body.app_name,
                billing_address: '',
                billing_city: "",
                billing_state: "",
                billing_zip: "",
                billing_country: 'India',
                billing_tel: "",
                billing_email: req.body.app_email,
                merchant_param1: req.body.app_name,
                merchant_param2: req.body.app_email,
                merchant_param3: 'https://verify.studentscenter.in',
                merchant_param4: req.body.user_id,
                merchant_param5: transaction_id
            };
            var bodyJson = JSON.parse(JSON.stringify(paymentData));
            var data = '';
            var i = 0;
            for (var attr in bodyJson) {
                if (i) { data = data + '&'; } i = 1;
                data = data + attr + '=' + encodeURIComponent(bodyJson[attr]);
            }

            var encRequest = ccav.encrypt(data, workingKey);
            var viewdata = {
                secureUrl: secureUrl,
                encRequest: encRequest,
                accessCode: accessCode
            }

            res.json({
                status: 200,
                data: viewdata
            })
        } else {
            models.Orders.getThreeDigit().then(function (getid) {
                var last_id = getid[0].MAXID;
                incremented_Id = parseInt(last_id) + 01;
                models.Orders.create({
                    id: incremented_Id,
                    user_id: req.body.user_id,
                    timestamp: Moment(new Date()).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),//functions.get_current_datetime(),
                    amount: total_amount,
                    status: '0',
                    source : 'hsncverification'
                }).then(function (order_created) {
                    if (order_created) {
                        var paymentData = {
                            merchant_id: merchant_id,
                            order_id: order_created.id,
                            currency: currency,
                            amount: total_amount,
                            // redirect_url: serverurl + "payment/success-redirect-url",
                            // cancel_url: serverurl + "payment/cancel-redirect-url",
                            redirect_url:  "https://verify.studentscenter.in/server/api/payment/success-redirect-url",
                            cancel_url: "https://verify.studentscenter.in/server/api/payment/cancel-redirect-url",
                            language: 'EN',
                            billing_name: req.body.app_name,
                            billing_address: '',
                            billing_city: "",
                            billing_state: "",
                            billing_zip: "",
                            billing_country: 'India',
                            billing_tel: "",
                            billing_email: req.body.app_email,
                            merchant_param1: req.body.app_name,
                            merchant_param2: req.body.app_email,
                            merchant_param3: 'https://verify.studentscenter.in',
                            merchant_param4: req.body.user_id,
                            merchant_param5: transaction_id
                        };
	                    
                        var bodyJson = JSON.parse(JSON.stringify(paymentData));
                        var data = '';
                        var i = 0;
                        for (var attr in bodyJson) {
                            if (i) { data = data + '&'; } i = 1;
                            data = data + attr + '=' + encodeURIComponent(bodyJson[attr]);
                        }
                        var encRequest = ccav.encrypt(data, workingKey);
                        var viewdata = {
                            secureUrl: secureUrl,
                            encRequest: encRequest,
                            accessCode: accessCode
                        }

                        res.json({
                            status: 200,
                            data: viewdata
                        })
                    }
                });
            })
        }
    });
});

router.post('/success-redirect-url', function (req, res) {
    console.log("/success-redirect-url")
    var ccavEncResponse = '',
        ccavResponse = '',
        ccavPOST = '';
    var total_amount;
    var bodyJson = JSON.parse(JSON.stringify(req.body));
    var data = '';
    var i = 0;
    for (var attr in bodyJson) {
        if (i) { data = data + '&'; } i = 1;
        data = data + attr + '=' + encodeURIComponent(bodyJson[attr]);
    }
    
    ccavEncResponse += data;
    ccavPOST = qs.parse(ccavEncResponse);
    var encryption = ccavPOST.encResp;
    ccavResponse = ccav.decrypt(encryption, workingKey);
    
    var obj = qs.parse(ccavResponse);
    if (obj.order_status == "Success") {
        total_amount = obj.mer_amount;
        models.Orders.findOne({
            where: {
                id: obj.order_id
            }
        }).then(function (order) {
            models.Transaction.create({
                order_id: obj.order_id,
                tracking_id: obj.tracking_id,
                bank_ref_no: obj.bank_ref_no,
                order_status: obj.order_status,
                payment_mode: 'online',
                currency: 'INR',
                amount: total_amount,
                billing_name: obj.name,
                billing_tel: '',
                billing_email: obj.email,
                merchant_param1: obj.merchant_param1,
                merchant_param2: obj.merchant_param2,
                merchant_param3: obj.merchant_param3,
                merchant_param4: obj.merchant_param4,
                merchant_param5: obj.merchant_param5,
                split_status: '-1'
            }).then(function (transaction_created) {
                if (transaction_created) {
                    models.Application.create({
                        tracker : 'apply',
                        status : 'new',
                        total_amount: total_amount,
                        user_id : obj.merchant_param4,
                        source_from : 'hsncverification'
                    }).then(function(application){
                        order.update({
                            order_id: '1',
                            application_id: application.id,
                            timestamp: Moment(new Date()).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),//functions.get_current_datetime(),
                            amount: total_amount,
                            status: '1'
                        }).then(function (order_updated) {
                            setApplicationID(obj.merchant_param4,application.id);
                            applicationCreationMail(obj.merchant_param4,application.id);
                            // createEnrollmentNumber(obj.merchant_param4,application.id, application.created_at);
                            models.Activitytracker.create({
                                user_id : application.user_id,
                                activity : "Payment",
                                data :obj.merchant_param2+" has been made payment for application "+application.id + ' for Verification',
                                application_id : application.id,
                                source :'hsncverification'
                            });
                            if(order_updated!=null){      
                                res.redirect(`${clientUrl}pages/FirstSuccess?order_id=${obj.order_id}`);
                            }
                        })
                    })
                    
                }
            });
        });
    } else {
        models.Orders.findOne({
            where:
            {
                id: obj.order_id
            }
        }).then(function (ord) {
            if (obj.order_status == 'Failure') {
                ord.update({
                    status: '-1'
                }).then(function (updated) {
                    res.redirect(clienturl + "pages/FirstFailure?order_status=" + obj.order_status);
                })
            } else if (obj.order_status == 'Timeout') {
                ord.update({
                    status: '2'
                }).then(function (updated) {
                    res.redirect(clienturl + "pages/FirstFailure?order_status=" + obj.order_status);
                })
            } else if (obj.order_status == 'Aborted') {
                ord.update({
                    status: '3'
                }).then(function (updated) {
                    res.redirect(clienturl + "pages/FirstFailure?order_status=" + obj.order_status);
                })
            } else if (obj.order_status == 'Invalid') {
                ord.update({
                    status: '4'
                }).then(function (updated) {
                    res.redirect(clienturl + "pages/FirstFailure?order_status=" + obj.order_status);
                })
            } else {
                ord.update({
                    status: '5'
                }).then(function (updated) {
                    res.redirect(clienturl + "pages/FirstFailure?order_status='error'");
                })
            }
        });
    }

    function setApplicationID(user_id, app_id){
        models.VerificationTypes.setAppId(user_id,app_id).then(function(verificationTypes){
            models.DocumentDetails.setAppId(user_id,app_id).then(function(documentDetails){
                models.InstituteDetails.setAppId(user_id,app_id).then(function(instituteDetails){
                });
            })
        })
    }

    function applicationCreationMail(user_id,app_id){
        models.User.findOne({
            where:{
                id : user_id
            }
        }).then(function(user){
            models.VerificationTypes.findAll({
                where : {
                    user_id : user_id,
                    app_id : app_id
                }
            }).then(function(verificationTypes){
                // var verificationData = {
                //     marksheet : (verificationTypes.marksheet) ? verificationTypes.noOfMarksheet : 0,
                //     // transcript : (verificationTypes.transcript) ? verificationTypes.noOfTranscript : 0,
                //     degreeCertificate : (verificationTypes.degreeCertificate) ? verificationTypes.noOfDegree : 0,
                // };
                var verificationData =  'You are applied for verification of ';
                verificationData += ((verificationTypes.marksheet && verificationData.degree) ? 
                verificationTypes.noOfMarksheet + ' marksheet(s) and ' + verificationTypes.noOfDegree + 
                'degree certificate(s)' : ((verificationTypes.marksheet && !verificationData.degree) ? 
                verificationTypes.noOfMarksheet + ' marksheet(s) ': ((!verificationTypes.marksheet && 
                verificationData.degree) ? 
                verificationTypes.noOfDegree + 'degree certificate(s)' : '' )))

                var emailData;
                if(user.agent_id){
                    models.User.findOne({
                        where :{
                            id : user.agent_id
                        }
                    }).then(function(agent){
                        emailData = {
                            userName: agent.marksheetName,
                            email: agent.email,
                            app_id : app_id,
                            verificationData : verificationData,
                            sentTo : 'agent',
                            student_name : user.name + ' ' + user.surname,
                            student_email : user.email
                        }
                    });
                }else{
                    emailData = {
                        userName: user.name + ' ' + user.surname,
                        email: user.email,
                        app_id : app_id,
                        verificationData : verificationData,
                        sentTo : 'student'
                    }
                }
                
                var emailResponse = emailService.applicationGenerate(emailData);

                // var url =config.get('email').BASE_URL_SENDGRID + 'applicationGenerate';
        
                // request.post( url, {
                //     json: {
                //     userName: user.name + ' ' + user.surname,
                //     email: user.email,
                //     app_id : app_id,
                //     source : 'hsncverification',
                //     verificationData : verificationData,
                //     sendTo : 'student'
                //     }
                // }, function (error, response, body) {
                // });
            })
        })
    }

    // function createEnrollmentNumber(user_id,app_id, app_date){
    //     models.VerificationTypes.findOne({
    //         where :{
    //             user_id : user_id,
    //             app_id : app_id
    //         }
    //     }).then(function(verification){
    //         if(verification.marksheet == true || verification.transcript == true || verification.degreeCertificate == true){
    //             var currentYear = moments().year();
    //             models.MDT_User_Enrollment_Detail.getListLastData(currentYear).then(function(lastData){
    //                var enrollment_no;
    //                 if(lastData.length > 0){
    //                     enrollment_no = parseInt(lastData[0].enrollment_no) + 1;
    //                 }else{
    //                     enrollment_no = 1;
                        
    //                 }

    //                 models.MDT_User_Enrollment_Detail.create({
    //                     enrollment_no: enrollment_no,
    //                     application_date: app_date,
    //                     user_id :user_id,
    //                     application_id : app_id,
    //                 });
    //             })
                
    //         }
    //     })
    // }
});

router.post('/cancel-redirect-url', function (req, res) {
    res.redirect(clienturl + "pages/FirstCancel");
});

router.post('/PaymentDetails', function (req, res) {
    console.log("/PaymentDetails")
    var view_data = {};
    models.Orders.findOne({
        where:
        {
            id: req.body.order_id,
            source: "hsncverification"
        }
    }).then(function (order) {
        if (order) {
            models.Transaction.findOne({
                where:
                {
                    order_id: order.id
                }
            }).then(function (transaction) {
                if (transaction) {
                    models.Feedback.findOne({
                        where:{
                            user_id : order.user_id,
                            source : 'hsncVerification'
                        }
                    }).then(function(feedback){
                        if(feedback){
                            view_data.feedback = true;
                        }else{
                            view_data.feedback = false;
                        }
                        view_data.transaction_id = transaction.merchant_param5;
                        view_data.payment_amount = "INR " + transaction.amount;
                        view_data.payment_amount_words = converter.toWords(transaction.amount);
                        view_data.payment_status = transaction.order_status;
                        view_data.payment_date_time = moments(transaction.created_at).format("DD/MM/YYYY HH:MM");
                        view_data.application_id = order.application_id;
                        view_data.user_id = order.user_id;

                        res.json({
                            status: 200,
                            data: view_data
                        })
                    })
                }
            })
        }
    })
});

router.post('/OnlinePaymentChallan', function (req, res) {
    console.log("/OnlinePaymentChallan");
    var userId = req.body.user_id;
    models.User.findOne({
        where: {
            id:req.body.user_id
        }
    }).then(function(user){
        models.Application.findOne({
            where: {
                 id: req.body.application_id
            }
        }).then(function (appl) {
            models.Orders.findOne({
                where: {
                    application_id: req.body.application_id,
                    status: '1'
                }
            }).then(function (orders) {
                if (orders) {
                    models.Transaction.findOne({
                        where:
                        {
                            order_id: req.body.order_id
                        }
                    }).then(function (trans) {
                        receiptno = orders.id;
                        date = moments(trans.created_at).format("DD-MM-YYYY HH:MM");
                        amount_words = converter.toWords(trans.amount);
                        self_PDF.receipt_pdf(userId,req.body.application_id,trans.tracking_id,trans.order_id,trans.amount,trans.order_status,trans.created_at,user.email,amount_words,function (err) {
                            if (err) {
                                res.send({ status: 400, data: err })
                            } else {
                                setTimeout(function () {
                                    res.send({ status: 200,data: req.body.application_id + "_Verification_Payment_Challan.pdf" });

                                }, 3000);
                            }
                        });
                    });
                }
            })
        })
    })
})

router.post('/feedBack', function(req, res) {
	console.log('/feedBack');
	models.Feedback.findOne({
		where:{
			user_id : req.body.user_id,
            source:"hsncverification"
		}
	}).then(function(feedbackExists){
		if(feedbackExists){
			feedbackExists.update({
				website_satisfy: req.body.satisfy,
			    website_recommend: req.body.recommend,
		    	staff_satisfy: req.body.staff,
		    	experience_problem :req.body.experience,
		    	problem: req.body.exp_prob,
		    	suggestion: req.body.suggestion,
			}).then(function(feedbackRecorded){
				if(feedbackRecorded){
					res.json({
						status : 200
					})
				}else{
					res.json({
						status : 400
					})
				}
			})
		}else{
			models.Feedback.create({
				website_satisfy: req.body.satisfy,
			    website_recommend: req.body.recommend,
		    	staff_satisfy: req.body.staff,
		    	experience_problem :req.body.experience,
		    	problem: req.body.exp_prob,
		    	suggestion: req.body.suggestion,
		    	user_id : req.body.user_id,
                source:"hsncverification"
			}).then(function(feedbackRecorded){
				if(feedbackRecorded){
                    if(feedbackRecorded.website_satisfy == 'can_improve' || feedbackRecorded.website_satisfy == 'Unsatisfy'
                    || feedbackRecorded.staff_satisfy == 'Unsatisfy' || feedbackRecorded.staff_satisfy == 'can_improve'){
                        models.User.findOne({
                            where:{
                                id : req.body.user_id
                            }
                        }).then(function(user){
                            var url =config.get('email').BASE_URL_SENDGRID + 'improvementFeedback';
                            request.post(url, {
                                json: {
                                    email : user.email,
                                    name : user.name + ' ' + user.surname,
                                    source : 'hsncverification'
                                }
                            });
                            res.json({
                                status : 200
                            })
                        })
                    }else{
                        res.json({
                            status : 200
                        })
                    }
				}else{
					res.json({
						status : 400
					})
				}
			})
		}
	})
});

router.get('/splitPaymentCron',function(req,res){
    console.log("/splitPaymentCron")
    models.Transaction.findAll({
        where:
        {
            split_status : '-1'
        }
    }).then(function (trans) {
        trans.forEach(function(tran){
            var reference_no = tran.tracking_id;
            var statusTrackerData = {
                "reference_no": reference_no,
                //"order_no": order_id
            }
            var status_encRequest = ccav.encrypt(JSON.stringify(statusTrackerData),workingKey);
            

            request.post(
                "https://api.ccavenue.com/apis/servlet/DoWebTrans?enc_request="+status_encRequest+"&access_code="+accessCode+"&command=orderStatusTracker&request_type=JSON&response_type=JSON&version=1.2",
                    // { json: {enc_request:encRequest,accessCode:splitaccessCode,command:'createSplitPayout',request_type:'JSON',response_type:'JSON',version:'1.2'}},
                    function (error, response, body) {
                        var statustracker_obj = qs.parse(response.body);

                        var dec_status = ccav.decrypt(statustracker_obj.enc_response,workingKey);

                        var status_pay = JSON.parse(dec_status);

                        var order_fee_perc_value = status_pay.order_fee_perc_value;
                        var order_tax = status_pay.order_tax;
                        var order_fee_flat = status_pay.order_fee_flat;
                        var ccavenue_share = order_fee_perc_value + order_tax + order_fee_flat;
                        var university_split_share = 0;
                        var edulab_split_share = status_pay.order_amt - ccavenue_share - university_split_share;
                        var splitPaymentData = {
                            'reference_no': reference_no, 
                            'split_tdr_charge_type':'M',
                            'merComm': ccavenue_share,
                            'split_data_list': [
                                {'splitAmount': edulab_split_share ,'subAccId':'EDUHSNCATTN'}, //edulab
                                //{'splitAmount': university_split_share ,'subAccId':'HSNCATTN'} // university
                            ]
                        }
                        setTimeout(function(){ 
                            var split_encRequest = ccav.encrypt(JSON.stringify(splitPaymentData),workingKey);
            
                            request.post(
                                "https://login.ccavenue.com/apis/servlet/DoWebTrans?enc_request="+split_encRequest+"&access_code="+accessCode+"&command=createSplitPayout&request_type=JSON&response_type=JSON&version=1.2",
                                    // { json: {enc_request:encRequest,accessCode:accessCode,command:'createSplitPayout',request_type:'JSON',response_type:'JSON',version:'1.2'}},
                                function (error, response, body) {
                                    var split_obj = qs.parse(response.body);
                                    var dec_split = ccav.decrypt(split_obj.enc_response,workingKey);
         
                                    var pay = JSON.parse(dec_split);
                                    var val = pay.Create_Split_Payout_Result;

                                    var split_status = val.status;

                                    models.Transaction.findOne({
                                        where:
                                        {
                                            tracking_id : reference_no
                                        }
                                    }).then(function(split_trans){
                                        if(split_trans){
                                            if(split_status == '1'){
                                                if(val.error_desc == 'Split Payout is not applicable.' && val.error_code == '52012'){
                                                    split_trans.update({
                                                        split_status : '1'
                                                    }).then(function(split_trans_updated){
                    
                                                    })
                                                }else{
                                                    split_trans.update({
                                                        split_status : '-1'
                                                    }).then(function(split_trans_updated){
                    
                                                    })
                                                }
                                            }else if(split_status == '0'){
                                                split_trans.update({
                                                    a : edulab_split_share,
                                                    b : university_split_share,
                                                    cc_share : ccavenue_share,
                                                    split_status : '1'
                                                }).then(function(split_trans_updated){
                                                })
                                            }
                                        }else{

                                        }
                                    });
                                   
                                });
                            }, 500);
                        

                    }
            );

                
        })
    })
})

router.get('/singleSplit', async function(req,res){
    var trackingId = req.query.id;
    let tran = await models.Transaction.findOne({
        where : {
            split_status : '-1',
            // transaction_site : 'hsncverification',
            tracking_id : trackingId
        }
    })
    if(tran){
        var reference_no = tran.tracking_id;
            var statusTrackerData = {
                "reference_no": reference_no,
                //"order_no": order_id
            }
            var status_encRequest = ccav.encrypt(JSON.stringify(statusTrackerData),workingKey);
            

            request.post(
                "https://api.ccavenue.com/apis/servlet/DoWebTrans?enc_request="+status_encRequest+"&access_code="+accessCode+"&command=orderStatusTracker&request_type=JSON&response_type=JSON&version=1.2",
                    // { json: {enc_request:encRequest,accessCode:splitaccessCode,command:'createSplitPayout',request_type:'JSON',response_type:'JSON',version:'1.2'}},
                    function (error, response, body) {
                        var statustracker_obj = qs.parse(response.body);

                        var dec_status = ccav.decrypt(statustracker_obj.enc_response,workingKey);

                        var status_pay = JSON.parse(dec_status);

                        var order_fee_perc_value = status_pay.order_fee_perc_value;
                        var order_tax = status_pay.order_tax;
                        var order_fee_flat = status_pay.order_fee_flat;
                        var ccavenue_share = order_fee_perc_value + order_tax + order_fee_flat;
                        var university_split_share = 750;
                        var edulab_split_share = status_pay.order_amt - ccavenue_share - university_split_share;
                        var splitPaymentData = {
                            'reference_no': reference_no, 
                            'split_tdr_charge_type':'M',
                            'merComm': ccavenue_share,
                            'split_data_list': [
                                {'splitAmount': edulab_split_share ,'subAccId':'EDUHSNCATTN'}, //edulab
                                {'splitAmount': university_split_share ,'subAccId':'HSNCATTN'} // university
                            ]
                        }
                        setTimeout(function(){ 
                            var split_encRequest = ccav.encrypt(JSON.stringify(splitPaymentData),workingKey);
            
                            request.post(
                                "https://login.ccavenue.com/apis/servlet/DoWebTrans?enc_request="+split_encRequest+"&access_code="+accessCode+"&command=createSplitPayout&request_type=JSON&response_type=JSON&version=1.2",
                                    // { json: {enc_request:encRequest,accessCode:accessCode,command:'createSplitPayout',request_type:'JSON',response_type:'JSON',version:'1.2'}},
                                function (error, response, body) {
                                    var split_obj = qs.parse(response.body);
                                    var dec_split = ccav.decrypt(split_obj.enc_response,workingKey);
         
                                    var pay = JSON.parse(dec_split);
                                    var val = pay.Create_Split_Payout_Result;

                                    var split_status = val.status;

                                    models.Transaction.findOne({
                                        where:
                                        {
                                            tracking_id : reference_no
                                        }
                                    }).then(function(split_trans){
                                        if(split_trans){
                                            if(split_status == '1'){
                                                if(val.error_desc == 'Split Payout is not applicable.' && val.error_code == '52012'){
                                                    split_trans.update({
                                                        split_status : '1'
                                                    }).then(function(split_trans_updated){
                    
                                                    })
                                                }else{
                                                    split_trans.update({
                                                        split_status : '-1'
                                                    }).then(function(split_trans_updated){
                    
                                                    })
                                                }
                                            }else if(split_status == '0'){
                                                split_trans.update({
                                                    a : edulab_split_share,
                                                    b : university_split_share,
                                                    cc_share : ccavenue_share,
                                                    split_status : '1'
                                                }).then(function(split_trans_updated){
                                                })
                                            }
                                        }else{

                                        }
                                    });
                                   
                                });
                            }, 500);
                        

                    }
            );
            res.json({status:200,message:"Split Successfullt"});
    }
});

router.post('/paymentRequestDev', (req, res, next)=> {
    var currentdate = new Date();
    var year = currentdate.getFullYear();
    year = year.toString().substr(-2);
    var total_amount = 1;
    var tarcking_id = Math.floor(Math.random() * 100000);
    var bank_ref_no = Math.floor(Math.random() * 1000);
    var transaction_id = req.body.user_id + "Y" + year + "M" + (currentdate.getMonth() + 1) + "D" + currentdate.getDate() + "T" + currentdate.getHours() + currentdate.getMinutes() + currentdate.getSeconds();
    models.Orders.findOne({
        where: {
            user_id: req.body.user_id,
            amount: total_amount,
            status: '0'
        }
    }).then(function (order_exists) {
        if (order_exists) {
            var paymentData = {
                merchant_id: merchant_id,
                order_id: order_exists.id,
                currency: currency,
                amount: total_amount,
                tracking_id: tarcking_id,
                bank_ref_no: bank_ref_no,
                language: 'EN',
                billing_name: req.body.app_name,
                billing_address: '',
                billing_city: "",
                billing_state: "",
                billing_zip: "",
                billing_country: 'India',
                billing_tel: "",
                billing_email: req.body.app_email,
                merchant_param1: req.body.app_name,
                merchant_param2: req.body.app_email,
                merchant_param3: clientUrl,
                merchant_param4: req.body.user_id,
                merchant_param5: transaction_id
            };
           
           

            res.json({
                status: 200,
                data: paymentData
            })
        } else {
            models.Orders.getThreeDigit().then(function (getid) {
                var last_id = getid[0].MAXID;
                incremented_Id = parseInt(last_id) + 01;
                models.Orders.create({
                    id: incremented_Id,
                    user_id: req.body.user_id,
                    timestamp: Moment(new Date()).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),//functions.get_current_datetime(),
                    amount: total_amount,
                    status: '0',
                    source : 'hsncverification'
                }).then(function (order_created) {
                    if (order_created) {
                        var paymentData = {
                            merchant_id: merchant_id,
                            order_id: order_created.id,
                            currency: currency,
                            amount: total_amount,
                            tarcking_id: tarcking_id,
                            bank_ref_no: bank_ref_no,
                            language: 'EN',
                            billing_name: req.body.app_name,
                            billing_address: '',
                            billing_city: "",
                            billing_state: "",
                            billing_zip: "",
                            billing_country: 'India',
                            billing_tel: "",
                            billing_email: req.body.app_email,
                            merchant_param1: req.body.app_name,
                            merchant_param2: req.body.app_email,
                            merchant_param3: clientUrl,
                            merchant_param4: req.body.user_id,
                            merchant_param5: transaction_id
                        };
	                    
                        
                        res.json({
                            status: 200,
                            data: paymentData
                        })
                    }
                });
            })
        }
    });
});

router.post('/successRedirectUrlDev', function (req, res) {
    console.log("/successRedirectUrlDev")
    var paymentData = req.body.paymentData;
   
    models.Orders.findOne({
        where: {
            id: paymentData.order_id
        }
    }).then(function (order) {
        models.Transaction.create({
            order_id: paymentData.order_id,
            tracking_id: paymentData.tarcking_id,
            bank_ref_no: paymentData.bank_ref_no,
            order_status: 'success',
            payment_mode: 'dev-payment',
            currency: 'INR',
            amount: paymentData.amount,
            billing_name: paymentData.billing_name,
            billing_tel: '',
            billing_email: paymentData.billing_email,
            merchant_param1: paymentData.merchant_param1,
            merchant_param2: paymentData.merchant_param2,
            merchant_param3: paymentData.merchant_param3,
            merchant_param4: paymentData.merchant_param4,
            merchant_param5: paymentData.merchant_param5,
            split_status: '-1'
        }).then(function (transaction_created) {
            if (transaction_created) {
                models.Application.create({
                    tracker : 'apply',
                    status : 'new',
                    total_amount: paymentData.amount,
                    user_id : paymentData.merchant_param4,
                    source_from : 'hsncverification'
                }).then(function(application){
                    order.update({
                        order_id: '1',
                        application_id: application.id,
                        timestamp: Moment(new Date()).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'),//functions.get_current_datetime(),
                        amount: paymentData.amount,
                        status: '1'
                    }).then(function (order_updated) {
                        setApplicationID(paymentData.merchant_param4,application.id);
                        applicationCreationMail(paymentData.merchant_param4,application.id);
                        models.Activitytracker.create({
                            user_id : application.user_id,
                            activity : "Payment",
                            data :paymentData.merchant_param2+" has been made payment for application "+application.id + ' for Verification',
                            application_id : application.id,
                            source :'hsncverification'
                        });
                        if(order_updated!=null){  
                            var paymentResp = {
                                url : 'pages/FirstSuccess',
                                order_id : paymentData.order_id
                            }
                            res.json({
                                status :200,
                                data : paymentResp
                            });
                        }else{
                            var paymentResp = {
                                url : 'pages/FirstFailure',
                                order_status : 'FAILURE'
                            }
                            res.json({
                                status :200,
                                data : paymentResp
                            });
                        }
                    })
                })
                
            }
        });
    });
    
    function setApplicationID(user_id, app_id){
        models.VerificationTypes.setAppId(user_id,app_id).then(function(verificationTypes){
            models.DocumentDetails.setAppId(user_id,app_id).then(function(documentDetails){
                models.InstituteDetails.setAppId(user_id,app_id).then(function(instituteDetails){
                });
            })
        })
    }

    function applicationCreationMail(user_id,app_id){
        models.User.findOne({
            where:{
                id : user_id
            }
        }).then(function(user){
            models.VerificationTypes.findAll({
                where : {
                    user_id : user_id,
                    app_id : app_id
                }
            }).then(function(verificationTypes){
                // var verificationData = {
                //     marksheet : (verificationTypes.marksheet) ? verificationTypes.noOfMarksheet : 0,
                //     // transcript : (verificationTypes.transcript) ? verificationTypes.noOfTranscript : 0,
                //     degreeCertificate : (verificationTypes.degreeCertificate) ? verificationTypes.noOfDegree : 0,
                // };
                var verificationData =  'You are applied for verification of ';
                verificationData += ((verificationTypes.marksheet && verificationData.degree) ? 
                verificationTypes.noOfMarksheet + ' marksheet(s) and ' + verificationTypes.noOfDegree + 
                'degree certificate(s)' : ((verificationTypes.marksheet && !verificationData.degree) ? 
                verificationTypes.noOfMarksheet + ' marksheet(s) ': ((!verificationTypes.marksheet && 
                verificationData.degree) ? 
                verificationTypes.noOfDegree + 'degree certificate(s)' : '' )))

                var emailData;
                if(user.agent_id){
                    models.User.findOne({
                        where :{
                            id : user.agent_id
                        }
                    }).then(function(agent){
                        emailData = {
                            userName: agent.marksheetName,
                            email: agent.email,
                            app_id : app_id,
                            verificationData : verificationData,
                            sentTo : 'agent',
                            student_name : user.name + ' ' + user.surname,
                            student_email : user.email
                        }
                        var emailResponse = emailService.applicationGenerate(emailData);

                    });
                }else{
                    emailData = {
                        userName: user.name + ' ' + user.surname,
                        email: user.email,
                        app_id : app_id,
                        verificationData : verificationData,
                        sentTo : 'student'
                    }
                    var emailResponse = emailService.applicationGenerate(emailData);

                }
                
                
                // var url =config.get('email').BASE_URL_SENDGRID + 'applicationGenerate';
        
                // request.post( url, {
                //     json: {
                //     userName: user.name + ' ' + user.surname,
                //     email: user.email,
                //     app_id : app_id,
                //     source : 'hsncverification',
                //     verificationData : verificationData,
                //     sendTo : 'student'
                //     }
                // }, function (error, response, body) {
                // });
            })
        })
    }
});


module.exports = router;