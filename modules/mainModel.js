const db = require("../config/database")
const masterUser = require("./masterUser/masterUserController");
class mainModel{
    checkDbConn(callback) {
        //console.log('-- checkDbConn --');
        let status = {
            local: {error: false, message: ''}
        };
        
        db.local.pool.getConnection((errLocal, connLocal) => {
            if (errLocal) {
                let errMsg = errLocal.sqlMessage + '. (Code: ' + errLocal.errno + ')';
                status.local.error = true;
                status.local.message = errMsg;
                console.log('Local DB... Error: ' + errMsg);
            } else {
                //console.log('Local DB... OK');
                connLocal.release();
            }

            callback(status);
        });
    }

    checkSession(token,callback) {
        console.log('-- Checking Session --');
        let sql = "SELECT us.user_id, us.session_token, \
        u.username, u.fullname, la.id AS level_akses, la.level_akses_name \
        FROM user_session us \
        JOIN user u ON u.id = us.user_id \
        JOIN level_akses la ON la.id = u.level_akses_id \
        WHERE us.session_token = '"+token+"' \
        AND us.active = 1\
        AND us.expired_at >= NOW(); "
        db.local.query(sql, (err, result, field)=>{
            if (result[0]) {
                callback(result[0], 1);
            } else {
                callback(null,0);
            }
        })
    }

    login(data, callback){
        let sql = "SELECT `U`.`id`, `L`.`psikotes` , `U`.`level_akses_id` , `U`.`username`, `U`.`fullname`, `U`.`level_akses_id`, `L`.`level_akses_name` \
            FROM `user` `U` \
            INNER JOIN `level_akses` `L` ON `L`.`id` = `U`.`level_akses_id` \
            WHERE `U`.`active` = 1 \
            AND `U`.`username` = " + db.local.pool.escape(data.email) + " \
            AND `U`.`password` = MD5(" + db.local.pool.escape(data.password) + ")";
        db.local.query(sql, (err, result, field)=>{
            //can do something with login callback here
            if (result[0]) {
                callback(result[0], 1);
            } else {
                callback(null, 0);
            }
        })
    }

    loginHelpdesk(data, callback){
        //external check login
        let ExtSql = "SELECT `tu`.* FROM tenant_user `tu` WHERE \
        `tu`.`email` = "+db.local.pool.escape(data.email)+" AND \
        `tu`.`password` = MD5(" + db.local.pool.escape(data.password) + ")";
        db.local.query(ExtSql, (err, result, field)=>{
            if (result[0]) {
                //jwt sign dicontroller               
                callback(result[0], 2);
            } else {
                //no match with external tenant,. gona go with internal
                masterUser.hitMasterUserInternalLogin(data).then((response) => {
                    //console.log("response login logging from master user");
                    //console.log(response);
                    if(response.status == 200) {
                        //match in internal found
                        callback(response,1)
                    } else if(response.status == 300) {
                        //no match in internal found
                        callback(response,3)
                    } else {
                        //error Master Userl
                        callback(null, 0);
                    }
                })
            }
        })
    }
    
    logout(userID,callback) {
        //console.log('');
        let sql = "UPDATE user_session \
        SET active = '0' \
        WHERE user_id = '"+userID+"'"
        db.local.query(sql, (err, result, field)=>{
            if (result) {
                callback(1);
            } else {
                callback(0);
            }
        })
    }

    formExample(callback) {
        let sql = "SELECT * FROM doc_master WHERE id = 1"
        db.local.query(sql, (err, result, field)=>{
            if (result[0]) {
                callback(result[0], 1);
            } else {
                callback(null,0);
            }
        })
    }

    formExampleID(id, callback) {
        let sql = "SELECT * FROM doc_master WHERE id = " + id
        //console.log(sql);
        db.local.query(sql, (err, result, field)=>{
            try {
                if (result[0]) {
                    callback(result[0], 1);
                } else {
                    callback(null,0);
                }
            } catch {
                callback(null,0);
            }
        })
    }

    docList(api_session, callback) {
        let sql = "";
        //if user is super admin or higher, then show all doc
        if (api_session.apps_roles_id <= 2) {
            sql = "SET @row_number = 0;\
            SELECT *, (@row_number:=@row_number + 1) AS row_num FROM doc_master "
        } else if (api_session.apps_roles_id == 4) {
            //only user level access, not allowed to access the document
            console.log("Unauthorized user");
        } else if (api_session.apps_roles_id == 3){
            //for admin, show the doc accodring to their department
            var dept = api_session.department;
            if (!dept) callback(null,0);// if falsey then nvm n kick user
            var deptStr="" ;
            for (var i = 0 ; i< dept.length; i++){
                if (i != 0)
                    deptStr +=" OR "; 
                deptStr += " (doc_owner_code LIKE '%"+ dept[i].kode_department + "%') " 
            }
            sql = "SET @row_number = 0;\
            SELECT *, (@row_number:=@row_number + 1) AS row_num  FROM doc_master WHERE " + deptStr;
        }
        //console.log("sql = " + sql);
        if (sql){
            db.local.query(sql, (err, result, field)=>{
                if (result) {
                    callback(result[1], 1);
                } else {
                    callback(null,0);
                }
            })
        } else {
            callback(null,0);
        }
    }

    autoGenerateInternalUser(user_id,display_name, callback) {
        let preSql = "SELECT * FROM internal_user WHERE user_id = " + user_id
        //console.log(sql);
        db.local.query(preSql, (err, result, field)=>{
            if (result.length > 0){
                //user alr exist, dont do anything
                callback(null,2);
            } else {
                //auto generate newly logged in user
                var defaults = ["default1", "default2", "default3", "default4"];
                var randomIndex = Math.floor(Math.random() * defaults.length);
                var randomPP = defaults[randomIndex];

                let sql = `INSERT INTO internal_user 
                (user_id, display_name, path_foto) 
                VALUES ('${user_id}', '${display_name}', '/dist/img/pp/${randomPP}.png');`
                db.local.query(sql, (err, result, field)=>{
                    if (result[0]) {
                        callback(result[0], 1);
                    } else {
                        callback(null,0);
                    }
                })
            }
        })

        
    }
}

module.exports = new mainModel()