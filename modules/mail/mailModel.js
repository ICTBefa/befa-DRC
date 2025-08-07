const { response } = require("express");
const { data } = require("jquery");
const db = require("../../config/database");
// var nodeoutlook = require('./send_email.js');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const SendmailTransport = require("nodemailer/lib/sendmail-transport");

class mailModel {
    //format string to email message
    formatStringEmail(str) {
        var find = '/';
        var re = new RegExp(find, 'g');
        str = str.replace(re, '%2F');
        return str;
    }

    //get pica overall details here
    getMailEpicaMaster(pica_id,callback) {
        var sql = "SELECT pm.id, pm.no_pica, pm.department_id, d.kode_department, d.nama_department, \
        DATE_FORMAT(pm.tanggal_buka, '%d %M %Y') AS tanggal_buka, \
        DATE_FORMAT(pm.tanggal_tutup, '%d %M %Y') AS tanggal_tutup, \
        p.alias_permasalahan, pm.pica_reference_id, pm.alasan_tolak_revisi, pm.persetujuan_text, \
        pm.persetujuan_id, pm.pelaksana_user_id, pm.pengusul_user_id, p.input_text, \
        pelaksana.username AS pelaksana_username, pelaksana.fullname AS pelaksana_fullname, \
        pengusul.username AS pengusul_username, pengusul.fullname AS pengusul_fullname, \
        pelaksana.email AS pelaksana_email, pengusul.email AS pengusul_email, \
        pm.deskripsi_masalah, pm.akar_masalah, pm.pica_status_id, ps.status_name \
        FROM pica_master pm \
        JOIN department d ON pm.department_id = d.id \
        JOIN pica_status ps ON pm.pica_status_id = ps.id \
        LEFT JOIN user pelaksana ON pm.pelaksana_user_id = pelaksana.id \
        LEFT JOIN user pengusul ON pm.pengusul_user_id = pengusul.id \
        JOIN persetujuan p ON pm.persetujuan_id = p.id \
        WHERE pm.id= " + pica_id;

        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    //get pica tindakan and PIC email here
    getMailEpicaDetails(pica_id,callback) {
        var sql = "SELECT pd.id, pd.pica_master_id, pd.urutan_tindakan, pd.pic_user_id, \
        u.username AS pic_username, u.fullname AS pic_fullname, u.email AS pic_email, \
		pd.tindakan_koreksi, DATE_FORMAT(pd.batas_waktu, '%d %M %Y') AS batas_waktu \
        FROM pica_details pd \
        LEFT JOIN user u ON pd.pic_user_id = u.id \
        JOIN pica_master pm ON pd.pica_master_id = pm.id \
        WHERE pm.id= " + pica_id;
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    //get pica details and pica verifier here
    getMailEpicaVerifikasi(pica_id,callback) {
        var sql = "SELECT pv.id, pv.pica_master_id, pv.verifikasi_no, \
        DATE_FORMAT(pv.tanggal_rencana, '%d %M %Y') AS tanggal_rencana, \
        DATE_FORMAT(pv.tanggal_actual, '%d %M %Y') AS tanggal_actual, \
        pv.verified_by_user_id, u.username AS verifier_username, \
		u.fullname AS verifier_fullname, u.email AS verifier_email, \
		pv.catatan, pv.status_verifikasi \
        FROM pica_verifikasi pv \
        LEFT JOIN user u ON pv.verified_by_user_id = u.id \
        JOIN pica_master pm ON pv.pica_master_id = pm.id \
        WHERE pm.id = " + pica_id;
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }
    
    //get persetujuan email here
    getMailPersetujuanEmailTo(data,callback){
        let sql = "SELECT DISTINCT u.email, pm.user_id, u.nik, u.fullname \
        FROM persetujuan_members pm \
        JOIN user u ON pm.user_id = u.id \
        WHERE pm.active = 1 AND persetujuan_id = " + data.persetujuan_id;
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    //get department head pic or auditor here -> for roles use 1 | 1,2 | 1,2,3 | etc
    getMailDepartmentEmailTo(data,callback){
        let sql = "SELECT DISTINCT dm.department_roles_id, dm.user_id, \
        u.username, u.fullname, u.email, u.nik \
        FROM department_members dm \
        JOIN user u ON u.id = dm.user_id \
        WHERE dm.active = 1 \
        AND dm.department_id = "+ data.department_id + " \
        AND dm.department_roles_id IN (" + data.roles + ") ";
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    getEmailSentTo(data,callback) {
        this.getMailDepartmentEmailTo(data,(resultDept,code) => {
            this.getMailPersetujuanEmailTo(data,(resultPers,code) => {
                /*
                //old method if still want a duplicate
                let mail_to = "";
                for(let i=0;i<resultDept.length;i++) {
                    mail_to += resultDept[i].email + ",";
                }
                for(let i=0;i<resultPers.length;i++) {
                    mail_to += resultPers[i].email + ",";
                }
                mail_to = mail_to.slice(0, -1);
                */
                let mail_to = "";
                let mail_arr = [];
                let mail_arr_unique = [];
                for(let i=0;i<resultDept.length;i++) {
                    mail_arr.push(resultDept[i].email);
                }
                for(let i=0;i<resultPers.length;i++) {
                    mail_arr.push(resultPers[i].email);
                }

                //trimming duplicates
                mail_arr_unique = mail_arr.filter(function(elem, pos) {
                    return mail_arr.indexOf(elem) == pos;
                })

                for(let i=0;i<mail_arr_unique.length;i++) {
                    mail_to += mail_arr_unique[i] + ",";
                }

                let sendCC = process.env.SEND_EMAIL_CC;
                if (sendCC == 1) {
                    mail_to += process.env.SEND_EMAIL_ADDRESS_CC;
                } else {
                    mail_to = mail_to.slice(0, -1);
                }
                
                callback(mail_to);
            })
        })
    }
    
    //only this one have a bit of different format since no pica number
    sendMailAskPersetujuan(data,callback) {
        var dataEmail = {
            department_id : data.dept_id,
            roles : "3",
            persetujuan_id : data.persetujuan_id
        }
        this.getEmailSentTo(dataEmail,(mail_to) => {
            console.log("Mail Ask Persetujuan Sent to " + mail_to);
            
            let sendMail = process.env.SEND_REAL_MAIL;
            if (sendMail == 1) {
                nodeoutlook.sendEmail({
                    auth: {
                        user: process.env.OUTLOOK_MAIL_USERNAME,
                        pass: process.env.OUTLOOK_MAIL_PASSWORD
                    },
                    from: process.env.OUTLOOK_MAIL_FROM,
                    to: mail_to,
                    subject: 'PICA Menunggu Persetujuan',
                    html: 
                    '<p>Dear Group Persetujuan, pica baru telah dibuat dan sedang menunggu persetujuan<p>\
                    <div class="card border border-dark">\
                        <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                            <td>\
                                <p style="text-align:center; font-size:150%;">Pica baru telah dibuat dan sedang menunggu persetujuan</p>\
                                <p>Deskripsi Masalah : '+data.deskripsi_masalah+'</p>\
                                <p>Tgl PICA dibuat : '+new Date()+'</p>\
                                <p>Dibuat Oleh : '+data.pengusul_text_be+'</p>\
                            </td>\
                        </table>\
                        <a href="'+process.env.PATH_DESTINATION+'/epicaVerifikasi">Go to Verifikasi EPICA</a> (hanya untuk grup persetujuan)\
                    </div>',
                    
                    onError: (e) => {
                        console.log(e);
                         
                    },
                    onSuccess: (i) => {
                        console.log(i);
                        callback(1);
                    }
                });
            }
        })
    }

        //asking another persetujuan after pica is revised by auditor
        sendMailReAskPersetujuan(pica_id,callback) {
            this.getMailEpicaMaster(pica_id,(result,code) => {
                var dataEmail = {
                    department_id : result[0].department_id,
                    roles : "3",
                    persetujuan_id : result[0].persetujuan_id
                }
                this.getEmailSentTo(dataEmail,(mail_to) => {
                    console.log("Mail Re-Ask Persetujuan Sent to " + mail_to);
                    
                    let sendMail = process.env.SEND_REAL_MAIL;
                    if (sendMail == 1) {
                        nodeoutlook.sendEmail({
                            auth: {
                                user: process.env.OUTLOOK_MAIL_USERNAME,
                                pass: process.env.OUTLOOK_MAIL_PASSWORD
                            },
                            from: process.env.OUTLOOK_MAIL_FROM,
                            to: mail_to,
                            subject: 'PICA Menunggu Persetujuan',
                            html: 
                            '<p>Dear Group Persetujuan, pica telah direvisi dan sedang menunggu persetujuan<p>\
                            <div class="card border border-dark">\
                                <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                    <td>\
                                        <p style="text-align:center; font-size:150%;">Pica baru telah dibuat dan sedang menunggu persetujuan</p>\
                                        <p>Deskripsi Masalah : '+result[0].deskripsi_masalah+'</p>\
                                        <p>Tgl PICA dibuat : '+new Date()+'</p>\
                                        <p>Dibuat Oleh : '+result[0].pengusul_fullname+'</p>\
                                    </td>\
                                </table>\
                                <a href="'+process.env.PATH_DESTINATION+'/epicaVerifikasi">Go to Verifikasi EPICA</a> (hanya untuk grup persetujuan)\
                            </div>\
                            ',
                            onError: (e) => {
                                console.log(e);
                                 
                            },
                            onSuccess: (i) => {
                                console.log(i);
                                callback(1);
                            }
                        });
                    }
                })
            })
        }

    sendMailPersetujuanApproved(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "1,2,3",
                persetujuan_id : result[0].persetujuan_id
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Persetujuan Approved Sent to " + mail_to);
                let sendMail = process.env.SEND_REAL_MAIL;
                if (sendMail == 1)
                nodeoutlook.sendEmail({
                    auth: {
                        user: process.env.OUTLOOK_MAIL_USERNAME,
                        pass: process.env.OUTLOOK_MAIL_PASSWORD
                    },
                    from: process.env.OUTLOOK_MAIL_FROM,
                    to: mail_to,
                    subject: 'PICA Telah Disetujui',
                    html: 
                    '<p>Dear Head & PIC, pica sudah disetujui oleh group persetujuan<p>\
                    <div class="card border border-dark">\
                        <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                            <td>\
                                <p style="text-align:center; font-size:200%;">PICA Sudah Disetujui</p>\
                                <p style="text-align:center; font-size:150%;">Epica No ' + result[0].no_pica + ' <span style="color:green;"> Telah Disetujui </span> </p>\
                                <p>Silakan dilanjutkan pengisian oleh pic/dept head</p>\
                                <p>Deskripsi Masalah : '+ result[0].deskripsi_masalah +'</p>\
                                <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                            </td>\
                        </table>\
                        <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                    </div>\
                    ',
                    
                    onError: (e) => {
                        console.log(e);
                         
                    },
                    onSuccess: (i) => {
                        console.log(i);
                        callback(1);
                    }
                });
            })
        })    
    }

