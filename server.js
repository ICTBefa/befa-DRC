require('dotenv').config()
const express = require('express')
const app = express()
const session = require('express-session');
const port = process.env.APP_PORT;
const route = require('./modules/route');
const path = require('path');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fileUploadLimit = process.env.FILE_UPLOAD_LIMIT || '20MB';
const saveToPath = './public/' + process.env.DOWNLOAD_FOLDER_NAME;
const cronFrequency = `*/${process.env.CRON_FREQUENCY_MINUTES} * * * *`;
const fileLifespan = process.env.FILE_LIFESPAN_MINUTES * 60000;

const cron = require('node-cron');
const { exec } = require('child_process');

// Set cron job: misalnya setiap hari jam 01:10 (bisa disesuaikan)
cron.schedule('12 10 * * *', () => {
  console.log('[CRON] Running scheduled job at', new Date());
  exec('node job-runner-epica.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running job: ${error.message}`);
    } else {
      console.log(`Job stdout: ${stdout}`);
      if (stderr) console.error(`Job stderr: ${stderr}`);
    }
  });
});

//JQuery
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

var fs = require('fs');
var util = require('util');

var log_file = fs.createWriteStream(__dirname + '/logs/debug_'+getDay()+'.log', {flags : 'a+'});
var log_stdout = process.stdout;

console.log = function(d) { //
    log_file.write(getDate() + ": " + util.format(d) + '\n');
    log_stdout.write(getDate() + ": " + util.format(d) + '\n');
};

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

function getDate() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = ("0" + date_ob.getHours()).slice(-2);
    let minutes = ("0" + date_ob.getMinutes()).slice(-2);
    let seconds = ("0" + date_ob.getSeconds()).slice(-2);

    let dateArray = date_ob.toString().split(" ");
    let gmt = dateArray[5];

    let dates = year + "-" + month + "-" + date + " " + hours + ":" 
    + minutes + ":" + seconds + " " + gmt ;
    return dates;
}

function getDay() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    let dates = year + "_" + month + "_" + date;
    return dates;
}

function CheckIfNullEpicaList(str) {
    //console.log("str before cut = " + str);
    str = str.slice(3);// remove first 3 char
    str = str.replace(/\s/g,'');
    //console.log("str after cut = " + str);
    return str === null || str.match(/^ *$/) !== null;
}


app.use(express.json({limit: "5mb", extended: true}))
app.use(express.urlencoded({limit: "5mb", extended: true, parameterLimit: 500000}))


app.use(cors({
    origin: '*'
}))

app.use(session({
    secret: 'mySecret',
    saveUninitialized: true,
    resave: true,
}));

//view engine setup using HBS
app.set('views', path.join(__dirname, '/views/'));
app.set('view engine','hbs');
app.engine('hbs', hbs({
    helpers: {
                section: function(name, options){
                    if(!this._sections) this._sections = {};
                    this._sections[name] = options.fn(this);
                    return null;
                },
                toJSON : function(object) {
                    return JSON.stringify(object);
                },
                JSONParse : function(object) {
                    return JSON.parse(object);
                },
                select : function( value, options ) {
                    var $el = $('<select />').html( options.fn(this) );
                    $el.find('[value="' + value + '"]').attr({'selected':'selected'});
                    return $el.html();
                },
                inc :  function(value, options) {
                    return parseInt(value) + 1;
                },
                gmt :  function(value, options) {
                    var plusminus = "";
                    if (value <= 0) {
                        plusminus = "+";
                        value = Math.abs(value);
                    } else {
                        plusminus = "-"
                    }
                    var timezone = Math.floor(value / 60);
                    if (timezone < 10)
                        timezone = "0"+timezone;
                    
                    var back = (value % 60);
                    if (back == 0)
                    back = '00';

                    var result = "GMT" + plusminus + timezone + ':' +back;
                    return result;
                },
                if_equal : function(a, b, opts) {
                    if (a == b) {
                        return opts.fn(this)
                    } else {
                        return opts.inverse(this)
                    }
                },
                eq : function(){
                    const args = Array.prototype.slice.call(arguments, 0, -1);
                    return args.every(function (expression) {
                        return args[0] === expression;
                    });
                },
                times : function(n, block){
                    var accum = '';
                    for(var i = 0; i < n; ++i) {
                        block.data.index = i;
                        block.data.ipone = i + 1;
                        block.data.first = i === 0;
                        block.data.last = i === (n - 1);
                        accum += block.fn(this);
                    }
                    return accum;
                },
                setVar : function (varName, varValue) {
                    this[varName] = varValue;
                },
                incVar : function (varName) {
                    this[varName] = parseInt(this[varName]) + 1;
                },
                decVar : function (varName) {
                    this[varName] = parseInt(this[varName]) - 1;
                },
                loop :  function(value, options) {
                    return (3 - parseInt(value));
                },
                removeBr : function(string) {
                    try{
                        let res = string.split("</p>");
                        for (let i = 0; i< 3; i ++){
                            if (CheckIfNullEpicaList(res[0])){
                                try{
                                    res[0] = res[i+1];
                                } catch {
                                    console.log("Error removeBr, i = " + i );
                                    res[0] = res[0];
                                }
                            } else {
                                break;
                            }
                        }
                        return res[0];
                    }
                    catch{
                        return string;
                    }
                },
            },
    // helpers :  require('./views/helpers').helpers,
    extname : 'hbs',
    defaultLayout : 'template',
}));
// set static folder for public
app.use(express.static(path.join(__dirname, 'public')));

//add file upload with limit in env
app.use(fileUpload({
    limits: { fileSize: fileUploadLimit }
  }));

// set route here
app.use(route)
const server = app.listen(port,()=>{
    console.log('Server running on localhost:' + port);
});





