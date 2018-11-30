const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const hbs = require('hbs')


var Schema = mongoose.Schema
// ======================= Admin Schema ===========
var AdminSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        minlength:8,
        required:true
    }
})

var Admin = mongoose.model('Admin',AdminSchema)
// ============== require Model ===============


// =============== Connect =========================
mongoose.connect('mongodb://localhost:27017/gloveDB').then((doc) => {
    console.log('@@@@ Success to connect with Database @@@')
}, (err) => {
    console.log('!!!!!!!!!! error to connect with database !!!!!!!!!')
})


var app = express()
app.use(bodyParser.json()) // ส่งข้อมูลแบบ JSon
app.use(bodyParser.urlencoded({
    extended:true
}));

//app.set('view engine', 'hbs');
//app.use(express.static('public'))


//============= API test============//
app.get('/',(req,res)=>{
    res.send('hello')
})


// ============ Sign Up ==============//
app.post('/signup',(req,res)=>{
    let newAdmin = Admin({
        username : req.body.username,
        password : req.body.password
    })

    newAdmin.save().then((doc)=>{
        res.send(doc)
    },(err) => {
        res.status(400).send(err)
    })
})


// ================= Admin Login ================
app.post('/signin',(req,res)=>{
    let username = req.body.username1
    let password = req.body.password1

    Admin.find({
        username:username,
        password:password
    }).then((admin)=>{
        if(admin.length==1){
            res.send(admin)
        }else{
            res.status(400).send('Cannot Login')
        }
    },(err)=>{
        res.status(400).send(err)

    })
})

// =================== Port =======================
app.listen(3000,()=>{
    console.log(' ##### listening on port 3000 #####')
})