const express = require('express');
const router = express.Router();
const config = require('config');
var path = require('path');
var root_path = path.dirname(require.main.filename);
var models = require(root_path + '/models');
var moment = require("moment");
const middleswares = require('../../utils/middleswares');
const request = require('request');
const cipher = require('../common/auth/cipherHelper');
const ENV_sendgrid_Twilio = 'production';
var emailService = require ('../../utils/emailService');

router.get('/getRegisterUser', (req, res) => {
    models.User.findAll({
        where  :{
            user_type : 'student'
        }
    }).then(function (data) {
        if (data.length > 0) {
            res.json({
                status: 200,
                data: data
            })
               
        }else{
            res.json({
                status: 400,
                message: "Wrong Details"
            })
        }
    })
})

router.post('/checkEmail', function (req, res) {
    var reqData = req.body.data;
    models.User.findOne({
        where: {
            email: reqData
        }
    }).then(function (user) {
        if (user) {
            res.send({
                status: 400,
                message: 'Email already exists.'
            });
        }else{
            res.send({
                status: 200
            });
        }
    });
});

router.get('/get_otp',middleswares.getUserInfo, function (req, res) {
    var user_id = req.query.user_id
    models.User.findOne({
        where: {
            id: user_id,
        }
    }).then(function (adminData) {
        var emailData = {
            mobile: adminData.mobile,
            mobile_country_code: adminData.mobile_country_code,
            email: adminData.email,
            otp: adminData.otp,
            toName: adminData.name,
        }

        var emailResponse = emailService.getAdminOtp(emailData);
        if(emailResponse != undefined){
            if (emailResponse.status == 200) {
                res.json({
                    status: 200,
                    message: 'Successfully',
                });
            } else if (emailResponse.status == 400) {
                res.json({
                    status: 400,
                    message: 'ERROR: An error has been occurred while sending email. Please ensure email address is proper and try again.'
                });
            }
        }else{
            res.json({
                status: 400,
                message: 'ERROR: An error has been occurred while sending email. Please ensure email address is proper and try again.'
            });
        }  
        // var url = config.get('email').BASE_URL_SENDGRID + 'adminOtp';
        // request.post(url, {
        //     json: {
        //         mobile: adminData.mobile,
        //         mobile_country_code: adminData.mobile_country_code,
        //         email: adminData.email,
        //         email_verification_token: adminData.email_verification_token,
        //         otp: adminData.otp,
        //         to: adminData.email,
        //         toName: adminData.name,
        //         source : 'hsncverification'
        //     }
        // }, function (error, response, body) {
        //     if(response != undefined){
        //         if (!error && response.statusCode == 200) {
        //             res.json({
        //                 status: 200,
        //                 message: 'Successfully',
        //             });
        //         } else if (response.statusCode == 400) {
        //             res.json({
        //                 status: 400,
        //                 message: 'ERROR: An error has been occurred while sending email. Please ensure email address is proper and try again.'
        //             });
        //         }
        //     }else{
        //         res.json({
        //             status: 400,
        //             message: 'ERROR: An error has been occurred while sending email. Please ensure email address is proper and try again.'
        //         });
        //     }                
        // })


    });
});


router.post('/update_otp', (req, res) => {
    var user_id = req.body.user_id;
    var otp = req.body.otp;
    models.User.findOne({
        where: {
            id: user_id
        }
    }).then(function (user) {
        if(otp == user.otp){
            const { randomString } = cipher.generateRandomString(6, 'numeric');
            user.update({
                otp: randomString,
                is_otp_verified : true,
                is_email_verified: true
            }).then(function (user_updated) {
                return res.json({

                    status: 200,
                    data : user_updated

                })
            });
        }else{
            return res.json({
                status: 400,
                message : 'OTP invalid'

            })
        }
    });
});


router.get('/logOutActivity', function (req, res) {
    var email = req.query.email
    models.User.findOne({
        where: {
            email: email
        }
    }).then(function (user) {
        if(user.user_type == 'admin' || user.user_type == 'subAdmin'){
            user.update({
                is_otp_verified : false,
                is_email_verified : false
            }).then(function (user_updated) {
                return res.json({
                    status: 200,
                    message: 'Successfully logged out!'
                })
            });
        }else{
            return res.json({
                status: 200,
                message: 'Successfully logged out!'
            })
        }

    });
});

module.exports = router;

