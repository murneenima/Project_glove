const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const hbs = require('hbs')


// ============== require Model ===============
var Admin = require('./AdminModel')
var Staff = require('./StaffModel')
var Block = require('./BlockModel')

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
    let newAdmin = Admin({
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

      
    Staff.findOne({badgeNo: req.body.badgeNo}).then((d) => {
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
    console.log('dataIn :' ,req.body.id)
    Staff.remove({badgeNo: req.body.id}).then((d) => {
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
app.get('/sent_data', (req, res) => {
    Staff.find({}, (err, dataType) => {
        if (err) console.log(err);
    }).then((dataType) => {
        res.render('admin_manageStaffData.hbs', {
            dataType: encodeURI(JSON.stringify(dataType))
        })
    }, (err) => {
        res.status(400).send('error');
    })
})

//####################################### Product ##############################################
app.post('/addblock',(req,res)=>{
    let newBlock = Block({
        blockName : req.body.blockName,
        productLine : req.body.productLine
    })

    newBlock.save().then((doc)=>{
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })
})

//######################################3  Port #################################################
app.listen(3000, () => {
    console.log(' ##### listening on port 3000 #####')
})