const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const hbs = require('hbs')
const moment = require('moment');
const request = require('request')
const schedule = require('node-schedule');

// ============== require Model ===============
var Admin = require('./AdminModel')
var Staff = require('./StaffModel')
var Block = require('./BlockModel')
var Product = require('./ProductModel')
var Schedule = require('./ScheduleModel') // weekly
var Current = require('./CurrentModel')
var Month = require('./MonthModel')
var Spotcheck = require('./SpotcheckModel')
var StdSize = require('./StdSizeModel')
var StdProductName = require('./StdProductNameModel')
var StdProductType = require('./StdProductTypeModel')
var StdLength = require('./StdLengthModel')
var StdWeight = require('./StdWeightModel')
var StdBlock = require('./StdBlockModel')
var StdProductline = require('./StdProductlineModel')
var Alert = require('./AlertModel')

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
            Current.find({}, (err, staffschedule) => {
                if (err) console.log(err)
            }).then((staffschedule) => {
                res.render('admin_dailySchedule.hbs', {
                    staffschedule: encodeURI(JSON.stringify(staffschedule))
                })
            }, (err) => {
                res.status(400).send('error')
            })
        } else {
            res.status(400).send('Cannot Login')
        }
    }, (err) => {
        res.status(400).send(err)

    })
})


// ####################################### Staff #############################################
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

    Schedule.findByIdAndRemove({ badgeNo: req.body.id }).then((d) => {
        console.log('=====success remove in table shedule ====')

    }, (err) => {
        res.status(400).send(err)
    })
    Month.findOneAndRemove({ badgeNo: req.body.id }).then((d) => {
        console.log('=====success remove in table shedule ====')

    }, (err) => {
        res.status(400).send(err)
    })

})


// ################################## Staff page // แสดงผลพนักงานทั้งหมด ####################
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

// ################################ daily schedule ######################################
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


// ##################### Weekly Schedule ##############################################
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

