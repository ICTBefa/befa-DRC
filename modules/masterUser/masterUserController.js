const { json } = require("body-parser");
const axios = require('axios');
class masterUser {
    /*
    async getMasterUserArray(token, userIDs) {
        var path = process.env.PORTAL_DESTINATION + "/api/" + "getUserArray"
        const config = {headers:{['x-access-token']: token}};
        return await axios.post(path, {data: userIDs} , config)
        .then(function (response) {
            console.log(response.data.data)
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            var userIDsResult = null;
            return userIDsResult;
        }); 
    }

    async getMasterDeptArray(token, deptIDs) {
        var path = process.env.PORTAL_DESTINATION + "/api/" + "getDeptArray"
        const config = {headers:{['x-access-token']: token}};
        return await axios.post(path, {data: deptIDs} , config)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            var userIDsResult = null;
            return userIDsResult;
        });
    }

    async getHeadDeptArray(token, deptIDs) {
        var path = process.env.PORTAL_DESTINATION + "/api/" + "getHeadDeptArray"
        const config = {headers:{['x-access-token']: token}};
        return await axios.post(path, {data: deptIDs} , config)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            var userIDsResult = null;
            return userIDsResult;
        });
    }
*/
    async hitMasterUserArray(path, token, deptIDs) {
        var path = process.env.PORTAL_DESTINATION + "/api/" + path
        const config = {headers:{['x-access-token']: token}};
        return await axios.post(path, {data: deptIDs} , config)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
    }

    async hitMasterUserSingleData(path, token, data) {
        var path = process.env.PORTAL_DESTINATION + "/api/" + path
        const config = {headers:{['x-access-token']: token}};
        return await axios.post(path, {data: data} , config)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
    }

    async hitMasterUserAllLocation(token) {
        var path = process.env.PORTAL_DESTINATION + "/api/getAllLocation";
        const config = {headers:{['x-access-token']: token}};
        return await axios.get(path, config)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
    }

    async hitMasterUserAllUser(token) {
        var path = process.env.PORTAL_DESTINATION + "/api/getAllUser";
        const config = {headers:{['x-access-token']: token}};
        return await axios.get(path, config)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
    }

    async hitMasterUserAllDept(token) {
        var path = process.env.PORTAL_DESTINATION + "/api/getAllDept";
        const config = {headers:{['x-access-token']: token}};
        return await axios.get(path, config)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
    }

    async hitMasterUserGetDeptNames(token,data) {
        var path = process.env.PORTAL_DESTINATION + "/api/getDeptNames";
        const config = {headers:{['x-access-token']: token}};
        return await axios.post(path, {data: data} , config)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
    }

    async hitMasterUserInternalLogin(data) {
        var path = process.env.PORTAL_DESTINATION + "/api/loginValidationHDI";
        return await axios.post(path, {email: data.email, password: data.password, remember:false})
        .then(function (response) {
            console.log("response ilogin log");
            console.log(response.data);
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
    }

    async hitMasterUserGetAllDeptMembersMaxManager(token,data) {
        var path = process.env.PORTAL_DESTINATION + "/api/getAllDeptMembersMaxManager/"+data;
        const config = {headers:{['x-access-token']: token}};
        return await axios.get(path, config)
        .then(function (response) {
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
    }
/*
    async ConvertApprovalDetailID(user_id,approval_detail_id, token) {
        console.log("convert approval detail id called");
        
        masterUserModel.getApprovalDetailWIthID(approval_detail_id, async (response, code) => {
            var path = ""; var datasend = "";
            //check if data from portal is 1 or 0, if 0 nvm la
            if (response.data_from_portal == 0){
                console.log("Master User error - not a data from portal");
                return null;
            } else {
                //check if portal superior 1 or 2 -> means Superior 1 or Superior 2\
                if (response.portal_superior == 1){
                    console.log("superior 1");
                    //if so, path accordingly
                    path = process.env.PORTAL_DESTINATION + "/api/getSuperiorOne" ;
                    datasend = user_id;
                    const config = {headers:{['x-access-token']: token}};
                    return await axios.post(path, {data: datasend } , config)
                    .then(function (response) {
                        console.log("superior 1 response here");
                        return response.data.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        return null;
                    });
                } else if (response.portal_superior == 2){
                    //if so, path accordingly
                    path = process.env.PORTAL_DESTINATION + "/api/getSuperiorTwo" ;
                    datasend = user_id;
                    const config = {headers:{['x-access-token']: token}};
                    return await axios.post(path, {data: datasend } , config)
                    .then(function (response) {
                        return response.data.data;
                    })
                    .catch(function (error) {
                        console.log(error);
                        return null;
                    });
                } else {
                    //if not, check if portal_head_dept is 1
                    if (response.portal_head_dept == 1){
                        console.log("master user dept id " + response.portal_dept_id);
                        path = process.env.PORTAL_DESTINATION + "/api/getHeadDeptSingle" ;
                        datasend = response.portal_dept_id;
                        const config = {headers:{['x-access-token']: token}};
                        return await axios.post(path, {data: datasend } , config)
                        .then(function (response) {
                            return response.data.data;
                        })
                        .catch(function (error) {
                            console.log(error);
                            return null;
                        });
                    } else {
                        //error
                        console.log("Master User error - not a known data format");
                        return null;
                    }
                }
            }
        })
        
       
        var path = process.env.PORTAL_DESTINATION + "/api/getSuperiorOne" ;
        const config = {headers:{['x-access-token']: token}};
        return await axios.post(path, {data: user_id } , config)
        .then(function (response) {
            console.log("superior 1 response here");
            return response.data.data;
        })
        .catch(function (error) {
            console.log(error);
            return null;
        });
        
        

        //if portal hea ddept is 1, get portal dept id

        //get user id for the head of that dept id
        
        
    }
    */
}

module.exports = new masterUser()