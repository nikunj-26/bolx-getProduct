const express = require('express');
const bodyParser= require('body-parser');
const multer =require('multer');
Task = require("./model/schema");
const mongoose  =  require("mongoose"),
olxDB = mongoose.model("productSchema");
const app = express()


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
//mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/olxDB', {​​  useNewUrlParser: true,  useUnifiedTopology: true}​​);
const db = mongoose.connection;


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
    for(var i =0;i<file.size;i++){

        fs.rename('./images/'+file[i].originalname,'./images/'+(name+"-"+'.png'),function(err){
            if(err)throw err;res.send("Renamed")
            })
        image.push(name+" "+i+".png");  
}

    let product = new olxDB({​​
        name: name,
        price: price,
        image: image,
        description: description,
        active: active,
        featured: featured,
        country: country,
        city: city,
        state:state,
        contact: contact,
        date: new Date().toLocaleString().split(",")[0],
    }​​);
    await product.save();

    const createSuccess = {​
        status: "Success",
        message: "Post created Successfully",
    }​​
    res.send(JSON.stringify(createSuccess));
    console.log(product)

//    console.log(req.body);
    
})

app.listen(5000,()=>{
    console.log("Server is running")
})