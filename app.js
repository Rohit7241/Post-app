const express=require('express');
const app=express();
const usermodel=require('./models/user')
const postmodel=require('./models/post')
const cookieParser=require('cookie-parser')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken');
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
   res.render('index')
});
app.get('/login',(req,res)=>{
    res.render('login')
 });
 app.get('/profile',isloggedin,(req,res)=>{
   let user=usermodel.findOne({email:req.user.email});
   res.render('profile',user)
 })
 app.post('/login',async (req,res)=>{
   let{password,email}=req.body
   let ruser= await usermodel.findOne({email:email});
   if(!ruser)return res.status(500).send('Something went Wrong!');
    bcrypt.compare(password,ruser.password,(err,result)=>{
        if(result){
         let token=jwt.sign({
            email:email,
            userid:ruser._id
        },"secretkey")
        res.cookie("token",token);
          res.status(200).redirect('/profile');
        }
         else res.status(500).send('Something went Wrong!')
    })
   })

app.post('/register',async (req,res)=>{
    let{email,password,username,name,age}=req.body
   let registereduser= await usermodel.findOne({email:email});
   if(registereduser)
    return res.status(500).send('User Already Registered');
   bcrypt.genSalt(10,(err,salt)=>{
   bcrypt.hash(password,salt,async(err,hash)=>{
    await usermodel.create({
        username,
        email,
        name,
        age,
        password:hash
    })
    let token=jwt.sign({
        email:email,
        userid:registereduser._id
    },"secretkey")
    res.cookie("token",token);
    res.send('registered');
})
   })
   })

app.get('/logout',(req,res)=>{
      res.cookie('token',"");
      res.redirect('/login')
   });
   
   function isloggedin(req,res,next){
         if(req.cookies.token=='')res.redirect('/login');
         else{
            let user=jwt.verify(req.cookies.token,"secretkey");
            req.user=user;
            next();
         }
        
   }

app.listen('3000');