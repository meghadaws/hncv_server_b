const config = require('config');
const { email } = require('../../config/default');
const { serverUrl, universityLogo} = config.get('api');

const path = `${serverUrl}upload/profile_pic/${universityLogo}`;


module.exports = {
  registerEmail: function(emailData){
      const verifyEmailPath = `${serverUrl}/auth/verify-email?token=${emailData.email_verification_token}`;
      const emailContext = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml" data-dnd="true">
              <head>
                  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" 
                  integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                  <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                  <style type="text/css">
                      body {
                          color: #000000;
                      }

                      body a {
                          color: #1188e6;
                          text-decoration: none;
                      }

                      p {
                          margin: 0;
                          padding: 0;
                      }

                      table[class="wrapper"] {
                          width: 100% !important;
                          table-layout: fixed;
                          -webkit-font-smoothing: antialiased;
                          -webkit-text-size-adjust: 100%;
                          -moz-text-size-adjust: 100%;
                          -ms-text-size-adjust: 100%;
                      }

                      img[class="max-width"] {
                          max-width: 100% !important;
                      }

                      @media screen and (max-width:480px) {

                          .preheader .rightColumnContent,
                          .footer .rightColumnContent {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent div,
                          .preheader .rightColumnContent span,
                          .footer .rightColumnContent div,
                          .footer .rightColumnContent span {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent,
                          .preheader .leftColumnContent {
                          font-size: 80% !important;
                          padding: 5px 0;
                          }

                          table[class="wrapper-mobile"] {
                          width: 100% !important;
                          table-layout: fixed;
                          }

                          img[class="max-width"] {
                          height: auto !important;
                          }

                          a[class="bulletproof-button"] {
                          display: block !important;
                          width: auto !important;
                          font-size: 80%;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }

                          // 2 columns
                          #templateColumns {
                          width: 100% !important;
                          }

                          .templateColumnContainer {
                          display: block !important;
                          width: 100% !important;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }
                      }
                  </style>
                  <style>
                      body, p, div {
                          font-family: arial, sans-serif;
                      }
                  </style>
              </head>
              <body yahoofix="true" style="min-width: 100%; margin: 0; padding: 0; font-size: 14pxpx; 
              font-family: arial,sans-serif; color: #000000; background-color: #FFFFFF; color: #000000" 
              data-attributes="%7B%22dropped%22%3Atrue%2C%22bodybackground%22%3A%22%23FFFFFF%22%2C%22bodyfontname%22%3A%22arial%2Csans-serif%22%2C%22bodytextcolor%22%3A%22%23000000%22%2C%22bodylinkcolor%22%3A%22%231188e6%22%2C%22bodyfontsize%22%3A%2214px%22%7D">
                  <center class="wrapper">
                      <div class="webkit">
                          <table class="wrapper" cellpadding="0" cellspacing="0" border="0" width="100%" 
                          bgcolor="#FFFFFF">
                              <tbody>
                                  <tr>
                                      <td valign="top" bgcolor="#FFFFFF" width="100%">
                                          <table class="outer" width="100%" role="content-container" 
                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22containerpadding%22%3A%220%2C0%2C0%2C0%22%2C%22containerwidth%22%3A600%2C%22containerbackground%22%3A%22%23FFFFFF%22%7D" 
                                          align="center" cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="100%" cellpadding="0" cellspacing="0" 
                                                          border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td>
                                                                          <table width="100%" cellpadding="0" 
                                                                          cellspacing="0" border="0" 
                                                                          style="width: 100%; max-width:600px" 
                                                                          align="center">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td role="modules-container" style="padding: 0px 0px 0px 0px; color: #000000; text-align: left" bgcolor="#FFFFFF" width="100%" align="left">
                                                                                          <table class="module preheader preheader-hide" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0" role="module" data-type="preheader">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td role="module-content">
                                                                                                          <p></p>
                                                                                                      </td>
                                                                                                  </tr>
                                                                                              </tbody>
                                                                                          </table>
                                                                                          <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed"
                                                                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                                                                              <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="wysiwyg" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                          <meta name="viewport"
                                            content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                                          <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                                          <center class="wrapper">
                                            <div class="webkit"></div>
                                          </center>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="wrapper" role="module" data-type="image" border="0" align="center"
                                    cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed">
                                    <tbody>
                                      <tr>
                                        <td
                                          style="font-size:6px;line-height:10px;background-color:#ffffff;padding: 0px 0px 0px 0px"
                                          valign="top" align="center" role="module-content">
                                          <!--
                                                if mso
                                                center
                                                table(width='150', border='0', cellpadding='0', cellspacing='0', style='table-layout: fixed;')
                                                tr
                                                td(width='150', valign='top')
                                                --><img class="max-width" width="150" height=""
                                            src="${path}"
                                            alt="" border="0"
                                            style="display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-width: 150px !important; width: 100% !important; height: auto !important; " />
                                          <!-- if mso-->
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A7%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 7px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="divider" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A30%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 30px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="text" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22child%22%3Afalse%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" valign="top" height="100%"
                                          style="padding: 0px 0px 0px 0px" bgcolor="#ffffff">
                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 25px; margin-bottom: 30px">
                                            Welcome to HSNC University, Student Facilitation Center
                                          </h1>
                                          <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                Dear Applicant,</p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                Thank you for your registration! You can now login and proceed for Verification Process.</p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                              </p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                Your login details:</p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                <strong>Username</strong>:- ${emailData.email}
                                              </p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                <strong>Password</strong>:- ${emailData.password}
                                              </p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 15px; font-size: 15px">
                                                <strong>OTP</strong>:- ${emailData.otp}
                                              </p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: bold; background-color: rgb(255, 255, 255); margin-bottom: 55px; font-size: 12px">
                                                <h2><a href='${verifyEmailPath}'> Activate Your Profile</h2>
                                              </p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 15px; font-size: 15px">
                                                <strong>Kindly click on the above “Activate Your Profile” TAB to proceed ahead with your application.</strong>
                                              </p>

                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 30px; margin-bottom: 30px">
                                          </h1>Thanks & Regards,<br />Student Facilitation Centre<br />HSNC University
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</center>
</body>
</html>`

  return emailContext;
  }, 

  applicationGenerateStudent: function(emailData){
      const emailContext = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
       "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml" data-dnd="true">
              <head>
                  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" 
                  integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                  <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                  <style type="text/css">
                      body {
                          color: #000000;
                      }

                      body a {
                          color: #1188e6;
                          text-decoration: none;
                      }

                      p {
                          margin: 0;
                          padding: 0;
                      }

                      table[class="wrapper"] {
                          width: 100% !important;
                          table-layout: fixed;
                          -webkit-font-smoothing: antialiased;
                          -webkit-text-size-adjust: 100%;
                          -moz-text-size-adjust: 100%;
                          -ms-text-size-adjust: 100%;
                      }

                      img[class="max-width"] {
                          max-width: 100% !important;
                      }

                      @media screen and (max-width:480px) {

                          .preheader .rightColumnContent,
                          .footer .rightColumnContent {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent div,
                          .preheader .rightColumnContent span,
                          .footer .rightColumnContent div,
                          .footer .rightColumnContent span {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent,
                          .preheader .leftColumnContent {
                          font-size: 80% !important;
                          padding: 5px 0;
                          }

                          table[class="wrapper-mobile"] {
                          width: 100% !important;
                          table-layout: fixed;
                          }

                          img[class="max-width"] {
                          height: auto !important;
                          }

                          a[class="bulletproof-button"] {
                          display: block !important;
                          width: auto !important;
                          font-size: 80%;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }

                          // 2 columns
                          #templateColumns {
                          width: 100% !important;
                          }

                          .templateColumnContainer {
                          display: block !important;
                          width: 100% !important;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }
                      }
                  </style>
                  <style>
                      body, p, div {
                          font-family: arial, sans-serif;
                      }
                  </style>
              </head>
              <body yahoofix="true" style="min-width: 100%; margin: 0; padding: 0; font-size: 14pxpx; 
              font-family: arial,sans-serif; color: #000000; background-color: #FFFFFF; color: #000000" 
              data-attributes="%7B%22dropped%22%3Atrue%2C%22bodybackground%22%3A%22%23FFFFFF%22%2C%22bodyfontname%22%3A%22arial%2Csans-serif%22%2C%22bodytextcolor%22%3A%22%23000000%22%2C%22bodylinkcolor%22%3A%22%231188e6%22%2C%22bodyfontsize%22%3A%2214px%22%7D">
                  <center class="wrapper">
                      <div class="webkit">
                          <table class="wrapper" cellpadding="0" cellspacing="0" border="0" width="100%" 
                          bgcolor="#FFFFFF">
                              <tbody>
                                  <tr>
                                      <td valign="top" bgcolor="#FFFFFF" width="100%">
                                          <table class="outer" width="100%" role="content-container" 
                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22containerpadding%22%3A%220%2C0%2C0%2C0%22%2C%22containerwidth%22%3A600%2C%22containerbackground%22%3A%22%23FFFFFF%22%7D" 
                                          align="center" cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="100%" cellpadding="0" cellspacing="0" 
                                                          border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td>
                                                                          <table width="100%" cellpadding="0" 
                                                                          cellspacing="0" border="0" 
                                                                          style="width: 100%; max-width:600px" 
                                                                          align="center">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td role="modules-container" style="padding: 0px 0px 0px 0px; color: #000000; text-align: left" bgcolor="#FFFFFF" width="100%" align="left">
                                                                                          <table class="module preheader preheader-hide" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0" role="module" data-type="preheader">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td role="module-content">
                                                                                                          <p></p>
                                                                                                      </td>
                                                                                                  </tr>
                                                                                              </tbody>
                                                                                          </table>
                                                                                          <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed"
                                                                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                                                                              <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="wysiwyg" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                          <meta name="viewport"
                                            content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                                          <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                                          <center class="wrapper">
                                            <div class="webkit"></div>
                                          </center>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="wrapper" role="module" data-type="image" border="0" align="center"
                                    cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed">
                                    <tbody>
                                      <tr>
                                        <td
                                          style="font-size:6px;line-height:10px;background-color:#ffffff;padding: 0px 0px 0px 0px"
                                          valign="top" align="center" role="module-content">
                                          <!--
                                                if mso
                                                center
                                                table(width='150', border='0', cellpadding='0', cellspacing='0', style='table-layout: fixed;')
                                                tr
                                                td(width='150', valign='top')
                                                --><img class="max-width" width="150" height=""
                                             src="${path}"
                                            alt="" border="0"
                                            style="display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-width: 150px !important; width: 100% !important; height: auto !important; " />
                                          <!-- if mso-->
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A7%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 7px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="divider" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A30%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 30px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="text" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22child%22%3Afalse%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" valign="top" height="100%"
                                          style="padding: 0px 0px 0px 0px" bgcolor="#ffffff">
                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 25px; margin-bottom: 30px">
                                            Welcome to HSNC University, Student Facilitation Center
                                          </h1>
                                          <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                Dear Applicant</p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                This is to notify that we have received your application for Online Verification.The department will now check the Educational Details & the documents uploaded by you. </p>
                                              
                                              
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 15px; font-size: 15px">
                                                <strong>We are here to help you in getting the certificate.</strong>
                                              </p>

                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 30px; margin-bottom: 30px">
                                          </h1>Thanks & Regards,<br />Student Facilitation Centre<br />HSNC University
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</div>
</center>
</body>
</html>`

  return emailContext;
  },

  applicationGenerateAgent: function(emailData){
    const emailContext = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" data-dnd="true">
            <head>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" 
                integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous" />
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                <style type="text/css">
                    body {
                        color: #000000;
                    }

                    body a {
                        color: #1188e6;
                        text-decoration: none;
                    }

                    p {
                        margin: 0;
                        padding: 0;
                    }

                    table[class="wrapper"] {
                        width: 100% !important;
                        table-layout: fixed;
                        -webkit-font-smoothing: antialiased;
                        -webkit-text-size-adjust: 100%;
                        -moz-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }

                    img[class="max-width"] {
                        max-width: 100% !important;
                    }

                    @media screen and (max-width:480px) {

                        .preheader .rightColumnContent,
                        .footer .rightColumnContent {
                        text-align: left !important;
                        }

                        .preheader .rightColumnContent div,
                        .preheader .rightColumnContent span,
                        .footer .rightColumnContent div,
                        .footer .rightColumnContent span {
                        text-align: left !important;
                        }

                        .preheader .rightColumnContent,
                        .preheader .leftColumnContent {
                        font-size: 80% !important;
                        padding: 5px 0;
                        }

                        table[class="wrapper-mobile"] {
                        width: 100% !important;
                        table-layout: fixed;
                        }

                        img[class="max-width"] {
                        height: auto !important;
                        }

                        a[class="bulletproof-button"] {
                        display: block !important;
                        width: auto !important;
                        font-size: 80%;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        }

                        // 2 columns
                        #templateColumns {
                        width: 100% !important;
                        }

                        .templateColumnContainer {
                        display: block !important;
                        width: 100% !important;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        }
                    }
                </style>
                <style>
                    body, p, div {
                        font-family: arial, sans-serif;
                    }
                </style>
            </head>
            <body yahoofix="true" style="min-width: 100%; margin: 0; padding: 0; font-size: 14pxpx; 
            font-family: arial,sans-serif; color: #000000; background-color: #FFFFFF; color: #000000" 
            data-attributes="%7B%22dropped%22%3Atrue%2C%22bodybackground%22%3A%22%23FFFFFF%22%2C%22bodyfontname%22%3A%22arial%2Csans-serif%22%2C%22bodytextcolor%22%3A%22%23000000%22%2C%22bodylinkcolor%22%3A%22%231188e6%22%2C%22bodyfontsize%22%3A%2214px%22%7D">
                <center class="wrapper">
                    <div class="webkit">
                        <table class="wrapper" cellpadding="0" cellspacing="0" border="0" width="100%" 
                        bgcolor="#FFFFFF">
                            <tbody>
                                <tr>
                                    <td valign="top" bgcolor="#FFFFFF" width="100%">
                                        <table class="outer" width="100%" role="content-container" 
                                        data-attributes="%7B%22dropped%22%3Atrue%2C%22containerpadding%22%3A%220%2C0%2C0%2C0%22%2C%22containerwidth%22%3A600%2C%22containerbackground%22%3A%22%23FFFFFF%22%7D" 
                                        align="center" cellpadding="0" cellspacing="0" border="0">
                                            <tbody>
                                                <tr>
                                                    <td width="100%">
                                                        <table width="100%" cellpadding="0" cellspacing="0" 
                                                        border="0">
                                                            <tbody>
                                                                <tr>
                                                                    <td>
                                                                        <table width="100%" cellpadding="0" 
                                                                        cellspacing="0" border="0" 
                                                                        style="width: 100%; max-width:600px" 
                                                                        align="center">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td role="modules-container" style="padding: 0px 0px 0px 0px; color: #000000; text-align: left" bgcolor="#FFFFFF" width="100%" align="left">
                                                                                        <table class="module preheader preheader-hide" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0" role="module" data-type="preheader">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td role="module-content">
                                                                                                        <p></p>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                        <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed"
                                                                                        data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                                                                            <tbody>
                                    <tr>
                                      <td role="module-content" style="padding: 0px 0px 0px 0px"
                                        bgcolor="#ffffff">
                                        <table border="0" cellpadding="0" cellspacing="0" align="center"
                                          width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                          <tbody>
                                            <tr>
                                              <td bgcolor="#000000"> </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table class="module" role="module" data-type="wysiwyg" border="0" cellpadding="0"
                                  cellspacing="0" width="100%" style="table-layout: fixed"
                                  data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                  <tbody>
                                    <tr>
                                      <td role="module-content" style="padding: 0px 0px 0px 0px"
                                        bgcolor="#ffffff">
                                        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                        <meta name="viewport"
                                          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                                        <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                                        <center class="wrapper">
                                          <div class="webkit"></div>
                                        </center>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table class="wrapper" role="module" data-type="image" border="0" align="center"
                                  cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed">
                                  <tbody>
                                    <tr>
                                      <td
                                        style="font-size:6px;line-height:10px;background-color:#ffffff;padding: 0px 0px 0px 0px"
                                        valign="top" align="center" role="module-content">
                                        <!--
                                              if mso
                                              center
                                              table(width='150', border='0', cellpadding='0', cellspacing='0', style='table-layout: fixed;')
                                              tr
                                              td(width='150', valign='top')
                                              --><img class="max-width" width="150" height=""
                                           src="${path}"
                                          alt="" border="0"
                                          style="display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-width: 150px !important; width: 100% !important; height: auto !important; " />
                                        <!-- if mso-->
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                  cellspacing="0" width="100%" style="table-layout: fixed"
                                  data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A7%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                  <tbody>
                                    <tr>
                                      <td role="module-content" style="padding: 0px 0px 7px 0px"
                                        bgcolor="#ffffff"></td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table class="module" role="module" data-type="divider" border="0" cellpadding="0"
                                  cellspacing="0" width="100%" style="table-layout: fixed"
                                  data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                  <tbody>
                                    <tr>
                                      <td role="module-content" style="padding: 0px 0px 0px 0px"
                                        bgcolor="#ffffff">
                                        <table border="0" cellpadding="0" cellspacing="0" align="center"
                                          width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                          <tbody>
                                            <tr>
                                              <td bgcolor="#000000"> </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                  cellspacing="0" width="100%" style="table-layout: fixed"
                                  data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A30%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                  <tbody>
                                    <tr>
                                      <td role="module-content" style="padding: 0px 0px 30px 0px"
                                        bgcolor="#ffffff"></td>
                                    </tr>
                                  </tbody>
                                </table>
                                <table class="module" role="module" data-type="text" border="0" cellpadding="0"
                                  cellspacing="0" width="100%" style="table-layout: fixed"
                                  data-attributes="%7B%22dropped%22%3Atrue%2C%22child%22%3Afalse%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                  <tbody>
                                    <tr>
                                      <td role="module-content" valign="top" height="100%"
                                        style="padding: 0px 0px 0px 0px" bgcolor="#ffffff">
                                        <h1
                                          style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 25px; margin-bottom: 30px">
                                          Welcome to HSNC University, Student Facilitation Center
                                        </h1>
                                        <p
                                              style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                              Dear Applicant</p>
                                            <p
                                              style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                              This is to notify that we have received application for Online Verification for the student ${emailData.student_name} (${emailData.student_email}).The department will now check the Educational Details & the documents uploaded by you. </p>
                                            
                                            
                                            <p
                                              style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 15px; font-size: 15px">
                                              <strong>We are here to help you in getting the certificate.</strong>
                                            </p>

                                        <h1
                                          style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 30px; margin-bottom: 30px">
                                        </h1>Thanks & Regards,<br />Student Facilitation Centre<br />HSNC University
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  </tbody>
</table>
</div>
</center>
</body>
</html>`

return emailContext;
  },

  getAdminOtp: function(emailData){
    const emailContext = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" data-dnd="true">
            <head>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" 
                integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous" />
                  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                  <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                  <style type="text/css">
                      body {
                          color: #000000;
                      }

                      body a {
                          color: #1188e6;
                          text-decoration: none;
                      }

                      p {
                          margin: 0;
                          padding: 0;
                      }

                      table[class="wrapper"] {
                          width: 100% !important;
                          table-layout: fixed;
                          -webkit-font-smoothing: antialiased;
                          -webkit-text-size-adjust: 100%;
                          -moz-text-size-adjust: 100%;
                          -ms-text-size-adjust: 100%;
                      }

                      img[class="max-width"] {
                          max-width: 100% !important;
                      }

                      @media screen and (max-width:480px) {

                          .preheader .rightColumnContent,
                          .footer .rightColumnContent {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent div,
                          .preheader .rightColumnContent span,
                          .footer .rightColumnContent div,
                          .footer .rightColumnContent span {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent,
                          .preheader .leftColumnContent {
                          font-size: 80% !important;
                          padding: 5px 0;
                          }

                          table[class="wrapper-mobile"] {
                          width: 100% !important;
                          table-layout: fixed;
                          }

                          img[class="max-width"] {
                          height: auto !important;
                          }

                          a[class="bulletproof-button"] {
                          display: block !important;
                          width: auto !important;
                          font-size: 80%;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }

                          // 2 columns
                          #templateColumns {
                          width: 100% !important;
                          }

                          .templateColumnContainer {
                          display: block !important;
                          width: 100% !important;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }
                      }
                  </style>
                  <style>
                      body, p, div {
                          font-family: arial, sans-serif;
                      }
                  </style>
              </head>
              <body yahoofix="true" style="min-width: 100%; margin: 0; padding: 0; font-size: 14pxpx; 
              font-family: arial,sans-serif; color: #000000; background-color: #FFFFFF; color: #000000" 
              data-attributes="%7B%22dropped%22%3Atrue%2C%22bodybackground%22%3A%22%23FFFFFF%22%2C%22bodyfontname%22%3A%22arial%2Csans-serif%22%2C%22bodytextcolor%22%3A%22%23000000%22%2C%22bodylinkcolor%22%3A%22%231188e6%22%2C%22bodyfontsize%22%3A%2214px%22%7D">
                  <center class="wrapper">
                      <div class="webkit">
                          <table class="wrapper" cellpadding="0" cellspacing="0" border="0" width="100%" 
                          bgcolor="#FFFFFF">
                              <tbody>
                                  <tr>
                                      <td valign="top" bgcolor="#FFFFFF" width="100%">
                                          <table class="outer" width="100%" role="content-container" 
                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22containerpadding%22%3A%220%2C0%2C0%2C0%22%2C%22containerwidth%22%3A600%2C%22containerbackground%22%3A%22%23FFFFFF%22%7D" 
                                          align="center" cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="100%" cellpadding="0" cellspacing="0" 
                                                          border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td>
                                                                          <table width="100%" cellpadding="0" 
                                                                          cellspacing="0" border="0" 
                                                                          style="width: 100%; max-width:600px" 
                                                                          align="center">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td role="modules-container" style="padding: 0px 0px 0px 0px; color: #000000; text-align: left" bgcolor="#FFFFFF" width="100%" align="left">
                                                                                          <table class="module preheader preheader-hide" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0" role="module" data-type="preheader">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td role="module-content">
                                                                                                          <p></p>
                                                                                                      </td>
                                                                                                  </tr>
                                                                                              </tbody>
                                                                                          </table>
                                                                                          <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed"
                                                                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                                                                              <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="wysiwyg" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                          <meta name="viewport"
                                            content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                                          <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                                          <center class="wrapper">
                                            <div class="webkit"></div>
                                          </center>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="wrapper" role="module" data-type="image" border="0" align="center"
                                    cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed">
                                    <tbody>
                                      <tr>
                                        <td
                                          style="font-size:6px;line-height:10px;background-color:#ffffff;padding: 0px 0px 0px 0px"
                                          valign="top" align="center" role="module-content">
                                          <!--
                                                if mso
                                                center
                                                table(width='150', border='0', cellpadding='0', cellspacing='0', style='table-layout: fixed;')
                                                tr
                                                td(width='150', valign='top')
                                                --><img class="max-width" width="150" height=""
                                             src="${path}"
                                            alt="" border="0"
                                            style="display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-width: 150px !important; width: 100% !important; height: auto !important; " />
                                          <!-- if mso-->
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A7%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 7px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="divider" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A30%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 30px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="text" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22child%22%3Afalse%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" valign="top" height="100%"
                                          style="padding: 0px 0px 0px 0px" bgcolor="#ffffff">
                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 25px; margin-bottom: 30px">
                                            Welcome to HSNC University, Student Facilitation Center
                                          </h1>
                                          <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                Dear Applicant,</p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                ${emailData.otp} is your one time password for verifying your mobile number for HSNC University.</p>
                                              

                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 30px; margin-bottom: 30px">
                                          </h1>Thanks & Regards,<br />Student Facilitation Centre<br />HSNC University
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
    </table>
    </div>
    </center>
    </body>
      </html>`

    return emailContext;
  }, 

  sendDocuments: function(emailData){
    const emailContext = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" data-dnd="true">
            <head>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" 
                integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous" />
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                  <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                  <style type="text/css">
                      body {
                          color: #000000;
                      }

                      body a {
                          color: #1188e6;
                          text-decoration: none;
                      }

                      p {
                          margin: 0;
                          padding: 0;
                      }

                      table[class="wrapper"] {
                          width: 100% !important;
                          table-layout: fixed;
                          -webkit-font-smoothing: antialiased;
                          -webkit-text-size-adjust: 100%;
                          -moz-text-size-adjust: 100%;
                          -ms-text-size-adjust: 100%;
                      }

                      img[class="max-width"] {
                          max-width: 100% !important;
                      }

                      @media screen and (max-width:480px) {

                          .preheader .rightColumnContent,
                          .footer .rightColumnContent {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent div,
                          .preheader .rightColumnContent span,
                          .footer .rightColumnContent div,
                          .footer .rightColumnContent span {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent,
                          .preheader .leftColumnContent {
                          font-size: 80% !important;
                          padding: 5px 0;
                          }

                          table[class="wrapper-mobile"] {
                          width: 100% !important;
                          table-layout: fixed;
                          }

                          img[class="max-width"] {
                          height: auto !important;
                          }

                          a[class="bulletproof-button"] {
                          display: block !important;
                          width: auto !important;
                          font-size: 80%;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }

                          // 2 columns
                          #templateColumns {
                          width: 100% !important;
                          }

                          .templateColumnContainer {
                          display: block !important;
                          width: 100% !important;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }
                      }
                  </style>
                  <style>
                      body, p, div {
                          font-family: arial, sans-serif;
                      }
                  </style>
              </head>
              <body yahoofix="true" style="min-width: 100%; margin: 0; padding: 0; font-size: 14pxpx; 
              font-family: arial,sans-serif; color: #000000; background-color: #FFFFFF; color: #000000" 
              data-attributes="%7B%22dropped%22%3Atrue%2C%22bodybackground%22%3A%22%23FFFFFF%22%2C%22bodyfontname%22%3A%22arial%2Csans-serif%22%2C%22bodytextcolor%22%3A%22%23000000%22%2C%22bodylinkcolor%22%3A%22%231188e6%22%2C%22bodyfontsize%22%3A%2214px%22%7D">
                  <center class="wrapper">
                      <div class="webkit">
                          <table class="wrapper" cellpadding="0" cellspacing="0" border="0" width="100%" 
                          bgcolor="#FFFFFF">
                              <tbody>
                                  <tr>
                                      <td valign="top" bgcolor="#FFFFFF" width="100%">
                                          <table class="outer" width="100%" role="content-container" 
                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22containerpadding%22%3A%220%2C0%2C0%2C0%22%2C%22containerwidth%22%3A600%2C%22containerbackground%22%3A%22%23FFFFFF%22%7D" 
                                          align="center" cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="100%" cellpadding="0" cellspacing="0" 
                                                          border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td>
                                                                          <table width="100%" cellpadding="0" 
                                                                          cellspacing="0" border="0" 
                                                                          style="width: 100%; max-width:600px" 
                                                                          align="center">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td role="modules-container" style="padding: 0px 0px 0px 0px; color: #000000; text-align: left" bgcolor="#FFFFFF" width="100%" align="left">
                                                                                          <table class="module preheader preheader-hide" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0" role="module" data-type="preheader">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td role="module-content">
                                                                                                          <p></p>
                                                                                                      </td>
                                                                                                  </tr>
                                                                                              </tbody>
                                                                                          </table>
                                                                                          <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed"
                                                                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                                                                              <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="wysiwyg" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                          <meta name="viewport"
                                            content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                                          <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                                          <center class="wrapper">
                                            <div class="webkit"></div>
                                          </center>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="wrapper" role="module" data-type="image" border="0" align="center"
                                    cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed">
                                    <tbody>
                                      <tr>
                                        <td
                                          style="font-size:6px;line-height:10px;background-color:#ffffff;padding: 0px 0px 0px 0px"
                                          valign="top" align="center" role="module-content">
                                          <!--
                                                if mso
                                                center
                                                table(width='150', border='0', cellpadding='0', cellspacing='0', style='table-layout: fixed;')
                                                tr
                                                td(width='150', valign='top')
                                                --><img class="max-width" width="150" height=""
                                            src="${path}"
                                            alt="" border="0"
                                            style="display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-width: 150px !important; width: 100% !important; height: auto !important; " />
                                          <!-- if mso-->
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A7%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 7px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="divider" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A30%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 30px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="text" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22child%22%3Afalse%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" valign="top" height="100%"
                                          style="padding: 0px 0px 0px 0px" bgcolor="#ffffff">
                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 25px; margin-bottom: 30px">
                                            Welcome to HSNC University, Student Facilitation Center
                                          </h1>
                                          <p style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                Respected Sir/Madam ,</p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                We are hereby sending the <b>official verification</b> report of our student <b>${emailData.studentName}, Reference Number : ${emailData.data[0].reference_no}</b> </p>
                                              
                                              
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 15px; font-size: 15px">
                                                This report is being  sent  upon  request by the student. The verification report can be accessed by downloading the attachment below.
                                              </p>

                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 30px; margin-bottom: 30px">
                                          </h1>Sincerely,<br />Verification Department<br/>Student Facilitation Centre<br />HSNC University
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
  </div>
  </center>
  </body>
  </html>`

  return emailContext;
  },

  sendConfirmationToStudent: function(emailData){
    const emailContext = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" data-dnd="true">
            <head>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" 
                integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous" />
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                  <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                  <style type="text/css">
                      body {
                          color: #000000;
                      }

                      body a {
                          color: #1188e6;
                          text-decoration: none;
                      }

                      p {
                          margin: 0;
                          padding: 0;
                      }

                      table[class="wrapper"] {
                          width: 100% !important;
                          table-layout: fixed;
                          -webkit-font-smoothing: antialiased;
                          -webkit-text-size-adjust: 100%;
                          -moz-text-size-adjust: 100%;
                          -ms-text-size-adjust: 100%;
                      }

                      img[class="max-width"] {
                          max-width: 100% !important;
                      }

                      @media screen and (max-width:480px) {

                          .preheader .rightColumnContent,
                          .footer .rightColumnContent {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent div,
                          .preheader .rightColumnContent span,
                          .footer .rightColumnContent div,
                          .footer .rightColumnContent span {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent,
                          .preheader .leftColumnContent {
                          font-size: 80% !important;
                          padding: 5px 0;
                          }

                          table[class="wrapper-mobile"] {
                          width: 100% !important;
                          table-layout: fixed;
                          }

                          img[class="max-width"] {
                          height: auto !important;
                          }

                          a[class="bulletproof-button"] {
                          display: block !important;
                          width: auto !important;
                          font-size: 80%;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }

                          // 2 columns
                          #templateColumns {
                          width: 100% !important;
                          }

                          .templateColumnContainer {
                          display: block !important;
                          width: 100% !important;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }
                      }
                  </style>
                  <style>
                      body, p, div {
                          font-family: arial, sans-serif;
                      }
                  </style>
              </head>
              <body yahoofix="true" style="min-width: 100%; margin: 0; padding: 0; font-size: 14pxpx; 
              font-family: arial,sans-serif; color: #000000; background-color: #FFFFFF; color: #000000" 
              data-attributes="%7B%22dropped%22%3Atrue%2C%22bodybackground%22%3A%22%23FFFFFF%22%2C%22bodyfontname%22%3A%22arial%2Csans-serif%22%2C%22bodytextcolor%22%3A%22%23000000%22%2C%22bodylinkcolor%22%3A%22%231188e6%22%2C%22bodyfontsize%22%3A%2214px%22%7D">
                  <center class="wrapper">
                      <div class="webkit">
                          <table class="wrapper" cellpadding="0" cellspacing="0" border="0" width="100%" 
                          bgcolor="#FFFFFF">
                              <tbody>
                                  <tr>
                                      <td valign="top" bgcolor="#FFFFFF" width="100%">
                                          <table class="outer" width="100%" role="content-container" 
                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22containerpadding%22%3A%220%2C0%2C0%2C0%22%2C%22containerwidth%22%3A600%2C%22containerbackground%22%3A%22%23FFFFFF%22%7D" 
                                          align="center" cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="100%" cellpadding="0" cellspacing="0" 
                                                          border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td>
                                                                          <table width="100%" cellpadding="0" 
                                                                          cellspacing="0" border="0" 
                                                                          style="width: 100%; max-width:600px" 
                                                                          align="center">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td role="modules-container" style="padding: 0px 0px 0px 0px; color: #000000; text-align: left" bgcolor="#FFFFFF" width="100%" align="left">
                                                                                          <table class="module preheader preheader-hide" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0" role="module" data-type="preheader">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td role="module-content">
                                                                                                          <p></p>
                                                                                                      </td>
                                                                                                  </tr>
                                                                                              </tbody>
                                                                                          </table>
                                                                                          <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed"
                                                                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                                                                              <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="wysiwyg" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                          <meta name="viewport"
                                            content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                                          <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                                          <center class="wrapper">
                                            <div class="webkit"></div>
                                          </center>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="wrapper" role="module" data-type="image" border="0" align="center"
                                    cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed">
                                    <tbody>
                                      <tr>
                                        <td
                                          style="font-size:6px;line-height:10px;background-color:#ffffff;padding: 0px 0px 0px 0px"
                                          valign="top" align="center" role="module-content">
                                          <!--
                                                if mso
                                                center
                                                table(width='150', border='0', cellpadding='0', cellspacing='0', style='table-layout: fixed;')
                                                tr
                                                td(width='150', valign='top')
                                                --><img class="max-width" width="150" height=""
                                            src="${path}"
                                            alt="" border="0"
                                            style="display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-width: 150px !important; width: 100% !important; height: auto !important; " />
                                          <!-- if mso-->
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A7%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 7px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="divider" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A30%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 30px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="text" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22child%22%3Afalse%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" valign="top" height="100%"
                                          style="padding: 0px 0px 0px 0px" bgcolor="#ffffff">
                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 25px; margin-bottom: 30px">
                                            Welcome to HSNC University, Student Facilitation Center
                                          </h1>
                                          <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                Dear ${emailData.studentName}</p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                This is to inform you that your Verification Report has been emailed to ${emailData.data[0].email}. </p>
                                              
                                              
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 15px; font-size: 15px">
                                                 Your process with HSNC University is now complete. You can now follow up with ${emailData.data[0].institute_name}
                                              </p>

                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 15px; font-size: 15px">
                                                 All the best!!!
                                              </p>

                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 30px; margin-bottom: 30px">
                                          </h1>Thanks & Regards,<br />Student Facilitation Centre<br />HSNC University
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
    </center>
    </body>
    </html>`

    return emailContext;
  },

  sendConfirmationToAgent: function(emailData){
    const emailContext = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" 
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml" data-dnd="true">
            <head>
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css" 
                integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/" crossorigin="anonymous" />
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                  <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                  <style type="text/css">
                      body {
                          color: #000000;
                      }

                      body a {
                          color: #1188e6;
                          text-decoration: none;
                      }

                      p {
                          margin: 0;
                          padding: 0;
                      }

                      table[class="wrapper"] {
                          width: 100% !important;
                          table-layout: fixed;
                          -webkit-font-smoothing: antialiased;
                          -webkit-text-size-adjust: 100%;
                          -moz-text-size-adjust: 100%;
                          -ms-text-size-adjust: 100%;
                      }

                      img[class="max-width"] {
                          max-width: 100% !important;
                      }

                      @media screen and (max-width:480px) {

                          .preheader .rightColumnContent,
                          .footer .rightColumnContent {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent div,
                          .preheader .rightColumnContent span,
                          .footer .rightColumnContent div,
                          .footer .rightColumnContent span {
                          text-align: left !important;
                          }

                          .preheader .rightColumnContent,
                          .preheader .leftColumnContent {
                          font-size: 80% !important;
                          padding: 5px 0;
                          }

                          table[class="wrapper-mobile"] {
                          width: 100% !important;
                          table-layout: fixed;
                          }

                          img[class="max-width"] {
                          height: auto !important;
                          }

                          a[class="bulletproof-button"] {
                          display: block !important;
                          width: auto !important;
                          font-size: 80%;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }

                          // 2 columns
                          #templateColumns {
                          width: 100% !important;
                          }

                          .templateColumnContainer {
                          display: block !important;
                          width: 100% !important;
                          padding-left: 0 !important;
                          padding-right: 0 !important;
                          }
                      }
                  </style>
                  <style>
                      body, p, div {
                          font-family: arial, sans-serif;
                      }
                  </style>
              </head>
              <body yahoofix="true" style="min-width: 100%; margin: 0; padding: 0; font-size: 14pxpx; 
              font-family: arial,sans-serif; color: #000000; background-color: #FFFFFF; color: #000000" 
              data-attributes="%7B%22dropped%22%3Atrue%2C%22bodybackground%22%3A%22%23FFFFFF%22%2C%22bodyfontname%22%3A%22arial%2Csans-serif%22%2C%22bodytextcolor%22%3A%22%23000000%22%2C%22bodylinkcolor%22%3A%22%231188e6%22%2C%22bodyfontsize%22%3A%2214px%22%7D">
                  <center class="wrapper">
                      <div class="webkit">
                          <table class="wrapper" cellpadding="0" cellspacing="0" border="0" width="100%" 
                          bgcolor="#FFFFFF">
                              <tbody>
                                  <tr>
                                      <td valign="top" bgcolor="#FFFFFF" width="100%">
                                          <table class="outer" width="100%" role="content-container" 
                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22containerpadding%22%3A%220%2C0%2C0%2C0%22%2C%22containerwidth%22%3A600%2C%22containerbackground%22%3A%22%23FFFFFF%22%7D" 
                                          align="center" cellpadding="0" cellspacing="0" border="0">
                                              <tbody>
                                                  <tr>
                                                      <td width="100%">
                                                          <table width="100%" cellpadding="0" cellspacing="0" 
                                                          border="0">
                                                              <tbody>
                                                                  <tr>
                                                                      <td>
                                                                          <table width="100%" cellpadding="0" 
                                                                          cellspacing="0" border="0" 
                                                                          style="width: 100%; max-width:600px" 
                                                                          align="center">
                                                                              <tbody>
                                                                                  <tr>
                                                                                      <td role="modules-container" style="padding: 0px 0px 0px 0px; color: #000000; text-align: left" bgcolor="#FFFFFF" width="100%" align="left">
                                                                                          <table class="module preheader preheader-hide" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0" role="module" data-type="preheader">
                                                                                              <tbody>
                                                                                                  <tr>
                                                                                                      <td role="module-content">
                                                                                                          <p></p>
                                                                                                      </td>
                                                                                                  </tr>
                                                                                              </tbody>
                                                                                          </table>
                                                                                          <table class="module" role="module" data-type="divider" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed"
                                                                                          data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                                                                              <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="wysiwyg" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
                                          <meta name="viewport"
                                            content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
                                          <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
                                          <center class="wrapper">
                                            <div class="webkit"></div>
                                          </center>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="wrapper" role="module" data-type="image" border="0" align="center"
                                    cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed">
                                    <tbody>
                                      <tr>
                                        <td
                                          style="font-size:6px;line-height:10px;background-color:#ffffff;padding: 0px 0px 0px 0px"
                                          valign="top" align="center" role="module-content">
                                          <!--
                                                if mso
                                                center
                                                table(width='150', border='0', cellpadding='0', cellspacing='0', style='table-layout: fixed;')
                                                tr
                                                td(width='150', valign='top')
                                                --><img class="max-width" width="150" height=""
                                            src="${path}"
                                            alt="" border="0"
                                            style="display: block; color: #000; text-decoration: none; font-family: Helvetica, arial, sans-serif; font-size: 16px;  max-width: 150px !important; width: 100% !important; height: auto !important; " />
                                          <!-- if mso-->
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A7%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 7px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="divider" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%2C%22linecolor%22%3A%22%23000000%22%2C%22height%22%3A1%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 0px 0px"
                                          bgcolor="#ffffff">
                                          <table border="0" cellpadding="0" cellspacing="0" align="center"
                                            width="100%" height="1" style="font-size: 1px; line-height: 1px">
                                            <tbody>
                                              <tr>
                                                <td bgcolor="#000000"> </td>
                                              </tr>
                                            </tbody>
                                          </table>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="spacer" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22spacing%22%3A30%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" style="padding: 0px 0px 30px 0px"
                                          bgcolor="#ffffff"></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <table class="module" role="module" data-type="text" border="0" cellpadding="0"
                                    cellspacing="0" width="100%" style="table-layout: fixed"
                                    data-attributes="%7B%22dropped%22%3Atrue%2C%22child%22%3Afalse%2C%22padding%22%3A%220%2C0%2C0%2C0%22%2C%22containerbackground%22%3A%22%23ffffff%22%7D">
                                    <tbody>
                                      <tr>
                                        <td role="module-content" valign="top" height="100%"
                                          style="padding: 0px 0px 0px 0px" bgcolor="#ffffff">
                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 25px; margin-bottom: 30px">
                                            Welcome to HSNC University, Student Facilitation Center
                                          </h1>
                                          <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                Dear ${emailData.agentName}</p>
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 20px; font-size: 15px">
                                                This is to inform you that the Verification Report of ${emailData.studentName} (${emailData.studentEmail}) has been emailed to ${emailData.data[0].email}. </p>
                                              
                                              
                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 15px; font-size: 15px">
                                                 Your process with HSNC University is now complete. You can now follow up with ${emailData.data[0].institute_name}
                                              </p>

                                              <p
                                                style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: normal; background-color: rgb(255, 255, 255); margin-bottom: 15px; font-size: 15px">
                                                 All the best!!!
                                              </p>

                                          <h1
                                            style="color: rgb(0, 0, 0); font-family: arial, sans-serif; font-variant-ligatures: normal; font-variant-caps: normal; text-align: center; background-color: rgb(255, 255, 255); font-size: 30px; margin-bottom: 30px">
                                          </h1>Thanks & Regards,<br />Student Facilitation Centre<br />HSNC University
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
    </div>
    </center>
    </body>
    </html>`

    return emailContext;
  }
};