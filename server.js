const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer =require('multer');
const mongoose =require('mongoose');
app.use(bodyParser.urlencoded({extended:true}));
const cors = require("cors");
app.use(cors());
app.use('/images', express.static('images'));
app.use(bodyParser.json());

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
    date:String,
    createepoch:Number,
    is_approved: Boolean
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
app.get('/homepage',async(req,res)=>{
    //return approved products
    const products = await Product.find({'is_approved' : true})
    //sort in descending order depending on  
    products.sort(function(a, b) {
        return a.createepoch > b.createepoch
      });
    return res.json(products);
})

app.get('/adminhomepage',async(req,res)=>{
    //return unapproved products
    const products = await Product.find({'is_approved' : false})
    return res.json(products);
})

app.post('/approveProduct',async(req,res)=>{
    const { product_id } = req.body
    console.log(await req.body)
    await Product.updateOne( { '_id' : product_id },{ is_approved : true });
    return res.json({status : "success"});
})

app.get('/getProduct',async(req,res)=>{
    const { product_id } = req.query
    console.log(await req.query)
    const products =  await Product.find({'_id':product_id});
    return res.json(products);
})



app.post('/uploadmultiplefile',upload.array('myFiles',12),async(req,res,next) => {
    const file = req.files;
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
        createepoch: Date.now(),
        is_approved: false
    })

    await newProduct.save();

    
    const createSuccess = {
        status: "success",
        message:"Post created Succedfully"
    }
    res.send(JSON.stringify(createSuccess));

})


app.listen(5001,()=>{
    console.log("Server is running")
})