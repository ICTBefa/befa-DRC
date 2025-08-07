const { response } = require("express");
const { data, timers } = require("jquery");
const db = require("../../config/database");
// var nodeoutlook = require('./send_email.js');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const mailModel = require("./mailModel");

class mailSchedulerModel {

    mailTindakanReminder() {
        console.log("mail tindakan reminder called");
        
        this.getTindakanList((tindakan,codeTindakan) => {
            this.getReminderList("1",(reminder,codeReminder) => {
                let waitTime = 5000;
                for (let i=0;i<tindakan.length;i++){
                    for (let j=0;j<reminder.length;j++){
                        
                        let dates = this.formatDate(tindakan[i].batas_waktu);
                        dates = new Date(dates);
                        let todayDate = new Date();
                        let diff = dates - todayDate;
                        
                        let beforeAfter = "B";
                        if (diff < 0) {
                            //if diff minus it means the date is AFTER today 
                            beforeAfter = "A"; 
                            diff = todayDate - dates;
                            //minus one day to make the calculation correct for "A"
                            diff -= (1000 * 60 * 60 * 24);
                        }
                        let diffdays = Math.ceil(diff / (1000 * 60 * 60 * 24))
                        
                        //compare the dates, including the A and B
                        if (diffdays == reminder[j].days && beforeAfter == reminder[j].before_after) {
                            
                            //send email then wait few second
                            setTimeout(() => { 
                                //sending log that reminder match is found and email sent
                                console.log(" ");
                                console.log("Reminder Tindakan Match Found");
                                console.log("PICA No: " + tindakan[i].no_pica);
                                console.log("Tindakan No: " + tindakan[i].urutan_tindakan);
                                console.log("Tindakan Content: " + tindakan[i].tindakan_koreksi);
                                console.log("Batas Waktu Tindakan: " + tindakan[i].batas_waktu);
                                console.log("Reminder Variable: " + reminder[j].before_after + reminder[j].days);
                                mailModel.sendReminderTindakan(tindakan[i],reminder[j]);
                            }, waitTime);

                            waitTime += parseInt(process.env.EMAIL_DELAY_TIME_MILISECOND);
                        }

                    }
                }
            });
        });
    }

    mailVerifikasiReminder() {
        console.log("mail verifikasi reminder called");
        
        this.getVerifikasiList((verifikasi,codeVerifikasi) => {
            this.getReminderList("2",(reminder,codeReminder) => {
                let waitTime = 2500;
                for (let i=0;i<verifikasi.length;i++){
                    for (let j=0;j<reminder.length;j++){
                        
                        let dates = this.formatDate(verifikasi[i].tanggal_rencana);
                        dates = new Date(dates);
                        let todayDate = new Date();
                        let diff = dates - todayDate;
                        
                        let beforeAfter = "B";
                        if (diff < 0) {
                            //if diff minus it means the date is AFTER today 
                            beforeAfter = "A"; 
                            diff = Math.abs(diff);
                        }
                        let diffdays = Math.ceil(diff / (1000 * 60 * 60 * 24))
                        
                        //compare the dates, including the A and B
                        if (diffdays == reminder[j].days && beforeAfter == reminder[j].before_after) {
                            
                            //send email then wait few second
                            setTimeout(() => { 
                                //sending log that reminder match is found
                                console.log(" ");
                                console.log("Reminder Verifikasi Match Found");
                                console.log("PICA No: " + verifikasi[i].no_pica);
                                console.log("Verifikasi No: " + verifikasi[i].verifikasi_no);
                                console.log("Catatan Verifikasi: " + verifikasi[i].catatan);
                                console.log("Tanggal Rencana Verifikasi: " + verifikasi[i].tanggal_rencana);
                                console.log("Reminder Variable: " + reminder[j].before_after + reminder[j].days);
                                mailModel.sendReminderRencanaVerifikasi(verifikasi[i],reminder[j]);
                            }, waitTime);
                            waitTime += parseInt(process.env.EMAIL_DELAY_TIME_MILISECOND);
                        }
                        
                    }
                }
            });
        });
    }
    getTindakanList(callback){
        let sql = "SELECT pd.urutan_tindakan, pd.tindakan_koreksi, DATE_FORMAT(pd.batas_waktu, '%d %M %Y') AS batas_waktu, pm.department_id, \
        u.fullname AS pic_fullname , pm.no_pica, pd.pica_master_id, pm.deskripsi_masalah, pm.akar_masalah \
        FROM pica_details pd \
        LEFT JOIN user u ON u.id = pd.pic_user_id \
        JOIN pica_master pm ON pm.id = pd.pica_master_id \
        WHERE pd.active = 1 AND pm.pica_status_id <> 5 ";
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    getVerifikasiList(callback){
        let sql = "SELECT pv.verifikasi_no, pv.pica_master_id, pv.catatan, \
        DATE_FORMAT(pv.tanggal_rencana, '%d %M %Y') AS tanggal_rencana, \
        DATE_FORMAT(pv.tanggal_actual, '%d %M %Y') AS tanggal_actual, \
        u.fullname AS verifier_username, pm.department_id, \
        pm.no_pica, pm.deskripsi_masalah, pm.akar_masalah \
        FROM pica_verifikasi pv \
        JOIN user u ON u.id = pv.verified_by_user_id \
        JOIN pica_master pm ON pm.id = pv.pica_master_id \
        WHERE pv.active = 1 AND pm.pica_status_id <> 5 ";
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    getReminderList(id, callback){
        let sql = "SELECT rl.before_after, rl.days \
        FROM reminder_list rl \
        WHERE rl.active = 1 \
        AND rl.reminder_id = " + id;
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }
    
}

module.exports = new mailSchedulerModel();
