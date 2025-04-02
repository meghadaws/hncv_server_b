/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const express = require('express');
const passport = require('passport');

const cipher = require('../auth/cipherHelper');
const AuthService = require('./authService');

const router = express.Router();
const authService = new AuthService();
const auth = passport.authenticate('jwt', { session: false });
const config = require('config');
var request = require('request');
var path = require('path');
var root_path = path.dirname(require.main.filename);
var models = require(root_path + '/models');
var emailService = require ('../../../utils/emailService');

router.post('/login', (req, res) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).send({
        error: err ? err : 'Login or password is wrong',
      });
    }
    user.email=req.body.email;
    req.login(user, { session: false }, (error) => {
      if (error) {
        res.send(error);
      }
      models.User.findOne({
        where: {
          email: req.body.email
        }
      }).then(function (user) {
        var pages = '/pages/';
        if(user.user_type == 'subAdmin' || user.user_type == 'admin'){
          user.update({
            is_otp_verified : false,
            is_email_verified : false
          }).then((userUpdated)=>{
            if(user.user_type == 'subAdmin'){
              models.Role.findOne({
                where : {
                  userid : userUpdated.id
                }
              }).then(function(roles){
                if(roles.admindashboard){
                  pages += 'admindashboard';
                }else if(roles.studentmanagement){
                  pages += 'studentmanagement';
                }else if(roles.collegeManagement){
                  pages += 'collegeManagement';
                }else if(roles.adminTotal){
                  pages += 'adminTotal';
                }else if(roles.adminPending){
                  pages += 'adminPending';
                }else if(roles.adminVerified){
                  pages += 'adminVerified';
                }else if(roles.adminSigned){
                  pages += 'adminSigned';
                }else if(roles.adminEmailed){
                  pages += 'adminEmailed';
                }else if(roles.adminpayment){
                  pages += 'adminpayment';
                }else if(roles.adminReport){
                  pages += 'adminReport';
                }else if(roles.studentfeedback){
                  pages += 'studentfeedback';
                }else if(roles.help){
                  pages += 'help';
                }
                const response = { token: cipher.generateResponseTokens(userUpdated,pages) };
                res.send(response);
              })
            }else{
              pages += 'admindashboard';
              const response = { token: cipher.generateResponseTokens(userUpdated,pages) };
              res.send(response);
            }
          });
        }else {
          if(user.user_type == 'student'){
            pages+= 'student-dashboard';
          }else if(user.use_type == 'agent'){
            pages+= 'agent-dashboard'
          }
          const response = { token: cipher.generateResponseTokens(user,pages) };
          res.send(response);
        }
      })
    });
  })(req, res);
});

router.post('/sign-up', (req, res) => {
  var emailVerificationToken = require('shortid').generate();
  authService
    .register(req.body,emailVerificationToken)
    .then(user => {
      const response = { token: cipher.generateResponseTokens(user) };
      var emailData = {
        email: user.email,
        mobile: user.mobile,
        userName: user.name,
        password : req.body.password,
        email_verification_token: emailVerificationToken,
        otp: user.otp,
      }
      var emailResponse = emailService.registerEmail(emailData);
      models.Activitytracker.create({
        user_id : user.id,
        activity : "Registration",
        data : user.name+" "+user.surname+" has registered with email id "+user.email,
        application_id : null,
        source :'hsncverification'
      });

      // var url =config.get('email').BASE_URL_SENDGRID + 'verifyEmail';
      // request.post( url, {
      //   json: {
      //     mobile: user.mobile,
      //     mobile_country_code: user.mobile_country_code,
      //     userName: user.name,
      //     email: user.email,
      //     password : req.body.password,
      //     email_verification_token: emailVerificationToken,
      //     otp: user.otp,
      //     to: user.email,
      //     toname: user.name,
      //     source : 'hsncverification'
      //   }
      // }, function (error, response, body) {
            
      //   });
        res.send(response);
    })
    .catch(err => res.status(400).send({ error: err.message }));
});



router.post('/reset-pass', auth, (req, res) => {
  const { id } = req.user;
  const { password, confirmPassword, resetPasswordToken } = req.body;

  authService
    .resetPassword(password, confirmPassword, id, resetPasswordToken)
    .then(() => res.send({ message: 'ok' }))
    .catch(err => {
      res.status(400).send({ error: err.message });
    });
});

// new resetpassword
router.post('/resetpassword', function (req, res) {
  var body_data = req.body.data;
  var password = body_data.userPassword;
  var confirm_password = body_data.userConfirmPassword;
  if (password == confirm_password) {
      var hashPassword = cipher.generateHashPassword(password);
      models.User.findOne({
          where: {
              email: body_data.email
          }
      }).then(function (User_data) {
        if(User_data){

          User_data.update({
              password: hashPassword.hashPassword
          });
        }
          res.json({
              status: 200,
              data: body_data,
              message: 'Password Reset successfully'
          });
      })
  } else {
      res.json({
          status: 401,
          message: 'Something went wrong while changing your Password'
      });
  }
});

router.post('/request-pass', (req, res) => {
  const { email } = req.body;
  authService
    .requestPassword(email)
    .then(() => res.send({ message: `Email with reset password instructions was sent to email ${email}.` }))
    .catch((error) => {
      res.status(400).send({ data: { errors: error.message } });
    });
});

router.post('/sign-out', (req, res) => {
  res.send({ message: 'ok' });
});

router.post('/refresh-token', (req, res) => {
  const token = req.body;
  authService
    .refreshToken(token.payload)
    .then(responseToken => res.send({ token: responseToken }))
    .catch(err => res.status(400).send({ error: err.message }));
});

router.get('/verify-email', function (req, res) {
  var url = config.get('frontEnd').domain + 'auth/login?verify=1';
	authService
    .verifyUser(req.query.token)
    .then(() => res.redirect(url))
    .catch(err => {
      res.status(400).send({ error: err.message });
    });
});

router.get('/verify-emails', function (req, res) {
  var token = req.query.token
  var url = config.get('frontEnd').domain + 'auth/login?verify=1';
  models.User.findOne({
		where: {
			email_verification_token: req.query.token
		}
	}).then(function(user){
    if(user){
      models.User.update({is_email_verified : 1, is_otp_verified: 1, email_verification_token : null}, {
        where: {
          email_verification_token : token
        }
      })
    }
  });
});

module.exports = router;