    sendMailPersetujuanRejected(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "1,2,3",
                persetujuan_id : result[0].persetujuan_id
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Persetujuan Rejected Sent to " + mail_to);

                let sendMail = process.env.SEND_REAL_MAIL;
                if (sendMail == 1)
                nodeoutlook.sendEmail({
                    auth: {
                        user: process.env.OUTLOOK_MAIL_USERNAME,
                        pass: process.env.OUTLOOK_MAIL_PASSWORD
                    },
                    from: process.env.OUTLOOK_MAIL_FROM,
                    to: mail_to,
                    subject: 'PICA Tidak Disetujui',
                    html: 
                    '<p>Dear Auditor, pica tidak disetujui oleh group persetujuan, harap melakukan revisi pica </p>\
                    <div class="card border border-dark">\
                        <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                            <td>\
                                <p style="text-align:center; font-size:200%;">Pica Tidak Disetujui</p>\
                                <p style="text-align:center; font-size:100%;">Epica <span style="color:red;"> Tidak Disetujui </span> oleh Tim Persetujuan</p>\
                                <p>Alasan Revisi :'+ result[0].alasan_tolak_revisi +' </p>\
                                <br/> \
                                <p>Deskripsi Masalah : '+ result[0].deskripsi_masalah +'</p>\
                                <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                            </td>\
                            </table>\
                            <a href="'+process.env.PATH_DESTINATION+'/epicaStatusSeven/'+pica_id+'">Go to EPICA</a>\
                    </div>',
                    
                    onError: (e) => {
                        console.log(e);
                         
                    },
                    onSuccess: (i) => {
                        console.log(i);
                        callback(1);
                    }
            
                })
            })
        });
    }

    sendMailRevisiPICA(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "2,3",
                persetujuan_id : result[0].persetujuan_id
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Revision From Head Sent to " + mail_to);
                
                let sendMail = process.env.SEND_REAL_MAIL;
                if (sendMail == 1)
                nodeoutlook.sendEmail({
                    auth: {
                        user: process.env.OUTLOOK_MAIL_USERNAME,
                        pass: process.env.OUTLOOK_MAIL_PASSWORD
                    },
                    from: process.env.OUTLOOK_MAIL_FROM,
                    to: mail_to,
                    subject: 'PICA Revisi Head',
                    html: 
                    '<p>Dear All, head melakukan revisi terhadap pica </p>\
                    <div class="card border border-dark">\
                        <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                            <td>\
                                <p style="text-align:center; font-size:200%;">Pica ada Revisi dari Head</p>\
                                <p style="text-align:center; font-size:150%;">Epica No ' + result[0].no_pica + ' <span style="color:red;"> Ada Revisi </p>\
                                <p>Alasan revisi :'+ result[0].alasan_tolak_revisi +' </p>\
                                <br/> \
                                <p>Deskripsi Masalah : '+ result[0].deskripsi_masalah +'</p>\
                                <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                            </td>\
                            </table>\
                            <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                    </div>',
                    
                    onError: (e) => {
                        console.log(e);
                         
                    },
                    onSuccess: (i) => {
                        console.log(i);
                        callback(1);
                    }
            
                })
            })
        });
    }

    sendMailTindakan(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "1",
                persetujuan_id : 0
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Ask Tindakan Approval Sent to " + mail_to);

                this.getMailEpicaDetails(pica_id,(resultTindakan) => {
                    let tindakanString = "";
                    for(let i=0; i< resultTindakan.length; i++) {
                        tindakanString += '\
                        <tr style="border: 1px solid black; text-align: center">\
                            <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                        </tr>';
                    }

                    let sendMail = process.env.SEND_REAL_MAIL;
                    if (sendMail == 1)
                    nodeoutlook.sendEmail({
                        auth: {
                            user: process.env.OUTLOOK_MAIL_USERNAME,
                            pass: process.env.OUTLOOK_MAIL_PASSWORD
                        },
                        from: process.env.OUTLOOK_MAIL_FROM,
                        to: mail_to,
                        subject: 'Tindakan PICA',
                        html: 
                        '<p>Dear Head, PIC telah mengisi tindakan dan sedang menunggu approval</p>\
                        <div class="card border border-dark">\
                            <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                <td>\
                                    <p style="text-align:center; font-size:150%;">Tindakan PICA no '+ result[0].no_pica +' telah dibuat dan sedang menunggu approval</p>\
                                    <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                    <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                    <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                            <td> '+ result[0].deskripsi_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                            <td> '+ result[0].akar_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                    <tr style="border: 1px solid black; text-align: center">\
                                        <th style="border: 1px solid black">No</th>\
                                        <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                        <th style="border: 1px solid black">PIC</th>\
                                        <th style="border: 1px solid black">Batas Waktu</th>\
                                    </tr> ' + tindakanString + ' \
                                    </table>\
                                </td>\
                            </table>\
                            <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                        </div>',
                        
                        onError: (e) => {
                            console.log(e);
                             
                        },
                        onSuccess: (i) => {
                            console.log(i);
                            callback(1);
                        }
                    });
                })
            }) 
        })
    }

    sendMailTindakanTwo(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "1,2,3",
                persetujuan_id : result[0].persetujuan_id
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Ask Persetujuan Approval Sent to " + mail_to);

                this.getMailEpicaDetails(pica_id,(resultTindakan) => {
                    let tindakanString = "";
                    for(let i=0; i< resultTindakan.length; i++) {
                        tindakanString += '\
                        <tr style="border: 1px solid black; text-align: center">\
                            <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                        </tr>';
                    }

                    let sendMail = process.env.SEND_REAL_MAIL;
                    if (sendMail == 1)
                    nodeoutlook.sendEmail({
                        auth: {
                            user: process.env.OUTLOOK_MAIL_USERNAME,
                            pass: process.env.OUTLOOK_MAIL_PASSWORD
                        },
                        from: process.env.OUTLOOK_MAIL_FROM,
                        to: mail_to,
                        subject: 'Tindakan PICA',
                        html: 
                        '<p>Dear Group Persetujuan, PIC telah mengedit tindakan dan sedang menunggu approval</p>\
                        <div class="card border border-dark">\
                            <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                <td>\
                                    <p style="text-align:center; font-size:150%;">Tindakan PICA no '+ result[0].no_pica +' telah dibuat dan sedang menunggu approval</p>\
                                    <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                    <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                    <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                            <td> '+ result[0].deskripsi_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                            <td> '+ result[0].akar_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                    <tr style="border: 1px solid black; text-align: center">\
                                        <th style="border: 1px solid black">No</th>\
                                        <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                        <th style="border: 1px solid black">PIC</th>\
                                        <th style="border: 1px solid black">Batas Waktu</th>\
                                    </tr> ' + tindakanString + ' \
                                    </table>\
                                </td>\
                            </table>\
                            <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                        </div>',
                        
                        onError: (e) => {
                            console.log(e);
                             
                        },
                        onSuccess: (i) => {
                            console.log(i);
                            callback(1);
                        }
                    });
                })
            }) 
        })
    }

    sendMailTindakanNine(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "1,2",
                persetujuan_id : 0
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Ask Tindakan Approval status 9 Sent to " + mail_to);

                this.getMailEpicaDetails(pica_id,(resultTindakan) => {
                    let tindakanString = "";
                    for(let i=0; i< resultTindakan.length; i++) {
                        tindakanString += '\
                        <tr style="border: 1px solid black; text-align: center">\
                            <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                        </tr>';
                    }

                    let sendMail = process.env.SEND_REAL_MAIL;
                    if (sendMail == 1)
                    nodeoutlook.sendEmail({
                        auth: {
                            user: process.env.OUTLOOK_MAIL_USERNAME,
                            pass: process.env.OUTLOOK_MAIL_PASSWORD
                        },
                        from: process.env.OUTLOOK_MAIL_FROM,
                        to: mail_to,
                        subject: 'Tindakan PICA',
                        html: 
                        '<p>Dear Head, PIC telah mengubah isi tindakan, persetujuan telah approve dan status sekarang sedang menunggu approval Head</p>\
                        <div class="card border border-dark">\
                            <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                <td>\
                                    <p style="text-align:center; font-size:150%;">Tindakan PICA no '+ result[0].no_pica +' telah dibuat dan sedang menunggu approval</p>\
                                    <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                    <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                    <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                            <td> '+ result[0].deskripsi_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                            <td> '+ result[0].akar_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                    <tr style="border: 1px solid black; text-align: center">\
                                        <th style="border: 1px solid black">No</th>\
                                        <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                        <th style="border: 1px solid black">PIC</th>\
                                        <th style="border: 1px solid black">Batas Waktu</th>\
                                    </tr> ' + tindakanString + ' \
                                    </table>\
                                </td>\
                            </table>\
                            <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                        </div>',
                        
                        onError: (e) => {
                            console.log(e);
                             
                        },
                        onSuccess: (i) => {
                            console.log(i);
                            callback(1);
                        }
                    });
                })
            }) 
        })
    }

    sendMailTindakanNineTidakSetuju(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "1,2",
                persetujuan_id : 0
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Tindakan Approval status 9 tidak disetujui Sent to " + mail_to);

                this.getMailEpicaDetails(pica_id,(resultTindakan) => {
                    let tindakanString = "";
                    for(let i=0; i< resultTindakan.length; i++) {
                        tindakanString += '\
                        <tr style="border: 1px solid black; text-align: center">\
                            <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                        </tr>';
                    }

                    let sendMail = process.env.SEND_REAL_MAIL;
                    if (sendMail == 1)
                    nodeoutlook.sendEmail({
                        auth: {
                            user: process.env.OUTLOOK_MAIL_USERNAME,
                            pass: process.env.OUTLOOK_MAIL_PASSWORD
                        },
                        from: process.env.OUTLOOK_MAIL_FROM,
                        to: mail_to,
                        subject: 'Tindakan PICA',
                        html: 
                        '<p>Dear PIC, isi tindakan tidak disetujui oleh group persetujuan, harap direvisi</p>\
                        <div class="card border border-dark">\
                            <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                <td>\
                                    <p style="text-align:center; font-size:150%;">Tindakan PICA no '+ result[0].no_pica +' telah dibuat dan sedang menunggu approval</p>\
                                    <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                    <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                    <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                            <td> '+ result[0].deskripsi_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                            <td> '+ result[0].akar_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                    <tr style="border: 1px solid black; text-align: center">\
                                        <th style="border: 1px solid black">No</th>\
                                        <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                        <th style="border: 1px solid black">PIC</th>\
                                        <th style="border: 1px solid black">Batas Waktu</th>\
                                    </tr> ' + tindakanString + ' \
                                    </table>\
                                </td>\
                            </table>\
                            <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                        </div>',
                        
                        onError: (e) => {
                            console.log(e);
                             
                        },
                        onSuccess: (i) => {
                            console.log(i);
                            callback(1);
                        }
                    });
                })
            }) 
        })
    }
    
    sendMailTindakanApproved(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "2,3",
                persetujuan_id : 0
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Tindakan Approved Sent to " + mail_to);

                this.getMailEpicaDetails(pica_id,(resultTindakan) => {
                    let tindakanString = "";
                    for(let i=0; i< resultTindakan.length; i++) {
                        tindakanString += '\
                        <tr style="border: 1px solid black; text-align: center">\
                            <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                        </tr>';
                    }

                    let sendMail = process.env.SEND_REAL_MAIL;
                    if (sendMail == 1)
                    nodeoutlook.sendEmail({
                        auth: {
                            user: process.env.OUTLOOK_MAIL_USERNAME,
                            pass: process.env.OUTLOOK_MAIL_PASSWORD
                        },
                        from: process.env.OUTLOOK_MAIL_FROM,
                        to: mail_to,
                        subject: 'Tindakan PICA Telah Disetujui Head',
                        html: 
                        '<p>Dear All, Tindakan Pica sudah di approve oleh Head, harap dilanjutkan untuk proses Verifikasi</p>\
                        <div class="card border border-dark">\
                            <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                <td>\
                                    <p style="text-align:center; font-size:150%;">Tindakan PICA no '+ result[0].no_pica +' telah di <span style="color:green;">approve </span> oleh head </p>\
                                    <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                    <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                    <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                            <td> '+ result[0].deskripsi_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                            <td> '+ result[0].akar_masalah +' </td>\
                                        </table>\
                                    <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                    <tr style="border: 1px solid black; text-align: center">\
                                        <th style="border: 1px solid black">No</th>\
                                        <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                        <th style="border: 1px solid black">PIC</th>\
                                        <th style="border: 1px solid black">Batas Waktu</th>\
                                    </tr> ' + tindakanString + ' \
                                    </table>\
                                </td>\
                                </table>\
                                <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                        </div>',
                        onError: (e) => {
                            console.log(e);
                             
                        },
                        onSuccess: (i) => {
                            console.log(i);
                            callback(1);
                        }
                    });
                })
            })
        })    
    }

    sendMailTindakanRejected(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "2",
                persetujuan_id : 0
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Tindakan Rejected Sent to " + mail_to);

                this.getMailEpicaDetails(pica_id,(resultTindakan) => {
                    let tindakanString = "";
                    for(let i=0; i< resultTindakan.length; i++) {
                        tindakanString += '\
                        <tr style="border: 1px solid black; text-align: center">\
                            <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                        </tr>';
                    }

                    let sendMail = process.env.SEND_REAL_MAIL;
                    if (sendMail == 1)
                    nodeoutlook.sendEmail({
                        auth: {
                            user: process.env.OUTLOOK_MAIL_USERNAME,
                            pass: process.env.OUTLOOK_MAIL_PASSWORD
                        },
                        from: process.env.OUTLOOK_MAIL_FROM,
                        to: mail_to,
                        subject: 'Tindakan PICA Tidak Disetujui Head',
                        html: 
                        '<p>Dear PIC, tindakan pica di reject oleh Head, harap melakukan revisi tindakan pica</p>\
                        <div class="card border border-dark">\
                        <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                            <td>\
                                <p style="text-align:center; font-size:150%;">Tindakan PICA no '+ result[0].no_pica +' <span style="color:red;"> tidak di setujui </span> oleh head </p>\
                                <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                <br>\
                                <p style="text-align:left;font-weight: 600;">Alasan tidak disetujui :'+ result[0].alasan_tolak_revisi +' </p>\
                                <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                        <td> '+ result[0].deskripsi_masalah +' </td>\
                                    </table>\
                                <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                        <td> '+ result[0].akar_masalah +' </td>\
                                    </table>\
                                <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="border: 1px solid black">No</th>\
                                    <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                    <th style="border: 1px solid black">PIC</th>\
                                    <th style="border: 1px solid black">Batas Waktu</th>\
                                </tr> ' + tindakanString + ' \
                                </table>\
                            </td>\
                            </table>\
                            <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                    </div>',
                        
                        onError: (e) => {
                            console.log(e);
                             
                        },
                        onSuccess: (i) => {
                            console.log(i);
                            callback(1);
                        }
                    })
                })
            })
        });
    }

    sendMailVerifikasiOpen(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "1,2,3",
                persetujuan_id : 0
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Verifikasi Open Sent to " + mail_to);

                this.getMailEpicaDetails(pica_id,(resultTindakan) => {
                    let tindakanString = "";
                    for(let i=0; i< resultTindakan.length; i++) {
                        tindakanString += '\
                        <tr style="border: 1px solid black; text-align: center">\
                            <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                        </tr>';
                    }

                    this.getMailEpicaVerifikasi(pica_id,(resultVerifikasi) => {
                        let verifikasiString = "";
                        for (let j = 0; j< resultVerifikasi.length; j++){
                            if (resultVerifikasi[j].tanggal_actual == null)
                                resultVerifikasi[j].tanggal_actual = "-";
                            verifikasiString += '\
                            <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 25px; width: 750px;">\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="text-align: center" colspan="3">Verifikasi '+(j+1)+'</th>\
                                </tr>\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="border: 1px solid black">Rencana Verifikasi</th>\
                                    <th style="border: 1px solid black">Tanggal Verifikasi</th>\
                                    <th style="border: 1px solid black">Diverifikasi oleh </th>\
                                </tr>\
                                <tr style="border: 1px; text-align: center">\
                                    <td style="border: 1px solid black">'+resultVerifikasi[j].tanggal_rencana + '</td>\
                                    <td style="border: 1px solid black">'+resultVerifikasi[j].tanggal_actual +'</td>\
                                    <td style="border: 1px solid black">'+resultVerifikasi[j].verifier_username +'</td>\
                                </tr>\
                                <tr>\
                                    <td>Catatan Verifikasi '+(j+1)+' : '+resultVerifikasi[j].catatan+'</td>\
                                </tr>\
                            </table>\
                            ';
                        }
                        let sendMail = process.env.SEND_REAL_MAIL;
                        if (sendMail == 1)
                        nodeoutlook.sendEmail({
                            auth: {
                                user: process.env.OUTLOOK_MAIL_USERNAME,
                                pass: process.env.OUTLOOK_MAIL_PASSWORD
                            },
                            from: process.env.OUTLOOK_MAIL_FROM,
                            to: mail_to,
                            subject: 'Update Verifikasi PICA',
                            html: 
                            '<p>Dear all, Verifikasi telah diupdate dengan status open</p>\
                            <div class="card border border-dark">\
                                <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                    <td>\
                                        <p style="text-align:center; font-size:150%;">Verifikasi PICA '+ result[0].no_pica +' telah di Update</p>\
                                        <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                        <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                        <br>\
                                        <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                            <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                                <td> '+ result[0].deskripsi_masalah +' </td>\
                                            </table>\
                                        <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                            <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                                <td> '+ result[0].akar_masalah +' </td>\
                                            </table>\
                                        <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                        <tr style="border: 1px solid black; text-align: center">\
                                            <th style="border: 1px solid black">No</th>\
                                            <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                            <th style="border: 1px solid black">PIC</th>\
                                            <th style="border: 1px solid black">Batas Waktu</th>\
                                        </tr> ' + tindakanString + ' \
                                        </table>\
                                        <p style="text-align:left;font-weight: 600;">Verikasi</p>\
                                        ' + verifikasiString + ' \
                                    </td>\
                                    </table>\
                                    <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                            </div>',
                            
                            onError: (e) => {
                                console.log(e);
                                 
                            },
                            onSuccess: (i) => {
                                console.log(i);
                                callback(1);
                            }
                        });
                    })
                })
            }) 
        })
    }
    
    sendMailVerifikasiClosed(pica_id,callback) {
        this.getMailEpicaMaster(pica_id,(result,code) => {
            var dataEmail = {
                department_id : result[0].department_id,
                roles : "1,2,3",
                persetujuan_id : 0
            }
            
            this.getEmailSentTo(dataEmail,(mail_to) => {
                console.log("Mail Verifikasi Closed Sent to " + mail_to);
                this.getMailEpicaDetails(pica_id,(resultTindakan) => {
                    let tindakanString = "";
                    for(let i=0; i< resultTindakan.length; i++) {
                        tindakanString += '\
                        <tr style="border: 1px solid black; text-align: center">\
                            <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                        </tr>';
                    }

                    this.getMailEpicaVerifikasi(pica_id,(resultVerifikasi) => {
                        let verifikasiString = "";
                        for (let j = 0; j< resultVerifikasi.length; j++){
                            if (resultVerifikasi[j].tanggal_actual == null)
                                resultVerifikasi[j].tanggal_actual = "-";
                            verifikasiString += '\
                            <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 25px; width: 750px;">\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="text-align: center" colspan="3">Verifikasi '+(j+1)+'</th>\
                                </tr>\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="border: 1px solid black">Rencana Verifikasi</th>\
                                    <th style="border: 1px solid black">Tanggal Verifikasi</th>\
                                    <th style="border: 1px solid black">Diverifikasi oleh </th>\
                                </tr>\
                                <tr style="border: 1px; text-align: center">\
                                    <td style="border: 1px solid black">'+resultVerifikasi[j].tanggal_rencana + '</td>\
                                    <td style="border: 1px solid black">'+resultVerifikasi[j].tanggal_actual +'</td>\
                                    <td style="border: 1px solid black">'+resultVerifikasi[j].verifier_username +'</td>\
                                </tr>\
                                <tr>\
                                    <td>Catatan Verifikasi '+(j+1)+' : '+resultVerifikasi[j].catatan+'</td>\
                                </tr>\
                            </table>\
                            ';
                        }
                        let sendMail = process.env.SEND_REAL_MAIL;
                        if (sendMail == 1)
                        nodeoutlook.sendEmail({
                            auth: {
                                user: process.env.OUTLOOK_MAIL_USERNAME,
                                pass: process.env.OUTLOOK_MAIL_PASSWORD
                            },
                            from: process.env.OUTLOOK_MAIL_FROM,
                            to: mail_to,
                            subject: 'Verifikasi PICA Done',
                            html: 
                            '<p>Dear all, Verifikasi telah diupdate dan status sudah menjadi CLOSED</p>\
                            <div class="card border border-dark">\
                                <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                    <td>\
                                        <p style="text-align:center; font-size:150%;">Verifikasi PICA '+ result[0].no_pica +' telah berganti status menjadi CLOSED</p>\
                                        <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                        <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                        <br>\
                                        <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                            <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                                <td> '+ result[0].deskripsi_masalah +' </td>\
                                            </table>\
                                        <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                            <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                                <td> '+ result[0].akar_masalah +' </td>\
                                            </table>\
                                        <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                        <tr style="border: 1px solid black; text-align: center">\
                                            <th style="border: 1px solid black">No</th>\
                                            <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                            <th style="border: 1px solid black">PIC</th>\
                                            <th style="border: 1px solid black">Batas Waktu</th>\
                                        </tr> ' + tindakanString + ' \
                                        </table>\
                                        <p style="text-align:left;font-weight: 600;">Verikasi</p>\
                                        ' + verifikasiString + ' \
                                    </td>\
                                    </table>\
                                    <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                            </div>',
                            
                            onError: (e) => {
                                console.log(e);
                                 
                            },
                            onSuccess: (i) => {
                                console.log(i);
                                callback(1);
                            }
                        });
                    })
                })
            }) 
        })
    }
    
    sendReminderTindakan(tindakan,reminder) {
        this.getMailEpicaMaster(tindakan.pica_master_id,(result,code) => {
            this.getMailEpicaDetails(tindakan.pica_master_id,(resultTindakan) => {
                var dataEmail = {
                    department_id : tindakan.department_id,
                    roles : "1,2,3",
                    persetujuan_id : 0
                }
                let tindakanString = "";
                for(let i=0; i< resultTindakan.length; i++) {
                    tindakanString += '\
                    <tr style="border: 1px solid black; text-align: center">\
                        <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                        <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                        <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                        <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                    </tr>';
                }
                this.getEmailSentTo(dataEmail,(mail_to) => {
                    console.log("Mail Reminder Tindakan Sent to " + mail_to);
        
                    if (reminder.before_after == "B")
                        reminder.before_after = "Before"
                    else if (reminder.before_after == "A")
                        reminder.before_after = "After"
        
                    let sendMail = process.env.SEND_REAL_MAIL;
                    if (sendMail == 1)
                    nodeoutlook.sendEmail({
                        auth: {
                            user: process.env.OUTLOOK_MAIL_USERNAME,
                            pass: process.env.OUTLOOK_MAIL_PASSWORD
                        },
                        from: process.env.OUTLOOK_MAIL_FROM,
                        to: mail_to,
                        subject: 'Reminder Tindakan PICA',
                        html: 
                        '<p>Dear all, berikut reminder untuk tindakan pica</p>\
                        <div class="card border border-dark">\
                        <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                            <td>\
                                <p style="text-align:center; font-size:120%;">\
                                Reminder Tindakan Pica No '+tindakan.no_pica +' '+reminder.before_after +' '+reminder.days+' Days From Batas Waktu</p>\
                                <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="border: 1px solid black">Tindakan No</th>\
                                    <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                    <th style="border: 1px solid black">PIC</th>\
                                    <th style="border: 1px solid black">Batas Waktu</th>\
                                </tr>\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <td style="border: 1px solid black">'+tindakan.urutan_tindakan+'</td>\
                                    <td style="border: 1px solid black">'+tindakan.tindakan_koreksi+'</td>\
                                    <td style="border: 1px solid black">'+tindakan.pic_fullname+'</td>\
                                    <td style="border: 1px solid black">'+tindakan.batas_waktu+'</td>\
                                </tr>\
                                </table>\
                            </td>\
                        </div>\
                        <div class="card border border-dark">\
                        <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                            <td>\
                                <p style="text-align:center; font-size:150%;">Asal Reminder Tindakan PICA no '+ result[0].no_pica +' <span style="color:red;"> </p>\
                                <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                <br>\
                                <p style="text-align:left;font-weight: 600;">Alasan tidak disetujui :'+ result[0].alasan_tolak_revisi +' </p>\
                                <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                        <td> '+ result[0].deskripsi_masalah +' </td>\
                                    </table>\
                                <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                        <td> '+ result[0].akar_masalah +' </td>\
                                    </table>\
                                <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                <tr style="border: 1px solid black; text-align: center">\
                                    <th style="border: 1px solid black">No</th>\
                                    <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                    <th style="border: 1px solid black">PIC</th>\
                                    <th style="border: 1px solid black">Batas Waktu</th>\
                                </tr> ' + tindakanString + ' \
                                </table>\
                            </td>\
                            </table>\
                            <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                        </div>',
                        
                        onError: (e) => {
                            console.log(e);
                            
                        },
                        onSuccess: (i) => {
                            console.log(i);
                        }
                    });
                })
            })
        })
    }

    sendReminderRencanaVerifikasi(verifikasi,reminder) {
        this.getMailEpicaMaster(verifikasi.pica_master_id,(result,code) => {
            this.getMailEpicaDetails(verifikasi.pica_master_id,(resultTindakan) => {
                this.getMailEpicaVerifikasi(verifikasi.pica_master_id,(resultVerifikasi) => {
                    let tindakanString = "";
                    for(let i=0; i< resultTindakan.length; i++) {
                        tindakanString += '\
                        <tr style="border: 1px solid black; text-align: center">\
                            <td style="border: 1px solid black">'+resultTindakan[i].urutan_tindakan+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].tindakan_koreksi+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].pic_fullname+'</td>\
                            <td style="border: 1px solid black">'+resultTindakan[i].batas_waktu+'</td>\
                        </tr>';
                    }
                    let verifikasiString = "";
                    for (let j = 0; j< resultVerifikasi.length; j++){
                        if (resultVerifikasi[j].tanggal_actual == null)
                            resultVerifikasi[j].tanggal_actual = "-";
                        verifikasiString += '\
                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 25px; width: 750px;">\
                            <tr style="border: 1px solid black; text-align: center">\
                                <th style="text-align: center" colspan="3">Verifikasi '+(j+1)+'</th>\
                            </tr>\
                            <tr style="border: 1px solid black; text-align: center">\
                                <th style="border: 1px solid black">Rencana Verifikasi</th>\
                                <th style="border: 1px solid black">Tanggal Verifikasi</th>\
                                <th style="border: 1px solid black">Diverifikasi oleh </th>\
                            </tr>\
                            <tr style="border: 1px; text-align: center">\
                                <td style="border: 1px solid black">'+resultVerifikasi[j].tanggal_rencana + '</td>\
                                <td style="border: 1px solid black">'+resultVerifikasi[j].tanggal_actual +'</td>\
                                <td style="border: 1px solid black">'+resultVerifikasi[j].verifier_username +'</td>\
                            </tr>\
                            <tr>\
                                <td>Catatan Verifikasi '+(j+1)+' : '+resultVerifikasi[j].catatan+'</td>\
                            </tr>\
                        </table>\
                        ';
                    }
                    var dataEmail = {
                        department_id : verifikasi.department_id,
                        roles : "1,2,3",
                        persetujuan_id : 0
                    }
                    this.getEmailSentTo(dataEmail,(mail_to) => {
                        console.log("Mail Reminder Verifikasi Sent to " + mail_to);
                            
                        if (reminder.before_after == "B")
                        reminder.before_after = "Before"
                        else if (reminder.before_after == "A")
                            reminder.before_after = "After"
            
                        let sendMail = process.env.SEND_REAL_MAIL;
                        if (sendMail == 1)
                        nodeoutlook.sendEmail({
                            auth: {
                                user: process.env.OUTLOOK_MAIL_USERNAME,
                                pass: process.env.OUTLOOK_MAIL_PASSWORD
                            },
                            from: process.env.OUTLOOK_MAIL_FROM,
                            to: mail_to,
                            subject: 'Reminder Verifikasi PICA',
                            html: 
                            '<p>Dear all, berikut reminder untuk verifikasi pica</p>\
                            <div class="card border border-dark">\
                            <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                <td>\
                                    <p style="text-align:center; font-size:120%;">\
                                    Reminder Verifikasi Pica No '+verifikasi.no_pica +' '+reminder.before_after +' '+reminder.days+' Days From Rencana Verifikasi</p>\
                                    <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 25px; width: 750px;">\
                                        <tr style="border: 1px solid black; text-align: center">\
                                            <th style="text-align: center" colspan="3">Verifikasi '+verifikasi.verifikasi_no+'</th>\
                                        </tr>\
                                        <tr style="border: 1px solid black; text-align: center">\
                                            <th style="border: 1px solid black">Rencana Verifikasi</th>\
                                            <th style="border: 1px solid black">Tanggal Verifikasi</th>\
                                            <th style="border: 1px solid black">Diverifikasi oleh </th>\
                                        </tr>\
                                        <tr style="border: 1px; text-align: center">\
                                            <td style="border: 1px solid black">'+verifikasi.tanggal_rencana + '</td>\
                                            <td style="border: 1px solid black">'+verifikasi.tanggal_actual +'</td>\
                                            <td style="border: 1px solid black">'+verifikasi.verifier_username +'</td>\
                                        </tr>\
                                        <tr>\
                                            <td>Catatan Verifikasi : '+verifikasi.catatan+'</td>\
                                        </tr>\
                                    </table>\
                                </td>\
                            </div>\
                            <div class="card border border-dark">\
                                <table class="center" style="border: 1px solid #333; margin: 10px auto; width: 750px;">\
                                    <td>\
                                        <p style="text-align:center; font-size:150%;">Asal Reminder Verifikasi PICA '+ result[0].no_pica +' </p>\
                                        <p>Tgl PICA dibuat : '+ result[0].tanggal_buka +'</p>\
                                        <p>Dibuat Oleh : '+ result[0].pengusul_fullname +'</p>\
                                        <br>\
                                        <p style="text-align:left;font-weight: 600;">Deskripsi Masalah</p>\
                                            <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                                <td> '+ result[0].deskripsi_masalah +' </td>\
                                            </table>\
                                        <p style="text-align:left;font-weight: 600;">Akar Masalah</p>\
                                            <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px ;width: 750px;">\
                                                <td> '+ result[0].akar_masalah +' </td>\
                                            </table>\
                                        <p style="text-align:left;font-weight: 600;">Tindakan</p>\
                                        <table style="border: 1px solid black; border-collapse: collapse; margin-bottom: 15px; width: 750px;">\
                                        <tr style="border: 1px solid black; text-align: center">\
                                            <th style="border: 1px solid black">No</th>\
                                            <th style="border: 1px solid black">Tindakan Koreksi/ Pencegahan</th>\
                                            <th style="border: 1px solid black">PIC</th>\
                                            <th style="border: 1px solid black">Batas Waktu</th>\
                                        </tr> ' + tindakanString + ' \
                                        </table>\
                                        <p style="text-align:left;font-weight: 600;">Verikasi</p>\
                                        ' + verifikasiString + ' \
                                    </td>\
                                    </table>\
                                    <a href="'+process.env.PATH_DESTINATION+'/epicaListFilter/'+this.formatStringEmail(result[0].no_pica)+'">Go to EPICA</a>\
                            </div>',
                            
                            onError: (e) => {
                                console.log(e);
                                
                            },
                            onSuccess: (i) => {
                                console.log(i);
                            }
                        });
                    })
                })
            })
        })
    }
}

module.exports = new mailModel();