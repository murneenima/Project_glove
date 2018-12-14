const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const hbs = require('hbs')
var moment = require('moment');

// ============== require Model ===============
var Admin = require('./AdminModel')
var Staff = require('./StaffModel')
var Block = require('./BlockModel')
var Product = require('./ProductModel')
var Schedule = require('./ScheduleModel')
var Current = require('./CurrentModel')

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

// ####################################3####### STAFF ##################################################

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
            res.send(admin)
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

// test
app.post('/test-post', (req, res) => {
    // let dataIn = JSON.parse(req.body) // string to json
    console.log('dataIn:', req.body.id)
    res.send('done')
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
        blockName: req.body.blockName
    })

    newBlock.save().then((doc) => {
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

// add Product
app.post('/addproduct',(req,res)=>{

    let product_size = ''
    if(req.body.product_size == 'Choose'){
        res.status(400).send('Size doesnot choose');
        return
    }
    if(req.body.product_size == 'S'){
        product_size = 'S'
    }else if(req.body.product_size == 'M'){
        product_size = 'M'
    }else if(req.body.product_size == 'X'){
        product_size = 'X'
    }else if(req.body.product_size == 'XL'){
        product_size = 'XL'
    }

    let newProduct = Product ({
        product_id:req.body.product_id,
        product_type:req.body.product_type,
        product_size:product_size,
        weight_min:req.body.weight_min,
        weight_max:req.body.weight_max,
        length_min:req.body.length_min,
        length_max:req.body.length_max

    })

    newProduct.save().then((doc)=>{
        console.log('success')
        res.send(doc)
    },(err)=>{
        res.status(400).send(err)
    })
})

// sent all product to display 
app.get('/send_product',(req,res)=>{
    Product.find({},(err,dataProduct)=>{
        if (err) console.log(err)
    }).then((dataProduct)=>{
        res.render('admin_allProduct.hbs',{
            dataProduct:encodeURI(JSON.stringify(dataProduct))
        })
    },(err)=>{
        res.status(400).send('error')
    })
})

// edit product data
app.post('/editproduct',(req,res)=>{
    Product.findOne({product_id:req.body.product_id}).then((d)=>{
        d.weight_min = req.body.weight_min
        d.weight_max = req.body.weight_max
        d.length_min = req.body.length_min
        d.length_max = req.body.length_max

        d.save().then((success)=>{
            console.log('Success')
        },(e)=>{
            res.status(400).send(e)
        },(err)=>{
            res.status(400).send(err)
        })
    })
})

// remove product data
app.post('/removeproduct',(req,res)=>{
    console.log('dataIn :', req.body.id)
    Product.remove({product_id:req.body.id}).then((d)=>{
        console.log('Product deleted success')
    },(err)=>{
        res.status(400).send(err)
    })
})


// ######################################### Schedule ###############################################
// get staff data
app.get('/send_staff', (req, res) => {
    // moment().format('MMMM Do YYYY, h:mm:ss a'); // December 14th 2018, 10:49:50 am
    // moment().format('dddd'); 
    // console.log(moment().format('dddd'))
    // console.log(moment().format('MMMM Do YYYY, h:mm:ss a'))
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

// save schedule 
app.post('/saveschedule',(req,res)=>{
    let newSchedule = Schedule({
        day: req.body.day,
        s_badgeNo:req.body.edit_id,
        s_name:req.body.edit_name,
        s_surname:req.body.edit_surname,
        s_position:req.body.edit_position,
        s_department:req.body.edit_dept,
        s_status:req.body.s_status
    })
    newSchedule.save().then((doc)=>{
        console.log('schedule success')
        res.send(doc)
    },(err)=>{
        res.status(400).send(err)
    })
})



// ####################################### Daily Schedule ####################################
// display daily schedule 
app.get('/dailyschedule',(req,res)=>{
    // moment().format('MMMM Do YYYY, h:mm:ss a'); // December 14th 2018, 10:49:50 am
    // moment().format('dddd'); 
    // console.log(moment().format('dddd'))
    Current.find({},(err, staffschedule)=>{
        if (err) console.log(err)
    }).then((staffschedule)=>{
        res.render('admin_dailySchedule.hbs',{
            staffschedule:encodeURI(JSON.stringify(staffschedule))
        })
    },(err)=>{
        res.status(400).send('error')
    })
})



//########################################  Port #################################################
app.listen(3000, () => {
    console.log(' ##### listening on port 3000 #####')
})