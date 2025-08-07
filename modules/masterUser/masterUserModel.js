
const { response } = require("express");
const db = require("../../config/database");

class masterUserModel {

    getApprovalDetailWIthID(id,callback){
        let sql = "SELECT * FROM approval_detail WHERE id = " + id;
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(result[0], 1);
            } else {
                console.log(err);
                callback(null, 0);
            }
        })
    }
}

module.exports = new masterUserModel();