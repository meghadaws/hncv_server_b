const config = require('config');
const { FILE_LOCATION, NODEMODULE_LOCATION } = config.get('path');
const { serverUrl, directorName, PASSPHRASE, universityLogo} = config.get('api');
var fs = require('fs');
var moment = require('moment');
const { exec } = require('child_process');
const logger = require('../../utils/logger');
var converter = require('number-to-words');
var QRCode = require('qrcode');
const imagesToPdf = require("images-to-pdf");
const PDFDocument = require('pdfkit');
const signer = require('node-signpdf').default;
var unirest = require("unirest");
const { addSignaturePlaceholder } = require('node-signpdf/dist/helpers');

module.exports = {
    receipt_pdf : function(userId,application_id,tracking_id,order_id,amount,order_status,created_at,user_email,amount_words,callback){
        var filename = application_id + "_Verification_Payment_Challan";
        var gujartph = FILE_LOCATION+ 'public/upload/profile_pic/'+universityLogo;
        var file_Dir = FILE_LOCATION+'public/upload/documents/'+ userId;
        if (!fs.existsSync(file_Dir)){
            fs.mkdirSync(file_Dir);
        }
      
        var fonts = {
            Roboto: {
                normal: FILE_LOCATION+'public/fonts/Roboto-Regular.ttf',
                bold: FILE_LOCATION+'public/fonts//Roboto-Medium.ttf',
                italics: FILE_LOCATION+'public/fonts/Roboto-Italic.ttf',
                bolditalics: FILE_LOCATION+'public/fonts/Roboto-MediumItalic.ttf'
            }
        };
        var PdfPrinter = require(NODEMODULE_LOCATION+'node_modules/pdfmake/src/printer');
        var docDefinition = {
          content: [{
            style:{
                fontSize: 10,
                bold: false,
            } ,
            table: {
                widths: [150,200,150],
                headerRows: 1,
                body: [
                      ['',{image:gujartph,fit: [60, 60],alignment: 'center'},''],
                      //['',{text:'INTERNATIONAL CENTRE',fontSize: 9,bold:true,alignment: 'center'},''],
                      ['',{text:'HSNC UNIVERSITY',fontSize: 9,bold:true,alignment: 'center'},''],
                      ['',{text:'Online Payment Receipt - Verification',fontSize: 8,bold:true,alignment: 'center'},''],
                    ]
                  },
                  layout: 'noBorders',
                },
                {
                  style:{
                    fontSize: 10,
                    bold: false,
                  } ,
                  table: {
                    widths: [30, 200, 300],
                    headerRows: 1,
                    body: [
                      [{image: gujartph,fit: [30, 30]},{text:'',fontSize: 7,bold:true},{text:'University Copy',fontSize: 7,bold:true,margin: [210,0,0,0]}],
                      ['',{text:'HSNC UNIVERSITY',fontSize: 7,bold:true, margin: [0,-20,0,0]} ,''],
                      ['',{text:'',fontSize: 7,bold:true, margin: [0,-16,0,0]},''],
                    ]
                  },
                  layout: 'noBorders'
                },
                {
                  style:{
                    fontSize: 10,
                    bold: false,
                    /*hLineColor : 'gray',
                    vLineColor :'gray',
                    color : 'black'*/
                  } ,
                  table: {
                    widths: [200, 300],
                    headerRows: 1,
                    body: [
                      [{text:'Student\'s registered email ID',fontSize: 10,bold:true},' ' + user_email],
                      [{text:'Application No.',fontSize: 10,bold:true},' ' + application_id],
                      //[{text:'Country Name',fontSize: 10,bold:true}, ' ' ],
                      [{text:'Transaction Id',fontSize: 10,bold:true}, ' ' + tracking_id],
                      [{text:'Payment order ID',fontSize: 10,bold:true}, ' ' + order_id],
                      [{text:'Payment Date & Time',fontSize: 10,bold:true}, ' ' + created_at],
                      [{text:'Payment Amount',fontSize: 10,bold:true}, ' INR ' + amount],
                      [{text:'Payment Amount in words',fontSize: 10,bold:true}, ' ' + amount_words + ' rupees only'],
                      [{text:'Status of payment',fontSize: 10,bold:true}, ' ' + order_status]
                    ]
                  },
                  //layout: 'noBorders'
                },
                {text: '',fontSize: 10,bold:true},
                {text: '',fontSize: 10,bold:true},
                {text: '',fontSize: 10,bold:true},
                {text:' ',fontSize: 10,bold:true},
                {text:'____________________________________________________Cut Here____________________________________________________ ',fontSize: 10,bold:false},
                {text: '',fontSize: 10,bold:true},
                {text: '',fontSize: 10,bold:true},
                {
                  style:{
                    fontSize: 10,
                    bold: false,
                    // hLineColor : 'gray',
                    // vLineColor :'gray',
                    // color : 'black'
                  } ,
                  table: {
                    widths: [150,200,150],
                    headerRows: 1,
                    body: [
                      ['','',''],
                      ['','',''],
                      ['',{image: gujartph,fit: [60, 60],alignment: 'center'},''],
                      //['',{text:'INTERNATIONAL CENTRE',fontSize: 9,bold:true,alignment: 'center'},''],
                      ['',{text:'HSNC UNIVERISTY',fontSize: 9,bold:true,alignment: 'center'},''],
                      ['',{text:'Online Payment Receipt - Verification',fontSize: 8,bold:true,alignment: 'center'},''],
                    ]
                  },
                  layout: 'noBorders',
                },
                {
                  style:{
                    fontSize: 10,
                    bold: false,
                  } ,
                  table: {
                    widths: [30, 200, 300],
                    headerRows: 1,
                    body: [
                      [{image: gujartph,fit: [30, 30]},{text:'',fontSize: 7,bold:true},{text:'Student Copy',fontSize: 7,bold:true,margin: [210,0,0,0]}],
                      ['',{text:'HSNC UNIVERISTY',fontSize: 7,bold:true, margin: [0,-20,0,0]} ,''],
                      ['',{text:'',fontSize: 7,bold:true, margin: [0,-16,0,0]},''],
                    ]
                  },
                  layout: 'noBorders'
                },
                {
                  style:{
                    fontSize: 10,
                    bold: false,
                  } ,
                  table: {
                    widths: [200, 300],
                    headerRows: 1,
                    body: [
                      [{text:'Student\'s registered email ID',fontSize: 10,bold:true},' ' + user_email ],
                      [{text:'Application No.',fontSize: 10,bold:true},' ' + application_id],
                      //[{text:'Country Name',fontSize: 10,bold:true}, ' ' ],
                      [{text:'Transaction Id',fontSize: 10,bold:true}, ' ' + tracking_id],
                      [{text:'Payment order ID',fontSize: 10,bold:true}, ' ' + order_id],
                      [{text:'Payment Date & Time',fontSize: 10,bold:true}, ' ' +created_at],
                      [{text:'Payment Amount',fontSize: 10,bold:true}, ' INR ' + amount],
                      [{text:'Payment Amount in words',fontSize: 10,bold:true}, ' ' + amount_words + ' rupees only'],
                      [{text:'Status of payment',fontSize: 10,bold:true}, ' ' + order_status]
                    ]
                  },
                }
              ],
               defaultStyle: {
                 alignment: 'justify',
                 fontSize: 10
              }


          
      }


  //		var fonts = doc.fonts;
      var printer = new PdfPrinter(fonts);
      var pdfDoc = printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(fs.createWriteStream(file_Dir+'/'+filename+'.pdf'));
      pdfDoc.end();
      docDefinition=null;
      callback();
    },

    verificationCertificate : function(userId,documentDetails,documentType,institute,app_id,width,docContent,tablelayout,enrollmentNo,app_status,academicYear,count_inst,belowContent,tableHeader,callback){
        var instCountWords = converter.toWords(count_inst);
        var filename = app_id + "_" + instCountWords + "_" + documentType +  "VerificationCertificate.pdf";
        var qrcode_name = app_id + "_" + instCountWords + "_" + documentType +"VerificationCertificate_qrcode.png"
        var url = serverUrl + "upload/documents/"+userId;
       // var currentMonth = moment(new Date(enrollmentNo.application_date)).month();
       var currentMonthWords = moment(new Date()).format('MMMM');
       //var year = moment(new Date(enrollmentNo.application_date)).year();
       var year = moment(new Date()).year();
        var firstLine = 'No. HSNCU/Verification/' + currentMonthWords + '/' + enrollmentNo.enrollment_no + ' of ' + year;
        var today = moment().format('Do MMMM YYYY')
        var app_date = moment(new Date(enrollmentNo.application_date)).format('Do MMMM YYYY')
        var file_Dir = FILE_LOCATION + 'public/upload/documents/'+ userId;
        var qrcode = file_Dir+"/"+qrcode_name;
        var ref = 'Ref.: Your Application No. OFFICE/' + academicYear + '/' + enrollmentNo.application_id + ', dated ' + app_date;
        if (!fs.existsSync(file_Dir)){
            fs.mkdirSync(file_Dir);
        }

        var fonts = {
            Roboto: {
                normal: FILE_LOCATION+'public/fonts/times new roman.ttf',
                bold:FILE_LOCATION+'public/fonts/times new roman bold.ttf',
                italics: FILE_LOCATION+'public/fonts/times new roman italic.ttf',
                bolditalics: FILE_LOCATION+'public/fonts/times new roman bold italic.ttf'
            }
        };

        if(!fs.existsSync(qrcode)){
            QRCode.toFile(file_Dir+"/"+qrcode_name, url+"/"+filename, {
                color: {
                    dark: '#000000',  // Blue dots
                    light: '#FFFF' // Transparent background
                }
            }, function (err) {
                if (err) throw err

                qrcode = file_Dir+"/"+qrcode_name;
            })       
        }

        var PdfPrinter = require(NODEMODULE_LOCATION+'node_modules/pdfmake/src/printer');
        var institute_address = ''; //institute.address;
        if(institute.address!= null){
            institute_address = institute.address.filter(add=>(add.app_type == app_status));
        }else{
            institute_address = 'NA'
        }

        var docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'Portrait',
            pageMargins: [40, 140, 40, 180],
            footer: function (currentPage, pageCount) {
                return {
                    table: {
                        widths: ['*','*','*'],
                        body: [
                            [{image: qrcode,fit: [60,60],alignment:'center', margin: [-10, 0, 0, 20]}, {image: FILE_LOCATION + 'public/upload/profile_pic/HSNCU Round Stamp.png',fit: [60,60],alignment:'center', margin: [-10, 0, 0, 20]},{image: FILE_LOCATION + 'public/upload/profile_pic/Sanjay Warde Sign.png',fit: [90,90],alignment:'center',margin: [-10, 0, 0, 20]}],
                            // ['','', {text:'Director, Sanjay Warde',bold:true,alignment:'center'}],
                            [{text:'To check the authenticity of the certificate, Kindly scan the QR code',fontSize:10, alignment:'center',colSpan:2},'', ''],
                            ['',{ text: currentPage + ' of ' + pageCount, alignment: 'center', style: 'normalText'},'']
                        ]
                    },
                    layout: 'noBorders'
                };
            },
            background: [
                {
                    image: FILE_LOCATION+'public/upload/profile_pic/HSNC-Letterhead.jpg',
                    width: 600
                }
            ],
            content: [
                {

                    style:{
                    fontSize: 10,
                    bold: false,
                    lineHeight:1,
                    color : 'black'
                    } ,
                    table: {
                    widths: [400,10,180],//[30,70,230,150],
                    headerRows: 1,
                    body: [
                        [{text: firstLine,alignment:'left'},{text : ''},{text : today, alignment:'left'}],
                        ['', '', ''],
                        [{text:institute.name, alignment:'left'},'',''],
                        [{text:institute_address[0].address, alignment:'left',lineHeight:1.5},'',''],
                        
                    ]
                    },
                    layout: 'noBorders',
                },
                // {text: [
                    { text: `${ref}\n`, fontSize: 10, alignment: 'center', color: 'black' },
                    
                    { margins:[-50, 0, 0, 0] , text: 'Sub: Verification of document/s', fontSize: 10, alignment: 'center', color: 'black'},

                            // ]},                
                {text :' ',fontSize:10,bold:true, alignment :'left',lineHeight:1.5},
                {text : docContent,fontSize :10, alignment :'justify',leadingIndent: 30, lineHeight: 1},
                {text : ' ',fontSize:12,bold:true, alignment :'left',lineHeight:1.5},
                {text : tableHeader,fontSize:10,bold:true, alignment :'center',lineHeight:1.5, margins: [0, 10, 0, 0]},
                {
                    style:{
                        fontSize: 10,
                        bold: false,
                        
                    } ,
                    table: {
                        //[70,170,24,24,24,24,24],
                        widths: width,
                        headerRows: 1,
                        body: documentDetails,
                        
                    },
                    alignment:'center',
                    layout:tablelayout
                },
                {text:' ', fontSize :10, bold:true},
                {text:belowContent, fontSize :10, alignment:'justify',leadingIndent: 30},
                {text:' ', fontSize :10, bold:true,lineHeight:1.5},
                // {
                //     style:{
                //         fontSize: 12,
                //         bold: false,
                //     } ,
                //     table: {
                //         widths: [170,110,170],
                //         headerRows: 1,
                //         body: [
                //             ['',{image: FILE_LOCATION + 'public/upload/profile_pic/HSNCU Round Stamp.png',fit: [60,60],alignment:'center'},{image: FILE_LOCATION + 'public/upload/profile_pic/Sanjay Warde Sign.png',fit: [90,90],alignment:'center'}],
                //             ['','',{text: directorName,bold:true,alignment:'center'}],
                //             ['','',{text:'Director, Sanjay Warde',bold:true,alignment:'center'}],
                //         ]
                //     },
                //     layout: 'noBorders',
                // },
            ],
            defaultStyle: {
                alignment: 'justify',
                fontSize: 10
            }
        };

        var printer = new PdfPrinter(fonts);
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(file_Dir+'/'+filename));
        pdfDoc.end();
        docDefinition=null;
        callback('',filename);
    },

    verificationCertificate_notForPrint : function(userId,documentDetails,documentType,institute,app_id,width,docContent,tablelayout,enrollmentNo,app_status,academicYear,count_inst,belowContent,tableHeader,callback){
        var instCountWords = converter.toWords(count_inst);
        var filename = app_id + "_" + instCountWords + "_" + documentType +  "VerificationCertificate_noPrint.pdf";
        var qrcode_name = app_id + "_" + instCountWords + "_" + documentType +"VerificationCertificate_qrcode.png"
        var url = serverUrl + "upload/documents/"+userId;
        // var currentMonth = moment(new Date(enrollmentNo.application_date)).month();
        var currentMonthWords = moment(new Date()).format('MMMM');
        //var year = moment(new Date(enrollmentNo.application_date)).year();
        var year = moment(new Date()).year();
        var firstLine = 'No. HSNCU/Verification/' + currentMonthWords + '/' + enrollmentNo.enrollment_no + ' of ' + year;
        var today = moment().format('Do MMMM YYYY')
        var app_date = moment(new Date(enrollmentNo.application_date)).format('Do MMMM YYYY')
        var file_Dir = FILE_LOCATION + 'public/upload/documents/'+ userId;
        var qrcode = file_Dir+"/"+qrcode_name;
        var ref = 'Ref.: Your Application No. OFFICE/' + academicYear + '/' + enrollmentNo.application_id + ', dated ' + app_date; 
        
        if (!fs.existsSync(file_Dir)){
            fs.mkdirSync(file_Dir);
        }

        var fonts = {
            Roboto: {
                normal: FILE_LOCATION+'public/fonts/times new roman.ttf',
                bold:FILE_LOCATION+'public/fonts/times new roman bold.ttf',
                italics: FILE_LOCATION+'public/fonts/times new roman italic.ttf',
                bolditalics: FILE_LOCATION+'public/fonts/times new roman bold italic.ttf'
            }
        };

        if(!fs.existsSync(qrcode)){
            QRCode.toFile(file_Dir+"/"+qrcode_name, url+"/"+filename, {
                color: {
                    dark: '#000000',  // Blue dots
                    light: '#FFFF' // Transparent background
                }
            }, function (err) {
                if (err) throw err

                qrcode = file_Dir+"/"+qrcode_name;
            })       
        }

        var PdfPrinter = require(NODEMODULE_LOCATION+'node_modules/pdfmake/src/printer');
        var institute_address = '';
        if(institute.address!= null){
            {institute_address = institute.address.filter(add=>(add.app_type == app_status));}
        }else{
            institute_address = 'NA'
        }
        
        var docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'Portrait',
            pageMargins: [40, 140, 40, 180],
            footer: function (currentPage, pageCount) {
                return {
                    table: {
                        widths: ['*','*','*'],
                        body: [
                            [{image: qrcode,fit: [60,60],alignment:'center', margin: [-10, 0, 0, 20]}, {image: FILE_LOCATION + 'public/upload/profile_pic/HSNCU Round Stamp.png',fit: [60,60],alignment:'center', margin: [-10, 0, 0, 20]},{image: FILE_LOCATION + 'public/upload/profile_pic/Sanjay Warde Sign.png',fit: [90,90],alignment:'center',margin: [-10, 0, 0, 20]}],
                            // ['','', {text:'Director, Sanjay Warde',bold:true,alignment:'center'}],
                            [{text:'To check the authenticity of the certificate, Kindly scan the QR code',fontSize:10, alignment:'center',colSpan:2},'', ''],
                            ['',{ text: currentPage + ' of ' + pageCount, alignment: 'center', style: 'normalText'},'']
                        ]
                    },
                    layout: 'noBorders'
                };
            },
            background: [
                {
                    image: FILE_LOCATION+'public/upload/profile_pic/HSNC-Letterhead.jpg',
                    width: 600
                }
            ],
            content: [
                {

                    style:{
                    fontSize: 10,
                    bold: false,
                    lineHeight:1,
                    color : 'black'
                    } ,
                    table: {
                    widths: [400,10,180],//[30,70,230,150],
                    headerRows: 1,
                    body: [
                        [{text: firstLine,alignment:'left'},{text : ''},{text : today, alignment:'left'}],
                        ['', '', ''],
                        [{text:institute.name, alignment:'left'},'',''],
                        [{text:institute_address[0].address, alignment:'left',lineHeight:1.5},'',''],
                        
                    ]
                    },
                    layout: 'noBorders',
                },
                // {text: [
                    { text: `${ref}\n`, fontSize: 10, alignment: 'center', color: 'black' },
                    
                    { margins:[-50, 0, 0, 0] , text: 'Sub: Verification of document/s', fontSize: 10, alignment: 'center', color: 'black'},

                            // ]},                
                {text :' ',fontSize:10,bold:true, alignment :'left',lineHeight:1.5},
                {text : docContent,fontSize :10, alignment :'justify',leadingIndent: 30, lineHeight: 1},
                {text : ' ',fontSize:12,bold:true, alignment :'left',lineHeight:1.5},
                {text : tableHeader,fontSize:10,bold:true, alignment :'center',lineHeight:1.5, margins: [0, 10, 0, 0]},
                {
                    style:{
                        fontSize: 10,
                        bold: false,
                        
                    } ,
                    table: {
                        //[70,170,24,24,24,24,24],
                        widths: width,
                        headerRows: 1,
                        body: documentDetails,
                        
                    },
                    alignment:'center',
                    layout:tablelayout
                },
                {text:' ', fontSize :10, bold:true},
                {text:belowContent, fontSize :10, alignment:'justify',leadingIndent: 30},
                {text:' ', fontSize :10, bold:true,lineHeight:1.5},
                // {
                //     style:{
                //         fontSize: 12,
                //         bold: false,
                //     } ,
                //     table: {
                //         widths: [170,110,170],
                //         headerRows: 1,
                //         body: [
                //             ['',{image: FILE_LOCATION + 'public/upload/profile_pic/HSNCU Round Stamp.png',fit: [60,60],alignment:'center'},{image: FILE_LOCATION + 'public/upload/profile_pic/Sanjay Warde Sign.png',fit: [90,90],alignment:'center'}],
                //             ['','',{text: directorName,bold:true,alignment:'center'}],
                //             ['','',{text:'Director, Sanjay Warde',bold:true,alignment:'center'}],
                //         ]
                //     },
                //     layout: 'noBorders',
                // },
            ],
            defaultStyle: {
                alignment: 'justify',
                fontSize: 10
            }
        };

        var printer = new PdfPrinter(fonts);
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(file_Dir+'/'+filename));
        pdfDoc.end();
        docDefinition=null;
        callback('',filename);
    },

    signDocument : function(file_name, userId, app_id, filePath, outputDirectory,name,type,qrName,reference,callback){
        var qrcode_name='',qrcode = '',stamp='';
        var stamp = FILE_LOCATION + 'public/upload/profile_pic/stamp.png';
        

        var qrcode_name = app_id + "_" + name + "_" + qrName + "_qrcode.png";
        qrcode = FILE_LOCATION+"public/upload/documents/"+userId + "/" +qrcode_name;
        var f_name = app_id+ '_' + name + "_" + file_name + ".pdf";
        var url = serverUrl + "upload/documents/"+userId;
        if(!fs.existsSync(qrcode)){
            QRCode.toFile(qrcode, url+"/"+f_name, {
                color: {
                    dark: '#000000',  // Blue dots
                    light: '#FFFF' // Transparent background
                }
            }, function (err) {
                if (err) throw err

            })       
        }
        var layout = '';
        if(reference == 'false'){
            const createPdf = (params = {
                placeholder: { reason : 'Digital signed by HSNC University' },
            }) => new Promise((resolve) => {
                const pdf = new PDFDocument({
                    autoFirstPage: true,
                    size: 'A4',
                    layout: 'portrait',
                    bufferPages: true,
                    margins : { 
                        top: 72, 
                        bottom: 20,
                        left: 72,
                        right: 72
                    },
                    info: {
                        Author: 'HSNC University',
                        Subject: 'Digital Signature', 
                        CreationDate: moment.utc(Date.now()).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), 
                    }
                });
                pdf.info.CreationDate = '';
                const pdfChunks = [];
                pdf.on('data', (data) => {
                    pdfChunks.push(data);
                });
                pdf.image(filePath,0,0, {fit:[pdf.page.width,pdf.page.height - 90],
                    size: 'A4',
                    align: 'center',
                    note:'Digitally signed by HSNC University',
                }).moveDown(0.2);
                pdf.moveTo(20, pdf.page.height - 92) 
                .lineTo( pdf.page.width-20, pdf.page.height - 92) 
                .dash(10, {space: 0}) 
                .stroke() ;
                pdf.moveTo(20, pdf.page.height - 94)  
                .lineTo(pdf.page.width-20, pdf.page.height - 94)  
                .dash(10, {space: 0}) 
                .stroke() ;
                pdf.image(stamp,430,755,{width: 90,height: 90, align: 'center'});
                pdf.image(qrcode,30,755,{width: 90,height: 90, align: 'center'});
                pdf.on('end', () => {
                    resolve(Buffer.concat(pdfChunks));
                });
                const refs = addSignaturePlaceholder({
                    pdf,
                    reason: 'Approved',
                    ...params.placeholder,
                });
                Object.keys(refs).forEach(key => refs[key].end());
                pdf.end();
            });
            
            const action = async () => {
                logger.debug("action called");
                
                let pdfBuffer = await createPdf();
                let p12Buffer = fs.readFileSync(NODEMODULE_LOCATION+'HSNCU.pfx');
                var pdf = signer.sign(pdfBuffer, p12Buffer, { passphrase : PASSPHRASE, asn1StrictParsing : true });
                try{
                    var fpath = outputDirectory; //constant.FILE_LOCATION+"public/signedpdf/"+user_id+"/";
                    var fname ;
                    fname = app_id+ '_' + name + "_" + file_name + ".pdf";   
                    var fullfile = fpath+fname;
                    var file=fs.writeFileSync(fullfile,pdf);
                    callback('',fname);
                }catch(error){
                    logger.error("There is problem in generating signed pdf."+error);
                    callback("There is problem in generating signed pdf.",'');
                }
            }
            action();

        }
        else if(reference == 'true'){
            const createPdf = (params = {
                placeholder: { reason : 'Digital signed by HSNC University' },
            }) => new Promise((resolve) => {
            const pdf = new PDFDocument({
                autoFirstPage: true,
                size: 'A4',
                layout: 'portrait',
                bufferPages: true,
                margins : { 
                    top: 72, 
                    bottom: 20,
                    left: 72,
                    right: 72
                },
                info: {
                    Author: 'HSNC University',
                    Subject: 'Digital Signature', 
                    CreationDate: moment.utc(Date.now()).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), 
                }
            });
            pdf.info.CreationDate = '';
            //pdf.fillColor('#333').fontSize(25).moveDown().text(params.text);
            const pdfChunks = [];
            pdf.on('data', (data) => {
                pdfChunks.push(data);
            });
            pdf.image(filePath,0,0, {fit:[pdf.page.width,pdf.page.height - 90],
                size: 'A4',
                 align: 'center',
                // //width: 600,
                // height:pdf.page.height - 90,
                note:'Digitally signed by HSNC University',
            }).moveDown(0.2);
            pdf.moveTo(20, pdf.page.height - 92) 
            .lineTo( pdf.page.width-20, pdf.page.height - 92) 
            .dash(10, {space: 0}) 
            .stroke() ;
            pdf.moveTo(20, pdf.page.height - 94)  
            .lineTo(pdf.page.width-20, pdf.page.height - 94)  
            .dash(10, {space: 0}) 
            .stroke() ;
            //pdf.image(FILE_LOCATION+'public/upload/profile_pic/GUStamp.png',300,755,{fit: [85, 85], align: 'center'});
           // pdf.image(stamp,430,755,{width: 130,height: 80, align: 'center'});
            pdf.image(qrcode,30,755,{width: 130,height: 80, align: 'center'});
            pdf.on('end', () => {
                resolve(Buffer.concat(pdfChunks));
            });
            // const refs = addSignaturePlaceholder({
            //     pdf,
            //     reason: 'Approved',
            //     ...params.placeholder,
            // });
            // Object.keys(refs).forEach(key => refs[key].end());
            pdf.end();
        });
        
        const action = async () => {
            logger.debug("action called");
            
            let pdfBuffer = await createPdf();
           // let p12Buffer = fs.readFileSync(NODEMODULE_LOCATION+'src/HSNCU.pfx');
            //var pdf = signer.sign(pdfBuffer, p12Buffer, { passphrase : PASSPHRASE, asn1StrictParsing : true });
            try{
                
                var fpath = outputDirectory; //constant.FILE_LOCATION+"public/signedpdf/"+user_id+"/";
                var fname ;
                fname = app_id+ '_' + name + "_" + file_name + ".pdf";   
                var fullfile = fpath+fname;
                var file=fs.writeFileSync(fullfile,pdfBuffer);
                callback('',fname);
            }catch(error){
                logger.error("There is problem in generating signed pdf."+error);
                callback("There is problem in generating signed pdf.",'');
            }
        }
        action();
        }
    },

    signDocument_notForPrint : function(file_name, userId, app_id, filePath, outputDirectory,name,type,qrName,reference,callback){
        var qrcode_name='',qrcode = '',stamp='';
        var stamp = FILE_LOCATION+'public/upload/profile_pic/stamp.png';
        var layout = '';
        qrcode_name = app_id + "_" + name + "_" + qrName + "_qrcode.png";
        qrcode = FILE_LOCATION+"public/upload/documents/"+userId + "/" +qrcode_name;
        var f_name = app_id+ '_' + name + "_" + file_name + ".pdf";
        var url = serverUrl + "upload/documents/"+userId;
        if(!fs.existsSync(qrcode)){
            QRCode.toFile(qrcode, url+"/"+f_name, {
                color: {
                    dark: '#000000',  // Blue dots
                    light: '#FFFF' // Transparent background
                }
            }, function (err) {
                if (err) throw err
            })       
        }
        if(reference == 'false'){
            const createPdf = (params = {
                placeholder: { reason : 'Digital signed by HSNC University' },
            }) => new Promise((resolve) => {
                const pdf = new PDFDocument({
                    autoFirstPage: true,
                    size: 'A4',
                    layout: 'portrait',
                    bufferPages: true,
                    margins : { 
                        top: 72, 
                        bottom: 20,
                        left: 72,
                        right: 72
                    },
                    info: {
                        Author: 'HSNC University',
                        Subject: 'Digital Signature', 
                        CreationDate: moment.utc(Date.now()).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), 
                    }
                });
                pdf.info.CreationDate = '';
                //pdf.fillColor('#333').fontSize(25).moveDown().text(params.text);
                const pdfChunks = [];
                pdf.on('data', (data) => {
                    pdfChunks.push(data);
                });
                pdf.image(filePath,0,0, {fit:[pdf.page.width,pdf.page.height - 90],
                    size: 'A4',
                     align: 'center',
                    // //width: 600,
                    // height:pdf.page.height - 90,
                    note:'Digitally signed by HSNC University',
                }).moveDown(0.2);
                pdf.moveTo(20, pdf.page.height - 92) 
                .lineTo( pdf.page.width-20, pdf.page.height - 92) 
                .dash(10, {space: 0}) 
                .stroke() ;
                pdf.moveTo(20, pdf.page.height - 94)  
                .lineTo(pdf.page.width-20, pdf.page.height - 94)  
                .dash(10, {space: 0}) 
                .stroke() ;
                //pdf.image(FILE_LOCATION+'public/upload/profile_pic/GUStamp.png',300,755,{fit: [85, 85], align: 'center'});
                pdf.image(stamp,430,755,{width: 90,height: 90, align: 'center'});
                pdf.image(qrcode,30,755,{width: 90,height: 90, align: 'center'});
                pdf.on('end', () => {
                    resolve(Buffer.concat(pdfChunks));
                });
                const refs = addSignaturePlaceholder({
                    pdf,
                    reason: 'Approved',
                    ...params.placeholder,
                });
                Object.keys(refs).forEach(key => refs[key].end());
                pdf.end();
            });
            
            const action = async () => {
                logger.debug("action called");
                
                let pdfBuffer = await createPdf();
                let p12Buffer = fs.readFileSync(NODEMODULE_LOCATION+'HSNCU.pfx');
                var pdf = signer.sign(pdfBuffer, p12Buffer, { passphrase : PASSPHRASE, asn1StrictParsing : true });
                try{
                    
                    var fpath = outputDirectory; //constant.FILE_LOCATION+"public/signedpdf/"+user_id+"/";
                    var fname ;
                    fname = app_id+ '_' + name + "_" + file_name + ".pdf";   
                    var fullfile = fpath+fname;
                    var file=fs.writeFileSync(fullfile,pdf);
                    callback('',fname);
                }catch(error){
                    logger.error("There is problem in generating signed pdf."+error);
                    callback("There is problem in generating signed pdf.",'');
                }
            }
            
            action();

        }else if(reference == 'true'){
            const createPdf = (params = {
                placeholder: { reason : 'Digital signed by HSNC University' },
            }) => new Promise((resolve) => {
            const pdf = new PDFDocument({
                autoFirstPage: true,
                size: 'A4',
                layout: 'portrait',
                bufferPages: true,
                margins : { 
                    top: 72, 
                    bottom: 20,
                    left: 72,
                    right: 72
                },
                info: {
                    Author: 'HSNC University',
                    Subject: 'Digital Signature', 
                    CreationDate: moment.utc(Date.now()).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss'), 
                }
            });
            pdf.info.CreationDate = '';
            //pdf.fillColor('#333').fontSize(25).moveDown().text(params.text);
            const pdfChunks = [];
            pdf.on('data', (data) => {
                pdfChunks.push(data);
            });
            pdf.image(filePath,0,0, {fit:[pdf.page.width,pdf.page.height - 90],
                size: 'A4',
                 align: 'center',
                // //width: 600,
                // height:pdf.page.height - 90,
                note:'Digitally signed by HSNC University',
            }).moveDown(0.2);
            pdf.moveTo(20, pdf.page.height - 92) 
            .lineTo( pdf.page.width-20, pdf.page.height - 92) 
            .dash(10, {space: 0}) 
            .stroke() ;
            pdf.moveTo(20, pdf.page.height - 94)  
            .lineTo(pdf.page.width-20, pdf.page.height - 94)  
            .dash(10, {space: 0}) 
            .stroke() ;
            //pdf.image(FILE_LOCATION+'public/upload/profile_pic/GUStamp.png',300,755,{fit: [85, 85], align: 'center'});
           // pdf.image(stamp,430,755,{width: 130,height: 80, align: 'center'});
            pdf.image(qrcode,30,755,{width: 130,height: 80, align: 'center'});
            pdf.on('end', () => {
                resolve(Buffer.concat(pdfChunks));
            });
            // const refs = addSignaturePlaceholder({
            //     pdf,
            //     reason: 'Approved',
            //     ...params.placeholder,
            // });
            // Object.keys(refs).forEach(key => refs[key].end());
            pdf.end();
        });
        
        const action = async () => {
            logger.debug("action called");
            
            let pdfBuffer = await createPdf();
            try{
                
                var fpath = outputDirectory; //constant.FILE_LOCATION+"public/signedpdf/"+user_id+"/";
                var fname ;
                fname = app_id+ '_' + name + "_" + file_name + ".pdf";   
                var fullfile = fpath+fname;
                var file=fs.writeFileSync(fullfile,pdfBuffer);
                callback('',fname);
            }catch(error){
                logger.error("There is problem in generating signed pdf."+error);
                callback("There is problem in generating signed pdf.",'');
            }
        }
        action();
        }
    },

    merge : function(inputString,outputfile,callback){
        var command = "pdfunite "+inputString+ " " +outputfile;
        const pdfunite = exec(command, function (error, stdout, stderr) {
            if (error) {
              logger.error(error.stack);
              logger.error('Error code: '+error.code);
              logger.error('Signal received: '+error.signal);
            }else{
               callback();
            }
            logger.debug('Child Process STDOUT: '+stdout);
            logger.error('Child Process STDERR: '+stderr);
          });

          pdfunite.on('exit', function (code) {
            logger.debug('Child process exited with exit code '+code);
          });
    },

    pdfToImageConversion : function(fileName,user_id,filePath,outputdirectory) {
        var pdfstatus;
        if(!fs.existsSync(outputdirectory)){
            fs.mkdirSync(outputdirectory, { recursive: true });//fs.writeFileSync
        }
        var output_file = outputdirectory  + fileName;
        var command = "pdftoppm -jpeg " + filePath +  " " + output_file;
        const pdfToImg = exec(command, function (error, stdout, stderr) {
            if (error) {
                logger.error(error.stack);
                logger.error('Error code: '+error.code);
                logger.error('Signal received: '+error.signal);
            }else{
            }
            logger.debug('Child Process STDOUT: '+stdout);
            logger.error('Child Process STDERR: '+stderr);
        });
        pdfToImg.on('exit', function (code) {
            logger.debug('Child process exited with exit code '+code);
        });
    },
    // applicationForm : function(marksheet,degree,file,userId,noMarksheet,noDegree,nosealedCover,app_id,secondyear,getorder,statuspayment,callback){
    //             var userId=userId;
    //             filename = app_id+"_ApplicationForm";
    //             var markshhetArray =[];
    //             var duration = converter.toWords(getorder[0]['amount']);
    //             var PaymentTime = moment(new Date(getorder[0].created_at)).format("DD-MM-YYYY hh:mm")      
    //               var file_Dir = FILE_LOCATION + '/public/upload/documents/'+ userId+'/';
    //             // var gujartph=FILE_LOCATION+ 'public/upload/profile_pic/gujaratUniversityLogo.png';
    //             var gujartph=FILE_LOCATION+ 'public/upload/profile_pic/' + universityLogo;
    //             var date = moment().format('DD-MM-YYYY hh:mm:ss');
    //             // var file_Dir = constants.FILE_LOCATION+'public/certificate/'+user_id;
    //             // currentDateTime = moment(new Date()).format("DD/MM/YYYY");
    //             var fonts = {
    //                 Roboto: {
    //                     normal:FILE_LOCATION+'public/fonts/Roboto-Regular.ttf',
    //                     bold: FILE_LOCATION+'public/fonts/Roboto-Medium.ttf',
    //                     italics:FILE_LOCATION+'public/fonts/Roboto-Italic.ttf',
    //                     bolditalics: FILE_LOCATION+'public/fonts/Roboto-MediumItalic.ttf',
                       
    //                   }
    //             };
        
            
    //             var PdfPrinter = require(FILE_LOCATION+'node_modules/pdfmake/src/printer');
            
        
        
    //         var col1=[];
    //         var col2=[];
    //         var doc2 = file;
        
        
    //      var docDefinition = {
    //                 pageSize: 'A4',
    //                 content: [
    //                     {text:"Application No :"+app_id,alignment:'right'},
    //                     {
    //                         table: {
    //                             widths: [500],
    //                             // headerRows: 1,
    //                             body:[
                                    
    //                                 [
    //                                     {
    //                                         style:{
    //                                             fontSize: 10,
    //                                         },
    //                                         table: {
    //                                             widths: [50,360,'*'],
    //                                             body: [
    //                                                 [{rowSpan:2,image: gujartph,fit: [50, 50],border: [false, false, false, false],alignment:'center'},{text:'HSNC UNIVERSITY',alignment:'left',bold:true,fontSize:18,border: [false, false, false, false]},{text:'',border: [false, false, false, false]}],
    //                                                 [{text:'',border: [false, false, false, false]},{text:'Application Form for Marksheet/Transcript/Degree Verification',border: [false, false, false, false]},{text:'',alignment:'right',border: [false, false, false, false]}],
    //                                                 [{border: [false,false, false, true],text:''},{text:noMarksheet+noDegree,border: [false, false, true]},{text:'',border: [false, false, true]}]
    //                                             ]
                                            
    //                                         },
                                            
    //                                         layout: {
    //                                             defaultBorder: true,
    //                                         }
    //                                     }
    //                                 ],
                                    
                                   
    //                             ]
    //                         },
        
    //                         layout: 'noBorders',
    //                     },
    //                     [
    //                         {
    //                             style:{
    //                                 fontSize: 12,
    //                             },
    //                             table: {
    //                                 widths: [150,'*'],
    //                                 // headerRows: 1,
    //                                 body: [
    //                                     [{text: 'Payment Details', border: [false, true, false, true],colSpan: 2,alignment:'left',bold:true}, {}],
    //                                     ['Payment Status', ':'+statuspayment],
    //                                     ['Payment Time', ':'+PaymentTime],
    //                                     ['Payment Amount', ': INR '+getorder[0].amount],
    //                                     ['Payment Amount in words', ': '+duration+' rupess only'],
    //                                 ]
    //                             },
    //                             layout: {
    //                                 defaultBorder: false,
    //                             }
    //                         }
    //                        ],
    //                     {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 1 }]},
    //                     {text:'\nUploaded Documents List\n',bold:true,fontSize:10},
    //                     {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 1 }]},
    //                     ['\n'],
    //                     [{ text: 'Sr.No.                       Document Name'}],
    //                     file,
                        
                       
                        
    //                     [{text:' ',fontSize:10},{}],
    //                     [{border: [false, false, false, true],text:'',fontSize:11},{border: [false, false, false, true],text:'',fontSize:11}],
    //                     [{text:'Print Date: '+date,fontSize:10},{}],
        
        
                      
    //                 ],
        
        
    //                 styles: {
    //                     header: {
    //                         fontSize: 18,
    //                         bold: true
    //                     },
    //                     bigger: {
    //                         fontSize: 15,
    //                         italics: true
    //                     }
    //                 },
    //                 defaultStyle: {
    //                     alignment: 'justify',
    //                     fontSize: 10,
    //                     color:"black",
    //                     columnGap: 20
    //                 }
    //             };
    //             if(marksheet.personalDetails != '' && marksheet.eduDetails != ''){
    //                var mark_personal = [
    //                     {
    //                         style:{
    //                             fontSize: 10,
    //                         },
    //                         table: {
    //                             widths: [150,'*'],
                                
    //                              body: marksheet.personalDetails
    //                         },
    //                         layout: {
    //                             defaultBorder: false,
    //                         }
    //                     }
    //                 ];
    //                docDefinition.content[1].table.body.push(mark_personal);
    //                 var mark_educational = [
    //                     {
    //                         style:{
    //                             fontSize: 10,
    //                         },
    //                         table: {
    //                             widths: [150,'*'],
                                
    //                              body: marksheet.eduDetails
    //                         },
    //                         layout: {
    //                             defaultBorder: false,
    //                         }
    //                     }
    //                 ]
    //                 docDefinition.content[1].table.body.push(mark_educational);
    //             };
    //             if(degree.personalDetails != '' && degree.eduDetails != 0){
    //                 var degree_personal = [
    //                      {
    //                          style:{
    //                              fontSize: 10,
    //                          },
    //                          table: {
    //                              widths: [150,'*'],
                                
    //                              body: degree.personalDetails
    //                          },
    //                          layout: {
    //                              defaultBorder: false,
    //                          }
    //                      }
    //                  ];
    //                 docDefinition.content[1].table.body.push(degree_personal);
    //                  var degree_educational = [
    //                      {
    //                          style:{
    //                              fontSize: 10,
    //                          },
    //                          table: {
    //                              widths: [150,'*'],
                                 
    //                               body: degree.eduDetails
    //                          },
    //                          layout: {
    //                              defaultBorder: false,
    //                          }
    //                      }
    //                  ]
    //                  docDefinition.content[1].table.body.push(degree_educational);
    //              };
    //         //      if(transcript.personalDetails != '' && transcript.eduDetails != 0){
    //         //      var transcript_personal = [
    //         //           {
    //         //               style:{
    //         //                   fontSize: 10,
    //         //               },
    //         //               table: {
    //         //                   widths: [150,'*'],
                              
    //         //                   body: transcript.personalDetails
    //         //               },
    //         //               layout: {
    //         //                   defaultBorder: false,
    //         //               }
    //         //           }
    //         //       ];
    //         //      docDefinition.content[1].table.body.push(transcript_personal);
    //         //       var transcript_educational = [
    //         //           {
    //         //               style:{
    //         //                   fontSize: 10,
    //         //               },
    //         //               table: {
    //         //                   widths: [150,'*'],
                            
    //         //                    body: transcript.eduDetails
    //         //               },
    //         //               layout: {
    //         //                   defaultBorder: false,
    //         //               }
    //         //           }
    //         //       ]
    //         //       docDefinition.content[1].table.body.push(transcript_educational);
    //         //   };
    //         //   if(secondyear.personalDetails != '' && transcript.eduDetails != 0){
    //         //     var secondyear_personal = [
    //         //          {
    //         //              style:{
    //         //                  fontSize: 10,
    //         //              },
    //         //              table: {
    //         //                  widths: [150,'*'],
                             
    //         //                  body: secondyear.personalDetails
    //         //              },
    //         //              layout: {
    //         //                  defaultBorder: false,
    //         //              }
    //         //          }
    //         //      ];
    //         //     docDefinition.content[1].table.body.push(secondyear_personal);
    //         //      var secondyear_educational = [
    //         //          {
    //         //              style:{
    //         //                  fontSize: 10,
    //         //              },
    //         //              table: {
    //         //                  widths: [150,'*'],
                           
    //         //                   body: secondyear.eduDetails
    //         //              },
    //         //              layout: {
    //         //                  defaultBorder: false,
    //         //              }
    //         //          }
    //         //      ]
    //         //      docDefinition.content[1].table.body.push(secondyear_educational);
    //         //  };
        
    //             var printer = new PdfPrinter(fonts);
    //             var pdfDoc = printer.createPdfKitDocument(docDefinition);
    //             pdfDoc.pipe(fs.createWriteStream(file_Dir+'/'+filename+'.pdf'));
    //             pdfDoc.end();
    //             docDefinition=null;
    //            callback();
         
    //         },

    

    applicationForm : function(marksheet,degree,file,userId,noMarksheet,noDegree,nosealedCover,app_id,getorder,statuspayment,personalDetails,callback){
        var userId=userId;
        filename = app_id+"_ApplicationForm";
        var markshhetArray =[];
        var duration = converter.toWords(getorder[0]['amount']);
        var PaymentTime = moment(new Date(getorder[0]['created_at'])).format("DD-MM-YYYY hh:mm")      
        var file_Dir = FILE_LOCATION + '/public/upload/documents/'+ userId+'/';
        var gujartph=FILE_LOCATION+ 'public/upload/profile_pic/' + universityLogo;
        var date = moment().format('DD-MM-YYYY hh:mm:ss');
        // var file_Dir = constants.FILE_LOCATION+'public/certificate/'+user_id;
        // currentDateTime = moment(new Date()).format("DD/MM/YYYY");
        var fonts = {
            Roboto: {
                normal:FILE_LOCATION+'public/fonts/Roboto-Regular.ttf',
                bold: FILE_LOCATION+'public/fonts/Roboto-Medium.ttf',
                italics:FILE_LOCATION+'public/fonts/Roboto-Italic.ttf',
                bolditalics: FILE_LOCATION+'public/fonts/Roboto-MediumItalic.ttf',
               
              }
        };

    
        var PdfPrinter = require(NODEMODULE_LOCATION+'node_modules/pdfmake/src/printer');
    


    var col1=[];
    var col2=[];
    //var doc2 = file;


    var docDefinition = {
            pageSize: 'A4',
            content: [
                {text:"Application No :"+app_id,alignment:'right'},
                {
                    table: {
                        widths: [500],
                        // headerRows: 1,
                        body:[
                            
                            [
                                {
                                    style:{
                                        fontSize: 12,
                                    },
                                    table: {
                                        widths: [50,360,'*'],
                                        body: [
                                            [{rowSpan:2,image: gujartph,fit: [50, 50],border: [false, false, false, false],alignment:'center'},{text:'HSNC UNIVERSITY',alignment:'left',bold:true,fontSize:18,border: [false, false, false, false]},{text:'',border: [false, false, false, false]}],
                                            [{text:'',border: [false, false, false, false]},{text:'Application Form for ' + noMarksheet + noDegree, border: [false, false, false, false]},{text:'',alignment:'right',border: [false, false, false, false]}],
                                           
                                        ]
                                    
                                    },
                                    
                                    layout: {
                                        defaultBorder: true,
                                    }
                                }
                            ],
                            
                           
                        ]
                    },

                    layout: 'noBorders',
                },
                 {
                    table: {
                        widths: [250,250],
                        // headerRows: 1,
                        body: personalDetails
                            
                    },

                    layout: {
                        defaultBorder: false,
                    }
                },
                {
                    table: {
                        widths: [250,250],
                        // headerRows: 1,
                        body: marksheet
                            
                    },

                    layout: {
                        defaultBorder: false,
                    }
                },
                {
                    table: {
                        widths: [250,250],
                        // headerRows: 1,
                        body: degree
                            
                    },

                    layout: {
                        defaultBorder: false,
                    }
                },
                {
                    style:{
                        fontSize: 12,
                    },
                    table: {
                        widths: [150,'*'],
                        // headerRows: 1,
                        body: [
                            [{text: 'Payment Details', border: [false, true, false, true],colSpan: 2,alignment:'left',bold:true}, {}],
                            ['Payment Status', ':'+statuspayment],
                            ['Payment Time', ':'+PaymentTime],
                            ['Payment Amount', ': INR '+getorder[0]['amount']],
                            ['Payment Amount in words', ': '+duration+' rupess only'],
                        ]
                    },
                        layout: {
                            defaultBorder: false,
                        }
                    },
                
                //{canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 1 }]},
                // {text:'\nUploaded Documents List\n',bold:true,fontSize:10},
                // {canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595-2*40, y2: 5, lineWidth: 1 }]},
                // ['\n'],
                // [{ text: 'Sr.No.                       Document Name'}],
                // file,
                
               
                
                [{text:' ',fontSize:12},{}],
                [{border: [false, false, false, true],text:'',fontSize:12},{border: [false, false, false, true],text:'',fontSize:12}],
                [{text:'Print Date: '+date,fontSize:12},{}],


              
            ],


            styles: {
                header: {
                    fontSize: 18,
                    bold: true
                },
                bigger: {
                    fontSize: 15,
                    italics: true
                }
            },
            defaultStyle: {
                alignment: 'justify',
                fontSize: 12,
                color:"black",
                columnGap: 20
            }
        };
     
        var printer = new PdfPrinter(fonts);
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(file_Dir+'/'+filename+'.pdf'));
        pdfDoc.end();
        docDefinition=null;
       callback();
    },

    generateQRCode : function(userId,documentType,instituteName,app_id,callback){
        var filename = app_id +"_" + instituteName +  "_" + documentType + "VerificationCertificate.pdf";
        var qrcode_name = app_id +"_" + instituteName +  "_" + documentType +"VerificationCertificate_qrcode.png"
        var qrcode;
         var file_Dir = FILE_LOCATION + '/public/upload/documents/'+ userId;
        var url = serverUrl + "upload/transcript/"+userId;
        if (!fs.existsSync(file_Dir)){
            fs.mkdirSync(file_Dir);
        }

        if(!fs.existsSync(file_Dir+"/"+qrcode_name)){
            QRCode.toFile(file_Dir+"/"+qrcode_name, url+"/"+filename, {
                color: {
                    dark: '#000000',  // Blue dots
                    light: '#FFFF' // Transparent background
                }
            }, function (err) {
                if (err) throw err

                qrcode = file_Dir+"/"+qrcode_name;
            })       
        }
    },

    generateAddress : function(userId, institute,app_id,section,callback){
        var filename = app_id +"_" + institute.name +  "_" + "address.pdf";
        var file_Dir = FILE_LOCATION + 'public/upload/documents/'+ userId;
        var A1 = (section=='A1') ? 'black' : 'white';
		var B1 = (section=='B1') ? 'black' : 'white';

        if (!fs.existsSync(file_Dir)){
            fs.mkdirSync(file_Dir);
        }

        var fonts = {
            Roboto: {
                normal: FILE_LOCATION+'public/fonts/Roboto-Regular.ttf',
                bold:FILE_LOCATION+'public/fonts/Roboto-Medium.ttf',
                italics: FILE_LOCATION+'public/fonts/Roboto-Italic.ttf',
                bolditalics: FILE_LOCATION+'public/fonts/Roboto-MediumItalic.ttf'
            },
            TimesNewRoman: {
				normal: FILE_LOCATION+'public/fonts/pdf_fonts/times new roman.ttf',
				bold: FILE_LOCATION+'public/fonts/pdf_fonts/times new roman bold.ttf',
				italics: FILE_LOCATION+'public/fonts/pdf_fonts/times new roman italic.ttf',
				bolditalics: FILE_LOCATION+'public/fonts/pdf_fonts/times new roman bold italic.ttf'
			},
            
        };

        var PdfPrinter = require(NODEMODULE_LOCATION+'node_modules/pdfmake/src/printer');

        var docDefinition = {
            pageSize: 'A4',
            //pageOrientation: 'landscape',
            content: [
                {
                    table: {
                        widths: [500],
                        headerRows: 1,
                        body:[
                            ['\n\n\n\n\n\n'],
                            [
                                {
                                    style:{
                                        fontSize: 10,
                                    },
                                    table: {
                                        widths: [100,200,100],
                                        headerRows: 1,
                                        body: [
                                            ['',{text:''+institute.name, fontSize: 28, bold:true, alignment:'left',color : A1, colSpan:2 , font : 'TimesNewRoman'},''],
                                            ['',{text:''+institute.address,fontSize: 20 , bold:true, alignment:'left',color : A1, colSpan:2 , font : 'TimesNewRoman'},''],
                                            ['',{text:'',fontSize: 15, alignment:'left',color : A1, colSpan:2},''],
                                        ]
                                    },
                                    layout: 'noBorders',
                                }
                            ],
                            ['\n\n\n\n\n\n\n'],
                            [{
                                style:{
                                    fontSize: 10,
                                },
                                table: {
                                    widths: [100,200,100],
                                    headerRows: 1,
                                    body: [
                                        ['',{text:''+institute.name, fontSize: 28, bold:true, alignment:'left',color : B1, colSpan:2},''],
                                        ['',{text:''+institute.address,fontSize: 20 , bold:true, alignment:'left',color : B1, colSpan:2},''],
                                        ['',{text:'',fontSize: 15, alignment:'left',color : B1, colSpan:2},''],
                                    ]
                                },
                                layout: 'noBorders',
                            }],
                        ]
                    },
                    layout: 'noBorders',
                },
            ],
            defaultStyle: {
                alignment: 'justify',
                fontSize: 10,
                color:"black"
            }
        };
        var printer = new PdfPrinter(fonts);
        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(file_Dir+'/'+filename));
        pdfDoc.end();
        docDefinition=null;
        callback('',filename);
    },



}
