const userModel = require("./userModel");
const pdf = require("pdf-creator-node");
const fs = require('fs');
const { response } = require("express");
const { json } = require("body-parser");

const user = {

    userList : (req, res)=>{
        userModel.getUserList((response,code) => {
            res.render('pages/user/userList',{
                title : 'User List',
                user : req.session.user,
                data : response,
                code : code 
            });
        });
    },

    userCreate : (req, res)=>{
        var listCompany, listLocation, listLevelAkses = [];
        userModel.getCompany((response,code) => {
            if (code == 1)
                listCompany = response;
            
            userModel.getLocation((response2,code2) => {
                if (code2 == 1)
                    listLocation = response2;

                userModel.getLevelAkses((response3,code3) => {
                    if (code3 == 1)
                        listLevelAkses = response3;
                    
                    res.render('pages/user/userCreate',{
                        title : 'Create New User',
                        user : req.session.user,
                        dataCompany : listCompany,
                        dataLocation : listLocation,
                        dataLevelAkses : listLevelAkses
                    });
                });
            });
        });
    },

    userCreateNew : (req, res)=>{
        //Might wanna use escape characters here
        req.body.user_edit_by = req.session.user.id;

        userModel.insertNewUser(req.body, (code) => {
            if (code === 1) {
                res.render('templates/responseTemplate',{
                    title : 'Success',
                    titleColor : 'green',
                    bodyTitle : "Berhasil menambah user baru",
                    bodyText : "User "+req.body.fullname+" telah berhasil ditambahkan",
                    linkBack : "/userCreate",
                    linkText : "Buat user baru lain",
                    user : req.session.user
                });
            } else {
                res.render('templates/responseTemplate',{
                    title : 'Failed',
                    titleColor : 'red',
                    bodyTitle : "Gagal menambah user baru",
                    bodyText : "User "+req.body.fullname+" gagal ditambahkan",
                    linkBack : "/userCreate",
                    linkText : "Buat user baru lain",
                    user : req.session.user
                });
            }
        });
    },

    userEditExisting : (req, res)=>{
        //Might wanna use escape characters here
        req.body.user_edit_by = req.session.user.id;

        userModel.editExistingUser(req.body, (code) => {
            if (code === 1) {
                res.render('templates/responseTemplate',{
                    title : 'Success',
                    titleColor : 'green',
                    bodyTitle : "Berhasil mengedit user",
                    bodyText : "User "+req.body.fullname+" telah berhasil diedit",
                    linkBack : "/userList",
                    linkText : "Kembali ke user list",
                    user : req.session.user
                });
            } else {
                res.render('templates/responseTemplate',{
                    title : 'Failed',
                    titleColor : 'red',
                    bodyTitle : "Gagal mengedit user",
                    bodyText : "User "+req.body.fullname+" gagal diedit",
                    linkBack : "/userList",
                    linkText : "Kembali ke user list",
                    user : req.session.user
                });
            }
        });
    },

    userEdit : (req, res)=>{
        var listCompany, listLocation, listLevelAkses = [];
        userModel.getCompany((response,code) => {
            if (code == 1)
                listCompany = response;
            
            userModel.getLocation((response2,code2) => {
                if (code2 == 1)
                    listLocation = response2;

                userModel.getLevelAkses((response3,code3) => {
                    if (code3 == 1)
                        listLevelAkses = response3;
                    
                    var data = { user_id : req.params.id }

                    userModel.getUserListWithID(data,(response,code) => {
                        res.render('pages/user/userEdit',{
                            title : 'Edit User',
                            user : req.session.user,
                            data : response[0],
                            dataCompany : listCompany,
                            dataLocation : listLocation,
                            dataLevelAkses : listLevelAkses
                        });
                    });
                });
            });
        });
    },

    userDelete : (req, res)=>{
        var data = {
            user_id : req.params.id,
            user_edit_by : req.session.user.id
        }
        userModel.deleteUser(data, (code) => {
            if (code === 1) {
                userModel.getUserList((response,code) => {
                    res.render('pages/user/userList',{
                        title : 'User List',
                        user : req.session.user,
                        data : response,
                        code : code,
                        status : "Sukses Mengganti status",
                        statusColor : "green"
                    });
                });
            } else {
                userModel.getUserList((response,code) => {
                    res.render('pages/user/userList',{
                        title : 'User List',
                        user : req.session.user,
                        data : response,
                        code : code,
                        status : "Gagal Mengganti status",
                        statusColor : "merah"
                    });
                });
            }
        })
    },
}

module.exports = user