const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const hbs = require('hbs')
var moment = require('moment');
var schedule = require('node-schedule');

// ============== require Model ===============
var Admin = require('./AdminModel')
var Staff = require('./StaffModel')
var Block = require('./BlockModel')
var Product = require('./ProductModel')
var Schedule = require('./ScheduleModel') // weekly
var Current = require('./CurrentModel')
var Month = require('./MonthModel')
var Spotcheck = require('./SpotcheckModel')

// =============== Connect =========================
mongoose.connect('mongodb://localhost:27017/gloveDB').then((doc) => {
    console.log('@@@@ Success to connect with Database @@@')
}, (err) => {
    console.log('!!!!!!!!!! error to connect with database !!!!!!!!!')
})

var app = express()
app.use(bodyParser.json()) // ส่งข้อมูลแบบ JSon
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use((req, res, next) => { // allow the other to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader("Access-Control-Expose-Headers", "X-HMAC-CSRF, X-Secret, WWW-Authenticate");
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization, X-Access-Token')
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

//app.set('view engine', 'hbs');
//app.use(express.static('public'))


//============= API test============//
app.get('/', (req, res) => {
    res.send('hello')
})

// ########################################### STAFF ##################################################

// Sign Up 
app.post('/signup', (req, res) => {
    let newAdmin = new Admin({
        username: req.body.username,
        password: req.body.password
    })

    newAdmin.save().then((doc) => {
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

// Admin Login 
app.post('/signin', (req, res) => {
    let username = req.body.username1
    let password = req.body.password1

    Admin.find({
        username: username,
        password: password
    }).then((admin) => {
        if (admin.length == 1) {
            //res.send(admin)
            res.render('admin_dailyschedule.hbs')
        } else {
            res.status(400).send('Cannot Login')
        }
    }, (err) => {
        res.status(400).send(err)

    })
})

// insert staff 
app.post('/addstaff', (req, res) => {
    if (req.body.emp_position == 'Choose') {
        res.status(400).send('Position doesnot choose');
        return
    }

    if (req.body.emp_dept == 'Choose') {
        res.status(400).send('Department doesnot choose');
        return
    }

    // Position
    let emp_position = ' '
    if (req.body.emp_position == 'Excutive') {
        emp_position = 'Excutive';
    } else if (req.body.emp_position == 'Excutive II') {
        emp_position = 'Excutive II';
    } else if (req.body.emp_position == 'Officer') {
        emp_position = 'Officer';
    } else if (req.body.emp_position == 'Supervisor') {
        emp_position = 'Supervisor';
    } else if (req.body.emp_position == 'Admin/Secretary') {
        emp_position = 'Admin/Secretary'
    }
    //console.log('Position == ',req.body.emp_position)


    //-------- Department -------------

    let emp_dept = ' '
    if (req.body.emp_dept == 'Admin') {
        emp_dept = 'Admin';
    } else if (req.body.emp_dept == 'HR') {
        emp_dept = 'HR';
    } else if (req.body.emp_dept == 'Finance') {
        emp_dept = 'Finance';
    } else if (req.body.emp_dept == 'IT') {
        emp_dept = 'IT';
    }
    //console.log('Dept == ',req.body.emp_dept)

    let newStaff = Staff({
        badgeNo: req.body.badgeNo,
        emp_password: req.body.emp_password,
        emp_name: req.body.emp_name,
        emp_surname: req.body.emp_surname,
        emp_position: emp_position,
        emp_dept: emp_dept
    })
    newStaff.save().then((doc) => {
        console.log('success')
        res.render('admin_addStaff.hbs')
    }, (err) => {
        res.status(400).send(err)
    })

})

// update staff
app.post('/update', (req, res) => {

    let emp_dept = ' '
    if (req.body.emp_dept == 'Admin') {
        emp_dept = 'Admin';
    } else if (req.body.emp_dept == 'HR') {
        emp_dept = 'HR';
    } else if (req.body.emp_dept == 'Finance') {
        emp_dept = 'Finance';
    } else if (req.body.emp_dept == 'IT') {
        emp_dept = 'IT';
    }

    let emp_position = ' '
    if (req.body.emp_position == 'Excutive') {
        emp_position = 'Excutive';
    } else if (req.body.emp_position == 'Excutive II') {
        emp_position = 'Excutive II';
    } else if (req.body.emp_position == 'Officer') {
        emp_position = 'Officer';
    } else if (req.body.emp_position == 'Supervisor') {
        emp_position = 'Supervisor';
    } else if (req.body.emp_position == 'Admin/Secretary') {
        emp_position = 'Admin/Secretary'
    }
    console.log(req.body.badgeNo)
    console.log(req.body.emp_name)
    console.log(req.body.emp_surname)
    console.log(emp_dept)
    console.log(emp_position)


    Staff.findOne({ badgeNo: req.body.badgeNo }).then((d) => {
        d.emp_name = req.body.emp_name
        d.emp_surname = req.body.emp_surname
        d.emp_dept = emp_dept
        d.emp_position = emp_position

        d.save().then((success) => {
            // success.render('admin_manageStaffData.hbs')
            console.log('suuuuuuuccccccceeeeessssssss')

        }, (e) => {
            res.status(400).send(e)
        })
    }, (err) => {
        res.status(400).send(err)
    })
})

// remove staff data
app.post('/remove', (req, res) => {
    //let dataIn = JSON.parse(req.body)
    console.log('dataIn :', req.body.id)
    Staff.remove({ badgeNo: req.body.id }).then((d) => {
        console.log('=====success====')

    }, (err) => {
        res.status(400).send(err)
    })
})

// Send Data for display all 
app.get('/send_data', (req, res) => {
    Staff.find({}, (err, dataStaff) => {
        if (err) console.log(err);
    }).then((dataStaff) => {
        res.render('admin_manageStaffData.hbs', {
            dataStaff: encodeURI(JSON.stringify(dataStaff))
        })
    }, (err) => {
        res.status(400).send('error');
    })
})

//####################################### Product ##############################################
// addblock
app.post('/addblock', (req, res) => {
    let newBlock = Block({
        productLine: req.body.productLine,
        blockName: req.body.blockName,
        staff:req.body.staff
    })

    newBlock.save().then((doc) => {
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

// add Product
app.post('/addproduct', (req, res) => {

    let product_size = ''
    if (req.body.product_size == 'Choose') {
        res.status(400).send('Size doesnot choose');
        return
    }
    if (req.body.product_size == 'S') {
        product_size = 'S'
    } else if (req.body.product_size == 'M') {
        product_size = 'M'
    } else if (req.body.product_size == 'X') {
        product_size = 'X'
    } else if (req.body.product_size == 'XL') {
        product_size = 'XL'
    }

    let newProduct = Product({
        product_id: req.body.product_id,
        product_type: req.body.product_type,
        product_size: product_size,
        weight_min: req.body.weight_min,
        weight_max: req.body.weight_max,
        length_min: req.body.length_min,
        length_max: req.body.length_max
    })

    newProduct.save().then((doc) => {
        console.log('success')
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

// sent all product to display 
app.get('/send_product', (req, res) => {
    Product.find({}, (err, dataProduct) => {
        if (err) console.log(err)
    }).then((dataProduct) => {
        res.render('admin_allProduct.hbs', {
            dataProduct: encodeURI(JSON.stringify(dataProduct))
        })
    }, (err) => {
        res.status(400).send('error')
    })
})

// edit product data
app.post('/editproduct', (req, res) => {
    Product.findOne({ product_id: req.body.product_id }).then((d) => {
        d.weight_min = req.body.weight_min
        d.weight_max = req.body.weight_max
        d.length_min = req.body.length_min
        d.length_max = req.body.length_max

        d.save().then((success) => {
            console.log('Success')
        }, (e) => {
            res.status(400).send(e)
        }, (err) => {
            res.status(400).send(err)
        })
    })
})

// remove product data
app.post('/removeproduct', (req, res) => {
    console.log('dataIn :', req.body.id)
    Product.remove({ product_id: req.body.id }).then((d) => {
        console.log('Product deleted success')
    }, (err) => {
        res.status(400).send(err)
    })
})


// ######################################### Schedule #######################
// get staff data to add schedule
app.get('/send_staff', (req, res) => {
    Staff.find({}, (err, dataStaff) => {
        if (err) console.log(err);
    }).then((dataStaff) => {
        res.render('admin_addStaffSchedule.hbs', {
            dataStaff: encodeURI(JSON.stringify(dataStaff))
        })
    }, (err) => {
        res.status(400).send('error');
    })
})

// save weekly schedule 
app.post('/saveschedule', (req, res) => {
    let newSchedule = Schedule({
        day: req.body.day,
        s_badgeNo: req.body.edit_id,
        s_name: req.body.edit_name,
        s_surname: req.body.edit_surname,
        s_position: req.body.edit_position,
        s_department: req.body.edit_dept,
        s_status: req.body.s_status,
        s_day:req.body.s_day,
        s_month:req.body.s_month,
        s_year:req.body.s_year
    })
    newSchedule.save().then((doc) => {
        console.log('saving data to table current')
       res.send(doc)
        let newMonth = Month({
            m_day:req.body.day,
            m_badgeNo: req.body.edit_id,
            m_name: req.body.edit_name,
            m_surname: req.body.edit_surname,
            m_position: req.body.edit_position,
            m_department: req.body.edit_dept,
            m_status: req.body.s_status,
            m_date:req.body.m_day,
            m_month:req.body.m_month,
            m_year:req.body.m_year
        })
        newMonth.save().then((doc)=>{
            console.log('success to save data in table month')
            //res.send(doc)
            //res.render('admin_addStaffSchedule.hbs')
        },(err)=>{
            res.status(400).send(err)
        })
    }, (err) => {
        res.status(400).send(err)
    })
})

// ####################### Daily Schedule ######################
// !!!!!!!!! run every midnight !!!!!!!!!!!!!! 
var j = schedule.scheduleJob('03 * * * *', function () {
    var day_format = moment().format('dddd');
    console.log(day_format)

    var day = moment().format('DD');
    var month = moment().format('MMMM')
    var year = moment().format('YYYY')
    // console.log(day)
    // console.log(month)
    // console.log(year)

    Current.remove({}, function (err) {
        console.log('collection removed')
    });

    Schedule.find({ day: day_format }, (err, obj) => {    
        for (let i = 0; i < obj.length; i++) {
            var name = obj[i].s_name;
            console.log(name)
            let newCurrent = Current({
                current_day: obj[i].day,
                c_badgeNo: obj[i].s_badgeNo,
                c_name: obj[i].s_name,
                c_surname: obj[i].s_surname,
                c_position: obj[i].s_position,
                c_department: obj[i].s_department,
                c_status: obj[i].s_status,
                c_date:day,
                c_month:month,
                c_year:year
            })

            newCurrent.save().then((doc) => {
                console.log('schedule success')
                Schedule.findOne({s_badgeNo:obj[i].s_badgeNo},function(err,data){
                    if(data){
                        data.s_day = day
                        data.s_month = month
                        data.s_year = year 
                        data.save(function(err) {
                            if (err) // do something
                            console.log('is fail to update date')
                            else 
                            console.log('is UPdated date')
                        });
                    }else{
                        console.log(err);
                    }
                })
                
            }, (err) => {
                console.log('save data to Currnent Model error')
                res.status(400).send(err)
            })
        }
    })
});


// display daily schedule 
app.get('/dailyschedule', (req, res) => {
    Current.find({}, (err, staffschedule) => {
        if (err) console.log(err)
    }).then((staffschedule) => {
        res.render('admin_dailySchedule.hbs', {
            staffschedule: encodeURI(JSON.stringify(staffschedule))
        })
    }, (err) => {
        res.status(400).send('error')
    })
})

// ##################### Weekly Schedule #####################
// display weekly schedule
app.get('/weeklyschedule', (req, res) => {
    Schedule.find({}, (err, staffschedule) => {
        if (err) console.log(err)
    }).then((staffschedule) => {
        res.render('admin_weeklySchedule.hbs', {
            staffschedule: encodeURI(JSON.stringify(staffschedule))

        })
    }, (err) => {
        res.status(400).send('error')
    })
})

// ############################## User #################
//schedule user side
app.get('/userschedule', (req, res) => {
    Current.find({}, (err, staffschedule) => {
        if (err) console.log(err)
    }).then((staffschedule) => {
        res.render('user_schedule.hbs', {
            staffschedule: encodeURI(JSON.stringify(staffschedule))
        })
    }, (err) => {
        res.status(400).send('error')
    })
})


// user login fail
app.get('/userlogin', (req, res) => {
    res.render('user_login.hbs', {})
})


// check login
app.post('/check_login', (req, res) => {
    let badgeNo = req.body.badgeNo1
    let emp_password = req.body.password
    Current.findOne({ c_badgeNo: req.body.badgeNo1 }, function (err, result) {
        if (result) {
            Staff.find({
                badgeNo: badgeNo,
                emp_password: emp_password
            }).then((staff) => {
                if (staff.length == 1) {
                    console.log('login success')
                    res.render('user_insertform.hbs',{staff:encodeURI(JSON.stringify(staff))})
                } else {
                    console.log('error to checking login')
                }
            }, (err) => {
                res.status(400).send(err)
            })
        } else {
            console.log('error to find data pls login again')
            res.render('user_login.hbs', result)      
        }
    })
})

//################ Fuction ####################


//###################################### send block,line Form ############################# 

// app.get('/getdata',(req,res)=>{
//     Block.find({},(err,dataBlock)=>{
//         if(err) console.log(err)
//     }).then((dataBlock)=>{
//         res.render('',)
//     })
// })

//######################################## Log Out ##############################################
// app.get('/logout', function (req, res) {
//     delete req.session.user_id;
//     res.redirect('/login');
// });

//########################################  Port #################################################
app.listen(3000, () => {
    console.log(' ##### listening on port 3000 #####')
})