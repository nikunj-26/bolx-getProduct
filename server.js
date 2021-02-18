const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer =require('multer');
const mongoose =require('mongoose');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb://localhost:27017/olxDB',{useNewUrlParser:true,useUnifiedTopology:true});

const productSchema = new mongoose.Schema({
    sellerName:String,
    productName:String,
    description:String,
    price:String,
    email:String,
    city:String,
    image:Array,
    city:String,
    state:String,
    contact:String,
    date:String
})

const Product = mongoose.model("Product",productSchema); 

var storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./images');
    },
    filename:function(req,file,cb){
        cb(null,file.originalname)
    }
})

var upload = multer({
    storage:storage
})

app.get('/',(req,res)=>{
    res.sendFile(__dirname+ '/index.html')
})

app.post('/uploadmultiplefile',upload.array('myFiles',12),async(req,res,next) => {
    const file = req.files;
    const fileName = file.originalname;
    const name= req.body.name;
    //const email= req.body.email;
    //const featured = req.body.featured;
    const description = req.body.Description;
    const price = req.body.Price;
    const city = req.body.City;
    const state = req.body.State;
    const contact = req.body.Contact;
    const image = [];
    
    if(!file){
        const error = new Error("Please upload files");
        error.httpStatusCode = 400;
        return next(error);
    }

    var fs = require('fs')
    var id = req.params.id;

    for(var i =0;i<req.files.length;i++)
    {
        fs.rename('./images/'+file[i].originalname,'./images/'+(name+" "+i+'.png'),function(err){
                if(err)throw err;
                })
        image.push(name+" "+i+".png");  
    }  
    const newProduct = new Product({
        name:name,
        description:description,
        price:price,
        city:city,
        image:image,
        state:state,
        contact:contact,
        date: new Date().toLocaleString().split(",")[0],
    })

    await newProduct.save();

    
    const createSuccess = {
        status: "Success",
        message:"Post created Succedfully"
    }
    res.send(JSON.stringify(createSuccess));

})

app.listen(5000,()=>{
    console.log("Server is running")
})