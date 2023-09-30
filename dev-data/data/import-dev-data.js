
//Script to load and delete data at once

const fs = require('fs');

const mongoose = require('mongoose');

const dotenv = require('dotenv');

const Tour = require('./../../models/tourModel')

dotenv.config({path:'./config.env'});

mongoose.connect('mongodb+srv://SawanJkotian:evOZkEewFr3H7ih0@cluster0.jmoyobq.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true, userFindAndMode:false })
.then(con => {
    console.log('DB connection successfull!');
});

//Read Json file

const tours = fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8');
const toursData = JSON.parse(tours);

//Import data into DB

const importData = async () => {
    try{
        await Tour.create(toursData);
        console.log('Data successfully loaded!');
    }catch(err){
        console.log(err);
    }
    process.exit();
};

//Delete all the data from the collection
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log('Data deleted successfully loaded!');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2] == '--import'){
    importData();
}else if(process.argv[2] == '--delete'){
    deleteData();
}

console.log(process.argv);