/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License. 
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

const config = require('config');
const {simpleEmail, emailWithAttachment, textLocalSMS, omniChannelToken, senderEmail} = config.get('email');
const logger = require('../utils/logger');
var emailTemplates = require('./emailTemplates');
var request = require('request');
var FormData = require('form-data');
var fs = require('fs');
var fetch = require('node-fetch');

module.exports = {
  registerEmail: async function(emailData){
    const emailContent = emailTemplates.registerEmail(emailData);
    const emailSubject = 'HSNC University: User Verification Email';
    const emailBody = JSON.stringify({
      "to": emailData.email,
      "from": senderEmail,
      "subject": emailSubject,
      "text": emailContent
    });
    
    const response = await fetch(`${simpleEmail}`, {
      method: 'post',
      headers: {
        'Authorization': 'Bearer '+omniChannelToken,
        'Content-Type': 'application/json'
      },
      body: emailBody,
    });
    return response;

  },

  applicationGenerate: async function(emailData){
    var emailContent;
    if(emailData.sentTo == 'student')
      emailContent = emailTemplates.applicationGenerateStudent(emailData);
    else
      emailContent = emailTemplates.applicationGenerateAgent(emailData);
    const emailSubject = 'HSNC University: Application Received For Verification Process';
    const emailBody = JSON.stringify({
      "to": emailData.email,
      "from": senderEmail,
      "subject": emailSubject,
      "text": emailContent
    });
    
    const response = await fetch(`${simpleEmail}`, {
      method: 'post',
      headers: {
        'Authorization': 'Bearer '+omniChannelToken,
        'Content-Type': 'application/json'
      },
      body: emailBody,
    });
    return response;

  },

  getAdminOtp: async function(emailData){
    const emailContent = emailTemplates.getAdminOtp(emailData);
    const emailSubject = 'HSNC University: Admin OTP for Verification Process';
    const emailBody = JSON.stringify({
      "to": emailData.email,
      "from": senderEmail,
      "subject": emailSubject,
      "text": emailContent
    });

    const smsText = `${emailData.otp} is your one time password for verifying your mobile number for HSNC University. For unsubscibe Text JEQPFSTOP to 919220592205 EDULAB`;

    const smsBody = JSON.stringify({
      "to": emailData.mobile,
      "msg": smsText
    });
    
    const emailResponse = await fetch(`${simpleEmail}`, {
      method: 'post',
      headers: {
        'Authorization': 'Bearer '+omniChannelToken,
        'Content-Type': 'application/json'
      },
      body: emailBody,
    });

    const SMSResponse = request.post(`${textLocalSMS}`, {
      method: 'post',
      body: smsBody,
      headers: {
          'accept': '*/*',
          'Authorization': 'Bearer ' + omniChannelToken,
          'Content-Type': 'application/json'
      }
    });

    var response = {
      status : 200
    };
    if(emailResponse.status == 200 || SMSResponse.status == 200){
      response.status = 200;
      return response;
    }else{
      response.status = 400;
      return response;
    }
  },

  sendDocuments: async function(emailData){
    const emailContent = emailTemplates.sendDocuments(emailData);
    const emailSubject = `Official Verification Report of (${emailData.studentName})- Reference  Number -
    (${emailData.data[0].reference_no})`;
    const formData = new FormData();
    formData.append('to', emailData.data[0].email);
    formData.append('from', senderEmail);
    formData.append('subject', emailSubject);
    formData.append('text', emailContent);
    for (const file of emailData.attachments) {
      const fileStream = fs.createReadStream(file.file);
      formData.append('files', fileStream, file.filename);
    }
    
    // var response = request.post(`${emailWithAttachment}`, {
    //   headers: {
    //       'accept': '*/*',
    //       'Authorization': 'Bearer '+omniChannelToken,
    //       // 'Content-Type': 'application/json'
    //       ...formData.getHeaders() 
    //   },
    //   body: formData
    // });
    const response = await fetch(`${emailWithAttachment}`, {
      method: 'post',
      headers: {
        'accept': '*/*',
        'Authorization': 'Bearer ' + omniChannelToken,
        ...formData.getHeaders() // Include headers from form-data
      },
      body: formData
    });
    const responseData = await response.json() ;
    return responseData;
   },

  sendConfirmationBack: async function(emailData){
    var emailContent;
    var email;
    if(emailData.sentTo == 'student'){
      emailContent = emailTemplates.sendConfirmationToStudent(emailData);
      email = emailData.studentEmail;
    }
    else{
      emailContent = emailTemplates.sendConfirmationToAgent(emailData);
      email = emailData.agentEmail;
    }
    const emailSubject = 'HSNC University - Verification Report - Application Sent';
    const emailBody = JSON.stringify({
      "to": email,
      "from": senderEmail,
      "subject": emailSubject,
      "text": emailContent
    });
    const response = await fetch(`${simpleEmail}`, {
      method: 'post',
      headers: {
        'Authorization': 'Bearer '+omniChannelToken,
        'Content-Type': 'application/json'
      },
      body: emailBody
    });
    return response;
  }


};
