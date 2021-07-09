
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemSchema=
{
  name:String
};
const Item=mongoose.model("Item",itemSchema);

const Item1=new Item(
  {
    name:"Welcome to your todolist!"
  }
);
const Item2=new Item(
  {
    name:"Hit the + button to add a new item!"
  }
);
const Item3=new Item(
  {
    name:"Hit <-- to delete an item"
  }
);
const defaultItems=[Item1,Item2,Item3];

const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {


Item.find({},(err,foundItems)=>
{if(foundItems.length===0){
  Item.insertMany(defaultItems,(err)=>
  {
  if(err)
  console.log(err);
  else
  console.log("Successfully added deault item to DB");
  });
  res.redirect("/");
}
else
{
  res.render("list", {listTitle: "Today", newListItems:foundItems});
}
 
});
  
});
app.get("/:customListName",(req,res)=>
{
  const customListName =_.capitalize(req.params.customListName);
  List.findOne({name:customListName},(err,foundlist)=>
  {if(!err){
    if(!foundlist){const list=new List({
      name:customListName,
      items:defaultItems
    });
    list.save();
    res.redirect("/"+customListName);
  }
    else
    {
      res.render("list",{listTitle:foundlist.name,newListItems:foundlist.items});
    }
  }
  });
  

});

app.post("/", (req, res)=>{

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
name:itemName
  });
  if(listName==="Today")
 { 
  item.save();
res.redirect("/");
 }
 else
 {
   List.findOne({name:listName},(err,foundList)=>
   {
     foundList.items.push(item);
     foundList.save();
     res.redirect("/"+listName);
   });
 }
 
});

app.post("/delete",(req,res)=>{
const checkedItemID=req.body.checkbox;
const ListName=req.body.listName;
if(ListName==="Today")
{
  Item.findByIdAndRemove(checkedItemID,(err)=>
  {
    
     if(!err)
    console.log("Successfully deleted element");
    res.redirect("/");
  }
  );
}
else
{
  List.findOneAndUpdate({name:ListName},{$pull:{items:{_id:checkedItemID}}},(err,foundList)=>
  {
    if(!err)
    {
      res.redirect("/"+ListName);
    }
  });
}


});

let port=process.env.PORT;
if(port==null||port=="")
{
  port=3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
