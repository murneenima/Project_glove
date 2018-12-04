const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const hbs = require('hbs')


var Schema = mongoose.Schema
// ======================= Admin Schema ===========
var AdminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true
    }
})

var Admin = mongoose.model('Admin', AdminSchema)
// ============== require Model ===============
var Staff = require('./StaffModel')

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

//app.set('view engine', 'hbs');
//app.use(express.static('public'))


//============= API test============//
app.get('/', (req, res) => {
    res.send('hello')
})


// ============ Sign Up ==============//
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


// ================= Admin Login ================
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

// ================== insert staff ============
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
        res.send(doc)
    }, (err) => {
        res.status(400).send(err)
    })

})


// ================== Sent Staff ==================
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

// ==================== Delete Staff ==================
app.get('/deleteStaff', (req, res) => {
    Staff.findByIdAndRemove(req.params.badgeNo, req.body, function (err, data) {
        if (!err) {
            console.log("Deleted");
        }else{
            console.log("error");
        }
    });
})

// =================== Port =======================
app.listen(3000, () => {
    console.log(' ##### listening on port 3000 #####')
})