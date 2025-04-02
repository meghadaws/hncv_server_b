var crypto = require('crypto');
var randomstring = require('randomstring');
// var constants = require('../config/constant');
var moment = require('moment');
var Moment = require('moment-timezone');
// var models  = require('../models');
algorithm = 'aes-256-ctr',
password = 'je93KhWE08lH9S7SN83sneI87';
var models = require('../../models');
var self_PDF = require('./invoiceTemplate');
var romans = require('romans');
const cipher = require('../../api/common/auth/cipherHelper');
var addZero = require('add-zero');
const pdf = require('pdf-parse');
var converter = require('number-to-words');

module.exports = {
	
	generateHashPassword: function(password) {
		var hashPassword = crypto
	      .createHash("md5")
	      .update(password)
	      .digest('hex');

	    return hashPassword;
	},

	generateRandomString: function(length, charset) {
		return randomstring.generate({
			length: length,
			charset: charset
		});
	},

	

	sendEmail: function(emailOptions, callback) {
		var template = process.cwd() + '/views/' + emailOptions.template + '.jade';

		require('fs').readFile(template, 'utf8', function (err, file){

			if(err) return callback (err);

			var fn = require('jade').compile(file);

			var html = fn(emailOptions.data);


			var mailOptions = {
				from: constants.SEND_EMAIL_FROM,
				fromname: constants.SEND_EMAIL_FROM_NAME,
				to: emailOptions.to,
				toname: (emailOptions.toName != null) ? emailOptions.toName : '',
				subject: emailOptions.subject,
				html: html
			};

			var sendgrid  = require('sendgrid')(constants.SENDGRID_API_KEY);
			
			sendgrid.send(mailOptions, function(err, json) {

				if (err) {

					callback(err);
				}else {

					callback();
				}
			});
		});
	},



	sendSMS: function(smsOptions, callback) {
		var client = require('twilio')(constants.TWILIO_SSID, constants.TWILIO_AUTH_TOKEN);
		if(typeof smsOptions.contact_number == 'number') smsOptions.contact_number = smsOptions.contact_number.toString(); 
		var contact_number = "+"+smsOptions.contact_number.replace(/[^\d]/g, '');


		client.messages.create({
			to: contact_number,
			from: constants.TWILIO_FROM_NUMBER,
			body: smsOptions.message
		}, function(err, message) {
			if (err) {
			
				callback(err);
			}else {

				callback();
			}
		});
	},
	get_current_datetime: function(format) {
		if(format) {
			return Moment(new Date()).tz(constants.SYSTEM_TIMEZONE).format(format);
		}else {
			return Moment(new Date()).tz(constants.SYSTEM_TIMEZONE).format('YYYY-MM-DD HH:mm:ss');
		}
	},

	socketnotification: function(action,notification_data,userId,type) {
			models.Notifications.create({
				action: action,
				message: notification_data,
				read:'false',
				flag:type,
				user_id:userId,
				created_at: moment(),
				delete_notification: 'false'
			}).then(function(activity) {
				if(activity) {
					return activity.created_at;
				}
			});
	},

	activitylog: async function(clientIP,req,user_id,activity,data,application_id) {
		const IP = clientIP || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
		models.Activitytracker.create({
			user_id: user_id,
			activity: activity,
			data: data,
			application_id: application_id,
			created_at: moment(),
			source:"hsncverification",
			ipAddress:IP,
		}).then(function(activitytracker) {
			if(activitytracker) {
 
			}
		});
	},

	getorderdetails: async (app_id) => {
        return await models.Orders.findAll({ where: { application_id: app_id} });
    },

    getEnrollDetails: async (userId, app_id, type) =>{
    	let enrollmentNumber =   await models.Application.MDT_getEnrollmentNumber(userId, app_id, type);
    	return enrollmentNumber[0];
    
    },

    getDocumentDetails: async (userId, app_id, type) =>{
    	return  await models.DocumentDetails.findAll({
            where: {
                user_id: userId,
                app_id: app_id,
                type: type
            }
        })
    },

    getInstituteDetails: async (userId, app_id, type) =>{
    	return await models.InstituteDetails.findAll({
            where: {
                user_id: userId,
                app_id: app_id,
                type: type
            }
        })
    },

    getDistinctInstitute:  async (instituteDetails) =>{
    	return await [...instituteDetails.reduce((mp, o) => {
            const key = JSON.stringify([o.name]);
            if (!mp.has(key)) mp.set(key, { refNo: o.referenceNo, name: o.name, address: o.address, count: 0 });
            mp.get(key).count++;
            return mp;
        }, new Map).values()];
    },

    generateLetters :  async (userId, educationDetails, type, institute, app_id, width, content, tablelayout, enrollmentNumber, app_status, academicYear, count_inst,belowContent,tableHeader) => {
    	var obj = {
    		error : '',
    		fileName : ''
    	}
    	await self_PDF.verificationCertificate_notForPrint(userId, educationDetails,type, institute, app_id, width, content, tablelayout, enrollmentNumber, app_status, academicYear, count_inst,belowContent,tableHeader, async function (err, filename) {
            if (err) {
            	obj.error = err;
               
            } else {
                await self_PDF.verificationCertificate(userId, educationDetails, type, institute, app_id, width, content, tablelayout, enrollmentNumber, app_status, academicYear, count_inst,belowContent,tableHeader, async function (err, filename) {
                    if (err) {
                        obj.error = err;
                    } else {
                        obj.fileName = filename
                    }
                })
            }
		})

		return obj;
    },

    getVerificationLetter : async (filename, userId, app_id) =>{
    	let letter =  await models.VerificationLetters.findOne({
            where: {
                file_name: filename,
                user_id: userId,
                app_id: app_id
            }
        })

        return letter;
    },

    addVerificationLetter: async (filename, userId, app_id, type, count)=>{
    	return await models.VerificationLetters.create({
            file_name: filename,
            user_id: userId,
            app_id: app_id,
            doc_type: type,
            noOfCopies: count
        })
    }


}