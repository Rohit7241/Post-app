const express=require('express');
const app=express();
const usermodel=require('./models/user')
const postmodel=require('./models/post')
const cookieParser=require('cookie-parser')
const bcrypt=require('bcrypt')
const path=require('path')
const jwt=require('jsonwebtoken');
const upload=require('./utils/multer.js')

app.use(express.static(path.join(__dirname,'public')))
app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

 app.get('/',(req,res)=>{
   res.render('index')
});
app.get('/profile/upload',(req,res)=>{
   res.render('profileupload')
});

app.post('/upload',isloggedin,upload.single("image"),async (req,res)=>{
   console.log(req.file)
  let userl= await usermodel.findOneAndUpdate({email:req.user.email},{profilepic:req.file.filename})
  res.redirect('/profile')
})
 app.get('/login',(req,res)=>{
    res.render('login')
 });
 app.get('/profile',isloggedin,async(req,res)=>{
   let user=await usermodel.findOne({email:req.user.email}).populate("posts");
   res.render('profile',{user})
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
   app.get('/like/:id',isloggedin,async(req,res)=>{
      let post=await postmodel.findOne({_id:req.params.id}).populate("userid");
    if(post.likes.indexOf(req.user.userid)==-1){
      post.likes.push(req.user.userid);
    }
    else {
      post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }
       await post.save();
      res.redirect('/profile')
    })
    app.get('/edit/:id',isloggedin,async(req,res)=>{
      let post=await postmodel.findOne({_id:req.params.id}).populate("userid");
       res.render('edit',{post})
    })
    app.post('/update/:id',isloggedin,async(req,res)=>{
      let post=await postmodel.findOneAndUpdate({_id:req.params.id},{content:req.body.content});
       res.redirect('/profile')
    })
    app.get('/delete/:id',isloggedin,async(req,res)=>{
      let post=await postmodel.findOneAndDelete({_id:req.params.id});
       res.redirect('/profile')
    })
 app.post('/register',async (req,res)=>{
    let{email,password,username,name,age}=req.body
   let registereduser= await usermodel.findOne({email:email});
   if(registereduser)
    return res.status(500).send('User Already Registered');
   bcrypt.genSalt(10,(err,salt)=>{
   bcrypt.hash(password,salt,async(err,hash)=>{
    registereduser= await usermodel.create({
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
    res.render('profile',{user:registereduser});
})
   })
   })

 app.get('/logout',(req,res)=>{
      res.cookie('token',"");
      res.render('login')
   });
   
 app.post('/post',isloggedin,async (req,res)=>{
      let user=await  usermodel.findOne({email:req.user.email});
     let post=await postmodel.create({
         userid:user._id,
         content:req.body.content
      })
      user.posts.push(post._id);
      await user.save();
      res.redirect('/profile')
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