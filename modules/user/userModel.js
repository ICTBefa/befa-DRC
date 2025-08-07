
const { response } = require("express");
const db = require("../../config/database");

class userModel {

    getUserList(callback){
        let sql = "SELECT u.id, la.level_akses_name, c.company_name, \
        l.location_name, u.username, u.nik, \
        u.fullname, u.email, u.active FROM user u \
        JOIN company c ON c.id = u.company_id \
        JOIN location l ON l.id = u.location_id \
        JOIN level_akses la ON la.id = u.level_akses_id ";
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    getCompany(callback){
        let sql = "SELECT c.id, c.company_name FROM company c WHERE c.active = 1";
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    getLocation(callback){
        let sql = "SELECT l.id, l.location_name FROM location l WHERE l.active = 1";
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    getLevelAkses(callback){
        let sql = "SELECT l.id, l.level_akses_name FROM level_akses l WHERE l.active = 1";
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

    insertNewUser(data, callback){
        let sql = "INSERT INTO \
        user (level_akses_id, company_id, location_id, username, password, nik, fullname, email, active, created_by) \
        VALUES ("+data.levelAkses+", "+ data.company +" , "+data.location+" , '"+data.username+"' , MD5('"+data.password+"'), '"+data.nik+"', '"+data.fullname+"' , '"+data.email+"', "+data.status+", "+data.user_edit_by+") ";
        db.local.query(sql, (err, result, field)=>{
            if (err) {
                console.log(err);
                callback(0);
            } else {
                callback(1);
            }
        })
    }

    editExistingUser(data, callback){
        let sql = "UPDATE user u \
        SET level_akses_id = " + data.levelAkses + ", \
        company_id = " + data.company + ", \
        location_id = " + data.location + ", \
        username = '" + data.username + "', "
        
        if (data.password)
            sql += "PASSWORD = MD5('" + data.password + "'), ";

        sql += " \
        nik = '" + data.nik + "', \
        fullname = '" + data.fullname + "', \
        email = '" + data.email + "', \
        active = " + data.status + ", \
        updated_by = " + data.user_edit_by + " \
        WHERE id = " + data.user_id;

        db.local.query(sql, (err, result, field)=>{
            if (err) {
                console.log(err);
                callback(0);
            } else {
                callback(1);
            }
        })
    }

    deleteUser(data, callback){
        let sql = "UPDATE user u SET active = 1-active , \
                   updated_by = "+data.user_edit_by+" WHERE id = " + data.user_id;
        db.local.query(sql, (err, result, field)=>{
            if (err) {
                console.log(err);
                callback(0);
            } else {
                callback(1);
            }
        })
    }

    getUserListWithID(data, callback){
        let sql = "SELECT u.id, la.level_akses_name, c.company_name, \
        u.level_akses_id, u.company_id, u.location_id, \
        l.location_name, u.username, u.nik, \
        u.fullname, u.email, u.active FROM user u \
        JOIN company c ON c.id = u.company_id \
        JOIN location l ON l.id = u.location_id \
        JOIN level_akses la ON la.id = u.level_akses_id \
        WHERE u.id = " + data.user_id;
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result, 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }

}

module.exports = new userModel();
