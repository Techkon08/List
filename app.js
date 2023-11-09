
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin123:admin%40123@cluster0.ncks5pg.mongodb.net/todolistDB");  //pswd - admin@123 but urlencoding we use %40 

const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Book"
});

const item2 = new Item({
  name:"Music"
});

const item3 = new Item({
  name:"Mac"
});

const defaultItems = [item1,item2,item3]

const listSchema = {
  name :String,
  items:[itemsSchema]

};

const List = mongoose.model("List",listSchema);



app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({}).then(function(foundItem){
    console.log(foundItem);
    if(foundItem.length === 0){
      Item.insertMany(defaultItems).then(function(){console.log("Success");}).catch(function(err){console.log(err);});
      res.redirect("/");

    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }
    
  }).catch(function(err){console.log(err);})
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

const item = new Item({
  name:itemName
});

if(listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName}).then(function(foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });

}

});


app.post("/delete",function(req,res){
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName ==="Today"){
    Item.findByIdAndRemove(checkItemId).then(function(){console.log("Id has been removed");}).catch(function(err){console.log(err);})
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkItemId}}}).then(function(foundList){
      res.redirect("/" + listName);
    }).catch(function(err){console.log(err);})
  }
  
 
})


// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}).then(function(foundList){
      if(!foundList){
        //create a new list 
        const list = new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});}
    }).catch(function(err){console.log(err);});


})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == "")
{
  port = 3000;
}
app.listen( port, function() {
  console.log("Server started on port 3000");
});
