const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require("mongoose");
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors());
app.use("/images", express.static("images"));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/olxDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({
  sellerName: String,
  title: String,
  description: String,
  price: String,
  sellerEmail: String,
  city: String,
  image: Array,
  city: String,
  state: String,
  phone: String,
  date: String,
  comment:Array,
  createepoch: Number,
  is_approved: Boolean,
});

const Product = mongoose.model("Product", productSchema);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./images");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({
  storage: storage,
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.get("/homepage", async (req, res) => {
  //return approved products
  const products = await Product.find({ is_approved: true });
  //sort in descending order depending on
  products.sort(function (a, b) {
    return a.createepoch > b.createepoch;
  });
  return res.json(products);
});

app.get("/adminhomepage", async (req, res) => {
  //return unapproved products
  const products = await Product.find({ is_approved: false });
  return res.json(products);
});

app.post("/approveProduct", async (req, res) => {
  const { product_id } = req.body;
  console.log(await req.body);
  await Product.updateOne({ _id: product_id }, { is_approved: true });
  return res.json({ status: "success" });
});

app.post("/getProduct", async (req, res) => {
  const products =  await Product.findOne({_id: req.body.productID});
  //console.log("products:"+products)
  return res.json(products);
});

app.post('/addComment',async(req,res)=>{
  const cdata = {
      commentBy: req.body.commentBy,
      commentBody: req.body.commentBody,
  };
  console.log(cdata);

  Product.findOneAndUpdate(
      { _id: req.body.id },
      { $push: { comment: cdata } },
      function(err) {
          if (!err) {
              const createSuccess = {
                  status: "Success",
                  message:"Post created Successfully"
              }
              res.send(JSON.stringify(createSuccess));
          } else {
              const createFailure = {
                  status: "error",
                  message:"Some error occured"
              }
              res.send(JSON.stringify(createFailure));
          }
      }
  )
})

app.post("/getUserPosts", async (req, res) => {
  const { sellerEmail } = req.body;
  console.log(await req.body);
  const products = await Product.find({ sellerEmail: sellerEmail });
  return res.json(products);
});

app.post("/searchProduct", async (req, res) => {
  const { product_title } = req.body;
  console.log(await req.body);
  const products = await Product.find({
    title: new RegExp(product_title, "i"),
  });
  return res.json(products);
});

app.post(
  "/uploadmultiplefile",
  upload.array("attachments", 12),
  async (req, res, next) => {
    console.log(req.body);
    // const reqFiles = [];
    // const url = req.protocol + "://" + req.get("host");
    // for (var i = 0; i < req.files.length; i++) {
    //   reqFiles.push(url + "/public/" + req.files[i].filename);
    // }

    // console.log(reqFiles);

    const file = req.files;
    // const fileName = file.originalname;
    const sellerName = req.body.sellerName;
    const title = req.body.title;
    const sellerEmail = req.body.sellerEmail;
    //const featured = req.body.featured;
    const description = req.body.description;
    const price = req.body.price;
    const city = req.body.city;
    const state = req.body.state;
    const phone = req.body.phone;
    const image = [];

    if (!file) {
      const error = new Error("Please upload files");
      error.httpStatusCode = 400;
      return next(error);
    }

    var fs = require("fs");
    var id = req.params.id;

    for (var i = 0; i < req.files.length; i++) {
      fs.rename(
        "./images/" + file[i].originalname,
        "./images/" + (title + " " + i + ".jpg"),
        function (err) {
          if (err) throw err;
        }
      );
      image.push(title + " " + i + ".jpg");
    }

    ////////////////DONT see
    const newProduct = new Product({
      sellerName: sellerName,
      sellerEmail: sellerEmail,
      title: title,
      description: description,
      price: price,
      city: city,
      image: image,
      state: state,
      phone: phone,
      date: new Date().toLocaleString().split(",")[0],
      createepoch: Date.now(),
      is_approved: false,
    });

    await newProduct.save();

    const createSuccess = {
      status: "Success",
      message: "Post created Successfully",
    };
    res.send(JSON.stringify(createSuccess));
  }
);

app.listen(5002, () => {
  console.log("Server is running");
});
