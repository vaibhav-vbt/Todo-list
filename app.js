//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { name } = require("ejs");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://vaibhav:Stake123@cluster0.nluv062.mongodb.net/todolistDB");

const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"eat"
});
const item2 = new Item({
  name:"sleep"
});
const item3 = new Item({
  name:"repeat"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}).then(function(FoundItems){
  if(defaultItems.length === 0){
    Item.insertMany(defaultItems).then(function () {
  console.log("Successfully saved defult items to DB");
}).catch(function (err) {
  console.log(err);
});
res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems:FoundItems});
  }
});

});

app.post("/delete", function(req,res){

  const listName = req.body.listName;
  const checkedItemId = req.body.checkbox;

  if(listName === "Today" ){
    Item.findByIdAndDelete(checkedItemId).then(function(){
      console.log("Sucessfully deleted");
      res.redirect("/");
    })
  }else{
    List.findOneAndUpdate({name:listName}, {$pull: {items : {_id:checkedItemId}}}).then(function(){
      res.redirect("/"+listName);
    });
  }
  
    
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
 
});

app.get("/:customListNames", function(req,res){
   const customListNames = _.capitalize(req.params.customListNames);
   
   
   List.findOne({name:customListNames}).then(function(foundList){
    if(!foundList){
      const list = new List({
        name:customListNames,
        items: defaultItems
       });
       list.save();
       res.redirect("/" + customListNames);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
    }
   });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
