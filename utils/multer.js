const multer=require('multer');
const crypto=require('crypto')
const path=require('path')
//creating disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12,(err,name)=>
        {
            const fn=name.toString('hex')+path.extname(file.originalname)//name comes as a buffer so convert this to string first
            cb(null,fn)
            
            })
            
      
    }
  })
  
//creating upload variable and exporting it
const upload = multer({ storage: storage })
module.exports= upload