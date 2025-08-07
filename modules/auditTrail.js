const { response } = require("express");
const { data, timers } = require("jquery");
const db = require("../config/database");
const masterUser = require("./masterUser/masterUserController");

class auditTrail {

    auditManual(user_id,action,detail){
        let sql = "INSERT INTO audit_trail \
        (user_id, action, detail) \
        VALUES ('"+user_id+"', '"+action+"', \
        '"+detail+"');"

        db.local.query(sql, (err, result, field)=>{
            if (err) console.log(err);
        })
    }

    audit(req,detail){
        
        let sql = "INSERT INTO audit_trail \
        (user_id, action, detail) \
        VALUES ('"+req.api_session.user_id+"', '"+req.url+"', \
        '"+detail+"');"

        db.local.query(sql, (err, result, field)=>{
            if (err) console.log(err);
        })
        
    }

    audit(req,detail,target){
        
        let sql = "INSERT INTO audit_trail \
        (user_id, action, detail,target) \
        VALUES ('"+req.api_session.user_id+"', '"+req.url+"', \
        '"+detail+"', '"+target+"');"
        
        db.local.query(sql, (err, result, field)=>{
            if (err) console.log(err);
        })
        
    }

    getAuditList(token,callback){
        let sql = "SELECT * FROM audit_trail ORDER BY created_at DESC LIMIT 1000"        
        db.local.query(sql, (err, result, field)=>{
            if (err){
                console.log(err);
                callback(null,0);
            } else {
                var userArr = [];
                for (var i = 0; i< result.length; i++) {
                    userArr.push(result[i].user_id);
                }
                masterUser.hitMasterUserArray("getUserArray",token,userArr).then((dataUser) => {
                    for (var i = 0; i< result.length; i++) {
                        result[i].fullname = dataUser[i].fullname;
                    }
                    callback(result,1);
                }) 
            }
        })
    }

    getAuditDocList(token,callback){
        let sql = "SELECT dt.*, dm.doc_name FROM doc_transaction dt \
        JOIN doc_master dm ON dm.id = dt.doc_master_id \
        WHERE dt.active = 1 ORDER BY dt.created_at DESC LIMIT 1000"        
        db.local.query(sql, (err, result, field)=>{
            if (err){
                console.log(err);
                callback(null,0);
            } else {
                var userArr = [];
                for (var i = 0; i< result.length; i++) {
                    userArr.push(result[i].requestor_id);
                }
                masterUser.hitMasterUserArray("getUserArray",token,userArr).then((dataUser) => {
                    for (var i = 0; i< result.length; i++) {
                        result[i].fullname = dataUser[i].fullname;
                    }
                    callback(result,1);
                }) 
            }
        })
    }

    auditEscape(req,detail,target){
        target = db.local.pool.escape(JSON.stringify(target))
        let sql = "INSERT INTO audit_trail \
        (user_id, action, detail,target) \
        VALUES ('"+req.api_session.user_id+"', '"+req.url+"', \
        '"+detail+"', "+target+");"
        
        db.local.query(sql, (err, result, field)=>{
            if (err) console.log(err);
        })
    }
}

module.exports = new auditTrail();
