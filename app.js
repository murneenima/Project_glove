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

// =====================================================================

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


// ################################## Schedule #######################
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
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaa')
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
        console.log('saving data to table current')
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
            console.log('success to save data in table month')
            //res.send(doc)
            res.render('admin_addStaffSchedule.hbs')
        }, (err) => {
            res.status(400).send(err)
        })
    }, (err) => {
        res.status(400).send(err)
    })
})

//  Daily Schedule get staff to dailay , current table
// !!!!!!!!! run every midnight !!!!!!!!!!!!!! 
var j = schedule.scheduleJob('06 * * * *', function () {
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
                console.log('schedule success')
                Schedule.findOne({ s_badgeNo: obj[i].s_badgeNo }, function (err, data) {
                    if (data) {
                        data.s_day = day
                        data.s_month = month
                        data.s_year = year
                        data.save(function (err) {
                            if (err) // do something
                                console.log('is fail to update date')
                            else
                                console.log('is UPdated date')
                        });
                    } else {
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

// manage staff schedule เปลี่ยน status

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
    let date = moment().format('dddd');
    let day = moment().format('DD');
    let month = moment().format('MMMM')
    let year = moment().format('YYYY')
    console.log(req.body.badge1)

    Current.findOne({ c_badgeNo: req.body.badge1 }).then((d) => {
        //console.log(d)
        console.log(d.c_name)
        name = d.c_name
        surname = d.c_surname
        console.log(req.body.badge1)
        console.log(name)
        console.log(surname)
        console.log(date)
        console.log(day)
        console.log(month)
        console.log(year)
        console.log(req.body.block1)
        console.log(req.body.productline1)
        console.log(req.body.productname1)
        console.log(req.body.producttype1)
        console.log(req.body.productsize1)
        console.log(req.body.length1)
        console.log(req.body.weight1)
        console.log(req.body.linespeed1)

        let newSpotscheck = Spotcheck({
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
            console.log('success to save data on SPOTCHECK table')
            res.render('test_form.hbs')
            var length = req.body.length1
            var weight = req.body.weight1
            console.log(length)
            console.log(weight)

            // var product_split = req.body.product_name
            // var name = product_split.split('-')
            // var product_type = name[0]
            // var product_id = name[1]

            // console.log(product_type)
            // console.log(product_id)

            Product.findOne({ product_type: req.body.producttype1, product_name: req.body.productname1 }).then((d) => {
                if (length > d.length_max) {
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
                    if (length < d.length_min) {
                        console.log('!!!!!Over length !!!!!')
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
                                message: 'Product Name : ' + d.product_name + '-' + d.product_type + '  SIZE : ' + d.product_size + ' is UNDER LENGTH !!!!!', //ข้อความที่จะส่ง

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
                if (weight < d.weight_min) {
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
                    if (weight > d.weight_min) {
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
                
            }, (err) => {
                res.status(400).send(err)
            })

        }, (err) => {
            res.status(400).send(err)
        })


    }, (err) => {
        res.status(400).send(err)
    })
})


//######################################## Log Out ##############################################


//########################################  Port #################################################
app.listen(3000, () => {
    console.log(' ##### listening on port 3000 #####')
})