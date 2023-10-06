const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const app = require('./app');


// const DB = process.env.DATABSE.replace(
//     '<PASSWORD>',
//     process.env.DATABSE_PASSWORD
// );

mongoose.connect('mongodb+srv://SawanJkotian:evOZkEewFr3H7ih0@cluster0.jmoyobq.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true, useNewUrlParser: true, userFindAndMode:false })
.then(con => {
    console.log('DB connection successfull!');
});

// mongoose.connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false
// }).then(con => {
//     console.log(con.connection);
//     console.log('DB connection successfull!');
// })

const port = process.env.port||3000;

app.listen(port, ()=>{
    console.log(`App running on port ${port}.....`);
});

//Test