//####################################### add value ##############################################
// add size
app.post('/addsize', (req, res) => {
    let newSize = new StdSize({
        std_size: req.body.size
    })

    newSize.save().then((doc) => {
        console.log('success')
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})
// add addpdname
app.post('/addpdname', (req, res) => {
    let newStdProductName = new StdProductName({
        std_productname: req.body.std_productname
    })

    newStdProductName.save().then((doc) => {
        console.log('success')
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})
// add addpdtype
app.post('/addpdtype', (req, res) => {
    let newStdProductType = new StdProductType({
        std_producttype: req.body.std_producttype
    })

    newStdProductType.save().then((doc) => {
        console.log('success')
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})
// add add length
app.post('/addlength', (req, res) => {
    let newStdLength = new StdLength({
        std_length: req.body.std_length
    })

    newStdLength.save().then((doc) => {
        console.log('success')
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})
// add add weight
app.post('/addweight', (req, res) => {
    let newStdWeight = new StdWeight({
        std_weight: req.body.std_weight
    })

    newStdWeight.save().then((doc) => {
        console.log('succes')

    }, (err) => {
        res.status(400).send(err)
    })
})

// add std block
app.post('/addblock', (req, res) => {
    let newStdBlock = new StdBlock({
        std_block: req.body.block
    })

    newStdBlock.save().then((doc) => {
        console.log('succes')
    }, (err) => {
        res.status(400).send(err)
    })
})

// add productline
app.post('/addproductline', (req, res) => {
    let newStdProductline = new StdProductline({
        std_productline: req.body.productline
    })

    newStdProductline.save().then((doc) => {
        console.log('succes')
    }, (err) => {
        res.status(400).send(err)
    })
})

// export all value for adding product
app.get('/sendvalue', (req, res) => {
    let data = {}

    StdSize.find({}, (err, Size) => {
        if (err) console.log('error')
    }).then((Size) => {
        data.Size = Size

        StdProductName.find({}, (err, ProductName) => {
            if (err) console.log('error')
        }).then((ProductName) => {
            data.ProductName = ProductName

            StdProductType.find({}, (err, ProductType) => {
                if (err) console.log('error')
            }).then((ProductType) => {
                data.ProductType = ProductType

                StdLength.find({}, (err, Length) => {
                    if (err) console.log('error')
                }).then((Length) => {
                    data.Length = Length

                    StdWeight.find({}, (err, Weight) => {
                        if (err) console.log('error')
                    }).then((Weight) => {
                        data.Weight = Weight
                        res.render('admin_addProduct.hbs', { data: encodeURI(JSON.stringify(data)) })
                    }, (err) => {
                        res.status(400).send(err)
                    })
                })

            })
        })
    })
})


// #################################################### add Block page #######################################
//adddblock_productline
app.post('/adddblock_productline', (req, res) => {
    let newBlock = new Block({
        blockName: req.body.block,
        productLine: req.body.productline
    })

    newBlock.save().then((doc) => {
        console.log('succes to saving in BLOCK ')
    }, (err) => {
        res.status(400).send(err)
    })
})

// add product line to block
app.get('/sendblock', (req, res) => {
    let data = {}
    StdBlock.find({}, (err, Block) => {
        if (err) console.log('error')
        data.Block = Block
    }).then((Block) => {
        StdProductline.find({}, (err, ProductLine) => {
            if (err) console.log('error')
        }).then((Productline) => {
            data.Productline = Productline
            res.render('admin_addBlock.hbs', { data: encodeURI(JSON.stringify(data)) })
        }, (err) => {
            res.status(400).send(err)
        })
    })
})

// ################################# add product ###############################################
// add product
app.post('/addproduct', (req, res) => {
    let newProduct = new Product({
        product_id: req.body.product_id,
        product_name: req.body.product_name,
        product_type: req.body.product_type,
        product_size: req.body.product_size,
        weight_min: req.body.weight_min,
        weight_max: req.body.weight_max,
        length_min: req.body.length_min,
        length_max: req.body.length_max
    })

    newProduct.save().then((doc) => {
        //console.log(doc)

        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

// ####################################### All Product ###############################################
//sent all product to display 
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


// ################################## manage staff Schedule #######################
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
    
    let newSchedule = new Schedule({
        day: req.body.day,
        s_badgeNo: req.body.edit_id,
        s_name: req.body.edit_name,
        s_surname: req.body.edit_surname,
        s_position: req.body.edit_position,
        s_department: req.body.edit_dept,
        s_status: req.body.s_status,
        s_day: req.body.s_day,
        s_month: req.body.s_month,
        s_year: req.body.s_year
    })
    newSchedule.save().then((doc) => {
        console.log('saving data to table SCHEDULE')
        let newMonth = new Month({
            m_day: req.body.day,
            m_badgeNo: req.body.edit_id,
            m_name: req.body.edit_name,
            m_surname: req.body.edit_surname,
            m_position: req.body.edit_position,
            m_department: req.body.edit_dept,
            m_status: req.body.s_status,
            m_date: req.body.m_day,
            m_month: req.body.m_month,
            m_year: req.body.m_year
        })
        newMonth.save().then((doc) => {
            console.log('success to save data in table MONTH                                                                                                           ')
            //res.send(doc)
            Staff.find({}, (err, dataStaff) => {
                if (err) console.log(err);
            }).then((dataStaff) => {
                res.render('admin_addStaffSchedule.hbs', {
                    dataStaff: encodeURI(JSON.stringify(dataStaff))
                })
            })
        }, (err) => {
            res.status(400).send(err)
        })
    }, (err) => {
        res.status(400).send(err)
    })
})

//  Daily Schedule get staff to dailay , current table
// !!!!!!!!! run every midnight !!!!!!!!!!!!!! 
var j = schedule.scheduleJob('35 * * * *', function () {
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
                c_date: day,
                c_month: month,
                c_year: year
            })

            newCurrent.save().then((doc) => {
                Schedule.findOne({ s_badgeNo: obj[i].s_badgeNo }, function (err, data) {
                    if (data) {
                        data.s_day = day
                        data.s_month = month
                        data.s_year = year
                        data.save(function (err) {
                            if (err) // do something
                                console.log('is fail to update date on SCHEDULE table // (weekly)')
                            else
                                console.log('is UPdated date on SCHEDULE table // (weekly)')
                        });
                    } else {
                        console.log(err);
                    }
                })

                Month.findOne({ m_badgeNo: obj[i].s_badgeNo }, function (err, datamonth) {
                    if (datamonth) {
                        datamonth.m_date = day
                        datamonth.m_month = month
                        datamonth.m_year = year
                        datamonth.save(function (err) {
                            if (err) // do something
                                console.log('is fail to update date on MONTH table')
                            else
                                console.log('is UPdated date MONTH table')
                        });
                    } else {
                        console.log(err);
                    }
                })

            }, (err) => {
                console.log('save data to Current Model error')
                res.status(400).send(err)
            })
        }
    })
});



// ##################### manage staff Schedule ###############
// saveschedule


// ############################## User #################
//schedule user side
app.get('/userschedule', (req, res) => {
    let user = {};
    Current.find({}, (err, staffschedule) => {
        if (err) console.log(err)
    }).then((staffschedule) => {
        user.staffschedule = staffschedule

        Block.find({}, (err, block) => {
            if (err) console.log(err)
        }).then((block) => {
            user.block = block
            res.render('user_schedule.hbs', {
                user: encodeURI(JSON.stringify(user))
            })
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
    let data = {}
    let badgeNo = req.body.badgeNo1
    let emp_password = req.body.password
    Current.findOne({ c_badgeNo: req.body.badgeNo1 }, function (err, result) {
        if (result) {
            Staff.find({
                badgeNo: badgeNo,
                emp_password: emp_password
            }).then((staff) => {
                if (staff.length == 1) {
                    data.Staff = staff
                    //console.log(staff)
                    console.log('login success')

                    // block 
                    StdBlock.find({}, (err, datablock) => {
                        if (err) console.log(err)
                    }).then((datablock) => {
                        data.StdBlock = datablock

                        // product bame , prduct type
                        Product.find({}, (err, dataproduct) => {
                            if (err) console.log(err)
                        }).then((dataproduct) => {
                            data.Product = dataproduct

                            //  Size
                            StdSize.find({}, (err, datasize) => {
                                if (err) console.log(err)
                            }).then((datasize) => {
                                data.StdSize = datasize

                                // Std Length
                                StdLength.find({}, (err, datalength) => {
                                    if (err) console.log(err)
                                }).then((datalength) => {
                                    data.StdLength = datalength


                                    //Std weight
                                    StdWeight.find({}, (err, dataweight) => {
                                        if (err) console.log(err)
                                    }).then((dataweight) => {
                                        data.StdWeight = dataweight

                                        StdProductline.find({}, (err, dataproductline) => {
                                            if (err) console.log(err)
                                        }).then((dataproductline) => {
                                            data.StdProductline = dataproductline

                                            StdProductName.find({}, (err, dataProductname) => {
                                                if (err) console.log(err)
                                            }).then((dataProductname) => {
                                                data.StdProductName = dataProductname

                                                StdProductType.find({}, (err, producttype) => {
                                                    if (err) console.log(err)
                                                }).then((producttype) => {
                                                    data.StdProductType = producttype
                                                    res.render('test_form.hbs', { data: encodeURI(JSON.stringify(data)) })
                                                }, (err) => {
                                                    res.status(400).send(err)
                                                })
                                            })
                                        })
                                    })

                                })

                            })

                        })
                    })

                } else {
                    console.log('error to checking login')
                    res.render('user_login.hbs', {})
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


// save_data when fill information and line notify
app.post('/save_data', (req, res) => {

    let name = "";
    let surname = "";
    let badgeNo = ""
    let time = moment().format('LT');
    let date = moment().format('dddd');
    let day = moment().format('DD');
    let month = moment().format('MMMM')
    let year = moment().format('YYYY')

    if (req.body.block1 && req.body.productline1 && req.body.productname1 && req.body.producttype1 && req.body.productsize1
        && req.body.length1 && req.body.weight1 && req.body.linespeed1) {
        Current.findOne({ c_badgeNo: req.body.badge1 }).then((c) => {

            name = c.c_name
            surname = c.c_surname

            var length1 = req.body.length1
            var weight1 = req.body.weight1
            console.log(length1)
            console.log(weight1)

            Product.findOne({ product_type: req.body.producttype1, product_name: req.body.productname1 }).then((d) => {

                Block.findOne({ productLine: req.body.productline1 }, function (err, data) {
                    if (data) {
                        data.badgeNo = c.c_badgeNo
                        data.save(function (err) {
                            if (err)
                                console.log('== Fail to update badgeNo in Block table ')
                            else
                                console.log('== Success to update badgeNo in Block table ')
                        })
                    } else {
                        console.log(err)
                    }

                })

                let length_min = parseFloat(d.length_min);
                let length_max = parseFloat(d.length_max);
                let weight_min = parseFloat(d.weight_min);
                let weight_max = parseFloat(d.weight_max);

                //Chack length 
                if (length1 > length_max) {
                    console.log('!!!!!OVER length !!!!!')
                    request({
                        method: 'POST',
                        uri: 'https://notify-api.line.me/api/notify',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        auth: {
                            bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
                        },
                        form: {
                            message: 'Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is OVER LENGTH !!!!! ', //ข้อความที่จะส่ง

                        },
                    }, (err, httpResponse, body) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(body)
                        }
                    })
                }
                if (length1 < length_min) {
                    console.log('!!!!!UNDER length !!!!!')
                    request({
                        method: 'POST',
                        uri: 'https://notify-api.line.me/api/notify',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        auth: {
                            bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
                        },
                        form: {
                            message: 'Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is UNDER LENGTH !!!!! น้อยกว่ามาตรฐาน', //ข้อความที่จะส่ง

                        },
                    }, (err, httpResponse, body) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(body)
                        }
                    })
                }

                // Check Weight
                if (weight1 < weight_min) {
                    console.log(' !!!! UNDER weight !!!!!')
                    request({
                        method: 'POST',
                        uri: 'https://notify-api.line.me/api/notify',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        auth: {
                            bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
                        },
                        form: {
                            message: 'Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is UNDER WEIGHT !!!!!', //ข้อความที่จะส่ง

                        },
                    }, (err, httpResponse, body) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(body)
                        }
                    })

                }
                if (weight1 > weight_max) {
                    console.log(' !!!! Over weight !!!!!')
                    request({
                        method: 'POST',
                        uri: 'https://notify-api.line.me/api/notify',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        auth: {
                            bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
                        },
                        form: {
                            message: 'Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is OVER WEIGHT !!!!!', //ข้อความที่จะส่ง

                        },
                    }, (err, httpResponse, body) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(body)
                        }
                    })

                }

                if (length1 > length_max || length1 < length_min || weight1 < weight_min || weight1 > weight_max) {
                    let newAlert2 = new Alert({
                        a_time: time,
                        a_day: day,
                        a_date: date,
                        a_month: month,
                        a_year: year,
                        a_badgeNo: c.c_badgeNo,
                        a_name: name,
                        a_surname: surname,
                        a_dept: c.c_department,
                        a_block: req.body.block1,
                        a_productline: req.body.productline1,
                        a_productID: d.product_id,
                        a_productName: d.product_name,
                        a_productType: d.product_type,
                        a_stdlength_min: d.length_min,
                        a_stdlength_max: d.length_max,
                        a_stdweight_min: d.weight_min,
                        a_stdweight_max: d.weight_max,
                        a_length: req.body.length1,
                        a_weight: req.body.weight1,
                        a_linespeed: req.body.linespeed1
                    })
                    newAlert2.save().then((doc) => {
                        console.log('saving data to ALERT table success')
                    })
                }



            }, (err) => {
                res.status(400).send(err)
            })

            let newSpotscheck = new Spotcheck({
                spot_badge: req.body.badge1,
                spot_name: name,
                spot_surname: surname,
                spot_date: date,
                spot_day: day,
                spot_month: month,
                spot_year: year,
                spot_block: req.body.block1,
                spot_productline: req.body.productline1,
                spot_productname: req.body.productname1,
                spot_producttype: req.body.producttype1,
                spot_size: req.body.productsize1,
                spot_length: req.body.length1,
                spot_weight: req.body.weight1,
                spot_linespeed: req.body.linespeed1
            })
            newSpotscheck.save().then((doc) => {
                console.log('success to save data on SPOTCHECK ====1==== table')

                let check = "checked"
                // save status to Current block 
                Current.findOne({ c_badgeNo: req.body.badge1 }, function (err, current) {
                    if (current) {
                        current.c_status = check
                        current.save(function (err) {
                            if (err) // do something
                                console.log('is fail to update status on CURRENT table')
                            else
                                console.log('is UPdated status on CURRENT table')

                            // save status to Current block 
                            Schedule.findOne({ s_badgeNo: req.body.badge1 }, function (err, schedule) {
                                if (schedule) {
                                    schedule.s_status = check
                                    schedule.save(function (err) {
                                        if (err) // do something
                                            console.log('is fail to update status on SCHEDULE table')
                                        else
                                            console.log('is UPdated status on SCHEDULE table')
                                    });
                                } else {
                                    console.log(err)
                                }
                            })
                        });
                    } else {
                        console.log(err)
                    }
                })


                res.render('user_success.hbs')
            })
        })
    } else {
        res.send('Please fill corrrect information in form 1')
    }

    // =================================================================================//
    //save form 2 
    // if (req.body.block2 && req.body.productline2 && req.body.productname2 && req.body.producttype2 && req.body.productsize2 && req.body.length2 && req.body.weight2 && req.body.linespeed2) {
    //     Current.findOne({ c_badgeNo: req.body.badge1 }).then((d) => {
    //         let length2 = parseFloat(req.body.length2)
    //         let weight2 = parseFloat(req.body.weight2)
    //         console.log(length2)
    //         console.log(weight2)

    //         name = d.c_name
    //         surname = d.c_surname
    //         Product.findOne({ product_type: req.body.producttype2, product_name: req.body.productname2 }).then((d) => {
    //             let length_min2 = parseFloat(d.length_min)
    //             let length_max2 = parseFloat(d.length_max)
    //             let weight_min2 = parseFloat(d.weight_min)
    //             let weight_max2 = parseFloat(d.weight_max)

    //             //check length 
    //             if (length2 > length_max2) {
    //                 console.log('!!!!!OVER length 2 !!!!!')

    //                 request({
    //                     method: 'POST',
    //                     uri: 'https://notify-api.line.me/api/notify',
    //                     header: {
    //                         'Content-Type': 'application/x-www-form-urlencoded',
    //                     },
    //                     auth: {
    //                         bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
    //                     },
    //                     form: {
    //                         message: '*** Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is OVER LENGTH !!!!! ', //ข้อความที่จะส่ง

    //                     },
    //                 }, (err, httpResponse, body) => {
    //                     if (err) {
    //                         console.log(err)
    //                     } else {
    //                         console.log(body)
    //                     }
    //                 })
    //             }
    //             if (length2 < length_min2) {
    //                 console.log('!!!!!UNDER length 2 !!!!!')

    //                 request({
    //                     method: 'POST',
    //                     uri: 'https://notify-api.line.me/api/notify',
    //                     header: {
    //                         'Content-Type': 'application/x-www-form-urlencoded',
    //                     },
    //                     auth: {
    //                         bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
    //                     },
    //                     form: {
    //                         message: '*** Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is UNDER LENGTH !!!!!', //ข้อความที่จะส่ง

    //                     },
    //                 }, (err, httpResponse, body) => {
    //                     if (err) {
    //                         console.log(err)
    //                     } else {
    //                         console.log(body)
    //                     }
    //                 })
    //             }

    //             // Check Weight
    //             if (weight2 < weight_min2) {
    //                 console.log(' !!!! UNDER weight 2 !!!!!')

    //                 request({
    //                     method: 'POST',
    //                     uri: 'https://notify-api.line.me/api/notify',
    //                     header: {
    //                         'Content-Type': 'application/x-www-form-urlencoded',
    //                     },
    //                     auth: {
    //                         bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
    //                     },
    //                     form: {
    //                         message: '*** Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is UNDER WEIGHT !!!!!', //ข้อความที่จะส่ง

    //                     },
    //                 }, (err, httpResponse, body) => {
    //                     if (err) {
    //                         console.log(err)
    //                     } else {
    //                         console.log(body)
    //                     }
    //                 })

    //             }
    //             if (weight2 > weight_max2) {
    //                 console.log(' !!!! Over weight 2 !!!!!')

    //                 request({
    //                     method: 'POST',
    //                     uri: 'https://notify-api.line.me/api/notify',
    //                     header: {
    //                         'Content-Type': 'application/x-www-form-urlencoded',
    //                     },
    //                     auth: {
    //                         bearer: 'lZCZt4ehQD2q68XKhkgEMcHYs4yncRuM5VX0LSzaOrb', //token
    //                     },
    //                     form: {
    //                         message: '*** Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is OVER WEIGHT !!!!!', //ข้อความที่จะส่ง

    //                     },
    //                 }, (err, httpResponse, body) => {
    //                     if (err) {
    //                         console.log(err)
    //                     } else {
    //                         console.log(body)
    //                     }
    //                 })

    //             }

    //         }, (err) => {
    //             res.status(400).send(err)
    //         })

    //         let newSpotscheck2 = new Spotcheck({
    //             spot_badge: req.body.badge1,
    //             spot_name: name,
    //             spot_surname: surname,
    //             spot_date: date,
    //             spot_day: day,
    //             spot_month: month,
    //             spot_year: year,
    //             spot_block: req.body.block2,
    //             spot_productline: req.body.productline2,
    //             spot_productname: req.body.productname2,
    //             spot_producttype: req.body.producttype2,
    //             spot_size: req.body.productsize2,
    //             spot_length: req.body.length2,
    //             spot_weight: req.body.weight2,
    //             spot_linespeed: req.body.linespeed2
    //         })
    //         newSpotscheck2.save().then((doc) => {
    //             console.log('success to save data on SPOTCHECK  table ============2===========')

    //         })
    //     })
    // }





})



// function saveAlert2() {
//     let newAlert2 = new Alert({
//         a_time: time,
//         a_day: day,
//         a_date: date,
//         a_month: month,
//         a_year: year,
//         a_badge: badgeNo,
//         a_name: name,
//         a_surname: surname,
//         a_dept: c.c_department,
//         a_block: req.body.block1,
//         a_productline: req.body.productline2,
//         a_productID: d.product_id,
//         a_productName: d.product_name,
//         a_productType: d.product_type,
//         a_stdlength_min: d.length_min,
//         a_stdlength_max: d.length_max,
//         a_stdweight_min: d.weight_min,
//         a_stdweight_max: d.weight_max,
//         a_length: req.body.length2,
//         a_weight: req.body.weight2,
//         a_linespeed: req.body.linespeed1
//     })
//     newAlert2.save().then((doc) => {
//         console.log('saving data to ALERT table success')
//     }, (err) => {
//         res.send(400).send(err)
//     })
// }


//######################################## Log Out ##############################################


//########################################  Port #################################################
app.listen(3000, () => {
    console.log(' ##### listening on port 3000 #####')
})